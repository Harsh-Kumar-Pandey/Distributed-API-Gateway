const CircuitBreaker = require('opossum')
const axios = require('axios')

// This is the function that actually makes the proxy request
// opossum wraps this and monitors it for failures
const breakers = {}

const breakerOptions = {
  timeout: 3000,          // if request takes longer than 3s → failure
  errorThresholdPercentage: 50, // if 50% of requests fail → open circuit
  resetTimeout: 10000     // after 10s → try again (half-open state)
}

const makeRequest = async (target, req, res) => {
  const url = `${target}${req.originalUrl}`  
  
 
  try {
    const response = await axios({
      method: req.method,
      url,
      data: req.body,
      headers: {
        'x-user-id': req.headers['x-user-id'] || '',
        'content-type': req.headers['content-type'] || 'application/json'
      },
      params: req.query,
      validateStatus: () => true 
    })
    console.log(`[makeRequest] Success: ${url} returned ${response.status}`)
    return {
      status: response.status,
      data: response.data
    }
  } catch (error) {
    console.error(`[makeRequest] Error calling ${url}: ${error.message}`)
    throw error
  }
}

const getBreaker = (serviceName) => {
  if (!breakers[serviceName]) {
    // Create a breaker that wraps the makeRequest function
    // Each call to breaker.fire(target, req, res) will call makeRequest with those args
    const breaker = new CircuitBreaker(makeRequest, breakerOptions)

    // Log state changes
    breaker.on('open', () =>
      console.log(`🔴 Circuit OPEN for ${serviceName} — requests blocked`)
    )
    breaker.on('halfOpen', () =>
      console.log(`🟡 Circuit HALF-OPEN for ${serviceName} — testing...`)
    )
    breaker.on('close', () =>
      console.log(`🟢 Circuit CLOSED for ${serviceName} — back to normal`)
    )
    breaker.on('fallback', () =>
      console.log(`⚡ Fallback triggered for ${serviceName}`)
    )

    // Fallback response when circuit is open
    breaker.fallback(() => ({
      error: `${serviceName} is currently unavailable`,
      status: 503,
      retryAfter: '10 seconds'
    }))

    breakers[serviceName] = breaker
  }

  return breakers[serviceName]
}

// Get status of all breakers (for dashboard)
const getBreakersStatus = () => {
  return Object.entries(breakers).map(([name, breaker]) => ({
    service: name,
    state: breaker.opened ? 'OPEN' : breaker.halfOpen ? 'HALF-OPEN' : 'CLOSED',
    stats: breaker.stats
  }))
}

module.exports = { getBreaker, getBreakersStatus }