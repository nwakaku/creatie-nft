import { NFTCoverWrapper, WalletNFTDetailWrapper, MarketNFTDetailWrapper, MultiCanvasDoneWrapper } from './style';
import React, { memo, useRef, useEffect, useState } from 'react';
import { getCanvasWidth } from '@/constants';
import PixelThumb from '@/components/pixel-thumb';
import { Button, Skeleton, Tooltip } from 'antd';
import WICPPrice from '@/components/wicp-price';
import { getIndexPrefix, is1155Canvas } from '@/utils/utils';
import { userHooks } from '@/components/hooks';
import OperationNft from '@/components/operation-nft';
import { ListingUpdate, OwnedNFTUpdate, ShowAuthDrawer } from '@/message';
import Dialog from '@/components/dialog';
import BuyContent from '@/pages/marketPlace/nft-detail/nft-buy';
import PubSub from 'pubsub-js';

function CanvasNFT(props) {
  const { canvasInfo, type, canvasPrinId, listingInfo, thumbType, m1155Info, m1155List } = props;

  const { isAuth, authToken } = userHooks();
  const isSelf = authToken === props.user;

  const pixParent = useRef();
  const [scale, setScale] = useState(1);

  const handlerOnButtonClick = (e, type) => {
    e.stopPropagation();
    props.onButtonClick && props.onButtonClick(type);
  };

  const handlerOnTransferClick = (e) => {
    e.stopPropagation();
    props.onButton1Click && props.onButton1Click();
  };

  const handlerOnItemClick = () => {
    props.onItemClick && props.onItemClick();
  };

  const handlerBuyClick = (e) => {
    e.stopPropagation();
    if (!isAuth) {
      PubSub.publish(ShowAuthDrawer, {});
      return;
    }
    let temp = listingInfo;
    if (temp?.seller?.toText() === authToken) {
      message.error('Not allow buy self');
      return;
    }
    Dialog.createAndShowDialog(
      <BuyContent
        listingInfo={listingInfo}
        tokenIndex={canvasInfo.tokenIndex}
        prinId={canvasPrinId}
        type={type}
        onBuyUpdate={() => {
          PubSub.publish(OwnedNFTUpdate, { type });
          PubSub.publish(ListingUpdate, { type, tokenIndex: canvasInfo.tokenIndex });
        }}
      />,
      0,
    );
  };
  useEffect(() => {
    setScale(pixParent.current.clientWidth / getCanvasWidth(type));
  }, [props.windowWidth]);

  const is1155 = is1155Canvas(type);

  const propsData = {
    canOperation: isSelf,
    listingInfo: listingInfo,
    handlerOnButtonClick,
    handlerOnTransferClick,
  };

  return (
    <NFTCoverWrapper width={props.colCount > 1 ? '50%' : '100%'} onClick={handlerOnItemClick}>
      <div className="pixel-content">
        <div className="pixel-wrapper" ref={pixParent}>
          <PixelThumb scale={scale} prinId={canvasPrinId} type={props.type} canvasInfo={canvasInfo} />
        </div>
      </div>

      {canvasInfo.tokenIndex === undefined && (
        <WalletNFTDetailWrapper>
          <Skeleton.Input style={{ width: '100%' }} active={true} size={'small'} />
          <Skeleton.Input style={{ width: '100%', marginTop: '5px' }} active={true} size={'small'} />
        </WalletNFTDetailWrapper>
      )}

      {thumbType === 'wallet-nft' && canvasInfo.tokenIndex !== undefined && (
        <WalletNFTDetailWrapper>
          <div className="info-content margin-10">
            <div className="nft-index">{`${getIndexPrefix(type, canvasInfo.tokenIndex)}`}</div>
          </div>

          <div className="info-content margin-15">
            {isSelf ? <OperationNft {...propsData} /> : <div></div>}
            {is1155 && isSelf && (
              <div>
                <div className="right-info">{`You own: ${(m1155Info.available ? parseInt(m1155Info.available) : 0) + (m1155Info.freezen ? parseInt(m1155Info.freezen) : 0)}`}</div>
                <div className="right-info">{`Pending: ${m1155Info.freezen || 0}`}</div>
              </div>
            )}
            {listingInfo && listingInfo.seller ? (
              <WICPPrice iconSize={20} value={listingInfo?.price} valueStyle={'value-20'} ellipsis={18} />
            ) : (
              !is1155 &&
              isSelf && (
                <Button className="sell-button" onClick={(e) => handlerOnButtonClick(e, 'change')}>
                  Sell
                </Button>
              )
            )}
          </div>
          {!is1155 && !isSelf && listingInfo && listingInfo.seller && (
            <div className="operation">
              <Button className="buy-button" onClick={handlerBuyClick}>
                Buy
              </Button>
            </div>
          )}
        </WalletNFTDetailWrapper>
      )}

      {thumbType === 'market-nft' && canvasInfo.tokenIndex !== undefined && (
        <MarketNFTDetailWrapper>
          <div className="detail margin-10">
            <div className="nft-index">{`${getIndexPrefix(type, canvasInfo.tokenIndex)}`}</div>
          </div>

          {!is1155 && (
            <div className="canvas-price margin-15">
              <WICPPrice iconSize={20} value={listingInfo.price} valueStyle={'value-20'} />
            </div>
          )}
          {is1155 && (
            <div className="canvas-price margin-15">
              <WICPPrice iconSize={20} value={m1155List} valueStyle={'value-20'} />
            </div>
          )}
        </MarketNFTDetailWrapper>
      )}

      {thumbType === 'drew' && canvasInfo.tokenIndex !== undefined && (
        <MultiCanvasDoneWrapper>
          <div className="canvas-index margin-15">
            <span>{`${getIndexPrefix(type, canvasInfo.tokenIndex)}`}</span>
          </div>

          <div className="invested margin-15">Total invested</div>
          <div className="canvas-edit">
            <WICPPrice iconSize={20} value={canvasInfo.totalWorth} valueStyle={'value-20'} />
          </div>
        </MultiCanvasDoneWrapper>
      )}
    </NFTCoverWrapper>
  );
}

export default memo(CanvasNFT);
