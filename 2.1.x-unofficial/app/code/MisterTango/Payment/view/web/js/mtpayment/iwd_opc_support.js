if (typeof MTPayment == 'undefined') {
    MTPayment = {};
}

MTPayment.IWDOPCSupport = {
    init: function () {
        IWD.OPC.Plugin.event('saveOrderBefore', MTPayment.IWDOPCSupport.controlSaveOrderBefore);
        IWD.OPC.Plugin.event('saveOrder', MTPayment.IWDOPCSupport.controlSaveOrder);
    },
    controlSaveOrderBefore: function () {
        if (payment.currentMethod != 'mtpayment') {
            return;
        }

        var callSaveOrder = IWD.OPC.callSaveOrder;
        IWD.OPC.callSaveOrder = function () {
            IWD.OPC.Plugin.dispatch('saveOrder');
            IWD.OPC.callSaveOrder = callSaveOrder;
        };
    },
    controlSaveOrder: function () {
        if (payment.currentMethod != 'mtpayment') {
            return;
        }

        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                var response = JSON.parse(xhttp.responseText);

                IWD.OPC.Checkout.hideLoader();
                IWD.OPC.Checkout.unlockPlaceOrder();

                if (response.success == false) {
                    throw new Error('MisterTango payment data retrieval has failed');
                }

                MTPayment.transaction = response.transaction;
                MTPayment.customerEmail = response.customerEmail;
                MTPayment.amount = response.amount;
                MTPayment.currency = response.currency;
                MTPayment.language = response.language;

                MTPayment.open();
            }
        };
        xhttp.open('POST', MTPAYMENT_URL_CHECKOUT + 'getPaymentData', true);
        xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhttp.send('ajax=1');
    }
};

document.addEventListener(
    'DOMContentLoaded', function () {
        MTPayment.IWDOPCSupport.init()
    },
    false
);
