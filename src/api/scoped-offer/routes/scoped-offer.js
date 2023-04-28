module.exports = {
  routes: [
    {
     method: 'GET',
     path: '/scoped-offer/:id',
     handler: 'scoped-offer.getOffer',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};


