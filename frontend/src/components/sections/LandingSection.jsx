import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { 
  Activity, 
  MousePointer2, 
  Upload, 
  Settings2, 
  Play, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  Download,
  ArrowDown
} from 'lucide-react';
import ShinyText from '../ui/ShinyText';
import SoftAurora from '../ui/SoftAurora';
import SplitText from '../ui/SplitText';

const workflowSteps = [
  { icon: MousePointer2, title: "Select Track", desc: "Choose Fiber or Coaxial analysis" },
  { icon: Upload, title: "Upload Maps", desc: "Upload Before, After & Reference maps" },
  { icon: Settings2, title: "Set Options", desc: "Configure DPI, Sensitivity & Collision" },
  { icon: Play, title: "Run AI", desc: "Start the Autonomous Analysis Engine" }
];

const engineStages = [
  { icon: Layers, label: "Alignment + Tiling" },
  { icon: Cpu, label: "AI Detection + OCR" },
  { icon: CheckCircle2, label: "Match Differences" }
];

export const LandingSection = ({ onGetStarted }) => {
  const navigate = useNavigate();
  const learnMoreRef = React.useRef(null);

  const scrollToLearnMore = () => {
    learnMoreRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // The user's snippet called navigate('/dashboard'), 
  // but in our current App.jsx, the state 'isLanding' handles the view.
  // I will call onGetStarted() instead to maintain compatibility with App.jsx
  // while keeping the visual design the same.
  const handleStart = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="relative bg-slate-950 overflow-x-hidden">
      {/* Hero Section (One Full Viewport) */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0 overflow-hidden opacity-100">
          <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
            <SoftAurora
              speed={1.1}
              scale={1.5}
              brightness={1.5}
              color1="#4D9FFF"
              color2="#FF2A85"
              noiseFrequency={3.5}
              noiseAmplitude={1.5}
              bandHeight={0.5}
              bandSpread={1.4}
              octaveDecay={0.1}
              layerOffset={0}
              colorSpeed={1}
              enableMouseInteraction
              mouseInfluence={0.2}
            />
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-6xl px-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="mb-8 flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-gray-200 backdrop-blur-sm"
          >
            <svg className="w-4 h-4 text-[#4D9FFF] drop-shadow-[0_0_5px_rgba(77,159,255,0.8)]" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M12 2L2 12h8v10l10-10h-8z" />
            </svg>
            <ShinyText
              text="AI-Powered Topology Analysis"
              disabled={false}
              speed={3}
              className="font-semibold"
              color="#93c5fd"
              shineColor="#ffffff"
            />
          </motion.div>

          <SplitText
            tag="h1"
            text={"AI-Powered Network\nTopology Analysis\nTool"}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[1.05] mb-12 drop-shadow-[0_0_40px_rgba(0,0,0,0.8)] [text-shadow:0_4px_30px_rgba(0,0,0,0.6)] font-sans px-4"
            delay={40}
            duration={1.2}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
          />

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-row items-center justify-center gap-3"
          >
            <button
              onClick={handleStart}
              className="px-10 py-4 rounded-full bg-white text-black font-black tracking-tighter hover:bg-gray-100 transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
            >
              Get Started
            </button>
            <button
              onClick={scrollToLearnMore}
              className="px-10 py-4 rounded-full border border-white/20 bg-slate-950/50 text-white font-black tracking-tighter hover:bg-white/10 transition-all backdrop-blur-sm shadow-lg"
            >
              Learn More
            </button>
          </motion.div>
        </div>
      </div>

      {/* Workflow Section (Learn More) */}
      <div 
        ref={learnMoreRef}
        className="relative z-10 w-full bg-slate-950/50 backdrop-blur-3xl border-t border-white/5 pt-32 pb-48 px-6"
      >
        <div className="max-w-6xl mx-auto space-y-32">
          {/* Section Header */}
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
              How <span className="text-[#4D9FFF]">SpectraMap</span> Works
            </h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
              A simplified breakdown of our professional network analysis ecosystem.
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {workflowSteps.map((step, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-sm space-y-6 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#4D9FFF]/10 flex items-center justify-center text-[#4D9FFF] group-hover:bg-[#4D9FFF] group-hover:text-white transition-all">
                  <step.icon className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white tracking-tight">{idx + 1}. {step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Engine Processing Visualization */}
          <div className="relative p-12 rounded-[3.5rem] bg-gradient-to-br from-[#16161a] to-slate-950 border border-white/5 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF2A85]/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#4D9FFF]/10 blur-[120px] pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#FF2A85] text-white flex items-center justify-center font-black animate-pulse">5</div>
                  <h3 className="text-3xl font-black text-white">Autonomous Stage Processing</h3>
                </div>
                <p className="text-gray-400 text-lg leading-relaxed">
                  The engine automatically cycles through three high-precision processing stages to ensure 100% data integrity.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  {engineStages.map((stage, i) => (
                    <div key={i} className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3 text-sm font-bold text-gray-300">
                      <stage.icon className="w-4 h-4 text-[#4D9FFF]" />
                      {stage.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6">
                   <div className="flex items-center justify-between">
                     <span className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500 flex items-center gap-2">
                       <CheckCircle2 className="w-4 h-4" /> Final Phase
                     </span>
                     <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Step 6-7</span>
                   </div>
                   <h4 className="text-2xl font-bold text-white leading-tight">Human-in-the-Loop Approval & Final Export</h4>
                   <div className="flex gap-4">
                      <div className="px-5 py-2.5 rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest flex items-center gap-2">
                        <Download className="w-4 h-4" /> Download
                      </div>
                      <div className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-black text-xs uppercase tracking-widest border border-white/10">
                        View Report
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center pt-10">
             <button 
               onClick={handleStart}
               className="group relative px-12 py-5 bg-white text-black font-black rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
             >
                <span className="relative z-10">Start Your Analysis Now</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#4D9FFF]/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
