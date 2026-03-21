from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import ALLOWED_ORIGINS, UPLOAD_DIR
from app.api.auth import router as auth_router
from app.api.users import router as user_router
from app.api.applicant_profile import router as applicant_profile_router
from app.api.recruiter_profile import router as recruiter_profile_router
from app.api.company import router as company_router
from app.api.internship import router as internship_router
from app.api.application import router as application_router
from app.api.contact import router as contact_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="InternMatch API",
        version="1.0.0",
        description="Backend API for the InternMatch platform",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

    app.include_router(auth_router)
    app.include_router(user_router)
    app.include_router(applicant_profile_router)
    app.include_router(recruiter_profile_router)
    app.include_router(company_router)
    app.include_router(internship_router)
    app.include_router(application_router)
    app.include_router(contact_router)

    @app.get("/", tags=["Health"])
    def health_check() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()