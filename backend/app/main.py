# app/main.py

from fastapi import FastAPI
from app.database import Base, engine
from app.auth import router as auth_router
from app.user import router as user_router

Base.metadata.create_all(engine)

app = FastAPI(
    title="InternMatch API",
    version="1.0.0",
)

app.include_router(auth_router)
app.include_router(user_router)


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok"}
