import { Dropdown, Menu, message } from 'antd';
import { ArtCollection, CollectionType } from '@/constants';
import Twitter from '@/assets/images/wallet/twitter.svg';
import Logo from '@/assets/images/logo.svg';
import Share from '@/assets/images/icon/share.svg';
import copy from 'copy-to-clipboard';

import './style.less';

const ShareIcon = (props) => {
  const { type, tokenIndex, prinId } = props;
  const isArtCollection = type.startsWith(ArtCollection);
  const isFork = isArtCollection && parseInt(type.split(':')[2]) === CollectionType.CollectionFork;

  const shareUrl = `https://${window.location.host}/#/third/${type}/${tokenIndex}/${prinId}`;
  const shareTitle = isFork ? 'Visualize this Fork on Dcreate' : 'Visualize this NFT on Dcreate';
  const shareTwiter = `https://twitter.com/intent/tweet?text=${shareTitle}&url=${encodeURIComponent(shareUrl)}`;

  const copyShareLink = () => {
    copy(shareUrl);
    message.success('Link copied!');
  };
  const shareContent = () => {
    const menu = (
      <Menu className="top-menu">
        <Menu.Item key={0} onClick={copyShareLink}>
          <img style={{ width: '20px', height: '22px', marginRight: '10px' }} src={Logo} />
          Copy Link
        </Menu.Item>
        <Menu.Item key={1}>
          <a href={shareTwiter} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center' }}>
            <img style={{ width: '20px', height: '16px', marginRight: '10px' }} src={Twitter} />
            Twitter
          </a>
        </Menu.Item>
      </Menu>
    );
    return (
      <Dropdown overlay={menu} arrow={false} overlayClassName={'menu-drop'} placement={'bottomRight'}>
        <a className="nav-dropdown-link" style={{ color: '#A6AEB7' }} onClick={(e) => e.preventDefault()}>
          <img src={Share} />
        </a>
      </Dropdown>
    );
  };

  return shareContent();
};

export default ShareIcon;
