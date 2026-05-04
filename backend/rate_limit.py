from datetime import datetime, timedelta


async def check_rate_limit(db, user_id, action="default", limit=5, window=60):
    now = datetime.utcnow()
    cutoff = now - timedelta(seconds=window)
    key = f"{user_id}:{action}"

    doc = await db.rate_limits.find_one({"_id": key})
    timestamps = []

    if doc:
        timestamps = [
            ts for ts in doc.get("timestamps", [])
            if isinstance(ts, datetime) and ts >= cutoff
        ]

    if len(timestamps) >= limit:
        await db.rate_limits.update_one(
            {"_id": key},
            {"$set": {"timestamps": timestamps, "expires_at": now + timedelta(seconds=window)}},
            upsert=True,
        )
        return False

    timestamps.append(now)

    await db.rate_limits.update_one(
        {"_id": key},
        {
            "$set": {
                "user_id": user_id,
                "action": action,
                "timestamps": timestamps,
                "expires_at": now + timedelta(seconds=window),
            }
        },
        upsert=True,
    )

    return True
