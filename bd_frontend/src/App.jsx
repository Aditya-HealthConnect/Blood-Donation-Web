import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import DashboardLayout from './components/DashboardLayout.jsx'
import SuperAdminDashboard from './pages/SuperAdminDashboard.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import VolunteerDashboard from './pages/VolunteerDashboard.jsx'
import AdminManagement from './pages/AdminManagement.jsx'
import VolunteerManagement from './pages/VolunteerManagement.jsx'
import RegistrationManagement from './pages/RegistrationManagement.jsx'
import Gallery from './pages/Gallery.jsx'
import DonationDesk from './pages/DonationDesk.jsx'
import ManualDonorEntry from './pages/ManualDonorEntry.jsx'
import DonorList from './pages/DonorList.jsx'
import BloodCamps from './pages/BloodCamps.jsx'
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
        <Route path="blood-camps" element={<BloodCamps />} />
        <Route path="registrations" element={<RegistrationManagement />} />
        <Route path="donors" element={<DonorList />} />
        <Route path="analytics" element={<PlaceholderPage />} />
        <Route path="admin-management" element={<AdminManagement />} />
        <Route path="volunteer-management" element={<VolunteerManagement />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="donation-desk" element={<DonationDesk />} />
        <Route path="manual-donor-entry" element={<ManualDonorEntry />} />
      </Route>

      {/* Admin — nested under DashboardLayout */}
      <Route path="/admin" element={<DashboardLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="blood-camps" element={<BloodCamps />} />
        <Route path="registrations" element={<RegistrationManagement />} />
        <Route path="donors" element={<DonorList />} />
        <Route path="analytics" element={<PlaceholderPage />} />
        <Route path="volunteer-management" element={<VolunteerManagement />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="donation-desk" element={<DonationDesk />} />
        <Route path="manual-donor-entry" element={<ManualDonorEntry />} />
      </Route>

      {/* Volunteer — nested under DashboardLayout */}
      <Route path="/volunteer" element={<DashboardLayout />}>
        <Route path="dashboard" element={<VolunteerDashboard />} />
        <Route path="qr-scanner" element={<DonationDesk />} />
        <Route path="attendance" element={<PlaceholderPage />} />
        <Route path="donation-status" element={<PlaceholderPage />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="registrations" element={<RegistrationManagement />} />
        <Route path="donation-desk" element={<DonationDesk />} />
        <Route path="manual-donor-entry" element={<ManualDonorEntry />} />
        <Route path="volunteer-management" element={<PlaceholderPage />} />
      </Route>
    </Routes>
  )
}

export default App
