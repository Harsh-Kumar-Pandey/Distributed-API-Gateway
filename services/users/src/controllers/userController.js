const usersService = require("../services/userService");
const Joi = require("joi");

const schema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required()
});

const getUsers = (req, res) => {
  const users = usersService.getUsers();
  res.json(users);
};

const getUser = (req, res) => {
  const user = usersService.getUserById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
};

const createUser = (req, res) => {
  
    console.log("Creating user with data:", req.body);
    const { error } = schema.validate(req.body);
    if (error) {
    return res.status(400).json({ error: error.details[0].message });
    }
  const user = usersService.createUser(req.body);
  res.status(201).json(user);
};

module.exports = {
  getUsers,
  getUser,
  createUser
};