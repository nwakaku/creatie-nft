import React, { lazy } from 'react';
import { HashRouter as Router, Route, Redirect } from 'react-router-dom';
import Home from '@/pages/home';
import MarketPlace from '@/pages/marketPlace';
import Wallet from '@/pages/wallet';
import MarketDetail from '@/pages/marketPlace/nft-detail/721-detail';
import Detail1155 from '@/pages/marketPlace/nft-detail/1155-detail';
import CommonDetail from '@/pages/marketPlace/nft-detail/common-detail';
import CollectionItem from '@/pages/marketPlace/collections/detail';
import { useScrollToTop } from './components/hooks';

const Create = lazy(() => import('@/pages/create'));
const SettingPage = lazy(() => import('@/pages/wallet/page/setting-page'));

export default React.memo(() => {
  useScrollToTop();

  return (
    <Router>
      <Route exact path="/">
        <Redirect to="/all" />
      </Route>
      <Route path="/all" component={Home} />
      <Route path="/marketplace/:type?" component={MarketPlace} />
      <Route path="/collection/:type?/:tab?/:owner?" component={CollectionItem} />
      <Route path="/create/:type?/:prinId?" component={Create} />
      <Route path="/assets/:account?/:tab?/:user?" component={Wallet} />
      <Route path="/1155/:type?/:index?/:prinId?" component={Detail1155} />
      <Route path="/detail/:type?/:index?/:prinId?" component={MarketDetail} />
      <Route path="/third/:type?/:index?/:prinId?" component={CommonDetail} />
      <Route path="/setting" component={SettingPage} />
    </Router>
  );
});
