import './style.less';
import React, { memo, useRef, useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { getNFTDetailInfoByIndex, getNFTListingInfoByType } from '@/pages/home/store/actions';
import { Button, message, Skeleton, Image } from 'antd';
import { ListingUpdate, OwnedNFTUpdate, PlayVideo, ShowAuthDrawer } from '@/message';
import PubSub from 'pubsub-js';
import WICPPrice from '../wicp-price';
import { useHistory } from 'react-router-dom';
import { TurtlesCreate, ZombieNFTCreate, BlindBoxStatus, ArtCollection, CollectionType } from '@/constants';
import RarityNameConfig from '@/assets/scripts/rarityNameConfig';
import Dialog from '@/components/dialog';
import BuyContent from '@/pages/marketPlace/nft-detail/nft-buy';
import VideoPlayer from '@/components/video-player';
import { Play, Pause, ForkIcon } from '@/icons';
import { find } from 'lodash-es';
import { openBlindBox, isBlindBoxOpen } from '@/api/nftHandler';
import Toast from '@/components/toast';
import { requestCanister } from '@/api/handler';
import { getIPFSLink, isVideo, isCollapsed, getIPFSShowLink } from '@/utils/utils';
import Operation from '../operation-nft';
import BigNumber from 'bignumber.js';
import { userHooks } from '../hooks';

// turtles的nft
function CommonNFTCover(props) {
  const history = useHistory();
  const zombiePart = ['hat', 'head', 'arm', 'leg', 'background'];
  const { baseInfo, marketInfo } = props;
  const [imgUrl, setImgUrl] = useState(baseInfo.imgUrl);
  const [detailUrl, setDetailUrl] = useState(baseInfo.detailUrl);
  const { tokenIndex, prinId, type } = baseInfo;
  const isArtCollection = type.startsWith(ArtCollection);
  const tokenIndexRef = useRef();
  tokenIndexRef.current = tokenIndex;
  const typeRef = useRef();
  typeRef.current = type;
  const dispatch = useDispatch();
  const [isBlindBox, setBlindBox] = useState(false);
  const { isAuth, authToken } = userHooks();
  const { listingInfo, nftInfo, blindBoxStatus, itemConfig, artConfig } = useSelector((state) => {
    let key1 = `noCanvasNFTInfo-${type}-${tokenIndex}`;
    let nftInfo = (state.allcavans && state.allcavans.getIn([key1])) || {};
    let key2 = `nftInfo-${type}-${tokenIndex}`;
    let listingInfo = (state.allcavans && state.allcavans.getIn([key2])) || {};
    let itemConfig;
    let artConfig;
    if (isArtCollection) {
      let allCreateCollection = state.auth.getIn(['allCreateCollection']) || [];
      itemConfig = find(allCreateCollection, { key: type });
      artConfig = state.allcavans.getIn([`artCollectionConfig-${type}`]);
    } else {
      let collectionsConfig = state.auth.getIn(['collection']) || [];
      itemConfig = find(collectionsConfig, { key: type });
    }
    return {
      nftInfo,
      listingInfo: listingInfo,
      collectionsConfig: state.auth.getIn(['collection']) || [],
      blindBoxStatus: state.allcavans.getIn([`blindbox-${type}`]),
      itemConfig,
      artConfig,
    };
  }, shallowEqual);
  const rarityItem = find(RarityNameConfig, { key: type });
  const [playing, setPlaying] = useState(false);
  const playingRef = useRef();
  playingRef.current = playing;

  useEffect(() => {
    //获取画布的相关信息：name、desc等
    !marketInfo && dispatch(getNFTListingInfoByType(type, tokenIndex));
    //事件信息绑定
  }, [dispatch]);

  useEffect(() => {
    if (imgUrl !== baseInfo.imgUrl) {
      setImgUrl(baseInfo.imgUrl);
    }
    if (detailUrl !== baseInfo.detailUrl) {
      setDetailUrl(baseInfo.detailUrl);
    }
  }, [baseInfo]);

  useEffect(() => {
    if ((!marketInfo && nftInfo.tokenIndex === undefined) || type === 'car') dispatch(getNFTDetailInfoByIndex(type, tokenIndex));
    if (playing) setPlaying(false);
  }, [tokenIndex]);

  useEffect(() => {
    if (blindBoxStatus === BlindBoxStatus.CanOpen) {
      requestCanister(
        isBlindBoxOpen,
        {
          type,
          tokenIndex,
          success: (res) => {
            setBlindBox(!res);
          },
        },
        false,
      );
    }
  }, [blindBoxStatus]);

  useEffect(() => {
    const listUpdate = PubSub.subscribe(ListingUpdate, listingUpdateFunc);
    const playUpdate = PubSub.subscribe(PlayVideo, playVideoUpdateFunc);
    const tokenInfoUpdate = PubSub.subscribe(OwnedNFTUpdate, tokenInfoUpdateFunc);
    return () => {
      setPlaying(false);
      PubSub.unsubscribe(listUpdate);
      PubSub.unsubscribe(playUpdate);
      PubSub.unsubscribe(tokenInfoUpdate);
    };
  }, []);

  const listingUpdateFunc = (topic, info) => {
    if (info.type === typeRef.current && info.tokenIndex === tokenIndexRef.current) {
      dispatch(getNFTListingInfoByType(typeRef.current, tokenIndex));
    }
  };

  const playVideoUpdateFunc = (topic, info) => {
    if (info.type === typeRef.current && info.tokenIndex !== tokenIndexRef.current) {
      if (playingRef.current) setPlaying(false);
    }
  };

  const tokenInfoUpdateFunc = (topic, info) => {
    if (info.type === typeRef.current && typeRef.current === 'car' && info.tokenIndex !== tokenIndexRef.current) {
      dispatch(getNFTDetailInfoByIndex(typeRef.current, tokenIndexRef.current));
    }
  };
  const getNFTRarityScore = () => {
    if (marketInfo) {
      return Math.round(marketInfo.rarityScore * 100) / 100;
    } else if (nftInfo.rarityScore) {
      return Math.round(nftInfo.rarityScore * 100) / 100;
    }
    return 0;
  };

  const getZombieCe = () => {
    if (marketInfo) {
      return `${marketInfo.CE}`;
    } else if (nftInfo) {
      let attack = 0,
        defense = 0,
        agile = 0;
      for (let i = 0; i < zombiePart.length; i++) {
        let info = nftInfo[zombiePart[i]];
        attack += info ? parseInt(info.attack) : 0;
        defense += info ? parseInt(info.defense) : 0;
        agile += info ? parseInt(info.agile) : 0;
      }
      return attack + defense + agile;
    }
    return 0;
  };

  const handlerOnButtonClick = (e, operation) => {
    e.stopPropagation();
    props.onButtonClick && props.onButtonClick({ tokenIndex, prinId, listingInfo, baseInfo }, type, operation);
  };

  const handlerOnTransferClick = (e) => {
    e.stopPropagation();
    props.onButton1Click && props.onButton1Click({ tokenIndex, prinId }, type);
  };

  const handlerOpenBlindboxClick = (e) => {
    e.stopPropagation();
    let notice = Toast.loading('Opening', 0);
    let data = {
      type,
      tokenIndex,
      success: (res) => {
        if (res) {
          setBlindBox(false);
          if (res?.ok?.videoLink) setDetailUrl(getIPFSLink(res.ok.videoLink[0]));
          if (res?.ok?.photoLink) setImgUrl(getIPFSLink(res.ok.photoLink[0]));
          dispatch(getNFTDetailInfoByIndex(type, tokenIndex));
        }
      },
      fail: (error) => {
        if (error) message.error(error);
      },
      error: (error) => {},
      notice: notice,
    };
    requestCanister(openBlindBox, data);
  };

  const handlerOnItemClick = () => {
    history.push(`/third/${type}/${tokenIndex}/${prinId || 'video'}`);
    props.onItemClick && props.onItemClick({ tokenIndex, prinId }, type);
  };

  const handlerOnPlayClick = (e) => {
    e.stopPropagation();
    setPlaying(!playing);
    PubSub.publish(PlayVideo, { type, tokenIndex });
  };

  const handlerBuyClick = (e) => {
    e.stopPropagation();
    if (!isAuth) {
      PubSub.publish(ShowAuthDrawer, {});
      return;
    }
    let temp = marketInfo || listingInfo;
    if (temp?.seller?.toText() === authToken) {
      message.error('Not allow buy self');
      return;
    }
    Dialog.createAndShowDialog(
      <BuyContent
        listingInfo={marketInfo || listingInfo}
        tokenIndex={tokenIndex}
        prinId={prinId}
        imgUrl={imgUrl}
        type={type}
        onBuyUpdate={() => {
          PubSub.publish(OwnedNFTUpdate, { type });
          PubSub.publish(ListingUpdate, { type, tokenIndex });
        }}
      />,
      0,
    );
  };

  const handlerOnForkClick = (e) => {
    e.stopPropagation();
    if (isForkDisable()) {
      message.error('You are not in whitelist');
      return;
    }
    history.push(`/canvas/fork/${type}/${tokenIndex}/${encodeURIComponent(detailUrl)}`);
    props.onItemClick && props.onItemClick({ tokenIndex, prinId }, type);
  };

  const getNFTContent = () => {
    let content;
    if (isVideo(itemConfig, detailUrl)) {
      !playing
        ? (content = (
            <div className="image-wrapper">
              <Image src={getIPFSShowLink(imgUrl)} placeholder={<Skeleton.Image />} preview={false} />
            </div>
          ))
        : (content = (
            <div className="image-wrapper">
              <VideoPlayer src={getIPFSShowLink(detailUrl)} controls={false} />
            </div>
          ));
    } else if (type === TurtlesCreate) content = <embed className="image-wrapper" src={getIPFSShowLink(imgUrl)} />;
    else
      content = (
        <div className={type === ZombieNFTCreate ? 'zombie-image-wrapper' : 'image-wrapper'}>
          <Image src={getIPFSShowLink(imgUrl)} placeholder={<Skeleton.Image />} fallback={detailUrl} preview={false} />
        </div>
      );
    return content;
  };

  const getNFTTitle = () => {
    if (isArtCollection) {
      if (itemConfig?.collectionType === CollectionType.CollectionFork) return `${itemConfig?.title}#${tokenIndex}`;
      else return baseInfo?.name ? `${baseInfo?.name}` : `${itemConfig?.title}#${tokenIndex}`;
    }
    return `${itemConfig?.title}#${tokenIndex}`;
  };

  const isCanFork = () => {
    if (isArtCollection && baseInfo.bFork && artConfig && !isCollapsed()) {
      let now = new Date().getTime();
      let startline = parseInt(new BigNumber(parseInt(artConfig.startline || 0)).dividedBy(Math.pow(10, 6)));
      let deadline = parseInt(new BigNumber(parseInt(artConfig.deadline || 0)).dividedBy(Math.pow(10, 6)));
      if (deadline === 0 || (now < deadline && now > startline)) {
        if (artConfig.circluation < artConfig.totalSupply) {
          if (!isVideo(itemConfig, detailUrl) && !detailUrl.endsWith('.html')) {
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

  const propsData = {
    canOperation: baseInfo.canOperation,
    listingInfo: marketInfo || listingInfo,
    handlerOnForkClick: isCanFork() ? handlerOnForkClick : null,
    handlerOnButtonClick,
    handlerOpenBlindboxClick,
    blindBoxStatus,
    isBlindBox,
    handlerBuyClick,
    handlerOnTransferClick,
  };

  const isMarketIcon = (!baseInfo.canOperation && ((marketInfo && marketInfo.seller) || (listingInfo && listingInfo.seller))) || (isCanFork() && !baseInfo.canOperation);
  return (
    <div className="common-nft-wrapper" onClick={handlerOnItemClick}>
      <div className="image-content">
        {/* <LazyLoad throttle={200} height={200}> */}
        {/* <Skeleton.Image /> */}
        {getNFTContent()}
        {/* </LazyLoad> */}
        <div className="transparent" />
        {isVideo(itemConfig, detailUrl) && detailUrl && (
          <div className="control-icon">
            <div className="icon" onClick={handlerOnPlayClick}>
              {playing ? Pause : Play}
            </div>
          </div>
        )}
      </div>

      <div className="detail margin-10">
        <div className="nft-index">{getNFTTitle()}</div>
      </div>
      {getNFTRarityScore() > 0 && (
        <div className={`detail ${isMarketIcon ? '' : 'margin-10'}`}>
          <div className="nft-rare">
            {`${rarityItem ? rarityItem.valueName : 'Rarity'}: `}
            <span>{getNFTRarityScore() + (rarityItem ? rarityItem.valueAdd : '')}</span>
          </div>
          {type === ZombieNFTCreate && (
            <div className="nft-rare">
              CE: <span>{getZombieCe()}</span>
            </div>
          )}
        </div>
      )}
      <div className={`detail ${isMarketIcon ? '' : 'margin-20'}`}>
        {baseInfo.canOperation ? <Operation {...propsData} /> : <div></div>}
        <div>
          {marketInfo && marketInfo.price ? (
            <WICPPrice iconSize={20} value={marketInfo.price} valueStyle={'value-20'} ellipsis={18} />
          ) : listingInfo?.seller ? (
            <WICPPrice iconSize={20} value={listingInfo?.price} valueStyle={'value-20'} ellipsis={18} />
          ) : baseInfo.canOperation ? (
            <Button
              className="sell-button"
              onClick={(e) => {
                handlerOnButtonClick(e, 'change');
              }}
            >
              Sell
            </Button>
          ) : (
            <WICPPrice iconSize={20} value={0} valueStyle={'value-20'} wrapperStyle={'hidden'} />
          )}
        </div>
      </div>
      {isMarketIcon ? (
        <div className="operation">
          {!baseInfo.canOperation && ((marketInfo && marketInfo.seller) || (listingInfo && listingInfo.seller)) && (
            <Button className="buy-button" onClick={handlerBuyClick}>
              Buy
            </Button>
          )}
          {isCanFork() && !baseInfo.canOperation && (
            <Button className="fork-button" onClick={handlerOnForkClick} disabled={isForkDisable()}>
              {ForkIcon}
              Fork
            </Button>
          )}
        </div>
      ) : (
        <div className="margin-5"></div>
      )}
    </div>
  );
}

export default memo(CommonNFTCover);
