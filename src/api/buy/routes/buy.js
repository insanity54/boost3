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
      path: '/buy/create-paypal-order',
      handler: 'buy.createPaypalOrder',
      config: {
        policies: [],
        middlewares: [],
      }
    },
    {
      method: 'POST',
      path: '/buy/capture-paypal-order',
      handler: 'buy.capturePaypalOrder'
    }
  ],
};
