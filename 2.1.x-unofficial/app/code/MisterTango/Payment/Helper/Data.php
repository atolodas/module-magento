<?php

namespace MisterTango\Payment\Helper;

/**
 * Class MisterTango_Payment_Helper_Data
 */
class Data extends \Magento\Payment\Helper\Data
{
    /**
     *
     */
    const XML_PATH_USERNAME = 'payment/mtpayment/mrtango_username';

    /**
     *
     */
    const XML_PATH_SECRET_KEY = 'payment/mtpayment/mrtango_secret_key';

    /**
     *
     */
    const XML_PATH_STANDARD_MODE = 'payment/mtpayment/standard_mode';

    /**
     *
     */
    const XML_PATH_STANDARD_REDIRECT = 'payment/mtpayment/standard_redirect';

    /**
     *
     */
    const XML_PATH_OVERRIDDEN_CALLBACK_URL = 'payment/mtpayment/overridden_callback_url';

    /**
     *
     */
    const XML_PATH_CALLBACK_URL = 'payment/mtpayment/callback_url';

    /**
     *
     */
    const XML_PATH_STATUS_PENDING = 'payment/mtpayment/status_pending';

    /**
     * @var \Magento\Framework\App\Config\ScopeConfigInterface
     */
    protected $scopeConfig;

    /**
     * @var \MisterTango\Payment\Helper\Utilities
     */
    protected $paymentUtilitiesHelper;

    /**
     * @var \Magento\Checkout\Model\Session
     */
    protected $checkoutSession;

    /**
     * @var \Magento\Framework\UrlInterface
     */
    protected $_urlInterface;

    /**
     * Data constructor.
     * @param \Magento\Framework\App\Config\ScopeConfigInterface $scopeConfig
     * @param Utilities $paymentUtilitiesHelper
     * @param \Magento\Checkout\Model\Session $checkoutSession
     * @param \Magento\Framework\UrlInterface $urlInterface
     */
    public function __construct(
        \Magento\Framework\App\Config\ScopeConfigInterface $scopeConfig,
        \MisterTango\Payment\Helper\Utilities $paymentUtilitiesHelper,
        \Magento\Checkout\Model\Session $checkoutSession,
        \Magento\Framework\UrlInterface $urlInterface
    ) {
        $this->scopeConfig = $scopeConfig;
        $this->paymentUtilitiesHelper = $paymentUtilitiesHelper;
        $this->checkoutSession = $checkoutSession;
        $this->_urlInterface = $urlInterface;
    }

    /**
     * @return mixed
     */
    public function getUsername()
    {
        return $this->scopeConfig->getValue(self::XML_PATH_USERNAME, \Magento\Store\Model\ScopeInterface::SCOPE_STORE);
    }

    /**
     * @return mixed
     */
    public function getSecretKey()
    {
        return $this->scopeConfig->getValue(
            self::XML_PATH_SECRET_KEY,
            \Magento\Store\Model\ScopeInterface::SCOPE_STORE
        );
    }

    /**
     * @return bool
     */
    public function isStandardMode()
    {
        return (bool)$this->scopeConfig->getValue(
            self::XML_PATH_STANDARD_MODE,
            \Magento\Store\Model\ScopeInterface::SCOPE_STORE
        );
    }

    /**
     * @return bool
     */
    public function isStandardRedirect()
    {
        return (bool)$this->scopeConfig->getValue(
            self::XML_PATH_STANDARD_REDIRECT,
            \Magento\Store\Model\ScopeInterface::SCOPE_STORE
        );
    }

    /**
     * @return bool
     */
    public function isOverriddenCallbackUrl()
    {
        return (bool)$this->scopeConfig->getValue(
            self::XML_PATH_OVERRIDDEN_CALLBACK_URL,
            \Magento\Store\Model\ScopeInterface::SCOPE_STORE
        );
    }

    /**
     * @return mixed
     */
    public function getCallbackUrl()
    {
        $callbackUrl = $this->scopeConfig->getValue(
            self::XML_PATH_CALLBACK_URL,
            \Magento\Store\Model\ScopeInterface::SCOPE_STORE
        );

        if ($this->isOverriddenCallbackUrl() && !empty($callbackUrl)) {
            return $this->paymentUtilitiesHelper->encrypt($callbackUrl, $this->getSecretKey());
        }

        return $this->paymentUtilitiesHelper->encrypt(
            $this->_urlInterface->getUrl('mtpayment/callback', array('_secure' => true)),
            $this->getSecretKey()
        );
    }

    /**
     * @return string
     */
    public function generateTransactionId($quoteId = null)
    {
        if (empty($quoteId)) {
            $quoteId = $this->checkoutSession->getQuoteId();
        }

        return $quoteId . '_' . time();
    }

    /**
     * @return mixed
     */
    public function getStatusPending()
    {
        return $this->scopeConfig->getValue(
            self::XML_PATH_STATUS_PENDING,
            \Magento\Store\Model\ScopeInterface::SCOPE_STORE
        );
    }

    /**
     * @return string
     */
    public function getUrlInformation()
    {
        return $this->_urlInterface->getUrl('mtpayment/information', array('_secure' => true));
    }

    /**
     * @return string
     */
    public function getUrlSuccess()
    {
        return $this->_urlInterface->getUrl('checkout/onepage/success', array('_secure' => true));
    }
}
