import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import api from '../config/api'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import './UserManagement.css' // Import shared table styles

const LIMIT = 10

function DonorList() {
  const [donors, setDonors] = useState([])
  const [camps, setCamps] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Filters State
  const [search, setSearch] = useState('')
  const [campId, setCampId] = useState('')
  const [loading, setLoading] = useState(true)

  // Edit modal states
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingDonor, setEditingDonor] = useState(null)
  const [editLoading, setEditLoading] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    mobileNumber: '',
    age: '',
    gender: '',
    bloodGroup: '',
    address: '',
    campId: '',
    donationDate: '',
  })

  // Delete confirm states
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Auth roles permissions check
  const [canManage, setCanManage] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('admin')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setCanManage(['Super Admin', 'Admin'].includes(parsed.role))
      } catch { /* silent */ }
    }
  }, [])

  // Fetch active / all camps for filters
  useEffect(() => {
    const fetchCamps = async () => {
      try {
        const res = await api.get('/api/volunteer-management/camps')
        setCamps(res.data.data)
      } catch { /* silent */ }
    }
    fetchCamps()
  }, [])

  // Fetch donors list
  const fetchDonors = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/donors', {
        params: { search, campId, page, limit: LIMIT },
      })
      setDonors(res.data.data)
      setTotal(res.data.total)
      setTotalPages(res.data.totalPages)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch donors list')
    } finally {
      setLoading(false)
    }
  }, [search, campId, page])

  useEffect(() => {
    fetchDonors()
  }, [fetchDonors])

  // Reset page when criteria changes
  useEffect(() => {
    setPage(1)
  }, [search, campId])

  // Open Edit Modal prefilled
  const handleOpenEdit = (donor) => {
    setEditingDonor(donor)
    setEditForm({
      name: donor.name,
      mobileNumber: donor.mobileNumber,
      age: donor.age,
      gender: donor.gender,
      bloodGroup: donor.bloodGroup,
      address: donor.address,
      campId: donor.campId,
      donationDate: donor.donationDate ? new Date(donor.donationDate).toISOString().split('T')[0] : '',
    })
    setEditModalOpen(true)
  }

  // Edit submit handler
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editingDonor) return

    // Basic Validation
    if (!editForm.name.trim() || !editForm.mobileNumber.trim() || !editForm.age || !editForm.gender || !editForm.bloodGroup || !editForm.address.trim() || !editForm.campId || !editForm.donationDate) {
      toast.error('Please fill in all form fields')
      return
    }

    const ageNum = parseInt(editForm.age)
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 65) {
      toast.error('Donor must be between 18 and 65 years old')
      return
    }

    if (!/^\d{10}$/.test(editForm.mobileNumber.trim())) {
      toast.error('Please enter a valid 10-digit mobile number')
      return
    }

    setEditLoading(true)
    try {
      await api.put(`/api/donors/${editingDonor.id}`, editForm)
      toast.success('Donor details updated successfully')
      setEditModalOpen(false)
      fetchDonors()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update donor')
    } finally {
      setEditLoading(false)
    }
  }

  // Delete submit handler
  const handleDeleteSubmit = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await api.delete(`/api/donors/${deleteTarget.id}`)
      toast.success('Donor record deleted successfully')
      setDeleteTarget(null)
      fetchDonors()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete donor')
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
    <div className="donor-list-container">
      {/* Title */}
      <div className="mgmt-page-header">
        <h1>Donors Registry</h1>
      </div>

      {/* Toolbar / Search Filter */}
      <div className="mgmt-toolbar">
        <div className="search-input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="search-input"
            type="text"
            placeholder="Search by name or mobile number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Camp dropdown filter */}
        <select
          className="filter-select"
          value={campId}
          onChange={(e) => setCampId(e.target.value)}
          style={{ width: '220px', height: '42px' }}
        >
          <option value="">All Camp Events</option>
          {camps.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {total} record{total !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Main Table Card */}
      <div className="mgmt-table-card">
        <div className="mgmt-table-wrap">
          <table className="mgmt-table">
            <thead>
              <tr>
                <th>Donor Name</th>
                <th>Mobile Number</th>
                <th>Age & Gender</th>
                <th>Blood Group</th>
                <th>Camp Location</th>
                <th>Donation Date</th>
                {canManage && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '130px' }} /></td>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '100px' }} /></td>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '80px' }} /></td>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '40px' }} /></td>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '140px' }} /></td>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '90px' }} /></td>
                    {canManage && <td><div className="mgmt-skel-cell skeleton" style={{ width: '70px' }} /></td>}
                  </tr>
                ))
              ) : donors.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 7 : 6}>
                    <div className="mgmt-empty">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <h3>No manual donors found</h3>
                      <p>Try modifying your search query or camp selection filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                donors.map((donor) => (
                  <tr key={donor.id}>
                    <td className="cell-name">{donor.name}</td>
                    <td className="cell-muted">{donor.mobileNumber}</td>
                    <td>{donor.age} ({donor.gender})</td>
                    <td>
                      <span style={{
                        background: 'rgba(211,47,47,0.08)',
                        color: 'var(--primary-red)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '12px',
                      }}>
                        {donor.bloodGroup}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{donor.campName}</td>
                    <td className="cell-muted">{formatDate(donor.donationDate)}</td>
                    {canManage && (
                      <td>
                        <div className="action-btns">
                          <button
                            className="btn-action"
                            title="Edit Record"
                            onClick={() => handleOpenEdit(donor)}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            className="btn-action danger"
                            title="Delete Record"
                            onClick={() => setDeleteTarget(donor)}
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

      {/* Edit Donor Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Walk-in Donor Details"
      >
        <form onSubmit={handleEditSubmit} className="mgmt-form">
          <div className="mgmt-form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
          </div>

          <div className="mgmt-form-group">
            <label>Mobile Number</label>
            <input
              type="text"
              value={editForm.mobileNumber}
              onChange={(e) => setEditForm({ ...editForm, mobileNumber: e.target.value })}
            />
          </div>

          <div className="mgmt-form-group">
            <label>Age</label>
            <input
              type="number"
              value={editForm.age}
              onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
            />
          </div>

          <div className="mgmt-form-group">
            <label>Gender</label>
            <select
              value={editForm.gender}
              onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
              className="filter-select"
              style={{ width: '100%', height: '42px' }}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="mgmt-form-group">
            <label>Blood Group</label>
            <select
              value={editForm.bloodGroup}
              onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
              className="filter-select"
              style={{ width: '100%', height: '42px' }}
            >
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>

          <div className="mgmt-form-group">
            <label>Donation Date</label>
            <input
              type="date"
              value={editForm.donationDate}
              onChange={(e) => setEditForm({ ...editForm, donationDate: e.target.value })}
            />
          </div>

          <div className="mgmt-form-group">
            <label>Associated Camp</label>
            <select
              value={editForm.campId}
              onChange={(e) => setEditForm({ ...editForm, campId: e.target.value })}
              className="filter-select"
              style={{ width: '100%', height: '42px' }}
            >
              {camps.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mgmt-form-group">
            <label>Address</label>
            <textarea
              value={editForm.address}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              style={{ height: '70px', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid var(--border-color)', width: '100%', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <button type="submit" className="mgmt-form-submit" disabled={editLoading}>
            {editLoading && <span className="btn-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />}
            Save Changes
          </button>
        </form>
      </Modal>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteSubmit}
        title="Delete Donor Record"
        message={`Are you sure you want to delete the donor record of "${deleteTarget?.name}"? This action is permanent and cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteLoading}
      />
    </div>
  )
}

export default DonorList
