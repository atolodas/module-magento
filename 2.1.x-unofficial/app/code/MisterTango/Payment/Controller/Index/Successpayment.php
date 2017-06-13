<?php

namespace MisterTango\Payment\Controller\Index;

use Magento\Framework\App\Action\Context;

/**
 * Class Successpayment
 * @package MisterTango\Payment\Controller\Index
 */
class Successpayment extends \Magento\Framework\App\Action\Action
{
    /**
     * @var \Magento\Framework\View\Result\PageFactory
     */
    protected $_resultPageFactory;

    /**
     * Successpayment constructor.
     * @param Context $context
     * @param \Magento\Framework\View\Result\PageFactory $resultPageFactory
     */
    public function __construct(Context $context, \Magento\Framework\View\Result\PageFactory $resultPageFactory)
    {
        $this->_resultPageFactory = $resultPageFactory;
        parent::__construct($context);
    }

    /**
     *
     */
    public function execute()
    {
        echo "payment done successfully";
        die;
    }
}
