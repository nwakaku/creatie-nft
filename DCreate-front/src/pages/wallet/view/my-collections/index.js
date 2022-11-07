import React, { memo, useEffect, useState } from 'react';
import { Spin, Empty } from 'antd';
import { shallowEqual, useSelector } from 'react-redux';
import NftTypeCard from '@/pages/marketPlace/cpns/nfts-type-card';
import GridList from '@/components/grid-list';
import AddCollections from './add-collection';
import EmptyImage from '@/assets/images/wallet/empty.png';
import './style.less';
import { userHooks } from '@/components/hooks';

export default memo(function MyCollections(props) {
  const user = props.user;
  const { authToken } = userHooks();
  const { userCollections } = useSelector((state) => {
    return {
      userCollections: state.allcavans.getIn([`createCollection-${user}`]) || null,
    };
  }, shallowEqual);

  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState();
  const isSelf = user === authToken;
  useEffect(() => {
    if (userCollections !== null) {
      let collections = [...userCollections];
      if (isSelf) collections.push({ type: 'addCollection' });
      setCollections(collections);
      setLoading(false);
    }
  }, [userCollections]);

  return (
    <div className="collections-wrapper">
      <div className="collection-list">
        {loading ? (
          <Spin style={{ marginTop: '50px' }} />
        ) : collections?.length === 0 ? (
          <Empty image={<img alt="" src={EmptyImage} />} imageStyle={{ marginTop: '50px', height: 100 }} description={<span style={{ color: '#4338CA' }}>{'No created...'}</span>}></Empty>
        ) : (
          <GridList
            content={
              collections &&
              collections.map((item, index) => {
                if (item.type === 'addCollection') return <AddCollections key={index} />;
                else return <NftTypeCard key={index} item={item} owner={user} />;
              })
            }
          ></GridList>
        )}
      </div>
    </div>
  );
});
