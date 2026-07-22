import { useState, useEffect, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import api from '../config/api'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import './UserManagement.css' // Import shared form buttons
import './Gallery.css'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function getCanManageFromStorage() {
  const stored = localStorage.getItem('admin')
  if (!stored) return false

  try {
    const parsed = JSON.parse(stored)
    return ['Super Admin', 'Admin'].includes(parsed.role)
  } catch {
    return false
  }
}

function Gallery() {
  const [images, setImages] = useState([])
  const [camps, setCamps] = useState([])
  const [campFilter, setCampFilter] = useState('')
  const [loading, setLoading] = useState(true)

  // Auth / Role permissions check
  const [canManage] = useState(getCanManageFromStorage)

  // Modals / forms states
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [lightboxImage, setLightboxImage] = useState(null)

  // Upload Form fields
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadPreview, setUploadPreview] = useState('')
  const [uploadCaption, setUploadCaption] = useState('')
  const [uploadCampId, setUploadCampId] = useState('')
  const [uploadLoading, setUploadLoading] = useState(false)
  const fileInputRef = useRef(null)

  // Edit Form fields
  const [editingImage, setEditingImage] = useState(null)
  const [editCaption, setEditCaption] = useState('')
  const [editCampId, setEditCampId] = useState('')
  const [editLoading, setEditLoading] = useState(false)

  // Fetch all camps for album selections
  const fetchCamps = async () => {
    try {
      const res = await api.get('/api/volunteer-management/camps')
      setCamps(res.data.data)
    } catch { /* silent */ }
  }

  // Fetch gallery list
  const fetchGallery = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/gallery', {
        params: { campId: campFilter || undefined },
      })
      setImages(res.data.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch gallery')
    } finally {
      setLoading(false)
    }
  }, [campFilter])

  useEffect(() => {
    const fetchTimer = setTimeout(() => {
      fetchGallery()
      fetchCamps()
    }, 0)

    return () => clearTimeout(fetchTimer)
  }, [fetchGallery])

  // Handle file preview change
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File is too large. Max size is 5MB.')
      return
    }

    setUploadFile(file)
    setUploadPreview(URL.createObjectURL(file))
  }

  // Submit new photo upload
  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    if (!uploadFile) {
      toast.error('Please select an image to upload')
      return
    }

    const formData = new FormData()
    formData.append('image', uploadFile)
    formData.append('caption', uploadCaption)
    formData.append('campId', uploadCampId)

    try {
      setUploadLoading(true)
      await api.post('/api/gallery/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Photo uploaded successfully')
      
      // Close & reset
      setUploadModalOpen(false)
      setUploadFile(null)
      setUploadPreview('')
      setUploadCaption('')
      setUploadCampId('')
      
      fetchGallery() // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploadLoading(false)
    }
  }

  // Open edit modal
  const openEditModal = (img) => {
    setEditingImage(img)
    setEditCaption(img.caption || '')
    setEditCampId(img.campId || '')
    setEditModalOpen(true)
  }

  // Submit edit details
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editingImage) return

    try {
      setEditLoading(true)
      await api.put(`/api/gallery/${editingImage.id}`, {
        caption: editCaption,
        campId: editCampId || null,
      })
      toast.success('Photo details updated')
      setEditModalOpen(false)
      fetchGallery()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setEditLoading(false)
    }
  }

  // Submit delete confirmation
  const handleDeleteSubmit = async () => {
    if (!deleteTarget) return
    try {
      setDeleteLoading(true)
      await api.delete(`/api/gallery/${deleteTarget.id}`)
      toast.success('Photo deleted successfully')
      setDeleteTarget(null)
      fetchGallery()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete photo')
    } finally {
      setDeleteLoading(false)
    }
  }

  // Close lightbox on escape keypress
  useEffect(() => {
    if (!lightboxImage) return
    const handleEsc = (e) => {
      if (e.key === 'Escape') setLightboxImage(null)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [lightboxImage])

  return (
    <div className="gallery-container">
      {/* Page Header */}
      <div className="mgmt-page-header">
        <h1>Photo Gallery</h1>
        {canManage && (
          <button className="btn-add" onClick={() => setUploadModalOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Upload Photo
          </button>
        )}
      </div>

      {/* Filter and Controls */}
      <div className="gallery-controls">
        <div className="gallery-filter">
          <label>Album View</label>
          <select
            className="filter-select"
            value={campFilter}
            onChange={(e) => setCampFilter(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="">All Events / General</option>
            {camps.map(c => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.status})
              </option>
            ))}
          </select>
        </div>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Showing {images.length} photo{images.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Grid of Images */}
      {loading ? (
        <div className="gallery-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="gallery-skel-card skeleton" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="gallery-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <h3>No photos found</h3>
          <p>{campFilter ? 'This camp album doesn&apos;t contain any pictures yet.' : 'Upload your first blood camp event photo to get started.'}</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {images.map((img) => (
            <div
              key={img.id}
              className="gallery-card"
              onClick={() => setLightboxImage(img)}
            >
              <div className="gallery-img-wrapper">
                <img
                  src={img.imageUrl.startsWith('http') ? img.imageUrl : `${api.defaults.baseURL}${img.imageUrl}`}
                  alt={img.caption || 'Event Image'}
                  className="gallery-img"
                  loading="lazy"
                />
                
                {/* Info overlay shown on hover */}
                <div className="gallery-overlay">
                  {img.caption && <p className="overlay-caption">{img.caption}</p>}
                  <p className="overlay-camp">{img.campName || 'General Event'}</p>
                </div>

                {/* Edit/Delete Actions (hover) */}
                {canManage && (
                  <div
                    className="gallery-card-actions"
                    onClick={(e) => e.stopPropagation()} // Prevent lightbox from opening
                  >
                    <button
                      className="btn-card-action"
                      title="Edit Caption/Camp"
                      onClick={() => openEditModal(img)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      className="btn-card-action delete"
                      title="Delete Image"
                      onClick={() => setDeleteTarget(img)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Image Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false)
          setUploadFile(null)
          setUploadPreview('')
          setUploadCaption('')
          setUploadCampId('')
        }}
        title="Upload Event Photo"
      >
        <form className="mgmt-form" onSubmit={handleUploadSubmit}>
          {/* File input click-trigger preview container */}
          <div className="mgmt-form-group">
            <label>Select Event Image *</label>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <div
              className="upload-preview-container"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadPreview ? (
                <img src={uploadPreview} alt="Upload Preview" className="upload-preview-image" />
              ) : (
                <div className="upload-preview-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span>Click to choose an image</span>
                  <span style={{ fontSize: '11px', opacity: 0.7 }}>JPG, PNG, WEBP or GIF (Max 5MB)</span>
                </div>
              )}
            </div>
          </div>

          <div className="mgmt-form-group">
            <label>Caption / Short Description</label>
            <input
              type="text"
              placeholder="e.g. Students donating blood in IT seminar hall"
              value={uploadCaption}
              onChange={(e) => setUploadCaption(e.target.value)}
            />
          </div>

          <div className="mgmt-form-group">
            <label>Link to Blood Camp Drive</label>
            <select
              value={uploadCampId}
              onChange={(e) => setUploadCampId(e.target.value)}
              className="filter-select"
            >
              <option value="">— Uncategorized / General Event —</option>
              {camps.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name} ({formatDate(c.date)})
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="mgmt-form-submit" disabled={uploadLoading || !uploadFile}>
            {uploadLoading && <span className="btn-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />}
            Upload Photo
          </button>
        </form>
      </Modal>

      {/* Edit Image Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Photo Details"
      >
        <form className="mgmt-form" onSubmit={handleEditSubmit}>
          <div className="mgmt-form-group">
            <label>Caption / Description</label>
            <input
              type="text"
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
            />
          </div>

          <div className="mgmt-form-group">
            <label>Associated Blood Camp</label>
            <select
              value={editCampId}
              onChange={(e) => setEditCampId(e.target.value)}
              className="filter-select"
            >
              <option value="">— Uncategorized / General Event —</option>
              {camps.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name} ({formatDate(c.date)})
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="mgmt-form-submit" disabled={editLoading}>
            {editLoading && <span className="btn-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />}
            Save Changes
          </button>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteSubmit}
        title="Delete Photo"
        message="Are you sure you want to delete this photo from the gallery? This action is permanent and will remove the file from the server disk."
        confirmText="Delete"
        isLoading={deleteLoading}
      />

      {/* Image Lightbox View */}
      {lightboxImage && (
        <div className="lightbox-overlay" onClick={() => setLightboxImage(null)}>
          <button className="lightbox-close" onClick={() => setLightboxImage(null)} aria-label="Close Lightbox">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxImage.imageUrl.startsWith('http') ? lightboxImage.imageUrl : `${api.defaults.baseURL}${lightboxImage.imageUrl}`}
              alt={lightboxImage.caption || 'Event Image'}
              className="lightbox-img"
            />
            <div className="lightbox-info">
              {lightboxImage.caption && <p className="lightbox-caption">{lightboxImage.caption}</p>}
              <p className="lightbox-camp">{lightboxImage.campName || 'General Event'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Gallery
