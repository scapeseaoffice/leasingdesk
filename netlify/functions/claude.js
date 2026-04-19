/**
 * Netlify Function — Anthropic API Proxy
 * ─────────────────────────────────────────────────────────────────────────────
 * Sits between the browser and the Anthropic API.
 * The API key is stored in Netlify environment variables — never in client code.
 *
 * Available at: /.netlify/functions/claude  (redirected from /api/claude via netlify.toml)
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const handler = async (event) => {
  const headers = { 'Content-Type': 'application/json' }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is not set')
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'API key not configured' }) }
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) }
  }

  const { system, user, mcp_servers = [] } = body

  if (!system || !user) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required fields: system, user' }) }
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'mcp-client-2025-04-04',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        system,
        messages: [{ role: 'user', content: user }],
        ...(mcp_servers.length > 0 ? { mcp_servers } : {}),
      }),
    })

    const data = await response.json()
    return { statusCode: response.status, headers, body: JSON.stringify(data) }

  } catch (error) {
    console.error('Anthropic API request failed:', error)
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to reach Anthropic API' }) }
  }
}
