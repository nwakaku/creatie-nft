import React from 'react';
import { Image, Skeleton, Tooltip } from 'antd';
import { TurtlesCreate, ZombieNFTCreate, BlindBoxStatus, ArtCollection, CollectionType } from '@/constants';
import VideoPlayer from '@/components/video-player';
import FavoriteIcon from '../../../../cpns/favorite-icon';
import { Warning, Twitter } from '@/icons';
import { isVideo, getIPFSShowLink } from '@/utils/utils';
import './style.less';

const NFTContent = (props) => {
  const { itemConfig, type, detailUrl, tokenIndex, prinId, imgUrl } = props;
  const isArtCollection = type.startsWith(ArtCollection);

  const getNFTContent = () => {
    let content;
    if (detailUrl) {
      if (isVideo(itemConfig, detailUrl))
        content = (
          <div className="video-wrapper">
            <VideoPlayer src={getIPFSShowLink(detailUrl)} controls={true} />
          </div>
        );
      else if (type === TurtlesCreate) content = <embed src={getIPFSShowLink(detailUrl)} />;
      else if (detailUrl?.endsWith('.html')) content = <embed src={getIPFSShowLink(detailUrl)} width="100%" height="100%" />;
      else if (type === ZombieNFTCreate)
        content = (
          <div className="zombie-image">
            <img src={getIPFSShowLink(detailUrl)} className="blur-bg" />
            <Image src={getIPFSShowLink(detailUrl)} className="up-image" placeholder={<Skeleton.Image />} />
          </div>
        );
      else if (type !== TurtlesCreate) content = <Image src={getIPFSShowLink(detailUrl)} placeholder={<Skeleton.Image />} />;
    }
    return content || <></>;
  };

  return (
    <div className="nft-image-content-wrapper">
      <div className="nft-content">{getNFTContent()}</div>
      <div className="favorite-info">
        {itemConfig && <FavoriteIcon index={tokenIndex} prinId={prinId} type={type} photoLink={imgUrl} videoLink={detailUrl} />}
        {!isArtCollection && type !== ZombieNFTCreate && (
          <Tooltip
            color={'#000000dd'}
            placement="bottomLeft"
            overlayInnerStyle={{ width: '350px' }}
            title={
              'Disclaimer: NFT trading has a high level of market risk. Please trade carefully. Please note that Dcreate is not responsible for your trading losses.The Dcreate Marketplace API and integration are open source, and any Dfinity project can use them. Dcreate thoroughly evaluates all projects that request for a listing; however, Dcreate cannot be held liable if a third-party project ceases to exist, disappears with assets, or pulls the rug out from under its community. Always do your research before investing any money. Thank you for your cooperation.'
            }
          >
            {Warning}
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default NFTContent;
