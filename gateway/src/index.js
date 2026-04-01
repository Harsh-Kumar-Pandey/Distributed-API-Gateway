require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const setupProxy = require("./routes/proxy");
const rateLimiter = require('./middleware/rateLimter')

const app = express();

app.use(rateLimiter)  // before the proxy routes

// 1. MUST BE FIRST: The proxy should handle the raw stream
setupProxy(app); 

// 2. Logger and Body Parser only for local Gateway routes (if any)
app.use(morgan("dev"));
app.use(express.json()); 

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});