from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from config import settings
from database import db
from dependencies import get_current_user
from rate_limit import check_rate_limit
from responses import success_response
from schemas import CampaignCreateRequest, CampaignUpdateRequest

router = APIRouter()


def serialize_campaign(campaign: dict) -> dict:
    campaign["_id"] = str(campaign["_id"])
    return campaign


def parse_object_id(id: str) -> ObjectId:
    try:
        return ObjectId(id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid campaign ID") from exc


def condition_payload(data):
    return {
        "start_hour": data.start_hour,
        "end_hour": data.end_hour,
        "min_words": 0 if data.min_words is None else data.min_words,
    }


@router.delete("/reset")
async def reset(user: dict = Depends(get_current_user)):
    if not settings.enable_dev_routes:
        raise HTTPException(status_code=404, detail="Route not found")

    await db.campaigns.delete_many({"user_id": user["email"]})
    await db.analytics.delete_many({"user_id": user["email"]})
    return success_response("Your campaigns and analytics were reset")


@router.post("/campaign")
async def create_campaign(data: CampaignCreateRequest, user: dict = Depends(get_current_user)):
    allowed = await check_rate_limit(
        db,
        user["email"],
        action="campaign-write",
        limit=settings.campaign_rate_limit,
        window=settings.campaign_rate_window_seconds,
    )

    if not allowed:
        raise HTTPException(status_code=429, detail="Too many campaign requests")

    campaign = {
        "keyword": data.keyword,
        "message": data.message,
        "user_id": user["email"],
        "priority": data.priority,
        "active": True,
        "conditions": condition_payload(data),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await db.campaigns.insert_one(campaign)

    return success_response(
        "Campaign created",
        {"id": str(result.inserted_id)},
    )


@router.get("/campaigns")
async def get_campaigns(user: dict = Depends(get_current_user)):
    campaigns = []

    cursor = db.campaigns.find({"user_id": user["email"]}).sort("created_at", -1)
    async for campaign in cursor:
        campaigns.append(serialize_campaign(campaign))

    return success_response("Campaigns loaded", campaigns)


@router.delete("/campaign/{id}")
async def delete_campaign(id: str, user: dict = Depends(get_current_user)):
    oid = parse_object_id(id)

    result = await db.campaigns.delete_one({
        "_id": oid,
        "user_id": user["email"],
    })

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Campaign not found")

    return success_response("Campaign deleted")


@router.put("/campaign/{id}")
async def update_campaign(
    id: str,
    data: CampaignUpdateRequest,
    user: dict = Depends(get_current_user),
):
    oid = parse_object_id(id)
    update_data = {"updated_at": datetime.utcnow()}
    fields_set = data.model_fields_set

    if "keyword" in fields_set:
        update_data["keyword"] = data.keyword

    if "message" in fields_set:
        update_data["message"] = data.message

    if "priority" in fields_set:
        update_data["priority"] = data.priority

    if "start_hour" in fields_set:
        update_data["conditions.start_hour"] = data.start_hour

    if "end_hour" in fields_set:
        update_data["conditions.end_hour"] = data.end_hour

    if "min_words" in fields_set:
        update_data["conditions.min_words"] = 0 if data.min_words is None else data.min_words

    result = await db.campaigns.update_one(
        {"_id": oid, "user_id": user["email"]},
        {"$set": update_data},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Campaign not found")

    return success_response("Campaign updated")


@router.put("/campaign/{id}/toggle")
async def toggle_campaign(id: str, user: dict = Depends(get_current_user)):
    oid = parse_object_id(id)

    campaign = await db.campaigns.find_one({
        "_id": oid,
        "user_id": user["email"],
    })

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    new_status = not campaign.get("active", True)

    await db.campaigns.update_one(
        {"_id": oid, "user_id": user["email"]},
        {"$set": {"active": new_status, "updated_at": datetime.utcnow()}},
    )

    return success_response(
        "Campaign status updated",
        {"active": new_status},
    )
