import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../config/api'
import DashboardHome from '../components/DashboardHome.jsx'

function VolunteerDashboard() {
  const [myCamp, setMyCamp] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMyCamp = async () => {
      try {
        setLoading(true)
        const res = await api.get('/api/volunteer-management/my-camp')
        setMyCamp(res.data.data)
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to fetch assigned camp info')
      } finally {
        setLoading(false)
      }
    }
    fetchMyCamp()
  }, [])

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Assigned Camp Highlight Banner */}
      {!loading && (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px var(--shadow-color)',
        }}>
          {myCamp ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  background: 'rgba(211, 47, 47, 0.08)',
                  color: 'var(--primary-red)',
                  marginBottom: '8px'
                }}>
                  Your Assigned Blood Camp
                </span>
                <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {myCamp.name}
                </h2>
                <p style={{ margin: '0', fontSize: '13px', color: 'var(--text-muted)' }}>
                  📍 {myCamp.location} &nbsp;|&nbsp; 📅 {formatDate(myCamp.date)} ({myCamp.startTime} - {myCamp.endTime})
                </p>
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{
                  background: 'var(--bg-neutral)',
                  borderRadius: '8px',
                  padding: '12px 18px',
                  textAlign: 'center',
                  minWidth: '110px'
                }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                    Target Donors
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {myCamp.targetDonors} Units
                  </div>
                </div>

                <div style={{
                  background: 'rgba(46, 125, 50, 0.08)',
                  borderRadius: '8px',
                  padding: '12px 18px',
                  textAlign: 'center',
                  minWidth: '110px',
                  border: '1px solid rgba(46, 125, 50, 0.15)'
                }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#2E7D32', letterSpacing: '0.04em' }}>
                    Units Donated
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#2E7D32' }}>
                    {myCamp.actualDonors} Units
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px', color: 'var(--primary-red)' }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>
                You are currently not assigned to any blood donation camp. Please contact your coordinator.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Main Dashboard Stats & Charts */}
      <DashboardHome greeting="Welcome back" />
    </div>
  )
}

export default VolunteerDashboard
