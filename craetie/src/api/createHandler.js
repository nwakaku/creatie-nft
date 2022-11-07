import { canisterManager } from './canisterManager';
import { ArtCreate, ArtCollection, CollectionType } from '@/constants';
import { lessBalanceApproveWICPNat } from './handler';
import { Principal } from '@dfinity/principal';
import { getAllUserName } from './userHandler';
import ErrorMessage from '@/assets/scripts/errorCode';
import { Web3Storage, File } from 'web3.storage/dist/bundle.esm.min.js';

const nftStorageKey = process.env.NFT_STORAGE_API_KEY;
const storage = new Web3Storage({ token: nftStorageKey });

export const createCollection = async (data) => {
  let _pid = canisterManager.getNFTFacotryIdByType(ArtCreate);
  await lessBalanceApproveWICPNat(_pid);
  let fetch = await canisterManager.getNftFactoryByType(ArtCreate, true);
  let forkable = data.forkable;
  let res = forkable ? await fetch?.createNewForkCollection(data.param) : await fetch?.createNewPriCollection(data.param);
  return res;
};

export const createNewNFT = async (data) => {
  let { success, fail, notice } = data;
  let key = data.key;
  let temp = key.split(':');
  let prinId = temp[1];
  await lessBalanceApproveWICPNat(prinId);
  let fetch = await canisterManager.getNftFactoryByType(key, true);

  let { orignData, thumbnailData, mutableData, nftType, thumbType, desc, name, attrArr, earnings, royaltyFeeTo, parentToken } = data.param;
  let type = nftType.split('/')[1];
  let nftThumbType = thumbnailData && thumbType.split('/')[1];
  let uploadedFile = [];

  uploadedFile.push(new File([orignData], `orign.${type}`));
  thumbnailData && uploadedFile.push(new File([thumbnailData], `thumb.${nftThumbType}`));
  mutableData && uploadedFile.push(new File([mutableData], 'mutable.png'));
  const localCid = await storage.put(uploadedFile, {
    onRootCidReady: (localCid) => {
      console.log('localCid', localCid);
    },
    onStoredChunk: (bytes) => console.log(`> 🛰 sent ${bytes.toLocaleString()} bytes to web3.storage`),
  });
  let paramData = {
    desc,
    name,
    attrArr,
    earnings,
    royaltyFeeTo,
    parentToken,
  };
  paramData.photoLink = thumbnailData ? [`https://${localCid}.ipfs.dweb.link/thumb.${nftThumbType}`] : [`https://${localCid}.ipfs.dweb.link/orign.${type}`];
  paramData.videoLink = [`https://${localCid}.ipfs.dweb.link/orign.${type}`];
  paramData.mutablePhotoLink = mutableData ? [`https://${localCid}.ipfs.dweb.link/mutable.png`] : [];
  paramData.passwd = process.env.BLIND_BOX_KEY;
  if (parseInt(temp[2]) === CollectionType.CollectionFork) {
    paramData.bFork = data.param.bFork;
  }
  console.log('temp[2]', temp[2], paramData);
  let res = await fetch?.uploadIPFSItem(paramData);
  notice && notice();
  if (res.err) {
    console.error('response error:', res.err);
    for (let key in res.err) {
      fail && fail(ErrorMessage[key], key);
    }
  } else {
    success && success(res);
  }
  return { ok: localCid };
};

export const getCreateCollectionInfo = async ({ type }) => {
  let fetch = await canisterManager.getNftFactoryByType(type, false);
  let item = await fetch.getCollectionInfo();
  if (item) {
    let tmp = {};
    tmp.commission = 1;
    tmp.links = [];
    if (item.twitter[0]) tmp.links.push({ link: item.twitter[0], name: 'Twitter' });
    if (item.discord[0]) tmp.links.push({ link: item.discord[0], name: 'Discord' });
    if (item.webLink[0]) tmp.links.push({ link: item.webLink[0], name: 'Website' });
    if (item.medium[0]) tmp.links.push({ link: item.medium[0], name: 'Medium' });
    return tmp;
  }
  return {};
};

export const getMyCollection = async ({ prinId }) => {
  if (!prinId) return [];
  let fetch = await canisterManager.getNftFactoryByType(ArtCreate, false);
  let res = await fetch?.getCollInfoByUser(Principal.fromText(prinId));
  if (res) {
    let formatRes = [];
    for (let item of res) {
      let tmp = {
        key: `${ArtCollection}${item.cid}:${item.collectionType}`,
        pricinpalId: item.cid.toText(),
        title: item.name,
        brief: item.desc,
        blurb: `<p>${item.desc}</p>`,
        cid: item.cid,
        owner: item.owner,
        category: item.category,
        totalSupply: item.totalSupply,
        collectionType: parseInt(item.collectionType),
        avatar: `https://${item.cid}.raw.ic0.app/token/logo`,
        thumb: `https://${item.cid}.raw.ic0.app/token/featured`,
        banner: `https://${item.cid}.raw.ic0.app/token/banner`,
      };
      formatRes.push(tmp);
    }
    return formatRes;
  }

  return [];
};

