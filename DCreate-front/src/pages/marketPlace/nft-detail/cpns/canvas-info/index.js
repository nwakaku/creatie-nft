import React, { memo } from 'react';
import Detail from '@/assets/images/market/detail.svg';
import { AloneCreate, CrowdCreate, M1155Create } from '@/constants';
import './style.less';
import { getValueDivide8 } from '@/utils/utils';
import UserPrincipal from '@/components/user-principal';
import { Collapse } from 'antd';

function CanvasInfo(props) {
  const canvasInfo = props.canvasInfo;
  const prinId = props.prinId;
  const type = props.type;
  const highestInfo = props.highestInfo;

  const isAlone = () => {
    return type === AloneCreate;
  };
  const isShowBonus = () => {
    return type === M1155Create || type === CrowdCreate;
  };

  const canvasInfoContent = (
    <div>
      <div className="textDetail">
        Description:
        <span>{` ${canvasInfo.desc}`}</span>
      </div>
      <div className="textDetail">
        CID:
        <span>{` ${prinId}`}</span>
      </div>
      {canvasInfo.createBy && (
        <div className="textDetail">
          Created by:
          <UserPrincipal prinId={canvasInfo.createBy.toText()} maxLength={20} />
        </div>
      )}
      <div className="textDetail">
        Total invested:
        <span>{` ${getValueDivide8(canvasInfo.totalWorth)} WICP`}</span>
      </div>

      {isShowBonus() && canvasInfo.bonusPixelThreshold !== undefined && (
        <div className="textDetail">
          Bonus status:
          <span>{canvasInfo.changeTotal >= (canvasInfo.bonusPixelThreshold || 0) ? ' Open' : ` Not open(${canvasInfo.changeTotal}/${canvasInfo.bonusPixelThreshold})`}</span>
        </div>
      )}
      {isAlone() && props.allMember && (
        <div className="textDetail">
          Artwork Collaborators:
          <span>{` `}</span>
          {props.allMember.map((item, index) => {
            return (
              <span key={index}>
                {index > 0 && '、'}
                <UserPrincipal prinId={item[0].toText()} maxLength={5} />
              </span>
            );
          })}
        </div>
      )}
      {isShowBonus() && (
        <div className="textDetail">
          Bonus to vest:
          <span>{` ${getValueDivide8(canvasInfo.bonus)} WICP`}</span>
        </div>
      )}

      {!isAlone() && (
        <div className="textDetail">
          Number of Updated Pixels:
          <span>{` ${canvasInfo.changeTotal}`}</span>
        </div>
      )}

      {!isAlone() && (
        <div className="textDetail">
          Number of Players:
          <span>{` ${canvasInfo.paintersNum || 1}`}</span>
        </div>
      )}
      {!isAlone() && (
        <div className="textDetail">
          MVP (Most Valuable Pixel):
          <span>{` ${getValueDivide8(highestInfo.length ? highestInfo[0][1].curPrice : 0)} WICP, Coordinates:(${highestInfo.length ? highestInfo[0][0].x : 0},${
            highestInfo.length ? highestInfo[0][0].y : 0
          })`}</span>
        </div>
      )}
    </div>
  );
  return (
    <div className="canvas-info-wrapper">
      <Collapse className="box-shadow" bordered={false} defaultActiveKey={['1']} expandIconPosition="end">
        <Collapse.Panel
          className="collapse-panel"
          header={
            <span className="collapse-panel-header title title-000">
              <img src={Detail} /> Detail
            </span>
          }
          key="0"
        >
          {canvasInfoContent}
        </Collapse.Panel>
      </Collapse>
    </div>
  );
}
export default memo(CanvasInfo);
