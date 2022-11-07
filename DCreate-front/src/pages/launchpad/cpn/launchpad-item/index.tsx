import React, { memo } from 'react';
import { Card } from 'antd';
import './style.less';
import { useHistory } from 'react-router-dom';
import WICPPrice from '@/components/wicp-price';
import { shallowEqual, useSelector } from 'react-redux';
import { getValueMultiplied8, getUTCTime } from '@/utils/utils';
import { ArrowRightOutlined } from '@ant-design/icons';
import { find } from 'lodash-es';
import { ProtocolUrl } from '@/constants';

interface propsType {
  item: any;
  mintTime: number;
}
const LaunchpadItem = memo((props: propsType) => {
  const { item, mintTime } = props;
  const { collectionsConfig } = useSelector((state) => {
    return {
      collectionsConfig: state['auth'].getIn(['collection']) || [],
    };
  }, shallowEqual);
  const collectionItem = find(collectionsConfig, { key: item.key });
  const history = useHistory();
  const handlerOnItemClick = () => {
    history.push(`/mint/${item.key}`);
  };

  const actionContent: any = () => {
    let now = new Date().getTime();
    if (item.endMint) {
      return <></>;
    } else if (mintTime <= now) {
      return [
        <div style={{ color: '#4338ca' }}>
          Mint <ArrowRightOutlined />
        </div>,
      ];
    } else {
      return [<div>{getUTCTime(mintTime)}</div>];
    }
  };
  return (
    <Card className="launchpad-item" bordered={false} onClick={handlerOnItemClick} actions={actionContent()}>
      <div className="image-content">
        <div className="image-thumb">
          <img alt="" src={`${ProtocolUrl}/resource/${item.key}/thumb.png`}></img>
        </div>
        <div className="content1 vertical-center flex-10">
          <div className="small-title small-title-000">{collectionItem?.title}</div>
          <div className="limit-lines value value-666">{collectionItem?.brief}</div>
          <div className="flex-space-between tip-bold" style={{ width: '100%' }}>
            <div className="flex-5">
              <div>Price:</div>
              <WICPPrice iconSize={18} value={getValueMultiplied8(item.price)} valueStyle={'tip-bold'} />
            </div>
            <div>{`Items: ${collectionItem?.totalSupply}`}</div>
          </div>
        </div>
      </div>
    </Card>
  );
});

export default LaunchpadItem;
