let users = [];

module.exports = {
  getAll: () => users,
  getById: (id) => users.find(u => u.id === id),
  create: (user) => {
    users.push(user);
    return user;
  }
};