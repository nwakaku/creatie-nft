import { canisterManager } from './canisterManager';
import { Principal } from '@dfinity/principal';
import ErrorMessage from '@/assets/scripts/errorCode';
import RosettaApi from '../ic/RosettaApi';
import { principalToAccountId, getSubAccountArray, bignumberToBigInt, getValueMultiplied8, plusBigNumber, formatMinuteSecond, getValueDivide8 } from '../utils/utils';
import BigNumber from 'bignumber.js';
import { NFT_ALONE_FACTORY_ID, NFT_MULTI_FACTORY_ID, NFT_ZOMBIE_FACOTRY_ID, NFT_THEME_FACTORY_ID } from 'canister/local/id.js';
import { DFINITY_TYPE, PLUG_TYPE, STOIC_TYPE, INFINITY_TYPE, ProtocolUrl, homeListUrl } from '@/constants';
import { getAllUserName } from './userHandler';
import axios from 'axios';

const rosettaApi = new RosettaApi();

export async function lessBalanceApproveWICPNat(prinId) {
  let fetch = await canisterManager.getWICPMotoko(false);
  let amount = await getAllowance(prinId);
  let principal = await canisterManager.getCurrentPrinId();
  if (principal) {
    let balance = await fetch.balanceOf(principal);
    if (amount < balance) {
      //授权额度小于余额则授权
      let args1 = Principal.fromText(prinId);
      let fetch = await canisterManager.getWICPMotoko(true);
      let res = await fetch.approve(args1, balance);
      return res;
    }
  }
}

export async function approveWICPNat(prinId) {
  let fetch = await canisterManager.getWICPMotoko(true);
  let principal = await canisterManager.getCurrentPrinId();
  if (principal) {
    let args1 = Principal.fromText(prinId);
    let args2 = await fetch.balanceOf(principal);
    let res = await fetch.approve(args1, args2);
    return res;
  }
}

export async function getAllowance(prinId) {
  let fetch = await canisterManager.getWICPMotoko(false);
  let principal = await canisterManager.getCurrentPrinId();
  if (principal) {
    let spender = Principal.fromText(prinId);
    let amount = await fetch.allowance(principal, spender);
    return amount;
  }
  return 0;
}

export async function initLoginStates(callback) {
  return await canisterManager.initLoginStates(callback);
}

export async function isLogin() {
  return await canisterManager.isLogin();
}

export async function authLoginOut(callback) {
  await canisterManager.loginOut(callback);
}

export async function authLogin(type, callback) {
  console.debug('type = ', type, DFINITY_TYPE);
  if (type === DFINITY_TYPE) {
    await canisterManager.authLogin(callback);
  } else if (type === PLUG_TYPE) {
    await canisterManager.plugLogin(callback);
  } else if (type === STOIC_TYPE) {
    await canisterManager.stoicLogin(callback);
  } else if (type === INFINITY_TYPE) {
    await canisterManager.infinityLogin(callback);
  }
}

export async function requestCanister(reqFunc, data, mustLogin = true) {
  let { success, fail, notice, error } = data;
  Promise.resolve()
    .then(async () => {
      if (mustLogin && !(await isLogin())) {
        return { err: { NotLogin: 1 } };
      }
      return await reqFunc(data);
    })
    .then((res) => {
      notice && notice();
      if (res.err) {
        console.log('response error:', res.err);
        for (let key in res.err) {
          fail && fail(ErrorMessage[key], key);
        }
      } else {
        success && success(res);
      }
    })
    .catch((err) => {
      console.error('request error', err);
      notice && notice();
      error && error(err);
    });
}

export async function promiseAllFunc(funcs, data) {
  let { success, fail, notice } = data;
  let promise = [];
  for (let func of funcs) {
    promise.push(
      new Promise(async (resolve, reject) => {
        resolve(await func(data));
      }).then((result) => result),
    );
  }
  Promise.all(promise)
    .then((result) => {
      for (let res of result) {
        if (res.err) {
          console.log('response error:', res.err);
          for (let key in res.err) {
            fail && fail(ErrorMessage[key], key);
          }
          return;
        }
      }
      success && success(result);
    })
    .catch((e) => console.log(e))
    .finally(() => {
      notice && notice();
    });
}

export async function promiseFuncAllType(func, allTypes, data) {
  let { success, fail, notice, error } = data;
  let promise = [];
  for (let type of allTypes) {
    promise.push(
      new Promise(async (resolve, reject) => {
        data.type = type;
        resolve(await func(data));
      }).then((result) => result),
    );
  }
  Promise.all(promise)
    .then((result) => {
      for (let res of result) {
        if (res.err) {
          console.warn('response error:', res.err);
          for (let key in res.err) {
            fail && fail(ErrorMessage[key], key);
          }
          return;
        }
      }
      success && success(result);
    })
    .catch((e) => {
      console.log(e);
      error && error(e);
    })
    .finally(() => {
      notice && notice();
    });
}

