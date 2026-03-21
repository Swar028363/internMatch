from app.database.session import Base, engine

# Import ALL models so SQLAlchemy knows about them
from app.models.user import User
from app.models.applicant_profile import ApplicantProfile
from app.models.recruiter_profile import RecruiterProfile
from app.models.company import Company

print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Done.")
