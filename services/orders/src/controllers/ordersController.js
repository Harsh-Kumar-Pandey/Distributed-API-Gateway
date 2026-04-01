const ordersService = require("../services/ordersServices");
const Joi = require("joi");

const orderSchema = Joi.object({
  userId: Joi.string().required(),
  items: Joi.array().items(Joi.string()).required(),
  totalAmount: Joi.number().required()
});

const getOrders = (req, res) => {
  res.json(ordersService.getOrders());
};

const getOrder = (req, res) => {
  const order = ordersService.getOrderById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.json(order);
};

const getOrdersByUser = (req, res) => {
  const orders = ordersService.getOrdersByUser(req.params.userId);
  res.json(orders);
};

const createOrder = (req, res) => {
  const { error } = orderSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const order = ordersService.createOrder(req.body);
  res.status(201).json(order);
};

const updateOrderStatus = (req, res) => {
  try {
    const { status } = req.body;

    const updated = ordersService.updateOrderStatus(
      req.params.id,
      status
    );

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  getOrders,
  getOrder,
  getOrdersByUser,
  createOrder,
  updateOrderStatus
};