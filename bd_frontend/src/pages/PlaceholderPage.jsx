import { useLocation } from 'react-router-dom'

/**
 * Generic placeholder page for routes not yet implemented.
 * Automatically derives the page title from the URL path.
 */
function PlaceholderPage() {
  const location = useLocation()

  // Derive title from last segment of the path
  const segment = location.pathname.split('/').filter(Boolean).pop() || 'Page'
  const title = segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 108px)',
      gap: '12px',
      textAlign: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        background: 'rgba(211, 47, 47, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '8px',
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary-red)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </div>
      <h1 style={{
        margin: 0,
        fontSize: '24px',
        fontWeight: 700,
        color: 'var(--text-main)',
      }}>
        {title}
      </h1>
      <p style={{
        margin: 0,
        fontSize: '15px',
        color: 'var(--text-muted)',
        maxWidth: '400px',
      }}>
        This section is under development and will be available soon.
      </p>
    </div>
  )
}

export default PlaceholderPage
