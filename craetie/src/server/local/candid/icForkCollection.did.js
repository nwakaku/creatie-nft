export const idlFactory = ({ IDL }) => {
  const List = IDL.Rec();
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
  const TokenIndex__1 = IDL.Nat;
  const TokenIndex = IDL.Nat;
  const TransferResponse = IDL.Variant({
    ok: TokenIndex,
    err: IDL.Variant({
      ListOnMarketPlace: IDL.Null,
      NotAllowTransferToSelf: IDL.Null,
      NotOwnerOrNotApprove: IDL.Null,
      Other: IDL.Null,
    }),
  });
  const BuyRequest = IDL.Record({
    tokenIndex: TokenIndex,
    price: IDL.Nat,
    marketFeeRatio: IDL.Nat,
    feeTo: IDL.Principal,
  });
  const BuyResponse = IDL.Variant({
    ok: TokenIndex,
    err: IDL.Variant({
      NotAllowBuySelf: IDL.Null,
      InsufficientBalance: IDL.Null,
      AlreadyTransferToOther: IDL.Null,
      NotFoundIndex: IDL.Null,
      Unauthorized: IDL.Null,
      Other: IDL.Null,
      LessThanFee: IDL.Null,
      AllowedInsufficientBalance: IDL.Null,
    }),
  });
  const ListResponse = IDL.Variant({
    ok: TokenIndex,
    err: IDL.Variant({
      NotApprove: IDL.Null,
      NotNFT: IDL.Null,
      NotFoundIndex: IDL.Null,
      SamePrice: IDL.Null,
      NotOwner: IDL.Null,
      Other: IDL.Null,
      AlreadyList: IDL.Null,
      NotOpenList: IDL.Null,
    }),
  });
  const Operation = IDL.Variant({
    Bid: IDL.Null,
    List: IDL.Null,
    Mint: IDL.Null,
    Sale: IDL.Null,
    CancelList: IDL.Null,
    Transfer: IDL.Null,
    UpdateList: IDL.Null,
  });
  const OpRecord = IDL.Record({
    op: Operation,
    to: IDL.Opt(IDL.Principal),
    from: IDL.Opt(IDL.Principal),
    timestamp: Time,
    price: IDL.Opt(IDL.Nat),
  });
  List.fill(IDL.Opt(IDL.Tuple(OpRecord, List)));
  const ListRecord = IDL.Opt(IDL.Tuple(OpRecord, List));
  const ForkNFTMetaData = IDL.Record({
    photoLink: IDL.Opt(IDL.Text),
    creator: IDL.Principal,
    desc: IDL.Text,
    videoLink: IDL.Opt(IDL.Text),
    bFork: IDL.Bool,
    parentToken: IDL.Opt(TokenIndex),
    index: TokenIndex,
    royaltyRatio: IDL.Nat,
    royaltyFeeTo: IDL.Principal,
  });
  const SaleRecord = IDL.Record({
    to: IDL.Opt(IDL.Principal),
    photoLink: IDL.Opt(IDL.Text),
    tokenIndex: TokenIndex,
    from: IDL.Opt(IDL.Principal),
    videoLink: IDL.Opt(IDL.Text),
    timestamp: Time,
    price: IDL.Opt(IDL.Nat),
  });
  const Listings = IDL.Record({
    tokenIndex: TokenIndex,
    time: Time,
    seller: IDL.Principal,
    price: IDL.Nat,
  });
  const ContentInfo__1 = IDL.Record({
    twitter: IDL.Opt(IDL.Text),
    desc: IDL.Text,
    name: IDL.Text,
    webLink: IDL.Opt(IDL.Text),
    category: IDL.Text,
    discord: IDL.Opt(IDL.Text),
    medium: IDL.Opt(IDL.Text),
  });
  const ForkNFTMetaData__1 = IDL.Record({
    photoLink: IDL.Opt(IDL.Text),
    creator: IDL.Principal,
    desc: IDL.Text,
    videoLink: IDL.Opt(IDL.Text),
    bFork: IDL.Bool,
    parentToken: IDL.Opt(TokenIndex),
    index: TokenIndex,
    royaltyRatio: IDL.Nat,
    royaltyFeeTo: IDL.Principal,
  });
  const CreatorForkNFTMetaData = IDL.Record({
    metaData: ForkNFTMetaData__1,
    owner: IDL.Opt(IDL.Principal),
  });
  const ForkCollectionSettings = IDL.Record({
    startline: Time,
    uploadProtocolBaseFee: IDL.Nat,
    whiteListType: IDL.Nat,
    forkRoyaltyRatio: IDL.Nat,
    deadline: Time,
    maxDescSize: IDL.Nat,
    totalSupply: IDL.Nat,
    maxRoyaltyRatio: IDL.Nat,
    whiteListPrice: IDL.Opt(IDL.Nat),
    mutablePhotoLink: IDL.Opt(IDL.Text),
    uploadProtocolFeeRatio: IDL.Nat,
    marketFeeRatio: IDL.Nat,
    newItemForkFee: IDL.Nat,
  });
  const SoldListings = IDL.Record({
    lastPrice: IDL.Nat,
    time: Time,
    account: IDL.Nat,
  });
  const ComponentAttribute = IDL.Record({
    name: IDL.Text,
    traitType: IDL.Text,
  });
  const TokenDetails = IDL.Record({
    id: IDL.Nat,
    attrArr: IDL.Vec(ComponentAttribute),
  });
  const GetTokenResponse = IDL.Variant({
    ok: TokenDetails,
    err: IDL.Variant({ NotFoundIndex: IDL.Null }),
  });
  const HeaderField = IDL.Tuple(IDL.Text, IDL.Text);
  const HttpRequest = IDL.Record({
    url: IDL.Text,
    method: IDL.Text,
    body: IDL.Vec(IDL.Nat8),
    headers: IDL.Vec(HeaderField),
  });
  const StreamingCallbackToken = IDL.Record({
    key: IDL.Text,
    sha256: IDL.Opt(IDL.Vec(IDL.Nat8)),
    index: IDL.Nat,
    content_encoding: IDL.Text,
  });
  const StreamingCallbackResponse = IDL.Record({
    token: IDL.Opt(StreamingCallbackToken),
    body: IDL.Vec(IDL.Nat8),
  });
  const StreamingStrategy = IDL.Variant({
    Callback: IDL.Record({
      token: StreamingCallbackToken,
      callback: IDL.Func([StreamingCallbackToken], [StreamingCallbackResponse], ['query']),
    }),
  });
  const HttpResponse = IDL.Record({
    body: IDL.Vec(IDL.Nat8),
    headers: IDL.Vec(HeaderField),
    streaming_strategy: IDL.Opt(StreamingStrategy),
    status_code: IDL.Nat16,
  });
  const ListRequest = IDL.Record({
    tokenIndex: TokenIndex,
    price: IDL.Nat,
  });
  const NewIPFSItem = IDL.Record({
    photoLink: IDL.Opt(IDL.Text),
    attrArr: IDL.Vec(ComponentAttribute),
    desc: IDL.Text,
    name: IDL.Text,
    videoLink: IDL.Opt(IDL.Text),
    earnings: IDL.Nat,
    bFork: IDL.Bool,
    mutablePhotoLink: IDL.Opt(IDL.Text),
    parentToken: IDL.Opt(TokenIndex),
    royaltyFeeTo: IDL.Principal,
    passwd: IDL.Text,
  });
  const MintError = IDL.Variant({
    NoIPFSLink: IDL.Null,
    InsufficientBalance: IDL.Null,
    NotInWhiteList: IDL.Null,
    ForkNotOpen: IDL.Null,
    IPFSLinkAlreadyExist: IDL.Null,
    Unauthorized: IDL.Null,
    NotOwner: IDL.Null,
    Other: IDL.Null,
    ParamError: IDL.Null,
    SupplyUsedUp: IDL.Null,
    TooManyAttr: IDL.Null,
    LessThanFee: IDL.Null,
    AllowedInsufficientBalance: IDL.Null,
  });
  const MintResponse = IDL.Variant({ ok: TokenIndex, err: MintError });
  const ForkNFT = IDL.Service({
    approve: IDL.Func([IDL.Principal, TokenIndex__1], [IDL.Bool], []),
    balanceOf: IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    batchTransferFrom: IDL.Func([IDL.Principal, IDL.Vec(IDL.Principal), IDL.Vec(TokenIndex__1)], [TransferResponse], []),
    buyNow: IDL.Func([BuyRequest], [BuyResponse], []),
    cancelFavorite: IDL.Func([TokenIndex__1], [IDL.Bool], []),
    cancelList: IDL.Func([TokenIndex__1], [ListResponse], []),
    changeOwner: IDL.Func([IDL.Principal], [IDL.Bool], []),
    checkIfInvites: IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
    chunkRecord: IDL.Func([IDL.Nat], [IDL.Bool], []),
    clearOldTokens: IDL.Func([], [IDL.Bool], []),
    getAll: IDL.Func([], [IDL.Vec(IDL.Tuple(TokenIndex__1, IDL.Principal))], ['query']),
    getAllForkTimes: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Nat))], ['query']),
    getAllHistory: IDL.Func([], [IDL.Vec(IDL.Tuple(TokenIndex__1, ListRecord))], ['query']),
    getAllNFT: IDL.Func([IDL.Principal], [IDL.Vec(ForkNFTMetaData)], ['query']),
    getAllSaleRecord: IDL.Func([], [IDL.Vec(SaleRecord)], ['query']),
    getAllToken: IDL.Func([], [IDL.Vec(IDL.Tuple(ForkNFTMetaData, IDL.Opt(Listings)))], ['query']),
    getApproved: IDL.Func([TokenIndex__1], [IDL.Opt(IDL.Principal)], ['query']),
    getCirculation: IDL.Func([], [IDL.Nat], ['query']),
    getCollectionInfo: IDL.Func([], [ContentInfo__1], ['query']),
    getCreatorNFT: IDL.Func([IDL.Principal], [IDL.Vec(CreatorForkNFTMetaData)], ['query']),
    getCycles: IDL.Func([], [IDL.Nat], ['query']),
    getFeeTo: IDL.Func([], [IDL.Principal], ['query']),
    getForkTimesByIndex: IDL.Func([IDL.Nat], [IDL.Nat], ['query']),
    getHistory: IDL.Func([TokenIndex__1], [IDL.Vec(OpRecord)], ['query']),
    getListings: IDL.Func([], [IDL.Vec(IDL.Tuple(ForkNFTMetaData, Listings))], ['query']),
    getNFTMetaDataByIndex: IDL.Func([TokenIndex__1], [IDL.Opt(ForkNFTMetaData)], ['query']),
    getOwner: IDL.Func([], [IDL.Principal], ['query']),
    getOwnerSize: IDL.Func([], [IDL.Nat], ['query']),
    getSaleRecordByAccount: IDL.Func([IDL.Principal], [IDL.Vec(SaleRecord)], ['query']),
    getSettings: IDL.Func([], [ForkCollectionSettings], ['query']),
    getSoldListings: IDL.Func([], [IDL.Vec(IDL.Tuple(ForkNFTMetaData, SoldListings))], ['query']),
    getSuppy: IDL.Func([], [IDL.Nat], ['query']),
    getTokenById: IDL.Func([IDL.Nat], [GetTokenResponse], ['query']),
    getWhiteList: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Bool))], ['query']),
    http_request: IDL.Func([HttpRequest], [HttpResponse], ['query']),
    isApprovedForAll: IDL.Func([IDL.Principal, IDL.Principal], [IDL.Bool], ['query']),
    isList: IDL.Func([TokenIndex__1], [IDL.Opt(Listings)], ['query']),
    list: IDL.Func([ListRequest], [ListResponse], []),
    ownerOf: IDL.Func([TokenIndex__1], [IDL.Opt(IDL.Principal)], ['query']),
    setApprovalForAll: IDL.Func([IDL.Principal, IDL.Bool], [IDL.Bool], []),
    setFavorite: IDL.Func([TokenIndex__1], [IDL.Bool], []),
    setFeeAndRatio: IDL.Func([IDL.Nat, IDL.Nat, IDL.Nat], [IDL.Bool], []),
    setMAXRoyaltyRatio: IDL.Func([IDL.Nat], [IDL.Bool], []),
    setMaxParam: IDL.Func([IDL.Nat], [IDL.Bool], []),
    setSuppy: IDL.Func([IDL.Nat], [IDL.Bool], []),
    setWhiteList: IDL.Func([IDL.Vec(IDL.Text)], [IDL.Bool], []),
    syncAllTokens: IDL.Func([], [IDL.Bool], []),
    transferFrom: IDL.Func([IDL.Principal, IDL.Principal, TokenIndex__1], [TransferResponse], []),
    updateList: IDL.Func([ListRequest], [ListResponse], []),
    uploadIPFSItem: IDL.Func([NewIPFSItem], [MintResponse], []),
    wallet_receive: IDL.Func([], [IDL.Nat], []),
  });
  return ForkNFT;
};
export const init = ({ IDL }) => {
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
  return [NewForkCollectionParamInfo, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Principal, IDL.Principal, IDL.Principal, IDL.Principal];
};
