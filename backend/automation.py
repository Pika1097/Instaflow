import re
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from rapidfuzz.fuzz import ratio

from config import settings
from database import db
from dependencies import get_current_user
from rate_limit import check_rate_limit
from responses import success_response
from schemas import CommentTestRequest

router = APIRouter()

STOP_WORDS = {
    "is", "am", "are", "the", "a", "an", "to", "for", "and", "or",
    "i", "you", "me", "my", "we", "it", "this", "that", "please",
}

SYNONYMS = {
    "hello": ["hi", "hey", "hello", "yo"],
    "price": ["price", "cost", "pricing", "rate", "fees"],
    "buy": ["buy", "purchase", "order", "checkout"],
    "help": ["help", "support", "assist", "guide"],
    "link": ["link", "url", "send", "dm"],
    "discount": ["discount", "offer", "coupon", "deal"],
    "course": ["course", "class", "training", "workshop"],
}

MIN_SCORE = 2


def fuzzy_match(a: str, b: str) -> bool:
    return ratio(a, b) >= 85


def normalize_words(comment: str):
    words = re.findall(r"\b\w+\b", comment.lower())
    return [word for word in words if word not in STOP_WORDS]


def parse_keyword_pairs(raw_keywords: str):
    pairs = []

    for item in raw_keywords.split(","):
        item = item.strip().lower()
        if not item:
            continue

        if ":" in item:
            key, raw_weight = item.split(":", 1)
            try:
                pairs.append((key.strip(), max(int(raw_weight), 1)))
            except ValueError:
                pairs.append((item, 1))
        else:
            pairs.append((item, 1))

    return pairs


def hour_allowed(start_hour, end_hour) -> bool:
    if start_hour is None or end_hour is None:
        return True

    current_hour = datetime.now().hour

    if start_hour <= end_hour:
        return start_hour <= current_hour <= end_hour

    return current_hour >= start_hour or current_hour <= end_hour


def check_conditions(words, campaign) -> bool:
    conditions = campaign.get("conditions", {})

    min_words = conditions.get("min_words")
    if min_words is not None and len(words) < min_words:
        return False

    return hour_allowed(conditions.get("start_hour"), conditions.get("end_hour"))


def score_campaign(words, keyword_pairs):
    score = 0
    matched_keywords = set()
    joined_comment = " ".join(words)

    for keyword, weight in keyword_pairs:
        keyword_group = SYNONYMS.get(keyword, [keyword])

        if " " in keyword and keyword in joined_comment:
            score += 4 * weight
            matched_keywords.add(keyword)

        for word in words:
            if word == keyword:
                score += 3 * weight
                matched_keywords.add(keyword)
            elif word in keyword_group:
                score += 2 * weight
                matched_keywords.add(word)
            elif fuzzy_match(word, keyword):
                score += weight
                matched_keywords.add(word)

        if keyword in joined_comment:
            score += 2 * weight

    if score >= 3:
        score += 2

    return score, sorted(matched_keywords)


@router.post("/test-comment")
async def test_comment(data: CommentTestRequest, user: dict = Depends(get_current_user)):
    allowed = await check_rate_limit(
        db,
        user["email"],
        action="comment-test",
        limit=settings.comment_test_rate_limit,
        window=settings.comment_test_rate_window_seconds,
    )

    if not allowed:
        raise HTTPException(status_code=429, detail="Too many requests. Try again later.")

    comment = data.comment.lower()
    words = normalize_words(comment)

    campaigns = []
    async for campaign in db.campaigns.find({"user_id": user["email"]}):
        campaigns.append(campaign)

    best_match = None
    best_score = 0
    best_priority = -1
    best_matched_keywords = []

    for campaign in campaigns:
        if not campaign.get("active", True):
            continue

        if not check_conditions(words, campaign):
            continue

        keyword_pairs = parse_keyword_pairs(campaign.get("keyword", ""))
        if not keyword_pairs:
            continue

        score, matched_keywords = score_campaign(words, keyword_pairs)
        priority = campaign.get("priority", 1)

        if score > best_score or (score == best_score and priority > best_priority):
            best_score = score
            best_priority = priority
            best_match = campaign
            best_matched_keywords = matched_keywords

    if best_match and best_score >= MIN_SCORE:
        await db.analytics.insert_one({
            "user_id": user["email"],
            "campaign_id": str(best_match["_id"]),
            "keyword": best_match.get("keyword"),
            "comment": comment,
            "score": best_score,
            "matched_keywords": best_matched_keywords,
            "timestamp": datetime.utcnow(),
        })

        return success_response(
            "Matching campaign found",
            {
                "reply": best_match.get("message", ""),
                "campaign_id": str(best_match["_id"]),
                "score": best_score,
                "matched_keywords": best_matched_keywords,
            },
        )

    return success_response("No matching campaign", {"reply": None})


@router.get("/analytics")
async def get_analytics(user: dict = Depends(get_current_user)):
    logs = []

    cursor = db.analytics.find({"user_id": user["email"]}).sort("timestamp", -1)
    async for log in cursor:
        log["_id"] = str(log["_id"])
        logs.append(log)

    return success_response("Analytics loaded", logs)
