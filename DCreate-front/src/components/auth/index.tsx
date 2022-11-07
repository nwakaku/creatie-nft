import React, { useEffect, useState } from 'react';
import './style.less';
import { isAuthTokenEffect, isCollapsed } from '@/utils/utils';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { requestLoginOut, requestUserProfile, requestUserAvatar } from './store/actions';
import DefaultAvator from '@/assets/images/wallet/avator.png';
import { useHistory, withRouter } from 'react-router-dom';
import { Avatar, Popover, List, Image, Dropdown, Menu } from 'antd';
import { WalletIcon, CollectedIcon, CreateIcon, StakeIcon, DrewIcon, FavoriteIcon, LogoutIcon } from '../../icons';
import AuthDrawer from './cpns/auth-drawer';
import { userHooks } from '../hooks';

const Auth = React.memo((props: any) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const pathName = props.history.location.pathname;
  const { isAuth, authToken } = userHooks();
  const { profile, avatar } = useSelector((state) => {
    return {
      profile: (authToken && state['auth'].getIn([`profile-${authToken}`])) || null,
      avatar: (authToken && state['auth'].getIn([`avatar-${authToken}`])) || null,
    };
  }, shallowEqual);

  const handleLogout = async () => {
    dispatch(requestLoginOut());
  };

  useEffect(() => {
    if (!avatar && profile && profile.avatorCID) {
      dispatch(requestUserAvatar(profile.avatorCID, authToken));
    }
  }, [profile]);

  useEffect(() => {
    if (!profile && isAuthTokenEffect(isAuth, authToken)) {
      dispatch(requestUserProfile(authToken));
    }
  }, [isAuth, authToken, profile]);

  const goToAssetByType = (key) => {
    if (!isAuth) {
      if (pathName !== key) history.push('/assets/auth');
    } else {
      if (pathName !== key) history.push(key);
    }
  };
  const menu = [
    { func: goToAssetByType, key: '/assets/wallet/myarts', title: 'Collected', icon: CollectedIcon },
    { func: goToAssetByType, key: '/assets/wallet/createCollections', title: 'Create', icon: CreateIcon },
    { func: goToAssetByType, key: '/assets/wallet/staking', title: 'Staking', icon: StakeIcon },
    { func: goToAssetByType, key: '/assets/wallet/drew', title: 'Drew', icon: DrewIcon },
    { func: goToAssetByType, key: '/assets/wallet/favorites', title: 'Favorites', icon: FavoriteIcon },
    { func: goToAssetByType, key: '/assets/wallet/transaction', title: 'Transaction record', icon: WalletIcon },
    { func: handleLogout, key: '', title: 'Logout', icon: LogoutIcon },
  ];

  return (
    <div className="auth-wrapper">
      {!isCollapsed() &&
        (isAuth ? (
          <Dropdown
            overlay={
              <Menu className="auth-top-menu">
                {menu.map((item, index) => {
                  return (
                    <Menu.Item key={index} onClick={() => item.func(item.key)}>
                      <div className="flex-10 ">
                        {item.icon}
                        {item.title}
                      </div>
                    </Menu.Item>
                  );
                })}
              </Menu>
            }
            overlayClassName={'auth-menu-drop'}
            trigger={['hover']}
            placement="bottomLeft"
          >
            <a href="/#/assets/wallet/myarts">
              <Avatar src={avatar || DefaultAvator} className="picture" style={{ cursor: 'pointer' }} />
            </a>
          </Dropdown>
        ) : (
          <a href="/#/assets/auth">
            <Avatar src={avatar || DefaultAvator} className="picture" style={{ cursor: 'pointer' }} />
          </a>
        ))}
      <AuthDrawer zIndex={props.zIndex} />
    </div>
  );
});

export default withRouter(Auth);
