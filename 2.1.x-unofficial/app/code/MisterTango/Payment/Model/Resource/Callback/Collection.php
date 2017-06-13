<?php

namespace MisterTango\Payment\Model\Resource\Callback;

/**
 * Class MisterTango_Payment_Model_Resource_Callback_Collection
 */
class Collection extends \Magento\Framework\Model\ModelResource\Db\Collection\AbstractCollection
{
    /**
     *
     */
    protected function _construct()
    {
        $this->_init('MisterTango\Payment\Model\Callback', 'MisterTango\Payment\Model\Resource\Callback');
    }
}
