import React, { memo, useState, useEffect, useRef } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { requestCanister, promiseFuncAllType } from '@/api/handler';
import { getAllCreateNFTByUser } from '@/api/createHandler';
import { getCreateCollectionSettings } from '@/pages/home/store/actions';
import { OwnedNFTUpdate } from '@/message';
import PubSub from 'pubsub-js';
import MyItemsList from './items-list';
import { filter } from 'lodash-es';
import { userHooks } from '@/components/hooks';
export default memo(function MyItems(props) {
  let mount = true;
  const dispatch = useDispatch();
  const user = props.user;
  const { authToken, allCreateCollection } = userHooks();
  const isSelf = user === authToken;
  const [loading, setLoading] = useState(true);
  const [myItems, setMyItems] = useState([]);
  const myItemsRef = useRef();
  myItemsRef.current = myItems;

  const requestData = (type) => {
    requestCanister(
      getCreateNFTByType,
      {
        prinId: user,
        type,
        success: (res) => {
          if (mount) {
            console.log('type, res', type, res);
            let oldData = filter(myItemsRef.current, (item) => {
              if (item.type !== type) return true;
            });
            let items = [...oldData, ...res];
            setMyItems(items);
            setLoading(false);
          }
        },
      },
      false,
    );
  };

  const nftUpdateFunc = (topic, info) => {
    if (info) requestData(info.type);
  };

  useEffect(() => {
    if (user) {
      if (allCreateCollection) {
        let allTypes = [];
        for (let item of allCreateCollection) {
          allTypes.push(item.key);
          dispatch(getCreateCollectionSettings(item.key));
        }
        promiseFuncAllType(getAllCreateNFTByUser, allTypes, {
          prinId: user,
          success: (res) => {
            if (mount) {
              let items = [];
              for (let it of res) {
                items = [...items, ...it];
              }
              setMyItems(items);
              setLoading(false);
            }
          },
        });
      }
    }
  }, [user, allCreateCollection]);

  useEffect(() => {
    const nftUpdate = PubSub.subscribe(OwnedNFTUpdate, nftUpdateFunc);
    return () => {
      mount = false;
      PubSub.unsubscribe(nftUpdate);
    };
  }, []);

  return (
    <div style={{ padding: '1% 1% 0' }}>
      <MyItemsList myItems={myItems} collectionConfig={allCreateCollection} loading={loading} isSelf={isSelf} user={user} />
    </div>
  );
});
