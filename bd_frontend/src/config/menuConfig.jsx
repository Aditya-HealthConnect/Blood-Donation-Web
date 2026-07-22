/**
 * Sidebar menu configuration per role.
 * Each item: { label, path, icon (SVG JSX) }
 * Grouped by sections.
 */

const DashboardIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
)

const CampIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const RegistrationIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
)

const DonorIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const AnalyticsIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

const AdminMgmtIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const VolunteerMgmtIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const QrScannerIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <line x1="1" y1="12" x2="23" y2="12" />
  </svg>
)

const AttendanceIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const DonationStatusIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
)

const GalleryIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
)

export const sidebarMenus = {
  'Super Admin': [
    {
      section: 'Main',
      items: [
        { label: 'Dashboard', path: '/super-admin/dashboard', icon: DashboardIcon },
        { label: 'Blood Camps', path: '/super-admin/blood-camps', icon: CampIcon },
        { label: 'Registrations', path: '/super-admin/registrations', icon: RegistrationIcon },
        { label: 'Donors', path: '/super-admin/donors', icon: DonorIcon },
        { label: 'Analytics', path: '/super-admin/analytics', icon: AnalyticsIcon },
        { label: 'Gallery', path: '/super-admin/gallery', icon: GalleryIcon },
      ],
    },
    {
      section: 'Management',
      items: [
        { label: 'Admin Management', path: '/super-admin/admin-management', icon: AdminMgmtIcon },
        { label: 'Volunteer Management', path: '/super-admin/volunteer-management', icon: VolunteerMgmtIcon },
      ],
    },
  ],
  'Admin': [
    {
      section: 'Main',
      items: [
        { label: 'Dashboard', path: '/admin/dashboard', icon: DashboardIcon },
        { label: 'Blood Camps', path: '/admin/blood-camps', icon: CampIcon },
        { label: 'Registrations', path: '/admin/registrations', icon: RegistrationIcon },
        { label: 'Donors', path: '/admin/donors', icon: DonorIcon },
        { label: 'Analytics', path: '/admin/analytics', icon: AnalyticsIcon },
        { label: 'Gallery', path: '/admin/gallery', icon: GalleryIcon },
      ],
    },
    {
      section: 'Management',
      items: [
        { label: 'Volunteer Management', path: '/admin/volunteer-management', icon: VolunteerMgmtIcon },
      ],
    },
  ],
  'Volunteer': [
    {
      section: 'Main',
      items: [
        { label: 'Dashboard', path: '/volunteer/dashboard', icon: DashboardIcon },
        { label: 'QR Scanner', path: '/volunteer/qr-scanner', icon: QrScannerIcon },
        { label: 'Attendance', path: '/volunteer/attendance', icon: AttendanceIcon },
        { label: 'Donation Status', path: '/volunteer/donation-status', icon: DonationStatusIcon },
      ],
    },
  ],
}

export const topNavLinks = [
  { label: 'Dashboard', path: 'dashboard' },
  { label: 'Registration', path: 'registrations' },
  { label: 'Gallery', path: 'gallery' },
  { label: 'Donation Desk', path: 'donation-desk' },
  { label: 'Manual Donor Entry', path: 'manual-donor-entry' },
  { label: 'Volunteers', path: 'volunteer-management' },
]
