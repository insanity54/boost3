'use strict';


module.exports = {
  async order(ctx) {
    // create a paypal order

    strapi.log.info('buy/order controller invoked!')

    // * [x] reject unauthorized
    const { user } = ctx.state;
    if (!user) return ctx.badRequest('reeeeeeeeeeee');

    // * [ ] get a list of all the offers the requesting user has won
    const wonOffers = await strapi.entityService.findMany('api::offer.offer', {
        filters: {
          winner: user.id
        },
    })

    const idk = strapi.service('api::buy.buy').order();
    strapi.log.info(JSON.stringify(idk))

    // * [ ] order the data for usage in paypal order api
    // * [ ] call buy.order service
    // * [ ] handle the paypal response
    ctx.body = 'ok'
  },
  async claim(ctx) {
    // DEPRECATED
    // this is called when a bidder wins an auction
    // our job is to use the twitch ID of the winner
    strapi.log.info('buy controller claim!')

    const offer = ctx.query?.offer;
    const owner = ctx.query?.owner;

    if (typeof offer === 'undefined') return ctx.badRequest('offer must be sent as a query string');
    if (typeof owner === 'undefined') return ctx.badRequest('owner must be sent as a query string');

    strapi.log.info(`owner:${owner}, offer:${offer}`)

    // Get the offer
    // const offer = await strapi.services.offer.findOne({ id: offerId });
    const offerRecord = await strapi.entityService.findOne('api::offer.offer', offer, {
      populate: { owner: true },
      fields: ['id']
    })

    strapi.log.info(JSON.stringify(offerRecord))
    
    // Check if the offer already has an owner
    if (offerRecord.owner) {
      ctx.response.status = 410;
      ctx.response.body = { message: 'Another player already claimed this offer' };
      return;
      // return ctx.badRequest('Offer already has an owner');
      // 410 Gone
    }

    // Set the owner of the offer
    const result = 'yes' //await strapi.service('api::buy.claim')(offer, ctx.state.user.id);

    // Return the result
    return result;
  }
};