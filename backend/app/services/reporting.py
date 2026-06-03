"""
Reporting Service — Restored to match Original Reference Design
----------------------------------------------------------------
- Callouts: 10pt Helvetica, yellow fill, red border, arrow pointing at object
- Title box: auto-sized, yellow fill, red border, insert_textbox with proper lines
- Keeps font_size parameter so Coax (24pt box), Fiber Overview (14pt box),
  Fiber After (34pt box) all remain in title box only; callout text is always 10pt.
"""
from __future__ import annotations
import logging, math, fitz, numpy as np, re, cv2
from pathlib import Path
from app.services.alignment import pdf_to_image

def _patch_annot_color(doc: fitz.Document, annot: fitz.Annot, font_size: int = 9) -> None:
    """Patches annotation appearance stream for consistent red/yellow styling."""
    try:
        ap_type, ap_val = doc.xref_get_key(annot.xref, "AP")
        m = re.search(r"/N\s+(\d+)\s+\d+\s+R", ap_val)
        if m:
            n_xref = int(m.group(1))
            raw = doc.xref_stream(n_xref)
            doc.update_stream(n_xref, raw.replace(b"0 0 0 RG", b"1 0 0 RG"))

        doc.xref_set_key(annot.xref, "C",  "[1 1 0]")
        doc.xref_set_key(annot.xref, "IC", "[1 1 0]")
        doc.xref_set_key(annot.xref, "DA", f"(1 0 0 RG 0 0 0 rg /Helv {font_size} Tf)")
        doc.xref_set_key(
            annot.xref, "DS",
            f"(font: Helv {font_size}pt; color: #000000; background-color: #FFFF00; border: 1.5pt solid #FF0000;)"
        )
    except Exception:
        pass

logger = logging.getLogger(__name__)

LEGEND_DATA: dict[str, str] = {
    "A": "SWAP ACTIVE",
    "B": "SWAP LE WITH AMP",
    "C": "MOVE ACTIVE",
    "D": "TAP FPC",
    "E": "TAP NEW",
    "F": "SPLITTER FPC",
    "G": "SPLITTER NEW",
    "H": "ADD ACTIVE",
    "I": "EQ NEW",
    "J": "EQ REMOVE",
    "K": "EQ FPC",
}

# ─────────────────────────────────────────────────────────────────────────────
# Public: Main vector report generator (Coax + Fiber After)
# ─────────────────────────────────────────────────────────────────────────────

