import React, { useState } from 'react';
import './style.less';
import Upload from '@/assets/images/create/upload_picture.svg';
import UploadBg from '@/assets/images/create/upload_bg.svg';
import CreateCollectionBg from '@/assets/images/create/create_collection_bg.svg';
import CreateCollection from '@/assets/images/create/create_collection.svg';
import PubSub from 'pubsub-js';
import { CloseDialog } from '@/message';
import { Modal } from 'antd';
import CreateCanvasForm from './create-canvas-form';

const CreateAll = (props) => {
  const { type } = props;
  const [createVisible, setCreateVisible] = useState(false);
  const handlerClose = () => {
    if (createVisible) return;
    PubSub.publish(CloseDialog, {});
  };

  const createItems = [
    {
      icon: Upload,
      bg: UploadBg,
      title: 'Upload Directly',
      key: `#/create/nft/${type || ''}`,
      onClick: () => {
        handlerClose();
      },
    },
    {
      icon: CreateCollection,
      bg: CreateCollectionBg,
      title: 'New Collection Builder',
      key: `#/create/collection`,
      onClick: () => {
        handlerClose();
      },
    },
  ];

  return (
    <div className="transparent-bg" onClick={handlerClose}>
      <div className="create-all-type-wrapper" onClick={(e) => e.stopPropagation()}>
        <div className="title ">Create</div>
        <div className="item-layout">
          {createItems.map((item, index) => {
            return (
              <a href={item.key} className="create-item" style={{ backgroundImage: `url(${item.bg})` }} key={index} onClick={item.onClick}>
                <div className="avatar-content">
                  <img alt="" src={item.icon}></img>
                </div>
                <div className="title title-000 title-layout">{item.title}</div>
              </a>
            );
          })}
        </div>
      </div>
      <Modal visible={createVisible} width={800} centered footer={null} closable={false} title={'Artwork Information'}>
        <CreateCanvasForm setCreateVisible={setCreateVisible} />
      </Modal>
    </div>
  );
};

export default CreateAll;
