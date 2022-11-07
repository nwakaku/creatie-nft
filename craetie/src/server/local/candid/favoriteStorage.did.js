export const idlFactory = ({ IDL }) => {
  const TokenIndex = IDL.Nat;
  const NFTStoreInfo = IDL.Record({
    photoLink: IDL.Text,
    videoLink: IDL.Text,
    nftType: IDL.Text,
    nftIndex: TokenIndex,
    canisterId: IDL.Principal,
  });
  const Storage = IDL.Service({
    cancelCollFavorite: IDL.Func([IDL.Principal, IDL.Text], [IDL.Bool], []),
    cancelFavorite: IDL.Func([NFTStoreInfo, IDL.Text], [IDL.Bool], []),
    getAllNftFavoriteNum: IDL.Func([], [IDL.Vec(IDL.Tuple(NFTStoreInfo, IDL.Nat))], ['query']),
    getCollFavoriteNum: IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    getCycles: IDL.Func([], [IDL.Nat], ['query']),
    getFavorite: IDL.Func([IDL.Principal], [IDL.Vec(NFTStoreInfo)], ['query']),
    getNftFavoriteNum: IDL.Func([NFTStoreInfo], [IDL.Nat], ['query']),
    getOwner: IDL.Func([], [IDL.Principal], []),
    getSortNftFavoriteNumByCid: IDL.Func([IDL.Principal], [IDL.Vec(IDL.Tuple(NFTStoreInfo, IDL.Nat))], ['query']),
    getTopNFavoriteNft: IDL.Func([IDL.Nat], [IDL.Vec(IDL.Tuple(NFTStoreInfo, IDL.Nat))], ['query']),
    isCollFavorite: IDL.Func([IDL.Principal, IDL.Principal], [IDL.Bool], ['query']),
    isFavorite: IDL.Func([IDL.Principal, NFTStoreInfo], [IDL.Bool], ['query']),
    setCollFavorite: IDL.Func([IDL.Principal, IDL.Text], [IDL.Bool], []),
    setFavorite: IDL.Func([NFTStoreInfo, IDL.Text], [IDL.Bool], []),
    setPasswd: IDL.Func([IDL.Text], [IDL.Bool], []),
    wallet_receive: IDL.Func([], [IDL.Nat], []),
  });
  return Storage;
};
export const init = ({ IDL }) => {
  return [IDL.Principal];
};
