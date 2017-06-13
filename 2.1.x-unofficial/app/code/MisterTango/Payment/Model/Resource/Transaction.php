<?php

namespace MisterTango\Payment\Model\Resource;

/**
 * Class Transaction
 * @package MisterTango\Payment\Model\Resource
 */
class Transaction extends \Magento\Framework\Model\ModelResource\Db\AbstractDb
{
    /**
     * Primary key auto increment flag
     *
     * @var bool
     */
    protected $_isPkAutoIncrement = false;

    /**
     *
     */
    protected function _construct()
    {
        $this->_init('MisterTango\Payment\Model\Resource\Transaction', 'transaction_id');
    }
}
