import { useEffect } from 'react';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { getBlindBoxStatus } from '@/pages/home/store/actions';
import { AloneCreate, CrowdCreate, ThemeCreate, M1155Create, Theme1155Create } from '@/constants';
import NFTList from '@/pages/wallet/cpns/nft-list';
import { find } from 'lodash-es';
import { userHooks } from '@/components/hooks';
import favoriteStore from '@/store/modules/favoriteStore';
import { observer } from 'mobx-react';

function Favorites(props) {
  const dispatch = useDispatch();
  const typeList = [CrowdCreate, M1155Create, AloneCreate, ThemeCreate, Theme1155Create];
  const params = props.match.params;
  const account = params.account;
  const { authToken, collectionsConfig, allCreateCollection } = userHooks();
  const { user } = useSelector((state) => {
    let user = account === 'wallet' ? authToken : params.user;
    return {
      user,
    };
  }, shallowEqual);

  useEffect(() => {
    if (user && collectionsConfig) {
      favoriteStore.requestFavoriteListByUser({ prinId: user });
      for (let type of typeList) {
        let item = find(collectionsConfig, { key: type });
        if (item?.nftType === 'blindbox') {
          dispatch(getBlindBoxStatus(item));
        }
      }
    }
  }, [user, collectionsConfig]);

  const getNFTListData = () => {
    let data = {};
    let nfts = favoriteStore.getShowFavoriteList(user);
    for (let key of typeList) {
      data[key] = (nfts && nfts[key]) || [];
    }
    for (let item of collectionsConfig) {
      data[item.key] = (nfts && nfts[item.key]) || [];
    }
    for (let item of allCreateCollection) {
      data[item.key] = (nfts && nfts[item.key]) || [];
    }

    return data;
  };

  const getLoadingData = () => {
    let data = {};
    let nfts = favoriteStore.getShowFavoriteList(user);
    if (nfts) {
      for (let key of typeList) {
        data[key] = true;
      }
      for (let item of collectionsConfig) {
        data[item.key] = true;
      }
      for (let item of allCreateCollection) {
        data[item.key] = true;
      }
    }
    return data;
  };

  return <NFTList nfts={getNFTListData()} thumbType={'drew'} nftType={'favorite'} user={user} loading={getLoadingData()} />;
}
export default observer(Favorites);
