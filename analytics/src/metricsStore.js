const store = {
  totalRequests: 0,
  totalErrors: 0,
  endpoints: {},    // { '/users': { count, totalLatency, errors } }
  recentRequests: [] // last 20 requests
}

const updateMetrics = (event) => {
  store.totalRequests++

  if (event.statusCode >= 400) {
    store.totalErrors++
  }

  // Per endpoint stats
  if (!store.endpoints[event.endpoint]) {
    store.endpoints[event.endpoint] = {
      count: 0,
      totalLatency: 0,
      errors: 0
    }
  }

  const ep = store.endpoints[event.endpoint]
  ep.count++
  ep.totalLatency += event.latencyMs
  if (event.statusCode >= 400) ep.errors++

  // Keep last 20 requests
  store.recentRequests.unshift({
    userId: event.userId,
    endpoint: event.endpoint,
    method: event.method,
    statusCode: event.statusCode,
    latencyMs: event.latencyMs,
    timestamp: event.timestamp
  })

  if (store.recentRequests.length > 20) {
    store.recentRequests.pop()
  }
}

const getMetrics = () => {
  const endpointStats = Object.entries(store.endpoints).map(([endpoint, data]) => ({
    endpoint,
    count: data.count,
    avgLatencyMs: data.count > 0 ? Math.round(data.totalLatency / data.count) : 0,
    errors: data.errors
  }))

  return {
    totalRequests: store.totalRequests,
    totalErrors: store.totalErrors,
    endpointStats,
    recentRequests: store.recentRequests
  }
}

module.exports = { updateMetrics, getMetrics }