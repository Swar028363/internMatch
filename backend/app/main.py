from fastapi import FastAPI

from app.database.session import Base, engine
from app.api.auth import router as auth_router
from app.api.users import router as user_router
from app.api.applicant_profile import router as applicant_profile_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="InternMatch API",
    version="1.0.0",
)

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(applicant_profile_router)


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok"}
