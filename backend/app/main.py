from fastapi import FastAPI
from app.database import Base, engine
from app.auth import router as auth_router

Base.metadata.create_all(engine)

app = FastAPI(
    title="InternMatch API",
    description="Backend API for InternMatch",
    version="1.0.0",
)

app.include_router(auth_router)


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok"}
