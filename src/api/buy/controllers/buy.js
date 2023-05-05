'use strict';


module.exports = {
  async createPaypalOrder(ctx) {
    // create a paypal order

    strapi.log.info('buy/createPaypalOrder controller invoked!')

    // * [x] reject unauthorized
    const { user } = ctx.state;
    if (!user) return ctx.badRequest('reeeeeeeeeeee');

    strapi.log.info(`user:${user.id}`)

    // * [ ] get a list of all the offers the requesting user has won
    const wonOffers = await strapi.entityService.findMany('api::offer.offer', {
        filters: {
          winnerId: user.twitchId
        },
    })

    strapi.log.info(`wonOffers:${JSON.stringify(wonOffers)}`)

    const shippingFee = 342
    const value = ''+(wonOffers.reduce((acc, offer) => acc + offer.priceCents, shippingFee)/100).toFixed(2)
    strapi.log.info(`value:${value}`)

    const paypalOrder = await strapi.service('api::buy.buy').order(value);
    strapi.log.info(JSON.stringify(paypalOrder))

    // create order record
    await strapi.entityService.create('api::order.order', {
      data: {
        status: 'awaitingPayment',
        paypalOrderId: paypalOrder.id,
        offers: {
          connect: wonOffers.map((o) => o.id)
        }
      }
    })

    ctx.body = paypalOrder
  },
  async capturePaypalOrder(ctx) {
    strapi.log.info('buy/capturePaypalOrder controller invoked!')

    console.log(ctx)
    const { paypalOrderId } = ctx.request.body

    console.log(`the paypalOrderId is ${paypalOrderId}`)
    if (paypalOrderId === undefined) throw new Error('paypalOrderId was not passed in the body')

    // use the orders api to capture payment for an order
    const idk = await strapi.service('api::buy.buy').capture(paypalOrderId);
    strapi.log.info('lets look at response from paypal')
    strapi.log.info(JSON.stringify(idk))

    strapi.log.info('lets update the order record')
    strapi.log.info(`paypalOrderId:${paypalOrderId}`)
    // update order record
    const order = await strapi.entityService.findMany('api::order.order', {
      filters: {
        paypalOrderId: {
          '$eq': paypalOrderId
        }
      },
      limit: 1
    })

    strapi.log.info(`we got a matching order ${JSON.stringify(order)}`)

    await strapi.entityService.update('api::order.order', order[0].id, {
      data: {
        status: 'awaitingShipment',
        paypalOrderId: paypalOrderId
      }
    })

    ctx.body = idk

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