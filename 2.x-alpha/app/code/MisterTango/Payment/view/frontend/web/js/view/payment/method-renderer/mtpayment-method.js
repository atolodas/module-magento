/*browser:true*/
/*global define*/
define(
    [
        'Magento_Checkout/js/view/payment/default',
        'Magento_Checkout/js/model/quote',
        'mage/url'
    ],
    function (Component, quote, url) {
        'use strict';

        return Component.extend({
            defaults: {
                redirectAfterPlaceOrder: false,
                template: 'MisterTango_Payment/payment/mtpayment'
            },
            getMailingAddress: function() {
                return window.checkoutConfig.payment.checkmo.mailingAddress;
            },
            afterPlaceOrder: function () {
                window.location.href = url.build('mistertango_payment/order/review/quote_id/' + quote.getQuoteId());
            }
        });
    }
);
