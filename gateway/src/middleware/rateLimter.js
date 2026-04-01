const Redis = require('ioredis')
const redis = new Redis()

const BUCKET_CAPACITY = 10      // max tokens a user can have
const REFILL_RATE = 2           // tokens added per second
const REFILL_INTERVAL = 1       // refill every 1 second

module.exports = async (req, res, next) => {
  const userId = req.headers['x-user-id'] || req.ip
  const key = `token_bucket:${userId}`

  const now = Date.now()

  // Get current bucket state from Redis
  const bucket = await redis.hgetall(key)

  let tokens
  let lastRefill

  if (!bucket || !bucket.tokens) {
    // First request — create a full bucket
    tokens = BUCKET_CAPACITY
    lastRefill = now
  } else {
    tokens = parseFloat(bucket.tokens)
    lastRefill = parseInt(bucket.lastRefill)

    // Calculate how many tokens to add based on time elapsed
    const secondsElapsed = (now - lastRefill) / 1000
    const tokensToAdd = secondsElapsed * REFILL_RATE

    // Refill but don't exceed capacity
    tokens = Math.min(BUCKET_CAPACITY, tokens + tokensToAdd)
    lastRefill = now
  }

  if (tokens < 1) {
    // Not enough tokens — reject request
    return res.status(429).json({
      error: 'Too many requests - token bucket empty',
      capacity: BUCKET_CAPACITY,
      refillRate: `${REFILL_RATE} tokens/second`
    })
  }

  // Consume one token
  tokens = tokens - 1

  // Save updated bucket back to Redis
  await redis.hset(key, {
    tokens: tokens.toString(),
    lastRefill: lastRefill.toString()
  })

  // Expire key after 1 hour of inactivity
  await redis.expire(key, 3600)

  // Pass token info in headers (useful for debugging + frontend)
  res.setHeader('X-RateLimit-Remaining', Math.floor(tokens))
  res.setHeader('X-RateLimit-Limit', BUCKET_CAPACITY)

  next()
}