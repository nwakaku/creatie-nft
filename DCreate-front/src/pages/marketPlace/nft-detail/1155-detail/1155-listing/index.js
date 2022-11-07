import React, { memo, useState } from 'react';
import { Table, Dropdown, Menu } from 'antd';
import { formatMinuteSecond } from '@/utils/utils';
import WICPPrice from '@/components/wicp-price';
import { message, Button } from 'antd';
import Toast from '@/components/toast';
import { ListingUpdate, UpdateNFTHistory } from '@/message';
import Dialog from '@/components/dialog';
import BuyContent from '../buy';
import { requestCanister } from '@/api/handler';
import { cancelNFTList } from '@/api/nftHandler';
import { shallowEqual, useSelector } from 'react-redux';
import UserPrincipal from '@/components/user-principal';
import PubSub from 'pubsub-js';
import { userHooks } from '@/components/hooks';
import ListIcon from '@/assets/images/market/m1155/list.svg';
import { DownOutlined } from '@ant-design/icons';
import '../../style.less';

function M1155Listing(props) {
  const tokenIndex = parseInt(props.tokenIndex);
  const type = props.type;
  const listing = props.listing;

  const listType = ['All listings', 'My listings'];
  const [curListType, setCurListType] = useState(listType[0]);

  const { isAuth, authToken } = userHooks();
  const { pixelInfo } = useSelector((state) => {
    let key3 = `pixelInfo-${type}-${props.prinId}`;
    let pixelInfo = state.piexls && state.piexls.getIn([key3]);

    return {
      pixelInfo: pixelInfo,
    };
  }, shallowEqual);

  const handlerListingAction = (item) => {
    if (item.action === 'Cancel') {
      cancelListing(item);
    } else if (item.action === 'Buy') {
      Dialog.createAndShowDialog(<BuyContent isAuth={isAuth} authToken={authToken} pendingItem={[1, item]} tokenIndex={tokenIndex} pixelInfo={pixelInfo} type={type} />, 0);
    }
  };

  const cancelListing = (item) => {
    let msg = 'cancel listing';
    let func = cancelNFTList;
    let notice = Toast.loading(msg, 0);
    let { unitPrice, orderIndex } = item;
    let data = {
      tokenIndex: tokenIndex,
      type: type,
      unitPrice: unitPrice,
      orderIndex: orderIndex,
      success: (res) => {
        if (res) {
          PubSub.publish(ListingUpdate, { type: type, tokenIndex: tokenIndex });
          PubSub.publish(UpdateNFTHistory, { type: type, tokenIndex: tokenIndex });
        }
      },
      fail: (error) => {
        message.error(error);
      },
      notice: notice,
    };
    requestCanister(func, data);
  };

  const columns = [
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price) => {
        return price ? <WICPPrice iconSize={20} value={price} valueStyle={'value-14'} /> : <div></div>;
      },
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'List Time',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'From',
      key: 'from',
      dataIndex: 'from',
      ellipsis: true,
      render: (from) => {
        return <UserPrincipal prinId={from} maxLength={8} />;
      },
    },
    {
      title: '',
      key: 'action',
      dataIndex: 'action',
      render: (action, item) => {
        return (
          <Button
            style={{ width: '90px', height: '38px', background: '#000000', borderRadius: '19px', fontSize: '16px', fontFamily: 'Poppins-SemiBold, Poppins', fontWeight: '600', color: '#FFFFFF' }}
            onClick={() => {
              handlerListingAction(item);
            }}
          >
            {action}
          </Button>
        );
      },
    },
  ];
  const getDataList = () => {
    let res = [];
    let index = 0;
    for (let item of listing) {
      if (item.length === 2) {
        if (curListType === 'My listings' && item[1].seller.toText() !== authToken) {
          continue;
        }
        res.push({
          key: index + '',
          from: item[1].seller ? item[1].seller.toText() : '',
          seller: item[1].seller,
          unitPrice: item[1].unitPrice ? item[1].unitPrice : '',
          quantity: item[1].quantity ? parseInt(item[1].quantity) : '',
          time: formatMinuteSecond(item[1].timeStamp || 0, true),
          action: item[1].seller.toText() === authToken ? 'Cancel' : 'Buy',
          orderIndex: item[1].orderIndex,
        });
        index++;
      }
    }
    return res;
  };

  const onChangeTab = (key) => {
    setCurListType(key);
  };

  const listingsFilter = () => {
    const allListTypeMenu = (
      <Menu
        onClick={(e) => {
          onChangeTab(e.key);
        }}
      >
        {listType.map((item) => {
          return <Menu.Item key={item}>{item}</Menu.Item>;
        })}
      </Menu>
    );
    return (
      <Dropdown overlay={allListTypeMenu} trigger="click">
        <span style={{ fontSize: '20px', fontFamily: 'Poppins-Medium, Poppins', fontWeight: 500, color: '#A6AEB7' }} onClick={(e) => e.preventDefault()}>
          {curListType}
          <DownOutlined style={{ marginLeft: '10px', fontSize: '16px' }} />
        </span>
      </Dropdown>
    );
  };

  return (
    <div className="block-content-wrapper">
      <div className="block-header">
        <div className="flex-10">
          <img alt="" src={ListIcon}></img>
          <div className="title title-000">Listings</div>
        </div>
        {listingsFilter()}
      </div>
      <div>
        <Table columns={columns} dataSource={getDataList()} pagination={{ size: 'small' }} />
      </div>
    </div>
  );
}

export default memo(M1155Listing);
