import React, { useEffect, useState, useRef, Suspense, lazy } from 'react';
import { useHistory } from 'react-router-dom';
import Auth from '../auth';
//import TopMenu from '../menu'
import TopMenu from '../navMenu';
import { isCollapsed } from '@/utils/utils';
import { isTestNet } from '@/constants';
import { requestInitLoginStates } from '../auth/store/actions';
import Logo from '@/assets/images/logo_word.svg';
import Menu from '@/assets/images/menu.svg';
import Close from '@/assets/images/close.svg';
import { useDispatch } from 'react-redux';
import { requestCanister, getTestWICP } from '@/api/handler';
import Toast from '@/components/toast';

import './style.less';
import { Button, message } from 'antd';

const AuthPage = lazy(() => import('@/components/auth-page'));

export default React.memo((props: any) => {
  const history = useHistory();
  const [authPageShow, setAuthPageShow] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(requestInitLoginStates());
  }, []);

  const onClickToGetTestWICP = (e) => {
    e.stopPropagation();
    let notice = Toast.loading('Get test wicp', 0);
    let data = {
      success: (res) => {
        if (res) {
          message.success('Success');
        }
      },
      fail: (error) => {
        if (error) message.error(error);
      },
      notice: notice,
    };
    requestCanister(getTestWICP, data);
  };

  const onMenuItemSelect = () => {
    setAuthPageShow(false);
    props.updateContent(false);
  };

  return (
    <div className="top-header-wrapper">
      <div className="header-content">
        <div
          className="logo"
          onClick={() => {
            history.push('/all');
          }}
        >
          <div className="logo-detail">
            <img alt="" src={Logo} className="one" />
            <div className="three">Beta</div>
          </div>
          {isTestNet && <div className="test"> Testnets </div>}
          {isTestNet && (
            <Button className="ant-btn-black btn-small" style={{ marginLeft: '20px' }} onClick={onClickToGetTestWICP}>
              Faucet
            </Button>
          )}
        </div>
        <div className="menu-auth">
          <div className="auth">
            {isCollapsed() && (
              <div
                onClick={() => {
                  setAuthPageShow(!authPageShow);
                  props.updateContent(!authPageShow);
                }}
              >
                {authPageShow ? <img alt="" src={Close} /> : <img alt="" src={Menu} />}
              </div>
            )}
            <Auth />
          </div>
          {!isCollapsed() && (
            <div className="menu">
              <TopMenu />
            </div>
          )}
        </div>
      </div>
      {authPageShow && (
        <div className="authPage">
          <Suspense fallback={<div />}>
            <AuthPage onMenuItemSelect={onMenuItemSelect} />
          </Suspense>
        </div>
      )}
    </div>
  );
});
