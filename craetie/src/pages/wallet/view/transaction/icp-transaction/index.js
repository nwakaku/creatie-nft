import React, { memo, useEffect, useState } from 'react';
import { requestCanister, getICPTransaction, mintIcp2WIcp } from '@/api/handler';
import { Table, message, Button } from 'antd';
import { Principal } from '@dfinity/principal';
import { principalToAccountId } from '@/utils/utils';
import { isAuthTokenEffect } from '@/utils/utils';
import './style.less';
import { userHooks } from '@/components/hooks';
import Toast from '@/components/toast';

export default memo(function ICPTransaction(props) {
  let [loading, setLoading] = useState(true);
  const { isAuth, authToken } = userHooks();

  let [transaction, setTransaction] = useState([]);

  const transactionUpdate = () => {
    if (isAuthTokenEffect(isAuth, authToken))
      requestCanister(getICPTransaction, {
        accountAddress: principalToAccountId(Principal.fromText(authToken)), //'7531d783e80fa95cf2a8eb6374520650fcf83a9cc0a4726c3b6dbd31a6d6da80',
        success: (res) => {
          if (res) {
            setTransaction(res);
          }
          setLoading(false);
        },
      });
    else {
      setTransaction([]);
      setLoading(false);
    }
  };
  useEffect(() => {
    transactionUpdate();
  }, [isAuth, authToken]);

  useEffect(() => {
    return () => {
      setLoading = () => false;
      setTransaction = () => false;
    };
  }, []);

  const mintRetry = (index) => {
    let notice = Toast.loading('wrap', 0);
    let data = {
      notice,
      blockHeight: index,
      success: (res) => {
        if (res) {
          transactionUpdate();
        }
      },
      fail: (error) => {
        message.error(error);
      },
    };
    requestCanister(mintIcp2WIcp, data);
  };

  const columns = [
    {
      title: 'Height',
      dataIndex: 'index',
      key: 'key',
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'From',
      dataIndex: 'from',
      key: 'from',
      ellipsis: true,
    },
    {
      title: 'To',
      key: 'to',
      dataIndex: 'to',
      ellipsis: true,
    },
    {
      title: 'Amount',
      key: 'amount',
      dataIndex: 'amount',
    },
    {
      title: '',
      key: 'mintError',
      width: '120px',
      dataIndex: 'mintError',
      render: (mintError, item) => {
        if (mintError)
          return (
            <Button
              type="black"
              className="btn-small"
              onClick={() => {
                mintRetry(parseInt(item.index));
              }}
            >
              Retry
            </Button>
          );
        else return <></>;
      },
    },
  ];

  return (
    <div className="icp-transaction-wrapper">
      <Table loading={loading} columns={columns} dataSource={transaction} pagination={{ size: 'small', showSizeChanger: 'true' }} />
    </div>
  );
});
