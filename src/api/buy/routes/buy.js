module.exports = {
  routes: [
    {
     method: 'PUT',
     path: '/buy/claim',
     handler: 'buy.claim',
     config: {
       policies: [],
       middlewares: [],
     },
    },
    {
      method: 'POST',
      path: '/buy/order',
      handler: 'buy.order',
      config: {
        policies: [],
        middlewares: [],
      }
    }
  ],
};
