import React, { memo } from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, message, Dropdown, Menu, Tooltip } from 'antd';
import { ArtCollection, CollectionType, gangNFTCreate } from '@/constants';
import { useHistory } from 'react-router-dom';
import { getUTCTime, getValueDivide8 } from '@/utils/utils';
import BigNumber from 'bignumber.js';
import { userHooks } from '@/components/hooks';
import ExcelInput from '@/components/excel-input';
import Toast from '@/components/toast';
import { requestCanister } from '@/api/handler';
import { uploadWhiteListToForkCollection } from '@/api/createHandler';
import { getLinkIcon } from '@/icons';
import { find } from 'lodash-es';

function CollectionOperationInfo(props) {
  const history = useHistory();
  const { item, circultaion, totalSupply, artConfig, stakeInfo, collectionAd } = props;
  const { authToken } = userHooks();
  const isArtCollection = item.key.startsWith(ArtCollection);
  const adInfo = find(collectionAd, (info) => {
    let key = item.key;
    if (isArtCollection) {
      key = item.key.split(':')[1];
    }
    if (info.key === key) {
      return true;
    }
  });

  const goToCreateNFT = (e) => {
    history.push(`/create/nft/${item.key}`);
  };

  const goToEditCollection = () => {
    history.push(`/create/collection/${item.key}`);
  };

  const uploadWhiteList = (uploadData) => {
    let notice = Toast.loading('invite', 0);
    let invites = [];
    for (let item of uploadData) {
      if (item[0]) invites.push(item[0]);
    }
    let data = {
      type: item.key,
      invites,
      success: () => {
        message.success('Whitelist added successfully');
      },
      notice,
    };
    requestCanister(uploadWhiteListToForkCollection, data);
  };

  const onDataChange = (data) => {
    if (data.err) {
      message.error('Error:', data.err);
      return;
    }
    if (data.ok) {
      if (!data.ok.length) {
        message.error('Excel empty');
        return;
      }
      uploadWhiteList(data.ok);
    }
  };

  const stakeMenu = (
    <Menu className="top-menu">
      <Menu.Item key={0}>{`All Staked: ${stakeInfo?.stakedNum || 0}`}</Menu.Item>
      <Menu.Item key={1}>{`Number of participants: ${stakeInfo?.participantsNum || 0}`}</Menu.Item>
      <Menu.Item key={2}>{`Prize Pool: ${getValueDivide8(stakeInfo?.prizePool || 0)} WICP`}</Menu.Item>
    </Menu>
  );

  const stakeButton =
    item.key === gangNFTCreate ? (
      <Dropdown overlay={stakeMenu} overlayClassName={'dc-drop-menu'}>
        <a href={'/#/assets/wallet/staking'} target="_self" rel="noopener noreferrer">
          <Button className="stake-btn" type="violet-gradient">
            Stake
            <ExclamationCircleOutlined style={{ color: '#C1C1C1', marginLeft: 10, fontSize: 16 }} />
          </Button>
        </a>
      </Dropdown>
    ) : (
      <></>
    );

  const isCanAddItem = () => {
    if (isArtCollection) {
      if (circultaion >= totalSupply) return false;
      if (item?.collectionType === CollectionType.CollectionPublic) return true;
      if (artConfig?.deadline && artConfig?.deadline?.length) {
        let now = new Date().getTime();
        let deadline = parseInt(new BigNumber(parseInt(artConfig.deadline[0])).dividedBy(Math.pow(10, 6)));
        if (now > deadline) {
          return false;
        }
      }
      if (authToken && authToken === item.owner?.toText()) {
        return true;
      }
    }
    return false;
  };

  const isCanAddWhiteList = () => {
    if (isArtCollection) {
      if (circultaion >= totalSupply) return false;
      if (artConfig?.deadline && artConfig?.deadline?.length) {
        let now = new Date().getTime();
        let deadline = parseInt(new BigNumber(parseInt(artConfig.deadline[0])).dividedBy(Math.pow(10, 6)));
        if (now > deadline) {
          return false;
        }
      }
      if (authToken && authToken === item.owner?.toText() && (artConfig?.whiteListType == 1 || artConfig?.whiteListType == 2)) {
        return true;
      }
    }
    return false;
  };

  const getForkTime = () => {
    if (artConfig?.deadline || artConfig?.startline) {
      let startline = parseInt(new BigNumber(parseInt(artConfig?.startline || 0)).dividedBy(Math.pow(10, 6)));
      let deadline = parseInt(new BigNumber(parseInt(artConfig?.deadline || 0)).dividedBy(Math.pow(10, 6)));
      let now = new Date().getTime();
      if (now > deadline) {
        return null;
      }
      if (deadline !== 0 || startline !== 0) {
        let start = startline ? getUTCTime(startline) : 'now';
        let end = deadline ? getUTCTime(deadline) : '';
        return `${start}~${end}`;
      }
    }
    return null;
  };

  const owner0peration = () => {
    const menu = (
      <Menu className="top-menu">
        {isCanAddItem() && (
          <Menu.Item key={0} onClick={goToCreateNFT}>
            Add item
          </Menu.Item>
        )}
        {isCanAddWhiteList() && (
          <Menu.Item key={1}>
            <ExcelInput onDataChange={onDataChange}>Add whiteList</ExcelInput>
          </Menu.Item>
        )}
      </Menu>
    );
    return isCanAddItem() || isCanAddWhiteList() ? (
      <Dropdown overlay={menu} arrow={false} overlayClassName={'menu-drop'}>
        <a className="nav-dropdown-link" style={{ color: '#A6AEB7' }} onClick={(e) => e.preventDefault()}>
          +
        </a>
      </Dropdown>
    ) : (
      <></>
    );
  };

  return (
    <>
      {artConfig && parseInt(item.key.split(':')[2]) === CollectionType.CollectionFork && (
        <div className="art-fork-info">
          <div className="fork-info">{`Fork: ${circultaion || 0}/${totalSupply || item?.totalSupply || 0}`}</div>
          {getForkTime() && <div className="fork-info">{`Fork Time: ${getForkTime()}`}</div>}
        </div>
      )}
      <div className="link-layout">
        {(isCanAddItem() || isCanAddWhiteList() || adInfo?.otherLink?.length) && (
          <div className="link">
            {owner0peration()}
            {adInfo?.otherLink.map((item, index) => {
              return (
                <Tooltip placement="top" title={item.title} key={index}>
                  <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: '#A6AEB7' }} key={index}>
                    {item.icon ? <img src={item.icon}></img> : item.title}
                  </a>
                </Tooltip>
              );
            })}
          </div>
        )}
        {item?.links && item.links.length > 0 && (
          <div className="link">
            {item?.links.map((item, index) => {
              return (
                <Tooltip placement="top" title={item.name} key={index}>
                  <a href={item.link} target="_blank" rel="noopener noreferrer" key={index}>
                    {getLinkIcon(item.name)}
                  </a>
                </Tooltip>
              );
            })}
          </div>
        )}
        {stakeButton}
      </div>
      {adInfo?.adLink && (
        <a href={adInfo?.adLink.link} target="_blank" rel="noopener noreferrer">
          <div className="create-ad-icon">
            <img src={adInfo?.adLink.icon} />
            <span>{adInfo?.adLink.title}</span>
          </div>
        </a>
      )}
    </>
  );
}

export default memo(CollectionOperationInfo);