export async function balanceWICP(data) {
  let { curPrinId } = data;
  let fetch = await canisterManager.getWICPMotoko(false);
  let count = await fetch.balanceOf(Principal.fromText(curPrinId));
  return count || 0;
}

export async function balanceICP(data) {
  let { curPrinId } = data;
  let account = principalToAccountId(Principal.fromText(curPrinId));
  let ledgercanister = await canisterManager.getLedgerCanister(false);
  let icpBalance = await ledgercanister.account_balance_dfx({ account: account });
  return icpBalance ? icpBalance.e8s : 0; // 接口拿
}

export async function transferIcp2Icp(data) {
  let { amount, address } = data;
  let transAmount = new BigNumber(amount).multipliedBy(Math.pow(10, 8)).minus(10000);
  let subaccount = [getSubAccountArray(0)];
  let toAddr = address;
  let args = {
    from_subaccount: subaccount,
    to: toAddr,
    amount: { e8s: bignumberToBigInt(transAmount) },
    fee: { e8s: 10000 },
    memo: 0,
    created_at_time: [],
  };
  let ledgercanister = await canisterManager.getLedgerCanister(true);
  let blockHeight = await ledgercanister.send_dfx(args);
  return blockHeight;
}

export async function transferWIcp2WIcp(data) {
  let { amount, address } = data;
  let fetch = await canisterManager.getWICPMotoko(true);
  let res = await fetch.transfer(Principal.fromText(address), parseInt(getValueMultiplied8(amount)));
  return res;
}

export async function transferWIcp2Icp(data) {
  let { amount } = data;
  let fetch = await canisterManager.getWICPMotoko(true);
  let res = await fetch.burn(parseInt(getValueMultiplied8(amount)));
  return res;
}

export async function transferIcp2WIcp(data) {
  let { onChange } = data;
  let fetch = await canisterManager.getWICPMotoko(true);
  let toAddr = await fetch.getReceiveICPAcc();
  data['address'] = toAddr[0];
  let blockHeight = await transferIcp2Icp(data);
  onChange && onChange(1);
  if (blockHeight) {
    console.log('blockHeight =' + blockHeight);
    let subaccount = [getSubAccountArray(0)];
    let result = await fetch.swap({ from_subaccount: subaccount, blockHeight: blockHeight });
    onChange && onChange(2);
    approveWICPNat(NFT_ALONE_FACTORY_ID);
    approveWICPNat(NFT_MULTI_FACTORY_ID);
    approveWICPNat(NFT_ZOMBIE_FACOTRY_ID);
    approveWICPNat(NFT_THEME_FACTORY_ID);
    onChange && onChange(3);
    return result;
  } else {
    return null;
  }
}

export async function getICPTransaction(data) {
  let { accountAddress } = data;
  let res = await rosettaApi.getTransactionsByAccount(accountAddress);
  let fetch = await canisterManager.getWICPMotoko(false);
  let minHeight = await fetch.getMinBlockHeight();
  let toAddr = await fetch.getReceiveICPAcc();
  let heightArray = res.reduce((pre, item) => {
    if (parseInt(item.blockIndex) > parseInt(minHeight)) {
      let index = toAddr.indexOf(item.account2Address);
      if (index !== -1) {
        pre.push(item.blockIndex);
      }
    }
    return pre;
  }, []);
  let array = await fetch.getMintInfoByHeightArr(heightArray);
  let transaction = [];
  for (let item of res) {
    const mintError = array.filter((res) => parseInt(res) === item.blockIndex).length > 0;
    transaction.unshift({
      key: item.blockIndex + '',
      index: item.blockIndex + '',
      from: item.account1Address,
      to: item.account2Address,
      amount: getValueDivide8(item.amount) + '',
      time: formatMinuteSecond(new Date(item.timestamp).getTime(), false),
      mintError,
    });
  }
  return transaction;
}

export async function mintIcp2WIcp(data) {
  let { blockHeight } = data;
  let fetch = await canisterManager.getWICPMotoko(true);
  if (blockHeight) {
    let subaccount = [getSubAccountArray(0)];
    let result = await fetch.swap({ from_subaccount: subaccount, blockHeight: blockHeight });
    return result;
  } else {
    return {};
  }
}
export async function getWICPTransaction(data) {
  let { prinId } = data;
  let principal = Principal.fromText(prinId);
  let fetch = await canisterManager.getWICPStorage();
  let res = await fetch.getHistoryByAccount(principal);
  let set = new Set();
  for (let item of res) {
    item.from && item.from.length && set.add(item.from[0].toText());
    item.to && item.to.length && set.add(item.to[0].toText());
  }
  await getAllUserName([...set]);
  return res;
}

