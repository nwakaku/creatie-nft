import React, { useEffect, lazy } from 'react';
import { useHistory } from 'react-router-dom';
import { isTestNet } from '@/constants';
import Logo from '@/assets/images/logo_word.svg';
import './style.less';

export default React.memo(() => {
  const history = useHistory();

  useEffect(() => {}, []);

  return (
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
    </div>
  );
});
