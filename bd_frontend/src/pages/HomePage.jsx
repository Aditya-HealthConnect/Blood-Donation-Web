import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../config/api'
import Navigation from '../components/Navigation.jsx'
import Modal from '../components/Modal.jsx'
import './UserManagement.css' // Import shared modal/input styles

function HomePage() {
  const [camps, setCamps] = useState([])
  const [loading, setLoading] = useState(true)

  // Booking Modal States
  const [selectedCamp, setSelectedCamp] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [fetchingStudent, setFetchingStudent] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bloodGroup: '',
    branch: '',
    rollNumber: '',
    passoutYear: '',
    organizer: '',
  })
  const [errors, setErrors] = useState({})

  // Fetch public active & upcoming camps
  useEffect(() => {
    const fetchPublicCamps = async () => {
      try {
        setLoading(true)
        const res = await api.get('/api/blood-camps/public')
        setCamps(res.data.data)
      } catch {
        toast.error('Failed to load upcoming blood camps')
      } finally {
        setLoading(false)
      }
    }
    fetchPublicCamps()
  }, [])

  // Open booking modal
  const handleOpenRegister = (camp) => {
    const resolvedOrgs = (camp.organizers && camp.organizers.length > 0)
      ? camp.organizers
      : (camp.organizer ? [{ name: camp.organizer, location: camp.location || '', roomNumber: '' }] : []);

    setSelectedCamp({
      ...camp,
      organizers: resolvedOrgs,
    })
    setFormData({
      name: '',
      email: '',
      phone: '',
      bloodGroup: '',
      branch: '',
      rollNumber: '',
      passoutYear: '',
      organizer: '',
    })
    setErrors({})
  }

  // Handle Input Changes
  const handleInputChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }))
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev }
        delete copy[field]
        return copy
      })
    }
  }

  // Fetch student details by roll number
  const handleRollCheck = async (rollNo) => {
    const trimmed = (rollNo || '').trim()
    if (!trimmed) {
      toast.error('Please enter a roll number')
      return
    }

    setFetchingStudent(true)
    try {
      const res = await api.get(`/api/student-lookup/${encodeURIComponent(trimmed)}`)
      const data = res.data.data

      const branchVal = Array.isArray(data.branch) ? data.branch[0] : (data.branch || '')

      setFormData((prev) => ({
        ...prev,
        rollNumber: trimmed,
        name: data.first_name || '',
        email: data.email || '',
        branch: branchVal,
        passoutYear: data.passout_year ? String(data.passout_year) : '',
      }))

      // Clear errors for auto-filled fields
      setErrors((prev) => {
        const copy = { ...prev }
        delete copy.rollNumber
        delete copy.name
        delete copy.email
        delete copy.branch
        delete copy.passoutYear
        return copy
      })

      toast.success('Student details fetched successfully')
    } catch {
      toast.error('Roll number not found. Please check and try again.')
    } finally {
      setFetchingStudent(false)
    }
  }

  // Booking form validation
  const validateForm = () => {
    const temp = {}
    if (!formData.name.trim()) temp.name = 'Full name is required'
    
    if (!formData.email.trim()) {
      temp.email = 'Email is required'
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      temp.email = 'Please enter a valid email address'
    }

    if (!formData.phone.trim()) {
      temp.phone = 'Mobile number is required'
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      temp.phone = 'Please enter a valid 10-digit number'
    }

    if (!formData.bloodGroup) temp.bloodGroup = 'Blood group is required'
    if (!formData.branch.trim()) temp.branch = 'Branch is required (e.g. CSE)'
    if (!formData.rollNumber.trim()) temp.rollNumber = 'Roll number is required (e.g. 22A81A0512)'
    
    const yearNum = parseInt(formData.passoutYear)
    if (!formData.passoutYear) {
      temp.passoutYear = 'Passout year is required'
    } else if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2035) {
      temp.passoutYear = 'Please enter a valid year (e.g. 2026)'
    }

    if (selectedCamp?.organizers && selectedCamp.organizers.length > 0 && !formData.organizer) {
      temp.organizer = 'Selecting an organizer is required'
    }

    setErrors(temp)
    return Object.keys(temp).length === 0
  }

  // Submit Booking Registrations
  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.error('Please correct registration errors')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/api/registrations', {
        ...formData,
        campId: selectedCamp.id,
      })
      toast.success('Awesome! Registration completed successfully.')
      setSelectedCamp(null) // Close modal on success
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete registration')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <main className="app-shell" style={{ overflowY: 'auto' }}>
      <Navigation />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Community blood donation platform</p>
          <h1>Donate blood. Save lives. Stay connected with every camp.</h1>
          <p className="hero-text">
            Find active camps, register online for upcoming donation drives, and view live donation stats.
          </p>
        </div>

        <div className="info-panel" aria-label="Main page actions">
          <span>Explore the platform</span>
          <strong>Blood Donation Hub</strong>
          <p>Register for camps or sign in to managing portal.</p>
          <div className="info-actions">
            <a className="primary-action" href="#view-camps">
              Register for Camps
            </a>
            <a className="secondary-action" href="/dashboard">
              View Dashboard
            </a>
          </div>
        </div>
      </section>

      {/* Camp Campaigns Timeline section */}
      <section className="feature-grid" id="view-camps" aria-label="Active Campaigns" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '40px 24px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span className="eyebrow" style={{ color: 'var(--primary-red)', fontWeight: 700, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>
            Active & Upcoming Camps
          </span>
          <h2 style={{ margin: '8px 0 0', fontSize: '24px', fontWeight: 700, color: 'var(--text-main)' }}>
            Schedule of Donation Drives
          </h2>
          <p style={{ margin: '8px 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
            Choose an upcoming camp at your branch and register online to reserve your donation slot.
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="mgmt-skel-cell skeleton" style={{ width: '100%', height: '80px', borderRadius: '8px' }} />
            ))}
          </div>
        ) : camps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--text-muted)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '48px', height: '48px', opacity: 0.3, marginBottom: '12px' }}>
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h3>No active camps found</h3>
            <p style={{ fontSize: '13px' }}>There are no active or upcoming blood donation drives scheduled at this time.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {camps.map((camp) => (
              <div
                key={camp.id}
                style={{
                  background: 'var(--bg-neutral)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: camp.status === 'active' ? 'rgba(46,125,50,0.08)' : 'rgba(230,81,0,0.08)',
                    color: camp.status === 'active' ? '#2E7D32' : '#E65100',
                    marginBottom: '6px'
                  }}>
                    {camp.status}
                  </span>
                  <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {camp.name}
                  </h3>
                  <p style={{ margin: '0', fontSize: '13px', color: 'var(--text-muted)' }}>
                    📍 {camp.location} &nbsp;|&nbsp; 📅 {formatDate(camp.date)} ({camp.startTime} - {camp.endTime})
                  </p>
                </div>
                <button
                  className="btn-add"
                  style={{ margin: 0, height: '40px', padding: '0 20px', background: 'var(--primary-red)' }}
                  onClick={() => handleOpenRegister(camp)}
                >
                  Register Now
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Feature Grid section */}
      <section className="feature-grid" aria-label="Core features" style={{ padding: '40px 24px' }}>
        <article>
          <span>01</span>
          <h2>Campaign Management</h2>
          <p>Organize blood camps drives and track campaigns statistics details.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Donor Registration</h2>
          <p>Simple and easy online registrations portal for students and walk-ins.</p>
        </article>
        <article>
          <span>03</span>
          <h2>Donation Desk</h2>
          <p>QR code verification and real-time donation status updates at camps.</p>
        </article>
      </section>

      {/* Public Student Registration Modal Popup */}
      <Modal
        isOpen={!!selectedCamp}
        onClose={() => setSelectedCamp(null)}
        title={`Register for ${selectedCamp?.name}`}
      >
        <form onSubmit={handleRegisterSubmit} className="mgmt-form">
          <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--text-muted)' }}>
            Please fill in your details to register as a student blood donor for the drive on{' '}
            <strong>{selectedCamp ? formatDate(selectedCamp.date) : ''}</strong> at{' '}
            <strong>{selectedCamp?.location}</strong>.
          </p>

          {/* Camp Name (read-only) */}
          <div className="mgmt-form-group">
            <label>Selected Blood Camp</label>
            <input
              type="text"
              value={selectedCamp?.name || ''}
              readOnly
              disabled
              style={{ background: 'var(--bg-neutral)', cursor: 'not-allowed' }}
            />
          </div>

          {/* Organizer Dropdown select */}
          {selectedCamp?.organizers && selectedCamp.organizers.length > 0 && (
            <div className="mgmt-form-group">
              <label>Select Organizer & Location *</label>
              <select
                value={formData.organizer}
                onChange={(e) => handleInputChange('organizer', e.target.value)}
                className={`filter-select ${errors.organizer ? 'input-error' : ''}`}
                style={{ width: '100%', height: '42px' }}
              >
                <option value="">— Select Organizer (Location) —</option>
                {selectedCamp.organizers.map((org) => (
                  <option key={org.name} value={org.name}>
                    {org.name}, {org.location}{org.roomNumber ? `, Room ${org.roomNumber}` : ''}
                  </option>
                ))}
              </select>
              {errors.organizer && <span className="error-text">{errors.organizer}</span>}
            </div>
          )}

          {/* Roll Number (first field) */}
          <div className="mgmt-form-group">
            <label>Roll Number *</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="e.g. 23P31A0508"
                value={formData.rollNumber}
                onChange={(e) => handleInputChange('rollNumber', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleRollCheck(formData.rollNumber)
                  }
                }}
                className={errors.rollNumber ? 'input-error' : ''}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn-add"
                style={{ margin: 0, height: '42px', padding: '0 16px', flexShrink: 0, whiteSpace: 'nowrap' }}
                onClick={() => handleRollCheck(formData.rollNumber)}
                disabled={fetchingStudent}
              >
                {fetchingStudent ? (
                  <span className="btn-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, marginRight: 4 }}>
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    Check
                  </>
                )}
              </button>
            </div>
            {errors.rollNumber && <span className="error-text">{errors.rollNumber}</span>}
          </div>

          {/* Full Name */}
          <div className="mgmt-form-group">
            <label>Full Name *</label>
            <input
              type="text"
              placeholder="Auto-filled from roll number"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          {/* Email Address */}
          <div className="mgmt-form-group">
            <label>Email Address *</label>
            <input
              type="email"
              placeholder="Auto-filled from roll number"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            {/* Mobile Number */}
            <div className="mgmt-form-group">
              <label>Mobile Number *</label>
              <input
                type="text"
                placeholder="10-digit number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={errors.phone ? 'input-error' : ''}
              />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>

            {/* Blood Group */}
            <div className="mgmt-form-group">
              <label>Blood Group *</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                className={`filter-select ${errors.bloodGroup ? 'input-error' : ''}`}
                style={{ width: '100%', height: '42px' }}
              >
                <option value="">— Select —</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
              {errors.bloodGroup && <span className="error-text">{errors.bloodGroup}</span>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            {/* Branch */}
            <div className="mgmt-form-group">
              <label>Branch *</label>
              <input
                type="text"
                placeholder="Auto-filled from roll number"
                value={formData.branch}
                onChange={(e) => handleInputChange('branch', e.target.value)}
                className={errors.branch ? 'input-error' : ''}
              />
              {errors.branch && <span className="error-text">{errors.branch}</span>}
            </div>

            {/* Passout Year */}
            <div className="mgmt-form-group">
              <label>Passout Year *</label>
              <input
                type="number"
                placeholder="Auto-filled from roll number"
                value={formData.passoutYear}
                onChange={(e) => handleInputChange('passoutYear', e.target.value)}
                className={errors.passoutYear ? 'input-error' : ''}
              />
              {errors.passoutYear && <span className="error-text">{errors.passoutYear}</span>}
            </div>
          </div>

          <button type="submit" className="mgmt-form-submit" disabled={submitting}>
            {submitting && <span className="btn-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />}
            Register
          </button>
        </form>
      </Modal>
    </main>
  )
}

export default HomePage