def generate_vector_report(
    after_pdf_path: str | Path,
    callout_records: list[dict],
    tile_offsets: dict,          # kept for API compat; not used (gx/gy preferred)
    W_inv: np.ndarray,           # kept for API compat
    output_path: str | Path,
    dpi: int = 300,
    survey_image_path: str | Path | None = None,
    title_box_data: dict | None = None,
    title_font_size: int = 24,   # 24 Coax | 14 Fiber Overview | 34 Fiber After
    include_legend: bool = True,
) -> Path:
    after_pdf_path = Path(after_pdf_path)
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # ── Override font size based on map type ──────────────────────────────────
    if title_box_data:
        m_type = title_box_data.get("map_type", "").upper()
        if "OVERVIEW" in m_type:
            title_font_size = 14
        elif "FIBER" in m_type or "SCHEMATIC" in m_type:
            title_font_size = 34
        elif "COAX" in m_type:
            title_font_size = 24

    logger.info(f"Loading after PDF image at {dpi} DPI for empty-space detection...")
    img_after = pdf_to_image(after_pdf_path, dpi=dpi)
    img_gray = cv2.cvtColor(img_after, cv2.COLOR_BGR2GRAY)
    h_img, w_img = img_gray.shape

    doc = fitz.open(str(after_pdf_path))
    page = doc[0]
    placed_rects: list[fitz.Rect] = []

    # ── Reserve title-box area so callouts avoid it ───────────────────────────
    page_rect = page.rect
    title_reserve = fitz.Rect(page_rect.width - 720, 0, page_rect.width, 350)
    placed_rects.append(title_reserve)

    # ── Render callout annotations ────────────────────────────────────────────
    if callout_records:
        CALLOUT_FONT_SIZE = title_font_size
        DEDUP_RADIUS_PTS  = 50.0        # Merge identical labels within 50pt
        # Arrow offset: coax (high DPI >= 300) works best with 30, fiber (low DPI <= 90) needs 60+
        if dpi < 100:
            ARROW_OFFSET_PTS = 65.0
        elif dpi < 200:
            ARROW_OFFSET_PTS = 45.0
        else:
            ARROW_OFFSET_PTS = 30.0
        SEARCH_RADIUS_MAX = 600         # Max spiral search for free space

        unique: list[dict] = []
        for rec in callout_records:
            # Prefer global coords (gx/gy) — fallback to lx/ly (tile-relative)
            if "gx" in rec and "gy" in rec:
                img_x, img_y = float(rec["gx"]), float(rec["gy"])
            else:
                # Legacy tile-relative → global via W_inv transform
                tile_idx = rec.get("tile_idx", 0)
                ox, oy = tile_offsets.get(tile_idx, (0, 0))
                gx, gy = ox + float(rec.get("lx", 0)), oy + float(rec.get("ly", 0))
                pt = W_inv @ np.array([gx, gy, 1.0])
                img_x, img_y = pt[0] / pt[2], pt[1] / pt[2]

            pdf_x = img_x * (72.0 / dpi)
            pdf_y = img_y * (72.0 / dpi)
            text  = rec.get("text", "")

            # Dedup
            if not any(
                c["text"] == text and
                math.hypot(pdf_x - c["pdf_x"], pdf_y - c["pdf_y"]) < DEDUP_RADIUS_PTS
                for c in unique
            ):
                unique.append({
                    "pdf_x": pdf_x, 
                    "pdf_y": pdf_y, 
                    "text": text, 
                    "is_design_note": rec.get("is_design_note", False)
                })

        def _is_empty(cx_img: float, cy_img: float, bw: float, bh: float) -> bool:
            x1, y1 = int(cx_img - bw / 2), int(cy_img - bh / 2)
            x2, y2 = int(cx_img + bw / 2), int(cy_img + bh / 2)
            if x1 < 0 or y1 < 0 or x2 > w_img or y2 > h_img:
                return False
            roi = img_gray[y1:y2, x1:x2]
            return roi.size > 0 and (np.sum(roi < 240) / roi.size) < 0.05

        for c in unique:
            cx_pdf, cy_pdf = c["pdf_x"], c["pdf_y"]
            text = c["text"]
            
            # The reference logic explicitly required img_x and img_y
            cx_img, cy_img = cx_pdf * (dpi / 72.0), cy_pdf * (dpi / 72.0)

            # ── Exclusion zone: reserve 40pt radius around the symbol ─────────
            SYMBOL_GUARD_PTS = 40.0
            symbol_guard = fitz.Rect(
                cx_pdf - SYMBOL_GUARD_PTS, cy_pdf - SYMBOL_GUARD_PTS,
                cx_pdf + SYMBOL_GUARD_PTS, cy_pdf + SYMBOL_GUARD_PTS,
            )
            placed_rects.append(symbol_guard)

            # ── Size callout box to its text ──────────────────────────────────
            lines      = text.split("\n")
            max_line_w = max((fitz.get_text_length(line, fontname="helv", fontsize=CALLOUT_FONT_SIZE) for line in lines), default=10.0)
            box_w      = max_line_w + 16.0  # 8pt padding on each side for safety
            box_h      = len(lines) * (CALLOUT_FONT_SIZE * 1.2) + 12.0  # 1.2 line height + 6pt top/bottom padding
            bw_img = box_w * (dpi / 72.0)
            bh_img = box_h * (dpi / 72.0)

            ex_img, ey_img = cx_img + 250, cy_img - 250
            found = False

            for r_img in np.arange(120 * (dpi / 72.0), 600 * (dpi / 72.0), 40 * (dpi / 72.0)):
                for ang in np.linspace(0, 2 * math.pi, 24, endpoint=False):
                    px = cx_img + r_img * math.cos(ang)
                    py = cy_img + r_img * math.sin(ang)
                    if _is_empty(px, py, bw_img, bh_img):
                        test_rect = fitz.Rect(
                            px * (72 / dpi) - box_w / 2 - 5, py * (72 / dpi) - box_h / 2 - 5,
                            px * (72 / dpi) + box_w / 2 + 5, py * (72 / dpi) + box_h / 2 + 5,
                        )
                        if not any(test_rect.intersects(pr) for pr in placed_rects):
                            ex_img, ey_img = px, py
                            found = True
                            break
                if found:
                    break

            ex_pdf, ey_pdf = ex_img * (72 / dpi), ey_img * (72 / dpi)

            text_rect = fitz.Rect(
                ex_pdf - box_w / 2, ey_pdf - box_h / 2,
                ex_pdf + box_w / 2, ey_pdf + box_h / 2
            )
            placed_rects.append(text_rect)

            is_design_note = c.get("is_design_note", False)
            if is_design_note:
                try:
                    annot = page.add_freetext_annot(
                        text_rect, c["text"], fontsize=CALLOUT_FONT_SIZE, fontname="helv",
                        text_color=(0, 0, 0), fill_color=(1, 1, 0),
                        align=1,
                    )
                    try:
                        annot.set_border(width=1.5)
                    except Exception:
                        pass
                    annot.update()
                    _patch_annot_color(doc, annot, font_size=CALLOUT_FONT_SIZE)
                except Exception as err:
                    logger.warning(f"Could not place design note: {err}")
                continue

            # ── Arrow geometry ────────────────────────────────────────────────
            angle = math.atan2(cy_pdf - ey_pdf, cx_pdf - ex_pdf)
            offset_pts = ARROW_OFFSET_PTS
            tip_x = cx_pdf - offset_pts * math.cos(angle)
            tip_y = cy_pdf - offset_pts * math.sin(angle)
            knee_x = (ex_pdf + cx_pdf) / 2.0
            knee_y = (ey_pdf + cy_pdf) / 2.0
            attach_x = ex_pdf + (box_w / 2.0) * math.cos(angle)
            attach_y = ey_pdf + (box_h / 2.0) * math.sin(angle)

            # ── Draw annotation ───────────────────────────────────────────────
            try:
                try:
                    annot = page.add_freetext_annot(
                        text_rect, c["text"], fontsize=CALLOUT_FONT_SIZE, fontname="helv",
                        text_color=(0, 0, 0), fill_color=(1, 1, 0),
                        callout=[fitz.Point(tip_x, tip_y), fitz.Point(knee_x, knee_y), fitz.Point(attach_x, attach_y)],
                        align=1,
                    )
                except TypeError:
                    annot = page.add_freetext_annot(
                        text_rect, c["text"], fontsize=CALLOUT_FONT_SIZE, fontname="helv",
                        text_color=(0, 0, 0), fill_color=(1, 1, 0),
                        callout=[fitz.Point(tip_x, tip_y), fitz.Point(attach_x, attach_y)],
                    )

                try:
                    annot.set_border(width=1.5)
                except Exception:
                    pass
                annot.update()
                _patch_annot_color(doc, annot, font_size=CALLOUT_FONT_SIZE)
            except Exception as err:
                logger.warning(f"Could not place callout '{text}': {err}")

    # ── Stamp survey image + title box ────────────────────────────────────────
    total_pages = doc.page_count
    for i in range(total_pages):
        _draw_legend_stack(
            doc[i], survey_image_path if i == 0 else None, title_box_data,
            title_font_size=title_font_size,
            page_num=i + 1,
            total_pages=total_pages,
            include_legend=include_legend and (i == 0),
            callouts=callout_records
        )

    doc.save(str(output_path), deflate=True, garbage=4, clean=True)
    doc.close()
    logger.info(f"Report saved → {output_path}")
    return output_path


