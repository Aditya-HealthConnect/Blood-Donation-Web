import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { sidebarMenus, topNavLinks } from '../config/menuConfig.jsx'
import logo from '../assets/logo.png'
import './DashboardLayout.css'

function getStoredAdmin() {
  const stored = localStorage.getItem('admin')
  if (!stored) return null

  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [admin] = useState(getStoredAdmin)

  useEffect(() => {
    if (!admin) {
      navigate('/admin/login', { replace: true })
    }
  }, [admin, navigate])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    const closeTimer = setTimeout(() => {
      setSidebarOpen(false)
    }, 0)

    return () => clearTimeout(closeTimer)
  }, [location.pathname])

  // Close sidebar on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('admin')
    toast.success('Logged out successfully', {
      duration: 2000,
      style: {
        borderRadius: '10px',
        background: '#1C1E21',
        color: '#FCFCFC',
      },
    })
    navigate('/admin/login', { replace: true })
  }

  if (!admin) return null

  const role = admin.role
  const menus = sidebarMenus[role] || []

  // Determine base path for top nav links
  const roleBase = {
    'Super Admin': '/super-admin',
    'Admin': '/admin',
    'Volunteer': '/volunteer',
  }
  const basePath = roleBase[role] || '/admin'

  // Get user initials
  const initials = admin.name
    ? admin.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD'

  // Role badge class
  const roleBadgeClass = role === 'Super Admin'
    ? 'role-super-admin'
    : role === 'Admin'
      ? 'role-admin'
      : 'role-volunteer'

  return (
    <div className="dashboard-layout">
      {/* Sidebar Overlay (mobile) */}
      <div
        className={`sidebar-overlay${sidebarOpen ? ' visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <img src={logo} alt="Logo" className="sidebar-logo" />
          <div className="sidebar-brand">
            Blood Donation
            <small>Management System</small>
          </div>
          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="sidebar-nav">
          {menus.map((group) => (
            <div className="sidebar-section" key={group.section}>
              <div className="sidebar-section-label">{group.section}</div>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-link${isActive ? ' active' : ''}`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
            © {new Date().getFullYear()} Blood Donation Platform
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="dashboard-main">
        {/* Top Navbar */}
        <header className="dashboard-navbar">
          <div className="navbar-left">
            {/* Hamburger toggle (mobile) */}
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            {/* Top Nav Links */}
            <nav className="navbar-links">
              {topNavLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={`${basePath}/${link.path}`}
                  className={({ isActive }) =>
                    `navbar-link${isActive ? ' active' : ''}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="navbar-right">
            {/* User Info */}
            <div className="navbar-user">
              <div className="navbar-avatar">{initials}</div>
              <div className="navbar-user-info">
                <span className="navbar-user-name">{admin.name}</span>
                <span className={`navbar-role-badge ${roleBadgeClass}`}>
                  {role}
                </span>
              </div>
            </div>

            {/* Logout */}
            <button className="navbar-logout" onClick={handleLogout} id="logout-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content via nested routes */}
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
