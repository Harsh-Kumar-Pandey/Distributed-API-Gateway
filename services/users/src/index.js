require("dotenv").config();
const express = require("express");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(express.json());

app.use("/users", userRoutes);
console.log("User Service initialized");
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});