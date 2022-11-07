import React, { memo, useEffect, useState } from 'react';
import { Button, message } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import TotalIcon from '@/assets/images/market/m1155/total.svg';
import GroupIcon from '@/assets/images/market/m1155/group.svg';
import OwnIcon from '@/assets/images/market/m1155/own.svg';
import { getCanvasInfoById, getHighestInfoById } from '@/pages/home/store/actions';
import { getM1155Listing } from '@/pages/home/store/request';
import { requestCanister } from '@/api/handler';
import { get1155CopiesByIndex, balance1155PixelByIndex } from '@/api/nftHandler';
import M1155Listing from './1155-listing';
import WICPPrice from '@/components/wicp-price';
import CanvasPictureInfo from '../cpns/canvas-thv';
import '../style.less';
import { getIndexPrefix, isAuthTokenEffect, is1155Canvas } from '@/utils/utils';
import NFTTradeHistory from '../cpns/nft-history';
import { ListingUpdate, ShowAuthDrawer } from '@/message';
import PubSub from 'pubsub-js';
import SellPage from './sell-page';
import Dialog from '@/components/dialog';
import BuyContent from './buy';
import FavoriteIcon from '../../cpns/favorite-icon';
import CanvasInfo from '@/pages/marketPlace/nft-detail/cpns/canvas-info';
import { userHooks } from '@/components/hooks';