# ─────────────────────────────────────────────────────────────────────────────
# Public: Fiber Overview shortcut (no callout records, just stamp)
# ─────────────────────────────────────────────────────────────────────────────

def generate_final_report(
    pdf_path,
    callouts,           # may be a non-empty list from fiber overview
    output_path,
    dpi: int = 300,
    survey_image_path=None,
    title_box_data=None,
    title_font_size: int = 14,
):
    """
    Used by fiber overview pipeline.
    Passes callouts through to generate_vector_report so node/splice annotations
    are rendered on the map.
    """
    return generate_vector_report(
        after_pdf_path=pdf_path,
        callout_records=callouts if callouts else [],
        tile_offsets={},
        W_inv=np.eye(3),
        output_path=output_path,
        dpi=dpi,
        survey_image_path=survey_image_path,
        title_box_data=title_box_data,
        title_font_size=title_font_size,
        include_legend=False,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Private: Survey image + title box stamper
# ─────────────────────────────────────────────────────────────────────────────

def _draw_legend_stack(
    page: fitz.Page,
    survey_image_path,
    title_box_data: dict | None,
    title_font_size: int = 24,
    margin_pts: float = 15.0,
    include_legend: bool = False,  # Added for compatibility with fiber_before call
    page_num: int = 1,
    total_pages: int = 1,
    **kwargs,                      # Catch extra args like img_gray, callouts, dpi
):
    """
    Stamps the survey screenshot and Prism info title box in the top-right corner.
    For FIBER SCHEMATIC, places it in the bottom-right corner.

    Title box lines (matching reference design):
        PID: <prism_id>
        NODE: <node_name>
        INSTANCE: <instance>
        <map_type>
        PG 1 OF N
    """
    page_r = page.rect
    BOX_RIGHT_MARGIN = margin_pts          # from right edge

    # ── Extract title fields ───────────────────────────────────────────────────
    pid      = ""
    node     = ""
    inst     = ""
    map_type = ""
    pg_count = 1
    if title_box_data:
        pid      = title_box_data.get("prism_id", "")
        node     = title_box_data.get("node_name", "")
        inst     = title_box_data.get("instance", "")
        map_type = title_box_data.get("map_type", "")
        pg_count = title_box_data.get("page_count", 1)

    print_name = ""
    if map_type:
        m = map_type.upper()
        if "AFTER" in m:
            print_name = "AFTER"
        elif "BEFORE" in m:
            print_name = "BEFORE"
        elif "SCHEMATIC" in m:
            print_name = "SCHEMATIC REPORT"
        elif "OVERVIEW" in m:
            print_name = "OVERVIEW PRINT"
        else:
            print_name = m

    raw_lines = [
        pid if pid else "",
        node if node else "",
        inst if inst else "",
        print_name,
        f"PG {page_num} OF {total_pages}",
    ]
    lines = [l for l in raw_lines if l]

    # ── Measure text dimensions to scale image properly ────────────────────────
    font_size   = title_font_size
    line_h      = font_size * 1.5
    
    # Exclusively shrink the box padding for Fiber Overview maps
    if "OVERVIEW" in map_type.upper():
        pad_w, pad_h = font_size * 0.8, font_size * 0.8
    else:
        pad_w, pad_h = font_size * 2.0, font_size * 2.0
    max_line_w  = 0
    if lines:
        max_line_w = max(fitz.get_text_length(l, fontname="helv", fontsize=font_size) for l in lines)

    box_w = max_line_w + pad_w
    box_h = line_h * len(lines) + pad_h if title_box_data else 0

    # ── Survey screenshot ──────────────────────────────────────────────────────
    ss_w = 0.0
    ss_h = 0.0
    if survey_image_path:
        # Make the screenshot width at least 800, or larger than the text box by 50%
        if "SCHEMATIC" in map_type.upper():
            target_ss_w = max(1200.0, box_w * 2.0)
        elif "OVERVIEW" in map_type.upper():
            target_ss_w = max(250.0, box_w * 0.8)
        else:
            target_ss_w = max(800.0, box_w * 1.5)
        try:
            tmp = fitz.open(str(survey_image_path))
            ir = tmp[0].rect
            tmp.close()
            ss_w   = target_ss_w
            ss_h   = (ir.height / ir.width) * ss_w
        except Exception:
            ss_w = target_ss_w
            ss_h = target_ss_w * 0.66

    # ── Legend Size ────────────────────────────────────────────────────────────
    if "COAX" in map_type.upper() and ss_w > 0:
        leg_scale = (ss_w / 7.5) / 260.0
    else:
        leg_scale = title_font_size / 14.0
        
    leg_line_h = 18 * leg_scale
    leg_col_w = [35 * leg_scale, 120 * leg_scale, 35 * leg_scale]
    leg_w = sum(leg_col_w)
    leg_h = leg_line_h * (len(LEGEND_DATA) + 1) if include_legend else 0
            
    # ── Determine starting Y position ──────────────────────────────────────────
    if "SCHEMATIC" in map_type.upper():
        total_h = (box_h + 8.0 if box_h > 0 else 0) + leg_h
        curr_y = page_r.y1 - margin_pts - total_h
    else:
        curr_y = page_r.y0 + margin_pts

    if survey_image_path and ss_h > 0:
        if "SCHEMATIC" in map_type.upper():
            ss_rect = fitz.Rect(
                page_r.x0 + margin_pts, page_r.y1 - margin_pts - ss_h,
                page_r.x0 + margin_pts + ss_w, page_r.y1 - margin_pts,
            )
            page.insert_image(ss_rect, filename=str(survey_image_path))
        else:
            is_overview = "OVERVIEW" in map_type.upper()
            top_m = page_r.y0 + 5.0 if is_overview else curr_y
            right_m = 5.0 if is_overview else BOX_RIGHT_MARGIN
            ss_rect = fitz.Rect(
                page_r.width - ss_w - right_m, top_m,
                page_r.width - right_m,        top_m + ss_h,
            )
            page.insert_image(ss_rect, filename=str(survey_image_path))
            curr_y = top_m + ss_h + 8.0

    if title_box_data:
        # ── Draw yellow box with red border ───────────────────────────────────────
        if "SCHEMATIC" in map_type.upper():
            box_x0 = page_r.x0 + margin_pts + ss_w + 15.0
        else:
            box_x0 = page_r.width - box_w - BOX_RIGHT_MARGIN
        box_rect = fitz.Rect(box_x0, curr_y, box_x0 + box_w, curr_y + box_h)
        page.draw_rect(box_rect, color=(1, 0, 0), fill=(1, 1, 0), width=1.5)

        # ── Insert text lines ──────────────────────────────────────────────────────
        text_y = curr_y + pad_h / 2 + font_size
        for line in lines:
            page.insert_text(
                fitz.Point(box_x0 + pad_w / 2, text_y),
                line,
                fontsize=font_size,
                fontname="helv",
                color=(0, 0, 0),
            )
            text_y += line_h
        curr_y += box_h + 8.0

    if include_legend:
        # ── Draw Legend Table ──────────────────────────────────────────────────────
        if "SCHEMATIC" in map_type.upper():
            leg_x0 = page_r.x0 + margin_pts + ss_w + 15.0
        else:
            leg_x0 = page_r.width - leg_w - BOX_RIGHT_MARGIN
        bg = fitz.Rect(leg_x0, curr_y, leg_x0 + leg_w, curr_y + leg_h)
        page.draw_rect(bg, color=(0, 0, 0), fill=(1, 1, 1), width=1.5)

        counts = {k: 0 for k in LEGEND_DATA}
        callouts = kwargs.get("callouts", [])
        for c in callouts:
            t = c.get("text", "")
            if t:
                first = t[0].upper()
                if first in counts:
                    counts[first] += 1

        ry = curr_y
        hdr_font = max(8, int(11 * leg_scale))
        val_font = max(8, int(10 * leg_scale))
        
        for i, hdr in enumerate(["Code", "Action", "Count"]):
            xc = leg_x0 + sum(leg_col_w[:i])
            cr = fitz.Rect(xc, ry, xc + leg_col_w[i], ry + leg_line_h)
            page.draw_rect(cr, color=(0, 0, 0), fill=(0.8, 0.9, 1.0), width=1.0)
            tw_pts = fitz.get_text_length(hdr, fontname="hebo", fontsize=hdr_font)
            page.insert_text((xc + (leg_col_w[i] - tw_pts) / 2, ry + (leg_line_h + hdr_font * 0.8) / 2), hdr, fontsize=hdr_font, fontname="hebo")
        ry += leg_line_h

        for idx, code in enumerate(sorted(LEGEND_DATA)):
            for i, val in enumerate([code, LEGEND_DATA[code], str(counts[code])]):
                xc = leg_x0 + sum(leg_col_w[:i])
                cr = fitz.Rect(xc, ry, xc + leg_col_w[i], ry + leg_line_h)
                page.draw_rect(cr, color=(0, 0, 0), width=1.0)
                tw_pts = fitz.get_text_length(val, fontname="helv", fontsize=val_font)
                page.insert_text((xc + (leg_col_w[i] - tw_pts) / 2, ry + (leg_line_h + val_font * 0.8) / 2), val, fontsize=val_font, fontname="helv")
            ry += leg_line_h