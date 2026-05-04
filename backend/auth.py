from datetime import datetime, timedelta

from fastapi import APIRouter, HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from pymongo.errors import DuplicateKeyError

from config import settings
from database import db
from logger import logger
from responses import success_response
from schemas import LoginRequest, RefreshRequest, SignupRequest

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)


def create_token(data: dict, expires_delta: timedelta, token_type: str) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire, "token_type": token_type})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def create_access_token(data: dict) -> str:
    return create_token(
        data,
        timedelta(minutes=settings.access_token_expire_minutes),
        "access",
    )


def create_refresh_token(data: dict) -> str:
    return create_token(
        data,
        timedelta(days=settings.refresh_token_expire_days),
        "refresh",
    )


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from exc


@router.post("/signup")
async def signup(user: SignupRequest):
    email = user.email.lower().strip()
    password = user.password

    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    try:
        await db.users.insert_one({
            "email": email,
            "password": hash_password(password),
            "created_at": datetime.utcnow(),
        })
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=400, detail="User already exists") from exc

    logger.info("New user signed up: %s", email)
    return success_response("Signup successful")


@router.post("/login")
async def login(user: LoginRequest):
    email = user.email.lower().strip()
    password = user.password

    db_user = await db.users.find_one({"email": email})

    if not db_user or not verify_password(password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token_data = {"email": email, "sub": email}

    return success_response(
        "Login successful",
        {
            "access_token": create_access_token(token_data),
            "refresh_token": create_refresh_token(token_data),
        },
    )


@router.post("/refresh")
async def refresh_token(data: RefreshRequest):
    payload = decode_token(data.refresh_token)

    if payload.get("token_type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    email = payload.get("email") or payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="User no longer exists")

    return success_response(
        "Access token refreshed",
        {"access_token": create_access_token({"email": email, "sub": email})},
    )
