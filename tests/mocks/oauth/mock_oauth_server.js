const http = require('http')
const url = require('url')
const crypto = require('crypto')

const supportedBrands = ['midea']
const encKey = crypto.randomBytes(32) // AES-256-GCM key (in-memory, ephemeral)
const tokenStore = new Map() // state -> { enc, iv, tag, expiresAt }

function generateTokens() {
  return { access_token: '****', refresh_token: '****', expires_in: 3600 }
}

function encrypt(obj) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', encKey, iv)
  const data = Buffer.from(JSON.stringify(obj))
  const enc = Buffer.concat([cipher.update(data), cipher.final()])
  const tag = cipher.getAuthTag()
  return { enc, iv, tag }
}

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
      try {
        const data = JSON.parse(body || '{}')
        if (!data.code || typeof data.code !== 'string') {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'bad_request' }))
          return
        }
        const tokens = generateTokens()
        res.end(JSON.stringify(tokens))
      } catch (e) {
        res.statusCode = 400
        res.end(JSON.stringify({ error: 'bad_request' }))
      }
    })
    return
  }
  if (req.method === 'POST' && parsed.pathname === '/oauth/callback') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}')
        const brand = (data.brand || '').toLowerCase()
        const state = data.state || ''
        const code = data.code || ''
        if (!brand || !supportedBrands.includes(brand)) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'unsupported_brand' }))
          return
        }
        if (typeof state !== 'string' || state.length < 8) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'bad_state' }))
          return
        }
        if (!code || typeof code !== 'string') {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'bad_request' }))
          return
        }
        const tokens = generateTokens()
        const { enc, iv, tag } = encrypt(tokens)
        const expiresAt = Date.now() + tokens.expires_in * 1000
        tokenStore.set(state, { enc: enc.toString('base64'), iv: iv.toString('base64'), tag: tag.toString('base64'), expiresAt })
        res.end(JSON.stringify({ stored: true, expires_in: tokens.expires_in }))
      } catch (e) {
        res.statusCode = 400
        res.end(JSON.stringify({ error: 'bad_request' }))
      }
    })
    return
  }
  res.statusCode = 404
  res.end(JSON.stringify({ error: 'not_found' }))
})

server.listen(8080, () => {})
