import os
import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from dotenv import load_dotenv

from database import init_db, close_db, engine
from routes.sync import router as sync_router

# Load environment configuration
load_dotenv()

# Configure logging
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("ondera.main")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    FastAPI lifespan context manager: handles startup database initialization
    and graceful shutdown connection disposal.
    """
    logger.info("Starting KrishiKotha AI Backend Gateway...")
    try:
        await init_db()
        logger.info("PostgreSQL schema successfully connected and verified.")
    except Exception as e:
        logger.error(f"Database initialization warning (will retry on incoming requests): {e}")

    yield

    logger.info("Shutting down KrishiKotha AI Gateway...")
    await close_db()


# Initialize FastAPI Application
app = FastAPI(
    title="KrishiKotha AI: Edge Multi-Agent Sync Gateway",
    description=(
        "Store-and-Forward sync gateway for smallholder coffee farmers in Bandarban, Bangladesh. "
        "Processes offline diagnostic dossiers from edge nodes and orchestrates Claude AI "
        "agronomic advisories for District Extension Officers."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration
# Ensures Next.js local dev server and Vercel production domains can communicate
cors_origins_env = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,https://hackoshackhathon.vercel.app,https://ondera-agro-mesh.vercel.app",
)
allowed_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]

# Guarantee default development and production URLs are present
for default_origin in [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://hackoshackhathon.vercel.app",
]:
    if default_origin not in allowed_origins:
        allowed_origins.append(default_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(sync_router)


@app.api_route("/", methods=["GET", "HEAD"], tags=["Root"])
async def root():
    return {
        "system": "KrishiKotha AI Edge Multi-Agent Mesh",
        "role": "Store-and-Forward Cloud Gateway",
        "docs": "/docs",
        "status": "online",
        "coffee_region": "Bandarban Hill Tracts, Bangladesh",
    }


@app.api_route("/api/health", methods=["GET", "HEAD"], status_code=status.HTTP_200_OK, tags=["Health"])
async def health_check():
    """
    Healthcheck endpoint verifying database connectivity and service readiness.
    """
    db_status = "connected"
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unreachable ({str(e)})"

    return {
        "status": "healthy" if "unreachable" not in db_status else "degraded",
        "database": db_status,
        "service": "ondera-backend",
        "version": "1.0.0",
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", os.getenv("BACKEND_PORT", 8000)))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
