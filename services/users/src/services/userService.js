const { v4: uuidv4 } = require("uuid");
const usersModel = require("../models/userModel");

const getUsers = () => {
  return usersModel.getAll();
};

const getUserById = (id) => {
  return usersModel.getById(id);
};

const createUser = (data) => {
  const newUser = {
    id: uuidv4(),
    name: data.name,
    email: data.email
  };
  return usersModel.create(newUser);
};

module.exports = {
  getUsers,
  getUserById,
  createUser
};