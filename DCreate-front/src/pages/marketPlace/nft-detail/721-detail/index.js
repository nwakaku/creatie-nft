import React, { memo, useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { AloneCreate } from '@/constants';
import { getCanvasInfoById, getNFTListingInfoByType, getHighestInfoById } from '@/pages/home/store/actions';
import { getNFTOwnerByIndex } from '@/pages/home/store/request';
import { requestCanister } from '@/api/handler';
import { getAllMemberConsume } from '@/api/canvasHandler';
import '../style.less';
import { getIndexPrefix } from '@/utils/utils';
import NFTTradeHistory from '../cpns/nft-history';
import { ListingUpdate } from '@/message';
import PubSub from 'pubsub-js';
import FavoriteIcon from '../../cpns/favorite-icon';
import CanvasInfo from '@/pages/marketPlace/nft-detail/cpns/canvas-info';
import CanvasPictureInfo from '../cpns/canvas-thv';
import BuyNowContent from '@/pages/marketPlace/nft-detail/cpns/price-content';
import { userHooks } from '@/components/hooks';
import NFTOwner from '../cpns/nft-owner';

function MarketDetail(props) {
  const params = props.match.params;
  // canvas index
  const tokenIndex = parseInt(params.index);
  const type = params.type;
  // id,cansiterid
  const canvasPrinId = params.prinId;
  let [allMember, setAllMembers] = useState(null);
  const [owner, setNFTOwner] = useState('');
  const dispatch = useDispatch();
  const isAlone = () => {
    return type === AloneCreate;
  };
  const { isAuth } = userHooks();
  const { canvasInfo, highestInfo } = useSelector((state) => {
    let key1 = `canvasInfo-${type}-${canvasPrinId}`;
    let canvasInfo = (state.allcavans && state.allcavans.getIn([key1])) || {};
    let highestInfo = [];
    if (!isAlone()) {
      highestInfo = (state.allcavans && state.allcavans.getIn([`priceHighestInfo-${canvasPrinId}`])) || [];
    }
    return {
      canvasInfo: canvasInfo,
      highestInfo: highestInfo,
    };
  }, shallowEqual);

  // other hooks
  useEffect(() => {
    //获取画布的相关信息：name、desc等
    if (canvasInfo.tokenIndex === undefined) dispatch(getCanvasInfoById(type, canvasPrinId));
    dispatch(getNFTListingInfoByType(type, tokenIndex));
    //获取最高价格的像素点
    if (type !== AloneCreate && !highestInfo.length) {
      dispatch(getHighestInfoById(type, canvasPrinId));
    }
    getNFTOwnerByIndex(type, tokenIndex, (res) => {
      setNFTOwner(res);
    });
    isAlone() &&
      requestCanister(
        getAllMemberConsume,
        {
          prinId: canvasPrinId,
          success: (res) => {
            setAllMembers(res);
          },
        },
        false,
      );
    if (document?.documentElement || document?.body) {
      document.documentElement.scrollTop = document.body.scrollTop = 0;
    }
    //事件信息绑定
  }, [dispatch, isAuth]);

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
      dispatch(getNFTListingInfoByType(type, tokenIndex));
    }
  };

  useEffect(() => {
    addListener();
    const listUpdate = PubSub.subscribe(ListingUpdate, listingUpdateFunc);
    return () => {
      PubSub.unsubscribe(listUpdate);
      removeListener();
      setAllMembers = () => false;
    };
  }, []);

  const onUpdateNFTInfo = () => {
    dispatch(getNFTListingInfoByType(type, tokenIndex));
    getNFTOwnerByIndex(type, tokenIndex, (res) => {
      setNFTOwner(res);
    });
  };

  return (
    <div className="market-detail-wrapper">
      <div className="top-wrapper ">
        <div className="left-wrapper ">
          <CanvasPictureInfo type={type} index={tokenIndex} prinId={canvasPrinId} />
          <CanvasInfo canvasInfo={canvasInfo} highestInfo={highestInfo} type={type} prinId={canvasPrinId} allMember={allMember} />
        </div>
        <div className="right-wrapper">
          <div className="title">
            <div className="index">
              <span>{`${getIndexPrefix(type, canvasInfo.tokenIndex)}`}</span>
            </div>
          </div>
          <NFTOwner className={'margin-40'} ownerId={owner ? owner[0].toText() : ''} />

          <BuyNowContent index={tokenIndex} prinId={canvasPrinId} type={type} owner={owner} onUpdateNFTInfo={onUpdateNFTInfo} />
        </div>
      </div>

      <div className="margin-40">
        <NFTTradeHistory type={type} tokenIndex={tokenIndex} />
      </div>
    </div>
  );
}

export default memo(MarketDetail);
