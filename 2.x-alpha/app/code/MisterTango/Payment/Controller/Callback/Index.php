<?php

namespace MisterTango\Payment\Controller\Callback;

/**
 * Class Index
 * @package MisterTango\Payment\Controller\Callback
 */
class Index extends \Magento\Framework\App\Action\Action
{
    /**
     * @return mixed
     */
    public function execute()
    {
        $hash = $this->getRequest()->getParam('hash');
        if (empty($hash)) {
            die('Error occurred: Empty hash');
        }

        /*$data = json_decode(
            Mage::helper('mtpayment/utilities')->decrypt(
                $hash,
                Mage::helper('mtpayment/data')->getSecretKey()
            )
        );*/
        $data->custom = isset($data->custom) ? json_decode($data->custom) : null;
        if (empty($data->custom) || empty($data->custom->description)) {
            die('Error occurred: Custom description is empty');
        }
        if (count(explode('_', $data->custom->description)) != 2) {
            die('Error occurred: Transaction code is incorrect');
        }

        try {
            /*Mage::helper('mtpayment/order')->close(
                $data->custom->description,
                $data->custom->data->amount
            );*/
        } catch (\Exception $e) {
            die('Error occurred: '.$e->getMessage());
        }

        die('OK');
    }
}
