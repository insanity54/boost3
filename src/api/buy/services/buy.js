'use strict';

const fetch = require('node-fetch')

/**
 * /src/api/buy/services/buy.js
 */



// generate an access token using client id and app secret
async function generateAccessToken(clientId, clientSecret, endpoint) {
  const auth = Buffer.from(clientId + ":" + clientSecret).toString("base64")
  const response = await fetch(`${endpoint}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });
  const data = await response.json();
  return data.access_token;
}



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
  async capture (orderId) {
    const paypalKey = await strapi.entityService.findOne('api::paypal-key.paypal-key', 1)
    const accessToken = await generateAccessToken(paypalKey.clientId, paypalKey.clientSecret, paypalKey.endpoint);
    const url = `${paypalKey.endpoint}/v2/checkout/orders/${orderId}/capture`;
    console.log(`generated paypal access token:${accessToken}`)
    console.log(`here is the paypal URL --> ${url}`)
    const response = await fetch(url, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data;
  },
  async order(value) {
    const paypalKey = await strapi.entityService.findOne('api::paypal-key.paypal-key', 1)
    const accessToken = await generateAccessToken(paypalKey.clientId, paypalKey.clientSecret, paypalKey.endpoint);
    const res = await fetch(`${paypalKey.endpoint}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        purchase_units: [
          { 
            amount: {
              currency_code: 'USD',
              value: value
            }
          }
        ],
        intent: 'CAPTURE'
      })
    })

    strapi.log.info(`paypal request ok? ${res.ok}`)
    if (!res.ok) {
      console.log(res)
    }

    const json = await res.json()

    return json
  }
};