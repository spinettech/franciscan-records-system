import React, { useState, useEffect } from 'react'
import {
  BarChart3,
  PieChart,
  Globe,
  Award,
  Users,
  MapPin,
  Building2,
  Calendar,
  Search,
  Filter,
  Download,
  Clock,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react'
import { showToast } from '../../utils/toast'

// Interactive SVG Donut / Pie Chart Component
const DonutChart = ({
  items,
  total,
  centerLabel
}: {
  items: Array<{ label: string; count: number; color: string }>;
  total: number;
  centerLabel?: string;
}) => {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  let cumulativeOffset = 0

  const validItems = items.filter((i) => i.count > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
      <div style={{ position: 'relative', width: '200px', height: '200px' }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
          {validItems.length === 0 ? (
            <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#e2e8f0" strokeWidth="16" />
          ) : (
            validItems.map((item, idx) => {
              const pct = item.count / (total || 1)
              const strokeLength = pct * circumference
              const strokeOffset = -cumulativeOffset
              cumulativeOffset += strokeLength

              return (
                <circle
                  key={idx}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth="16"
                  strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
                  strokeDashoffset={strokeOffset}
                  style={{ transition: 'stroke-dasharray 0.6s ease' }}
                />
              )
            })
          )}
        </svg>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span style={{ fontSize: '1.85rem', fontWeight: 850, color: 'var(--primary)', lineHeight: 1 }}>{total}</span>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.2rem' }}>
            {centerLabel || 'Total'}
          </span>
        </div>
      </div>

      {/* Legend Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem', width: '100%' }}>
        {items.map((item) => {
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
          return (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color, flexShrink: 0 }} />
              <span style={{ color: 'var(--primary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.label}: <strong>{item.count}</strong> ({pct}%)
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Interactive SVG / CSS Vertical Bar Chart Component
const VerticalBarChart = ({
  items,
  height = 220
}: {
  items: Array<{ label: string; count: number; color: string }>;
  height?: number;
}) => {
  const maxCount = Math.max(...items.map((i) => i.count), 1)

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: `${height}px`, padding: '1rem 0.5rem 0', gap: '0.75rem' }}>
      {items.map((item) => {
        const heightPct = Math.round((item.count / maxCount) * 100)
        return (
          <div key={item.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 850, color: item.color, marginBottom: '0.4rem' }}>
              {item.count}
            </span>
            <div
              style={{
                width: '80%',
                maxWidth: '48px',
                height: `${Math.max(heightPct, 6)}%`,
                background: `linear-gradient(180deg, ${item.color}, ${item.color}dd)`,
                borderRadius: '8px 8px 2px 2px',
                transition: 'height 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.06)'
              }}
            />
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                marginTop: '0.6rem',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%'
              }}
              title={item.label}
            >
              {item.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'regions' | 'tenure' | 'records'>('overview')

  // Filters for All Records Analysis Table
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [regionFilter, setRegionFilter] = useState('')
  const [vowsFilter, setVowsFilter] = useState('')

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      // @ts-ignore
      const res = await window.api.getFullAnalytics()
      setData(res)
    } catch (err) {
      console.error('Failed to load analytics:', err)
      showToast('error', 'Error Loading Analytics', 'Could not retrieve full analytics data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  if (loading || !data) {
    return (
      <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
        <RefreshCw size={32} className="spin" style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
        <h3>Generating Comprehensive Analytics...</h3>
        <p className="text-muted">Analyzing provincial records, community postings, and demographics.</p>
      </div>
    )
  }

  const {
    totalSisters,
    totalCommunities,
    totalObediences,
    statusCounts,
    vowsBreakdown,
    ageBreakdown,
    tenureBreakdown,
    regionBreakdown,
    communityAnalytics,
    apostolatesBreakdown,
    jubilarians,
    allRecordsSummary
  } = data

  const activeSisters = (statusCounts.Active || 0) + (statusCounts['on Mission'] || 0)
  const activeRatePct = totalSisters > 0 ? Math.round((activeSisters / totalSisters) * 100) : 0

  // Formatted data items for charts
  const statusItems = [
    { label: 'Active Serving', count: statusCounts.Active || 0, color: 'var(--success)' },
    { label: 'In Formation', count: (statusCounts['in Formation'] || 0) + (statusCounts.Formation || 0), color: '#6366f1' },
    { label: 'Foreign Mission', count: statusCounts['on Mission'] || 0, color: 'var(--info)' },
    { label: 'Exclaustration', count: statusCounts.Exclaustration || 0, color: 'var(--warning)' },
    { label: 'Departure', count: (statusCounts.Departure || 0) + (statusCounts.Departed || 0), color: '#f43f5e' },
    { label: 'Deceased', count: statusCounts.Deceased || 0, color: '#64748b' },
    { label: 'Dismissed', count: statusCounts.Dismissed || 0, color: 'var(--danger)' }
  ]

  const vowsItems = [
    { label: 'Perpetual Vows', count: vowsBreakdown.perpetual || 0, color: '#8b5cf6' },
    { label: 'Temporary Vows', count: vowsBreakdown.temporary || 0, color: '#0ea5e9' }
  ]

  const ageItems = [
    { label: '< 30 Yrs', count: ageBreakdown.under30, color: '#0ea5e9' },
    { label: '30–50 Yrs', count: ageBreakdown.age30to50, color: '#10b981' },
    { label: '51–70 Yrs', count: ageBreakdown.age51to70, color: '#f59e0b' },
    { label: '70+ Yrs', count: ageBreakdown.over70, color: '#8b5cf6' },
    { label: 'Unspecified', count: ageBreakdown.ageUnknown, color: '#94a3b8' }
  ]

  const tenureItems = [
    { label: '< 1 Yr', count: tenureBreakdown.postingUnder1Yr, color: '#10b981' },
    { label: '1–3 Yrs', count: tenureBreakdown.posting1to3Yrs, color: '#3b82f6' },
    { label: '3–5 Yrs', count: tenureBreakdown.posting3to5Yrs, color: '#f59e0b' },
    { label: '5+ Yrs', count: tenureBreakdown.postingOver5Yrs, color: '#8b5cf6' },
    { label: 'No Posting', count: tenureBreakdown.noPosting, color: '#94a3b8' }
  ]

  // Filter records for analysis table
  const filteredRecords = allRecordsSummary.filter((s: any) => {
    const q = search.toLowerCase()
    const matchesSearch =
      !search ||
      s.fullName?.toLowerCase().includes(q) ||
      s.religiousName?.toLowerCase().includes(q) ||
      s.sisterId?.toLowerCase().includes(q) ||
      s.currentCommunity?.toLowerCase().includes(q)

    const matchesStatus = !statusFilter || s.status === statusFilter
    const matchesRegion = !regionFilter || s.region === regionFilter
    const matchesVows = !vowsFilter || s.vowsType === vowsFilter

    return matchesSearch && matchesStatus && matchesRegion && matchesVows
  })

  return (
    <div className="animate-fade-in">
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <div className="flex items-center gap-3">
            <div style={{ padding: '0.6rem', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
              <BarChart3 size={28} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 850 }}>Provincial Analytics & Record Intelligence</h1>
              <p className="text-muted" style={{ margin: '0.2rem 0 0', fontSize: '0.85rem' }}>
                Full statistical analysis of all Franciscan Sisters of the Immaculate Conception records.
              </p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary ripple" onClick={loadAnalytics}>
            <RefreshCw size={18} /> Refresh Data
          </button>
          <button
            className="btn btn-primary ripple"
            onClick={() => window.print()}
          >
            <Download size={18} /> Export Report
          </button>
        </div>
      </header>

      {/* TOP KPI HIGHLIGHT CARDS */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="flex justify-between items-start">
            <div>
              <div className="stat-label">Total Registered Sisters</div>
              <div className="stat-value">{totalSisters}</div>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start">
            <div>
              <div className="stat-label">Active Serving Rate</div>
              <div className="stat-value">{activeRatePct}%</div>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: 'var(--success)' }}>
              <MapPin size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start">
            <div>
              <div className="stat-label">Perpetual Vows Ratio</div>
              <div className="stat-value">{vowsBreakdown.perpetualPct}%</div>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', color: '#8b5cf6' }}>
              <Award size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start">
            <div>
              <div className="stat-label">Community Houses</div>
              <div className="stat-value">{totalCommunities}</div>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: 'var(--info)' }}>
              <Building2 size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start">
            <div>
              <div className="stat-label">Postings Recorded</div>
              <div className="stat-value">{totalObediences}</div>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(249, 115, 22, 0.1)', borderRadius: '12px', color: 'var(--accent)' }}>
              <Clock size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div
        className="glass-panel mb-8"
        style={{
          padding: '0.5rem',
          display: 'flex',
          gap: '0.5rem',
          borderRadius: '16px',
          background: 'white',
          border: '1px solid var(--border)'
        }}
      >
        <button
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: '12px', border: 'none', fontWeight: 750 }}
          onClick={() => setActiveTab('overview')}
        >
          <PieChart size={18} /> Demographics & Vows Overview
        </button>
        <button
          className={`btn ${activeTab === 'regions' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: '12px', border: 'none', fontWeight: 750 }}
          onClick={() => setActiveTab('regions')}
        >
          <Globe size={18} /> Regions & Communities Analysis
        </button>
        <button
          className={`btn ${activeTab === 'tenure' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: '12px', border: 'none', fontWeight: 750 }}
          onClick={() => setActiveTab('tenure')}
        >
          <Clock size={18} /> Tenure & Postings Analytics
        </button>
        <button
          className={`btn ${activeTab === 'records' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: '12px', border: 'none', fontWeight: 750 }}
          onClick={() => setActiveTab('records')}
        >
          <BarChart3 size={18} /> Complete Record Analysis ({allRecordsSummary.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & DEMOGRAPHICS */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          
          {/* Membership Status Pie / Donut Chart Card */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: 'white' }}>
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2">
                <PieChart size={16} className="text-accent" />
                <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: 'var(--primary)' }}>Membership Pie Chart</h3>
              </div>
              <span className="badge badge-info">{totalSisters} Total</span>
            </div>

            <DonutChart items={statusItems} total={totalSisters} centerLabel="Sisters" />
          </div>

          {/* Age Demographics Bar Chart Card */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: 'white' }}>
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2">
                <BarChart3 size={16} style={{ color: '#10b981' }} />
                <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: 'var(--primary)' }}>Age Demographics Bar Chart</h3>
              </div>
              <span className="badge badge-success">Age Brackets</span>
            </div>

            <VerticalBarChart items={ageItems} height={210} />
          </div>

          {/* Vows Ratio Donut Chart Card */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: 'white' }}>
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2">
                <Award size={16} style={{ color: '#8b5cf6' }} />
                <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: 'var(--primary)' }}>Vows Ratio Pie Chart</h3>
              </div>
              <span className="badge badge-warning">Perpetual vs Temp</span>
            </div>

            <DonutChart items={vowsItems} total={vowsBreakdown.perpetual + vowsBreakdown.temporary} centerLabel="Professed" />
          </div>

          {/* Jubilarians Highlight Card */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: 'white', gridColumn: 'span 1' }}>
            <div className="flex justify-between items-center mb-5">
              <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: 'var(--primary)' }}>Jubilees Milestone Tracker</h3>
              <span className="badge badge-warning">{jubilarians.length} Jubilarians</span>
            </div>

            {jubilarians.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {jubilarians.map((j: any) => (
                  <div
                    key={j.id}
                    style={{
                      padding: '0.85rem',
                      background: 'rgba(245, 158, 11, 0.05)',
                      border: '1px solid rgba(245, 158, 11, 0.2)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.85rem' }}>{j.religiousName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{j.fullName} • {j.vowsType}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge badge-warning" style={{ fontSize: '0.75rem', fontWeight: 800 }}>
                        {j.years}th Jubilee!
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Award size={30} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', opacity: 0.5 }} />
                <p style={{ fontSize: '0.8rem' }}>No milestone jubilees (25, 40, 50, 60 yrs) recorded for this current year.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: REGIONS & COMMUNITIES ANALYSIS */}
      {activeTab === 'regions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Regional Postings Analytics */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: 'white' }}>
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '0.98rem', fontWeight: 850, color: 'var(--primary)' }}>
              Regional Demographics & Postings Distribution
            </h3>

            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Region Name</th>
                    <th>Total Sisters</th>
                    <th>Active Serving</th>
                    <th>In Formation</th>
                    <th>Deceased</th>
                    <th>Distribution Bar</th>
                  </tr>
                </thead>
                <tbody>
                  {regionBreakdown.map((r: any) => (
                    <tr key={r.name}>
                      <td className="font-semibold" style={{ color: 'var(--primary)', fontSize: '0.82rem' }}>
                        {r.name}
                      </td>
                      <td>
                        <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{r.total} Sisters</span>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.82rem' }}>{r.active}</td>
                      <td style={{ fontWeight: 700, color: '#6366f1', fontSize: '0.82rem' }}>{r.formation}</td>
                      <td style={{ color: '#64748b', fontSize: '0.82rem' }}>{r.deceased}</td>
                      <td style={{ width: '30%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', flex: 1 }}>
                            <div style={{ width: `${r.percentage}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))' }} />
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>{r.percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Communities Occupancy Analysis */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: 'white' }}>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 850, color: 'var(--primary)' }}>
                  Community House Occupancy & Apostolates
                </h3>
                <p className="text-muted" style={{ fontSize: '0.8rem', margin: '0.15rem 0 0' }}>
                  Number of active sisters serving in each community house.
                </p>
              </div>
              <span className="badge badge-primary">{totalCommunities} Houses</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              {communityAnalytics.map((c: any) => (
                <div
                  key={c.id}
                  style={{
                    padding: '1rem',
                    background: 'white',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--primary)' }}>{c.name}</div>
                    <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>
                      {c.currentSistersCount} Sisters
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    📍 {c.location || 'Location Not Set'} {c.diocese ? `(${c.diocese} Diocese)` : ''}
                  </div>
                  {c.apostolates?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {c.apostolates.map((ap: string) => (
                        <span key={ap} className="badge badge-secondary" style={{ fontSize: '0.62rem' }}>
                          {ap}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: TENURE & POSTINGS */}
      {activeTab === 'tenure' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          
          <div className="glass-panel" style={{ padding: '1.5rem', background: 'white' }}>
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2">
                <BarChart3 size={16} style={{ color: '#3b82f6' }} />
                <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: 'var(--primary)' }}>
                  Posting Duration Bar Chart
                </h3>
              </div>
              <span className="badge badge-info">Service Tenure</span>
            </div>

            <VerticalBarChart items={tenureItems} height={210} />
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', background: 'white' }}>
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '0.88rem', fontWeight: 800, color: 'var(--primary)' }}>
              Apostolates & Ministry Types Breakdown
            </h3>

            {apostolatesBreakdown.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {apostolatesBreakdown.map((ap: any) => (
                  <div
                    key={ap.name}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.7rem 0.9rem',
                      background: 'rgba(var(--primary-rgb), 0.03)',
                      borderRadius: '10px',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.82rem' }}>{ap.name}</span>
                    <span className="badge badge-info">{ap.count} Houses</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                No apostolate data registered across community houses.
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 4: COMPLETE RECORD ANALYSIS TABLE */}
      {activeTab === 'records' && (
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'white' }}>
          
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 850, color: 'var(--primary)' }}>
                Complete Sister Records Analytical Directory
              </h3>
              <p className="text-muted" style={{ fontSize: '0.8rem', margin: '0.15rem 0 0' }}>
                Filtered view: Showing {filteredRecords.length} of {allRecordsSummary.length} total records.
              </p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => { setSearch(''); setStatusFilter(''); setRegionFilter(''); setVowsFilter(''); }}>
              Reset Filters
            </button>
          </div>

          {/* FILTER CONTROLS */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
              padding: '1rem',
              background: 'rgba(var(--primary-rgb), 0.02)',
              borderRadius: '14px',
              border: '1px solid var(--border)'
            }}
          >
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>Search Sister</label>
              <div className="search-box" style={{ marginTop: '0.3rem' }}>
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Name, ID or House..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>Status Filter</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: '100%', marginTop: '0.3rem', padding: '0.6rem', borderRadius: '10px', border: '1px solid var(--border)' }}
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="in Formation">in Formation</option>
                <option value="on Mission">on Mission</option>
                <option value="Exclaustration">Exclaustration</option>
                <option value="Departure">Departure</option>
                <option value="Dismissed">Dismissed</option>
                <option value="Deceased">Deceased</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>Region Filter</label>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                style={{ width: '100%', marginTop: '0.3rem', padding: '0.6rem', borderRadius: '10px', border: '1px solid var(--border)' }}
              >
                <option value="">All Regions</option>
                {regionBreakdown.map((r: any) => (
                  <option key={r.name} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>Vows Filter</label>
              <select
                value={vowsFilter}
                onChange={(e) => setVowsFilter(e.target.value)}
                style={{ width: '100%', marginTop: '0.3rem', padding: '0.6rem', borderRadius: '10px', border: '1px solid var(--border)' }}
              >
                <option value="">All Vows Types</option>
                <option value="Perpetual">Perpetual Vows</option>
                <option value="Temporary">Temporary Vows</option>
              </select>
            </div>
          </div>

          {/* RECORDS TABLE */}
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Sister ID</th>
                  <th>Religious & Full Name</th>
                  <th>Status</th>
                  <th>Region</th>
                  <th>Current Community House</th>
                  <th>Vows Type</th>
                  <th>Postings Recorded</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((s: any) => (
                    <tr key={s.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>
                        {s.sisterId || '—'}
                      </td>
                      <td className="font-semibold">
                        <div>{s.religiousName || s.fullName}</div>
                        {s.religiousName && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{s.fullName}</div>}
                      </td>
                      <td>
                        <span className={`badge badge-${
                          s.status === 'Active' ? 'success' : 
                          s.status === 'on Mission' ? 'info' : 
                          s.status === 'in Formation' || s.status === 'Formation' ? 'primary' :
                          s.status === 'Exclaustration' ? 'warning' : 
                          s.status === 'Departure' || s.status === 'Dismissed' ? 'danger' : 
                          'secondary'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td>{s.region}</td>
                      <td>{s.currentCommunity}</td>
                      <td>
                        <span className={`badge badge-${s.vowsType === 'Perpetual' ? 'warning' : 'info'}`} style={{ fontSize: '0.7rem' }}>
                          {s.vowsType} Vows
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--accent)' }}>
                        {s.obediencesCount}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No sister records match the selected filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}
    </div>
  )
}

export default AnalyticsPage
