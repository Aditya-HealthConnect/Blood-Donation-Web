import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import DashboardLayout from './components/DashboardLayout.jsx'
import SuperAdminDashboard from './pages/SuperAdminDashboard.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import VolunteerDashboard from './pages/VolunteerDashboard.jsx'
import AdminManagement from './pages/AdminManagement.jsx'
import VolunteerManagement from './pages/VolunteerManagement.jsx'
import PlaceholderPage from './pages/PlaceholderPage.jsx'
import './App.css'

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Super Admin — nested under DashboardLayout */}
      <Route path="/super-admin" element={<DashboardLayout />}>
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="blood-camps" element={<PlaceholderPage />} />
        <Route path="registrations" element={<PlaceholderPage />} />
        <Route path="donors" element={<PlaceholderPage />} />
        <Route path="analytics" element={<PlaceholderPage />} />
        <Route path="admin-management" element={<AdminManagement />} />
        <Route path="volunteer-management" element={<VolunteerManagement />} />
        <Route path="gallery" element={<PlaceholderPage />} />
        <Route path="donation-desk" element={<PlaceholderPage />} />
        <Route path="manual-donor-entry" element={<PlaceholderPage />} />
      </Route>

      {/* Admin — nested under DashboardLayout */}
      <Route path="/admin" element={<DashboardLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="blood-camps" element={<PlaceholderPage />} />
        <Route path="registrations" element={<PlaceholderPage />} />
        <Route path="donors" element={<PlaceholderPage />} />
        <Route path="analytics" element={<PlaceholderPage />} />
        <Route path="volunteer-management" element={<VolunteerManagement />} />
        <Route path="gallery" element={<PlaceholderPage />} />
        <Route path="donation-desk" element={<PlaceholderPage />} />
        <Route path="manual-donor-entry" element={<PlaceholderPage />} />
      </Route>

      {/* Volunteer — nested under DashboardLayout */}
      <Route path="/volunteer" element={<DashboardLayout />}>
        <Route path="dashboard" element={<VolunteerDashboard />} />
        <Route path="qr-scanner" element={<PlaceholderPage />} />
        <Route path="attendance" element={<PlaceholderPage />} />
        <Route path="donation-status" element={<PlaceholderPage />} />
        <Route path="gallery" element={<PlaceholderPage />} />
        <Route path="registrations" element={<PlaceholderPage />} />
        <Route path="donation-desk" element={<PlaceholderPage />} />
        <Route path="manual-donor-entry" element={<PlaceholderPage />} />
        <Route path="volunteer-management" element={<PlaceholderPage />} />
      </Route>
    </Routes>
  )
}

export default App
