require("dotenv").config();
const express = require("express");
const orderRoutes = require("./routes/ordersRoutes");

const app = express();
app.use(express.json());

app.use("/orders", orderRoutes);

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});
