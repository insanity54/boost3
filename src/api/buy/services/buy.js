'use strict';

const fetch = require('node-fetch')

/**
 * /src/api/buy/services/buy.js
 */

module.exports = {
  async claim(offerId, ownerId) {
    strapi.log.info('claim() invoked')

    // Find the offer with the given ID
    const offer = await strapi.query('offer').findOne({ id: offerId });

    // Update the offer with the new owner
    const updatedOffer = await strapi.query('offer').update({ id: offerId }, { owner: ownerId });

    // Return the updated offer
    return updatedOffer;
  },
  async order() {
    const paypalTokens = await strapi.entityService.findOne('api::bot-paypal-token.bot-paypal-token', 1, {
      fields: ['accessToken', 'endpoint']
    });

    strapi.log.info('buy.order service! ')
    strapi.log.info(JSON.stringify(paypalTokens))

    const res = await fetch(`${paypalTokens.endpoint}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paypalTokens.accessToken}`
      },
      json: {
        purchase_units: [
          { amount: 987 }
        ],
        intent: 'CAPTURE',

      }
    })

    strapi.log.info(`paypal request ok? ${res.ok}`)
    if (!res.ok) {
      console.log(res)
    }

    const json = await res.json()

    return json
  }
};