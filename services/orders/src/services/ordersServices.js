const { v4: uuidv4 } = require("uuid");
const ordersModel = require("../models/ordersModel");

const validTransitions = {
  PLACED: ["PROCESSING"],
  PROCESSING: ["COMPLETED"],
  COMPLETED: [],
};
 
const getOrders = () => {
  return ordersModel.getAll();
};

const getOrderById = (id) => {
  return ordersModel.getById(id);
};

const getOrdersByUser = (userId) => {
  return ordersModel.getByUserId(userId);
};

const createOrder = (data) => {
  const newOrder = {
    id: uuidv4(),
    userId: data.userId,
    items: data.items,
    totalAmount: data.totalAmount,
    status: "PLACED",
    createdAt: new Date()
  };

  return ordersModel.create(newOrder);
};

const updateOrderStatus = (id, newStatus) => {
  const order = ordersModel.getById(id);

  if (!order) {
    throw new Error("Order not found");
  }

  const allowed = validTransitions[order.status];

  if (!allowed.includes(newStatus)) {
    throw new Error(
      `Invalid status transition from ${order.status} to ${newStatus}`
    );
  }

  return ordersModel.updateStatus(id, newStatus);
};

module.exports = {
  getOrders,
  getOrderById,
  getOrdersByUser,
  createOrder,
  updateOrderStatus
}