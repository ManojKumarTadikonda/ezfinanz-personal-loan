# 💳 EZFINANZ — Digital Personal Loan Origination & Approval Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5.1.0-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-v19.1.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Image%20CDN-3448C5?logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Cloud%20Messaging-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-v7.1.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

> An enterprise-grade, end-to-end digital lending platform featuring an automated 7-stage loan origination workflow, algorithmic credit underwriting, dynamic EMI/IRR calculation engines, WebRTC live selfie biometric verification, and a real-time admin portal with Firebase Cloud Messaging (FCM) web push notifications.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [7-Stage Application Lifecycle](#-7-stage-application-lifecycle)
- [Core Features](#-core-features)
- [Financial & Underwriting Algorithms](#-financial--underwriting-algorithms)
  - [1. Monthly EMI Formula](#1-monthly-emi-formula)
  - [2. Annualized IRR via Numerical Binary Search](#2-annualized-irr-via-numerical-binary-search)
  - [3. Debt-to-Income (DTI) & Credit Policy Underwriting](#3-debt-to-income-dti--credit-policy-underwriting)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
- [API Reference](#-api-reference)
- [Environment Variables](#-environment-variables)
- [Installation & Local Setup](#-installation--local-setup)
- [Default Demo Credentials](#-default-demo-credentials)
- [Security & Engineering Highlights](#-security--engineering-highlights)

---

## 🌟 Overview

**EZFINANZ** streamlines the modern retail credit lending journey by eliminating manual delays and paper-heavy workflows. It provides:
1. **For Borrowers**: A seamless, transparent, multi-step application journey with instant financial eligibility checks, interactive EMI tenure customization, real-time fee breakdown, and live webcam selfie submission.
2. **For Lenders / Admins**: A centralized dashboard to inspect customer KYC profiles, review financial ratios and bank details, inspect live biometric captures, make approve/reject decisions, and confirm disbursements with real-time push alerts.

---

## 🏛 System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer["Frontend Layer (React 19 + Vite)"]
        CustomerApp["Customer Application (/apply/*)"]
        AdminDashboard["Admin Approval Portal (/admin/*)"]
        WebRTC["WebRTC Camera & Canvas Engine"]
        FCMWorker["Firebase Messaging Service Worker"]
    end

    subgraph APILayer["Backend API Layer (Node.js / Express 5)"]
        Security["Security: Helmet + Rate Limiter + CORS"]
        JWTAuth["JWT Authentication & RBAC Middleware"]
        LoanEngine["Financial Calculation & Underwriting Engine"]
        MulterStream["Multer In-Memory Buffer Streamer"]
    end

    subgraph StorageLayer["Data & Cloud Services"]
        MongoAtlas[("MongoDB (User, KYC, Application Models)")]
        CloudinaryCDN[("Cloudinary Cloud Media CDN")]
        FirebaseAdmin[("Firebase Admin Cloud Messaging (FCM)")]
    end

    CustomerApp -->|HTTPS REST| Security
    AdminDashboard -->|HTTPS REST| Security
    Security --> JWTAuth --> LoanEngine
    JWTAuth --> MulterStream -->|Stream Buffer Upload| CloudinaryCDN
    LoanEngine -->|Mongoose ODM| MongoAtlas
    LoanEngine -->|Multicast Push| FirebaseAdmin
    FirebaseAdmin -.->|Push Notifications| FCMWorker
    WebRTC --> CustomerApp
```

---

## 🔄 7-Stage Application Lifecycle

The loan application is modeled as a state machine governed by enumerated stages in `application.constants.js`:

```mermaid
stateDiagram-v2
    [*] --> EMAIL_PHONE_VERIFICATION: User Registration
    EMAIL_PHONE_VERIFICATION --> KYC: Email Token & Phone OTP Verified
    KYC --> ELIGIBILITY: KYC & Address Saved
    ELIGIBILITY --> EMI_SELECTION: Credit Check Passed / Partially Eligible
    EMI_SELECTION --> BANK_ACCOUNT: Tenure & EMI Configured
    BANK_ACCOUNT --> DECLARATION: Bank Details Provided
    DECLARATION --> SELFIE_PENDING: Terms Accepted
    SELFIE_PENDING --> ADMIN_REVIEW: Live Selfie Uploaded to Cloudinary
    ADMIN_REVIEW --> DISBURSEMENT_PENDING: Admin Approves Selfie
    ADMIN_REVIEW --> SELFIE_REJECTED: Admin Rejects (Reason Provided)
    SELFIE_REJECTED --> SELFIE_PENDING: Applicant Retakes Selfie
    DISBURSEMENT_PENDING --> DISBURSED: Admin Confirms Disbursement
    DISBURSED --> [*]
```

| # | Stage Constant | Description | Transition Guard / Pre-condition |
|---|---|---|---|
| 1 | `EMAIL_PHONE_VERIFICATION` | Account verification via email token and 6-digit SHA-256 hashed phone OTP. | Both `emailVerified` and `phoneVerified` must be `true`. |
| 2 | `KYC` | Submits identity (PAN/Aadhaar/Passport/DL) and residential address. | Valid verification status; creates 1:1 KYC record. |
| 3 | `ELIGIBILITY` | Evaluates CIBIL credit score, income, and existing debt against lending policy. | Credit score $\ge 650$ and $\text{DTI} \le 50\%$. |
| 4 | `EMI_SELECTION` | Customizes loan amount & tenure (6, 12, 18, 24, 36 months); computes charges & IRR. | Requested amount $\le$ `maxEligibleAmount`. |
| 5 | `BANK_ACCOUNT` | Provides disbursement bank details (Account number, holder name, IFSC, bank). | All banking fields required and validated. |
| 6 | `DECLARATION` | Legal acceptance of terms, conditions, and credit check consent. | Explicit `accepted: true` boolean flag. |
| 7 | `SELFIE_PENDING` / `ADMIN_REVIEW` | Captures live webcam selfie, uploads to Cloudinary, alerts admins via FCM. | Declaration accepted; valid image buffer. |
| 8 | `DISBURSEMENT_PENDING` / `DISBURSED` | Admin approves selfie and triggers final disbursement confirmation. | Selfie must be `APPROVED` before disbursement. |

---

## ⚡ Core Features

- **🔐 Dual-Factor Authentication & RBAC**: JWT stateless auth supporting `CUSTOMER` and `ADMIN` roles, with SHA-256 OTP hashing and token expiration.
- **📊 Algorithmic Underwriting Engine**: Automatic categorization into `ELIGIBLE`, `PARTIALLY_ELIGIBLE`, or `NOT_ELIGIBLE` based on DTI and credit score.
- **🧮 Comprehensive Loan Calculator**: Instant amortization schedules computing processing fees (2%), GST (18%), net disbursements, and Internal Rate of Return (IRR).
- **📷 In-Browser WebRTC Biometric Capture**: Captures live selfies via HTML5 `MediaDevices` and `Canvas` API with custom face guides; streams directly from memory to Cloudinary (zero temp files on disk).
- **🔔 Real-Time Web Push Notifications**: Multi-cast Firebase Cloud Messaging (FCM) alerts sent to admins upon new submissions, with automatic dead-token pruning.
- **🛡️ Enterprise API Security**: Helmet HTTP headers, rate limiting on authentication routes (100 req / 15 min), and CORS whitelisting.

---

## 📐 Financial & Underwriting Algorithms

### 1. Monthly EMI Formula
Calculated using the standard reducing balance loan amortization formula:

$$\text{EMI} = \frac{P \times r \times (1 + r)^n}{(1 + r)^n - 1}$$

Where:
- $P$ = Principal loan amount
- $r$ = Monthly interest rate ($\text{Annual Rate} / 12 / 100$)
- $n$ = Tenure in months

### 2. Annualized IRR via Numerical Binary Search
Because fees and taxes reduce the upfront disbursement, the effective interest rate (IRR) is higher than the nominal rate. The cash flows are:
- Time $t = 0$: Borrower receives $\text{Net Disbursement} = P - (\text{Processing Fee} + \text{GST} + \text{Other Charges})$
- Time $t = 1 \dots n$: Borrower pays equal monthly $\text{EMI}$

We find the monthly discount rate $r_{\text{monthly}}$ where $\text{NPV} = 0$:

$$\text{NPV} = -(\text{Net Disbursement}) + \sum_{m=1}^{n} \frac{\text{EMI}}{(1 + r_{\text{monthly}})^m} = 0$$

Solved using a **100-iteration binary search** in `loanCalculator.js`:

```javascript
function calculateIRR(netDisbursement, emi, tenureMonths) {
  if (netDisbursement <= 0 || emi <= 0) return 0;
  let low = -0.99, high = 1.0;
  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2;
    let npv = -netDisbursement;
    for (let month = 1; month <= tenureMonths; month++) {
      npv += emi / Math.pow(1 + mid, month);
    }
    if (npv > 0) low = mid;
    else high = mid;
  }
  const monthlyIrr = (low + high) / 2;
  return (Math.pow(1 + monthlyIrr, 12) - 1) * 100; // Annualized IRR %
}
```

### 3. Debt-to-Income (DTI) & Credit Policy Underwriting

$$\text{DTI} = \left( \frac{\text{Current Monthly Debts}}{\text{Monthly Income}} \right) \times 100$$

- **`ELIGIBLE`**: $\text{Credit Score} \ge 750 \land \text{DTI} \le 40\% \land \text{Loan} \le 20 \times \text{Income}$ $\rightarrow$ 100% of requested amount approved.
- **`PARTIALLY_ELIGIBLE`**: $\text{Credit Score} \ge 650 \land \text{DTI} \le 50\% \land \text{Loan} \le 15 \times \text{Income}$ $\rightarrow$ Max amount capped at $15 \times \text{Income}$.
- **`NOT_ELIGIBLE`**: $\text{Credit Score} < 650 \lor \text{DTI} > 50\%$ $\rightarrow$ Application rejected.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Routing**: React Router v7 (Layout nesting, `CustomerGuard`, `AdminGuard`)
- **HTTP Client**: Axios (with Bearer token request interceptor)
- **Icons**: Lucide React
- **Notifications**: Firebase Web SDK v12 (`firebase/messaging` + Service Worker)
- **Styling**: Modern, responsive custom CSS (Zero bloated UI frameworks)

### Backend
- **Runtime**: Node.js v18+ & Express 5
- **Database ODM**: Mongoose 8 & MongoDB
- **Authentication**: JWT (`jsonwebtoken`) + `bcryptjs`
- **File Upload**: Multer (In-memory buffer)
- **Cloud Media**: Cloudinary SDK v2
- **Push Alerts**: Firebase Admin SDK v14
- **Security & Utilities**: `helmet`, `cors`, `express-rate-limit`, `morgan`, `validator`

---

## 📂 Repository Structure

```
ezfinanz-personal-loan/
├── backend/
│   ├── package.json
│   ├── firebase-service-account.json
│   └── src/
│       ├── server.js                          # Server bootstrap & DB connection
│       ├── app.js                             # Express middleware, CORS & route mounting
│       ├── config/
│       │   ├── db.js                          # MongoDB connection via Mongoose
│       │   ├── cloudinary.js                  # Cloudinary SDK credentials setup
│       │   └── firebase.js                    # Firebase Admin SDK initialization
│       ├── constants/
│       │   └── application.constants.js       # STAGES & ELIGIBILITY enums
│       ├── models/
│       │   ├── User.js                        # User, auth credentials & FCM tokens
│       │   ├── KYC.js                         # 1:1 User identity & address record
│       │   └── Application.js                 # Unified state machine & loan record
│       ├── controllers/
│       │   ├── auth.controller.js             # Register, login, OTP & email verify
│       │   ├── kyc.controller.js              # KYC submission & retrieval
│       │   ├── loan.controller.js             # Eligibility, EMI calculator & term selector
│       │   ├── bank.controller.js             # Bank account details capture
│       │   ├── application.controller.js      # Declaration, selfie upload & user status
│       │   ├── admin.controller.js            # Admin listing, review & disbursement
│       │   └── notification.controller.js     # FCM token registration & test dispatch
│       ├── middleware/
│       │   ├── auth.middleware.js             # authenticate & authorize guards
│       │   ├── error.middleware.js            # 404 & centralized error handler
│       │   └── upload.middleware.js           # Multer 5MB memory storage
│       ├── routes/                            # Modular Express router endpoints
│       ├── services/
│       │   ├── auth.service.js                # Auth business logic & hashing
│       │   └── notification.service.js        # Multicast FCM messaging & token cleanup
│       ├── utils/
│       │   ├── loanCalculator.js              # EMI & IRR mathematical formulas
│       │   ├── eligibility.js                 # Underwriting credit policy engine
│       │   ├── cloudinaryUpload.js            # Stream buffer to Cloudinary
│       │   ├── otp.js                         # Crypto OTP generator & SHA-256 hash
│       │   ├── token.js                       # JWT sign & verify utilities
│       │   └── apiResponse.js                 # Standardized JSON response envelope
│       └── seed/
│           └── admin.js                       # Initial admin account seeder
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── public/
    │   └── firebase-messaging-sw.js           # Background push notification handler
    └── src/
        ├── main.jsx                           # React root mounting
        ├── App.jsx                            # Main routing, layouts, and page components
        ├── styles.css                         # Custom responsive styles
        ├── lib/
        │   └── api.js                         # Axios client with JWT interceptor
        ├── hooks/
        │   └── useNotifications.js            # Web push permission & foreground listener
        └── firebase/
            └── firebase.js                    # Firebase Web app & messaging setup
```

---

## 📡 API Reference

### 1. Authentication & Verification (`/api/auth`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register customer with email/phone/password. |
| `POST` | `/api/auth/login` | Public | Sign in and receive JWT token. |
| `POST` | `/api/auth/verify-email` | User | Verify email with generated token. |
| `POST` | `/api/auth/send-phone-otp` | User | Dispatch 6-digit phone verification OTP. |
| `POST` | `/api/auth/verify-phone` | User | Verify phone OTP against stored SHA-256 hash. |
| `GET`  | `/api/auth/me` | User | Get current authenticated user profile. |

### 2. KYC & Financial Assessment (`/api/kyc`, `/api/loans`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/kyc` | Customer | Submit identity details, address, and optional ID doc. |
| `GET`  | `/api/kyc/me` | Customer | Retrieve submitted KYC details. |
| `POST` | `/api/loans/eligibility` | Customer | Calculate DTI and determine credit underwriting status. |
| `POST` | `/api/loans/calculate` | Customer | Real-time calculation of EMI, fees, GST, and IRR. |
| `POST` | `/api/loans/select-term` | Customer | Lock selected loan amount and tenure. |

### 3. Banking, Declaration & Biometric Selfie (`/api/bank-accounts`, `/api/applications`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/bank-accounts` | Customer | Save disbursement bank account and IFSC. |
| `POST` | `/api/applications/declaration` | Customer | Accept terms and legal borrower declaration. |
| `POST` | `/api/applications/selfie` | Customer | Upload live captured webcam selfie to Cloudinary. |
| `GET`  | `/api/applications/me` | Customer | Get full application snapshot and stage status. |

### 4. Admin Management & Push Alerts (`/api/admin`, `/api/notifications`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET`   | `/api/admin/applications` | Admin | List all applications with pagination and stage filter. |
| `GET`   | `/api/admin/applications/:id` | Admin | Retrieve complete 360° application dossier. |
| `PATCH` | `/api/admin/applications/:id/selfie` | Admin | Approve or Reject selfie (with mandatory reason). |
| `PATCH` | `/api/admin/applications/:id/disbursement` | Admin | Confirm final loan disbursement. |
| `POST`  | `/api/notifications/token` | Admin | Register browser FCM push token. |
| `DELETE`| `/api/notifications/token` | Admin | Unregister FCM push token. |

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```ini
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ezfinanz
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
DEMO_MODE=true
OTP_EXPIRES_MINUTES=10

# Cloudinary Media Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Firebase Admin Push Notifications
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Admin Initializer
ADMIN_EMAIL=admin@ezfinanz.com
ADMIN_PASSWORD=Admin@123
```

### Frontend (`frontend/.env`)
```ini
VITE_API_BASE_URL=http://localhost:5000/api

# Firebase Web Push Config
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_VAPID_KEY=your_public_vapid_key
```

---

## 🚀 Installation & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- [MongoDB](https://www.mongodb.com/) running locally or a MongoDB Atlas URI
- Cloudinary Account & Firebase Project (for image storage & push alerts)

### Step 1: Clone Repository
```bash
git clone https://github.com/ManojKumarTadikonda/ezfinanz-personal-loan.git
cd ezfinanz-personal-loan
```

### Step 2: Configure & Start Backend
```bash
cd backend
npm install

# Seed initial admin user
npm run seed:admin

# Start backend server in development mode
npm run dev
```
Backend will start on `http://localhost:5000`.

### Step 3: Configure & Start Frontend
```bash
cd ../frontend
npm install

# Start Vite development server
npm run dev
```
Frontend will be accessible at `http://localhost:5173`.

---

## 🔑 Default Demo Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin@ezfinanz.com` | `Admin@123` | Full dashboard, approvals & disbursement |
| **Customer** | *(Self-register on `/register`)* | *(Configured on sign-up)* | Customer application flow |

> **Tip for Testing**: With `DEMO_MODE=true`, all generated email verification tokens and phone OTPs are printed directly in the backend terminal console and returned in response payloads for friction-free testing.

---

## 🔒 Security & Engineering Highlights

1. **Stateless Media Streaming**: Selfies are read into memory using Multer memory storage and immediately piped via stream to Cloudinary CDN, ensuring zero customer biometric images persist unencrypted on server storage.
2. **Zero-Plaintext OTP Storage**: OTPs are hashed using cryptographic SHA-256 before saving to the database. Incoming OTP submissions are hashed and compared to prevent credential leakage.
3. **Resilient Web Push Pipeline**: The Firebase multicast dispatcher automatically intercepts invalid/expired token codes (`messaging/registration-token-not-registered`) and prunes them from the database to keep delivery latency low.
4. **Hardened API**: Protected against denial-of-service and brute force via `express-rate-limit` (100 req/15 min on auth routes) and HTTP header hardening via `helmet`.

