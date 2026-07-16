# 🩸 Blood Donation Camp Platform (HealthConnect)

A premium, responsive, and robust **Blood Donation Camp Management Web Platform** built using React.js, Express, Node.js, and MongoDB. It streamlines online registrations, active donation drive campaign management, photo galleries, volunteer coordinates, and on-site donation desk verification using camera-based QR code scanning.

---

## 🚀 What the Project Has (Modules & Features)

### 1. Landing Portal & Student Registration
- **Dynamic Timeline:** Automatically fetches upcoming/active blood camps and displays them on the public landing page.
- **Online Booking Form:** Allows students to register online for any active camp. Checks for duplicate registrations (by email or roll number in the same camp) and validates phone digits, email structure, and branch/year parameters.

### 2. Admin & Volunteer Authentication
- **Secure Credentials Portal:** Fully protected login system utilizing JWT (JsonWebToken) authorization, bcryptjs password hashing, and Role-Based Access Control (RBAC).
- **Persistent State:** Manages state persistence and axios request interceptors to auto-stage bearer tokens.

### 3. Dynamic Management Dashboard
- **Campaign Analytics:** Showcases metrics: Total Camps, Active/Upcoming Drives, Total Registrations, Today's Registrations, and Total Donated units count.
- **Visual Analytics:** Integrates `recharts` to render Monthly Registrations, Branch-wise Distributions, and Donation Status splits.
- **Recent Registrations & Skeletons:** Renders live listings with loading skeletons.

### 4. Blood Camps Management
- **Camp Control Panel:** Create, read, update, or delete blood camp campaigns (Admin/Super Admin read-only; Super Admin write access).
- **Fields:** Target donors, location, date, start/end timing, and status tracking (`upcoming`, `active`, `completed`).

### 5. Gallery Module
- **Camp Albums:** Supports camp-wise photo uploads using `multer`. Features file size limits (5MB) and type validation.
- **Interactions:** Image uploads preview, album filtering, confirmation dialogs for file unlinking, and lightbox image viewer.

### 6. Donation Desk (On-Site Verification)
- **Unified Desk:** Operator-friendly desk allowing text search by Roll Number (case-insensitive exact) or Mobile Number.
- **QR Code Camera Scanner:** Real-time QR scanner powered by `html5-qrcode` to scan student badges on-site and verify enrollment instantly.
- **Duplicate Donation Prevention:** Blocks uploader status updates if a student is already marked `donated` to prevent double-logging.
- **Auto Count Recalculation:** Syncs camp actual donors count dynamically as: `(Donated registrations) + (Walk-in manual entries)`.

### 7. Manual Donor Entry
- **Walk-in Registrations:** Simple form to register walk-in donors who did not pre-register online.
- **Form Validations:** Strictly validates mobile number formats, required fields, and age constraints (18 to 65 years).
- **CRUD Registry List:** Responsive tabular records displaying name, age, gender, group, camp, and donation date, complete with pagination and edit/delete modal operations (restricted to Admins).

### 8. Volunteer Management
- **Super Admin Panel:** CRUD operations (create, edit, delete, toggle active/inactive status).
- **Coordinator Panel:** Admins can view the listing and assign volunteers to blood camps.
- **Volunteer Panel:** Logged-in volunteers see a clean dashboard showing their current assigned camp details.

---

## 🛠️ How it is Done (System Architecture & Implementation)

The platform is designed with a decoupled frontend SPA and backend REST API utilizing a modern **Model-View-Controller (MVC)** structural pattern.

### 1. Backend REST API (Node.js & Express)
- **MVC Architecture:**
  - **Models:** Built using `mongoose` schemas mapping MongoDB structures (`Admin`, `Volunteer`, `Registration`, `Donor`, `GalleryImage`, `BloodCamp`) with active data validation.
  - **Controllers:** Express controller functions managing request parameters, data queries, validations, and custom business logic.
  - **Routes:** Decoupled REST routes linking endpoints directly to controllers.
- **Security & RBAC Middleware:**
  - `protect`: Verifies JWT authenticity from authorization headers and binds active users to `req.admin`. Can verify tokens from both the `Admin` and `Volunteer` collections dynamically.
  - `authorize(...roles)`: Route guards checking authenticated roles against permission allowances (e.g. restricting volunteer creation to `Super Admin`).
- **Database Relationships:**
  - `Registration` and `Donor` link to `BloodCamp` via `campId` references.
  - `Volunteer` links to `BloodCamp` via `assignedCampId`.

### 2. Frontend Client (React & Vite)
- **Single Page Routing:** Employs nested React Router DOM routes mapping access paths to specific view wrappers according to role variables (`/super-admin/*`, `/admin/*`, `/volunteer/*`).
- **Axios HTTP Client Interceptors:**
  - **Request Interceptor:** Automatically retrieves JWT keys from `localStorage` and appends them to request headers.
  - **Response Interceptor:** Standardizes error response mapping. Intercepts `401 Unauthorized` states to automatically delete stale session tokens and log users out.
- **State Management & Skeletons:** Implements conditional rendering, React state hooks (`useState`, `useCallback`), and custom skeleton layouts to provide loading feedback.
- **Responsive Layout:** Engineered with flexible layouts and CSS grid systems utilizing unified global styling variables to adapt to mobile screens, tablets, and desktop displays.
