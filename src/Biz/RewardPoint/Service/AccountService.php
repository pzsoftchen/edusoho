<?php

namespace Biz\RewardPoint\Service;

interface AccountService
{
    public function createAccount($account);

    public function updateAccount($id, $fields);

    public function deleteAccount($id);

    public function deleteAccountByUserId($userId);

    public function getAccount($id);

    public function getAccountByUserId($id);

    public function searchAccounts($conditions, $orderBys, $start, $limit);

    public function countAccounts($conditions);

    public function waveBalance($id, $value);

    public function waveDownBalance($id, $value);
}
