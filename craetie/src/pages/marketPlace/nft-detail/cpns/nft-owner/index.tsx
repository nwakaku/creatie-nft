import React from 'react';
import { Avatar } from 'antd';
import { ProtocolUrl } from '@/constants';
import './style.less';
import DefaultAvatar from '@/assets/images/wallet/avator.png';
import { shallowEqual, useSelector } from 'react-redux';

const NFTOwner = (props) => {
  const { itemConfig, type, ownerId, creatorId } = props;
  const { ownerProfile, ownerAvatar, creatorProfile, creatorAvatar } = useSelector((state) => {
    return {
      ownerProfile: state['auth'].getIn([`profile-${ownerId}`]),
      ownerAvatar: state['auth'].getIn([`avatar-${ownerId}`]) || DefaultAvatar,
      creatorProfile: creatorId ? state['auth'].getIn([`profile-${creatorId}`]) || [] : null,
      creatorAvatar: creatorId ? state['auth'].getIn([`avatar-${creatorId}`]) || DefaultAvatar : null,
    };
  }, shallowEqual);

  const getOwnerText = () => {
    let owner = ownerProfile?.textInfo?.name || ownerId;
    return owner.length > 40 ? owner.slice(0, 15) + '...' : owner;
  };

  const getCreatorText = () => {
    let owner = creatorProfile?.textInfo?.name || creatorId;
    return owner.length > 40 ? owner.slice(0, 15) + '...' : owner;
  };

  return (
    <div className={`nft-owner-wrapper ${props.className}`}>
      {itemConfig && (
        <div className="owner-info">
          <div className="tip tip-6d727">Collection</div>
          <a className="info" href={`/#/collection/${type}`}>
            <span className="tip tip-voilet">{itemConfig?.title}</span>
            {itemConfig && <Avatar src={itemConfig?.avatar || `${ProtocolUrl}/resource/${itemConfig?.key}/avatar.png`} className="picture margin-10" />}
          </a>
        </div>
      )}
      {creatorId && (
        <div className="owner-info">
          <div className="tip tip-6d727">Create by</div>
          <a className="info" href={`/#/assets/account/myarts/${creatorId}`}>
            <span className="tip tip-voilet">{getCreatorText()}</span>
            <Avatar src={creatorAvatar} className="picture margin-10" />
          </a>
        </div>
      )}
      {ownerId && (
        <div className="owner-info">
          <div className="tip tip-6d727">Owned by</div>
          <a className="info" href={`/#/assets/account/myarts/${ownerId}`}>
            <span className="tip tip-voilet">{getOwnerText()}</span>
            <Avatar src={ownerAvatar} className="picture margin-10" />
          </a>
        </div>
      )}
    </div>
  );
};

export default NFTOwner;
