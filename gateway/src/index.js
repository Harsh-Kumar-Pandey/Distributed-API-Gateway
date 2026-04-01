require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const setupProxy = require("./routes/proxy");
const rateLimiter = require('./middleware/rateLimter')
const auth = require('./middleware/auth')
const { publishEvent } = require('./kafka/producer')

const app = express();

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

app.use(rateLimiter)  // before the proxy routes
app.use(auth) // before the proxy routes

setupProxy(app); 

// 2. Logger and Body Parser only for local Gateway routes (if any)
app.use(morgan("dev"));
app.use(express.json()); 

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});