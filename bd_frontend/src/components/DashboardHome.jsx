import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import api from '../config/api'
import './DashboardHome.css'

/* ---- Color palette for charts ---- */
const CHART_COLORS = ['#D32F2F', '#8E1616', '#E57373', '#B71C1C', '#FF8A80', '#C62828', '#EF9A9A']
const STATUS_COLORS = { Donated: '#2E7D32', Attended: '#1976D2', Registered: '#E65100', Rejected: '#D32F2F' }

/* ---- Stat card icon SVGs ---- */
const icons = {
  camp: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  active: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  upcoming: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  registration: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  today: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  donor: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  blood: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C12 2 4 10 4 15a8 8 0 0 0 16 0C20 10 12 2 12 2z" />
    </svg>
  ),
}

/* ---- Custom Recharts Tooltip ---- */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
      borderRadius: '8px', padding: '10px 14px', boxShadow: '0 4px 12px var(--shadow-color)',
      fontSize: '13px',
    }}>
      <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>{p.name}: {p.value}</div>
      ))}
    </div>
  )
}

/* ---- Skeleton Components ---- */
function StatsSkeleton() {
  return (
    <div className="stats-grid">
      {Array.from({ length: 7 }).map((_, i) => (
        <div className="stat-card-skeleton" key={i}>
          <div className="stat-icon-skeleton skeleton" />
          <div className="stat-text-skeleton">
            <div className="skel-label skeleton" />
            <div className="skel-value skeleton" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ChartsSkeleton() {
  return (
    <div className="charts-grid">
      {Array.from({ length: 3 }).map((_, i) => (
        <div className="chart-skeleton" key={i}>
          <div className="chart-skel-title skeleton" />
          <div className="chart-skel-body skeleton" />
        </div>
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="table-card">
      <div className="table-card-header">
        <div className="skeleton" style={{ width: '140px', height: '14px' }} />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div className="table-skel-row" key={i}>
          <div className="table-skel-cell skeleton" style={{ width: '25%' }} />
          <div className="table-skel-cell skeleton" style={{ width: '20%' }} />
          <div className="table-skel-cell skeleton" style={{ width: '15%' }} />
          <div className="table-skel-cell skeleton" style={{ width: '20%' }} />
          <div className="table-skel-cell skeleton" style={{ width: '12%' }} />
        </div>
      ))}
    </div>
  )
}

/* ---- Format date ---- */
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

/* ======= Main Component ======= */
function DashboardHome({ greeting = 'Welcome back' }) {
  const [stats, setStats] = useState(null)
  const [charts, setCharts] = useState(null)
  const [recentRegs, setRecentRegs] = useState(null)
  const [upcomingCamps, setUpcomingCamps] = useState(null)
  const [loading, setLoading] = useState(true)

  const [campsList, setCampsList] = useState([])
  const [selectedCampId, setSelectedCampId] = useState('')
  const [organizerStats, setOrganizerStats] = useState(null)
  const [organizerLoading, setOrganizerLoading] = useState(false)

  const fetchOrganizerStats = async (campId) => {
    if (!campId) {
      setOrganizerStats(null)
      return
    }
    try {
      setOrganizerLoading(true)
      const res = await api.get(`/api/dashboard/organizer-stats?campId=${campId}`)
      setOrganizerStats(res.data.data)
    } catch (err) {
      console.error('Failed to fetch organizer stats:', err)
    } finally {
      setOrganizerLoading(false)
    }
  }

  const handleCampChange = (campId) => {
    setSelectedCampId(campId)
    fetchOrganizerStats(campId)
  }

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, chartsRes, regsRes, campsRes, listRes] = await Promise.all([
          api.get('/api/dashboard/stats'),
          api.get('/api/dashboard/charts'),
          api.get('/api/dashboard/recent-registrations'),
          api.get('/api/dashboard/upcoming-camps'),
          api.get('/api/blood-camps/all-list'),
        ])
        setStats(statsRes.data.data)
        setCharts(chartsRes.data.data)
        setRecentRegs(regsRes.data.data)
        setUpcomingCamps(campsRes.data.data)

        const camps = listRes.data.data
        setCampsList(camps)
        if (camps.length > 0) {
          setSelectedCampId(camps[0].id)
          setOrganizerLoading(true)
          const statsResOrg = await api.get(`/api/dashboard/organizer-stats?campId=${camps[0].id}`)
          setOrganizerStats(statsResOrg.data.data)
          setOrganizerLoading(false)
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const admin = JSON.parse(localStorage.getItem('admin') || '{}')

  const statCards = stats ? [
    { label: 'Total Blood Camps', value: stats.totalCamps, icon: icons.camp, color: 'red' },
    { label: 'Active Camps', value: stats.activeCamps, icon: icons.active, color: 'green' },
    { label: 'Upcoming Camps', value: stats.upcomingCamps, icon: icons.upcoming, color: 'blue' },
    { label: 'Total Registrations', value: stats.totalRegistrations, icon: icons.registration, color: 'red' },
    { label: "Today's Registrations", value: stats.todayRegistrations, icon: icons.today, color: 'blue' },
    { label: 'Total Donors', value: stats.totalDonors, icon: icons.donor, color: 'crimson' },
    { label: 'Blood Donated', value: `${stats.totalBloodDonated} units`, icon: icons.blood, color: 'red' },
  ] : []

  return (
    <div>
      {/* Header */}
      <div className="dash-header">
        <h1>{greeting}, {admin.name || 'Admin'}</h1>
        <p>Here&apos;s an overview of your blood donation platform.</p>
      </div>

      {/* Stat Cards */}
      {loading ? <StatsSkeleton /> : (
        <div className="stats-grid">
          {statCards.map((card) => (
            <div className="stat-card" key={card.label}>
              <div className={`stat-icon ${card.color}`}>
                {card.icon}
              </div>
              <div className="stat-info">
                <div className="stat-label">{card.label}</div>
                <div className="stat-value">{card.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      {loading ? <ChartsSkeleton /> : charts && (
        <div className="charts-grid">
          {/* Monthly Registrations Bar Chart */}
          <div className="chart-card">
            <h3 className="chart-card-title">Monthly Registrations</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.monthlyRegistrations} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Registrations" fill="#D32F2F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Branch-wise Pie Chart */}
          <div className="chart-card">
            <h3 className="chart-card-title">Branch-wise Registrations</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.branchWiseRegistrations}
                    dataKey="count"
                    nameKey="branch"
                    cx="50%"
                    cy="45%"
                    outerRadius={80}
                    label={({ branch, percent }) => `${branch} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    style={{ fontSize: '11px' }}
                  >
                    {charts.branchWiseRegistrations.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    wrapperStyle={{ fontSize: '11px' }}
                    iconType="circle"
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donation Status Doughnut */}
          <div className="chart-card">
            <h3 className="chart-card-title">Donation Status</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.donationStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    label={({ status, count }) => `${status}: ${count}`}
                    labelLine={false}
                    style={{ fontSize: '11px' }}
                  >
                    {charts.donationStatus.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.status] || CHART_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    wrapperStyle={{ fontSize: '11px' }}
                    iconType="circle"
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Organizer-wise Doughnut */}
          <div className="chart-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 className="chart-card-title" style={{ margin: 0 }}>Organizer-wise Registrations</h3>
              <select
                value={selectedCampId}
                onChange={(e) => handleCampChange(e.target.value)}
                className="filter-select"
                style={{ width: '170px', height: '32px', padding: '0 8px', fontSize: '12px' }}
              >
                <option value="">Select Camp</option>
                {campsList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="chart-wrapper">
              {organizerLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <span className="btn-spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />
                </div>
              ) : organizerStats && organizerStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={organizerStats}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      label={({ name, count }) => `${name}: ${count}`}
                      labelLine={false}
                      style={{ fontSize: '11px' }}
                    >
                      {organizerStats.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      wrapperStyle={{ fontSize: '11px' }}
                      iconType="circle"
                      iconSize={8}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No organizer stats available for this camp.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tables */}
      <div className="tables-grid">
        {/* Recent Registrations */}
        {loading ? <TableSkeleton /> : (
          <div className="table-card">
            <div className="table-card-header">
              <h3>Recent Registrations</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Blood Group</th>
                    <th>Branch</th>
                    <th>Camp</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRegs && recentRegs.length > 0 ? recentRegs.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600 }}>{r.name}</td>
                      <td>
                        <span style={{
                          background: 'rgba(211,47,47,0.08)',
                          color: 'var(--primary-red)',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '12px',
                        }}>
                          {r.bloodGroup}
                        </span>
                      </td>
                      <td>{r.branch}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{r.campName}</td>
                      <td><span className={`status-badge ${r.status}`}>{r.status}</span></td>
                      <td style={{ color: 'var(--text-muted)' }}>{formatDate(r.registeredAt)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No registrations found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Upcoming Camps */}
        {loading ? <TableSkeleton /> : (
          <div className="table-card">
            <div className="table-card-header">
              <h3>Upcoming Camps</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Camp Name</th>
                    <th>Branch</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingCamps && upcomingCamps.length > 0 ? upcomingCamps.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td>{c.branch}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{formatDate(c.date)}</td>
                      <td><span className={`status-badge ${c.status}`}>{c.status}</span></td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No upcoming camps</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardHome
