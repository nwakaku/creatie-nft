import React, { memo, useEffect, useRef, useState } from 'react';
import './style.less';
import { HashRouter, useHistory } from 'react-router-dom';
import ListingsItems from '../../cpns/listings-item';
import { Menu } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import NFTActivity from '../../cpns/nft-activity';
import { Activity, Items } from '@/icons';
import { ArtCollection, gangNFTCreate } from '@/constants';
import { getCollectionInfo, getStakeInfo, getCreateCollectionSettings, getCollectionDetailInfo, getAllCreateCollection, listHomeData } from '@/pages/home/store/actions';
import { useScrollToTop } from '@/components/hooks/useScrollToHooks';
import { find } from 'lodash-es';
import CollectionListingInfo from '../../cpns/collection-info';
import ArtCollectionItems from '../../cpns/art-collection-item';
import { userHooks } from '@/components/hooks';
import { CREATE_COLLECTION_AD } from '@/pages/home/store/constants';

function CollectionItemListings(props) {
  const params = props.match.params;
  const key = params.type;
  const tab = params.tab;
  const owner = params.owner;
  const isArtCollection = key.startsWith(ArtCollection);
  const history = useHistory();
  const dispatch = useDispatch();
  const curListings = useRef();
  const nftMenuConfig = [
    {
      title: 'Items',
      key: 'items',
      icon: Items,
    },
    {
      title: 'Activity',
      key: 'activity',
      icon: Activity,
    },
  ];

  const [selectTab, setSelectTab] = useState(tab || nftMenuConfig[0].key);

  const handlerItemSelect = (curTabKey) => {
    setSelectTab(curTabKey);
    history.replace(`/collection/${key}/${curTabKey}`);
  };
  const { authToken, allCreateCollection, collectionsConfig } = userHooks();
  const { itemConfig } = useSelector((state) => {
    let itemConfig;
    if (isArtCollection) {
      itemConfig = find(allCreateCollection, { key });
      if (itemConfig) {
        let createCollection = state.allcavans.getIn([key]);
        for (let key_1 in createCollection) {
          itemConfig[key_1] = createCollection[key_1];
        }
      }
    } else {
      if (collectionsConfig) itemConfig = find(collectionsConfig, { key });
    }
    return {
      itemConfig,
    };
  }, shallowEqual);

  useScrollToTop();
  useEffect(() => {
    if (isArtCollection) {
      dispatch(getAllCreateCollection());
      dispatch(getCollectionDetailInfo(key));
    }
    dispatch(listHomeData(CREATE_COLLECTION_AD));
  }, []);

  useEffect(() => {
    if (isArtCollection) {
      dispatch(getCreateCollectionSettings(key));
    }
  }, [authToken]);

  useEffect(() => {
    if ((itemConfig && selectTab !== 'items') || (selectTab === 'items' && isArtCollection && owner && itemConfig)) dispatch(getCollectionInfo(itemConfig?.pricinpalId, key));
    key === gangNFTCreate && dispatch(getStakeInfo(key));
  }, [dispatch, itemConfig]);

  const nftMenu = (
    <Menu mode={'horizontal'} style={{ backgroundColor: 'transparent', justifyContent: 'center' }} defaultOpenKeys={[selectTab]} defaultSelectedKeys={selectTab} selectedKeys={[selectTab]}>
      {nftMenuConfig.map((item) => {
        return (
          <Menu.Item key={item.key} icon={item.icon} onClick={(item) => handlerItemSelect(item.key)}>
            {item.title}
          </Menu.Item>
        );
      })}
    </Menu>
  );

  const getContent = () => {
    if (selectTab === 'items') {
      if (isArtCollection && owner) return <ArtCollectionItems type={key} owner={owner} itemConfig={itemConfig} />;
      return <ListingsItems nftTypes={[key]} cRef={curListings} owner={owner} />;
    } else if (selectTab === 'activity')
      return (
        <div className="transaction">
          <NFTActivity type={key} />
        </div>
      );
  };

  return (
    <HashRouter>
      <div className="collection-detail-wrapper">
        {itemConfig && <CollectionListingInfo item={itemConfig} />}

        <div className="content-wrapper">
          {nftMenu}
          {getContent()}
        </div>
      </div>
    </HashRouter>
  );
}

export default memo(CollectionItemListings);
