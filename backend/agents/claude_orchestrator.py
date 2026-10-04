import os
import json
import logging
from typing import Optional, Dict, Any
from anthropic import AsyncAnthropic
from schemas import ClaudeAdvisoryResult

logger = logging.getLogger("ondera.agents.claude")

# Environment configuration
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "").strip()
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-3-7-sonnet-20250219")

# Initialize official Anthropic Async Client
anthropic_client: Optional[AsyncAnthropic] = None
if ANTHROPIC_API_KEY and not ANTHROPIC_API_KEY.startswith("your_anthropic_api_key"):
    try:
        anthropic_client = AsyncAnthropic(api_key=ANTHROPIC_API_KEY)
        logger.info(f"Initialized Anthropic client with model {CLAUDE_MODEL}")
    except Exception as e:
        logger.warning(f"Failed to initialize Anthropic client: {e}. Fallback heuristics will be active.")
else:
    logger.info("No active ANTHROPIC_API_KEY detected. Fallback agronomic expert engine will be active.")


ONDERA_AGRONOMY_SYSTEM_PROMPT = """You are the Senior Coffee Agronomy Intelligence Agent for the World Bank Small AI for Development 'Ondera Agro-Mesh' system.

Context & Setting:
- Smallholder coffee farmers in the Ondera highlands (like Noor) cultivate high-elevation Arabica coffee (Bourbon, SL28, Ruiru 11) at 1,700m - 2,000m altitude.
- The farmers operate with intermittent mesh connectivity, recording field observations offline before syncing to cloud gateways.
- Your role is to analyze Store-and-Forward Dossiers sent from farmer edge devices and generate:
  1. A localized District Extension Officer summary (technical validation, regional disease spread risk).
  2. A concrete, step-by-step recommended agronomic action for the farmer (cultural controls, certified organic treatments like copper hydroxide/neem extracts, pruning, shade management).
  3. An urgency level ('LOW', 'MEDIUM', 'HIGH', or 'CRITICAL').
  4. Market pricing intelligence to protect smallholders from predatory intermediaries during harvest.

Format Requirements:
You must respond ONLY with a valid, parseable JSON object matching this exact schema:
{
  "advisory_summary": "Concise 2-3 sentence technical briefing for the District Extension Officer regarding this plot and farmer.",
  "recommended_action": "Numbered, actionable agronomic recommendations for the farmer (e.g. 1. Sanitation/Pruning, 2. Organic Treatment, 3. Moisture Management).",
  "urgency_level": "LOW|MEDIUM|HIGH|CRITICAL",
  "market_context": "Actionable harvest timing and market pricing advisory for Ondera highland cooperatives (e.g. current parchment benchmark $3.80-$4.05/kg)."
}
Do not include any introductory or concluding markdown conversational text outside the JSON object.
"""


def _generate_fallback_advisory(
    farmer_id: str,
    farmer_name: str,
    crop_type: str,
    offline_diagnosis: str,
    symptoms: str,
    altitude: float,
) -> ClaudeAdvisoryResult:
    """
    Expert heuristic fallback engine for Ondera Highlands coffee agro-ecosystem.
    Activated when Claude API key is absent, during offline tests, or upon network timeout.
    """
    symptoms_lower = (symptoms or "").lower()
    diag_lower = (offline_diagnosis or "").lower()

    if "rust" in symptoms_lower or "rust" in diag_lower or "yellow" in symptoms_lower:
        urgency = "HIGH"
        summary = (
            f"Validated high-probability Hemileia vastatrix (Coffee Leaf Rust) outbreak for {farmer_name} "
            f"({farmer_id}) in the Ondera highland zone (elev. {altitude:.0f}m). "
            f"Persistent leaf yellowing and sporulation risk regional transmission along downslope wind corridors."
        )
        actions = (
            "1. Strip and burn severely infected lower foliage to halt spore propagation.\n"
            "2. Apply copper hydroxide (0.2% concentration) or certified organic Bacillus subtilis suspension to undersides of leaves.\n"
            "3. Thin overhead shade trees by 20% to increase morning canopy aeration and reduce relative leaf wetness duration.\n"
            "4. Quarantine Sector 4 tools and disinfect pruning shears with 70% alcohol solution between trees."
        )
        market = (
            "Current Ondera Cooperative Grade 1 parchment pricing holds at $3.85/kg. "
            "Preventing defoliation now protects cherry ripening for peak premium deliveries next month."
        )
    elif "berry" in symptoms_lower or "cbd" in diag_lower or "black" in symptoms_lower:
        urgency = "CRITICAL"
        summary = (
            f"Critical alert: Suspected Coffee Berry Disease (Colletotrichum kahawae) on {farmer_name}'s "
            f"{crop_type} stand. Rapid necrotic lesions threaten immediate yield collapse in wet highland weather."
        )
        actions = (
            "1. Immediately strip all infected, mummified, or darkly scarred green coffee cherries.\n"
            "2. Apply protective copper-based bio-fungicide within 48 hours before oncoming rain.\n"
            "3. Notify District Extension Officer for regional buffer spray coordination."
        )
        market = (
            "Export premium risk: CBD damage drops cherry classification from Grade 1 to low-grade buni, "
            "costing up to $1.40/kg in farmer loss."
        )
    else:
        urgency = "MEDIUM"
        summary = (
            f"Nutritional chlorosis or early vegetative stress identified on {farmer_name}'s plot. "
            f"Symptoms are consistent with localized zinc/nitrogen deficiency aggravated by highland leaching."
        )
        actions = (
            "1. Apply well-composted coffee pulp and organic manure around the drip line (2kg per tree).\n"
            "2. Administer foliar micronutrient spray containing zinc and magnesium during morning hours.\n"
            "3. Mulch with vetiver grass to retain soil moisture and reduce root temperature fluctuations."
        )
        market = (
            "Maintaining bean density and nutrition ensures top flotation cupping scores for the Ondera Fair-Trade auction."
        )

    return ClaudeAdvisoryResult(
        advisory_summary=summary,
        recommended_action=actions,
        urgency_level=urgency,
        market_context=market,
    )


