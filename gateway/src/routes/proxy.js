const services = require('../config/services')
const { getBreaker } = require('../middleware/circuitBreaker')

const handleService = (serviceName, target) => {
  return async (req, res) => {
    const breaker = getBreaker(serviceName)
    try {
      const result = await breaker.fire(target, req, res)
      return res.status(result.status).json(result.data)
    } catch (err) {
      console.error(`Circuit breaker error for ${serviceName}:`, err.message)
      return res.status(503).json({
        error: `${serviceName} is unavailable`,
        retryAfter: '10 seconds'
      })
    }
  }
}

module.exports = (app) => {
  app.use('/api/shortify', handleService('shortify-service', services.SHORTIFY_SERVICE))
}