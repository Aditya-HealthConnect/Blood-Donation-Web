import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../config/api'
import logo from '../assets/logo.png'
import './AdminLogin.css'

function AdminLogin() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password')
      return
    }

    setIsLoading(true)

    try {
      const response = await api.post('/api/admin/login', {
        email: formData.email,
        password: formData.password,
      })

      const { token, admin } = response.data

      // Store token and admin data
      localStorage.setItem('token', token)
      localStorage.setItem('admin', JSON.stringify(admin))

      toast.success(`Welcome back, ${admin.name}!`, {
        duration: 3000,
        style: {
          borderRadius: '10px',
          background: '#1C1E21',
          color: '#FCFCFC',
        },
      })

      // Redirect based on role
      const roleRoutes = {
        'Super Admin': '/super-admin/dashboard',
        'Admin': '/admin/dashboard',
        'Volunteer': '/volunteer/dashboard',
      }

      const redirectPath = roleRoutes[admin.role] || '/admin/dashboard'

      setTimeout(() => {
        navigate(redirectPath, { replace: true })
      }, 500)
    } catch (err) {
      const message =
        err.response?.data?.message || 'Something went wrong. Please try again.'

      setError(message)
      toast.error(message, {
        duration: 4000,
        style: {
          borderRadius: '10px',
          background: '#1C1E21',
          color: '#FCFCFC',
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Back to Home */}
        <a
          href="/"
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textDecoration: 'none',
            padding: '6px 10px',
            borderRadius: '6px',
            transition: 'color 0.15s ease, background 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-main)'
            e.currentTarget.style.background = 'var(--bg-neutral)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Home
        </a>

        {/* Header */}
        <div className="login-header">
          <img src={logo} alt="Blood Donation Platform" className="login-logo" />
          <h1 className="login-title">Blood Donation Platform</h1>
          <p className="login-subtitle">Admin Portal</p>
          <hr className="login-divider" />
        </div>

        {/* Error Banner */}
        {error && (
          <div className="login-error" role="alert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Email Address
            </label>
            <div className="input-wrapper">
              <input
                id="login-email"
                className={`form-input${error ? ' input-error' : ''}`}
                type="email"
                name="email"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                autoFocus
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <div className="input-wrapper">
              <input
                id="login-password"
                className={`form-input password-input${error ? ' input-error' : ''}`}
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? (
                  /* Eye-off icon */
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  /* Eye icon */
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="login-submit-btn"
            disabled={isLoading}
            id="login-submit"
          >
            {isLoading && <span className="btn-spinner" />}
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <p className="login-footer">
          Blood Donation Platform &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}

export default AdminLogin
