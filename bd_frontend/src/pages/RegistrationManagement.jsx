import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import api from '../config/api'
import Modal from '../components/Modal.jsx'
import './UserManagement.css' // Reuse table, skeleton, layout styles
import './RegistrationManagement.css' // Custom filter and detail styles

const LIMIT = 10

function RegistrationManagement() {
  const [registrations, setRegistrations] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [campId, setCampId] = useState('')
  const [branch, setBranch] = useState('')
  const [passoutYear, setPassoutYear] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)

  // Dropdown filter options loaded dynamically from API
  const [filterOptions, setFilterOptions] = useState({
    camps: [],
    branches: [],
    passoutYears: [],
    statuses: [],
  })

  // Modal / Detail states
  const [selectedReg, setSelectedReg] = useState(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [statusSubmitting, setStatusSubmitting] = useState(false)
  const [exporting, setExporting] = useState(false)

  // Fetch registrations
  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/registration-management', {
        params: {
          search,
          campId,
          branch,
          passoutYear,
          status,
          page,
          limit: LIMIT,
        },
      })
      setRegistrations(res.data.data)
      setTotal(res.data.total)
      setTotalPages(res.data.totalPages)
      
      // Update filter options if available
      if (res.data.filters) {
        setFilterOptions(res.data.filters)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch registrations')
    } finally {
      setLoading(false)
    }
  }, [search, campId, branch, passoutYear, status, page])

  useEffect(() => {
    fetchRegistrations()
  }, [fetchRegistrations])

  // Reset to page 1 when search/filter criteria change
  useEffect(() => {
    setPage(1)
  }, [search, campId, branch, passoutYear, status])

  // Reset all filters
  const handleResetFilters = () => {
    setSearch('')
    setCampId('')
    setBranch('')
    setPassoutYear('')
    setStatus('')
    toast.success('Filters cleared')
  }

  // Open details modal
  const handleViewDetails = async (id) => {
    try {
      setDetailLoading(true)
      setDetailModalOpen(true)
      const res = await api.get(`/api/registration-management/${id}`)
      setSelectedReg(res.data.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load details')
      setDetailModalOpen(false)
    } finally {
      setDetailLoading(false)
    }
  }

  // Update status in detail modal
  const handleUpdateStatus = async (newStatus) => {
    if (!selectedReg) return
    try {
      setStatusSubmitting(true)
      await api.patch(`/api/registration-management/${selectedReg.id}/status`, {
        status: newStatus,
      })
      setSelectedReg((prev) => ({ ...prev, status: newStatus }))
      toast.success(`Status updated to ${newStatus}`)
      fetchRegistrations() // Refresh main list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status')
    } finally {
      setStatusSubmitting(false)
    }
  }

  // CSV Export handler
  const handleExportCSV = async () => {
    try {
      setExporting(true)
      const res = await api.get('/api/registration-management/export', {
        params: { search, campId, branch, passoutYear, status },
        responseType: 'blob', // Download as blob
      })

      // Create a link element to trigger the download
      const blob = new Blob([res.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `registrations_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Registrations exported successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to export registrations')
    } finally {
      setExporting(false)
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
    <div className="registration-mgmt-container">
      {/* Title */}
      <div className="mgmt-page-header">
        <h1>Registration Management</h1>
      </div>

      {/* Toolbar / Search & CSV Action */}
      <div className="mgmt-toolbar">
        <div className="search-input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="search-input"
            type="text"
            placeholder="Search by student name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {total} record{total !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Dynamic Filter Dropdowns */}
      <div className="filters-grid">
        <div className="filter-group">
          <label>Blood Camp</label>
          <select
            className="filter-select"
            value={campId}
            onChange={(e) => setCampId(e.target.value)}
          >
            <option value="">All Camps</option>
            {filterOptions.camps.map((camp) => (
              <option key={camp.id} value={camp.id}>
                {camp.name} ({camp.status})
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Branch</label>
          <select
            className="filter-select"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          >
            <option value="">All Branches</option>
            {filterOptions.branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Passout Year</label>
          <select
            className="filter-select"
            value={passoutYear}
            onChange={(e) => setPassoutYear(e.target.value)}
          >
            <option value="">All Years</option>
            {filterOptions.passoutYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Status</label>
          <select
            className="filter-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            {filterOptions.statuses.map((st) => (
              <option key={st} value={st} style={{ textTransform: 'capitalize' }}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-actions">
          <button className="btn-reset" onClick={handleResetFilters}>
            Clear
          </button>
          <button className="btn-export" onClick={handleExportCSV} disabled={exporting || total === 0}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {exporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="mgmt-table-card">
        <div className="mgmt-table-wrap">
          <table className="mgmt-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Branch & Year</th>
                <th>Blood Group</th>
                <th>Assigned Camp</th>
                <th>Status</th>
                <th>Registration Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '130px' }} /></td>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '90px' }} /></td>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '50px' }} /></td>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '150px' }} /></td>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '80px' }} /></td>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '90px' }} /></td>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '50px' }} /></td>
                  </tr>
                ))
              ) : registrations.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="mgmt-empty">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                      <h3>No registrations found</h3>
                      <p>Try modifying your search or filter values.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                registrations.map((reg) => (
                  <tr key={reg.id}>
                    <td className="cell-name">{reg.name}</td>
                    <td>
                      <div>{reg.branch}</div>
                      <div className="cell-muted">Class of {reg.passoutYear}</div>
                    </td>
                    <td>
                      <span style={{
                        background: 'rgba(211,47,47,0.08)',
                        color: 'var(--primary-red)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '12px',
                      }}>
                        {reg.bloodGroup}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{reg.campName}</td>
                    <td>
                      <span className={`status-badge ${reg.status}`} style={{ textTransform: 'capitalize' }}>
                        {reg.status}
                      </span>
                    </td>
                    <td className="cell-muted">{formatDate(reg.registeredAt)}</td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="btn-action"
                          title="View Details & Manage Status"
                          onClick={() => handleViewDetails(reg.id)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="mgmt-pagination">
            <span className="pagination-info">
              Page {page} of {totalPages} ({total} records)
            </span>
            <div className="pagination-btns">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <span key={p} style={{ display: 'contents' }}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span style={{ padding: '0 4px', color: 'var(--text-muted)' }}>...</span>
                    )}
                    <button className={p === page ? 'active' : ''} onClick={() => setPage(p)}>
                      {p}
                    </button>
                  </span>
                ))}
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details & Status Management Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Registration Details"
        maxWidth="520px"
      >
        {detailLoading || !selectedReg ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '10px 0' }}>
            <div className="mgmt-skel-cell skeleton" style={{ width: '60%', height: '20px' }} />
            <div className="mgmt-skel-cell skeleton" style={{ width: '80%', height: '14px' }} />
            <div className="mgmt-skel-cell skeleton" style={{ width: '40%', height: '14px' }} />
            <div className="mgmt-skel-cell skeleton" style={{ width: '100%', height: '100px', marginTop: '10px' }} />
          </div>
        ) : (
          <div>
            {/* Student & Camp Information Grid */}
            <div className="detail-grid">
              <div className="detail-section-title">Student Information</div>
              <div className="detail-item">
                <span>Name</span>
                <strong>{selectedReg.name}</strong>
              </div>
              <div className="detail-item">
                <span>Email Address</span>
                <strong>{selectedReg.email}</strong>
              </div>
              <div className="detail-item">
                <span>Phone Number</span>
                <strong>{selectedReg.phone}</strong>
              </div>
              <div className="detail-item">
                <span>Blood Group</span>
                <strong style={{ color: 'var(--primary-red)' }}>{selectedReg.bloodGroup}</strong>
              </div>
              <div className="detail-item">
                <span>Branch</span>
                <strong>{selectedReg.branch}</strong>
              </div>
              <div className="detail-item">
                <span>Passout Year</span>
                <strong>{selectedReg.passoutYear}</strong>
              </div>

              <div className="detail-section-title">Blood Camp Information</div>
              <div className="detail-item">
                <span>Camp Name</span>
                <strong>{selectedReg.camp?.name || 'N/A'}</strong>
              </div>
              <div className="detail-item">
                <span>Location</span>
                <strong>{selectedReg.camp?.location || 'N/A'}</strong>
              </div>
              <div className="detail-item">
                <span>Camp Date</span>
                <strong>{selectedReg.camp?.date ? formatDate(selectedReg.camp.date) : 'N/A'}</strong>
              </div>
              <div className="detail-item">
                <span>Registration Date</span>
                <strong>{formatDate(selectedReg.registeredAt)}</strong>
              </div>
            </div>

            {/* Interactive Status Update Box */}
            <div className="status-update-box">
              <h4>Update Registration Status</h4>
              <div className="status-options-grid">
                {['registered', 'attended', 'donated', 'rejected'].map((opt) => (
                  <button
                    key={opt}
                    disabled={statusSubmitting}
                    onClick={() => handleUpdateStatus(opt)}
                    className={`btn-status-option ${selectedReg.status === opt ? `active ${opt}` : ''}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default RegistrationManagement
