import { useEffect } from 'react';
import { message } from 'antd';
import favoriteStore from '@/store/modules/favoriteStore';
import Toast from '@/components/toast';
import Favorite from '@/assets/images/market/favorite.svg';
import { userHooks } from '@/components/hooks';
import { observer } from 'mobx-react';
// favorite icon
function FavoriteIcon(props) {
  // canvas index
  const tokenIndex = parseInt(props.index);
  const { type, prinId, photoLink, videoLink } = props;

  const { isAuth } = userHooks();

  useEffect(() => {
    if (isAuth && photoLink && videoLink) {
      favoriteStore.requestNFTFavoriteStatus({
        type,
        prinId,
        tokenIndex,
        photoLink,
        videoLink,
      });
    } else {
      favoriteStore.updateChangeFavoriteStatue(type, tokenIndex);
    }
  }, [isAuth, photoLink, videoLink]);

  useEffect(() => {
    if (photoLink && videoLink)
      favoriteStore.requestFavoriteNum({
        type,
        prinId,
        tokenIndex,
        photoLink,
        videoLink,
      });
    return () => {};
  }, [photoLink, videoLink]);

  const onFavoriteClick = () => {
    if (!isAuth) {
      message.error('Please sign in first');
      return;
    }
    let notice = Toast.loading('change');
    let data = {
      type,
      tokenIndex,
      prinId,
      photoLink,
      videoLink,
      fail: (error) => {
        message.error(error);
      },
      notice: notice,
    };
    favoriteStore.changeFavoriteStatues(data);
  };

  return (
    <div className="flex-5">
      <img alt="" className="favorite" src={Favorite} style={{ filter: `grayscale(${favoriteStore.isNFTFavorite(type, tokenIndex) ? 0 : 100}%)`, cursor: 'pointer' }} onClick={onFavoriteClick}></img>
      <div className="value value-ae">{favoriteStore.getShowFavoriteNum(type, tokenIndex)}</div>
    </div>
  );
}

export default observer(FavoriteIcon);
