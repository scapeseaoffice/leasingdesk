/**
 * LeasingDesk — API Client
 * ─────────────────────────────────────────────────────────────────────────────
 * All Anthropic API calls go through /api/claude (the Vercel serverless proxy).
 * The API key never touches the browser — it lives in Vercel environment vars.
 *
 * VITE_DEMO_MODE=true in .env.local skips all API calls and returns demo data.
 * Useful for development without spending API credits.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { AM_CONFIG, PIPELINE_DATA, REMINDERS_INIT } from '../data/index.js'

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'
const MCP_SERVERS = [{ type: 'url', url: 'https://microsoft365.mcp.claude.com/mcp', name: 'microsoft365' }]

// ── Core API call — routes through /api/claude serverless proxy ──────────────
async function callClaude(system, user, useMcp = false) {
  if (DEMO_MODE) return { text: '', toolResults: [] }

  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system,
      user,
      mcp_servers: useMcp ? MCP_SERVERS : [],
    }),
  })

  if (!res.ok) {
    console.error('API error:', res.status, res.statusText)
    return { text: '', toolResults: [] }
  }

  const data = await res.json()
  const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n')
  const toolResults = (data.content || [])
    .filter(b => b.type === 'mcp_tool_result')
    .map(b => b.content?.[0]?.text || '')
    .filter(Boolean)

  return { text, toolResults }
}

// ── Email fetch (via Outlook MCP) ────────────────────────────────────────────
export async function getEmails(amName) {
  const { text, toolResults } = await callClaude(
    `Leasing assistant for ${amName} at Scape student accommodation. Use Microsoft 365 to get recent Outlook emails about SEA partners and leasing. Return ONLY a JSON array, no markdown. Fields: id, sender, subject, preview0, time (ISO string), isUnread (bool), tag (one of: partner | internal | urgent | action).`,
    `Fetch the most recent 10 emails for ${amName}.`,
    true // use MCP
  )

  try {
    const raw = toolResults[0] || text
    const match = raw.match(\/\[[\\s\\S]*\]\/)
    if (match) return JSON.parse(match[0])
  } catch {
    // fall through to demo data
  }

  // Demo fallback
  return [
    { id: 1, sender: 'University Living — Partner',  subject: 'Re: April commission reconciliation',     preview: 'Please confirm the revised invoice total. We need sign-off before Thursday.',          time: new Date(Date.now() - 22 * 60000).toISOString(),       isUnread: true,  tag: 'urgent'   },
    { id: 2, sender: 'Casita Partnership',           subject: 'New student enquiry - Sydney Central',    preview: 'We have a student requesting a room for Semester 2. Can you confirm availability?',  time: new Date(Date.now() - 3 * 3600000).toISOString(),      isUnread: true,  tag: 'partner'  },
    { id: 3, sender: 'AUG Student Services',         subject: 'Group block - July intake 14 students',   preview: 'Confirming 14 students arriving 22 July. Please hold Melbourne Central rooms.',       time: new Date(Date.now() - 6.5 * 3600000).toISOString(),    isUnread: false, tag: 'action'   },
    { id: 4, sender: 'Internal - Leasing Team',      subject: 'Weekly pipeline review - Thu 4pm',        preview: "Prepare your top 5 SEA partner updates for Thursday's sync.",                       time: new Date(Date.now() - 1.2 * 86400000).toISOString(),   isUnread: false, tag: 'internal' },
    { id: 5, sender: 'AECC Global',                  subject: 'Agency agreement 2026-27 - countersigned', preview: 'Attached is our fully executed agreement. Looking forward to another strong year.', time: new Date(Date.now() - 2 * 86400000).toISOString(),     isUnread: false, tag: 'partner'  },
  ]
}

// ── Task fetch
export async function getTasks(amName, amData) {
  if (amData.totalBookings === 0) {
    return [
      { id: 1, text: 'Book onboarding call with Leasing Manager',         partner: 'Internal',       priority: 'high',   done: false, due: 'Today'   },
      { id: 2, text: 'Request StarRez system access from IT',             partner: 'Internal',       priority: 'high',   done: false, due: 'Today'   },
      { id: 3, text: 'Review agent agreement templates',                  partner: 'Internal',       priority: 'medium', done: false, due: 'Mon 21'  },
      { id: 4, text: 'Introduce yourself to top Vietnam partners',        partner: 'IDP Vietnam',    priority: 'medium', done: false, due: 'Tue 22'  },
      { id: 5, text: 'Complete Scape brand and leasing training',         partner: 'Internal',       priority: 'low',    done: false, due: 'Fri 25'  },
    ]
  }
  return [
    { id: 1, text: `Reconcile April commission - ${amData.topPartners[0].name}`,              partner: amData.topPartners[0].name,        priority: 'high',   done: false, due: 'Today'   },
    { id: 2, text: 'Confirm group block - AUG July intake (14 students)',                     partner: 'AUG',                             priority: 'high',   done: false, due: 'Today'   },
    { id: 3, text: `Send updated rate card to ${amData.topPartners[1]?.name || 'Casita'}`,    partner: amData.topPartners[1]?.name || 'Casita', priority: 'medium', done: false, due: 'Mon 21'  },
    { id: 4, text: 'Follow up on agreement countersignature - AECC Global',                   partner: 'AECC Global',                       priority: 'medium', done: false, due: 'Tue 22'  },
    { id: 5, text: `Update held leasing notes in StarRez (${amData.held} pending)`,           partner: 'Internal',                        priority: 'low',    done: true,  due: 'Done'    },
    { id: 6, text: 'Review SEA Outreach Tracker - Tier 1 priority contacts',                  partner: 'SEA BD',                           priority: 'low',    done: false, due: 'Fri 25'  },
  ]
}

// ── AI daily briefing
export async function getAIBriefing(amName, amData) {
  if (amData.totalBookings === 0) {
    return `Welcome to the team, ${amName.split(' ')[0]} - your Vietnam pipeline is just getting started. Your first priority is getting StarRez raccess sorted so you can hit the ground running.`
  }

  const { text } = await callClaude(
    `You are a leasing operations assistant for ${amName} at Scape student accommodation (SEA market). Write a 2-sentence daily briefing using Scape's brand voice: daring and caring - bold, real, no corporate jargon. Top partner is ${amData.topPartners[0].name} (${amData.topPartners[0].count} leases), ${amData.held} leases on hold, ${amData.inRoom} students in-room. Plain text only, no markdown.`,
    `Daily briefing for ${amName}.`
  )

  return text || `${amData.topPartners[0].name} is carrying ${Math.round(amData.topPartners[0].count / amData.totalBookings * 100)}% of your portfolio - get that April commission sorted today before it affects the July intake. With ${amData.held} leases on hold, a quick check-in with ${amData.topPartners[1]?.name || 'your top partners'} before Friday could make the difference.`
}

// ── Weekly summary generator
export async function generateWeeklySummary() {
  const results = {}

  for (const [key, amData] of Object.entries(AM_CONFIG)) {
    const pipeline = PIPELINE_DATA[key] || []
    const reminders = REMINDERS_INIT[key] || []
    const openReminders = reminders.filter(r => !r.done).length

    const { text } = await callClaude(
      `You are writing concise end-of-week notes for Nicole Sim, head of the Scape SEA leasing team. Use Scape's brand voice: warm, direct, no jargon. 3-4 sentences max.`,
      `Write a weekly summary for ${amData.name} (${amData.region} market). Include: ${amData.totalBookings} total leases, ${amData.inRoom} in-room, ${amData.held} on hold. Top partner: ${amData.topPartners[0]?.name || 'N/A'}. Pipeline students: ${pipeline.length}. Open reminders: ${openReminders}. Start with their name.`
    )

    results[key] = text || `${amData.name} - ${amData.region}: ${amData.totalBookings} total leases with ${amData.inRoom} students in-room and ${amData.held} on hold. ${amData.topPartners[0]?.name || 'Top partner'} continues to lead volume. ${pipeline.length} students are tracked in the onboarding pipeline for the July 2026 intake. ${openReminders} reminders carry into next week.`
  }

  return results
}
