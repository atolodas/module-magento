<?php

/**
 * Class MisterTango_Payment_Helper_Data
 */
class MisterTango_Payment_Helper_Data extends Mage_Payment_Helper_Data
{
    const XML_PATH_USERNAME = 'payment/mtpayment/mrtango_username';
    const XML_PATH_SECRET_KEY = 'payment/mtpayment/mrtango_secret_key';
    const XML_PATH_STANDARD_MODE = 'payment/mtpayment/standard_mode';
    const XML_PATH_STANDARD_REDIRECT = 'payment/mtpayment/standard_redirect';
    const XML_PATH_OVERRIDDEN_CALLBACK_URL = 'payment/mtpayment/overridden_callback_url';
    const XML_PATH_CALLBACK_URL = 'payment/mtpayment/callback_url';
    const XML_PATH_STATUS_PENDING = 'payment/mtpayment/status_pending';

    /**
     * @return mixed
     */
    public function getUsername()
    {
        return Mage::getStoreConfig(self::XML_PATH_USERNAME);
    }

    /**
     * @return mixed
     */
    public function getSecretKey()
    {
        return Mage::getStoreConfig(self::XML_PATH_SECRET_KEY);
    }

    /**
     * @return bool
     */
    public function isStandardMode()
    {
        return (bool)Mage::getStoreConfig(self::XML_PATH_STANDARD_MODE);
    }

    /**
     * @return bool
     */
    public function isStandardRedirect()
    {
        return (bool)Mage::getStoreConfig(self::XML_PATH_STANDARD_REDIRECT);
    }

    /**
     * @return bool
     */
    public function isOverriddenCallbackUrl()
    {
        return (bool)Mage::getStoreConfig(self::XML_PATH_OVERRIDDEN_CALLBACK_URL);
    }

    /**
     * @return mixed
     */
    public function getCallbackUrl()
    {
        $callbackUrl = Mage::getStoreConfig(self::XML_PATH_CALLBACK_URL);

        if ($this->isOverriddenCallbackUrl() && !empty($callbackUrl)) {
            return Mage::helper('mtpayment/utilities')->encrypt($callbackUrl, $this->getSecretKey());
        }

        return Mage::helper('mtpayment/utilities')->encrypt(
            Mage::getUrl('mtpayment/callback', array('_secure' => true)),
            $this->getSecretKey()
        );
    }

    /**
     * @return string
     */
    public function getTransactionId($quoteId = null)
    {
        if (empty($quoteId)) {
            $quoteId = Mage::getSingleton('checkout/session')->getQuoteId();
        }

        return $quoteId;
    }

    /**
     * @return mixed
     */
    public function getStatusPending()
    {
        return Mage::getStoreConfig(self::XML_PATH_STATUS_PENDING);
    }

    /**
     * @return string
     */
    public function getUrlInformation()
    {
        return Mage::getUrl('mtpayment/information', array('_secure' => true));
    }

    /**
     * @return string
     */
    public function getUrlSuccess()
    {
        return Mage::getUrl('checkout/onepage/success', array('_secure' => true));
    }
}
