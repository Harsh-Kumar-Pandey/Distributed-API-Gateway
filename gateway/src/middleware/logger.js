const { sendEvent } = require("../kafka/producer");

const logger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", async () => {
    const event = {
      endpoint: req.originalUrl,
      method: req.method,
      status: res.statusCode,
      latency: Date.now() - start,
      timestamp: new Date(),
    };

    await sendEvent(event);
  });

  next();
};

module.exports = logger;