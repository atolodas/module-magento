<?php

namespace MisterTango\Payment\Model;

/**
 * Class MisterTango
 * @package MisterTango\Payment\Model
 */
class MisterTango extends \Magento\Payment\Model\Method\AbstractMethod
{
    /**
     * Payment code
     *
     * @var string
     */
    protected $_code = 'mistertango';

    /**
     * Availability option
     *
     * @var bool
     */
    protected $_isOffline = true;
}
