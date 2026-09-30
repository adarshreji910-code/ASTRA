from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routers import solar_system, events, sky, activity, assistant

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend ephemeris and data aggregation service for the SPACEVERSE platform."
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(solar_system.router, prefix=settings.API_PREFIX)
app.include_router(events.router, prefix=settings.API_PREFIX)
app.include_router(sky.router, prefix=settings.API_PREFIX)
app.include_router(activity.router, prefix=settings.API_PREFIX)
app.include_router(assistant.router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "platform": "SPACEVERSE",
        "tagline": "Look up. Something is always happening.",
        "version": settings.VERSION,
        "status": "Operational",
        "endpoints": {
            "solar_system_current": f"{settings.API_PREFIX}/solar-system/current",
            "upcoming_events": f"{settings.API_PREFIX}/events/upcoming",
            "sky_tonight": f"{settings.API_PREFIX}/sky/tonight",
            "space_weather": f"{settings.API_PREFIX}/space-weather",
            "news": f"{settings.API_PREFIX}/news/latest",
            "missions": f"{settings.API_PREFIX}/missions",
            "asteroids": f"{settings.API_PREFIX}/asteroids/near-earth",
            "iss": f"{settings.API_PREFIX}/iss/current"
        }
    }

@app.get("/health")
def healthcheck():
    return {"status": "healthy"}
