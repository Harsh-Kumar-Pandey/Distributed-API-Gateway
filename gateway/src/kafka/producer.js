const { Kafka } = require('kafkajs')

const kafka = new Kafka({
  clientId: 'api-gateway',
  brokers: ['localhost:9092']
})

const producer = kafka.producer()
let isConnected = false

const connect = async () => {
  if (!isConnected) {
    await producer.connect()
    isConnected = true
    console.log('Kafka producer connected')
  }
}

const publishEvent = async (event) => {
  try {
    await connect()
    await producer.send({
      topic: 'request-logs',
      messages: [
        {
          key: event.userId,
          value: JSON.stringify(event)
        }
      ]
    })
  } catch (err) {
    // Don't crash the gateway if Kafka is down
    console.error('Kafka publish error:', err.message)
  }
}

module.exports = { publishEvent }