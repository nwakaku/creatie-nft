import DefaultAvator from '@/assets/images/wallet/avator.png';
import React from 'react';
export default ({ src }) => {
  return <img alt="" className="default-img" src={src || DefaultAvator} />;
};
