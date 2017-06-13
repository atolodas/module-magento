<?php

namespace MisterTango\Payment\Block;

/**
 * Class MisterTango_Payment_Block_Button
 */
class Button extends \Magento\Framework\View\Element\Template
{
    /**
     * @var
     */
    private $order;

    /**
     * @var bool
     */
    private $initPayment = false;

    /**
     * @var \Magento\Quote\Model\QuoteFactory
     */
    protected $quoteQuoteFactory;

    /**
     * @var \MisterTango\Payment\Model\Resource\Transaction\CollectionFactory
     */
    protected $paymentResourceTransactionCollectionFactory;

    /**
     * @var \MisterTango\Payment\Model\Resource\Callback\CollectionFactory
     */
    protected $paymentResourceCallbackCollectionFactory;

    /**
     * Button constructor.
     * @param \Magento\Framework\View\Element\Template\Context $context
     * @param \Magento\Quote\Model\QuoteFactory $quoteQuoteFactory
     * @param \MisterTango\Payment\Model\Resource\Transaction\CollectionFactory $paymentResourceTransactionCollectionFactory
     * @param \MisterTango\Payment\Model\Resource\Callback\CollectionFactory $paymentResourceCallbackCollectionFactory
     * @param array $data
     */
    public function __construct(
        \Magento\Framework\View\Element\Template\Context $context,
        \Magento\Quote\Model\QuoteFactory $quoteQuoteFactory,
        \MisterTango\Payment\Model\Resource\Transaction\CollectionFactory $paymentResourceTransactionCollectionFactory,
        \MisterTango\Payment\Model\Resource\Callback\CollectionFactory $paymentResourceCallbackCollectionFactory,
        array $data = []
    ) {
        $this->quoteQuoteFactory = $quoteQuoteFactory;
        $this->paymentResourceTransactionCollectionFactory = $paymentResourceTransactionCollectionFactory;
        $this->paymentResourceCallbackCollectionFactory = $paymentResourceCallbackCollectionFactory;
        parent::__construct(
            $context,
            $data
        );
    }

    /**
     *
     */
    public function setOrder($order)
    {
        $this->order = $order;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getOrder()
    {
        return $this->order;
    }

    /**
     * @param $initPayment
     *
     * @return $this
     */
    public function setInitPayment($initPayment)
    {
        $this->initPayment = (bool)$initPayment;

        return $this;
    }

    /**
     * @return boolean
     */
    public function isInitPayment()
    {
        return $this->initPayment;
    }

    /**
     * @return mixed
     */
    public function getCustomerEmail()
    {
        if (empty($this->order)) {
            return null;
        }

        $quote = $this->quoteQuoteFactory->create()->load($this->order->getQuoteId());

        $email = $quote->getBillingAddress()->getEmail();

        if (empty($email)) {
            $email = $this->order->getCustomerEmail();
        }

        return $email;
    }

    /**
     * @param $orderId
     *
     * @return mixed
     */
    public function getWebsocket($orderId)
    {
        return $this->paymentResourceTransactionCollectionFactory->create()
            ->addFieldToFilter('order_id', $orderId)
            ->getFirstItem()
            ->getWebsocket();
    }

    /**
     * @param $orderId
     *
     * @return bool
     */
    public function isPaid($orderId)
    {
        $transactionId = $this->paymentResourceTransactionCollectionFactory->create()
            ->addFieldToFilter('order_id', $orderId)
            ->getFirstItem()
            ->getTransactionId();

        if (empty($transactionId)) {
            return false;
        }

        $callbackUuid = $this->paymentResourceCallbackCollectionFactory->create()
            ->addFieldToFilter('transaction_id', $transactionId)
            ->getFirstItem()
            ->getCallbackUuid();

        if (empty($callbackUuid)) {
            return false;
        }

        return true;
    }
}
