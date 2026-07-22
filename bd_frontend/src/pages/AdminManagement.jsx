import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import api from '../config/api'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import './UserManagement.css'

const LIMIT = 10

function AdminManagement() {
  const [admins, setAdmins] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  // Modal states
  const [showForm, setShowForm] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', mobileNumber: '' })
  const [formLoading, setFormLoading] = useState(false)

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/admin-management', { params: { search, page, limit: LIMIT } })
      setAdmins(res.data.data)
      setTotal(res.data.total)
      setTotalPages(res.data.totalPages)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load admins')
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => {
    const fetchTimer = setTimeout(() => {
      fetchAdmins()
    }, 0)

    return () => clearTimeout(fetchTimer)
  }, [fetchAdmins])

  const openAddForm = () => {
    setEditingAdmin(null)
    setFormData({ name: '', email: '', password: '', mobileNumber: '' })
    setShowForm(true)
  }

  const openEditForm = (admin) => {
    setEditingAdmin(admin)
    setFormData({ name: admin.name, email: admin.email, password: '', mobileNumber: admin.mobileNumber || '' })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.mobileNumber || (!editingAdmin && !formData.password)) {
      toast.error('Please fill in all required fields')
      return
    }

    setFormLoading(true)
    try {
      if (editingAdmin) {
        const payload = { name: formData.name, email: formData.email, mobileNumber: formData.mobileNumber }
        if (formData.password) payload.password = formData.password
        await api.put(`/api/admin-management/${editingAdmin._id}`, payload)
        toast.success('Admin updated successfully')
      } else {
        await api.post('/api/admin-management', formData)
        toast.success('Admin created successfully')
      }
      setShowForm(false)
      fetchAdmins()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally {
      setFormLoading(false)
    }
  }

  const handleToggleActive = async (admin) => {
    try {
      await api.patch(`/api/admin-management/${admin._id}/toggle-active`)
      toast.success(`Admin ${admin.isActive ? 'deactivated' : 'activated'}`)
      fetchAdmins()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Toggle failed')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await api.delete(`/api/admin-management/${deleteTarget._id}`)
      toast.success('Admin deleted successfully')
      setDeleteTarget(null)
      fetchAdmins()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    } finally {
      setDeleteLoading(false)
    }
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div>
      {/* Header */}
      <div className="mgmt-page-header">
        <h1>Admin Management</h1>
        <button className="btn-add" onClick={openAddForm}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Admin
        </button>
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
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{total} admin{total !== 1 ? 's' : ''} found</span>
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
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '120px' }} /></td>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '160px' }} /></td>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '90px' }} /></td>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '40px' }} /></td>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '90px' }} /></td>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '70px' }} /></td>
                  </tr>
                ))
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="mgmt-empty">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                      <h3>No admins found</h3>
                      <p>{search ? 'Try a different search term' : 'Add your first admin to get started'}</p>
                    </div>
                  </td>
                </tr>
              ) : admins.map((admin) => (
                <tr key={admin._id}>
                  <td className="cell-name">{admin.name}</td>
                  <td className="cell-muted">{admin.email}</td>
                  <td>{admin.mobileNumber || '—'}</td>
                  <td>
                    <label className="status-toggle">
                      <input type="checkbox" checked={admin.isActive} onChange={() => handleToggleActive(admin)} />
                      <span className="toggle-slider" />
                    </label>
                  </td>
                  <td className="cell-muted">{formatDate(admin.createdAt)}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-action" title="Edit" onClick={() => openEditForm(admin)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button className="btn-action danger" title="Delete" onClick={() => setDeleteTarget(admin)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
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
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingAdmin ? 'Edit Admin' : 'Add Admin'}>
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
            <label>{editingAdmin ? 'New Password (leave blank to keep)' : 'Password *'}</label>
            <input type="password" placeholder={editingAdmin ? 'Leave blank to keep current' : 'Enter password'}
              value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          </div>
          <button type="submit" className="mgmt-form-submit" disabled={formLoading}>
            {formLoading && <span className="btn-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />}
            {editingAdmin ? 'Update Admin' : 'Create Admin'}
          </button>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Admin"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteLoading}
      />
    </div>
  )
}

export default AdminManagement
