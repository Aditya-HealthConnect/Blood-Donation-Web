# 🩸 Blood Donation Camp Platform (HealthConnect)

A premium, responsive, and robust **Blood Donation Camp Management Web Platform** built using React.js, Express, Node.js, and MongoDB. It streamlines online registrations, active donation drive campaign management, photo galleries, volunteer coordinates, and on-site donation desk verification using camera-based QR code scanning.

---

## 🚀 Key Modules & Features

### 1. Landing Portal & Student Registration
- **Dynamic Timeline:** Automatically fetches upcoming/active blood camps and displays them on the public landing page.
- **Online Booking Form:** Allows students to register online for any active camp. Checks for duplicate registrations (by email or roll number in the same camp) and validates phone digits, email structure, and branch/year parameters.

### 2. Admin & Volunteer Authentication
- **Secure Credentials Portal:** Fully protected login system utilizing JWT (JsonWebToken) authorization, bcryptjs password hashing, and Role-Based Access Control (RBAC).
- **Persistent State:** Manages state persistence and axios request interceptors to auto-attach bearer tokens.

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

## 🎨 UI Design System & Global Styles

To ensure a consistent user interface across the entire application, all developers must strictly follow this design system. 

**⚠️ Team Rule:** Never use hardcoded hex colors (e.g., `#D32F2F`) or random fonts in your local component CSS. Always use the global CSS variables defined below.

### 1. Color Palette Reference

| Color Role | CSS Variable | Hex Code | Usage |
| :--- | :--- | :--- | :--- |
| **Primary Red** | `var(--primary-red)` | `#D32F2F` | Main buttons, active links, primary icons |
| **Primary Hover** | `var(--primary-hover)`| `#B71C1C` | Button hover states |
| **Deep Crimson**| `var(--deep-crimson)`| `#8E1616` | Footers, bold emphasis text, hero overlays |
| **Main Bg** | `var(--bg-main)` | `#141619` | Main dark theme background |
| **Surface Bg** | `var(--bg-surface)` | `#1B1E22` | Card, modal, and dropdown backgrounds |
| **Neutral Bg** | `var(--bg-neutral)` | `#23272C` | Secondary backgrounds, table headers |
| **Main Text** | `var(--text-main)` | `#ECEEF0` | Primary headings and body text |
| **Muted Text** | `var(--text-muted)` | `#8B949E` | Subtitles, placeholders, secondary info |
| **Border** | `var(--border-color)` | `#2F353C` | Dividers, input borders, card borders |

### 2. Typography

*   **Global Font Family:** Poppins, sans-serif 
*   **CSS Variable:** `var(--font-main)`

### 3. Usage Example

When styling your individual React components, always reference the variables from the `index.css` file. 

```css
/* ✅ Correct Way */
.my-custom-card {
  background-color: var(--bg-surface);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  font-family: var(--font-main);
}

.my-custom-card h2 {
  color: var(--primary-red);
}
```

---

## 🛠️ Setup & Execution

### 1. Environment Configurations

Create a `.env` file inside the `bd_backend` directory:
```env
PORT=5050
MONGODB_URI=mongodb+srv://BloodDonationCamp:admin123@cluster0.luujrrb.mongodb.net/
JWT_SECRET=supersecretjwtkey12345!
JWT_EXPIRES_IN=7d
```

Create a `.env` file inside the `bd_frontend` directory:
```env
VITE_API_BASE_URL=http://localhost:5050
```

### 2. Running Backend Server
```bash
cd bd_backend
npm install
node seedDashboard.js  # Seeds database with camps, admins, and registrations
npm run dev            # Starts REST API server on localhost:5050
```

### 3. Running Frontend Web App
```bash
cd bd_frontend
npm install
npm run dev            # Starts Vite development server on localhost:5173
```
