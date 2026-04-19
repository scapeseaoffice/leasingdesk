/**
 * Netlify Function — Google Sheets API Proxy
 * ─────────────────────────────────────────────────────────────────────────────
 * Proxies Google Sheets API v4 reads so GOOGLE_API_KEY never reaches the browser.
 * The spreadsheet must be shared as "Anyone with the link can view".
 *
 * Usage:  GET /api/sheets?tab=AM_Totals  (redirected from /api/sheets via netlify.toml)
 * Returns: JSON array of objects, one per row, with header names as keys.
 *
 * Environment variables required in Netlify:
 *   GOOGLE_SHEETS_ID  — long ID from spreadsheet URL
 *   GOOGLE_API_KEY    — restricted API key from Google Cloud Console
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const handler = async (event) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' }
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const { GOOGLE_SHEETS_ID, GOOGLE_API_KEY } = process.env

  if (!GOOGLE_SHEETS_ID || !GOOGLE_API_KEY) {
    return { statusCode: 503, headers: corsHeaders, body: JSON.stringify({ error: 'Google Sheets not configured', configured: false }) }
  }

  const { tab } = event.queryStringParameters || {}
  if (!tab) {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Missing ?tab= parameter' }) }
  }

  const ALLOWED_TABS = ['AM_Totals', 'Partners', 'Properties', 'Bookings', 'Pipeline', 'Reminders']
  if (!ALLOWED_TABS.includes(tab)) {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: `Unknown tab: ${tab}. Allowed: ${ALLOWED_TABS.join(', ')}` }) }
  }

  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}` +
    `/values/${encodeURIComponent(tab)}?key=${GOOGLE_API_KEY}`

  try {
    const upstream = await fetch(url)

    if (!upstream.ok) {
      const err = await upstream.json().catch(() => ({}))
      console.error(`Sheets API error for tab "${tab}":`, err)
      return {
        statusCode: upstream.status,
        headers: corsHeaders,
        body: JSON.stringify({ error: err?.error?.message || 'Google Sheets API error' }),
      }
    }

    const data = await upstream.json()
    const [headers, ...rows] = data.values || []

    if (!headers) {
      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify([]) }
    }

    const records = rows
      .filter(row => row.some(cell => cell !== ''))
      .map(row => {
        const obj = {}
        headers.forEach((h, i) => { obj[h.trim()] = (row[i] ?? '').trim() })
        return obj
      })

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' },
      body: JSON.stringify(records),
    }

  } catch (err) {
    console.error('Sheets proxy error:', err)
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Failed to reach Google Sheets API' }) }
  }
}
