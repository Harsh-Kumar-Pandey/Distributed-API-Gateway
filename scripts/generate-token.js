require('dotenv').config()
const jwt = require('jsonwebtoken')

const payload = {
  userId: 'harsh123',
  role: 'admin'
}

const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24d' })

console.log('Your token:')
console.log(token)