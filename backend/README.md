# Rockfall AI FastAPI Backend

FastAPI backend for the AI-Based Rockfall Prediction and Real-time Alert System in Indian Open-pit Mines.

## Features
- **Authentication**: JWT token authentication with bcrypt password hashing.
- **ORM & Database**: SQLAlchemy 2.x ORM connecting to MySQL 8.x (`rockfall_ai`).
- **Validation**: Pydantic v2 schemas for all payloads.
- **ML Engine**: Scikit-Learn `RandomForestClassifier` for rockfall risk estimation.
- **Indian Mining Factors**: Monsoonal rainfall, laterite geology, humidity, groundwater level.
- **Real-Time WebSockets**: Live telemetry broadcasting per mine site (`/ws/mine/{mine_site_id}`).
- **Azure OpenAI Proxy**: Backend-controlled LLM integration with automatic fallback to local ML model.

## Running Locally

1. Setup Python Virtual Environment:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/macOS
```

2. Install Dependencies:
```bash
pip install -r requirements.txt
```

3. Initialize Database:
Ensure MySQL Server is running on localhost:3306, then run:
```bash
python scripts/seed_database.py
```

4. Start FastAPI Server:
```bash
uvicorn app.main:app --reload --port 8000
```

Swagger API Docs: `http://127.0.0.1:8000/docs`
