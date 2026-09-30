import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "SPACEVERSE API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    NASA_API_KEY: str = os.getenv("NASA_API_KEY", "DEMO_KEY")
    CACHE_TTL_SECONDS: int = 3600  # 1 hour default
    EPHEMERIS_CACHE_TTL: int = 300  # 5 minutes for dynamic time positions
    
settings = Settings()
