<?php

/**
 * Class MisterTango_Payment_Helper_Order
 */
class MisterTango_Payment_Helper_Order extends Mage_Core_Helper_Abstract
{
    /**
     * @param $transactionId
     * @param $amount
     * @param null $websocket
     *
     * @return mixed
     * @throws Exception
     */
    public function open($transactionId, $amount, $websocket = null)
    {
        $orderId = Mage::getModel('mtpayment/transaction')
            ->getCollection()
            ->addFieldToFilter('transaction_id', $transactionId)
            ->getFirstItem()
            ->getOrderId();

	    $salesOrderModel = Mage::getModel('sales/order');

	    // Return order id only if order really exists
	    if ($orderId) {
		    $order = $salesOrderModel->load($orderId);
		    if ($order instanceof Mage_Sales_Model_Order) {
			    return $order->getId();
		    }
	    }

        $quote = null;
        $order = null;
        if ($transactionId) {
	        $quote = Mage::getModel('sales/quote')->load($transactionId);
        }

        // Do not go further if non existing quote is present
	    if (!$quote instanceof Mage_Sales_Model_Quote) {
		    throw new Exception('Quote is required to process MisterTango open order');
	    }

	    // Lets double check if order exists
	    $reservedOrderId = $quote->getReservedOrderId();
	    if ($reservedOrderId) {
	        $order = $salesOrderModel->loadByIncrementId($reservedOrderId);

		    // If order is previously created, then return its ID
		    if ($order instanceof Mage_Sales_Model_Order) {
			    return $order->getId();
		    }
	    }

	    // If we reached this point its obvious that order is not present, so we create it
	    $service = Mage::getModel('sales/service_quote', $quote->collectTotals());
	    $service->submitAll();
	    $quote = $service->getQuote();
	    $order = $service->getOrder();

	    // If order cannot be created prevent system from further processing
	    if (!$order instanceof Mage_Sales_Model_Order) {
		    throw new Exception('Unable to retrieve order ID');
	    }

	    // Send an email to a customer (This is required, because Magento wont send emails if redirect url is present)
	    $payment = $quote->getPayment();
	    if (
	        $payment
	        && Mage::helper('mtpayment/data')->isStandardMode()
	        && $order->getEmailSent() != '1'
	        && $order->getCanSendNewEmailFlag()
	    ) {
	        try {
	            $order->sendNewOrderEmail();
	        } catch (Exception $e) {
	            Mage::logException($e);
	        }
	    }

	    // Save transaction, because if transaction would be present, then order ID would have been returned earlier
	    Mage::getModel('mtpayment/transaction')
	        ->setId($transactionId)
	        ->setData('amount', $amount)
	        ->setData('order_id', $order->getId())
	        ->setData('websocket', $websocket)
	        ->save();

	    // Lets save quote and clear cart if possible
	    $quote->save();
	    Mage::getSingleton('checkout/cart')->truncate();

	    return $order->getId();
    }

    /**
     * @param $transactionId
     * @param $amount
     *
     * @throws Exception
     */
    public function close($transactionId, $amount)
    {
        $orderId = $this->open($transactionId, $amount);

        $order = Mage::getModel('sales/order')->load($orderId);

        $totalPaidReal = bcdiv($amount, 1, 2);

        $message = Mage::helper('mtpayment')->__(
        	'MisterTango payment "%s".',
	        Mage::app()->getLocale()->currency($order->getOrderCurrencyCode())->toCurrency($totalPaidReal)
        );

	    $payment = $order->getPayment();

        if (empty($payment)) {
            throw new Exception('Order must have a valid payment');
        }

	    $payment
		    ->setTransactionId($transactionId)
            ->setPreparedMessage($message)
            ->setIsTransactionClosed(0)
            ->registerCaptureNotification($totalPaidReal);

	    $order->save();

	    $invoice = $payment->getCreatedInvoice();
        if ($invoice) {
	        $invoice->sendEmail();
        }
    }
}
