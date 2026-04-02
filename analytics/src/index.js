const express = require('express')
const { start } = require('./consumer')
const statsRoutes = require('./routes/statsRoutes')
const cors = require('cors')

const app = express()
const PORT = 4000
app.use(cors())
app.use(express.json())
app.use('/analytics', statsRoutes)

// Start Kafka consumer then Express server
start()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Analytics service running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Failed to start analytics service:', err)
    process.exit(1)
  })