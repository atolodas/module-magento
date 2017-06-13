/**
 * Copyright © 2015 Magento. All rights reserved.
 * See COPYING.txt for license details.
 */
/*browser:true*/
/*global define*/
define(
    [
        'jquery',
		'Magento_Checkout/js/view/payment/default',
		'Magento_Checkout/js/action/place-order',
		'Magento_Checkout/js/action/select-payment-method',
		'Magento_Customer/js/model/customer',
		'Magento_Checkout/js/checkout-data',
		'Magento_Checkout/js/model/payment/additional-validators',
		'mage/url',
    ],
    function ( $,
    Component,
    placeOrderAction,
    selectPaymentMethodAction,
    customer,
    checkoutData,
    additionalValidators,
    url) {
        'use strict';

        return Component.extend({
            defaults: {
                template: 'MisterTango_Payment/payment/mistertango'
            },
			  placeOrder: function (data, event) {
			  
				
				
		
		
                if (event) {
                    event.preventDefault();
                }
                var self = this,
                    placeOrder,
                    emailValidationResult = customer.isLoggedIn(),
                    loginFormSelector = 'form[data-role=email-with-possible-login]';
                if (!customer.isLoggedIn()) {
                    $(loginFormSelector).validation();
                    emailValidationResult = Boolean($(loginFormSelector + ' input[name=username]').valid());
                }
                if (emailValidationResult && this.validate() && additionalValidators.validate()) {
                    this.isPlaceOrderActionAllowed(false);
                    placeOrder = placeOrderAction(this.getData(), false, this.messageContainer);

                    $.when(placeOrder).fail(function () {
                        self.isPlaceOrderActionAllowed(true);
                    }).done(this.afterPlaceOrder.bind(this));
                    return true;
                }
                return false;
				
            },

            selectPaymentMethod: function() {
                selectPaymentMethodAction(this.getData());
                checkoutData.setSelectedPaymentMethod(this.item.method);
                return true;
            },

            afterPlaceOrder: function () {
			
				jQuery.ajax({
							   type: "GET",
							   url: 'http://tds.a2hosted.com/testmage/payment/index/',
							   dataType:"json",
							   data: ({ }),
							   success: function(data)
							   {			
									var socket_script = document.createElement('script');
									socket_script.setAttribute("type","text/javascript");
									socket_script.src = 'https://payment.mistertango.com/resources/scripts/third/socket/socket.io-1.2.1.js';
								    document.addEventListener('DOMContentLoaded', function() {mrTangoCollect.load();}, false);
									

									mrTangoCollect.set.recipient('demo@mistertango.com');
									mrTangoCollect.set.lang('en');
									mrTangoCollect.set.currency('EUR');
									mrTangoCollect.set.amount(data.gtotal)
									mrTangoCollect.set.payer(data.customer_email);	
									mrTangoCollect.custom={"callback":data.encurl};
									mrTangoCollect.submit(data.gtotal, 'EUR','Order '+data.increment_id);
									mrTangoCollect.onSuccess = function(response){
										alert("successful");
									};

							   }
							 });
								 
	
				
                //window.location.replace(url.build('mymodule/standard/redirect/'));
            },
            
            /** Returns send check to info */
            getMailingAddress: function() {
                return window.checkoutConfig.payment.checkmo.mailingAddress;
            },

           
        });
    }
);
