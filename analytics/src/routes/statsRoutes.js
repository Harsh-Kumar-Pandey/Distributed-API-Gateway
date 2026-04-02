const express = require('express')
const router = express.Router()
const { getMetrics } = require('../metricsStore')

router.get('/stats', (req, res) => {
  res.json(getMetrics())
})

router.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

module.exports = router