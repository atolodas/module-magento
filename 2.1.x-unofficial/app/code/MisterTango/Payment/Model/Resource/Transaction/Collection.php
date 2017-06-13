<?php

namespace MisterTango\Payment\Model\Resource\Transaction;

/**
 * Class MisterTango_Payment_Model_Resource_Transaction_Collection
 */
class Collection extends \Magento\Framework\Model\ModelResource\Db\Collection\AbstractCollection
{
    /**
     *
     */
    protected function _construct()
    {
        $this->_init('MisterTango\Payment\Model\Transaction', 'MisterTango\Payment\Model\Resource\Transaction');
    }
}
