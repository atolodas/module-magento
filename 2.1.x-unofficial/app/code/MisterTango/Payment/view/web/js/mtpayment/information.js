MTPayment.Information = {
    init: function () {
        setInterval(MTPayment.Information.updateOrderStatesTable, 30000);
    },
    updateOrderStatesTable: function () {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                var response = JSON.parse(xhttp.responseText);

                if (response.success) {
                    var order = document.getElementById('mtpayment-information-order');

                    if (order != null) {
                        order.innerHTML = response.html;
                    }

                    if (response.redirect) {
                        window.location.href = response.redirect;
                    }
                }
            }
        };
        xhttp.open('POST', MTPAYMENT_URL_TABLE_ORDER_STATUSES, true);
        xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhttp.send(
            'ajax=1' +
            '&order=' + MTPAYMENT_ORDER_ID
        );
    }
};

document.addEventListener('DOMContentLoaded', MTPayment.Information.init, false);
