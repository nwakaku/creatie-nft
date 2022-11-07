import React, { memo } from 'react';
import PubSub from 'pubsub-js';
import { Button } from 'antd';
import Close from '@/assets/images/white_close.svg';
import { CloseDialog } from '@/message';
import './style.less';
import SuccessTip from '@/assets/images/mint/success.svg';
import { find } from 'lodash-es';
import { shallowEqual, useSelector } from 'react-redux';
import { CREATE_COLLECTION_AD } from '@/pages/home/store/constants';
import { ArtCollection } from '@/constants';
import { createHashHistory } from 'history';

export default memo(function ShareNFTContennt(props) {
  const history = createHashHistory();
  const { type, index } = props;
  const { collectionAd } = useSelector((state) => {
    let collectionAd = state.allcavans.getIn([CREATE_COLLECTION_AD]);
    return {
      collectionAd,
    };
  }, shallowEqual);

  const isArtCollection = type.startsWith(ArtCollection);
  const adInfo = find(collectionAd, (info) => {
    let key = type;
    if (isArtCollection) {
      key = type.split(':')[1];
    }
    if (info.key === key) {
      return true;
    }
  });
  const shareUrl = `https://${window.location.host}/%23/third/${encodeURIComponent(type)}/${index}/video`;
  const shareTitle = 'Come on';
  const shareTwiter = `https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`;

  return (
    <div className="share-nft-wrapper">
      <div className="content">
        <div className="close">
          <a href={'#/assets/wallet/createItems'}>
            <img
              src={Close}
              onClick={(e) => {
                PubSub.publish(CloseDialog, {});
              }}
            ></img>
          </a>
        </div>
        <img alt="" className="success-tip margin-10" src={SuccessTip} />
        <div className="tip tip-000 margin-20">{`You can share your achievements ${adInfo?.otherLink?.length > 0 ? 'or join the club' : ''}`}</div>
        <div className="modal-button-layout margin-40">
          <a href={shareTwiter} target="_blank" rel="noopener noreferrer" key={0}>
            <Button className="dc-cancel-btn" onClick={() => history.push('/assets/wallet/createItems')}>
              Share on Twitter
            </Button>
          </a>
          {adInfo?.otherLink?.length > 0 && (
            <a href={adInfo?.otherLink[0]?.link} target="_blank" rel="noopener noreferrer" key={1}>
              <Button className="dc-confirm-btn" onClick={() => history.push('/assets/wallet/createItems')}>
                Join Club
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
});
