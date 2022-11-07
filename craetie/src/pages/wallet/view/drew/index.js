import React, { memo, useState, useEffect, useRef } from 'react';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { message } from 'antd';
import { requestCanister } from '@/api/handler';
import { getParticipate } from '@/api/nftHandler';
import { AloneCreate, CrowdCreate, ThemeCreate, M1155Create, Theme1155Create } from '@/constants';
import NFTList from '@/pages/wallet/cpns/nft-list';
import { saveNFTInfo } from '@/pages/home/store/actions';
import { userHooks } from '@/components/hooks';

function Drew(props) {
  const DREW_DATA = 'drawData';
  const dispatch = useDispatch();
  const typeList = [CrowdCreate, M1155Create, AloneCreate, ThemeCreate, Theme1155Create];

  const params = props.match.params;
  const account = params.account;
  const { authToken } = userHooks();
  const { user, nfts, isSelf } = useSelector((state) => {
    let user = account === 'wallet' ? authToken : params.user;
    let isSelf = user === authToken;
    return {
      user,
      nfts: state.allcavans.getIn([`${DREW_DATA}-${user}`]) || {},
      isSelf,
    };
  }, shallowEqual);

  const nftsRef = useRef();
  nftsRef.current = nfts;

  // get drew data
  const fetchDrewData = async (type) => {
    let data = {
      type: type,
      prinId: user,
      success: async (res) => {
        if (res) {
          let newData = {};
          for (let key in nftsRef.current) {
            if (key !== type) newData[key] = nftsRef.current[key];
          }
          newData[type] = res;
          saveNFTInfo(dispatch, { type: `${DREW_DATA}-${user}`, value: newData });
        }
      },
      fail: (error) => {
        console.error('fetchDrewData fail:', error);
        message.error(error);
      },
    };
    await requestCanister(getParticipate, data, false);
  };

  useEffect(() => {
    if (user) {
      for (let type of typeList) {
        fetchDrewData(type);
      }
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (!isSelf) {
        saveNFTInfo(dispatch, { type: `${DREW_DATA}-${user}`, value: null });
      }
    };
  }, []);

  const getNFTListData = () => {
    let data = {};
    for (let key of typeList) {
      data[key] = nfts[key] || [];
    }
    return data;
  };

  const getLoadingData = () => {
    let data = {};
    for (let key in nfts) {
      data[key] = true;
    }
    return data;
  };

  return <NFTList nfts={getNFTListData()} thumbType={'drew'} nftType={'drew'} user={user} loading={getLoadingData()} />;
}
export default memo(Drew);
