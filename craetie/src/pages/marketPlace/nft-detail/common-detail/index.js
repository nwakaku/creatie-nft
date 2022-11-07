import React, { memo, useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { getNFTDetailInfoByIndex, getNFTListingInfoByType, getBlindBoxStatus, saveNFTInfo } from '@/pages/home/store/actions';
import { getNFTOwnerByIndex } from '@/pages/home/store/request';
import { getIPFSLink, isVideo, isCollapsed, getIPFSShowLink } from '@/utils/utils';
import NFTTradeHistory from '../cpns/nft-history';
import { ListingUpdate } from '@/message';
import PubSub from 'pubsub-js';
import BuyNowContent from '@/pages/marketPlace/nft-detail/cpns/price-content';
import { Button } from 'antd';
import { requestCanister } from '@/api/handler';
import { getMetaDataByIndex, getLinkInfoByIndex } from '@/api/nftHandler';
import { ArtCollection, CollectionType } from '@/constants';
import { getAllCreateCollection, getCreateNFTMetaDataByIndex, getCreateCollectionSettings } from '@/pages/home/store/actions';
import { ForkIcon } from '@/icons';
import RarityNameConfig from '@/assets/scripts/rarityNameConfig';
import { find } from 'lodash-es';
import Properties from './cpns/properties';
import NFTContent from './cpns/nft-content';
import NFTOwner from '../cpns/nft-owner';
import ShareIcon from './cpns/share-icon';
import BigNumber from 'bignumber.js';
import '../style.less';
import { userHooks } from '@/components/hooks';

function CommonNFTDetail(props) {
  let mount = true;
  const NFT_LINK = 'nftLink';
  const params = props.match.params;
  // canvas index
  const tokenIndex = parseInt(params.index);
  const prinId = params.prinId;
  const type = params.type;
  const isArtCollection = type.startsWith(ArtCollection);
  const [owner, setNFTOwner] = useState('');
  const [rankName, setRankName] = useState(null);
  const dispatch = useDispatch();
  const { isAuth, authToken } = userHooks();
  const { nftInfo, itemConfig, createNFTInfo, artConfig, imgUrl, detailUrl } = useSelector((state) => {
    let key1 = `noCanvasNFTInfo-${type}-${tokenIndex}`;
    let nftInfo = (state.allcavans && state.allcavans.getIn([key1])) || null;
    let itemConfig;
    let createNFTInfo;
    let artConfig;
    let imgUrl;
    let detailUrl;
    if (isArtCollection) {
      let allCreateCollection = state.auth.getIn(['allCreateCollection']) || [];
      itemConfig = find(allCreateCollection, { key: type });
      createNFTInfo = state.allcavans && state.allcavans.getIn([`createNFT-${type}-${tokenIndex}`]);
      artConfig = state.allcavans.getIn([`artCollectionConfig-${type}`]);
      imgUrl = createNFTInfo?.photoLink?.length && getIPFSLink(createNFTInfo?.photoLink[0]);
      detailUrl = createNFTInfo?.videoLink?.length && getIPFSLink(createNFTInfo?.videoLink[0]);
    } else {
      let collectionsConfig = state.auth.getIn(['collection']);
      if (collectionsConfig) itemConfig = find(collectionsConfig, { key: type });
      let linkInfo = state.allcavans.getIn([`${NFT_LINK}-${type}-${tokenIndex}`]);
      imgUrl = linkInfo?.photoLink;
      detailUrl = linkInfo?.videoLink;
    }
    return {
      nftInfo: nftInfo,
      blindBoxStatus: state.allcavans.getIn([`blindbox-${type}`]),
      itemConfig,
      createNFTInfo,
      artConfig,
      imgUrl,
      detailUrl,
    };
  }, shallowEqual);

  const rarityItem = find(RarityNameConfig, { key: type });

  const checkContentUrl = () => {
    requestCanister(
      getLinkInfoByIndex,
      {
        type,
        tokenIndex,
        prinId,
        success: (res) => {
          saveNFTInfo(dispatch, { type: `${NFT_LINK}-${type}-${tokenIndex}`, value: res });
        },
      },
      false,
    );
  };

  // other hooks
  useEffect(() => {
    if (!itemConfig) return;
    if (nftInfo === null || type === 'car') dispatch(getNFTDetailInfoByIndex(type, tokenIndex));
    dispatch(getNFTListingInfoByType(type, tokenIndex));
    !isArtCollection && checkContentUrl();
    getNFTOwnerByIndex(type, tokenIndex, (res) => {
      mount && setNFTOwner(res);
    });
    requestCanister(
      getMetaDataByIndex,
      {
        type,
        tokenIndex,
        success: (res) => {
          mount && setRankName(res);
        },
      },
      false,
    );
    if (document?.documentElement || document?.body) {
      document.documentElement.scrollTop = document.body.scrollTop = 0;
    }
  }, [itemConfig, tokenIndex]);

  useEffect(() => {
    if (isArtCollection) {
      if (!itemConfig) dispatch(getAllCreateCollection());
      if (!createNFTInfo) dispatch(getCreateNFTMetaDataByIndex(type, tokenIndex));
    }
  }, [tokenIndex, authToken]);

  useEffect(() => {
    if (isArtCollection) {
      dispatch(getCreateCollectionSettings(type));
    }
  }, [authToken]);

  const listingUpdateFunc = (topic, info) => {
    if (info.type === type && info.tokenIndex === tokenIndex) {
      dispatch(getNFTListingInfoByType(type, tokenIndex));
    }
  };

  useEffect(() => {
    const listUpdate = PubSub.subscribe(ListingUpdate, listingUpdateFunc);
    return () => {
      PubSub.unsubscribe(listUpdate);
      mount = false;
    };
  }, []);

  const onUpdateNFTInfo = () => {
    dispatch(getNFTListingInfoByType(type, tokenIndex));
    getNFTOwnerByIndex(type, tokenIndex, (res) => {
      setNFTOwner(res);
    });
  };

  const getNFTTitle = () => {
    if (isArtCollection) {
      if (itemConfig?.collectionType === CollectionType.CollectionFork) return `${itemConfig?.title}#${tokenIndex}`;
      return createNFTInfo?.name || `${itemConfig?.title}#${tokenIndex}`;
    }
    return `${itemConfig && itemConfig.title}#${tokenIndex}`;
  };

  const isCanFork = () => {
    if (isArtCollection && createNFTInfo?.bFork && artConfig && !isCollapsed()) {
      let now = new Date().getTime();
      let startline = parseInt(new BigNumber(parseInt(artConfig.startline || 0)).dividedBy(Math.pow(10, 6)));
      let deadline = parseInt(new BigNumber(parseInt(artConfig.deadline || 0)).dividedBy(Math.pow(10, 6)));
      if (deadline === 0 || (now < deadline && now > startline)) {
        if (artConfig.circluation < artConfig.totalSupply) {
          if (!isVideo(itemConfig, detailUrl) && !detailUrl?.endsWith('.html')) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const isForkDisable = () => {
    if (!isAuth || (artConfig.whiteListType == 2 && !artConfig.isWhiteList)) {
      return true;
    }
    return false;
  };

  const childProps = {
    itemConfig,
    type,
    detailUrl,
    imgUrl,
    tokenIndex,
    prinId,
  };

  return (
    <div className="market-detail-wrapper">
      <div className="top-wrapper">
        <div className="left-wrapper">
          <NFTContent {...childProps} />
          <Properties type={type} nftInfo={nftInfo} itemConfig={itemConfig} />
        </div>

        <div className="right-wrapper">
          {itemConfig && (
            <div className="space-between">
              <div className="title">
                <span>{getNFTTitle()}</span>
                {rankName && <div className="rarity tip tip-000">{rankName}</div>}
                {nftInfo && nftInfo.rarityScore > 0 && (
                  <div className="rarity tip tip-000">{`${rarityItem ? rarityItem.valueName : 'Rarity'}: ${
                    Math.round(nftInfo.rarityScore * 100) / 100 + (rarityItem ? rarityItem.valueAdd : '')
                  }`}</div>
                )}
              </div>
              <div className="share-icon">
                <ShareIcon {...childProps} />
              </div>
            </div>
          )}
          {isArtCollection && (createNFTInfo?.parentToken?.length > 0 || isCanFork()) && (
            <div className="tip tip-000 fork-info margin-20">
              {createNFTInfo?.parentToken?.length > 0 && (
                <div className="tip tip-000 fork-index">
                  Fork from:
                  <a href={`/#/third/${type}/${createNFTInfo?.parentToken[0]}/${prinId}`}>
                    <span className="fork-index">{`#${createNFTInfo?.parentToken[0]}`}</span>
                  </a>
                </div>
              )}

              {isCanFork() && (
                <a href={`/#/canvas/fork/${type}/${tokenIndex}/${encodeURIComponent(detailUrl)}`}>
                  <Button className="fork-btn" disabled={isForkDisable()}>
                    {ForkIcon}
                    Fork
                  </Button>
                </a>
              )}
            </div>
          )}
          {isArtCollection && createNFTInfo?.desc && (
            <div className="margin-20">
              <div className="tip tip-6d7278">Description</div>
              <div className="margin-5 value value-a6aeb7">{createNFTInfo?.desc}</div>
            </div>
          )}

          <NFTOwner className={'margin-40'} itemConfig={itemConfig} type={type} ownerId={owner ? owner[0].toText() : ''} creatorId={createNFTInfo?.creator?.toText() || null} />

          {itemConfig && <BuyNowContent index={tokenIndex} prinId={prinId} type={type} owner={owner} imgUrl={getIPFSShowLink(imgUrl)} onUpdateNFTInfo={onUpdateNFTInfo} />}
        </div>
      </div>
      {itemConfig && (
        <div className="margin-40">
          <NFTTradeHistory type={type} tokenIndex={tokenIndex} />
        </div>
      )}
    </div>
  );
}

export default memo(CommonNFTDetail);
