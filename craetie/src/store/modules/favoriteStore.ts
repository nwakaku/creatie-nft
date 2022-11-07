import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { canisterManager } from '@/api/canisterManager';
import { Principal } from '@dfinity/principal';
import { getItemImageUrl } from '@/utils/utils';
import { ArtCollection } from '@/constants';
import { requestCanister } from '@/api/handler';

class FavoriteStore {
  isFavorite = {};
  favoriteNum = {};
  favoriteList = {};
  FavoriteType = 'favorite';

  constructor() {
    makeObservable(this, {
      isFavorite: observable,
      favoriteNum: observable,
      favoriteList: observable,
      getShowFavoriteNum: observable,
      isNFTFavorite: observable,
      getShowFavoriteList: observable,
      requestFavoriteNum: action.bound,
      requestNFTFavoriteStatus: action.bound,
      requestFavoriteListByUser: action.bound,
      changeFavoriteStatues: action.bound,
      updateChangeFavoriteStatue: action.bound,
    });
  }

  getFavoriteParam(data) {
    let { type, tokenIndex, prinId, photoLink, videoLink } = data;
    let canisterId = canisterManager.getNFTFacotryIdByType(type);
    let isArt = type.startsWith(ArtCollection);
    if (isArt) {
      let temp = type.split(':');
      type = `${temp[0]}:${temp[2]}`;
    }
    let param = {
      nftIndex: tokenIndex,
      nftType: type,
      photoLink: prinId !== 'video' ? '' : photoLink,
      videoLink: prinId !== 'video' ? '' : videoLink,
      canisterId: prinId !== 'video' ? Principal.fromText(prinId) : Principal.fromText(canisterId),
    };
    return param;
  }

  getShowFavoriteNum(type: string, index: number) {
    return this.favoriteNum[`${type}-${index}`] || 0;
  }

  isNFTFavorite(type: string, index: number) {
    return this.isFavorite[`${type}-${index}`];
  }

  getShowFavoriteList(user: string) {
    return this.favoriteList[user];
  }

  updateChangeFavoriteStatue(type: string, index: number) {
    this.isFavorite[`${type}-${index}`] = false;
  }

  requestFavoriteNum(data: any) {
    requestCanister(
      async (data: any) => {
        let param = this.getFavoriteParam(data);
        let fetch = await canisterManager.getNftFactoryByType(this.FavoriteType, false);
        let res = fetch?.getNftFavoriteNum && (await fetch.getNftFavoriteNum(param));
        runInAction(() => {
          const { type, tokenIndex } = data;
          this.favoriteNum[`${type}-${tokenIndex}`] = parseInt(res || 0);
        });
        return parseInt(res || 0);
      },
      data,
      false,
    );
  }

  async requestNFTFavoriteStatus(data) {
    requestCanister(async (data: any) => {
      let param = this.getFavoriteParam(data);
      let fetch = await canisterManager.getNftFactoryByType(this.FavoriteType, false);
      let principal = await canisterManager.getCurrentPrinId();
      let res = fetch && fetch.isFavorite && (await fetch.isFavorite(principal, param));
      runInAction(() => {
        const { type, tokenIndex } = data;
        this.isFavorite[`${type}-${tokenIndex}`] = res || 0;
      });
      return res;
    }, data);
  }

  async changeFavoriteStatues(data) {
    requestCanister(async (data) => {
      const { type, tokenIndex } = data;
      const principal = await canisterManager.getCurrentPrinId();
      const key = `${type}-${tokenIndex}`;
      let fetch = await canisterManager.getNftFactoryByType(this.FavoriteType, true);
      let func;
      if (this.isFavorite[key]) func = fetch.cancelFavorite;
      else func = fetch.setFavorite;
      let callkey = process.env.BLIND_BOX_KEY;
      let param = this.getFavoriteParam(data);
      let ret = await func(param, callkey);
      if (ret) {
        runInAction(() => {
          if (this.isFavorite[key]) {
            this.isFavorite[key] = false;
            this.favoriteNum[key] = this.favoriteNum[key] - 1;
          } else {
            this.isFavorite[key] = true;
            this.favoriteNum[key] = (this.favoriteNum[key] || 0) + 1;
          }
        });
      }
      return ret;
    }, data);
  }

  async requestFavoriteListByUser(data) {
    const func = async (data) => {
      let { prinId } = data;
      if (!prinId) return {};
      let principal = Principal.fromText(prinId);
      let fetch = await canisterManager.getNftFactoryByType(this.FavoriteType);
      let res = fetch && (await fetch.getFavorite(principal));
      let formatRes = {};
      if (res) {
        for (let item of res) {
          let type = item.nftType;
          let isArt = type.startsWith(ArtCollection);
          if (isArt) {
            let temp = type.split(':');
            type = `${temp[0]}:${item.canisterId}:${temp[1]}`;
          }
          if (!formatRes[type]) formatRes[type] = [];
          formatRes[type].push({
            tokenIndex: item.nftIndex,
            prinId: item.videoLink ? 'video' : item.canisterId,
            type,
            imgUrl: item.photoLink || getItemImageUrl(type, item.canisterId, item.nftIndex),
            detailUrl: item.videoLink || `https://${item.canisterId}.raw.ic0.app/token/${item.nftIndex}`,
            canOperation: false,
          });
        }
      }
      runInAction(() => {
        this.favoriteList[prinId] = formatRes;
      });
      return formatRes;
    };
    requestCanister(func, data);
  }
}

const favoriteStore = new FavoriteStore();

export default favoriteStore;
