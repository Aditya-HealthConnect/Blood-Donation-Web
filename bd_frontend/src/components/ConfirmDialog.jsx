import Modal from './Modal.jsx'

/**
 * Reusable Confirm Dialog built on Modal.
 * Props: isOpen, onClose, onConfirm, title, message, confirmText, isLoading, variant ('danger' | 'warning')
 */
function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Delete',
  isLoading = false,
  variant = 'danger',
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="400px">
      <div className={`confirm-icon ${variant}`}>
        {variant === 'danger' ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        )}
      </div>
      <div className="confirm-text">
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
      <div className="confirm-actions">
        <button className="btn-cancel" onClick={onClose} disabled={isLoading}>
          Cancel
        </button>
        <button className="btn-danger" onClick={onConfirm} disabled={isLoading}>
          {isLoading && <span className="btn-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />}
          {confirmText}
        </button>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
