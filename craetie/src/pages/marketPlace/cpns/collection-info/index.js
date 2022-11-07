import React, { memo, useEffect, useState } from 'react';
import './style.less';
import { DoubleRightOutlined, InfoCircleOutlined } from '@ant-design/icons';
import WICPPrice from '@/components/wicp-price';
import { Skeleton, Tooltip } from 'antd';
import { ZombieNFTCreate, ProtocolUrl } from '@/constants';
import { useHistory } from 'react-router-dom';
import CollectionOperationInfo from '../collection-operation-info';
import { shallowEqual, useSelector } from 'react-redux';
import { CREATE_COLLECTION_AD } from '@/pages/home/store/constants';

function CollectionListingInfo(props) {
  const history = useHistory();
  const { item } = props;
  const { volume, listing, owners, circultaion, totalSupply, stakeInfo, artConfig, collectionAd } = useSelector((state) => {
    let key = item.key;
    let key1 = `collectionInfo-${key}-volume`;
    let key2 = `collectionInfo-${key}-listing`;
    let key3 = `collectionInfo-${key}-owners`;
    let key4 = `collectionInfo-${key}-circulation`;
    let key5 = `collectionInfo-${key}-supply`;
    let key6 = `stake-${key}`;
    let volume = state.allcavans && state.allcavans.getIn([key1]);
    let listing = (state.allcavans && state.allcavans.getIn([key2])) || null;
    let owners = state.allcavans && state.allcavans.getIn([key3]);
    let circultaion = state.allcavans && state.allcavans.getIn([key4]);
    let totalSupply = state.allcavans && state.allcavans.getIn([key5]);

    let stakeInfo = state.allcavans && state.allcavans.getIn([key6]);
    let artConfig = state.allcavans.getIn([`artCollectionConfig-${key}`]);
    let collectionAd = state.allcavans.getIn([CREATE_COLLECTION_AD]);
    return {
      volume,
      listing,
      owners,
      circultaion,
      totalSupply,
      stakeInfo,
      artConfig,
      collectionAd,
    };
  }, shallowEqual);

  const [collapseBlurb, setCollapseBlurb] = useState(false);
  const [isBlurbOpen, setIsBlurbOpen] = useState(false);
  const [blurbElement, setBlurbElement] = useState(false);

  useEffect(() => {
    if (blurbElement.clientHeight > 110) {
      setCollapseBlurb(true);
    }
  }, [blurbElement]);

  const operationInfo = { item, circultaion, totalSupply: totalSupply || item?.totalSupply, artConfig, stakeInfo, collectionAd };

  return (
    <div className="colletion-info-wrapper">
      <div className="banner-content">
        <img alt="" className="banner-wrapper" src={item.banner || `${ProtocolUrl}/resource/${item.key}/banner.png`}></img>
        <div className="avator">
          <img alt="" src={item.avatar || `${ProtocolUrl}/resource/${item.key}/avatar.png`} />
        </div>
        <CollectionOperationInfo {...operationInfo} />
      </div>
      <div className="nft-blurb">
        <h2>{item?.title}</h2>
        <div
          ref={(e) => {
            setBlurbElement(e);
          }}
          style={{
            ...(collapseBlurb && !isBlurbOpen
              ? {
                  maxHeight: 110,
                  wordBreak: 'break-word',
                  WebkitMask: 'linear-gradient(rgb(255, 255, 255) 45%, transparent)',
                }
              : {}),
            overflow: 'hidden',
            fontSize: '1.2em',
          }}
          dangerouslySetInnerHTML={{ __html: item?.blurb }}
        ></div>
        {collapseBlurb ? <DoubleRightOutlined rotate={isBlurbOpen ? 270 : 90} onClick={() => setIsBlurbOpen(!isBlurbOpen)} /> : ''}
      </div>
      <div className="listing-info">
        {volume === undefined || owners === undefined ? (
          <div className="vertical-center">
            <Skeleton.Button active={true} size="small" />
          </div>
        ) : (
          <div className="vertical-center flex-5">
            <div className="value value-666">Volume</div>
            <WICPPrice iconSize={20} value={volume || 0} valueStyle={'value-20'} fixed={2} unit={1000} />
          </div>
        )}
        {volume === undefined || owners === undefined ? (
          <div className="vertical-center">
            <Skeleton.Button active={true} size="small" />
          </div>
        ) : (
          <div className="vertical-center flex-5">
            <div className="value value-666">Listings</div>
            <div className="value-20">{listing ? listing[0] : 0}</div>
          </div>
        )}
        {volume === undefined || owners === undefined ? (
          <div className="vertical-center">
            <Skeleton.Button active={true} size="small" />
          </div>
        ) : (
          <div className="vertical-center flex-5">
            <div className="value value-666">Floor price</div>
            <WICPPrice iconSize={20} value={listing ? listing[1] : 0} valueStyle={'value-20'} fixed={2} />
          </div>
        )}
        {volume === undefined || owners === undefined ? (
          <div className="vertical-center">
            <Skeleton.Button active={true} size="small" />
          </div>
        ) : (
          <div className="vertical-center flex-5">
            <div className="value value-666 flex-5">
              Owners
              {item.key === ZombieNFTCreate && (
                <Tooltip placement="top" title={'Not include staked'}>
                  <InfoCircleOutlined />
                </Tooltip>
              )}
            </div>
            <div className="value-20">{`${owners}`}</div>
          </div>
        )}
        {volume === undefined || owners === undefined ? (
          <div className="vertical-center">
            <Skeleton.Button active={true} size="small" />
          </div>
        ) : (
          <div className="vertical-center flex-5">
            <div className="value value-666">Total Supply</div>
            <div className="value-20">{`${totalSupply || item?.totalSupply || 0}`}</div>
          </div>
        )}
        {volume === undefined || owners === undefined ? (
          <div className="vertical-center">
            <Skeleton.Button active={true} size="small" />
          </div>
        ) : (
          <div className="vertical-center flex-5">
            <div className="value value-666">In Circulation</div>
            <div className="value-20">{`${circultaion || 0}`}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(CollectionListingInfo);
