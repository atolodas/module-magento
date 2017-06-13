MTPayment = {
    isOpened: false,
    isOfflinePayment: false,
    success: false,
    order: null,
    websocket: null,
    transaction: null,
    customerEmail: null,
    amount: null,
    currency: null,
    language: null,
    init: function () {
        MTPayment.load();

        document.getElementsByTagName('body')[0].onclick = function (e) {
            var target = e.target || e.srcElement;

            if (target.classList.contains('mtpayment-button-pay')) {
                MTPayment.isOfflinePayment = false;

                var websocket = target.getAttribute('data-websocket');
                if (MTPayment.websocket != null && websocket.length > 0) {
                    MTPayment.websocket = websocket;
                }

                //@todo create loader and use ajax to get data
                MTPayment.order = target.getAttribute('data-order');
                MTPayment.transaction = target.getAttribute('data-transaction');
                MTPayment.customerEmail = target.getAttribute('data-customer-email');
                MTPayment.amount = target.getAttribute('data-amount');
                MTPayment.currency = target.getAttribute('data-currency');
                MTPayment.language = target.getAttribute('data-language');

                MTPayment.open();
            }
        };
    },
    initPayment: function () {
        if (typeof MTPAYMENT_INIT_PAYMENT != 'undefined' && MTPAYMENT_INIT_PAYMENT == '1') {
            var button = document.getElementsByClassName('mtpayment-button-pay')[0];
            button.click();
        }
    },
    load: function () {
        mrTangoCollect.load();

        mrTangoCollect.set.recipient(MTPAYMENT_USERNAME);

        mrTangoCollect.onOpened = MTPayment.onOpen;
        mrTangoCollect.onClosed = MTPayment.onClose;

        mrTangoCollect.onSuccess = MTPayment.onSuccess;
        mrTangoCollect.onOffLinePayment = MTPayment.onOfflinePayment;
    },
    open: function () {
        if (MTPayment.websocket != null) {
            mrTangoCollect.ws_id = MTPayment.websocket;
        }
        mrTangoCollect.set.payer(MTPayment.customerEmail);
        mrTangoCollect.set.amount(MTPayment.amount);
        mrTangoCollect.set.currency(MTPayment.currency);
        mrTangoCollect.set.description(MTPayment.transaction);
        mrTangoCollect.set.lang(MTPayment.language);

        if (MTPAYMENT_IS_OVERRIDDEN_CALLBACK_URL) {
            mrTangoCollect.custom = {'callback': MTPAYMENT_CALLBACK_URL};
        }

        mrTangoCollect.submit();
    },
    onOpen: function () {
        MTPayment.isOpened = true;
    },
    onOfflinePayment: function (response) {
        mrTangoCollect.onSuccess = function () {};
        MTPayment.isOfflinePayment = true;
        MTPayment.onSuccess(response);
    },
    onSuccess: function (response) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                var response = JSON.parse(xhttp.responseText);

                if (response.success) {
                    var elements = document.getElementsByClassName('jsAllowDifferentPayment');
                    for(var index = 0; index < elements.length; index++) {
                        elements[index].parentNode.removeChild(elements[index]);
                    }

                    MTPayment.order = response.order;
                    MTPayment.success = true;

                    MTPayment.afterSuccess();
                }
            }
        };
        xhttp.open('POST', MTPAYMENT_URL_ORDERS + (MTPayment.order?'validatetransaction':'validateorder'), true);
        xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhttp.send(
            'ajax=1' +
            '&order=' + (MTPayment.order?MTPayment.order:'') +
            '&transaction=' + MTPayment.transaction +
            '&websocket=' + mrTangoCollect.ws_id +
            '&amount=' + MTPayment.amount
        );
    },
    onClose: function () {
        MTPayment.isOpened = false;

        if (MTPayment.success) {
            MTPayment.afterSuccess();
        }
    },
    afterSuccess: function () {
        if (MTPayment.isOpened === false) {
            var url = MTPAYMENT_URL_INFORMATION;
            if (!MTPayment.isOfflinePayment && MTPAYMENT_IS_STANDARD_MODE) {
                url = MTPAYMENT_URL_SUCCESS;
            }

            var operator = url.indexOf('?') === -1?'?':'&';
            window.location.href = url + operator + 'order=' + MTPayment.order;
        }
    }
};

document.addEventListener('DOMContentLoaded', function () { MTPayment.init() }, false);

if(window.addEventListener){
    window.addEventListener('load', MTPayment.initPayment)
}else{
    window.attachEvent('onload', MTPayment.initPayment)
}
