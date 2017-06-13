<?php

namespace MisterTango\Payment\Controller\Index;

use Magento\Framework\App\Action\Context;

/**
 * Class Index
 * @package MisterTango\Payment\Controller\Index
 */
class Index extends \Magento\Framework\App\Action\Action
{
    /**
     * @var \Magento\Framework\View\Result\PageFactory
     */
    protected $_resultPageFactory;

    /**
     * Index constructor.
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
        $objectManager = \Magento\Framework\App\ObjectManager::getInstance();

        $checkoutSession = $objectManager->create('Magento\Checkout\Model\Session');

        $order = $checkoutSession->getLastRealOrder();
        $orderId = $order->getEntityId();
        $order = $objectManager->create('Magento\Sales\Model\Order')->load($orderId);
        $currencysymbol = $objectManager->get('Magento\Store\Model\StoreManagerInterface');
        $currency = $currencysymbol->getStore()->getCurrentCurrencyCode();
        $totall = $order->getGrandTotal();

        $result = array();
        $result = $order->getData();
        $result['gtotal'] = $totall;
        $result['currency'] = $currency;
        $plain_text = 'http://tds.a2hosted.com/testmage/payment/index/successpayment/';
        $key = '6Y1EjRIDzkfUy9XBNMvbGd8hwSWF2s';
        $result['encurl'] = $this->encrypt($plain_text, $key);
        echo json_encode($result);
        exit;
    }

    /**
     * @todo: this does not belong here (should be in some kinda helper or utility class)
     *
     * @param $plain_text
     * @param $key
     * @return string
     */
    function encrypt($plain_text, $key)
    {
        $key = str_pad($key, 32, "\0");

        $plain_text = trim($plain_text);
        # create a random IV to use with CBC encoding
        $iv_size = mcrypt_get_iv_size(MCRYPT_RIJNDAEL_128, MCRYPT_MODE_CBC);
        $iv = mcrypt_create_iv($iv_size, MCRYPT_RAND);

        # creates a cipher text compatible with AES (Rijndael block size = 128)
        # to keep the text confidential
        # only suitable for encoded input that never ends with value 00h (because of default zero padding)
        $ciphertext = mcrypt_encrypt(MCRYPT_RIJNDAEL_128, $key,
            $plain_text, MCRYPT_MODE_CBC, $iv);

        # prepend the IV for it to be available for decryption
        $ciphertext = $iv . $ciphertext;

        # encode the resulting cipher text so it can be represented by a string
        $sResult = base64_encode($ciphertext);
        return trim($sResult);
    }
}