// Subscribe to email
export async function subEmail(email) {
  let fetch = await canisterManager.getStorageMotoko();
  let res = await fetch.addCccMailSub(email);
  return res;
}

export async function addWhiteList(type, prinId) {
  await canisterManager.getCanvasCanister(type, prinId, true);
}

export async function getTestWICP() {
  let fetch = await canisterManager.getWICPMotoko(true);
  let res = await fetch.mintFree();
  return res;
}

export async function queryAlias(start, end) {
  let fetch = await canisterManager.getInternetIdentity();
  console.log('fetch =', fetch);
  if (fetch) {
    for (let i = start; i <= end; i++) {
      let res = await fetch.lookup(i);
      if (res[0] && res[0].alias) {
        console.log('index =', i, ' res[0].alias', res[0].alias);
        if (res[0].alias === 'qwerty') {
          console.error('index =', i, ' res.alias', res[0].alias);
          break;
        }
      }
    }
  }
}

export function getCurrentLoginType() {
  return canisterManager.getCurrentLoginType();
}

export async function handleCollectionConfig(success) {
  var config = {
    method: 'get',
    url: `${ProtocolUrl}/config/collections.json?timestamp=${new Date().getTime()}`,
    headers: {},
  };
  axios(config)
    .then(function (response) {
      let res = response?.data;
      canisterManager.handleCollectionConfig(res);
      success && success(res);
    })
    .catch(function (error) {
      console.log(error);
    });
}

export async function handleAirDropConfig(success) {
  var config = {
    method: 'get',
    url: `${ProtocolUrl}/config/airdrop.json?timestamp=${new Date().getTime()}`,
    headers: {},
  };
  axios(config)
    .then(function (response) {
      let res = response?.data;
      success && success(res);
    })
    .catch(function (error) {
      console.log(error);
    });
}

export async function handleLaunchpadConfig(success) {
  var config = {
    method: 'get',
    url: `${ProtocolUrl}/config/launchpad.json?timestamp=${new Date().getTime()}`,
    headers: {},
  };
  axios(config)
    .then(function (response) {
      let res = response?.data;
      success && success(res);
    })
    .catch(function (error) {
      console.log(error);
    });
}

export async function handleGetHomeProtocolData(url, success) {
  var config = {
    method: 'get',
    //url: `${baseUrl}/market/listPopularAloneCanvas`,
    //url: 'http://47.88.25.203:8010/market/listPopularAloneCanvas',
    url: `${ProtocolUrl}${url}`,
    headers: {},
  };
  axios(config)
    .then(function (response) {
      let res = response?.data;
      //canisterManager.handleGetHomeList(res)
      success && success(res);
    })
    .catch(function (error) {
      console.log(error);
    });
}

export function handleGetCollectiblesList(success) {
  var config = {
    method: 'get',
    //url: `${baseUrl}/market/listPopularAloneCanvas`,
    //url: 'http://47.88.25.203:8010/market/listPopularAloneCanvas',
    url: `${ProtocolUrl}/config/popular_collectibles.json`,
    headers: {},
  };
  axios(config)
    .then((response) => {
      let res = response?.data;
      //canisterManager.handleGetHomeList(res)
      if (res) {
        success && success(res);
      }
    })
    .catch(function (error) {
      console.log(error);
    });
}

export async function handleGetCollectiblesImg(item) {
  var config = {
    method: 'get',
    url: `${ProtocolUrl}/resource/popular_collectibles/${item.type}/${item.index}.jpeg`,
    headers: {},
  };
  return axios(config)
    .then(function (response) {
      let res = response?.data;
      //canisterManager.handleGetHomeList(res)
      //再次发请求
      return res;
      //success && success(res)
    })
    .catch(function (error) {
      console.log(error);
    });
}

//handleGetTopCollectiblesList
export async function handleGetTopCollectiblesList(success, value) {
  var config = {
    method: 'get',
    //url: 'https://web-backend.c3-protocol.com/api/v1/ccc/collections',
    url: `${homeListUrl}/api/v1/ccc/collections?ordering=-day7_volume`,
    headers: {},
  };
  axios(config)
    .then(function (response) {
      let res = response?.data;
      //canisterManager.handleGetHomeList(res)
      success && success(res);
    })
    .catch(function (error) {
      console.log(error);
    });
}
