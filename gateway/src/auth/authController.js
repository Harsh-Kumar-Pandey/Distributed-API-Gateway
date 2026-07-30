const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const userRepo = require('../Repository/userRepository')

const SALT_ROUNDS = 10

async function register(req, res) {
  const { email, password, name } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const existing = await userRepo.findByEmail(email)
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' })
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const user = await userRepo.createUser({ email, passwordHash, name })

  return res.status(201).json({ id: user.id, email: user.email, name: user.name })
}

async function login(req, res) {
  const { email, password } = req.body

  const user = await userRepo.findByEmail(email)
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' })
  return res.json({ token })
}

module.exports = { register, login }