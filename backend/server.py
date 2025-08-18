from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List
import uuid
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default="healthy")
    response_time_ms: int = Field(default=2)

class StatusCheckCreate(BaseModel):
    client_name: str
    status: str = Field(default="healthy")
    response_time_ms: int = Field(default=2)

class StatusStats(BaseModel):
    total_checks: int
    active_today: int
    avg_response_time: float
    healthy_count: int
    unhealthy_count: int

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Integration Status Monitor API - Ready"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    logger.info(f"Created status check for client: {status_obj.client_name}")
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().sort("timestamp", -1).to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

@api_router.get("/stats", response_model=StatusStats)
async def get_status_stats():
    # Get all status checks
    all_checks = await db.status_checks.find().to_list(1000)
    
    # Calculate stats
    total_checks = len(all_checks)
    
    # Active today (last 24 hours)
    yesterday = datetime.utcnow() - timedelta(days=1)
    active_today = len([check for check in all_checks if check['timestamp'] > yesterday])
    
    # Average response time
    response_times = [check.get('response_time_ms', 2) for check in all_checks]
    avg_response_time = sum(response_times) / len(response_times) if response_times else 0
    
    # Health counts
    healthy_count = len([check for check in all_checks if check.get('status', 'healthy') == 'healthy'])
    unhealthy_count = total_checks - healthy_count
    
    return StatusStats(
        total_checks=total_checks,
        active_today=active_today,
        avg_response_time=round(avg_response_time, 2),
        healthy_count=healthy_count,
        unhealthy_count=unhealthy_count
    )

@api_router.delete("/status/{status_id}")
async def delete_status_check(status_id: str):
    result = await db.status_checks.delete_one({"id": status_id})
    if result.deleted_count == 1:
        logger.info(f"Deleted status check: {status_id}")
        return {"message": "Status check deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail="Status check not found")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
