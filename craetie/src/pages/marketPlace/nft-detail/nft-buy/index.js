import React, { memo, useEffect, useState } from 'react';
import { Button, message, Input } from 'antd';
import Toast from '@/components/toast';
import { requestCanister, transferIcp2WIcp } from '@/api/handler';
import { factoryBuyNow } from '@/api/nftHandler';
import './style.less';
import { CloseDialog, WrapStateChange } from '@/message';
import PubSub from 'pubsub-js';
import icpLogo from '@/assets/images/dfinity.png';
import Close from '@/assets/images/white_close.svg';
import { ZombieNFTCreate, TurtlesCreate } from '@/constants';
import WICPPrice from '@/components/wicp-price';
import { isAuthTokenEffect, getValueDivide8, getIndexPrefix, getIPFSShowLink } from '@/utils/utils';
import Owner from '@/pages/marketPlace/cpns/owner';
import { requestICPBalance, requestWICPBalance } from '@/components/auth/store/actions';
import { useDispatch } from 'react-redux';
import BigNumber from 'bignumber.js';
import { find } from 'lodash-es';
import Dialog from '@/components/dialog';
import WrappProcess from '@/components/auth/cpns/side-wallet/wrap-process';
import { userHooks } from '@/components/hooks';

function BuyContent(props) {
  const [showRechage, setShowRecharge] = useState(false);
  const { tokenIndex, prinId, type, imgUrl, listingInfo } = props;
  const dispatch = useDispatch();

  const isZombie = () => {
    return type === ZombieNFTCreate;
  };
  const { isAuth, authToken, wicpBalance, icpBalance, collectionsConfig } = userHooks();
  const item = find(collectionsConfig, { key: type });

  useEffect(() => {
    if (isAuthTokenEffect(isAuth, authToken)) {
      dispatch(requestWICPBalance(authToken));
      dispatch(requestICPBalance(authToken));
    }
  }, [authToken]);

  const handlerTransfer = async (transAmount) => {
    transAmount = parseFloat(transAmount);
    if (transAmount > new BigNumber(icpBalance).dividedBy(Math.pow(10, 8))) {
      message.error('Insufficient ICP');
      return;
    }
    if (transAmount <= 0.0001) {
      message.error('At least 0.0001 ICP is required in this transation');
      return;
    }
    Dialog.createAndShowDialog(<WrappProcess />, 0);
    let data = {
      amount: parseFloat(transAmount),
      onChange: async (state) => {
        PubSub.publish(WrapStateChange, { state });
        if (state === 3) {
          message.success('successful');
          if (isAuth && authToken) {
            dispatch(requestWICPBalance(authToken));
            dispatch(requestICPBalance(authToken));
          }
        }
      },
    };
    requestCanister(transferIcp2WIcp, data);
  };

  const handlerBuy = async () => {
    let limit = wicpBalance < listingInfo.price;
    if (limit) {
      message.error('Insufficient balance');
      return;
    }
    PubSub.publish(CloseDialog, {});
    let notice = Toast.loading('buy', 0);
    let data = {
      tokenIndex: BigInt(tokenIndex),
      type: type,
      price: listingInfo.price,
      success: (res) => {
        console.debug('marketplace handlerListing res:', res);
        if (res) {
          message.success('You have got it');
          props.onBuyUpdate && props.onBuyUpdate();
        }
      },
      fail: (error, key) => {
        console.error('marketplace handlerListing fail:', error);
        message.error(error);
        props.onBuyUpdate && props.onBuyUpdate();
      },
      notice: notice,
    };
    await requestCanister(factoryBuyNow, data);
  };

  return (
    <div className="nft-buy-wrapper">
      <div className="nft-content-wrapper">
        <div className="buy-top-wrapper">
          {imgUrl && type === TurtlesCreate && <embed className="nftImage" src={imgUrl} />}
          {imgUrl && type !== TurtlesCreate && <img alt="" className="nftImage" src={getIPFSShowLink(imgUrl)} />}
          <div className="nft-info-right">
            <div className="title">
              <span>{item ? `${item.title}#${tokenIndex}` : getIndexPrefix(type, tokenIndex)}</span>
            </div>
            <div className="owner">
              <Owner prinId={listingInfo.seller.toText() || ''} />
            </div>
            <div className="margin-40">Total</div>
            <WICPPrice iconSize={20} value={listingInfo.price} valueStyle={'value-20'} />
            <div className="margin-10" style={{ width: '100%', height: '1px', borderBottom: '1px dashed #D8D8D8' }}></div>
            <div className="margin-10"> Balance</div>
            <WICPPrice iconSize={20} value={wicpBalance} valueStyle={wicpBalance < listingInfo.price ? 'value-red-20' : 'value-20'} />
          </div>
        </div>
        <div className="button-layout">
          <Button
            type={showRechage ? 'white-gray' : 'violet'}
            className="dc-cancel-btn"
            onClick={() => {
              setShowRecharge(!showRechage);
            }}
          >
            Recharge
          </Button>
          <Button className="dc-confirm-btn" disabled={wicpBalance < listingInfo.price} onClick={handlerBuy}>
            Payment
          </Button>
        </div>
        {showRechage && (
          <div className="charge">
            <div className="line"></div>
            <div className="tip">Total</div>
            <div className="icpValue">
              <img alt="" src={icpLogo} style={{ height: '18px' }} />
              {`  ${getValueDivide8(icpBalance)}`}
            </div>
            <Input.Group compact>
              <Input
                id="icp-input"
                style={{ width: 'calc(100% - 100px)' }}
                placeholder="amount"
                className="ant-input-violet input-angle"
                prefix={<img alt="" src={icpLogo} style={{ height: '18px' }} />}
              />
              <Button
                type="violet-angle"
                onClick={() => {
                  let input = document.getElementById('icp-input');
                  if (input && input.value) {
                    handlerTransfer(input.value);
                  }
                }}
              >
                Confirm
              </Button>
            </Input.Group>
          </div>
        )}
      </div>
      <img
        alt=""
        className="close"
        src={Close}
        onClick={() => {
          PubSub.publish(CloseDialog, {});
        }}
      ></img>
    </div>
  );
}
export default memo(BuyContent);
