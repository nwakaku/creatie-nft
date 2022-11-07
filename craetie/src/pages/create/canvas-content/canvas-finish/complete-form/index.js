import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, message, Select, Switch } from 'antd';
import './style.less';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import PubSub from 'pubsub-js';
import { ShowAuthDrawer } from '@/message';
import { getValueDivide8, multiBigNumber } from '@/utils/utils';
import { getAllCreateCollection, getCreateCollectionSettings, getCreateNFTMetaDataByIndex } from '@/pages/home/store/actions';
import Toast from '@/components/toast';
import { createNewNFT } from '@/api/createHandler';
import { useHistory } from 'react-router-dom';
import { Principal } from '@dfinity/principal';
import lauDefault from '@/assets/images/launchpad/lau-default.png';
import { plusBigNumber } from '@/utils/utils';
import ConfirmModal from '@/components/confirm-modal';
import { userHooks } from '@/components/hooks';
import ShareNft from '../share-nft';
import Dialog from '@/components/dialog';
import { find } from 'lodash-es';
import BigNumber from 'bignumber.js';

const Jimp = require('jimp').default;

const CompleteForm = (props) => {
  const { originImage } = props;
  const layout = {
    labelCol: {
      span: 4,
    },
    wrapperCol: {
      span: 24,
    },
  };

  const validateMessages = {
    required: '${label} is required!',
    number: {
      range: '${label} must be between ${min} and ${max}',
    },
  };
  const history = useHistory();
  const dispatch = useDispatch();
  const [loading] = useState(false);
  const newNFTForm = React.useRef();
  const [confrimVisible, setConfirmVisible] = useState(false);
  const defaultConfig = {
    forkRoyaltyRatio: 0,
    maxDescSize: 2000,
    totalSupply: 5000,
    uploadProtocolBaseFee: 10000000n,
    uploadProtocolFeeRatio: 1,
    maxRoyaltyRatio: 30,
    maxAttrNum: 20,
    maxNameSize: 20,
    maxCategorySize: 20,
    marketFeeRatio: 1,
    newItemForkFee: 0,
    mutablePhotoLink: [],
    isWhiteList: false,
    whiteListType: 0,
    whiteListPrice: [],
  };
  const [forkable, setForkable] = useState(true);
  const [submitEnable, setSubmitEnable] = useState(false);
  const isFork = props.forkIndex !== undefined;
  const { isAuth, authToken, allCreateCollection, wicpBalance } = userHooks();

  const { config, forkCollection, createNFTInfo } = useSelector((state) => {
    const forkCollection = find(allCreateCollection, { key: props.type });
    const createNFTInfo = isFork && state.allcavans && state.allcavans.getIn([`createNFT-${props.type}-${props.forkIndex}`]);
    return {
      forkCollection,
      createNFTInfo,
      config: state.allcavans.getIn([`artCollectionConfig-${props.type}`]) || defaultConfig,
    };
  }, shallowEqual);

  useEffect(() => {
    dispatch(getAllCreateCollection());
  }, []);

  useEffect(() => {
    if (isFork && props.type) {
      dispatch(getCreateCollectionSettings(props.type));
    }
  }, [isFork]);

  useEffect(() => {
    if (isFork && newNFTForm?.current) {
      newNFTForm?.current.setFieldsValue({
        collection: props.type,
      });
      setSubmitEnable(true);
    }
  }, [newNFTForm?.current]);

  const confirmFunc = () => {
    let needBalance = plusBigNumber(config.uploadProtocolBaseFee, config.isWhiteList && parseInt(config.whiteListType) === 1 ? config.whiteListPrice[0] : config.newItemForkFee || 0);
    if (new BigNumber(wicpBalance).lt(needBalance)) {
      message.error('Insufficient balance');
      return;
    }
    const values = newNFTForm?.current?.getFieldsValue();
    let notice = Toast.loading('In process, please wait', 6 * 60 * 1000, (reason) => {
      if (reason === 'timeout') message.error('Time out, please retry');
    });
    let imageData = props.getCanvasImageData();
    resizeSelectImage(imageData, 500, 500, async (orignData, thumbnailData) => {
      let data = {
        key: values.collection,
        success: (res) => {
          message.success('success');
          imageData = null;
          props.modalClose();
          setConfirmVisible(false);
          Dialog.createAndShowDialog(<ShareNft type={props.type} index={res.ok} />, 0);
        },
        fail: (res) => {
          message.error(res);
        },
        error: (res) => {
          message.error(res);
        },
        notice,
      };
      let attrArr = [];
      if (values.attrArr) {
        for (let item of values.attrArr) {
          if (item.traitType && item.name) {
            attrArr.push(item);
          }
        }
      }
      data['param'] = {
        orignData,
        thumbnailData,
        nftType: 'image/png',
        thumbType: 'image/png',
        desc: values.desc || '',
        name: values.name || '',
        parentToken: props.forkIndex !== undefined ? [parseInt(props.forkIndex)] : [],
        attrArr,
        bFork: forkable,
        earnings: values.earnings * 10 || 20,
        royaltyFeeTo: values.royalty ? Principal.fromText(values.royalty) : Principal.fromText(authToken),
      };
      createNewNFT(data);
    });
  };

  const resizeSelectImage = (buffer, thumbWidth, thumbHeight, callback) => {
    Jimp.read(buffer).then(async (image) => {
      let width = image.bitmap.width;
      let height = image.bitmap.height;
      if (width > thumbWidth || height > thumbHeight) {
        let scale = Math.min(thumbWidth / width, thumbHeight / height);
        width = Math.floor(scale * width);
        height = Math.floor(scale * height);
        callback(await image.getBufferAsync('image/png'), await image.resize(width, height).getBufferAsync('image/png')); // resize
      } else {
        let buffer = await image.getBufferAsync('image/png');
        callback(buffer, buffer);
      }
    });
  };

  const onFinish = (values) => {
    if (!isAuth) {
      PubSub.publish(ShowAuthDrawer, {});
      return;
    }
    setConfirmVisible(true);
  };

  const handleSelectCollection = (value) => {
    if (value === 'create') {
      history.push('/create/collection');
    } else {
      dispatch(getCreateCollectionSettings(value));
    }
  };

  const horizonalLayout = {
    labelCol: {
      span: 6,
    },
    wrapperCol: {
      span: 16,
    },
  };

  const onFieldsChange = () => {
    const fieldsValue = newNFTForm?.current?.getFieldsValue();
    if (fieldsValue) {
      const required = ['collection'];
      const errArr = Object.keys(fieldsValue).filter((item) => {
        let index = required.indexOf(item);
        if (index !== -1) {
          if (!fieldsValue[item]) {
            return true;
          }
        }
      });
      setSubmitEnable(errArr.length > 0 ? false : true);
    }
  };

  const isForkFromNotOwner = config.owner && createNFTInfo?.creator?.toText() && createNFTInfo?.creator?.toText() !== config.owner;
  const getForkTotalCost = () => {
    return getValueDivide8(plusBigNumber(config.uploadProtocolBaseFee, multiBigNumber(config.newItemForkFee || 0, isForkFromNotOwner ? 1.5 : 1)));
  };
  return (
    <Form className="canvas-nft-wrapper" {...layout} name="nest-messages" onFinish={onFinish} ref={newNFTForm} onFieldsChange={onFieldsChange} validateMessages={validateMessages}>
      {!isFork && (
        <Form.Item className="margin-10" label="Name" name="name" rules={[{ required: true }]} labelAlign="left">
          <Input showCount maxLength={parseInt(config.maxNameSize || 20)} />
        </Form.Item>
      )}
      <Form.Item className="margin-10" label="Description" name="desc" labelAlign="left">
        <Input.TextArea showCount maxLength={parseInt(config.maxDescSize || 2000)} placeholder={"Please fill in carefully,Once confirmed,Can't be modified."} />
      </Form.Item>

      {/*  <div className="title margin-40">Add Properties:</div>
      <Form.List name="attrArr">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <div key={key} style={{ width: '100%', display: 'flex', marginTop: 10, alignItems: 'center' }}>
                <Form.Item {...horizonalLayout} {...restField} name={[name, 'traitType']} style={{ width: '35%', alignItems: 'center' }} label="Type" labelAlign="left">
                  <Input maxLength={20} />
                </Form.Item>
                <Form.Item {...horizonalLayout} {...restField} name={[name, 'name']} style={{ width: '35%', alignItems: 'center' }} label="Name" labelAlign="left">
                  <Input maxLength={20} />
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(name)} />
              </div>
            ))}
            <Form.Item className="margin-40">
              <Button
                className="add-button"
                onClick={() => {
                  if (fields.length >= 10) return;
                  add();
                }}
                block
              >
                Add Properties +
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List> */}
      <div className="required-field title margin-40">Collection</div>
      <Form.Item className="margin-10" name="collection" rules={[{ required: true }]}>
        <Select
          dropdownClassName="create-dropdown"
          placeholder="This is the collection where your item will appear"
          loading={loading}
          defaultValue={isFork ? props.type : ''}
          onSelect={handleSelectCollection}
          suffixIcon={<img alt="" src={lauDefault} />}
          disabled={isFork}
        >
          {console.log('forkCollection?.title', forkCollection?.title)}
          {isFork && (
            <Select.Option key={props.type} value={props.type}>
              {forkCollection?.title}
            </Select.Option>
          )}
        </Select>
      </Form.Item>

      <div className="title margin-40">Enable Fork</div>
      <div className="tip margin-10">You can get 50% forkfee if someone fork from your fork.</div>
      <Switch className="margin-10" checked={forkable} onChange={(res) => setForkable(res)} />

      <div>
        <div className="title margin-40">Creator Earnings</div>
        <div className="tip margin-10">Collect a fee when a user re-sells an item you originally created. This is deducted from the final sale price.</div>
        <Form.Item className="margin-10" name="earnings">
          <InputNumber
            min={0}
            max={parseInt(config.maxRoyaltyRatio) / 10}
            controls={false}
            precision={0}
            placeholder="Percentage fee e.g.2"
            defaultValue="2"
            addonAfter={`max ${parseInt(config.maxRoyaltyRatio) / 10}`}
          />
        </Form.Item>

        <div className="title margin-40">Royalty Address</div>
        <div className="tip margin-10">The royalties will be stored in the Principal ID you created on Dcreate</div>
        <Form.Item className="margin-10" name="royalty">
          <Input placeholder="Entre your Principal ID" defaultValue={authToken} />
        </Form.Item>
      </div>
      <div className="divider margin-40"></div>

      <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 0 }} className="margin-40">
        <Button className="dc-cancel-btn" onClick={props.modalClose}>
          Cancel
        </Button>
        <Button className="dc-confirm-btn" htmlType="submit" disabled={!submitEnable} style={{ marginLeft: '40px' }}>
          {isAuth ? 'Create NFT' : 'Connect wallet'}
        </Button>
        <div className="required-field warning margin-10">{`Note that you need to pay ${getForkTotalCost()} WICP to  fork this artwork `}</div>
        <div className="required-field warning ">{` ${getValueDivide8(config.newItemForkFee || 0)} WICP to collection owner`}</div>
        {isForkFromNotOwner && <div className="required-field warning ">{` ${getValueDivide8(multiBigNumber(config.newItemForkFee || 0, 0.5))} WICP to creator of #${props.forkIndex}`}</div>}
        <div className="required-field warning">{` ${getValueDivide8(config.uploadProtocolBaseFee)} WICP for operation cost`}</div>
      </Form.Item>
      <ConfirmModal
        style={{
          background: 'rgba(0, 0, 0, 0.8)',
        }}
        title={'Fork NFT'}
        width={454}
        wrapClassName={'wallet-modal'}
        onModalClose={() => {
          setConfirmVisible(false);
        }}
        btnClass={['dc-cancel-btn', 'dc-confirm-btn']}
        onModalConfirm={confirmFunc}
        modalVisible={confrimVisible}
      >
        <>
          <div className="tips">
            {`${config.isWhiteList && parseInt(config.whiteListType) === 1 ? 'You are in the whitelist, mint for whitelist price!' : ''} Are you sure to pay ${getValueDivide8(
              plusBigNumber(
                config.uploadProtocolBaseFee,
                multiBigNumber(config.isWhiteList && parseInt(config.whiteListType) === 1 ? config.whiteListPrice[0] : config.newItemForkFee || 0, isForkFromNotOwner ? 1.5 : 1),
              ),
            )} WICP to  fork this artwork, ${getValueDivide8(
              config.isWhiteList && parseInt(config.whiteListType) === 1 ? config.whiteListPrice[0] : config.newItemForkFee || 0,
            )} WICP to collection owner, ${isForkFromNotOwner ? `${getValueDivide8(multiBigNumber(config.newItemForkFee || 0, 0.5))} WICP to creator of #${props.forkIndex}, ` : ''}${getValueDivide8(
              config.uploadProtocolBaseFee,
            )} WICP for operation cost`}
          </div>
        </>
      </ConfirmModal>
    </Form>
  );
};

export default CompleteForm;
