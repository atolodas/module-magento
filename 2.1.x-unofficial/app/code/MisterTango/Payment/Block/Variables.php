<?php

namespace MisterTango\Payment\Block;

/**
 * Class MisterTango_Payment_Block_Variables
 */
class Variables extends \Magento\Framework\View\Element\Template
{
    /**
     * @var \MisterTango\Payment\Helper\Data
     */
    protected $paymentHelper;

    /**
     * Variables constructor.
     * @param \Magento\Framework\View\Element\Template\Context $context
     * @param \MisterTango\Payment\Helper\Data $paymentHelper
     * @param array $data
     */
    public function __construct(
        \Magento\Framework\View\Element\Template\Context $context,
        \MisterTango\Payment\Helper\Data $paymentHelper,
        array $data = []
    ) {
        $this->paymentHelper = $paymentHelper;
        parent::__construct(
            $context,
            $data
        );
    }

    /**
     * @return mixed
     */
    public function getUsername()
    {
        return $this->paymentHelper->getUsername();
    }

    /**
     * @return mixed
     */
    public function getSecretKey()
    {
        return $this->paymentHelper->getSecretKey();
    }
}
