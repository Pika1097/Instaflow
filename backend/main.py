from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from auth import router as auth_router
from automation import router as automation_router
from campaign import router as campaign_router
from config import settings
from database import db, ping_database
from logger import configure_logging, logger
from responses import error_response, success_response

configure_logging()

app = FastAPI(
    title="Instaflow API",
    version="1.0.0",
    docs_url="/docs" if settings.app_env != "production" else None,
    redoc_url="/redoc" if settings.app_env != "production" else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth_router)
app.include_router(campaign_router)
app.include_router(automation_router)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    message = exc.detail

    if isinstance(message, dict):
        message = message.get("message", "Something went wrong")

    return JSONResponse(
        status_code=exc.status_code,
        content=error_response(str(message)),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    first_error = exc.errors()[0] if exc.errors() else {}
    field = ".".join(str(item) for item in first_error.get("loc", []) if item != "body")
    message = first_error.get("msg", "Invalid request")

    if field:
        message = f"{field}: {message}"

    return JSONResponse(
        status_code=422,
        content=error_response(message),
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled API error: %s", exc)
    return JSONResponse(
        status_code=500,
        content=error_response("Internal server error"),
    )


@app.on_event("startup")
async def startup():
    await ping_database()
    await db.users.create_index("email", unique=True)
    await db.campaigns.create_index([("user_id", 1), ("created_at", -1)])
    await db.analytics.create_index([("user_id", 1), ("timestamp", -1)])
    await db.rate_limits.create_index("expires_at", expireAfterSeconds=0)
    logger.info("Instaflow API started in %s mode", settings.app_env)


@app.get("/")
def home():
    return success_response("Instaflow API is running")


@app.get("/health")
def health():
    return success_response("Healthy", {"status": "ok"})
