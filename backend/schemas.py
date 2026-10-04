import uuid
from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


class ClaudeAdvisoryResult(BaseModel):
    """Structured response produced by the Claude Multi-Agent Orchestrator."""
    advisory_summary: str = Field(
        ...,
        description="Concise, localized summary for the District Extension Officer",
    )
    recommended_action: str = Field(
        ...,
        description="Prescriptive agronomic action plan for the farmer",
    )
    urgency_level: str = Field(
        default="MEDIUM",
        description="Urgency classification: LOW, MEDIUM, HIGH, CRITICAL",
    )
    market_context: Optional[str] = Field(
        default=None,
        description="Market pricing context and harvest timing recommendations",
    )


class SyncDossierCreate(BaseModel):
    """Payload sent from offline client during Store-and-Forward synchronization."""
    id: Optional[str] = Field(
        default_factory=lambda: str(uuid.uuid4()),
        description="Client-generated unique ID or auto-generated UUID",
        examples=["dossier-noor-001"],
    )
    farmer_id: str = Field(
        default="farmer_noor_01",
        description="Unique identifier for the farmer",
        examples=["farmer_noor_01"],
    )
    farmer_name: Optional[str] = Field(
        default="Noor",
        description="Friendly farmer display name",
        examples=["Noor"],
    )
    crop_type: str = Field(
        default="Arabica Coffee (Bourbon)",
        description="Coffee variety under observation",
        examples=["Arabica Coffee (Bourbon)"],
    )
    offline_diagnosis: str = Field(
        ...,
        description="Edge model offline diagnosis or preliminary classification",
        examples=["Suspected Coffee Leaf Rust (Hemileia vastatrix)"],
    )
    symptoms_description: Optional[str] = Field(
        default="yellow spots on leaves",
        description="Raw symptom observation entered by Noor in the field",
        examples=["yellow spots on leaves, powdery underside, leaf drop after rain"],
    )
    geo_lat: float = Field(
        default=6.4521,
        description="GPS Latitude coordinate of the plot in Ondera highlands",
        examples=[6.4521],
    )
    geo_lon: float = Field(
        default=38.5412,
        description="GPS Longitude coordinate of the plot in Ondera highlands",
        examples=[38.5412],
    )
    altitude_m: Optional[float] = Field(
        default=1840.0,
        description="Altitude in meters above sea level",
        examples=[1840.0],
    )
    client_recorded_at: Optional[datetime] = Field(
        default_factory=get_utc_now,
        description="Timestamp when captured offline on mobile client",
    )


class SyncDossierResponse(BaseModel):
    """Full representation of a synchronized dossier including Claude AI advisory."""
    id: str
    farmer_id: str
    farmer_name: str
    crop_type: str
    offline_diagnosis: str
    symptoms_description: Optional[str] = None
    geo_lat: float
    geo_lon: float
    altitude_m: Optional[float] = None
    client_recorded_at: Optional[datetime] = None
    synced_at: datetime
    advisory_summary: Optional[str] = None
    recommended_action: Optional[str] = None
    urgency_level: Optional[str] = None
    market_context: Optional[str] = None
    status: str

    model_config = ConfigDict(from_attributes=True)


class SyncBatchRequest(BaseModel):
    """Batch payload allowing offline clients to upload a queue of stored dossiers."""
    items: List[SyncDossierCreate] = Field(
        ...,
        description="List of offline-queued dossiers to synchronize",
    )


class SyncBatchResponse(BaseModel):
    """Response returned upon processing a batch of synchronized dossiers."""
    synced_count: int
    results: List[SyncDossierResponse]


class DashboardStats(BaseModel):
    """Aggregated statistics for District Extension Officer dashboard."""
    total_dossiers: int
    critical_alerts: int
    high_urgency: int
    medium_urgency: int
    low_urgency: int
    active_farmers: int
    market_price_parchment: str
    mesh_status: str
