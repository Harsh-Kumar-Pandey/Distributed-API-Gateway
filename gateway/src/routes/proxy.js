const services = require('../config/services')
const { getBreaker } = require('../middleware/circuitBreaker')

const handleService = (serviceName, target) => {
  return async (req, res) => {
    console.log(`[handleService] ${serviceName} - ${req.method} ${req.path}`)
    const breaker = getBreaker(serviceName)

    try {
      // Pass target, req, res to the breaker
      // The breaker will call makeRequest(target, req, res) internally
      console.log(`[handleService] Calling breaker.fire() for ${serviceName}`)
      const result = await breaker.fire(target, req, res)

      console.log(`[handleService] Got result:`, result)
      // Forward the actual service response
      return res.status(result.status).json(result.data)

    } catch (err) {
      console.error(`[handleService] Circuit breaker error for ${serviceName}:`, err.message)
      console.error(`[handleService] Error stack:`, err.stack)
      return res.status(503).json({
        error: `${serviceName} is unavailable`,
        retryAfter: '10 seconds'
      })
    }
  }
}

module.exports = (app) => {
  app.use('/users', handleService('users-service', services.USERS_SERVICE))
  app.use('/orders', handleService('orders-service', services.ORDERS_SERVICE))
}

module.exports = (app) => {
  app.use('/users', handleService('users-service', services.USERS_SERVICE))
  app.use('/orders', handleService('orders-service', services.ORDERS_SERVICE))
}