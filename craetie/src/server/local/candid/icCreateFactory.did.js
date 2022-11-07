export const idlFactory = ({ IDL }) => {
  const Time = IDL.Int;
  const ContentInfo = IDL.Record({
    twitter: IDL.Opt(IDL.Text),
    desc: IDL.Text,
    name: IDL.Text,
    webLink: IDL.Opt(IDL.Text),
    category: IDL.Text,
    discord: IDL.Opt(IDL.Text),
    medium: IDL.Opt(IDL.Text),
  });
  const NewForkCollectionParamInfo = IDL.Record({
    featured: IDL.Vec(IDL.Nat8),
    startline: Time,
    contentInfo: ContentInfo,
    logo: IDL.Vec(IDL.Nat8),
    banner: IDL.Vec(IDL.Nat8),
    whiteListType: IDL.Nat,
    forkRoyaltyRatio: IDL.Nat,
    deadline: Time,
    totalSupply: IDL.Nat,
    whiteListPrice: IDL.Opt(IDL.Nat),
    forkFee: IDL.Nat,
  });
  const CreateError = IDL.Variant({
    SupplyTooLarge: IDL.Null,
    InsufficientBalance: IDL.Null,
    EarningsTooHigh: IDL.Null,
    NotOnWhiteList: IDL.Null,
    RoyaltyRatioTooHigh: IDL.Null,
    Unauthorized: IDL.Null,
    NotOwner: IDL.Null,
    NameAlreadyExit: IDL.Null,
    Other: IDL.Null,
    ParamError: IDL.Null,
    LessThanFee: IDL.Null,
    AllowedInsufficientBalance: IDL.Null,
  });
  const CreateResponse = IDL.Variant({ ok: IDL.Text, err: CreateError });
  const NewPriCollectionParamInfo = IDL.Record({
    featured: IDL.Vec(IDL.Nat8),
    contentInfo: ContentInfo,
    logo: IDL.Vec(IDL.Nat8),
    banner: IDL.Vec(IDL.Nat8),
    totalSupply: IDL.Nat,
    royaltyRatio: IDL.Nat,
  });
  const NewCollectionInfo = IDL.Record({
    cid: IDL.Principal,
    owner: IDL.Principal,
    desc: IDL.Text,
    name: IDL.Text,
    totalSupply: IDL.Nat,
    category: IDL.Text,
    collectionType: IDL.Nat,
  });
  const FactorySettings = IDL.Record({
    maxForkFee: IDL.Nat,
    createFee: IDL.Nat,
    maxDescSize: IDL.Nat,
    maxRoyaltyRatio: IDL.Nat,
    maxNameSize: IDL.Nat,
    maxCategorySize: IDL.Nat,
    maxSupply: IDL.Nat,
    maxForkRoyaltyRatio: IDL.Nat,
  });
  const NFTFactory = IDL.Service({
    checkIfWhiteList: IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    checkProjectName: IDL.Func([IDL.Text], [IDL.Bool], ['query']),
    clearOldCollInfo: IDL.Func([], [IDL.Bool], []),
    clearWhiteList: IDL.Func([], [IDL.Bool], []),
    createNewForkCollection: IDL.Func([NewForkCollectionParamInfo], [CreateResponse], []),
    createNewPriCollection: IDL.Func([NewPriCollectionParamInfo], [CreateResponse], []),
    delCollInfo: IDL.Func([IDL.Text], [IDL.Bool], []),
    getAllCollInfo: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Text, NewCollectionInfo))], ['query']),
    getCollInfoByCategory: IDL.Func([IDL.Text], [IDL.Vec(NewCollectionInfo)], ['query']),
    getCollInfoByUser: IDL.Func([IDL.Principal], [IDL.Vec(NewCollectionInfo)], ['query']),
    getCycles: IDL.Func([], [IDL.Nat], ['query']),
    getCyclesCreate: IDL.Func([], [IDL.Nat], ['query']),
    getDataUser: IDL.Func([], [IDL.Principal], ['query']),
    getFeeArgu: IDL.Func([], [IDL.Nat, IDL.Nat], ['query']),
    getMarketFeeRatio: IDL.Func([], [IDL.Nat], ['query']),
    getOwner: IDL.Func([], [IDL.Principal], ['query']),
    getPublicCollInfo: IDL.Func([], [IDL.Vec(NewCollectionInfo)], ['query']),
    getSettings: IDL.Func([], [FactorySettings], ['query']),
    getWhiteList: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Nat))], ['query']),
    isPublic: IDL.Func([], [IDL.Bool], ['query']),
    setCollInfo: IDL.Func([IDL.Text, NewCollectionInfo], [IDL.Bool], []),
    setCreateFeeTo: IDL.Func([IDL.Principal], [IDL.Bool], []),
    setCyclesCreate: IDL.Func([IDL.Nat], [IDL.Bool], []),
    setDataUser: IDL.Func([IDL.Principal], [IDL.Bool], []),
    setFeeAndRatio: IDL.Func([IDL.Nat, IDL.Nat, IDL.Nat], [IDL.Bool], []),
    setMaxParam: IDL.Func([IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat], [IDL.Bool], []),
    setNewCollectionFee: IDL.Func([IDL.Nat], [IDL.Bool], []),
    setOwner: IDL.Func([IDL.Principal], [IDL.Bool], []),
    setbPublic: IDL.Func([IDL.Bool], [IDL.Bool], []),
    syncCollInfo: IDL.Func([], [IDL.Bool], []),
    uploadWhiteList: IDL.Func([IDL.Vec(IDL.Principal)], [IDL.Bool], []),
    wallet_receive: IDL.Func([], [IDL.Nat], []),
  });
  return NFTFactory;
};
export const init = ({ IDL }) => {
  return [IDL.Principal, IDL.Principal, IDL.Principal];
};