async def generate_agronomic_advisory(dossier_data: Any) -> ClaudeAdvisoryResult:
    """
    Takes a SyncDossier record (or schema) and utilizes Claude to generate a localized
    extension officer summary, recommended agronomic action, urgency rating, and market advice.
    """
    farmer_id = getattr(dossier_data, "farmer_id", "farmer_noor_01")
    farmer_name = getattr(dossier_data, "farmer_name", "Noor")
    crop_type = getattr(dossier_data, "crop_type", "Arabica Coffee (Bourbon)")
    offline_diag = getattr(dossier_data, "offline_diagnosis", "Suspected Leaf Rust")
    symptoms = getattr(dossier_data, "symptoms_description", "yellow spots on leaves")
    geo_lat = getattr(dossier_data, "geo_lat", 6.4521)
    geo_lon = getattr(dossier_data, "geo_lon", 38.5412)
    altitude = getattr(dossier_data, "altitude_m", 1840.0) or 1840.0

    # If Anthropic client is not configured, seamlessly return domain heuristic advisory
    if not anthropic_client:
        logger.info("Using domain agronomic heuristic engine for advisory generation.")
        return _generate_fallback_advisory(
            farmer_id=farmer_id,
            farmer_name=farmer_name,
            crop_type=crop_type,
            offline_diagnosis=offline_diag,
            symptoms=symptoms,
            altitude=altitude,
        )

    # Prepare message for Claude API
    user_prompt = f"""Incoming SyncDossier Payload:
- Farmer: {farmer_name} (ID: {farmer_id})
- Crop: {crop_type}
- Offline Edge ML Diagnosis: {offline_diag}
- Field Symptom Observation: {symptoms}
- Location: Lat {geo_lat:.4f}, Lon {geo_lon:.4f} (Ondera Highlands)
- Elevation: {altitude:.0f} meters above sea level

Analyze this field record and generate the localized JSON advisory for the District Extension Officer and farmer."""

    try:
        logger.info(f"Calling Claude model {CLAUDE_MODEL} for dossier from {farmer_id}...")
        response = await anthropic_client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=800,
            temperature=0.2,
            system=ONDERA_AGRONOMY_SYSTEM_PROMPT,
            messages=[
                {"role": "user", "content": user_prompt}
            ],
        )

        content_text = ""
        for block in response.content:
            if getattr(block, "type", "") == "text":
                content_text += block.text

        content_text = content_text.strip()
        # Remove any surrounding markdown ```json fences if Claude included them
        if content_text.startswith("```json"):
            content_text = content_text[7:]
        if content_text.startswith("```"):
            content_text = content_text[3:]
        if content_text.endswith("```"):
            content_text = content_text[:-3]
        content_text = content_text.strip()

        data = json.loads(content_text)
        return ClaudeAdvisoryResult(
            advisory_summary=data.get("advisory_summary", "Field assessment processed."),
            recommended_action=data.get("recommended_action", "Maintain regular field hygiene."),
            urgency_level=data.get("urgency_level", "MEDIUM").upper(),
            market_context=data.get("market_context", "Check with local cooperative for prevailing cherry pricing."),
        )

    except Exception as exc:
        logger.error(f"Claude API call failed: {exc}. Engaging domain agronomic fallback engine.")
        return _generate_fallback_advisory(
            farmer_id=farmer_id,
            farmer_name=farmer_name,
            crop_type=crop_type,
            offline_diagnosis=offline_diag,
            symptoms=symptoms,
            altitude=altitude,
        )
