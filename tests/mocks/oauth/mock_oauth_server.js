const http = require('http')
const url = require('url')

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true)
  res.setHeader('Content-Type', 'application/json')
  if (req.method === 'POST' && parsed.pathname === '/oauth/guide/start') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}')
        const brand = (data.brand || '').toLowerCase()
        const supportedBrands = ['midea']
        if (!brand) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'bad_request' }))
          return
        }
        const supported = supportedBrands.includes(brand)
        const state = Math.random().toString(36).slice(2, 10)
        const authUrl = `https://mock.oauth/authorize?brand=${brand}&state=${state}`
        res.end(JSON.stringify({ auth_url: authUrl, state, supported }))
      } catch (e) {
        res.statusCode = 400
        res.end(JSON.stringify({ error: 'bad_request' }))
      }
    })
    return
  }
  if (req.method === 'GET' && parsed.pathname === '/oauth/authorize') {
    const brand = parsed.query.brand || 'mock'
    const state = 'xyz123'
    const authUrl = `https://mock.oauth/authorize?brand=${brand}&state=${state}`
    res.end(JSON.stringify({ auth_url: authUrl }))
    return
  }
  if (req.method === 'POST' && parsed.pathname === '/oauth/token') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      res.end(JSON.stringify({ access_token: '****', refresh_token: '****', expires_in: 3600 }))
    })
    return
  }
  res.statusCode = 404
  res.end(JSON.stringify({ error: 'not_found' }))
})

server.listen(8080, () => {})
