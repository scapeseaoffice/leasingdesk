/**
 * LeasingDesk — Google Sheets Live Data Loader
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches all six data tabs from Google Sheets via the /api/sheets proxy and
 * assembles them into the same shape that App.jsx expects from index.js.
 *
 * If the Sheets backend is not configured or the fetch fails for any reason,
 * this module returns null so the caller can fall back to static data in
 * src/data/index.js without any visible breakage.
 *
 * Called once on app mount from the root App component.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { AM_CONFIG as STATIC_CONFIG } from './index.js'

async function fetchTab(tab) {
  const res = await fetch(`/api/sheets?tab=${encodeURIComponent(tab)}`)
  if (res.status === 503) return null
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `HTTP ${res.status} for tab ${tab}`)
  }
  return res.json()
}

const num  = v  => Number(v)  || 0
const bool = v  => v === 'TRUE' || v === 'true' || v === '1' || v === 'yes'

export async function loadSheetsData() {
  try {
    const [totals, partners, properties, bookings, pipeline, reminders] =
      await Promise.all([
        fetchTab('AM_Totals'),
        fetchTab('Partners'),
        fetchTab('Properties'),
        fetchTab('Bookings'),
        fetchTab('Pipeline'),
        fetchTab('Reminders'),
      ])

    if ([totals, partners, properties, bookings, pipeline, reminders].includes(null)) {
      return null
    }

    const amConfig = {}
    for (const row of totals) {
      const key = row.amKey
      if (!key) continue
      const base = STATIC_CONFIG[key] || {}
      amConfig[key] = {
        ...base,
        name:          row.name          || base.name          || key,
        region:        row.region        || base.region        || '',
        initials:      row.initials      || base.initials      || key.slice(0, 2).toUpperCase(),
        color:         row.color         || base.color         || '#f5a623',
        totalBookings: num(row.totalBookings),
        contractValue: num(row.contractValue),
        inRoom:        num(row.inRoom),
        held:          num(row.held),
        tentative:     num(row.tentative),
        history:       num(row.history),
        note:          row.note          || '',
        topPartners: partners
          .filter(p => p.amKey === key)
          .map(p => ({ name: p.name, code: p.code, count: num(p.count), type: p.type })),
        topProperties: properties
          .filter(p => p.amKey === key)
          .map(p => ({ name: p.name, count: num(p.count) })),
        docs: base.docs || [],
      }
    }

    if (Object.keys(amConfig).length === 0) return null

    const bookingsMap = {}
    for (const row of bookings) {
      const key = row.amKey
      if (!key) continue
      if (!bookingsMap[key]) bookingsMap[key] = []
      bookingsMap[key].push({ id: row.id, student: row.student, partner: row.partner, property: row.property, status: row.status, checkin: row.checkin, room: row.room, contract: num(row.contract) })
    }

    const pipelineMap = {}
    for (const row of pipeline) {
      const key = row.amKey
      if (!key) continue
      if (!pipelineMap[key]) pipelineMap[key] = []
      pipelineMap[key].push({ id: row.id, name: row.name, flag: row.flag || '🏳️', partner: row.partner, property: row.property, checkin: row.checkin, stage: row.stage })
    }

    const remindersMap = {}
    for (const row of reminders) {
      const key = row.amKey
      if (!key) continue
      if (!remindersMap[key]) remindersMap[key] = []
      remindersMap[key].push({ id: num(row.id) || Date.now() + Math.random(), title: row.title, partner: row.partner, due: row.due, recurrence: row.recurrence, priority: row.priority, done: bool(row.done) })
    }

    return { amConfig, bookings: bookingsMap, pipelineData: pipelineMap, remindersInit: remindersMap }

  } catch (err) {
    console.warn('[LeasingDesk] Google Sheets load failed, using static data:', err.message)
    return null
  }
}
