import React, { memo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import AssetsMenu from '@/components/menu';
import WalletMenuConfig from '@/assets/scripts/walletMenu';
import './style.less';
import background from '@/assets/images/wallet/stake-bg.png';
import { isAuthTokenEffect, isCollapsed } from '@/utils/utils';
import Transaction from './view/transaction';
import MyNFTs from './view/my-nft';
import Drew from './view/drew';
import Favorites from './view/favorites';
import Staking from './view/staking';
import { HashRouter, Route, useHistory } from 'react-router-dom';
import UserProfile from './cpns/user-profile';
import LoginView from './view/login';
import MyCreate from './view/my-create';
import { getAllCreateCollection } from '@/pages/home/store/actions';
import { Spin } from 'antd';
import { userHooks } from '@/components/hooks';

function Wallet(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const params = props.match.params;
  let user = params.user;
  const account = params.account;
  const tab = params.tab;
  const { isAuth, authToken, collectionsConfig, allCreateCollection } = userHooks();

  if (account === 'wallet' && isAuthTokenEffect(isAuth, authToken)) {
    user = authToken;
  }
  const isSelf = user === authToken;

  useEffect(() => {
    if (isAuth) {
      if (account === 'auth') history.replace('/assets/wallet/myarts');
    } else {
      if (account !== 'auth' && account !== 'account') history.replace('/assets/auth');
    }
  }, [isAuth]);

  const getCurrentMenu = () => {
    if (isSelf) {
      return WalletMenuConfig;
    } else {
      let menu = [];
      for (let item of WalletMenuConfig) {
        if (item.key === '/transaction' || item.key === '/staking') continue;
        menu.push(item);
      }
      return menu;
    }
  };
  const handlerItemSelect = (key) => {
    let path = `/assets/${account}${key}`;
    if (account === 'account') {
      path += `/${user}`;
    }
    history.push(path);
  };

  useEffect(() => {
    dispatch(getAllCreateCollection());
  }, [dispatch]);

  return (
    <HashRouter>
      <div className="wallet-wrapper">
        {/* {user && isSelf && <AirDropManager />} */}
        <div className="content-wrapper">
          {user && (
            <div className="top-wrapper">
              <img alt="" style={{ width: '100%', height: '220px', objectFit: 'cover' }} src={background} />
              <UserProfile user={user} />
            </div>
          )}
          {user && !isCollapsed() && (
            <div className="menu-wrapper">
              <AssetsMenu
                MenuConfig={getCurrentMenu()}
                currKey={`/${tab}`}
                currentItemKey={'walletSelected'}
                mode={'horizontal'}
                className="dc-menuConfig-horizontal"
                handlerItemSelect={handlerItemSelect}
              />
            </div>
          )}
          {collectionsConfig.length > 0 && allCreateCollection !== undefined ? (
            <div className="wallet-content-wrapper">
              <Route path={'/assets/auth'} component={LoginView} />
              <Route path={`/assets/${account}/transaction`} component={Transaction} />
              <Route path={`/assets/:account?/myarts/:user?/:type?`} component={MyNFTs} />
              <Route path={`/assets/${account}/staking`} component={Staking} />
              <Route path={`/assets/:account?/drew/:user?`} component={Drew} />
              <Route path={`/assets/:account?/favorites/:user?`} component={Favorites} />
              <Route path={`/assets/:account?/createCollections/:user?`} component={MyCreate} />
              <Route path={`/assets/:account?/createItems/:user?`} component={MyCreate} />
            </div>
          ) : (
            <Spin style={{ margin: '60px auto', width: '100%' }} />
          )}
        </div>
      </div>
    </HashRouter>
  );
}

export default memo(Wallet);
