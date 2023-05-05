'use strict';

/**
 * paypal-key service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::paypal-key.paypal-key');
