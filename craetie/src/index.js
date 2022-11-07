import React from 'react';
import { render } from 'react-dom';
import App from './App';
import './index.less';
import { Provider } from 'react-redux';
import store from './store';
import * as mobxStores from './store/store';
//import ViewportProvider from './ViewportProvider'

render(
  <Provider store={store} {...mobxStores}>
    <App />
    <div id="dialog"></div>
  </Provider>,
  document.getElementById('app'),
);
