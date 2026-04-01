const express = require("express");
const router = express.Router();
const controller = require("../controllers/userController");

console.log("User Routes initialized");

router.get("/", controller.getUsers);
router.post("/", controller.createUser);
router.get("/:id", controller.getUser);


module.exports = router;