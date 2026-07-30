const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization']

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.headers['x-user-id'] = decoded.userId  // pass userId downstream to services
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}