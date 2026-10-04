import asyncio
import uuid
from datetime import datetime, timezone, timedelta
from database import AsyncSessionLocal, init_db
from models import SyncDossier

SAMPLE_DOSSIERS = [
    {
        "id": "ondera-noor-demo-01",
        "farmer_id": "farmer_noor_01",
        "farmer_name": "Noor",
        "crop_type": "Arabica Coffee (Bourbon)",
        "offline_diagnosis": "Yellow spots on leaves - suspected Coffee Leaf Rust (Hemileia vastatrix) (Confidence: 91%)",
        "symptoms_description": "Yellow powdery circular lesions on lower leaf surfaces. Premature leaf shedding observed after heavy rains.",
        "geo_lat": 6.4521,
        "geo_lon": 38.5412,
        "altitude_m": 1840.0,
        "advisory_summary": "Active Hemileia vastatrix (Coffee Leaf Rust) hotspot detected in Sector 4 Ondera ridge. High relative humidity (88%) is accelerating fungal sporulation down-slope.",
        "recommended_action": "1. Strip and bury severely sporulating lower foliage.\n2. Apply copper hydroxide (2.5 g/L) preventative barrier spray before evening rain.\n3. Thin canopy shade trees to increase airflow.\n4. Avoid nitrogen over-fertilization until rust cycle subsides.",
        "urgency_level": "HIGH",
        "market_context": "Ondera Cooperative current parchment benchmark: $3.85/kg. Immediate intervention preserves cherry volume for prime grade 1 export delivery.",
        "status": "PROCESSED",
    },
    {
        "id": "ondera-abera-demo-02",
        "farmer_id": "farmer_abera_02",
        "farmer_name": "Abera",
        "crop_type": "Arabica Coffee (SL28)",
        "offline_diagnosis": "Dark sunken necrotic lesions on green berries - Coffee Berry Disease (Colletotrichum kahawae)",
        "symptoms_description": "Green cherries turning black and dropping prematurely. Brown lesions expanding into bean cavity.",
        "geo_lat": 6.4498,
        "geo_lon": 38.5390,
        "altitude_m": 1890.0,
        "advisory_summary": "CRITICAL: Coffee Berry Disease (CBD) confirmed on SL28 stand. Extreme cold wet micro-climate at 1,890m elevation fosters aggressive Colletotrichum pathogen spread.",
        "recommended_action": "1. Hand-strip all blackened or spotted cherries immediately into sealed buckets to prevent fungal spore drop.\n2. Apply protective copper bio-fungicide within 24 hours.\n3. Create 50m quarantine perimeter around affected trees.",
        "urgency_level": "CRITICAL",
        "market_context": "Severe yield destruction risk: CBD reduces export classification to buni reject grade, cutting farmer revenue by 60%.",
        "status": "ESCALATED",
    },
    {
        "id": "ondera-chaltu-demo-03",
        "farmer_id": "farmer_chaltu_03",
        "farmer_name": "Chaltu",
        "crop_type": "Arabica Coffee (Ruiru 11)",
        "offline_diagnosis": "Interveinal chlorosis on new flushes - Zinc and Magnesium Deficiency",
        "symptoms_description": "Small leaves with rosette appearance, yellowing between dark green veins, no fungal pustules detected.",
        "geo_lat": 6.4550,
        "geo_lon": 38.5445,
        "altitude_m": 1810.0,
        "advisory_summary": "Nutritional imbalance caused by high soil acidity and leaching. Fungal pathogens ruled out by edge model analysis.",
        "recommended_action": "1. Apply foliar zinc sulfate (0.5%) combined with magnesium sulfate in early morning.\n2. Broadcast 2kg well-composted organic pulp and volcanic ash per tree canopy ring.\n3. Apply agricultural lime (calcium carbonate) at onset of short rains.",
        "urgency_level": "MEDIUM",
        "market_context": "Correcting micronutrient stress will improve cherry density and increase bean screen size to AA export grade.",
        "status": "PROCESSED",
    },
]


async def seed():
    print("Initializing database tables...")
    await init_db()

    print("Seeding initial Ondera Highlands dossiers...")
    async with AsyncSessionLocal() as session:
        now = datetime.now(timezone.utc)
        for i, item in enumerate(SAMPLE_DOSSIERS):
            recorded_time = now - timedelta(hours=(i * 3 + 1))
            synced_time = now - timedelta(hours=(i * 2))

            dossier = SyncDossier(
                id=item["id"],
                farmer_id=item["farmer_id"],
                farmer_name=item["farmer_name"],
                crop_type=item["crop_type"],
                offline_diagnosis=item["offline_diagnosis"],
                symptoms_description=item["symptoms_description"],
                geo_lat=item["geo_lat"],
                geo_lon=item["geo_lon"],
                altitude_m=item["altitude_m"],
                client_recorded_at=recorded_time,
                synced_at=synced_time,
                advisory_summary=item["advisory_summary"],
                recommended_action=item["recommended_action"],
                urgency_level=item["urgency_level"],
                market_context=item["market_context"],
                status=item["status"],
            )
            session.add(dossier)

        try:
            await session.commit()
            print(f"Successfully seeded {len(SAMPLE_DOSSIERS)} sample dossiers into PostgreSQL.")
        except Exception as e:
            await session.rollback()
            print(f"Seed note (items may already exist): {e}")


if __name__ == "__main__":
    asyncio.run(seed())
