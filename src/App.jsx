import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts'

import {
  AM_CONFIG, BOOKINGS, PIPELINE_DATA, PIPELINE_STAGES, REMINDERS_INIT, TODAY,
  ACCENT_COLORS, avatarColor, initials, relativeTime, formatMoney, formatDate,
  greeting, DOC_ICONS, DOC_COLORS,
} from './data/index.js'

import { getEmails, getTasks, getAIBriefing, generateWeeklySummary } from './api/client.js'
import { loadSheetsData } from './data/sheets.js'

/* ══════════════════════════════════════════════════════════════════════════
   SHARED COMPONENTS
══════════════════════════════════════════════════════════════════════════ */
function Skel({ n = 4 }) {
  return Array.from({ length: n }).map((_, i) => (
    <div key={i} className="skr">
      <div className="sk skc" />
      <div className="skls">
        <div className="sk skl" style={{ width: '55%' }} />
        <div className="sk skl" style={{ width: '80%' }} />
        <div className="sk skl" style={{ width: '40%' }} />
      </div>
    </div>
  ))
}

function EmailPanel({ emails, loading }) {
  const [tab, setTab] = useState('all')
  const filtered =
    tab === 'all'     ? emails :
    tab === 'unread'  ? emails.filter(e => e.isUnread) :
    emails.filter(e => e.tag === tab)
  const unread = emails.filter(e => e.isUnread).length

  return (
    <div className="panel">
      <div className="ph">
        <div className="pt"><div className="dot" style={{ background: 'var(--blue)' }} />Inbox</div>
        <button className="pa">View all →</button>
      </div>
      <div className="tabs">
        {['all', 'unread', 'partner', 'urgent'].map(t => (
          <button key={t} className={`tb ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t[0].toUpperCase() + t.slice(1)}
            {t === 'unread' && !loading && unread > 0 && (
              <span style={{ marginLeft: 5, background: 'var(--blue)', color: '#fff', borderRadius: 8, padding: '0 5px', fontSize: 10 }}>{unread}</span>
            )}
          </button>
        ))}
      </div>
      <div className="pb">
        {loading
          ? <Skel n={4} />
          : filtered.length === 0
            ? <div style={{ padding: '24px 18px', fontSize: 13, color: 'var(--muted)' }}>All clear — nothing here.</div>
            : filtered.map(e => (
              <div key={e.id} className={`ei ${e.isUnread ? 'ur' : ''}`}>
                <div className="av" style={{ background: avatarColor(e.sender) }}>{initials(e.sender)}</div>
                <div className="em">
                  <div className="esn">{e.isUnread && <span className="ud" />}{e.sender}</div>
                  <div className="esj">{e.subject}</div>
                  <div className="esp">{e.preview}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                  <div className="etm">{relativeTime(e.time)}</div>
                  <span className={`etg tag-${e.tag}`}>{e.tag}</span>
                </div>
              </div>
            ))
        }
      </div>
    </div>
  )
}

function TaskPanel({ tasks, loading, onToggle }) {
  return (
    <div className="panel">
      <div className="ph">
        <div className="pt"><div className="dot" style={{ background: 'var(--amber)' }} />Tasks</div>
        <button className="pa">+ Add</button>
      </div>
      <div className="pb">
        {loading
          ? <Skel n={5} />
          : tasks.map(t => (
            <div key={t.id} className="ti">
              <div className={`tck ${t.done ? 'dn' : ''}`} onClick={() => onToggle(t.id)}>
                {t.done && <span style={{ color: 'var(--navy)', fontSize: 9, fontWeight: 900 }}>✓</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className={`ttx ${t.done ? 'dn' : ''}`}>{t.text}</div>
                <div className="tpt">{t.partner} · {t.due}</div>
              </div>
              <span className={`pb2 ${t.priority === 'high' ? 'ph2' : t.priority === 'medium' ? 'pm2' : 'pl2'}`}>{t.priority}</span>
            </div>
          ))
        }
      </div>
    </div>
  )
}

function BookingPerf({ amData }) {
  const [view, setView] = useState('partners')
  const maxP = amData.topPartners[0]?.count || 1
  const statusData = [
    { name: 'In Room',   value: amData.inRoom,    color: '#3ecf8e' },
    { name: 'History',   value: amData.history,   color: '#3d4f6a' },
    { name: 'Held',      value: amData.held,      color: '#f5a623' },
    ...(amData.tentative > 0 ? [{ name: 'Tentative', value: amData.tentative, color: '#4e9bff' }] : []),
  ]
  const propData = amData.topProperties.map((p, i) => ({ name: p.name, count: p.count, fill: ACCENT_COLORS[i % ACCENT_COLORS.length] }))

  if (amData.totalBookings === 0) return (
    <div className="panel">
      <div className="ph"><div className="pt"><div className="dot" style={{ background: amData.color }} />Leasing Performance</div></div>
      <div style={{ padding: '36px 18px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
        <div style={{ fontSize: 28, marginBottom: 12 }}>📭</div>
        <div style={{ fontFamily: 'var(--fd)', fontSize: 15, color: 'var(--soft)', marginBottom: 6 }}>Data incoming.</div>
        <div>StarRez leasing data will appear here once access is confirmed.</div>
      </div>
    </div>
  )

  return (
    <div className="panel">
      <div className="ph">
        <div className="pt"><div className="dot" style={{ background: amData.color }} />Leasing Performance</div>
        <div className="am-tgl">
          {['partners', 'properties', 'status'].map(v => (
            <button key={v} className={`atb ${view === v ? 'active' : ''}`} onClick={() => setView(v)}>
              {v[0].toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {view === 'partners' && (
        <div className="pb" style={{ maxHeight: 290, overflowY: 'auto' }}>
          {amData.topPartners.map((p, i) => (
            <div key={i} className="pr">
              <div className="prk">#{i + 1}</div>
              <div className="prf">
                <div className="prn">{p.name}</div>
                <div className="prc">{p.code} · {p.type}</div>
              </div>
              <div className="pbw"><div className="pbb" style={{ width: `${(p.count / maxP) * 100}%`, background: ACCENT_COLORS[i % ACCENT_COLORS.length] }} /></div>
              <div className="pct">{p.count}</div>
            </div>
          ))}
        </div>
      )}
      {view === 'properties' && (
        <div style={{ padding: '14px 10px 8px' }}>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={propData} margin={{ top: 4, right: 8, bottom: 28, left: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#8a9bbf', fontFamily: 'DM Sans' }} interval={0} angle={-25} textAnchor="end" />
              <YAxis tick={{ fontSize: 10, fill: '#8a9bbf' }} width={26} />
              <Tooltip contentStyle={{ background: '#161c25', border: '1px solid #2a3347', borderRadius: 8, fontFamily: 'DM Sans', fontSize: 12 }} cursor={{ fill: 'rgba(255,255,255,.04)' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {propData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {view === 'status' && (
        <div style={{ padding: '14px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PieChart width={250} height={190}>
            <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={78} innerRadius={38}>
              {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
            <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: 12, color: 'var(--text)', fontFamily: 'DM Sans' }}>{v}</span>} />
            <Tooltip contentStyle={{ background: '#161c25', border: '1px solid #2a3347', borderRadius: 8, fontFamily: 'DM Sans', fontSize: 12 }} />
          </PieChart>
        </div>
      )}
    </div>
  )
}

function DocPanel({ docs }) {
  return (
    <div className="panel">
      <div className="ph">
        <div className="pt"><div className="dot" style={{ background: 'var(--green)' }} />SharePoint Files</div>
        <button className="pa" onClick={() => window.open('https://thescapegroup.sharepoint.com/sites/Sales', '_blank')}>Open SP →</button>
      </div>
      <div className="pb">
        {docs.map((d, i) => (
          <div key={i} className="di" onClick={() => d.url && window.open(d.url, '_blank')}>
            <div className="dic" style={{ background: DOC_COLORS[d.type] || 'var(--border)' }}>{DOC_ICONS[d.type] || '📁'}</div>
            <div className="din">
              <div className="dnn">{d.name}</div>
              <div className="dnm">{d.folder}</div>
            </div>
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>↗</span>
          </div>
        ))}
        <div style={{ padding: '11px 18px' }}>
          <div style={{ background: 'var(--slate)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 13px' }}>
            <div style={{ fontSize: 11, color: 'var(--soft)', marginBottom: 6 }}>STARREZ EXPORT</div>
            <div style={{ fontSize: 12, color: 'var(--text)' }}>Agent_Report_All_Agents_2026-04-17</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>20,849 rows · Last sync 17 Apr 10:00</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE: TODAY'S FOCUS
══════════════════════════════════════════════════════════════════════════ */
function OverviewPage({ amData, emails, tasks, ai, ld, onToggle, onRefresh, lastSync }) {
  const unread  = emails.filter(e => e.isUnread).length
  const pending = tasks.filter(t => !t.done).length
  const urgent  = tasks.filter(t => !t.done && t.priority === 'high').slice(0, 3)
  const PRIORITY_COLORS = ['var(--coral)', 'var(--amber)', 'var(--blue)']

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div className="focus-name"><span>{greeting(amData.name)}</span></div>
          <div className="focus-sub">
            {amData.totalBookings === 0
              ? 'Your pipeline is just getting started — here\'s where to begin.'
              : `${new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })} · ${amData.totalBookings.toLocaleString()} leases · ${formatMoney(amData.contractValue)}`
            }
          </div>
        </div>
        <button className="rbtn" onClick={onRefresh}>⟳ Refresh</button>
      </div>

      {amData.note && amData.totalBookings === 0 && (
        <div style={{ background: 'rgba(78,155,255,.08)', border: '1px solid rgba(78,155,255,.25)', borderRadius: 12, padding: '13px 18px', marginBottom: 18, display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 18 }}>🚀</span>
          <div style={{ fontSize: 13, color: 'var(--text)' }}>{amData.note}</div>
        </div>
      )}

      <div className="ai-box">
        <div className="ai-ic">✦</div>
        <div style={{ flex: 1 }}>
          <div className="ai-lb">AI Briefing</div>
          {ld.a
            ? <div className="sk skl" style={{ width: '70%', height: 13 }} />
            : <div className="ai-tx">{ai}</div>
          }
        </div>
      </div>

      <div className="qstrip">
        {[
          { ic: '📬', val: ld.e ? '—' : unread,  lbl: 'Unread Emails' },
          { ic: '🚩', val: ld.t ? '—' : pending, lbl: 'Open Tasks'    },
          { ic: '🛏️', val: amData.inRoom,          lbl: 'In Room'       },
          { ic: '⏸️', val: amData.held,            lbl: 'Held'          },
        ].map((q, i) => (
          <div key={i} className="qs">
            <div className="qs-ic">{q.ic}</div>
            <div><div className="qs-val">{q.val}</div><div className="qs-lbl">{q.lbl}</div></div>
          </div>
        ))}
      </div>

      <div className="focus-grid">
        <div className="focus-priorities">
          <div className="focus-pri-hdr">
            <div className="focus-pri-title">
              <div className="dot" style={{ background: 'var(--coral)' }} />Today's Priorities
            </div>
            <span style={{ fontSize: 11, color: 'var(--soft)' }}>{pending} open · {tasks.filter(t => t.done).length} done</span>
          </div>
          {ld.t
            ? <Skel n={3} />
            : urgent.length === 0
              ? <div style={{ padding: '20px 18px', fontSize: 13, color: 'var(--soft)' }}>You're all caught up. Nice work.</div>
              : urgent.map((t, i) => (
                <div key={t.id} className="fp-item">
                  <div className="fp-num" style={{ background: `${PRIORITY_COLORS[i]}22`, color: PRIORITY_COLORS[i] }}>{i + 1}</div>
                  <div className="fp-body">
                    <div className="fp-title">{t.text}</div>
                    <div className="fp-meta">{t.partner} · Due {t.due}</div>
                  </div>
                </div>
              ))
          }
          {!ld.t && tasks.filter(t => !t.done && t.priority !== 'high').length > 0 && (
            <div style={{ padding: '9px 18px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)' }}>
              + {tasks.filter(t => !t.done && t.priority !== 'high').length} more tasks — see Tasks page
            </div>
          )}
        </div>

        <div className="panel">
          <div className="ph"><div className="pt"><div className="dot" style={{ background: amData.color }} />Leasing Snapshot</div></div>
          <div style={{ padding: '12px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              ['Total Leases', amData.totalBookings.toLocaleString(), 'var(--blue)'],
              ['Contract Value', formatMoney(amData.contractValue), 'var(--green)'],
              ['In Room', amData.inRoom, 'var(--green)'],
              ['On Hold', amData.held, 'var(--amber)'],
            ].map(([l, v, c]) => (
              <div key={l} style={{ background: 'var(--slate)', borderRadius: 9, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 5 }}>{l}</div>
                <div style={{ fontFamily: 'var(--fd)', fontSize: 20, fontWeight: 700, color: c }}>{v}</div>
              </div>
            ))}
          </div>
          {lastSync && (
            <div style={{ padding: '8px 18px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--muted)' }}>
              Synced {relativeTime(lastSync.toISOString())}
            </div>
          )}
        </div>
      </div>

      <div className="g3-1">
        <EmailPanel emails={emails} loading={ld.e} />
        <TaskPanel tasks={tasks} loading={ld.t} onToggle={onToggle} />
      </div>

      <div className="g2">
        <BookingPerf amData={amData} />
        <DocPanel docs={amData.docs} />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE: LEASES TABLE
══════════════════════════════════════════════════════════════════════════ */
const STATUS_LABEL = { inroom: 'In Room', held: 'Held', tentative: 'Tentative', history: 'History' }
const STATUS_CLS   = { inroom: 'st-inroom', held: 'st-held', tentative: 'st-tentative', history: 'st-history' }

function BookingsPage({ amData, amKey, bookingsData }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState({ key: 'checkin', dir: 'desc' })
  const all = (bookingsData || BOOKINGS)[amKey] || []

  if (all.length === 0) return (
    <div>
      <div className="phdr">
        <div>
          <div className="ptitle"><span style={{ color: amData.color }}>{amData.name}</span><span style={{ color: 'var(--soft)', fontWeight: 400, fontSize: 15, marginLeft: 10 }}>Leases</span></div>
          <div className="psub">StarRez export</div>
        </div>
      </div>
      <div className="panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 14 }}>🏗️</div>
        <div style={{ fontFamily: 'var(--fd)', fontSize: 16, color: 'var(--soft)', marginBottom: 8 }}>Leasing data is on its way.</div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Once StarRez access is confirmed, leasing records will appear here automatically.</div>
      </div>
    </div>
  )

  const filtered = all.filter(b => {
    const matchStatus = filter === 'all' || b.status === filter
    const q = search.toLowerCase()
    const matchQ = !q || [b.student, b.partner, b.property, b.id].some(v => v.toLowerCase().includes(q))
    return matchStatus && matchQ
  })
  const sorted = [...filtered].sort((a, b) => {
    let av = sort.key === 'contract' ? Number(a[sort.key]) : a[sort.key]
    let bv = sort.key === 'contract' ? Number(b[sort.key]) : b[sort.key]
    if (av < bv) return sort.dir === 'asc' ? -1 : 1
    if (av > bv) return sort.dir === 'asc' ? 1 : -1
    return 0
  })
  const setS = (key) => setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' })
  const sortIcon = (key) => sort.key === key ? (sort.dir === 'asc' ? ' ↑' : ' ↓') : ''

  const counts = {
    all: all.length,
    inroom: all.filter(b => b.status === 'inroom').length,
    held: all.filter(b => b.status === 'held').length,
    tentative: all.filter(b => b.status === 'tentative').length,
    history: all.filter(b => b.status === 'history').length,
  }

  return (
    <div>
      <div className="phdr">
        <div>
          <div className="ptitle"><span style={{ color: amData.color }}>{amData.name}</span><span style={{ color: 'var(--soft)', fontWeight: 400, fontSize: 15, marginLeft: 10 }}>Leases</span></div>
          <div className="psub">StarRez export · 17 Apr 2026 · {all.length} records</div>
        </div>
      </div>
      <div className="stats stats-5">
        {[['all', 'Total', 'b'], ['inroom', 'In Room', 'g'], ['held', 'Held', 'a'], ['tentative', 'Tentative', 'b'], ['history', 'History', 'r']].map(([k, l, c]) => (
          <div key={k} className={`sc ${c}`} style={{ cursor: 'pointer', outline: filter === k ? '2px solid var(--amber)' : 'none', outlineOffset: 2 }} onClick={() => setFilter(k)}>
            <div className="sl">{l}</div>
            <div className="sv">{counts[k]}</div>
            <div className="ss">{filter === k ? '● active' : 'click to filter'}</div>
          </div>
        ))}
      </div>
      <div className="panel">
        <div className="bk-bar">
          <input className="bk-search" placeholder="Search student, partner, property or ID…" value={search} onChange={e => setSearch(e.target.value)} />
          <div style={{ fontSize: 12, color: 'var(--soft)', whiteSpace: 'nowrap' }}>{sorted.length} result{sorted.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="bk-wrap">
          <table className="bk-table">
            <thead>
              <tr>
                {[['id', 'Lease ID'], ['student', 'Student'], ['partner', 'Partner'], ['property', 'Property'], ['status', 'Status'], ['checkin', 'Check-in'], ['room', 'Room Type'], ['contract', 'Contract']].map(([k, l]) => (
                  <th key={k} className="bk-th" onClick={() => setS(k)}>{l}{sortIcon(k)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0
                ? <tr><td colSpan={8} className="bk-empty">No leases match your filters.</td></tr>
                : sorted.map(b => (
                  <tr key={b.id} className="bk-tr">
                    <td className="bk-td"><span style={{ fontFamily: 'var(--fd)', fontSize: 11, color: 'var(--muted)' }}>{b.id}</span></td>
                    <td className="bk-td" style={{ fontWeight: 500, color: '#fff' }}>{b.student}</td>
                    <td className="bk-td">{b.partner}</td>
                    <td className="bk-td">{b.property}</td>
                    <td className="bk-td"><span className={`st ${STATUS_CLS[b.status]}`}>{STATUS_LABEL[b.status]}</span></td>
                    <td className="bk-td" style={{ whiteSpace: 'nowrap' }}>{formatDate(b.checkin)}</td>
                    <td className="bk-td" style={{ color: 'var(--soft)' }}>{b.room}</td>
                    <td className="bk-td" style={{ fontFamily: 'var(--fd)', fontSize: 12, color: 'var(--green)' }}>${b.contract.toLocaleString()}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        {sorted.length > 0 && (
          <div className="bk-foot">
            <span>{sorted.length} leases shown</span>
            <span style={{ color: 'var(--green)', fontFamily: 'var(--fd)', fontWeight: 600 }}>
              Total: ${sorted.reduce((s, b) => s + b.contract, 0).toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE: ONBOARDING PIPELINE
══════════════════════════════════════════════════════════════════════════ */
function PipelinePage({ amData, amKey, pipelineDataProp }) {
  const effectivePipeline = pipelineDataProp || PIPELINE_DATA
  const [cards, setCards] = useState(() => effectivePipeline[amKey] || [])
  useEffect(() => { setCards(effectivePipeline[amKey] || []) }, [amKey, pipelineDataProp])

  const moveCard = (id, stage) => setCards(c => c.map(k => k.id === id ? { ...k, stage } : k))

  const partnerColors = {}
  Object.values(effectivePipeline).flat().forEach(k => {
    if (!partnerColors[k.partner]) partnerColors[k.partner] = ACCENT_COLORS[Object.keys(partnerColors).length % ACCENT_COLORS.length]
  })

  const checkedIn = cards.filter(c => c.stage === 'checkedin').length
  const arriving  = cards.filter(c => ['allocated', 'prearrival'].includes(c.stage)).length

  return (
    <div>
      <div className="phdr">
        <div>
          <div className="ptitle"><span style={{ color: amData.color }}>{amData.name}</span><span style={{ color: 'var(--soft)', fontWeight: 400, fontSize: 15, marginLeft: 10 }}>Onboarding Pipeline</span></div>
          <div className="psub">Jul 2026 intake · use arrow buttons to move students between stages</div>
        </div>
      </div>
      <div className="stats stats-3" style={{ maxWidth: 560 }}>
        <div className="sc b"><div className="sl">In Pipeline</div><div className="sv">{cards.length}</div><div className="ss">Jul 2026</div></div>
        <div className="sc a"><div className="sl">Arriving Soon</div><div className="sv">{arriving}</div><div className="ss warn">Allocated + Pre-Arrival</div></div>
        <div className="sc g"><div className="sl">Checked In</div><div className="sv">{checkedIn}</div><div className="ss up">Settled ✓</div></div>
      </div>
      {cards.length === 0 && (
        <div className="panel" style={{ padding: '48px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>🗂️</div>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 15, color: 'var(--soft)', marginBottom: 6 }}>Pipeline building.</div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>Add students as they come in — each one gets their own card through check-in.</div>
        </div>
      )}
      <div className="kan-board">
        {PIPELINE_STAGES.map(stage => {
          const stageCards = cards.filter(c => c.stage === stage.key)
          const otherStages = PIPELINE_STAGES.filter(s => s.key !== stage.key)
          return (
            <div key={stage.key} className="kan-col">
              <div className="kan-hdr">
                <div className="kan-hn" style={{ color: stage.color }}>{stage.label}</div>
                <div className="kan-hc">{stageCards.length}</div>
              </div>
              {stageCards.map(card => (
                <div key={card.id} className="kcard">
                  <div className="kc-name"><span style={{ marginRight: 4 }}>{card.flag}</span>{card.name}</div>
                  <div className="kc-meta">
                    <span className="kc-tag" style={{ background: `${partnerColors[card.partner] || '#fff'}22`, color: partnerColors[card.partner] || '#fff' }}>{card.partner}</span>
                  </div>
                  <div className="kc-meta" style={{ color: 'var(--muted)' }}>🏢 {card.property}</div>
                  <div className="kc-date">
                    📅 {formatDate(card.checkin)}
                    <span style={{ marginLeft: 'auto', display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                      {otherStages.slice(0, 2).map(s => (
                        <span key={s.key} className="kc-mv" onClick={() => moveCard(card.id, s.key)}>→ {s.label.split(' ')[0]}</span>
                      ))}
                    </span>
                  </div>
                </div>
              ))}
              <div className="kc-add">+ Add student</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE: REMINDERS
══════════════════════════════════════════════════════════════════════════ */
function RemindersPage({ amData, amKey, remindersData }) {
  const effectiveReminders = remindersData || REMINDERS_INIT
  const [rems, setRems] = useState(() => effectiveReminders[amKey] || [])
  const [showForm, setShowForm] = useState(false)
  const [newRem, setNewRem] = useState({ title: '', partner: '', due: '', recurrence: 'One-off', priority: 'medium' })
  useEffect(() => { setRems(effectiveReminders[amKey] || []) }, [amKey, remindersData])

  const toggle = (id) => setRems(r => r.map(rem => rem.id === id ? { ...rem, done: !rem.done } : rem))
  const addRem = () => {
    if (!newRem.title.trim()) return
    setRems(r => [...r, { ...newRem, id: Date.now(), done: false }])
    setNewRem({ title: '', partner: '', due: '', recurrence: 'One-off', priority: 'medium' })
    setShowForm(false)
  }
  const dueCls = (due) => {
    if (!due) return ''
    if (due === TODAY) return 'today'
    return (new Date(due) - new Date(TODAY)) / 86400000 <= 3 ? 'soon' : ''
  }

  const groups = [
    { label: 'Today',     items: rems.filter(r => !r.done && r.due === TODAY) },
    { label: 'This Week', items: rems.filter(r => !r.done && r.due > TODAY && r.due <= '2026-04-25') },
    { label: 'Upcoming',  items: rems.filter(r => !r.done && r.due > '2026-04-25') },
    { label: 'Done',      items: rems.filter(r => r.done) },
  ].filter(g => g.items.length > 0)

  const todayCount = rems.filter(r => !r.done && r.due === TODAY).length
  const pending    = rems.filter(r => !r.done).length
  const done       = rems.filter(r => r.done).length

  return (
    <div>
      <div className="phdr">
        <div>
          <div className="ptitle"><span style={{ color: amData.color }}>{amData.name}</span><span style={{ color: 'var(--soft)', fontWeight: 400, fontSize: 15, marginLeft: 10 }}>Reminders</span></div>
          <div className="psub">Partner follow-ups · Agreement renewals · Internal deadlines</div>
        </div>
        <button className="rbtn" onClick={() => setShowForm(f => !f)}>+ New Reminder</button>
      </div>

      <div className="stats stats-3" style={{ maxWidth: 520 }}>
        <div className="sc r"><div className="sl">Due Today</div><div className="sv">{todayCount}</div><div className="ss hot">Action required</div></div>
        <div className="sc a"><div className="sl">Pending</div><div className="sv">{pending}</div><div className="ss">Open</div></div>
        <div className="sc g"><div className="sl">Completed</div><div className="sv">{done}</div><div className="ss up">This period ✓</div></div>
      </div>

      {showForm && (
        <div className="rem-add-form">
          <div style={{ fontSize: 11, color: 'var(--amber)', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'var(--fd)', fontWeight: 600, marginBottom: 10 }}>New Reminder</div>
          <input className="rem-input" placeholder="What needs to happen?" value={newRem.title} onChange={e => setNewRem(r => ({ ...r, title: e.target.value }))} />
          <div className="rem-row">
            <input className="rem-input" style={{ marginBottom: 0 }} placeholder="Partner / Category" value={newRem.partner} onChange={e => setNewRem(r => ({ ...r, partner: e.target.value }))} />
            <input className="rem-input" style={{ marginBottom: 0, maxWidth: 150 }} type="date" value={newRem.due} onChange={e => setNewRem(r => ({ ...r, due: e.target.value }))} />
          </div>
          <div className="rem-row" style={{ marginTop: 9 }}>
            <select className="rem-sel" value={newRem.recurrence} onChange={e => setNewRem(r => ({ ...r, recurrence: e.target.value }))}>
              {['One-off', 'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Semester', 'Annual'].map(v => <option key={v}>{v}</option>)}
            </select>
            <select className="rem-sel" value={newRem.priority} onChange={e => setNewRem(r => ({ ...r, priority: e.target.value }))}>
              {['high', 'medium', 'low'].map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div className="rem-btns">
            <button className="rem-cancel" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="rem-save" onClick={addRem}>Save</button>
          </div>
        </div>
      )}

      {groups.map(g => (
        <div key={g.label} className="rem-section">
          <div className="rem-grp-lbl">{g.label} · {g.items.length}</div>
          <div className="rem-card">
            {g.items.map(rem => (
              <div key={rem.id} className={`rem-item ${rem.done ? 'done' : ''}`}>
                <div className={`tck ${rem.done ? 'dn' : ''}`} style={{ marginTop: 2, flexShrink: 0 }} onClick={() => toggle(rem.id)}>
                  {rem.done && <span style={{ color: 'var(--navy)', fontSize: 9, fontWeight: 900 }}>✓</span>}
                </div>
                <div className="rem-body">
                  <div className={`rem-title ${rem.done ? 'done' : ''}`}>{rem.title}</div>
                  <div className="rem-meta">
                    {rem.partner && <span>{rem.partner}</span>}
                    {rem.due && <span className={`rem-due ${dueCls(rem.due)}`}>📅 {formatDate(rem.due)}</span>}
                    {rem.recurrence && rem.recurrence !== 'One-off' && <span className="rec-tag">🔁 {rem.recurrence}</span>}
                  </div>
                </div>
                <span className={`pb2 ${rem.priority === 'high' ? 'ph2' : rem.priority === 'medium' ? 'pm2' : 'pl2'}`}>{rem.priority}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      {!showForm && <button className="add-rem-btn" onClick={() => setShowForm(true)}><span style={{ fontSize: 16 }}>+</span> Add a reminder…</button>}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE: WEEKLY SUMMARY
══════════════════════════════════════════════════════════════════════════ */
function WeeklySummaryPage({ cfg: cfgProp, pipelineData: pipelineProp, remindersData: remindersProp }) {
  const cfg          = cfgProp     || AM_CONFIG
  const pipelineData = pipelineProp || PIPELINE_DATA
  const remindersData= remindersProp|| REMINDERS_INIT
  const [summaries, setSummaries] = useState(null)
  const [loading, setLoading]     = useState(false)
  const [copied, setCopied]       = useState(false)
  const weekRange = '14–18 April 2026'

  const generate = async () => {
    setLoading(true)
    try {
      const s = await generateWeeklySummary()
      setSummaries(s)
    } catch (e) {
      setSummaries(
        Object.fromEntries(
          Object.entries(cfg).map(([k, a]) => [k,
            `${a.name} — ${a.region}: ${a.totalBookings} total leases with ${a.inRoom} students in-room and ${a.held} on hold. Top partner ${a.topPartners[0]?.name || 'N/A'} continues to drive volume. ${(pipelineData[k] || []).length} students in the onboarding pipeline for July. ${(remindersData[k] || []).filter(r => !r.done).length} open reminders heading into next week.`
          ])
        )
      )
    }
    setLoading(false)
  }

  const copyAll = () => {
    if (!summaries) return
    const text = `SCAPE LEASING TEAM — WEEKLY SUMMARY\nWeek of ${weekRange}\n\n` +
      Object.entries(summaries).map(([k, s]) => `${cfg[k]?.name?.toUpperCase() || k} · ${cfg[k]?.region || ''}\n${s}`).join('\n\n---\n\n')
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500) })
  }

  return (
    <div>
      <div className="phdr">
        <div>
          <div className="ptitle">Weekly Summary</div>
          <div className="psub">AI-generated activity notes · Week of {weekRange} · for Nicole</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {summaries && <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copyAll}>{copied ? '✓ Copied' : '⎘ Copy all'}</button>}
          <button className="rbtn primary" onClick={generate} disabled={loading}>{loading ? 'Generating…' : '✦ Generate'}</button>
        </div>
      </div>

      {!summaries && !loading && (
        <div className="ws-panel" style={{ textAlign: 'center', padding: '56px 24px' }}>
          <div style={{ fontSize: 32, marginBottom: 14 }}>📋</div>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 16, color: 'var(--soft)', marginBottom: 8 }}>End-of-week notes, ready when you are.</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20, maxWidth: 420, margin: '0 auto 20px' }}>
            Click Generate and the team's week gets summarised — leasing activity, partner touch-points, pipeline moves, and open reminders.
          </div>
          <button className="rbtn primary" onClick={generate}>✦ Generate weekly summary</button>
        </div>
      )}

      {loading && (
        <div className="ws-panel">
          {Object.values(AM_CONFIG).map((a, i) => (
            <div key={i} className="ws-am-block">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', color: 'var(--soft)', fontSize: 13 }}>
                <div className="ws-spinner" /><span>Summarising {a.name}'s week…</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {summaries && !loading && (
        <div className="ws-panel">
          <div style={{ fontSize: 11, color: 'var(--amber)', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'var(--fd)', fontWeight: 600, marginBottom: 16 }}>
            Week of {weekRange}
          </div>
          {Object.entries(summaries).map(([key, text]) => {
            const am = cfg[key]
            if (!am) return null
            return (
              <div key={key} className="ws-am-block">
                <div className="ws-am-name" style={{ color: am.color }}>
                  {am.name} <span style={{ fontSize: 12, color: 'var(--soft)', fontWeight: 400 }}>· {am.region}</span>
                </div>
                <div className="ws-body">{text}</div>
                <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                  {[
                    ['🛏️', am.inRoom,                               'In Room'],
                    ['📋', am.totalBookings,                        'Total Leases'],
                    ['⏸️', am.held,                                 'On Hold'],
                    ['🗂️', (pipelineData[key] || []).length,        'In Pipeline'],
                  ].map(([ic, v, l]) => (
                    <div key={l} style={{ background: 'var(--slate)', borderRadius: 7, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text)' }}>
                      <span>{ic}</span><span style={{ fontFamily: 'var(--fd)', fontWeight: 600 }}>{v}</span><span style={{ color: 'var(--muted)' }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
          <div style={{ marginTop: 4, fontSize: 11, color: 'var(--muted)' }}>Generated {new Date().toLocaleString('en-AU')} · Powered by Anthropic API</div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   ROOT COMPONENT
══════════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [amKey, setAmKey]       = useState('nicole')
  const [page,  setPage]        = useState('overview')
  const [emails, setEmails]     = useState([])
  const [tasks,  setTasks]      = useState([])
  const [ai,     setAi]         = useState('')
  const [ld,     setLd]         = useState({ e: true, t: true, a: true })
  const [lastSync, setLastSync] = useState(null)

  // ── Live data from Google Sheets (null = not configured, use static) ───────
  const [liveData, setLiveData]   = useState(null)
  const [sheetsOk, setSheetsOk]   = useState(null) // null=loading, true/false

  useEffect(() => {
    loadSheetsData().then(data => {
      setLiveData(data)
      setSheetsOk(data !== null)
    })
  }, [])

  // Effective data: prefer live if available, else fall back to static
  const cfg          = liveData?.amConfig     || AM_CONFIG
  const bookingsData = liveData?.bookings     || BOOKINGS
  const pipelineData = liveData?.pipelineData || PIPELINE_DATA
  const remindersData= liveData?.remindersInit|| REMINDERS_INIT

  const amData = cfg[amKey] || cfg[Object.keys(cfg)[0]]

  const load = useCallback(async () => {
    setLd({ e: true, t: true, a: true })
    const [e, t] = await Promise.all([getEmails(amData.name), getTasks(amData.name, amData)])
    setEmails(e); setLd(p => ({ ...p, e: false }))
    setTasks(t);  setLd(p => ({ ...p, t: false }))
    const s = await getAIBriefing(amData.name, amData)
    setAi(s); setLd(p => ({ ...p, a: false }))
    setLastSync(new Date())
  }, [amKey])

  useEffect(() => { load() }, [load])

  const toggleTask = (id) => setTasks(p => p.map(t => t.id === id ? { ...t, done: !t.done } : t))

  const unread    = emails.filter(e => e.isUnread).length
  const pending   = tasks.filter(t => !t.done).length
  const remToday  = (remindersData[amKey] || []).filter(r => !r.done && r.due === TODAY).length
  const pipeCount = (pipelineData[amKey] || []).length

  const NAV = [
    { icon: '🏠', label: "Today's Focus", pg: 'overview', badge: null },
    { icon: '📊', label: 'Leases',        pg: 'bookings', badge: null },
    { icon: '📨', label: 'Inbox',         pg: 'overview', badge: unread  || null, bc: 'blue'  },
  ]
  const WORKFLOWS = [
    { icon: '🗂️', label: 'Onboarding',   pg: 'pipeline',  badge: pipeCount || null, bc: 'blue'  },
    { icon: '🔔', label: 'Reminders',    pg: 'reminders', badge: remToday  || null, bc: 'coral' },
    { icon: '📋', label: 'Weekly Note',  pg: 'weekly',    badge: null },
  ]

  return (
    <div className="wrap">
      <aside className="sidebar">
        <div className="logo">
          <div className="w">LeasingDesk</div>
          <div className="s">Offshore Leasing Team</div>
          <div className="scape-tag">Scape</div>
        </div>

        <div className="am-sw">
          {Object.entries(cfg).map(([k, a]) => (
            <div key={k} className={`am-pill ${amKey === k ? 'active' : ''}`} onClick={() => setAmKey(k)}>
              <div className="an" style={{ color: amKey === k ? a.color : '#fff' }}>{a.initials}</div>
              <div className="ar">{a.name.split(' ')[0]}</div>
            </div>
          ))}
        </div>

        <div className="nav-sec">
          <div className="nav-lbl">Dashboard</div>
          {NAV.map((n, i) => (
            <button key={i} className={`ni ${page === n.pg && n.label !== 'Inbox' ? 'active' : ''}`} onClick={() => setPage(n.pg)}>
              <span className="ic">{n.icon}</span>{n.label}
              {n.badge ? <span className={`nbadge ${n.bc || 'blue'}`}>{n.badge}</span> : null}
            </button>
          ))}
        </div>

        <div className="nav-sec" style={{ marginTop: 10 }}>
          <div className="nav-lbl">Workflows</div>
          {WORKFLOWS.map((n, i) => (
            <button key={i} className={`ni ${page === n.pg ? 'active' : ''}`} onClick={() => setPage(n.pg)}>
              <span className="ic">{n.icon}</span>{n.label}
              {n.badge ? <span className={`nbadge ${n.bc || 'blue'}`}>{n.badge}</span> : null}
            </button>
          ))}
        </div>

        <div className="nav-sec" style={{ marginTop: 10 }}>
          <div className="nav-lbl">SharePoint</div>
          <button className="ni" onClick={() => window.open('https://thescapegroup.sharepoint.com/sites/Sales/Shared%20Documents/7.%20Offshore%20Team/3.%20South%20East%20Asia/4.%20Working%20Documents/Scape_SEA_Outreach_Tracker.xlsx', '_blank')}>
            <span className="ic">🌏</span>SEA Outreach Tracker
          </button>
          <button className="ni" onClick={() => window.open('https://thescapegroup.sharepoint.com/sites/Sales/Shared%20Documents/7.%20Offshore%20Team/1.%20Agent%20Agreement%20Documents/2026-27/Agency%20Agreements%20Master%20List.xlsx', '_blank')}>
            <span className="ic">📋</span>Agency Agreements
          </button>
        </div>

        <div className="sb-ft">
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 9px', background: 'var(--card)', borderRadius: 10 }}>
            <div style={{ width: 27, height: 27, borderRadius: '50%', background: `linear-gradient(135deg, ${amData.color}, var(--blue))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--navy)', flexShrink: 0 }}>{amData.initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#fff' }}>{amData.name}</div>
              <div style={{ fontSize: 10, color: 'var(--soft)' }}>{amData.region}</div>
            </div>
          </div>
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 5, padding: '0 4px', fontSize: 10, color: 'var(--muted)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: sheetsOk === null ? 'var(--amber)' : sheetsOk ? 'var(--green)' : 'var(--muted)', display: 'inline-block', flexShrink: 0 }} />
            {sheetsOk === null ? 'Checking live data…' : sheetsOk ? 'Live data connected' : 'Static data · Sheets not set up'}
          </div>
        </div>
      </aside>

      <main className="main">
        {page === 'overview'  && <OverviewPage amData={amData} emails={emails} tasks={tasks} ai={ai} ld={ld} onToggle={toggleTask} onRefresh={load} lastSync={lastSync} />}
        {page === 'bookings'  && <BookingsPage amData={amData} amKey={amKey} bookingsData={bookingsData} />}
        {page === 'pipeline'  && <PipelinePage amData={amData} amKey={amKey} pipelineDataProp={pipelineData} />}
        {page === 'reminders' && <RemindersPage amData={amData} amKey={amKey} remindersData={remindersData} />}
        {page === 'weekly'    && <WeeklySummaryPage cfg={cfg} pipelineData={pipelineData} remindersData={remindersData} />}
      </main>
    </div>
  )
}
