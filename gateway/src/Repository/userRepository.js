const pool = require('../utils/db')

async function findByEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
  return result.rows[0] || null
}

async function createUser({ email, passwordHash, name }) {
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, name, created_at)
     VALUES ($1, $2, $3, now())
     RETURNING id, email, name, created_at`,
    [email, passwordHash, name]
  )
  return result.rows[0]
}

module.exports = { findByEmail, createUser }