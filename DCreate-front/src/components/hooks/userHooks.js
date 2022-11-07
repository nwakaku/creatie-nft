import { Principal } from '@dfinity/principal';
import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { isAuthTokenEffect, principalToAccountId } from '@/utils/utils';

export const userHooks = () => {
  const { isAuth, authToken, accountId, wicpBalance, icpBalance, collectionsConfig, allCreateCollection } = useSelector((state) => {
    let isAuth = state.auth.getIn(['isAuth']) || false;
    let authToken = state.auth.getIn(['authToken']) || '';
    let accountId = isAuthTokenEffect(isAuth, authToken) ? principalToAccountId(Principal.fromText(authToken)) : '';
    return {
      isAuth,
      authToken,
      accountId,
      wicpBalance: (state.auth && state.auth.getIn(['wicpBalance'])) || 0,
      icpBalance: (state.auth && state.auth.getIn(['icpBalance'])) || 0,
      collectionsConfig: state.auth.getIn(['collection']) || [],
      allCreateCollection: state.auth.getIn(['allCreateCollection']),
    };
  }, shallowEqual);
  return { isAuth, authToken, accountId, wicpBalance, icpBalance, collectionsConfig, allCreateCollection };
};