export async function getPubCollection() {
  let fetch = await canisterManager.getNftFactoryByType(ArtCreate, false);
  let res = await fetch?.getPublicCollInfo();
  if (res) {
    let formatRes = [];
    for (let item of res) {
      let tmp = {
        key: `${ArtCollection}${item.cid}:${item.collectionType}`,
        pricinpalId: item.cid.toText(),
        title: item.name,
        brief: item.desc,
        blurb: `<p>${item.desc}</p>`,
        cid: item.cid,
        owner: item.owner,
        category: item.category,
        totalSupply: item.totalSupply,
        collectionType: parseInt(item.collectionType),
        avatar: `https://${item.cid}.raw.ic0.app/token/logo`,
        thumb: `https://${item.cid}.raw.ic0.app/token/featured`,
        banner: `https://${item.cid}.raw.ic0.app/token/banner`,
        pub: true,
      };
      formatRes.push(tmp);
    }
    return formatRes;
  }
  return [];
}

export async function getCreateNFTByType(data) {
  let { type, prinId } = data;
  let current = await canisterManager.getCurrentPrinId();
  let principal = prinId ? Principal.fromText(prinId) : await canisterManager.getCurrentPrinId();
  let canOperation = prinId === current.toText();
  let fetch = await canisterManager.getNftFactoryByType(type, false);
  let res = fetch && (await fetch.getAllNFT(principal));
  let collectionType = parseInt(type.split(':')[2]);
  let res1 = [];
  for (let item of res) {
    res1.push({
      tokenIndex: item.index,
      name: item.name,
      desc: item.desc,
      type,
      royaltyRatio: parseInt(item.royaltyRatio) / 10,
      collectionType,
      attrIds: item.attrIds,
      imgUrl: item.photoLink[0],
      detailUrl: item.videoLink[0],
      bFork: item.bFork || false,
      canOperation,
    });
  }
  return res1;
}

export async function getAllCreateNFTByUser(data) {
  let { type, prinId } = data;
  let current = await canisterManager.getCurrentPrinId();
  let principal = prinId ? Principal.fromText(prinId) : await canisterManager.getCurrentPrinId();
  let fetch = await canisterManager.getNftFactoryByType(type, false);
  let res = fetch && (await fetch.getCreatorNFT(principal));
  let collectionType = parseInt(type.split(':')[2]);
  let res1 = [];
  for (let resItem of res) {
    let item = resItem.metaData;
    let owner = resItem.owner[0];
    let canOperation = current ? owner?.toText() === current?.toText() : false;
    res1.push({
      tokenIndex: item.index,
      name: item.name,
      desc: item.desc,
      type,
      royaltyRatio: parseInt(item.royaltyRatio) / 10,
      collectionType,
      attrIds: item.attrIds,
      imgUrl: item.photoLink[0],
      detailUrl: item.videoLink[0],
      bFork: item.bFork || false,
      canOperation,
    });
  }
  return res1;
}

export const getMarketCollection = async () => {
  let fetch = await canisterManager.getNftFactoryByType(ArtCreate, false);
  let res = await fetch?.getAllCollInfo();
  if (res) {
    const promise = [];
    for (let resItem of res) {
      let item = resItem[1];
      if (parseInt(item.collectionType) === CollectionType.CollectionFork) {
        promise.push(
          new Promise(async (resolve) => {
            let fetch = await canisterManager.getNftFactoryByType(`${ArtCollection}${item.cid}:${item.collectionType}`, false);
            let settings = await fetch?.getSettings();
            resolve({ cid: `${item.cid}`, settings });
          }).then((result) => result),
        );
      }
    }

    const forkRoyaltyRatio = await Promise.all(promise).then((result) => {
      let forkRoyaltyRatio = {};
      for (let item of result) {
        forkRoyaltyRatio[item.cid] = parseInt(item.settings.forkRoyaltyRatio || 0) / 10;
      }
      return forkRoyaltyRatio;
    });

    let formatRes = [];
    for (let resItem of res) {
      let item = resItem[1];
      let tmp = {
        key: `${ArtCollection}${item.cid}:${item.collectionType}`,
        pricinpalId: item.cid.toText(),
        title: item.name,
        brief: item.desc,
        blurb: `<p>${item.desc}</p>`,
        cid: item.cid,
        owner: item.owner,
        category: item.category,
        totalSupply: item.totalSupply,
        collectionType: parseInt(item.collectionType),
        forkRoyaltyRatio: forkRoyaltyRatio[item.cid] || 0,
        avatar: `https://${item.cid}.raw.ic0.app/token/logo`,
        thumb: `https://${item.cid}.raw.ic0.app/token/featured`,
        banner: `https://${item.cid}.raw.ic0.app/token/banner`,
      };
      formatRes.push(tmp);
    }
    return formatRes;
  }
  return [];
};

