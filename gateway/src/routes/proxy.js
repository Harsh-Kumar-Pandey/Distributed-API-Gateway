const { createProxyMiddleware, fixRequestBody } = require("http-proxy-middleware");
const services = require("../config/services");

module.exports = (app) => {
  app.use(
    "/users",
    createProxyMiddleware({
      target: services.USERS_SERVICE,
      changeOrigin: true,
      onProxyReq: fixRequestBody,
    })
  );

  app.use(
    "/orders",
    createProxyMiddleware({
      target: services.ORDERS_SERVICE,
      changeOrigin: true,
      onProxyReq: fixRequestBody,
    })
  );
};