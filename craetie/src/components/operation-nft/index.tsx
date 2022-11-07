import React from 'react';
import { BlindBoxStatus } from '@/constants';
import { Dropdown, Menu } from 'antd';
import more from '@/assets/images/icon/more.svg';

interface infoType {
  seller?: any;
}
interface propsType {
  canOperation?: boolean;
  listingInfo?: infoType;
  blindBoxStatus?: any;
  isBlindBox?: boolean;
  handlerOnForkClick?: (e: any) => void;
  handlerOnButtonClick: (key1?: any, key2?: string) => void;
  handlerBuyClick: (key?: any) => void;
  handlerOnTransferClick: (key?: any) => void;
  handlerOpenBlindboxClick: (key?: any) => void;
}

export default React.memo((props: propsType) => {
  const { handlerOnForkClick, handlerOnTransferClick, handlerOnButtonClick, handlerOpenBlindboxClick, handlerBuyClick, isBlindBox, listingInfo, canOperation, blindBoxStatus } = props;
  const operationContext = () => {
    let content: Array<any> = [];
    if (canOperation) {
      if (listingInfo && listingInfo.seller) {
        const obj = {
          title: 'Cancel',
          click: (e) => handlerOnButtonClick(e, 'change'),
        };
        content.push(obj);

        const objUpdate = {
          title: 'Update',
          click: (e) => handlerOnButtonClick(e, 'update'),
        };
        content.push(objUpdate);
      } else {
        const objUpdate = {
          title: 'Transfer',
          click: (e) => handlerOnTransferClick(e),
        };
        content.push(objUpdate);
      }
      if (!(listingInfo && listingInfo.seller) && blindBoxStatus === BlindBoxStatus.CanOpen && isBlindBox) {
        const objBox = {
          title: 'Open box',
          click: (e) => handlerOpenBlindboxClick(e),
        };
        content.push(objBox);
      }
      if (handlerOnForkClick) {
        const objUpdate = {
          title: 'Fork',
          click: (e) => handlerOnForkClick(e),
        };
        content.push(objUpdate);
      }
    } else if (listingInfo && listingInfo.seller) {
      const objBuy = {
        title: 'Buy',
        click: (e) => handlerBuyClick(e),
      };
      content.push(objBuy);
    }
    return (
      <Menu className="top-menu">
        {content.map((va, index) => {
          return (
            <Menu.Item
              key={va.title}
              onClick={(e: any) => {
                e.domEvent.stopPropagation();
                va.click(e.domEvent);
              }}
            >
              {va.title}
            </Menu.Item>
          );
        })}
      </Menu>
    );
  };

  return (
    <Dropdown overlay={operationContext()} overlayClassName={'menu-drop'}>
      <img alt="" src={more} onClick={(e) => e.stopPropagation()} />
    </Dropdown>
  );
});
