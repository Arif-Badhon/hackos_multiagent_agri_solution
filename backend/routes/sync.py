import logging
import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status, Form, File, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from database import get_db
from models import SyncDossier
from schemas import (
    SyncDossierCreate,
    SyncDossierResponse,
    SyncBatchRequest,
    SyncBatchResponse,
    DashboardStats,
)
from agents.claude_orchestrator import (
    generate_agronomic_advisory,
    stream_bangladesh_agri_advice,
)

logger = logging.getLogger("ondera.routes.sync")

router = APIRouter(prefix="/api/sync", tags=["Store-and-Forward Sync Gateway"])


@router.post(
    "/stream",
    summary="Multimodal streaming advisory for DAE Bandarban coffee farmers",
    description=(
        "Streams real-time agronomic guidance in standard Bengali using Claude Opus 5.5. "
        "Accepts a farmer's Bangla audio transcript, voice recording, optional crop snapshot, "
        "and automatically persists the dossier into PostgreSQL for Extension Officers."
    ),
)
async def stream_dossier_advice(
    transcript: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    audio: Optional[UploadFile] = File(None),
    farmer_name: Optional[str] = Form("Noor"),
    farmer_id: Optional[str] = Form("farmer_noor_01"),
    crop_type: Optional[str] = Form("Arabica Coffee (Bourbon)"),
    db: AsyncSession = Depends(get_db),
):
    """
    Multimodal streaming endpoint for mobile coffee farmers in Bandarban.
    Accepts Bangla voice transcript, audio recording, and crop photograph.
    Saves a SyncDossier in PostgreSQL so the District Extension Officer Command Center
    immediately registers the observation, and returns a text/event-stream response.
    """
    image_bytes: Optional[bytes] = None
    mime_type: Optional[str] = None

    if image is not None:
        try:
            read_bytes = await image.read()
            if read_bytes and len(read_bytes) > 0:
                image_bytes = read_bytes
                mime_type = image.content_type or "image/jpeg"
                logger.info(f"Received image in stream request: {image.filename} ({len(image_bytes)} bytes)")
        except Exception as e:
            logger.warning(f"Failed to read uploaded image in /api/sync/stream: {e}")

    if audio is not None:
        try:
            audio_bytes = await audio.read()
            logger.info(f"Received audio recording in stream request: {audio.filename} ({len(audio_bytes)} bytes)")
        except Exception as e:
            logger.warning(f"Failed to read uploaded audio in /api/sync/stream: {e}")

    cleaned_transcript = (transcript or "").strip()
    if not cleaned_transcript:
        cleaned_transcript = "বান্দরবানের পাহাড়ি জমিতে কফি চাষের পর্যবেক্ষণ ও রোগ নিরাময়ে সম্প্রসারণ কর্মকর্তার পরামর্শ প্রয়োজন।"

    # Automatically save SyncDossier into PostgreSQL so it immediately reflects in the Command Center
    try:
        now = datetime.now(timezone.utc)
        dossier_id = str(uuid.uuid4())

        # Determine preliminary diagnosis tag
        diag = "বান্দরবান কফি পর্যবেক্ষণ (মিলিবাগ ও ডাইব্যাক ঝুঁকি)"
        if "মিলিবাগ" in cleaned_transcript:
            diag = "কফি মিলিবাগ পোকা আক্রমণ (Mealybug)"
        elif "মরিচা" in cleaned_transcript or "rust" in cleaned_transcript.lower():
            diag = "কফি পাতা মরিচা রোগ (Coffee Leaf Rust)"
        elif "ডাইব্যাক" in cleaned_transcript or "dieback" in cleaned_transcript.lower():
            diag = "অ্যারাবিকা ডাইব্যাক (Dieback)"
        elif "চেরি" in cleaned_transcript or "বোরার" in cleaned_transcript:
            diag = "কফি বেরি বোরার বা চেরি পচন"

        is_high = any(k in cleaned_transcript for k in ["মিলিবাগ", "মরিচা", "ডাইব্যাক", "পোকা", "শুকিয়ে", "ঝরে"])

        db_dossier = SyncDossier(
            id=dossier_id,
            farmer_id=farmer_id or "farmer_noor_01",
            farmer_name=farmer_name or "Noor",
            crop_type=crop_type or "Arabica Coffee (Bourbon)",
            offline_diagnosis=diag,
            symptoms_description=cleaned_transcript,
            geo_lat=21.8311,
            geo_lon=92.2184,
            altitude_m=650.0,
            client_recorded_at=now,
            synced_at=now,
            advisory_summary=f"কৃষক {farmer_name or 'নূর'} এর কফি পর্যবেক্ষণ ডিএই বান্দরবান সিস্টেমে লাইভ সিঙ্ক হয়েছে।",
            recommended_action="ডিএই বান্দরবান প্রোটোকল অনুযায়ী দ্রুত জৈব নিম তেল প্রয়োগ বা ডাইব্যাক আক্রান্ত ডাল ছাঁটাই করুন।",
            urgency_level="HIGH" if is_high else "MEDIUM",
            market_context="বান্দরবান অ্যারাবিকা কফি ন্যায্যমূল্য বেঞ্চমার্ক: ৳৪৫০-৳৫০০ / কেজি (ড্রাই পার্চমেন্ট)। ফড়িয়াদের কাছে কাঁচা চেরি কম দামে বিক্রয় রোধে সহায়তা দিন।",
            status="PROCESSED",
        )
        db.add(db_dossier)
        await db.commit()
        logger.info(f"Stream dossier {dossier_id} successfully saved to database for {farmer_name}.")
    except Exception as db_err:
        logger.error(f"Error persisting stream dossier to database: {db_err}")
        await db.rollback()

    return StreamingResponse(
        stream_bangladesh_agri_advice(
            transcript=cleaned_transcript,
            image_bytes=image_bytes,
            mime_type=mime_type,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post(
    "",
    response_model=SyncDossierResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Synchronize an offline-captured Store-and-Forward Dossier",
    description=(
        "Accepts JSON payload from offline edge client (e.g., Farmer Noor), "
        "stores in PostgreSQL, and invokes Claude Multi-Agent Orchestrator "
        "to generate localized agronomic advisory and market intelligence."
    ),
)
async def sync_dossier(
    payload: SyncDossierCreate,
    db: AsyncSession = Depends(get_db),
) -> SyncDossier:
    try:
        dossier_id = payload.id or str(uuid.uuid4())
        logger.info(f"Received sync request for dossier {dossier_id} from {payload.farmer_id}")

        # Check if record already exists (idempotent store-and-forward handling)
        existing_result = await db.execute(
            select(SyncDossier).where(SyncDossier.id == dossier_id)
        )
        existing_dossier = existing_result.scalars().first()

        # Generate Claude Agronomic Advisory
        advisory = await generate_agronomic_advisory(payload)

        now = datetime.now(timezone.utc)

        if existing_dossier:
            logger.info(f"Dossier {dossier_id} already exists. Updating record with fresh advisory.")
            existing_dossier.farmer_id = payload.farmer_id
            existing_dossier.farmer_name = payload.farmer_name or existing_dossier.farmer_name
            existing_dossier.crop_type = payload.crop_type
            existing_dossier.offline_diagnosis = payload.offline_diagnosis
            existing_dossier.symptoms_description = payload.symptoms_description
            existing_dossier.geo_lat = payload.geo_lat
            existing_dossier.geo_lon = payload.geo_lon
            existing_dossier.altitude_m = payload.altitude_m or existing_dossier.altitude_m
            existing_dossier.synced_at = now
            existing_dossier.advisory_summary = advisory.advisory_summary
            existing_dossier.recommended_action = advisory.recommended_action
            existing_dossier.urgency_level = advisory.urgency_level
            existing_dossier.market_context = advisory.market_context
            existing_dossier.status = "PROCESSED"
            db_dossier = existing_dossier
        else:
            db_dossier = SyncDossier(
                id=dossier_id,
                farmer_id=payload.farmer_id,
                farmer_name=payload.farmer_name or "Noor",
                crop_type=payload.crop_type,
                offline_diagnosis=payload.offline_diagnosis,
                symptoms_description=payload.symptoms_description,
                geo_lat=payload.geo_lat,
                geo_lon=payload.geo_lon,
                altitude_m=payload.altitude_m or 1840.0,
                client_recorded_at=payload.client_recorded_at or now,
                synced_at=now,
                advisory_summary=advisory.advisory_summary,
                recommended_action=advisory.recommended_action,
                urgency_level=advisory.urgency_level,
                market_context=advisory.market_context,
                status="PROCESSED",
            )
            db.add(db_dossier)

        await db.commit()
        await db.refresh(db_dossier)
        logger.info(f"Successfully committed dossier {db_dossier.id} with urgency {db_dossier.urgency_level}")
        return db_dossier

    except Exception as e:
        logger.error(f"Error syncing dossier: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to synchronize and process dossier: {str(e)}",
        )


@router.post(
    "/batch",
    response_model=SyncBatchResponse,
    summary="Batch synchronize multiple offline dossiers",
)
async def sync_dossier_batch(
    payload: SyncBatchRequest,
    db: AsyncSession = Depends(get_db),
) -> SyncBatchResponse:
    """Processes multiple queued offline dossiers in a single network burst."""
    results: List[SyncDossier] = []
    for item in payload.items:
        dossier = await sync_dossier(item, db)
        results.append(dossier)

    return SyncBatchResponse(
        synced_count=len(results),
        results=results,
    )


@router.get(
    "/dossiers",
    response_model=List[SyncDossierResponse],
    summary="List all synchronized dossiers for Extension Officer dashboard",
)
async def list_dossiers(
    farmer_id: Optional[str] = Query(None, description="Filter by farmer ID"),
    urgency: Optional[str] = Query(None, description="Filter by urgency level"),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
) -> List[SyncDossier]:
    stmt = select(SyncDossier).order_by(desc(SyncDossier.synced_at))
    if farmer_id:
        stmt = stmt.where(SyncDossier.farmer_id == farmer_id)
    if urgency:
        stmt = stmt.where(SyncDossier.urgency_level == urgency.upper())
    stmt = stmt.limit(limit)

    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.get(
    "/dossiers/{dossier_id}",
    response_model=SyncDossierResponse,
    summary="Retrieve single dossier with full Claude advisory",
)
async def get_dossier(
    dossier_id: str,
    db: AsyncSession = Depends(get_db),
) -> SyncDossier:
    result = await db.execute(select(SyncDossier).where(SyncDossier.id == dossier_id))
    dossier = result.scalars().first()
    if not dossier:
        raise HTTPException(status_code=404, detail=f"Dossier {dossier_id} not found")
    return dossier


@router.get(
    "/stats",
    response_model=DashboardStats,
    summary="Aggregated District Extension Officer metrics",
)
async def get_stats(
    db: AsyncSession = Depends(get_db),
) -> DashboardStats:
    total_q = await db.execute(select(func.count(SyncDossier.id)))
    total_count = total_q.scalar() or 0

    critical_q = await db.execute(
        select(func.count(SyncDossier.id)).where(SyncDossier.urgency_level == "CRITICAL")
    )
    critical_count = critical_q.scalar() or 0

    high_q = await db.execute(
        select(func.count(SyncDossier.id)).where(SyncDossier.urgency_level == "HIGH")
    )
    high_count = high_q.scalar() or 0

    medium_q = await db.execute(
        select(func.count(SyncDossier.id)).where(SyncDossier.urgency_level == "MEDIUM")
    )
    medium_count = medium_q.scalar() or 0

    low_q = await db.execute(
        select(func.count(SyncDossier.id)).where(SyncDossier.urgency_level == "LOW")
    )
    low_count = low_q.scalar() or 0

    farmers_q = await db.execute(select(func.count(func.distinct(SyncDossier.farmer_id))))
    farmers_count = farmers_q.scalar() or 0

    return DashboardStats(
        total_dossiers=total_count,
        critical_alerts=critical_count,
        high_urgency=high_count,
        medium_urgency=medium_count,
        low_urgency=low_count,
        active_farmers=max(farmers_count, 1),
        market_price_parchment="$3.85 / kg (Ondera Arabica Grade 1)",
        mesh_status="Operational (3 LoRa Edge Relays Active)",
    )
