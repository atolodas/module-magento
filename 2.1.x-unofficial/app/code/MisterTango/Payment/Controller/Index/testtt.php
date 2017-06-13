<script type="text/javascript" src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
<script src="https://payment.mistertango.com/resources/scripts/mt.collect.js?v=01" type="text/javascript"></script>
<script type="text/javascript">
    function sendrequest() {
        jQuery.ajax({
            type: "GET",
            url: 'http://tds.a2hosted.com/testmage/test.php',
            dataType: "html",
            success: function (data) {
                jQuery("#calldata").html(data);
            }
        });
    }
</script>
<div id="calldata"></div>
<button type="button" onclick="sendrequest()">Send request</button>


<script type="text/javascript">
    //Main loader (mandatory)
    document.addEventListener('DOMContentLoaded', function () {
        mrTangoCollect.load();
    }, false);

    //Set recipient (must be registered as MisterTango merchant) (mandatory)
    mrTangoCollect.set.recipient('demo@mistertango.com');

    mrTangoCollect.set.lang('en');
    mrTangoCollect.set.payer('buyer@buyer_email.com');
</script>
<button onclick="mrTangoCollect.submit('1.52', 'EUR', 'Order 1123'); return false;">Pay 1.52 EUR</button>