function MarketDetail(props) {
  let mount = true;
  const params = props.match.params;
  // canvas index
  const tokenIndex = parseInt(params.index);
  const type = params.type;
  // id,cansiterid
  const canvasPrinId = params.prinId;
  const [listVisible, setListVisible] = useState(false);

  const [owner, setNFTOwner] = useState(0);
  const [available, setAvailable] = useState(0);
  const [freezen, setFreezen] = useState(0);
  const [totalPixels, setTotalPixels] = useState(0);

  const [listing, setListing] = useState([]);
  const [minimumList, setMinimumList] = useState(null);
  const dispatch = useDispatch();

  const { isAuth, authToken } = userHooks();
  const { canvasInfo, highestInfo, pixelInfo } = useSelector((state) => {
    let key1 = `canvasInfo-${type}-${canvasPrinId}`;
    let canvasInfo = (state.allcavans && state.allcavans.getIn([key1])) || {};
    let key2 = `nftInfo-${type}-${tokenIndex}`;
    let highestInfo = [];
    highestInfo = (state.allcavans && state.allcavans.getIn([`priceHighestInfo-${canvasPrinId}`])) || [];
    let key3 = `pixelInfo-${type}-${canvasPrinId}`;
    let pixelInfo = state.piexls && state.piexls.getIn([key3]);

    return {
      canvasInfo: canvasInfo,
      highestInfo: highestInfo,
      pixelInfo: pixelInfo,
    };
  }, shallowEqual);

  const requestListings = () => {
    getM1155Listing(type, tokenIndex, (res) => {
      mount && setListing(res);
    });
  };
  // other hooks
  useEffect(() => {
    //获取画布的相关信息：name、desc等
    if (canvasInfo.tokenIndex === undefined) dispatch(getCanvasInfoById(type, canvasPrinId));
    //获取最高价格的像素点
    if (!highestInfo.length) {
      dispatch(getHighestInfoById(type, canvasPrinId));
    }
    requestListings();
    is1155Canvas(type) &&
      requestCanister(
        get1155CopiesByIndex,
        {
          type: type,
          tokenIndex: tokenIndex,
          success: (res) => {
            if (res.length === 2) {
              mount && setTotalPixels(res[0]);
              mount && setNFTOwner(res[1]);
            }
          },
        },
        false,
      );
    if (document?.documentElement || document?.body) {
      document.documentElement.scrollTop = document.body.scrollTop = 0;
    }
    //事件信息绑定
  }, [dispatch, isAuth]);

  const getMinimumItem = (listing) => {
    let res;
    for (let item of listing) {
      if (item[1].seller.toText() !== authToken) {
        res = item;
        break;
      }
    }
    setMinimumList(res);
  };
  const requestSelfData = () => {
    if (isAuthTokenEffect(isAuth, authToken)) {
      requestCanister(balance1155PixelByIndex, {
        type,
        tokenIndex: tokenIndex,
        success: (res) => {
          setAvailable(parseInt(res.available));
          setFreezen(parseInt(res.freezen));
        },
      });
    }
  };
  useEffect(() => {
    if (isAuthTokenEffect(isAuth, authToken)) {
      requestSelfData();
    }
    getMinimumItem(listing);
  }, [isAuth, authToken, listing]);

  const addListener = () => {
    window.addEventListener('resize', onWindowResize);
    onWindowResize();
  };
  const removeListener = () => {
    window.removeEventListener('resize', onWindowResize);
  };

  const onWindowResize = () => {};

  const listingUpdateFunc = (topic, info) => {
    if (info.type === type && info.tokenIndex === tokenIndex) {
      requestListings();
      requestSelfData();
    }
  };

  useEffect(() => {
    addListener();
    const listUpdate = PubSub.subscribe(ListingUpdate, listingUpdateFunc);
    return () => {
      mount = false;
      PubSub.unsubscribe(listUpdate);
      removeListener();
    };
  }, []);

  const onClickBuy = () => {
    if (!isAuth) {
      PubSub.publish(ShowAuthDrawer, {});
      return;
    }
    if (minimumList[1].seller.toText() === authToken) {
      message.error('Are you kidding me? You are selling this NFT as the owner. You can cancel it in your Wallet if you want. ');
      return;
    }
    Dialog.createAndShowDialog(<BuyContent isAuth={isAuth} authToken={authToken} pendingItem={minimumList} type={type} tokenIndex={tokenIndex} pixelInfo={pixelInfo} />, 0);
  };

  const handlerListClose = () => {
    setListVisible(false);
  };

  const onSellButtonClick = () => {
    let mylist = listing.filter((item) => {
      return item[1].seller.toText() === authToken;
    });
    if (mylist && mylist.length >= 5) {
      message.error('Reach max order num');
      return;
    }
    setListVisible(true); //去挂单
  };

  return (
    <div>
      {!listVisible ? (
        <div className="market-detail-wrapper">
          <div className="top-wrapper">
            <div className="left-wrapper">
              <CanvasPictureInfo type={type} index={tokenIndex} prinId={canvasPrinId} />
              <CanvasInfo canvasInfo={canvasInfo} highestInfo={highestInfo} type={type} prinId={canvasPrinId} />
            </div>
            <div className="right-wrapper">
              <div className="title">
                <div className="index">
                  <span>{`${getIndexPrefix(type, canvasInfo.tokenIndex)}`}</span>
                </div>
              </div>
              <div className="c1155-owner-info">
                <div className="flex-10">
                  <img alt="" className="favorite-count" src={TotalIcon}></img>
                  <div className="seller">{`${totalPixels} total`}</div>
                </div>
                <div className="flex-10">
                  <img alt="" className="favorite-count" src={GroupIcon}></img>
                  <div className="seller">{`${owner} owners`}</div>
                </div>
                {isAuth && (
                  <div className="flex-10">
                    <img alt="" className="favorite-count" src={OwnIcon}></img>
                    <div className="seller">{`${available + freezen} You own`}</div>
                  </div>
                )}
              </div>
              <div className="margin-40">
                <div>
                  <div className="tip tip-6d7278">Current price</div>
                  <div className="priceValue">
                    <WICPPrice iconSize={30} value={minimumList && minimumList[1].unitPrice} valueStyle={'value-48'} />
                  </div>
                </div>
                <div className="flex-10 margin-10">
                  <Button className="dc-confirm-btn" onClick={onClickBuy} disabled={!minimumList}>
                    Buy now
                  </Button>
                  {available > 0 && (
                    <Button className="dc-cancel-btn" onClick={onSellButtonClick}>
                      Sell
                    </Button>
                  )}
                </div>
              </div>
              <div className="margin-40">
                <M1155Listing type={type} tokenIndex={tokenIndex} listing={listing} prinId={canvasPrinId}></M1155Listing>
              </div>
            </div>
          </div>

          <div className="margin-40">
            <NFTTradeHistory type={type} tokenIndex={tokenIndex} />
          </div>
        </div>
      ) : (
        <SellPage index={tokenIndex} prinId={canvasPrinId} type={type} available={available} setListVisible={handlerListClose} />
      )}
    </div>
  );
}

export default memo(MarketDetail);
