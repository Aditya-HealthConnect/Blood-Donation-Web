import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import api from '../config/api'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import './UserManagement.css' // Reuse general CRUD designs
import './BloodCamps.css'

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
    branch: 'General',
    date: '',
    startTime: '09:00 AM',
    endTime: '04:00 PM',
    status: 'upcoming',
    targetDonors: 100,
    organizer: '',
    organizers: [],
    description: '',
  })
  const [newOrgName, setNewOrgName] = useState('')
  const [newOrgLocation, setNewOrgLocation] = useState('')
  const [newOrgRoomNumber, setNewOrgRoomNumber] = useState('')
  const [newOrgActualDonors, setNewOrgActualDonors] = useState('')

  // Manage Organizers page state
  const [activeManageCamp, setActiveManageCamp] = useState(null)
  const [manageOrgsList, setManageOrgsList] = useState([])

  // Delete modal states
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Auth permissions
  const [canWrite] = useState(getCanWriteFromStorage)

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
    const fetchTimer = setTimeout(() => {
      fetchCamps()
    }, 0)

    return () => clearTimeout(fetchTimer)
  }, [fetchCamps])

  // Open add modal
  const openAddModal = () => {
    setEditingCamp(null)
    setFormData({
      name: '',
      location: '',
      branch: 'General',
      date: '',
      startTime: '09:00 AM',
      endTime: '04:00 PM',
      status: 'upcoming',
      targetDonors: 100,
      organizer: '',
      organizers: [],
      description: '',
    })
    setNewOrgName('')
    setNewOrgLocation('')
    setNewOrgRoomNumber('')
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
      organizers: (camp.organizers && camp.organizers.length > 0)
        ? camp.organizers
        : (camp.organizer ? [{ name: camp.organizer, location: camp.location || '', roomNumber: '' }] : []),
      description: camp.description || '',
    })
    setNewOrgName('')
    setNewOrgLocation('')
    setNewOrgRoomNumber('')
    setShowModal(true)
  }

  // Handle Form changes
  const handleInputChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }))
  }

  // Add / Edit submit
  const handleFormSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.date) {
      toast.error('Camp Name and Date are required')
      return
    }
    if (!formData.organizers || formData.organizers.length === 0) {
      toast.error('At least one organizer with a location is required')
      return
    }

    setModalLoading(true)
    try {
      const payload = { ...formData }
      if (formData.organizers && formData.organizers.length > 0) {
        payload.organizer = formData.organizers[0].name
        payload.location = formData.organizers[0].location
      }

      if (editingCamp) {
        await api.put(`/api/blood-camps/${editingCamp.id}`, payload)
        toast.success('Blood camp updated successfully')
      } else {
        await api.post('/api/blood-camps', payload)
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

  // Manage Organizers handler functions
  const openManageOrganizers = (camp) => {
    setActiveManageCamp(camp)
    const resolvedOrgs = (camp.organizers && camp.organizers.length > 0)
      ? camp.organizers
      : (camp.organizer ? [{ name: camp.organizer, location: camp.location || '', roomNumber: '', actualDonors: camp.actualDonors || 0 }] : [])
    setManageOrgsList(resolvedOrgs)
    setNewOrgName('')
    setNewOrgLocation('')
    setNewOrgRoomNumber('')
    setNewOrgActualDonors('')
  }

  const handleUpdateManageOrgField = (index, field, value) => {
    setManageOrgsList((prev) =>
      prev.map((org, idx) => (idx === index ? { ...org, [field]: value } : org))
    )
  }

  const handleAddOrganizerToManageList = () => {
    if (!newOrgName.trim() || !newOrgLocation.trim()) {
      toast.error('Organizer name and location/venue are required')
      return
    }
    const newOrg = {
      name: newOrgName.trim(),
      location: newOrgLocation.trim(),
      roomNumber: newOrgRoomNumber.trim(),
      actualDonors: parseInt(newOrgActualDonors) || 0,
    }
    setManageOrgsList((prev) => [...prev, newOrg])
    setNewOrgName('')
    setNewOrgLocation('')
    setNewOrgRoomNumber('')
    setNewOrgActualDonors('')
  }

  const handleSaveOrganizers = async () => {
    if (manageOrgsList.length === 0) {
      toast.error('At least one organizer is required')
      return
    }
    setModalLoading(true)
    try {
      const totalActual = manageOrgsList.reduce((sum, o) => sum + (Number(o.actualDonors) || 0), 0);
      const payload = {
        organizers: manageOrgsList,
        organizer: manageOrgsList[0].name,
        location: manageOrgsList[0].location,
        actualDonors: totalActual,
      }
      await api.put(`/api/blood-camps/${activeManageCamp.id}`, payload)
      toast.success('Organizers list and donation counts saved successfully')
      setActiveManageCamp(null)
      fetchCamps()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save organizers')
    } finally {
      setModalLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  if (activeManageCamp) {
    return (
      <div className="camps-management-container">
        {/* Manage Organizers Sub-Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <button 
              onClick={() => setActiveManageCamp(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, padding: '6px 0', marginBottom: '8px' }}
            >
              ← Back to Camps
            </button>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: 'var(--text-main)' }}>
              Manage Organizers
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
              Camp: <strong style={{ color: 'var(--primary-red)' }}>{activeManageCamp.name}</strong>
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="button" 
              onClick={() => setActiveManageCamp(null)}
              className="btn-add" 
              style={{ background: 'var(--bg-neutral)', color: 'var(--text-main)', border: '1px solid var(--border-color)', margin: 0 }}
            >
              Cancel
            </button>
            <button 
              type="button" 
              onClick={handleSaveOrganizers}
              className="btn-add"
              style={{ margin: 0 }}
              disabled={modalLoading}
            >
              {modalLoading ? <span className="btn-spinner" /> : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Add New Organizer Card */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 600 }}>Add New Organizer</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr', gap: '12px', alignItems: 'end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Organizer Name *</label>
              <input
                type="text"
                placeholder="e.g. GGH, Rampachodavaram"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                style={{ height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Location/Venue *</label>
              <input
                type="text"
                placeholder="e.g. Cotton Bhavan, Seminar Hall"
                value={newOrgLocation}
                onChange={(e) => setNewOrgLocation(e.target.value)}
                style={{ height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Room No</label>
              <input
                type="text"
                placeholder="e.g. 208"
                value={newOrgRoomNumber}
                onChange={(e) => setNewOrgRoomNumber(e.target.value)}
                style={{ height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Donated Units</label>
              <input
                type="number"
                placeholder="e.g. 15"
                value={newOrgActualDonors}
                onChange={(e) => setNewOrgActualDonors(e.target.value)}
                style={{ height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', outline: 'none' }}
              />
            </div>
          </div>
          <button
            type="button"
            className="btn-add"
            style={{ width: '100%', justifyContent: 'center', height: '36px', fontSize: '12px', marginTop: '12px', marginBottom: 0 }}
            onClick={handleAddOrganizerToManageList}
          >
            + Add Organizer to Camp
          </button>
        </div>

        {/* Organizers List Table */}
        <div className="mgmt-table-card">
          <div className="mgmt-table-wrap">
            <table className="mgmt-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>S.No</th>
                  <th>Name of the Organization</th>
                  <th>Venue for Organization</th>
                  <th style={{ width: '120px' }}>Room No</th>
                  <th style={{ width: '160px' }}>Separated Donated Units</th>
                  <th style={{ width: '80px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {manageOrgsList.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      No organizers added to this camp yet. Add one above.
                    </td>
                  </tr>
                ) : (
                  manageOrgsList.map((org, index) => (
                    <tr key={index}>
                      <td style={{ fontWeight: 600 }}>{index + 1}</td>
                      <td>
                        <input
                          type="text"
                          value={org.name}
                          onChange={(e) => handleUpdateManageOrgField(index, 'name', e.target.value)}
                          style={{ width: '100%', height: '34px', padding: '0 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '13px' }}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={org.location}
                          onChange={(e) => handleUpdateManageOrgField(index, 'location', e.target.value)}
                          style={{ width: '100%', height: '34px', padding: '0 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '13px' }}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={org.roomNumber}
                          onChange={(e) => handleUpdateManageOrgField(index, 'roomNumber', e.target.value)}
                          style={{ width: '100%', height: '34px', padding: '0 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '13px' }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={org.actualDonors}
                          onChange={(e) => handleUpdateManageOrgField(index, 'actualDonors', parseInt(e.target.value) || 0)}
                          style={{ width: '100%', height: '34px', padding: '0 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '13px', fontWeight: 600 }}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = manageOrgsList.filter((_, idx) => idx !== index);
                            setManageOrgsList(updated);
                          }}
                          style={{ background: 'none', border: 'none', color: 'var(--primary-red)', cursor: 'pointer', padding: '6px' }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summed Up Total Counter */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', padding: '12px 24px', background: 'var(--bg-neutral)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
            Total Camp Donated Count: <span style={{ color: 'var(--primary-red)' }}>{manageOrgsList.reduce((sum, o) => sum + (Number(o.actualDonors) || 0), 0)} units</span>
          </span>
        </div>
      </div>
    )
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
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>

        <select
          className="filter-select"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
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
                <th style={{ textAlign: 'center' }}>Organisers Count</th>
                <th>Date & Time</th>
                <th>Actual Donated</th>
                <th>Status</th>
                {canWrite && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '140px' }} /></td>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '40px', margin: '0 auto' }} /></td>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '130px' }} /></td>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '90px' }} /></td>
                    <td><div className="mgmt-skel-cell skeleton" style={{ width: '70px' }} /></td>
                    {canWrite && <td><div className="mgmt-skel-cell skeleton" style={{ width: '70px' }} /></td>}
                  </tr>
                ))
              ) : camps.length === 0 ? (
                <tr>
                  <td colSpan={canWrite ? 6 : 5}>
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
                    <td 
                      style={{ cursor: 'pointer', textAlign: 'center' }}
                      onClick={() => openManageOrganizers(camp)}
                    >
                      <span style={{ 
                        color: 'var(--primary-red)', 
                        fontWeight: 600,
                        textDecoration: 'underline',
                        fontSize: '14px'
                      }}>
                        {camp.organizers ? camp.organizers.length : 0}
                      </span>
                    </td>
                    <td>
                      <div>{formatDate(camp.date)}</div>
                      <span className="cell-muted" style={{ fontSize: '11px' }}>{camp.startTime} - {camp.endTime}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {camp.actualDonors} units
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

          {/* Location is managed per-organizer */}

          {/* Branch is default set to General */}

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

          <div className="mgmt-form-group">
            <label style={{ fontWeight: 600, color: 'var(--text-main)' }}>Organizers & Locations *</label>
            
            {/* Added organizers list preview */}
            {formData.organizers && formData.organizers.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto', padding: '8px', background: 'var(--bg-neutral)', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '12px' }}>
                {formData.organizers.map((org, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>{org.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        📍 {org.location} {org.roomNumber && `| Room: ${org.roomNumber}`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = formData.organizers.filter((_, idx) => idx !== index);
                        handleInputChange('organizers', updated);
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-red)', cursor: 'pointer', padding: '4px' }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '12px', border: '1px dashed var(--border-color)', borderRadius: '8px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                No organizers added yet. Add at least one organizer below.
              </div>
            )}

            {/* Form inputs to add a new organizer */}
            <div style={{ background: 'var(--bg-neutral)', borderRadius: '8px', padding: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Organizer Name</label>
                  <input
                    type="text"
                    placeholder="e.g. CSE Dept"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Location (Text Area)</label>
                  <textarea
                    placeholder="e.g. IT Seminar Hall"
                    value={newOrgLocation}
                    onChange={(e) => setNewOrgLocation(e.target.value)}
                    style={{ width: '100%', height: '38px', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', outline: 'none', resize: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Room No</label>
                  <input
                    type="text"
                    placeholder="e.g. 208"
                    value={newOrgRoomNumber}
                    onChange={(e) => setNewOrgRoomNumber(e.target.value)}
                    style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>
              <button
                type="button"
                className="btn-add"
                style={{ width: '100%', justifyContent: 'center', height: '34px', fontSize: '12px', margin: 0 }}
                onClick={() => {
                  if (!newOrgName.trim() || !newOrgLocation.trim()) {
                    toast.error('Organizer name and location are required');
                    return;
                  }
                  const updated = [...(formData.organizers || []), { 
                    name: newOrgName.trim(), 
                    location: newOrgLocation.trim(), 
                    roomNumber: newOrgRoomNumber.trim() 
                  }];
                  handleInputChange('organizers', updated);
                  setNewOrgName('');
                  setNewOrgLocation('');
                  setNewOrgRoomNumber('');
                }}
              >
                + Add Organizer
              </button>
            </div>
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
