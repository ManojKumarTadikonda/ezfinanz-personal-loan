# EZFINANZ Personal Loan Backend

Node.js + Express + MongoDB backend implementing the personal-loan workflow from the challenge.

## Features

- Customer/admin authentication with JWT
- Email/password registration and login
- Phone OTP login/verification (simulated)
- Email verification (simulated)
- Google/OAuth-compatible demo endpoint
- KYC submission
- Loan eligibility calculation
- EMI, processing fee, GST, net disbursement and IRR calculation
- EMI tenure selection
- Bank account submission
- Declaration confirmation
- Selfie/photo upload
- Admin application dashboard
- Admin full application view
- Admin selfie approve/reject
- Admin disbursement confirmation
- Application stage/status tracking
- Role-based authorization
- Password hashing
- Helmet, CORS and rate limiting
- Multer file uploads
- Seed admin account

## Run

1. Install MongoDB locally or use MongoDB Atlas.
2. Copy `.env.example` to `.env`.
3. Change `JWT_SECRET`.
4. Install packages:

   npm install

5. Start:

   npm run dev

6. Seed admin:

   npm run seed:admin

API base URL:
http://localhost:5000/api

## Demo OTP

When `DEMO_MODE=true`, generated OTPs are printed in the server console.

## Main workflow

POST /api/auth/register
POST /api/auth/verify-email
POST /api/auth/send-phone-otp
POST /api/auth/verify-phone
POST /api/auth/login
POST /api/auth/oauth
POST /api/kyc
POST /api/loans/eligibility
POST /api/loans/calculate
POST /api/loans/select-term
POST /api/bank-accounts
POST /api/applications/declaration
POST /api/applications/selfie
GET  /api/applications/me

Admin:
GET  /api/admin/applications
GET  /api/admin/applications/:id
PATCH /api/admin/applications/:id/selfie
PATCH /api/admin/applications/:id/disbursement
