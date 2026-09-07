import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging_config import logger
from app.db.database import SessionLocal
from app.db.init_db import init_db
from app.ml.training import train_and_save_model
from app.websocket.manager import ws_manager

from app.routers import (
    auth,
    users,
    mine_sites,
    sensors,
    predictions,
    alerts,
    risk,
    dashboard,
    historical,
    ml,
    data_ingestion,
    thermal,
    ai,
    health,
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="FastAPI Backend for AI-Based Rockfall Prediction and Real-time Alert System in Indian Open-pit Mines",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
origins = settings.cors_origins_list
logger.info(f"Setting CORS origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    logger.info("Starting up Rockfall AI FastAPI server...")
    # Initialize MySQL tables if connection is available
    try:
        db = SessionLocal()
        init_db(db)
        db.close()
    except Exception as e:
        logger.warning(f"Could not auto-create MySQL tables on startup (ensure MySQL is running): {e}")

    # Ensure ML model is trained & saved
    model_path = os.path.join(os.path.dirname(__file__), "ml", "models", "rockfall_model.pkl")
    if not os.path.exists(model_path):
        logger.info("Training initial scikit-learn model...")
        try:
            train_and_save_model()
        except Exception as e:
            logger.warning(f"Initial ML model training failed: {e}")


# Include REST routers under /api
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(mine_sites.router, prefix=settings.API_V1_STR)
app.include_router(sensors.router, prefix=settings.API_V1_STR)
app.include_router(predictions.router, prefix=settings.API_V1_STR)
app.include_router(alerts.router, prefix=settings.API_V1_STR)
app.include_router(risk.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(historical.router, prefix=settings.API_V1_STR)
app.include_router(ml.router, prefix=settings.API_V1_STR)
app.include_router(data_ingestion.router, prefix=settings.API_V1_STR)
app.include_router(thermal.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(health.router, prefix=settings.API_V1_STR)

# Root /health shortcut
app.include_router(health.router)


@app.websocket("/ws/mine/{mine_site_id}")
async def websocket_endpoint(websocket: WebSocket, mine_site_id: str):
    await ws_manager.connect(websocket, mine_site_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back pong or handle client messages
            await websocket.send_text(f'{{"type": "ack", "received": {data}}}')
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, mine_site_id)
    except Exception as e:
        logger.warning(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket, mine_site_id)
