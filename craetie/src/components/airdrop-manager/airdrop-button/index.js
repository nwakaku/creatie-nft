import React, { useEffect, useRef } from 'react';
import { isAuthTokenEffect } from '@/utils/utils';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import Dialog from '@/components/dialog';
import AirdropTiger from '@/components/airdrop-manager/airdrop-tiger';
import Airdrop from '@/components/airdrop-manager/airdrop-claim';
import AirdropCommon from '@/components/airdrop-manager/airdrop-common';
import { requestCanister } from '@/api/handler';
import PubSub from 'pubsub-js';
import { DropComplete, ShowAuthDrawer } from '@/message';
import { queryAirDropRemain } from '@/api/mintHandler';
import { ZombieNFTCreate } from '@/constants';
import { Button } from 'antd';
import { saveNFTInfo } from '@/pages/home/store/actions';
import { userHooks } from '@/components/hooks';

const AirDropButton = (props) => {
  const dispatch = useDispatch();
  const AIRDROP_DATA = 'airdropData';
  const dropType = props.type;
  const { isAuth, authToken } = userHooks();
  const { dropCount } = useSelector((state) => {
    return {
      dropCount: state.allcavans.getIn([`${AIRDROP_DATA}-${dropType}`]) || 0,
    };
  }, shallowEqual);
  const dropCountRef = useRef();
  dropCountRef.current = dropCount;
  const showDropLayout = () => {
    if (dropCount <= 0) {
      return;
    }
    Dialog.createAndShowDialog(dropType === ZombieNFTCreate ? <Airdrop type={dropType} /> : dropType === 'gang' ? <AirdropTiger type={dropType} /> : <AirdropCommon type={dropType} />, 0);
  };

  useEffect(() => {
    const onDropComplete = (topic, info) => {
      if (info.type === dropType) {
        saveNFTInfo(dispatch, { type: `${AIRDROP_DATA}-${dropType}`, value: dropCountRef.current - 1 });
      }
    };
    const queryDrop = PubSub.subscribe(DropComplete, onDropComplete);
    return () => {
      PubSub.unsubscribe(queryDrop);
    };
  }, []); // eslint-disable-next-line

  const queryAirDropStatus = () => {
    requestCanister(
      queryAirDropRemain,
      {
        type: dropType,
        success: (res) => {
          if (res > 0) {
            saveNFTInfo(dispatch, { type: `${AIRDROP_DATA}-${dropType}`, value: parseInt(res) });
          }
        },
      },
      true,
    );
  };

  useEffect(() => {
    if (isAuthTokenEffect(isAuth, authToken)) {
      queryAirDropStatus();
    }
    return () => {
      saveNFTInfo(dispatch, { type: `${AIRDROP_DATA}-${dropType}`, value: 0 });
    };
  }, [authToken, isAuth]);

  const onClickAuth = () => {
    PubSub.publish(ShowAuthDrawer, {});
  };

  return isAuth ? (
    dropCount > 0 ? (
      <Button type="white-black" className="btn-normal" onClick={showDropLayout}>{`Claim(${dropCount})`}</Button>
    ) : (
      <></>
    )
  ) : (
    <Button type="white-black" className="btn-normal" onClick={onClickAuth}>
      Connect your wallet
    </Button>
  );
};

export default AirDropButton;
