import React, { memo, useState } from 'react';
import { Button, Modal } from 'antd';
import PubSub from 'pubsub-js';
import { ShowAuthDrawer } from '@/message';
import CompleteForm from './complete-form';
import { userHooks } from '@/components/hooks';

function CanvasFinish(props) {
  const [finishVisible, setFinishVisible] = useState(false);
  const { isAuth } = userHooks();

  const showFinishModal = () => {
    if (!isAuth) PubSub.publish(ShowAuthDrawer, {});
    else setFinishVisible(true);
  };

  const cancelFinishModal = () => {
    setFinishVisible(false);
  };

  const getFinishContent = () => {
    return (
      <div>
        <Button
          className="ant-btn-black"
          style={{ width: '90px', height: '33px', borderRadius: '6px', fontSize: '14px', fontFamily: 'Poppins-Medium, Poppins', fontWeight: 500, lineHeight: '23px' }}
          onClick={showFinishModal}
        >
          Finish
        </Button>

        <Modal visible={finishVisible} width={800} centered footer={null} closable={false} title={'Mint progress'}>
          <div style={{ height: '75vh', overflow: 'scroll' }}>
            <CompleteForm modalClose={cancelFinishModal} {...props} />
          </div>
        </Modal>
      </div>
    );
  };
  return getFinishContent();
}
export default memo(CanvasFinish);
