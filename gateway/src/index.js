require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const rateLimiter = require('./middleware/rateLimter')
const auth = require('./middleware/auth')
const { publishEvent } = require('./kafka/producer')
const { getBreakersStatus } = require('./middleware/circuitBreaker')
const setupProxy = require("./routes/proxy");

const app = express();

// 1. Body parser first — must be before everything
app.use(express.json())

// 2. Logger
app.use(morgan("dev"));

// 3. Kafka event publisher on every request
app.use((req, res, next) => {
  const start = Date.now()

  res.on('finish', () => {
    publishEvent({
      userId: req.headers['x-user-id'] || req.ip,
      endpoint: req.path,
      method: req.method,
      statusCode: res.statusCode,
      latencyMs: Date.now() - start,
      timestamp: new Date().toISOString()
    })
  })

  next()
})

// 4. Rate limiter
app.use(rateLimiter)

// 5. Auth
app.use(auth)

// 6. Gateway status route (before proxy so it doesn't get intercepted)
app.get('/gateway/status', (req, res) => {
  res.json({
    status: 'ok',
    circuitBreakers: getBreakersStatus()
  })
})

// 7. Proxy routes last
setupProxy(app)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});