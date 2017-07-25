<?php

namespace MisterTango\Payment\Model;

/**
 * Class MTPayment
 * @package MisterTango\Payment\Model
 */
class MTPayment extends \Magento\Payment\Model\Method\AbstractMethod
{
    /**
     * Payment code
     *
     * @var string
     */
    protected $_code = 'mtpayment';

    /**
     * @return string
     */
    public function getOrderPlaceRedirectUrl()
    {
        return \Magento\Framework\App\ObjectManager::getInstance()->get('Magento\Framework\UrlInterface')->getUrl(
            'mtpayment/review',
            array(
                '_secure' => true,
            )
        );
    }
}
