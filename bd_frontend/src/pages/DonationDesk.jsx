import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { Html5Qrcode } from 'html5-qrcode'
import api from '../config/api'
import './UserManagement.css' // Import skeleton loader and modal styles
import './DonationDesk.css'

function DonationDesk() {
  // Navigation / Tab state
  const [activeTab, setActiveTab] = useState('search') // 'search' | 'scan'
  const [searchTab, setSearchTab] = useState('roll') // 'roll' | 'phone'

  // Search input state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)

  // Matched registration details state
  const [student, setStudent] = useState(null)

  // QR Scanner instance ref
  const [scannerActive, setScannerActive] = useState(false)
  const qrScannerRef = useRef(null)
  const scannerContainerId = 'qr-reader-viewport'

  // Action status loading
  const [actionLoading, setActionLoading] = useState(false)

  // Handle Search submit
  const handleSearchSubmit = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query')
      return
    }

    setSearchLoading(true)
    try {
      const res = await api.get('/api/donation-desk/search', {
        params: { query: searchQuery.trim() },
      })
      setStudent(res.data.data)
      toast.success('Registration verified successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'No matching registration found')
      setStudent(null)
    } finally {
      setSearchLoading(false)
    }
  }

  // Update student status
  const handleStatusUpdate = async (newStatus) => {
    if (!student) return

    // Prevent duplicate donation updates
    if (student.status === 'donated' && newStatus === 'donated') {
      toast.error('Student has already donated blood!')
      return
    }

    setActionLoading(true)
    try {
      const res = await api.patch(`/api/donation-desk/registrations/${student.id}/status`, {
        status: newStatus,
      })
      
      toast.success(res.data.message || `Status updated to ${newStatus}`)
      
      // Update local state details
      setStudent((prev) => ({
        ...prev,
        status: newStatus,
        camp: prev.camp ? {
          ...prev.camp,
          actualDonors: res.data.data.campActualDonors,
        } : null,
      }))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status')
    } finally {
      setActionLoading(false)
    }
  }

  // QR Scanner implementation
  const startScanner = () => {
    setScannerActive(true)
    // Small delay to ensure container element is mounted
    setTimeout(() => {
      try {
        const html5QrCode = new Html5Qrcode(scannerContainerId)
        qrScannerRef.current = html5QrCode

        const config = { fps: 10, qrbox: { width: 250, height: 250 } }

        html5QrCode.start(
          { facingMode: 'environment' }, // Rear camera
          config,
          (decodedText) => {
            // QR Scan success handler
            toast.success('QR Code scanned successfully!')
            stopScanner()
            setActiveTab('search') // Switch back to details view
            setSearchQuery(decodedText)
            
            // Trigger automatic search
            triggerAutoSearch(decodedText)
          },
          () => {
            // Scanning in progress (silent error logs)
          }
        ).catch(() => {
          toast.error('Failed to access camera. Please check permissions.')
          setScannerActive(false)
        })
      } catch (err) {
        console.error('QR start error:', err)
        toast.error('Failed to initialize camera scanner')
        setScannerActive(false)
      }
    }, 200)
  }

  const stopScanner = () => {
    if (qrScannerRef.current && qrScannerRef.current.isScanning) {
      qrScannerRef.current.stop().then(() => {
        setScannerActive(false)
        qrScannerRef.current = null
      }).catch((err) => {
        console.error('QR stop error:', err)
        setScannerActive(false)
      })
    } else {
      setScannerActive(false)
    }
  }

  // Automatic search triggered by QR scanner result
  const triggerAutoSearch = async (queryVal) => {
    setSearchLoading(true)
    try {
      const res = await api.get('/api/donation-desk/search', {
        params: { query: queryVal },
      })
      setStudent(res.data.data)
      toast.success('Registration verified!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'No registration matched this QR')
      setStudent(null)
    } finally {
      setSearchLoading(false)
    }
  }

  // Cleanup camera scanner on component unmount
  useEffect(() => {
    return () => {
      if (qrScannerRef.current && qrScannerRef.current.isScanning) {
        qrScannerRef.current.stop().catch((e) => console.error(e))
      }
    }
  }, [])

  // Switch tabs handler
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (tab === 'scan') {
      startScanner()
    } else {
      stopScanner()
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
    <div className="donation-desk-container">
      {/* Title */}
      <div className="mgmt-page-header">
        <h1>Donation Desk</h1>
      </div>

      <div className="desk-layout">
        {/* LEFT COLUMN: Search & Camera Feed */}
        <div className="desk-panel-left">
          {/* Action Choice Tabs */}
          <div className="gallery-controls" style={{ padding: '8px 16px' }}>
            <div className="search-type-selector" style={{ margin: 0, border: 'none' }}>
              <button
                className={`btn-search-tab ${activeTab === 'search' ? 'active' : ''}`}
                onClick={() => handleTabChange('search')}
              >
                Verification Desk
              </button>
              <button
                className={`btn-search-tab ${activeTab === 'scan' ? 'active' : ''}`}
                onClick={() => handleTabChange('scan')}
              >
                Scan QR Code
              </button>
            </div>
          </div>

          {/* Search Card */}
          {activeTab === 'search' && (
            <div className="desk-card">
              <h3 className="desk-card-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Search Registration
              </h3>
              
              <div className="search-type-selector">
                <button
                  className={`btn-search-tab ${searchTab === 'roll' ? 'active' : ''}`}
                  onClick={() => setSearchTab('roll')}
                >
                  By Roll Number
                </button>
                <button
                  className={`btn-search-tab ${searchTab === 'phone' ? 'active' : ''}`}
                  onClick={() => setSearchTab('phone')}
                >
                  By Mobile Number
                </button>
              </div>

              <form className="search-form" onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  placeholder={searchTab === 'roll' ? 'Enter Roll Number (e.g. 22A81A0512)' : 'Enter Mobile Number'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="btn-search-submit" type="submit" disabled={searchLoading}>
                  {searchLoading ? 'Searching...' : 'Verify'}
                </button>
              </form>
            </div>
          )}

          {/* QR Camera Viewport */}
          {activeTab === 'scan' && (
            <div className="desk-card qr-scanner-box">
              <h3 className="desk-card-title" style={{ width: '100%', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
                QR Code Verification
              </h3>

              <div className="qr-camera-viewport" id={scannerContainerId}>
                {!scannerActive && (
                  <div className="qr-camera-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    <span>Camera scanner is stopped</span>
                  </div>
                )}
              </div>

              {scannerActive ? (
                <button className="btn-qr-toggle stop" onClick={stopScanner}>
                  Stop Camera Feed
                </button>
              ) : (
                <button className="btn-qr-toggle start" onClick={startScanner}>
                  Start Scanner Camera
                </button>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Search Results Profile Cards */}
        <div className="desk-panel-right">
          {searchLoading ? (
            <div className="profile-card" style={{ minHeight: '300px' }}>
              <div className="mgmt-skel-cell skeleton" style={{ width: '40%', height: '18px', marginBottom: '20px' }} />
              <div className="profile-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="mgmt-skel-cell skeleton" style={{ width: '50%', height: '11px' }} />
                    <div className="mgmt-skel-cell skeleton" style={{ width: '80%', height: '14px' }} />
                  </div>
                ))}
              </div>
            </div>
          ) : !student ? (
            <div className="profile-card desk-empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <h3>No Student Verified</h3>
              <p>Type a roll number/mobile above or scan a student QR badge code to pull details.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Student Details */}
              <div className="profile-card">
                <h4 className="profile-title">Student Information</h4>
                <div className="profile-grid">
                  <div className="profile-item">
                    <span>Full Name</span>
                    <strong>{student.name}</strong>
                  </div>
                  <div className="profile-item">
                    <span>Roll Number</span>
                    <strong>{student.rollNumber}</strong>
                  </div>
                  <div className="profile-item">
                    <span>Blood Group</span>
                    <strong style={{ color: 'var(--primary-red)' }}>{student.bloodGroup}</strong>
                  </div>
                  <div className="profile-item">
                    <span>Mobile Number</span>
                    <strong>{student.phone}</strong>
                  </div>
                  <div className="profile-item">
                    <span>Branch & Year</span>
                    <strong>{student.branch} (Class of {student.passoutYear})</strong>
                  </div>
                  <div className="profile-item">
                    <span>Email Address</span>
                    <strong>{student.email}</strong>
                  </div>
                </div>

                {/* Status Update Actions Box */}
                <h4 className="profile-title">Mark Attendance / Status</h4>
                
                {student.status === 'donated' ? (
                  <div className="donated-banner">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    Donation Completed: Student has already donated blood in this camp.
                  </div>
                ) : (
                  <div className="desk-status-actions">
                    <button
                      className="btn-desk-status mark-registered"
                      disabled={actionLoading || student.status === 'registered'}
                      onClick={() => handleStatusUpdate('registered')}
                    >
                      Registered
                    </button>
                    <button
                      className="btn-desk-status mark-donated"
                      disabled={actionLoading}
                      onClick={() => handleStatusUpdate('donated')}
                    >
                      Mark Donated
                    </button>
                    <button
                      className="btn-desk-status mark-absent"
                      disabled={actionLoading || student.status === 'absent'}
                      onClick={() => handleStatusUpdate('absent')}
                    >
                      Mark Absent
                    </button>
                  </div>
                )}
              </div>

              {/* Camp Details */}
              <div className="profile-card">
                <h4 className="profile-title">Camp Details</h4>
                <div className="profile-grid" style={{ marginBottom: 0 }}>
                  <div className="profile-item">
                    <span>Drive / Event</span>
                    <strong>{student.camp?.name || 'N/A'}</strong>
                  </div>
                  <div className="profile-item">
                    <span>Date & Location</span>
                    <strong>
                      {student.camp?.date ? formatDate(student.camp.date) : 'N/A'} at {student.camp?.location || 'N/A'}
                    </strong>
                  </div>
                  <div className="profile-item">
                    <span>Camp Status</span>
                    <strong style={{ textTransform: 'capitalize' }}>
                      {student.camp?.status || 'N/A'}
                    </strong>
                  </div>
                  <div className="profile-item">
                    <span>Actual vs Target</span>
                    <strong>
                      {student.camp?.actualDonors || 0} / {student.camp?.targetDonors || 0} units
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DonationDesk
