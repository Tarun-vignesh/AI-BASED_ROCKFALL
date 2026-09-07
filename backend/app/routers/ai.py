from typing import Dict, Any, List
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.ai_service import get_ai_rockfall_analysis, get_historical_ai_insights

router = APIRouter(prefix="/ai", tags=["AI & Azure OpenAI"])


class AIAnalysisRequest(BaseModel):
    sensor_data: Dict[str, Any]
    stream_type: str = "sensor"
    indian_conditions: Dict[str, Any] = None


class HistoricalInsightsRequest(BaseModel):
    results: Dict[str, Any]
    model_type: str = "RandomForest"


@router.post("/rockfall-analysis", summary="Generate AI Rockfall Prediction via Azure OpenAI or Local ML Fallback")
async def rockfall_analysis(payload: AIAnalysisRequest):
    return await get_ai_rockfall_analysis(
        sensor_data=payload.sensor_data,
        stream_type=payload.stream_type,
        indian_conditions=payload.indian_conditions,
    )


@router.post("/historical-insights", summary="Generate AI Historical Safety Insights")
async def historical_insights(payload: HistoricalInsightsRequest):
    insights = await get_historical_ai_insights(results=payload.results, model_type=payload.model_type)
    return {"insights": insights}
