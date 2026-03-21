from fastapi import FastAPI

from app.api.auth import router as auth_router
from app.api.users import router as user_router
from app.api.applicant_profile import router as applicant_profile_router
from app.api.recruiter_profile import router as recruiter_profile_router
from app.api.company import router as company_router


def create_app() -> FastAPI:
    """
    Application factory.
    Keeps startup clean and testable.
    """
    app = FastAPI(
        title="InternMatch API",
        version="1.0.0",
        description="Backend API for the InternMatch platform",
    )

    app.include_router(auth_router)
    app.include_router(user_router)
    app.include_router(applicant_profile_router)
    app.include_router(recruiter_profile_router)
    app.include_router(company_router)

    @app.get("/", tags=["Health"])
    def health_check() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
