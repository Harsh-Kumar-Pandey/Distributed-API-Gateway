const { Kafka } = require('kafkajs')
const { updateMetrics } = require('./metricsStore')

const kafka = new Kafka({
  clientId: 'analytics-service',
  brokers: ['localhost:9092']
})

const consumer = kafka.consumer({ groupId: 'analytics-group' })

const start = async () => {
  await consumer.connect()
  console.log('Kafka consumer connected')

  await consumer.subscribe({
    topic: 'request-logs',
    fromBeginning: true
  })

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const event = JSON.parse(message.value.toString())
        updateMetrics(event)
        console.log(`Event processed: ${event.method} ${event.endpoint} ${event.statusCode}`)
      } catch (err) {
        console.error('Error processing message:', err.message)
      }
    }
  })
}

module.exports = { start }