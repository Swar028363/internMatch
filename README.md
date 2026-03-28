# InternMatch

A skill-based internship matching platform connecting students with companies based on actual skills.

## Tech Stack

**Backend** — FastAPI, SQLAlchemy, SQLite (dev) / PostgreSQL (prod), PyJWT (EdDSA), Passlib (Argon2), Resend (email)

**Frontend** — React, TypeScript, Vite, Tailwind CSS, React Router

---

## Project Structure

```
internmatch/
├── backend/
│   ├── app/
│   │   ├── api/          # Route handlers
│   │   ├── core/         # Config, security (JWT, hashing)
│   │   ├── database/     # SQLAlchemy session
│   │   ├── models/       # Database models
│   │   ├── schemas/      # Pydantic request/response schemas
│   │   └── utils/        # OTP, email, pending store
│   ├── create_tables.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/   # Navbar, Footer, DefaultAvatar
    │   ├── context/      # AuthContext, useAuth
    │   ├── pages/        # All page components
    │   ├── services/     # API client and service modules
    │   └── utils/        # ProtectedRoute
    └── .env.example
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- A Gmail and App Password to send OTP

### Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and fill in RESEND_API_KEY and any other values

# Generate JWT key pair (EdDSA / Ed25519)
python -c "
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.hazmat.primitives.serialization import (
    Encoding, PrivateFormat, PublicFormat, NoEncryption
)
key = Ed25519PrivateKey.generate()
open('jwt_private.key', 'wb').write(
    key.private_bytes(Encoding.PEM, PrivateFormat.PKCS8, NoEncryption())
)
open('jwt_public.key', 'wb').write(
    key.public_key().public_bytes(Encoding.PEM, PublicFormat.SubjectPublicKeyInfo)
)
print('Keys generated.')
"

# Create database tables
python create_tables.py

# Start the development server
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# .env already contains VITE_API_URL=http://localhost:8000 for local dev

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | No | SQLite in project root | SQLAlchemy connection string |
| `ALLOWED_ORIGINS` | No | `http://localhost:5173` | Comma-separated list of allowed frontend origins |
| `GMAIL_USER` | Yes | example@gmail.com | Google account mail |
| `GMAIL_APP_PASS` | Yes | - | App password from google account |
| `UPLOAD_DIR` | No | `./uploads` | Directory for uploaded resume files |
| `JWT_EXPIRE_SECONDS` | No | `3600` | Access token lifetime in seconds |
| `OTP_EXPIRY_SECONDS` | No | `600` | How long the Otp is Valid in seconds |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No | `http://localhost:8000` | Backend API base URL |

---

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | None | Step 1 of registration - sends OTP |
| POST | `/auth/verify-otp` | None | Step 2 - verifies OTP and creates account |
| POST | `/auth/resend-otp` | None | Resend OTP for registration or password reset |
| POST | `/auth/login` | None | Login, returns JWT |
| POST | `/auth/forgot-password` | None | Send password reset OTP |
| POST | `/auth/reset-password` | None | Verify OTP and set new password |
| GET | `/users/me` | JWT | Get current user info |
| GET/PUT | `/applicant/profile` | JWT (applicant) | Get or update own profile |
| GET | `/applicant/profile/{user_id}` | JWT (recruiter) | View an applicant's profile |
| GET/PUT | `/recruiter/profile` | JWT (recruiter) | Get or update own profile |
| GET/POST/PUT | `/company` | JWT (recruiter) | Manage company profile |
| GET | `/internships` | None | List active internships with filters |
| GET | `/internships/mine` | JWT (recruiter) | List own postings |
| GET | `/internships/{id}` | None | Get a single internship |
| POST | `/internships` | JWT (recruiter) | Create internship |
| PUT | `/internships/{id}` | JWT (recruiter) | Update internship |
| DELETE | `/internships/{id}` | JWT (recruiter) | Soft-delete internship |
| POST | `/applications` | JWT (applicant) | Apply for an internship |
| GET | `/applications/mine` | JWT (applicant) | List own applications |
| GET | `/applications/internship/{id}` | JWT (recruiter) | List applicants for a posting |
| GET | `/applications/{id}` | JWT | Get single application |
| PATCH | `/applications/{id}/status` | JWT | Update status (accept/reject/withdraw) |
| POST | `/applications/{id}/resume` | JWT (applicant) | Upload resume file |
| POST | `/contact` | None | Submit a contact message |


---

## License

MIT