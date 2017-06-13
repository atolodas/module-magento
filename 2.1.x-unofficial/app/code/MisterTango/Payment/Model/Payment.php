<?php

namespace MisterTango\Payment\Model;


/**
 * Class MisterTango_Payment_Model_Payment
 */
class Payment extends \Magento\Payment\Model\Method\AbstractMethod
{
    /**
     * @var string
     */
    protected $_code = 'mtpayment';

    /**
     * @var \MisterTango\Payment\Helper\Data
     */
    protected $paymentHelper;

    /**
     * @var \Magento\Framework\UrlInterface
     */
    protected $_urlInterface;

    /**
     * Payment constructor.
     * @param \MisterTango\Payment\Helper\Data $paymentHelper
     * @param \Magento\Framework\UrlInterface $urlInterface
     */
    public function __construct(
        \MisterTango\Payment\Helper\Data $paymentHelper,
        \Magento\Framework\UrlInterface $urlInterface
    ) {
        $this->paymentHelper = $paymentHelper;
        $this->_urlInterface = $urlInterface;
    }

    /**
     * @return string
     */
    public function getOrderPlaceRedirectUrl()
    {
        if ($this->paymentHelper->isStandardMode()) {
            return $this->_urlInterface->getUrl(
                'mtpayment/information',
                array(
                    '_secure' => true,
                    'initpayment' => true
                )
            );
        }

        return '#mtpayment';
    }
}
