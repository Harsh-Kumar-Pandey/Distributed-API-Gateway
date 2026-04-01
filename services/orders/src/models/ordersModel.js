let orders = [];

module.exports = {
  getAll: () => orders,
  getById: (id) => orders.find(o => o.id === id),
  getByUserId: (userId) => orders.filter(o => o.userId === userId),
  create: (order) => {
    orders.push(order);
    return order;
  },
  updateStatus: (id, status) => {
  const order = orders.find(o => o.id === id);
  if (!order) return null;

  order.status = status;
  return order;
}
};