# Full Stack Project Setup

This project contains:

- Frontend (Vite + Node.js)
- Backend (FastAPI)
- Celery Worker

---

# Frontend Setup

## 1. Go to frontend folder

```bash
cd frontend
```

## 2. Install dependencies

```bash
npm install
```

## 3. Create `.env` file

Create a `.env` file inside the frontend directory and add the backend/API link.

Example:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## 4. Run frontend

```bash
npm run dev
```

Frontend will usually run on:

```text
http://localhost:5173
```

---

# Backend Setup

## 1. Go to backend folder

```bash
cd backend
```

## 2. Create virtual environment

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### Linux / macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

## 3. Install backend dependencies

```bash
pip install -r requirements.txt
```

## 4. Create backend `.env` file

Create a `.env` file inside the backend directory.

Example:

```env
REDIS_URL=redis://localhost:6379
DATABASE_URL=your_database_url
```

---

# Run Celery Worker

Start the Celery worker:

```bash
celery -A app.celery_worker worker --loglevel=info
```

---

# Run FastAPI Backend

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

Backend will run on:

```text
http://localhost:8000
```

---

# Recommended Startup Order

1. Start Redis
2. Start Celery Worker
3. Start FastAPI Backend
4. Start Frontend

---

# Tech Stack

- Frontend: Vite + React
- Backend: FastAPI
- Task Queue: Celery
- Broker: Redis