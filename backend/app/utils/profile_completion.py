from app.models.applicant_profile import ApplicantProfile

PROFILE_COMPLETION_FIELDS = (
    "first_name",
    "last_name",
    "dob",
    "gender",
    "city",
    "state",
    "country",
    "phone",
    "education_level",
    "degree_name",
    "college_name",
    "university_name",
    "graduation_year",
    "gpa",
    "skills",
    "headline",
    "bio",
    "languages_spoken",
    "hobbies",
    "portfolio_url",
    "github_url",
    "linkedin_url",
    "personal_website",
)


def calculate_profile_completion(profile: ApplicantProfile) -> tuple[int, bool]:
    total = len(PROFILE_COMPLETION_FIELDS)
    filled = 0

    for field in PROFILE_COMPLETION_FIELDS:
        value = getattr(profile, field)

        if value is None:
            continue

        if isinstance(value, str) and not value.strip():
            continue

        if isinstance(value, list) and len(value) == 0:
            continue

        filled += 1

    percentage = int((filled / total) * 100)
    completed = percentage == 100

    return percentage, completed
