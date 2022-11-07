import React, { memo, useEffect, useState } from 'react';
import { Button, message } from 'antd';
import { shallowEqual, useSelector } from 'react-redux';
import Toast from '@/components/toast';
import { requestCanister } from '@/api/handler';
import { cancelNFTList, getRoyaltyFeeRatio } from '@/api/nftHandler';
import { ListingUpdate, UpdateNFTHistory, ShowAuthDrawer } from '@/message';
import PubSub from 'pubsub-js';
import SellModal from '@/components/sell-modal';
import Dialog from '@/components/dialog';
import BuyContent from '@/pages/marketPlace/nft-detail/nft-buy';
import WICPPrice from '@/components/wicp-price';
import { ArtCollection, CollectionType } from '@/constants';
import { find } from 'lodash-es';
import { userHooks } from '@/components/hooks';
//
function BuyNowContent(props) {
  // canvas index
  const tokenIndex = parseInt(props.index);
  const type = props.type;
  const isArtCollection = type.startsWith(ArtCollection);
  // id,cansiterid
  const prinId = props.prinId;
  const owner = props.owner;
  const imgUrl = props.imgUrl;
  const [royaltyFee, setRoyaltyFee] = useState(0);
  const [listVisible, setListVisible] = useState(false);

  const { isAuth, authToken } = userHooks();
  const { canvasInfo, listingInfo, createNFTInfo, forkFee } = useSelector((state) => {
    let key1 = `canvasInfo-${type}-${prinId}`;
    let canvasInfo = (state.allcavans && state.allcavans.getIn([key1])) || {};
    let key2 = `nftInfo-${type}-${tokenIndex}`;
    let listingInfo = (state.allcavans && state.allcavans.getIn([key2])) || {};
    let createNFTInfo,
      forkFee = 0;
    if (isArtCollection) {
      createNFTInfo = state.allcavans && state.allcavans.getIn([`createNFT-${type}-${tokenIndex}`]);
      let allCreateCollection = state.auth.getIn(['allCreateCollection']) || [];
      let itemConfig = find(allCreateCollection, { key: type });
      forkFee = itemConfig?.forkRoyaltyRatio || 0;
    }
    return {
      canvasInfo,
      listingInfo,
      createNFTInfo,
      forkFee,
    };
  }, shallowEqual);

  const requestRoyaltyFee = (type) => {
    requestCanister(
      getRoyaltyFeeRatio,
      {
        type,
        success: (res) => {
          setRoyaltyFee(res);
        },
      },
      false,
    );
  };

  useEffect(() => {
    if (!isArtCollection || parseInt(type.split(':')[2]) === CollectionType.CollectionPrivite) requestRoyaltyFee(type);
  }, [type]);

  const onClickBuy = () => {
    if (!isAuth) {
      PubSub.publish(ShowAuthDrawer, {});
      return;
    }
    if (listingInfo.seller.toText() === authToken) {
      message.error('Are you kidding me? You are selling this NFT as the owner. You can cancel it in your Wallet if you want. ');
      return;
    }
    Dialog.createAndShowDialog(
      <BuyContent
        listingInfo={listingInfo}
        tokenIndex={tokenIndex}
        owner={owner[0].toText()}
        prinId={prinId}
        type={type}
        imgUrl={imgUrl}
        canvasInfo={canvasInfo}
        onBuyUpdate={() => {
          props.onUpdateNFTInfo && props.onUpdateNFTInfo();
          PubSub.publish(UpdateNFTHistory, { type: type, tokenIndex: tokenIndex });
        }}
      />,
      0,
    );
  };

  const cancelListing = (type, tokenIndex) => {
    let msg = 'cancel listing';
    let func = cancelNFTList;
    let notice = Toast.loading(msg, 0);
    let data = {
      tokenIndex: BigInt(tokenIndex),
      type: type,
      success: (res) => {
        if (res) {
          handlerListClose();
          PubSub.publish(ListingUpdate, { type: type, tokenIndex: tokenIndex });
          PubSub.publish(UpdateNFTHistory, { type: type, tokenIndex: tokenIndex });
        }
      },
      fail: (error) => {
        props.onUpdateNFTInfo && props.onUpdateNFTInfo();
        message.error(error);
      },
      notice: notice,
    };
    requestCanister(func, data);
  };

  const handlerListClose = () => {
    setListVisible(false);
  };

  const onSellButtonClick = (e, operation) => {
    if (operation === 'change') {
      if (listingInfo && listingInfo.seller) {
        cancelListing(type, tokenIndex); //取消挂单
      } else {
        setListVisible(true); //去挂单
      }
    } else {
      setListVisible(true); //去挂单
    }
  };

  return (
    <div className="margin-40">
      <div className="tip tip-6d7278">Current price</div>
      <div>
        <div className="priceValue">
          <WICPPrice iconSize={30} value={listingInfo.price} valueStyle={'value-48'} />
        </div>
        <div className="margin-10">
          {owner &&
            owner[0] &&
            (owner[0].toText() !== authToken ? (
              <Button className="dc-confirm-btn" onClick={onClickBuy} disabled={!listingInfo.price}>
                Buy now
              </Button>
            ) : (
              <div className="flex-10">
                <Button className={`${listingInfo.price ? 'dc-cancel-btn' : 'dc-confirm-btn'}`} onClick={(e) => onSellButtonClick(e, 'change')}>
                  {listingInfo.price ? 'Cancel' : 'Sell'}
                </Button>
                {listingInfo.price && (
                  <Button className="dc-confirm-btn" onClick={(e) => onSellButtonClick(e, 'update')}>
                    Update
                  </Button>
                )}
              </div>
            ))}
        </div>
      </div>

      {listVisible && <SellModal index={tokenIndex} listVisible={listVisible} type={type} setListVisible={handlerListClose} royaltyFee={createNFTInfo?.royaltyRatio || royaltyFee} forkFee={forkFee} />}
    </div>
  );
}

export default memo(BuyNowContent);
