import Navigation from '../components/Navigation.jsx'

function HomePage() {
  return (
    <main className="app-shell">
      <Navigation />

      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Community blood donation platform</p>
          <h1>Donate blood. Save lives. Stay connected with every camp.</h1>
          <p className="hero-text">
            Find active camps, follow live donation updates, and revisit the
            moments that make each blood donation drive meaningful.
          </p>
        </div>

        <div className="info-panel" aria-label="Main page actions">
          <span>Explore the platform</span>
          <strong>Blood Donation Hub</strong>
          <p>Use these quick actions to open the main public sections.</p>
          <div className="info-actions">
            <a className="primary-action" href="#view-camps">
              View Camps
            </a>
            <a className="secondary-action" href="#live-dashboard">
              Live Dashboard
            </a>
            <a className="secondary-action" href="#gallery">
              Gallery
            </a>
          </div>
        </div>
      </section>

      <section className="feature-grid" id="campaigns" aria-label="Core features">
        <article>
          <span>01</span>
          <h2>Campaign Management</h2>
          <p>Create blood donation events and keep campaign details organized.</p>
        </article>
        <article id="donors">
          <span>02</span>
          <h2>Donor Registration</h2>
          <p>Capture donor information through a focused registration workflow.</p>
        </article>
        <article id="contact">
          <span>03</span>
          <h2>Backend API</h2>
          <p>Use the Express API foundation for health checks and future routes.</p>
        </article>
      </section>
    </main>
  )
}

export default HomePage
