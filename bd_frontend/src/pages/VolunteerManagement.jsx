import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import api from '../config/api'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import './UserManagement.css'

const LIMIT = 10

function getCanWriteFromStorage() {
  const stored = localStorage.getItem('admin')
  if (!stored) return false

  try {
    const parsed = JSON.parse(stored)
    return parsed.role === 'Super Admin'
  } catch {
    return false
  }
}

function VolunteerManagement() {
  const [volunteers, setVolunteers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  // Modal states
  const [showForm, setShowForm] = useState(false)
  const [editingVol, setEditingVol] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', mobileNumber: '' })
  const [formLoading, setFormLoading] = useState(false)

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Assign camp
  const [assignTarget, setAssignTarget] = useState(null)
  const [camps, setCamps] = useState([])
  const [selectedCampId, setSelectedCampId] = useState('')
  const [assignLoading, setAssignLoading] = useState(false)

  // Roles permissions
  const [canWrite] = useState(getCanWriteFromStorage)

  const fetchVolunteers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/volunteer-management', { params: { search, page, limit: LIMIT } })
      setVolunteers(res.data.data)
      setTotal(res.data.total)
      setTotalPages(res.data.totalPages)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load volunteers')
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => {
    const fetchTimer = setTimeout(() => {
      fetchVolunteers()
    }, 0)

    return () => clearTimeout(fetchTimer)
  }, [fetchVolunteers])

  // Fetch camps for assignment dropdown
  const fetchCamps = async () => {
    try {
      const res = await api.get('/api/volunteer-management/camps')
      setCamps(res.data.data)
    } catch { /* silent */ }
  }

  const openAddForm = () => {
    setEditingVol(null)
    setFormData({ name: '', email: '', password: '', mobileNumber: '' })
    setShowForm(true)
  }

  const openEditForm = (vol) => {
    setEditingVol(vol)
    setFormData({ name: vol.name, email: vol.email, password: '', mobileNumber: vol.mobileNumber })
    setShowForm(true)
  }

  const openAssignModal = (vol) => {
    setAssignTarget(vol)
    setSelectedCampId(vol.assignedCampId?._id || '')
    fetchCamps()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.mobileNumber || (!editingVol && !formData.password)) {
      toast.error('Please fill in all required fields')
      return
    }

    setFormLoading(true)
    try {
      if (editingVol) {
        const payload = { name: formData.name, email: formData.email, mobileNumber: formData.mobileNumber }
        if (formData.password) payload.password = formData.password
        await api.put(`/api/volunteer-management/${editingVol._id}`, payload)
        toast.success('Volunteer updated successfully')
      } else {
        await api.post('/api/volunteer-management', formData)
        toast.success('Volunteer created successfully')
      }
      setShowForm(false)
      fetchVolunteers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally {
      setFormLoading(false)
    }
  }

  const handleToggleActive = async (vol) => {
    try {
      await api.patch(`/api/volunteer-management/${vol._id}/toggle-active`)
      toast.success(`Volunteer ${vol.isActive ? 'deactivated' : 'activated'}`)
      fetchVolunteers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Toggle failed')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await api.delete(`/api/volunteer-management/${deleteTarget._id}`)
      toast.success('Volunteer deleted successfully')
      setDeleteTarget(null)
      fetchVolunteers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleAssignCamp = async () => {
    if (!assignTarget) return
    setAssignLoading(true)
    try {
      await api.patch(`/api/volunteer-management/${assignTarget._id}/assign-camp`, {
        campId: selectedCampId || null,
      })
      toast.success(selectedCampId ? 'Volunteer assigned to camp' : 'Volunteer unassigned from camp')
      setAssignTarget(null)
      fetchVolunteers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed')
    } finally {
      setAssignLoading(false)
    }
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div>
      {/* Header */}
      <div className="mgmt-page-header">
        <h1>Volunteer Management</h1>
        {canWrite && (
          <button className="btn-add" onClick={openAddForm}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Volunteer
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mgmt-toolbar">
        <div className="search-input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="search-input"
            type="text"
            placeholder="Search by name, email, or mobile..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{total} volunteer{total !== 1 ? 's' : ''} found</span>
      </div>

      {/* Table */}
      <div className="mgmt-table-card">
        <div className="mgmt-table-wrap">
          <table className="mgmt-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Assigned Camp</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '110px' }} /></td>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '140px' }} /></td>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '90px' }} /></td>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '120px' }} /></td>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '40px' }} /></td>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '80px' }} /></td>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '90px' }} /></td>
                  </tr>
                ))
              ) : volunteers.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="mgmt-empty">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <h3>No volunteers found</h3>
                      <p>{search ? 'Try a different search term' : 'Add your first volunteer to get started'}</p>
                    </div>
                  </td>
                </tr>
              ) : volunteers.map((vol) => (
                <tr key={vol._id}>
                  <td className="cell-name">{vol.name}</td>
                  <td className="cell-muted">{vol.email}</td>
                  <td>{vol.mobileNumber}</td>
                  <td>
                    {vol.assignedCampId ? (
                      <span className="camp-badge">{vol.assignedCampId.name}</span>
                    ) : (
                      <span className="camp-badge none">Unassigned</span>
                    )}
                  </td>
                  <td>
                    {canWrite ? (
                      <label className="status-toggle">
                        <input type="checkbox" checked={vol.isActive} onChange={() => handleToggleActive(vol)} />
                        <span className="toggle-slider" />
                      </label>
                    ) : (
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: vol.isActive ? 'rgba(46, 125, 50, 0.08)' : 'rgba(211, 47, 47, 0.08)',
                        color: vol.isActive ? '#2E7D32' : 'var(--primary-red)',
                        textTransform: 'capitalize'
                      }}>
                        {vol.isActive ? 'active' : 'inactive'}
                      </span>
                    )}
                  </td>
                  <td className="cell-muted">{formatDate(vol.createdAt)}</td>
                  <td>
                    <div className="action-btns">
                      {canWrite && (
                        <button className="btn-action" title="Edit" onClick={() => openEditForm(vol)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                      )}
                      <button className="btn-action" title="Assign Camp" onClick={() => openAssignModal(vol)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                          <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                      </button>
                      {canWrite && (
                        <button className="btn-action danger" title="Delete" onClick={() => setDeleteTarget(vol)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mgmt-pagination">
            <span className="pagination-info">Page {page} of {totalPages} ({total} total)</span>
            <div className="pagination-btns">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <span key={p} style={{ display: 'contents' }}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ padding: '0 4px', color: 'var(--text-muted)' }}>...</span>}
                    <button className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
                  </span>
                ))
              }
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingVol ? 'Edit Volunteer' : 'Add Volunteer'}>
        <form className="mgmt-form" onSubmit={handleSubmit}>
          <div className="mgmt-form-group">
            <label>Full Name *</label>
            <input type="text" placeholder="Enter full name" value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="mgmt-form-group">
            <label>Email Address *</label>
            <input type="email" placeholder="Enter email" value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div className="mgmt-form-group">
            <label>Mobile Number *</label>
            <input type="text" placeholder="Enter mobile number" value={formData.mobileNumber}
              onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })} />
          </div>
          <div className="mgmt-form-group">
            <label>{editingVol ? 'New Password (leave blank to keep)' : 'Password *'}</label>
            <input type="password" placeholder={editingVol ? 'Leave blank to keep current' : 'Enter password'}
              value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          </div>
          <button type="submit" className="mgmt-form-submit" disabled={formLoading}>
            {formLoading && <span className="btn-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />}
            {editingVol ? 'Update Volunteer' : 'Create Volunteer'}
          </button>
        </form>
      </Modal>

      {/* Assign Camp Modal */}
      <Modal isOpen={!!assignTarget} onClose={() => setAssignTarget(null)} title="Assign to Blood Camp" maxWidth="420px">
        <div className="mgmt-form">
          <p style={{ margin: '0 0 8px', fontSize: '14px', color: 'var(--text-muted)' }}>
            Assign <strong style={{ color: 'var(--text-main)' }}>{assignTarget?.name}</strong> to a blood camp.
          </p>
          <div className="mgmt-form-group">
            <label>Select Camp</label>
            <select value={selectedCampId} onChange={(e) => setSelectedCampId(e.target.value)}>
              <option value="">— Unassigned —</option>
              {camps.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.status})
                </option>
              ))}
            </select>
          </div>
          <button className="mgmt-form-submit" onClick={handleAssignCamp} disabled={assignLoading}>
            {assignLoading && <span className="btn-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />}
            {selectedCampId ? 'Assign Camp' : 'Unassign'}
          </button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Volunteer"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteLoading}
      />
    </div>
  )
}

export default VolunteerManagement
