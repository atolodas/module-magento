<?php

namespace MisterTango\Payment\Model\Resource;


/**
 * Class MisterTango_Payment_Model_Callback
 */
class Callback extends \Magento\Framework\Model\ModelResource\Db\AbstractDb
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
        $this->_init('MisterTango\Payment\Model\Resource\Callback', 'callback_uuid');
    }
}