export const checkProjectName = async ({ name }) => {
  let fetch = await canisterManager.getNftFactoryByType(ArtCreate, false);
  let res = await fetch?.checkProjectName(name);
  return res;
};

export const getCreateFactorySettingConfig = async () => {
  let fetch = await canisterManager.getNftFactoryByType(ArtCreate, false);
  let res = await fetch?.getSettings();
  return res;
};

export const getCollectionConfigParam = async ({ type }) => {
  let fetch = await canisterManager.getNftFactoryByType(type, false);
  let curPrinId = await canisterManager.getCurrentPrinId();
  let promise = [];
  promise.push(
    new Promise(async (resolve) => {
      resolve(await fetch?.getSettings());
    }).then((result) => result),
  );
  promise.push(
    new Promise(async (resolve) => {
      resolve(await fetch?.getOwner());
    }).then((result) => result),
  );
  promise.push(
    new Promise(async (resolve) => {
      resolve(await fetch?.getCirculation());
    }).then((result) => result),
  );
  promise.push(
    new Promise(async (resolve) => {
      if (curPrinId) resolve(fetch?.checkIfInvites ? await fetch?.checkIfInvites(curPrinId) : false);
      else resolve(false);
    }).then((result) => result),
  );
  let res = await Promise.all(promise).then((result) => {
    let item = result[0];
    item.owner = result[1]?.toText();
    item.circluation = result[2];
    item.isWhiteList = result[3];
    return item;
  });
  return res;
};

export const getNFTMetaDataByIndex = async ({ type, tokenIndex }) => {
  let fetch = await canisterManager.getNftFactoryByType(type, false);
  let res = await fetch?.getNFTMetaDataByIndex(tokenIndex);
  if (res && res.length > 0) {
    let set = new Set();
    for (let item of res) {
      item?.creator && set.add(item?.creator?.toText());
      if (item.royaltyRatio !== undefined) item.royaltyRatio = parseInt(item.royaltyRatio) / 10;
      if (item.parentToken?.length) {
        let forkres = await fetch?.getNFTMetaDataByIndex(item.parentToken[0]);
        item.forkPhotoLink = forkres[0].photoLink[0];
        item.forkVideoLink = forkres[0].videoLink[0];
      }
    }
    await getAllUserName([...set]);
    return res[0];
  }
  return {};
};

export const getCollectionSettings = async ({ type }) => {
  let fetch = await canisterManager.getNftFactoryByType(type, false);
  let res = await fetch?.getSettings();
  return res;
};

//get all list
export async function factoryGetAllNFTByType(data) {
  let { type } = data;
  let fetch = await canisterManager.getNftFactoryByType(type, false);
  if (fetch) {
    let res = await fetch.getAllToken();
    let collectionType = parseInt(type.split(':')[2]);
    if (res) {
      let nftInfoArray = [];
      for (const _nft of res) {
        var { 0: base, 1: sellInfo } = _nft;
        let baseInfo = {
          type,
          name: base.name,
          desc: base.desc,
          tokenIndex: base.index,
          prinId: 'video',
          imgUrl: base.photoLink[0],
          detailUrl: base.videoLink[0],
          canOperation: false,
          collectionType,
          bFork: base.bFork || false,
        };
        nftInfoArray.push({
          baseInfo,
          nftType: type,
          sellInfo: sellInfo[0] || {},
          time: sellInfo[0]?.time,
          sellPrice: sellInfo[0]?.price,
        });
      }
      return nftInfoArray;
    }
  }
  return;
}

export async function checkIfCanCreateCollection() {
  let fetch = await canisterManager.getNftFactoryByType(ArtCreate, false);
  let curPrinId = await canisterManager.getCurrentPrinId();
  if (!curPrinId) return false;
  let res = await fetch?.checkIfWhiteList(curPrinId);
  return res;
}

export async function uploadWhiteListToForkCollection(data) {
  let { type, invites } = data;
  let fetch = await canisterManager.getNftFactoryByType(type, true);
  let res = fetch?.setWhiteList && (await fetch?.setWhiteList(invites));
  return res;
}
