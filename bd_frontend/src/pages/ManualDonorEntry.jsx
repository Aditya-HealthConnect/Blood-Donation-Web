import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../config/api'
import './UserManagement.css' // Import shared input/button styles
import './ManualDonorEntry.css'

function ManualDonorEntry() {
  const [camps, setCamps] = useState([])
  const [loadingCamps, setLoadingCamps] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form State variables
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    age: '',
    gender: '',
    bloodGroup: '',
    address: '',
    campId: '',
    donationDate: new Date().toISOString().split('T')[0], // Default: today
  })

  // Errors state
  const [errors, setErrors] = useState({})

  // Fetch active / all camps for selection
  useEffect(() => {
    const fetchCamps = async () => {
      try {
        setLoadingCamps(true)
        const res = await api.get('/api/volunteer-management/camps')
        setCamps(res.data.data)
      } catch {
        toast.error('Failed to load camps list')
      } finally {
        setLoadingCamps(false)
      }
    }
    fetchCamps()
  }, [])

  // Validation logic
  const validateForm = () => {
    const tempErrors = {}
    
    if (!formData.name.trim()) tempErrors.name = 'Full name is required'
    
    if (!formData.mobileNumber.trim()) {
      tempErrors.mobileNumber = 'Mobile number is required'
    } else if (!/^\d{10}$/.test(formData.mobileNumber.trim())) {
      tempErrors.mobileNumber = 'Please enter a valid 10-digit mobile number'
    }

    const ageNum = parseInt(formData.age)
    if (!formData.age) {
      tempErrors.age = 'Age is required'
    } else if (isNaN(ageNum) || ageNum < 18 || ageNum > 65) {
      tempErrors.age = 'Donor must be between 18 and 65 years old to donate'
    }

    if (!formData.gender) tempErrors.gender = 'Please select a gender'
    if (!formData.bloodGroup) tempErrors.bloodGroup = 'Please select a blood group'
    if (!formData.address.trim()) tempErrors.address = 'Address is required'
    if (!formData.campId) tempErrors.campId = 'Please select a blood camp drive'
    if (!formData.donationDate) tempErrors.donationDate = 'Donation date is required'

    setErrors(tempErrors)
    return Object.keys(tempErrors).length === 0
  }

  // Handle Form changes
  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }))
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev }
        delete copy[field]
        return copy
      })
    }
  }

  // Reset form
  const handleReset = () => {
    setFormData({
      name: '',
      mobileNumber: '',
      age: '',
      gender: '',
      bloodGroup: '',
      address: '',
      campId: '',
      donationDate: new Date().toISOString().split('T')[0],
    })
    setErrors({})
  }

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.error('Please correct form validation errors')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/api/donors', formData)
      toast.success('Walk-in donor entry created successfully!')
      handleReset() // Clear form on success
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit donor entry')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="manual-donor-entry-container">
      {/* Page Header */}
      <div className="mgmt-page-header">
        <h1>Walk-in Registration</h1>
      </div>

      {/* Form Card */}
      <div className="form-card">
        <h3 className="form-card-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
          Walk-in Donor Entry
        </h3>
        <p className="form-card-desc">
          Add details of a blood donor manually at the camp (for walk-in donors who did not pre-register online).
        </p>

        <form onSubmit={handleSubmit} className="mgmt-form">
          <div className="form-grid">
            
            {/* Name */}
            <div className="mgmt-form-group form-group-full">
              <label>Full Name *</label>
              <input
                type="text"
                placeholder="Enter donor's full name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={errors.name ? 'input-error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            {/* Mobile Number */}
            <div className="mgmt-form-group">
              <label>Mobile Number *</label>
              <input
                type="text"
                placeholder="Enter 10-digit number"
                value={formData.mobileNumber}
                onChange={(e) => handleChange('mobileNumber', e.target.value)}
                className={errors.mobileNumber ? 'input-error' : ''}
              />
              {errors.mobileNumber && <span className="error-text">{errors.mobileNumber}</span>}
            </div>

            {/* Age */}
            <div className="mgmt-form-group">
              <label>Age (18–65) *</label>
              <input
                type="number"
                placeholder="e.g. 24"
                value={formData.age}
                onChange={(e) => handleChange('age', e.target.value)}
                className={errors.age ? 'input-error' : ''}
              />
              {errors.age && <span className="error-text">{errors.age}</span>}
            </div>

            {/* Gender */}
            <div className="mgmt-form-group">
              <label>Gender *</label>
              <div className="radio-options-group">
                {['Male', 'Female', 'Other'].map((g) => (
                  <label key={g} className="radio-option">
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={formData.gender === g}
                      onChange={() => handleChange('gender', g)}
                    />
                    {g}
                  </label>
                ))}
              </div>
              {errors.gender && <span className="error-text">{errors.gender}</span>}
            </div>

            {/* Blood Group */}
            <div className="mgmt-form-group">
              <label>Blood Group *</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => handleChange('bloodGroup', e.target.value)}
                className={`filter-select ${errors.bloodGroup ? 'input-error' : ''}`}
                style={{ width: '100%', height: '42px' }}
              >
                <option value="">— Select Group —</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
              {errors.bloodGroup && <span className="error-text">{errors.bloodGroup}</span>}
            </div>

            {/* Camp selection */}
            <div className="mgmt-form-group form-group-full">
              <label>Camp *</label>
              <select
                value={formData.campId}
                onChange={(e) => handleChange('campId', e.target.value)}
                className={`filter-select ${errors.campId ? 'input-error' : ''}`}
                style={{ width: '100%', height: '42px' }}
                disabled={loadingCamps}
              >
                <option value="">{loadingCamps ? 'Loading camps...' : '— Select Blood Camp Drive —'}</option>
                {camps.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.location})
                  </option>
                ))}
              </select>
              {errors.campId && <span className="error-text">{errors.campId}</span>}
            </div>

            {/* Donation Date */}
            <div className="mgmt-form-group">
              <label>Donation Date *</label>
              <input
                type="date"
                value={formData.donationDate}
                onChange={(e) => handleChange('donationDate', e.target.value)}
                className={errors.donationDate ? 'input-error' : ''}
              />
              {errors.donationDate && <span className="error-text">{errors.donationDate}</span>}
            </div>

            {/* Address */}
            <div className="mgmt-form-group form-group-full">
              <label>Address *</label>
              <textarea
                placeholder="Enter donor's full address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className={errors.address ? 'input-error' : ''}
                style={{ height: '80px', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid var(--border-color)', width: '100%', outline: 'none', resize: 'vertical' }}
              />
              {errors.address && <span className="error-text">{errors.address}</span>}
            </div>

          </div>

          {/* Form Actions */}
          <div className="form-actions-bar">
            <button className="btn-form-cancel" type="button" onClick={handleReset} disabled={submitting}>
              Reset
            </button>
            <button className="mgmt-form-submit" style={{ margin: 0, height: '44px' }} type="submit" disabled={submitting}>
              {submitting && <span className="btn-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />}
              Submit Donation
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ManualDonorEntry
