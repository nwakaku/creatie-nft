import React from 'react';
import { Collapse } from 'antd';
import TipIcon from '@/assets/images/icon/properties.svg';
import { TurtlesCreate, ZombieNFTCreate } from '@/constants';
import './style.less';

const { Panel } = Collapse;

const Properties = (props) => {
  const zombiePart = ['hat', 'head', 'arm', 'leg', 'background'];
  const zombiePartName = ['Hat', 'Head', 'Upper body', 'Lower body', 'Background'];

  const { type, nftInfo, itemConfig } = props;

  const getZombieTotalAttrValue = () => {
    if (!nftInfo) return <></>;
    let attack = 0;
    let defense = 0;
    let agile = 0;
    for (let i = 0; i < zombiePart.length; i++) {
      let info = nftInfo[zombiePart[i]];
      attack += info ? parseInt(info.attack) : 0;
      defense += info ? parseInt(info.defense) : 0;
      agile += info ? parseInt(info.agile) : 0;
    }
    return (
      <div className="zombie-attr-summarize">
        <dl>
          <dt>Attack</dt>
          <dd>{attack}</dd>
        </dl>
        <dl>
          <dt>Defense</dt>
          <dd>{defense}</dd>
        </dl>
        <dl>
          <dt>Agility</dt>
          <dd>{agile}</dd>
        </dl>
      </div>
    );
  };
  const getZombieAttrBox = () => {
    if (!nftInfo) return;
    let comp = zombiePart.map((item, index) => {
      let info = nftInfo[item];
      let level;
      if (info)
        for (let key in info.level) {
          if (key) {
            level = key;
            break;
          }
        }
      return (
        <dl key={index}>
          <dt>{zombiePartName[index]}</dt>
          {info && <dd>{`Name: ${info.name}`}</dd>}
          {info && <dd>{`Level: ${level}`}</dd>}
          {info && <dd>{`RarityScore: ${info.rarityScore}`}</dd>}
        </dl>
      );
    });
    return comp;
  };

  const getTurtlesAttrBox = () => {
    let name = {
      attack: 'Attack',
      defense: 'Defense',
      special_attack: 'Special attack',
      special_defense: 'Special defense',
      intelligence: 'Intelligence',
      agility: 'Agility',
    };
    if (nftInfo && nftInfo.length > 1) {
      let comp = [];
      nftInfo[1].map((item, index) => {
        return (
          <dl key={index}>
            <dt>{name[item[0]]}</dt>
            <dd>value: {parseInt(item[1])}</dd>
          </dl>
        );
      });
      return comp;
    }
  };

  const getCommonAttrBox = () => {
    let comp;
    if (nftInfo) {
      if (nftInfo.attrArr) {
        comp = nftInfo.attrArr.map((attr, index) => {
          return (
            <dl key={index}>
              <dt>{attr.traitType}</dt>
              {itemConfig && <dd>{attr.rarity ? `Name: ${attr.name}` : attr.name}</dd>}
              {itemConfig && attr.rarity && <dd>{`${itemConfig.attrName || 'RarityScore'}: ${attr.rarity}${itemConfig.attrValueAdd || ''}`}</dd>}
            </dl>
          );
        });
      } else {
        comp = [];
        for (let key in nftInfo) {
          if (nftInfo[key] && nftInfo[key].name) {
            let title = key.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
            comp.push(
              <dl key={key}>
                <dt>{title}</dt>
                {itemConfig && <dd>{nftInfo[key].rarity ? `Name: ${nftInfo[key].name}` : nftInfo[key].name}</dd>}
                {itemConfig && nftInfo[key].rarity && <dd>{`${itemConfig.attrName || 'RarityScore'}: ${nftInfo[key].rarity}${itemConfig.attrValueAdd || ''}`}</dd>}
              </dl>,
            );
          }
        }
      }
    }
    return comp;
  };

  const getAttrBox = () => {
    if (type === TurtlesCreate) {
      return getTurtlesAttrBox();
    } else if (type === ZombieNFTCreate) {
      return getZombieAttrBox();
    } else {
      return getCommonAttrBox();
    }
  };

  const attrBox = getAttrBox();

  return type === ZombieNFTCreate || (attrBox && attrBox.length > 0) ? (
    <div className="properties ">
      <Collapse className="box-shadow" bordered={false} defaultActiveKey={['1']} expandIconPosition="end">
        <Panel
          className="collapse-panel"
          header={
            <span className="collapse-panel-header title title-000">
              <img src={TipIcon} /> Properties
            </span>
          }
          key="0"
        >
          {type === ZombieNFTCreate && getZombieTotalAttrValue()}
          <div className="list">{attrBox}</div>
        </Panel>
      </Collapse>
    </div>
  ) : (
    <></>
  );
};

export default Properties;
