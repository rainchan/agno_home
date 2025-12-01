const http = require('http')
const url = require('url')

let lightState = { entity_id: 'light.living_main', brightness_pct: 0 }

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true)
  res.setHeader('Content-Type', 'application/json')
  if (req.method === 'POST' && parsed.pathname === '/ha/call_service') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}')
        if (data.domain === 'light' && data.service === 'turn_on' && data.payload && data.payload.entity_id) {
          lightState.entity_id = data.payload.entity_id
          lightState.brightness_pct = data.payload.brightness_pct || 0
          res.end(JSON.stringify({ status: 'ok', trace_id: 'abc123' }))
          return
        }
      } catch (e) {}
      res.end(JSON.stringify({ status: 'ok', trace_id: 'abc123' }))
    })
    return
  }
  if (req.method === 'GET' && parsed.pathname === '/ha/query_state') {
    const entity = parsed.query.entity_id || ''
    if (entity === lightState.entity_id) {
      res.end(JSON.stringify({ state: 'on', attributes: { brightness_pct: lightState.brightness_pct } }))
      return
    }
    res.end(JSON.stringify({ state: 'unknown', attributes: {} }))
    return
  }
  if (req.method === 'GET' && parsed.pathname === '/ha/subscribe_events') {
    res.end(JSON.stringify({ subscribed: true }))
    return
  }
  res.statusCode = 404
  res.end(JSON.stringify({ error: 'not_found' }))
})

server.listen(8081, () => {})
