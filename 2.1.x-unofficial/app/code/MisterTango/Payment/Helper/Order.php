<?php

namespace MisterTango\Payment\Helper;


/**
 * Class MisterTango_Payment_Helper_Order
 */
class Order extends \Magento\Framework\App\Helper\AbstractHelper
{
    /**
     * @var \MisterTango\Payment\Model\Resource\Transaction\CollectionFactory
     */
    protected $paymentResourceTransactionCollectionFactory;

    /**
     * @var \Magento\Quote\Model\QuoteFactory
     */
    protected $quoteQuoteFactory;

    /**
     * @var \MisterTango\Payment\Helper\Data
     */
    protected $paymentHelper;

    /**
     * @var \Psr\Log\LoggerInterface
     */
    protected $logger;

    /**
     * @var \MisterTango\Payment\Model\TransactionFactory
     */
    protected $paymentTransactionFactory;

    /**
     * @var \Magento\Checkout\Model\Cart
     */
    protected $checkoutCart;

    /**
     * @var \Magento\Sales\Model\OrderFactory
     */
    protected $salesOrderFactory;

    /**
     * Order constructor.
     * @param \Magento\Framework\App\Helper\Context $context
     * @param \MisterTango\Payment\Model\Resource\Transaction\CollectionFactory $paymentResourceTransactionCollectionFactory
     * @param \Magento\Quote\Model\QuoteFactory $quoteQuoteFactory
     * @param Data $paymentHelper
     * @param \Psr\Log\LoggerInterface $logger
     * @param \MisterTango\Payment\Model\TransactionFactory $paymentTransactionFactory
     * @param \Magento\Checkout\Model\Cart $checkoutCart
     * @param \Magento\Sales\Model\OrderFactory $salesOrderFactory
     */
    public function __construct(
        \Magento\Framework\App\Helper\Context $context,
        \MisterTango\Payment\Model\Resource\Transaction\CollectionFactory $paymentResourceTransactionCollectionFactory,
        \Magento\Quote\Model\QuoteFactory $quoteQuoteFactory,
        \MisterTango\Payment\Helper\Data $paymentHelper,
        \Psr\Log\LoggerInterface $logger,
        \MisterTango\Payment\Model\TransactionFactory $paymentTransactionFactory,
        \Magento\Checkout\Model\Cart $checkoutCart,
        \Magento\Sales\Model\OrderFactory $salesOrderFactory
    ) {
        $this->paymentResourceTransactionCollectionFactory = $paymentResourceTransactionCollectionFactory;
        $this->quoteQuoteFactory = $quoteQuoteFactory;
        $this->paymentHelper = $paymentHelper;
        $this->logger = $logger;
        $this->paymentTransactionFactory = $paymentTransactionFactory;
        $this->checkoutCart = $checkoutCart;
        $this->salesOrderFactory = $salesOrderFactory;
        parent::__construct(
            $context
        );
    }

    /**
     * @param $transactionId
     * @param $amount
     * @param null $websocket
     *
     * @return mixed
     * @throws \Exception
     */
    public function open($transactionId, $amount, $websocket = null)
    {
        $orderId = $this->paymentResourceTransactionCollectionFactory->create()
            ->addFieldToFilter('transaction_id', $transactionId)
            ->getFirstItem()
            ->getOrderId();

        if ($orderId) {
            return $orderId;
        }

        $transaction = explode('_', $transactionId);

        if (count($transaction) == 2) {
            $quoteId = $transaction[0];

            $quote = $this->quoteQuoteFactory->create()->load($quoteId);

            if ($quote === null) {
                throw new \Exception('Quote is required to process MisterTango open order');
            }

            $service = \Magento\Framework\App\ObjectManager::getInstance()->create('sales/service_quote',
                $quote->collectTotals());
            $service->submitAll();

            $order = $service->getOrder();

            $payment = $quote->getPayment();

            if (
                $payment
                && $this->paymentHelper->isStandardMode()
                && $order->getEmailSent() != '1'
                && $order->getCanSendNewEmailFlag()
            ) {
                try {
                    $order->sendNewOrderEmail();
                } catch (Exception $e) {
                    $this->logger->critical($e);
                }
            }

            $this->paymentTransactionFactory->create()
                ->setId($transactionId)
                ->setData('amount', $amount)
                ->setData('order_id', $order->getId())
                ->setData('websocket', $websocket)
                ->save();

            $this->checkoutCart->truncate();

            return $order->getId();
        }

        throw new \Exception('Unable to determinate order ID');
    }

    /**
     * @param $transactionId
     * @param $amount
     *
     * @throws \Exception
     */
    public function close($transactionId, $amount)
    {
        $orderId = $this->open($transactionId, $amount);

        $order = $this->salesOrderFactory->create()->load($orderId);

        $totalPaidReal = bcdiv($amount, 1, 2);

        $message = __(
            'MisterTango payment "%s".',
            Mage::app()->getLocale()->currency($order->getOrderCurrencyCode())->toCurrency($totalPaidReal)
        );

        $payment = $order->getPayment();

        if (empty($payment)) {
            throw new \Exception('Order must have a valid payment');
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
