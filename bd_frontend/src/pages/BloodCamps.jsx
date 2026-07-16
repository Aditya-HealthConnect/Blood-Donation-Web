import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import api from '../config/api'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import './UserManagement.css' // Reuse general CRUD designs
import './BloodCamps.css'

const LIMIT = 10

function BloodCamps() {
  const [camps, setCamps] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Filtering / Search
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)

  // Add/Edit modal states
  const [showModal, setShowModal] = useState(false)
  const [editingCamp, setEditingCamp] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    branch: '',
    date: '',
    startTime: '09:00 AM',
    endTime: '04:00 PM',
    status: 'upcoming',
    targetDonors: 100,
    organizer: '',
    description: '',
  })

  // Delete modal states
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Auth permissions
  const [canWrite, setCanWrite] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('admin')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setCanWrite(parsed.role === 'Super Admin')
      } catch { /* silent */ }
    }
  }, [])

  // Fetch paginated camps
  const fetchCamps = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/blood-camps', {
        params: { search, status, page, limit: LIMIT },
      })
      setCamps(res.data.data)
      setTotal(res.data.total)
      setTotalPages(res.data.totalPages)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch camps list')
    } finally {
      setLoading(false)
    }
  }, [search, status, page])

  useEffect(() => {
    fetchCamps()
  }, [fetchCamps])

  useEffect(() => {
    setPage(1)
  }, [search, status])

  // Open add modal
  const openAddModal = () => {
    setEditingCamp(null)
    setFormData({
      name: '',
      location: '',
      branch: '',
      date: '',
      startTime: '09:00 AM',
      endTime: '04:00 PM',
      status: 'upcoming',
      targetDonors: 100,
      organizer: '',
      description: '',
    })
    setShowModal(true)
  }

  // Open edit modal prefilled
  const openEditModal = (camp) => {
    setEditingCamp(camp)
    setFormData({
      name: camp.name,
      location: camp.location,
      branch: camp.branch,
      date: camp.date ? new Date(camp.date).toISOString().split('T')[0] : '',
      startTime: camp.startTime,
      endTime: camp.endTime,
      status: camp.status,
      targetDonors: camp.targetDonors,
      organizer: camp.organizer || '',
      description: camp.description || '',
    })
    setShowModal(true)
  }

  // Handle Form changes
  const handleInputChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }))
  }

  // Add / Edit submit
  const handleFormSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.location.trim() || !formData.branch.trim() || !formData.date) {
      toast.error('Name, Location, Branch, and Date are required')
      return
    }

    setModalLoading(true)
    try {
      if (editingCamp) {
        await api.put(`/api/blood-camps/${editingCamp.id}`, formData)
        toast.success('Blood camp updated successfully')
      } else {
        await api.post('/api/blood-camps', formData)
        toast.success('Blood camp scheduled successfully')
      }
      setShowModal(false)
      fetchCamps()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally {
      setModalLoading(false)
    }
  }

  // Delete submit
  const handleDeleteSubmit = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await api.delete(`/api/blood-camps/${deleteTarget.id}`)
      toast.success('Blood camp record deleted successfully')
      setDeleteTarget(null)
      fetchCamps()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete camp')
    } finally {
      setDeleteLoading(false)
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
    <div className="camps-management-container">
      {/* Page Title */}
      <div className="mgmt-page-header">
        <h1>Blood Camps Drive Management</h1>
        {canWrite && (
          <button className="btn-add" onClick={openAddModal}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Schedule Camp
          </button>
        )}
      </div>

      {/* Filters bar */}
      <div className="mgmt-toolbar">
        <div className="search-input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="search-input"
            type="text"
            placeholder="Search by name, branch, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ width: '180px', height: '42px' }}
        >
          <option value="">All Statuses</option>
          <option value="upcoming">Upcoming</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>

        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {total} camp{total !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Main Records Table */}
      <div className="mgmt-table-card">
        <div className="mgmt-table-wrap">
          <table className="mgmt-table">
            <thead>
              <tr>
                <th>Camp Name</th>
                <th>Location / Branch</th>
                <th>Organizer</th>
                <th>Date & Time</th>
                <th>Target vs Actual</th>
                <th>Status</th>
                {canWrite && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '140px' }} /></td>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '120px' }} /></td>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '90px' }} /></td>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '130px' }} /></td>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '90px' }} /></td>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '70px' }} /></td>
                    {canWrite && <td><div className="mgmt-skel-cell skeleton" style={{ width: '70px' }} /></td>}
                  </tr>
                ))
              ) : camps.length === 0 ? (
                <tr>
                  <td colSpan={canWrite ? 7 : 6}>
                    <div className="mgmt-empty">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                      <h3>No blood camps found</h3>
                      <p>Try modifying your filters or schedule a new camp above.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                camps.map((camp) => (
                  <tr key={camp.id}>
                    <td className="cell-name">{camp.name}</td>
                    <td>
                      <div>{camp.location}</div>
                      <span className="cell-muted" style={{ fontSize: '12px' }}>Branch: {camp.branch}</span>
                    </td>
                    <td className="cell-muted">{camp.organizer || 'N/A'}</td>
                    <td>
                      <div>{formatDate(camp.date)}</div>
                      <span className="cell-muted" style={{ fontSize: '11px' }}>{camp.startTime} - {camp.endTime}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {camp.actualDonors} / {camp.targetDonors} units
                    </td>
                    <td>
                      <span className={`camp-status-badge ${camp.status}`}>
                        {camp.status}
                      </span>
                    </td>
                    {canWrite && (
                      <td>
                        <div className="action-btns">
                          <button
                            className="btn-action"
                            title="Edit Camp Settings"
                            onClick={() => openEditModal(camp)}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            className="btn-action danger"
                            title="Delete Camp"
                            onClick={() => setDeleteTarget(camp)}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination view */}
        {totalPages > 1 && (
          <div className="mgmt-pagination">
            <span className="pagination-info">
              Page {page} of {totalPages} ({total} camps)
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

      {/* Add / Edit modal popup */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCamp ? 'Edit Blood Camp Drive' : 'Schedule Blood Camp Drive'}
      >
        <form onSubmit={handleFormSubmit} className="mgmt-form">
          <div className="mgmt-form-group">
            <label>Camp Name *</label>
            <input
              type="text"
              placeholder="e.g. Annual Blood Camp Drive"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>

          <div className="mgmt-form-group">
            <label>Location *</label>
            <input
              type="text"
              placeholder="e.g. IT Seminar Hall"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
            />
          </div>

          <div className="mgmt-form-group">
            <label>Branch *</label>
            <input
              type="text"
              placeholder="e.g. CSE"
              value={formData.branch}
              onChange={(e) => handleInputChange('branch', e.target.value)}
            />
          </div>

          <div className="mgmt-form-group">
            <label>Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="mgmt-form-group">
              <label>Start Time</label>
              <input
                type="text"
                placeholder="09:00 AM"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
              />
            </div>
            <div className="mgmt-form-group">
              <label>End Time</label>
              <input
                type="text"
                placeholder="04:00 PM"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="mgmt-form-group">
              <label>Target Donors (units)</label>
              <input
                type="number"
                value={formData.targetDonors}
                onChange={(e) => handleInputChange('targetDonors', e.target.value)}
              />
            </div>
            <div className="mgmt-form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="filter-select"
                style={{ width: '100%', height: '42px' }}
              >
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="mgmt-form-group">
            <label>Organizer</label>
            <input
              type="text"
              placeholder="e.g. Red Cross Club"
              value={formData.organizer}
              onChange={(e) => handleInputChange('organizer', e.target.value)}
            />
          </div>

          <div className="mgmt-form-group">
            <label>Description</label>
            <textarea
              placeholder="Camp instructions or summary details"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              style={{ height: '70px', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid var(--border-color)', width: '100%', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <button type="submit" className="mgmt-form-submit" disabled={modalLoading}>
            {modalLoading && <span className="btn-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />}
            {editingCamp ? 'Save Settings' : 'Schedule Drive'}
          </button>
        </form>
      </Modal>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteSubmit}
        title="Delete Blood Camp Drive"
        message={`Are you sure you want to delete blood camp drive "${deleteTarget?.name}"? All registrations associated with this camp will remain in database but the camp reference will be unlinked. This cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteLoading}
      />
    </div>
  )
}

export default BloodCamps
