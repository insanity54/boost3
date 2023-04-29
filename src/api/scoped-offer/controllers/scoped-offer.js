'use strict';

/**
 * A set of functions called "actions" for `scoped-offer`
 */

module.exports = {
  getOffer: async (ctx, next) => {

    function scopeOffer (offerRecord, user) {
      let scopedOffer = {}
      console.log(scopedOffer)

      scopedOffer.id = offerRecord.id
      scopedOffer.title = offerRecord.title
      scopedOffer.image = offerRecord.image
      scopedOffer.priceCents = offerRecord.priceCents
      scopedOffer.winnerName = offerRecord.winnerName
      scopedOffer.winnerColor = offerRecord.winnerColor
      scopedOffer.winnerId = offerRecord.winnerId

      return scopedOffer
    }

    const id = parseInt(ctx.params?.id);
    if (typeof id === 'undefined') return ctx.badRequest('offer must be sent as url param');
    strapi.log.info(`get scoped-offer controller with offer id:${id}`)

    const { user } = ctx.state; // get the authenticated user from the request context
    
    let featuredOffer = await strapi.entityService.findOne('api::offer.offer', id, {
      populate: { winner: true },
      fields: [
        'priceCents', 
        'title',
        'image',
        'id',
        'winnerName',
        'winnerColor',
        'winnerId'
      ]
    })

    // if user other than winner
    if (!user || user.id !== featuredOffer.winnerId) {
      ctx.body = JSON.stringify([scopeOffer(featuredOffer)])
    }

    else if (user.id === featuredOffer.winnerId) {
      // get all offers this user has won
      let offerRecords = await strapi.entityService.findMany('api::offer.offer', {
        fields: [
          'priceCents', 
          'title', 
          'invoiceInvoicerUrl', 
          'invoiceRecipientUrl',
          'image',
          'id',
          'winnerId',
          'winnerName',
          'winnerColor',
        ],
        filters: {
          winnerId: user.id
        }
      })




      let scopedOffers = offerRecords.map(scopeOffer);

      // sort offers putting the featured offer first
      const index = scopedOffers.findIndex(offer => offer.id === id);

      if (index !== -1) {
        const item = scopedOffers.splice(index, 1)[0];
        scopedOffers.unshift(item);
      }

      ctx.response.body = JSON.stringify(scopedOffers);

    }
    


    await next(); // call the next middleware/controller function

  }
};



