import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, message, Select, InputNumber, Switch, DatePicker, Radio } from 'antd';
import Unknown from '@/assets/images/icon/unknown.svg';
import './style.less';
import { base64toBuff, getValueDivide8, getValueMultiplied8 } from '@/utils/utils';
import Toast from '@/components/toast';
import { requestCanister } from '@/api/handler';
import { createCollection, checkProjectName, getCreateFactorySettingConfig } from '@/api/createHandler';
import { useHistory } from 'react-router-dom';
import PubSub from 'pubsub-js';
import { ShowAuthDrawer } from '@/message';
import { useDispatch } from 'react-redux';
import { getCreateCollectionByUser } from '@/pages/home/store/actions';
import lauDefault from '@/assets/images/launchpad/lau-default.png';
import ConfirmModal from '@/components/confirm-modal';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import { userHooks } from '@/components/hooks';

const layout = {
  labelCol: {
    span: 2,
  },
  wrapperCol: {
    span: 14,
  },
};

const validateMessages = {
  required: '${label} is required!',
  types: {
    email: '${label} is not a valid email!',
    number: '${label} is not a valid number!',
  },
  number: {
    range: '${label} must be between ${min} and ${max}',
  },
};
/* eslint-enable no-template-curly-in-string */

const CreateCollection = (props) => {
  const { prinId } = props;
  const history = useHistory();
  const dispatch = useDispatch();
  const collectionForm = React.useRef();
  const [logo, setLogo] = useState(null);
  const [featured, setFeatured] = useState(null);
  const [banner, setBanner] = useState(null);
  const [config, setConfig] = useState({
    maxSupply: 10000,
    maxRoyaltyRatio: 50,
    maxForkRoyaltyRatio: 75,
    maxForkFee: 20000000n, //
    maxNameSize: 20, //
    maxDescSize: 2000, //
    maxCategorySize: 20,
    createFee: 100000000n,
  });
  const [submitEnable, setSubmitEnable] = useState(false);
  const [confrimVisible, setConfirmVisible] = useState(false);
  const [forkable, setForkable] = useState(false);
  const [whiteListType, setWhiteListType] = useState(0);

  const { isAuth, authToken } = userHooks();

  useEffect(() => {
    requestCanister(
      getCreateFactorySettingConfig,
      {
        success: (res) => {
          setConfig(res);
        },
      },
      false,
    );
  }, []);

  const confirmFunc = () => {
    const values = collectionForm?.current?.getFieldsValue();
    console.log('confirmFunc ', values);
    let notice = Toast.loading('In process, please wait', 0);
    let data = {
      success: (res) => {
        console.log('res', res);
        dispatch(getCreateCollectionByUser(authToken));
        message.success('success');
        history.replace('/assets/wallet/createCollections');
      },
      error: (res) => {
        message.error(res);
      },
      fail: (res) => {
        message.error(res);
      },
      notice,
    };
    data.forkable = forkable;
    data.param = {};
    data.param.featured = featured ? base64toBuff(featured) : [];
    data.param.logo = logo ? base64toBuff(logo) : [];
    data.param.banner = banner ? base64toBuff(banner) : [];
    data.param.totalSupply = values.totalSupply || parseInt(config.maxSupply);
    if (forkable) {
      data.param.forkRoyaltyRatio = (values.forkRoyaltyRatio || 0) * 10;
      data.param.forkFee = parseInt(getValueMultiplied8(values.forkFee || 0));
      data.param.whiteListType = whiteListType;
      data.param.whiteListPrice = whiteListType === 1 && values.whiteListPrice ? [parseInt(getValueMultiplied8(values.whiteListPrice))] : whiteListType === 1 ? [0] : [];
      let start = values.timeline[0]?.valueOf();
      let end = values.timeline[1]?.valueOf();
      data.param.startline = parseInt(new BigNumber(start).multipliedBy(1000000));
      data.param.deadline = parseInt(new BigNumber(end).multipliedBy(1000000));
    } else {
      data.param.royaltyRatio = (values.royaltyRatio || 0) * 10;
    }
    data.param.contentInfo = {};
    for (let key in values.contentInfo) {
      if (key === 'twitter' || key === 'webLink' || key === 'discord' || key === 'medium') {
        let res = values.contentInfo[key];
        if (res) {
          if (key === 'twitter') {
            if (!res.startsWith('https://twitter.com') && !res.startsWith('https://')) res = `https://twitter.com/${res}`;
          }
          if (!res.startsWith('https://')) res = `https://${res}`;
          data.param.contentInfo[key] = [res];
        } else data.param.contentInfo[key] = [];
      } else data.param.contentInfo[key] = values.contentInfo[key] || '';
    }
    console.log('onFinish ', data);
    requestCanister(createCollection, data);
  };
  const onFinish = (values) => {
    if (!isAuth) {
      PubSub.publish(ShowAuthDrawer, {});
      return;
    }

    setConfirmVisible(true);
  };

  const beforeUpload = (file, type) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error({ content: 'The file must be image' });
      return Upload.LIST_IGNORE;
    }
    const allTypes = {
      logo: { size: 250, info: 'The file size cannot exceed 250k' },
      featured: { size: 650, info: 'The file size cannot exceed 650k' },
      banner: { size: 1024, info: 'The file size cannot exceed 1M' },
    };
    const size = file.size / 1024;
    if (size > allTypes[type].size) {
      message.error({ content: allTypes[type].info });
      return Upload.LIST_IGNORE;
    }
  };

  const normFile = (e) => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  function getBase64(img, callback) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  }

  const handleSelectImage = (info, func, field) => {
    const { fileList } = info;
    const file = fileList[fileList.length - 1];
    if (file?.originFileObj) {
      // Get this url from response in real world.
      getBase64(file?.originFileObj, async (imageUrl) => {
        func && func(imageUrl);
        if (field) {
          const value = {};
          value[field] = await file.originFileObj.arrayBuffer();
          collectionForm?.current?.setFieldsValue(value);
        }
      });
    }
  };

  const checkValidateProjectName = async (rules, value) => {
    if (!value) {
      return Promise.reject(new Error('Name is Empty'));
    }
    let res = await checkProjectName({ name: value });
    if (res) {
      return Promise.reject(new Error('Name already exit'));
    } else {
      return Promise.resolve();
    }
  };

  const onFieldsChange = () => {
    const fieldsValue = collectionForm?.current?.getFieldsValue();
    const required = ['logo1', 'featured1', 'banner1', 'contentInfo'];
    if (forkable) {
      required.push('forkRoyaltyRatio');
      required.push('timeline');
      required.push('forkFee');
    } else {
      required.push('royaltyRatio');
    }
    const required1 = ['name', 'category', 'desc'];
    const errArr = Object.keys(fieldsValue).filter((item) => {
      let index = required.indexOf(item);
      if (index !== -1) {
        if (!fieldsValue[item]) {
          return true;
        }
        if (item === 'contentInfo') {
          for (let key of required1) {
            if (!fieldsValue['contentInfo'][key]) return true;
          }
        }
      }
    });
    setSubmitEnable(errArr.length > 0 ? false : true);
  };

  useEffect(() => {
    onFieldsChange();
  }, [forkable]);

  const onHandleChangeFork = (res) => {
    setForkable(res);
  };

  return (
    <Form className="create-collection-wrapper" {...layout} name="nest-messages" onFinish={onFinish} validateMessages={validateMessages} ref={collectionForm} onFieldsChange={onFieldsChange}>
      <h2>{prinId ? 'Edit My Collection' : 'Create a Collection'}</h2>
      <div className="required-field tip">Required fields</div>

      <div className="required-field title margin-10">Collection Logo</div>
      <div className="tip margin-10">This image will also be used for navigation. 350 x 350 recommended.</div>
      <Form.Item name="logo" className="margin-10">
        <Form.Item rules={[{ required: true }]} name="logo1" valuePropName="fileList" getValueFromEvent={normFile} noStyle>
          <Upload.Dragger accept="image/*" beforeUpload={(file) => beforeUpload(file, 'logo')} showUploadList={false} onChange={(info) => handleSelectImage(info, setLogo, 'logo')}>
            {logo ? (
              <div className="picture logo">
                <img alt="" src={logo} className="select-image"></img>
                <div className="mask-inner" />
              </div>
            ) : (
              <div className="picture logo">
                <div className="mask-bg radius-50" />
                <img alt="" src={Unknown} className="default"></img>
              </div>
            )}
          </Upload.Dragger>
        </Form.Item>
      </Form.Item>

      <div className="required-field title margin-40">Featured image</div>
      <div className="tip margin-10">This image will be used for featuring your collection on the homepage, category pages, or other promotional areas of Dcreate. 504x504 recommended.</div>
      <Form.Item name="featured" className="margin-10">
        <Form.Item rules={[{ required: true }]} name="featured1" valuePropName="fileList" getValueFromEvent={normFile} noStyle>
          <Upload.Dragger accept="image/*" beforeUpload={(file) => beforeUpload(file, 'featured')} showUploadList={false} onChange={(info) => handleSelectImage(info, setFeatured, 'featured')}>
            {featured ? (
              <div className="picture featured">
                <img alt="" src={featured} className="select-image"></img>
                <div className="mask-inner" />
              </div>
            ) : (
              <div className="picture featured">
                <div className="mask-bg" />
                <img alt="" src={Unknown} className="default"></img>
              </div>
            )}
          </Upload.Dragger>
        </Form.Item>
      </Form.Item>

      <div className="required-field title margin-40">Featured image</div>
      <div className="tip margin-10">
        This image will appear at the top of your collection page. Avoid including too much text in this banner image, as the dimensions change on different devices. 1920 x 220 recommended.
      </div>
      <Form.Item name="banner" className="margin-10">
        <Form.Item rules={[{ required: true }]} name="banner1" valuePropName="fileList" getValueFromEvent={normFile} noStyle>
          <Upload.Dragger accept="image/*" beforeUpload={(file) => beforeUpload(file, 'banner')} showUploadList={false} onChange={(info) => handleSelectImage(info, setBanner, 'banner')}>
            {banner ? (
              <div className="picture banner">
                <img alt="" src={banner} className="select-image"></img>
                <div className="mask-inner" />
              </div>
            ) : (
              <div className="picture banner">
                <div className="mask-bg" />
                <img alt="" src={Unknown} className="default"></img>
              </div>
            )}
          </Upload.Dragger>
        </Form.Item>
      </Form.Item>

      <div className="required-field title margin-40">Name</div>
      <Form.Item className="margin-10" name={['contentInfo', 'name']} rules={[{ required: true, validator: checkValidateProjectName }]}>
        <Input showCount maxLength={parseInt(config.maxNameSize)} />
      </Form.Item>

      <div className="required-field title margin-40">Description</div>
      <Form.Item className="margin-10" rules={[{ required: true }]} name={['contentInfo', 'desc']}>
        <Input.TextArea showCount maxLength={parseInt(config.maxDescSize)} />
      </Form.Item>

      <div className="required-field title margin-40">Category</div>
      <div className="tip margin-10">Adding a category will help make your item discoverable on Dcreate</div>
      <Form.Item className="margin-10" name={['contentInfo', 'category']} rules={[{ required: true }]}>
        <Select dropdownClassName="create-dropdown" placeholder="Add category" suffixIcon={<img alt="" src={lauDefault} />}>
          <Select.Option value="art">Art</Select.Option>
          <Select.Option value="photography">Photography</Select.Option>
          <Select.Option value="collectibles">Collectibles</Select.Option>
          <Select.Option value="music/video">Music/Video</Select.Option>
        </Select>
      </Form.Item>
      <div className="warning margin-10">Once confirmed, it cannot be modified</div>

      <Form.Item className="margin-40" name={['contentInfo', 'webLink']} label="Web Link:" labelAlign="left">
        <Input />
      </Form.Item>
      <Form.Item className="margin-10" name={['contentInfo', 'twitter']} label="Twitter:" labelAlign="left">
        <Input />
      </Form.Item>
      <Form.Item className="margin-10" name={['contentInfo', 'discord']} label="Discord:" labelAlign="left">
        <Input />
      </Form.Item>
      <Form.Item className="margin-10" name={['contentInfo', 'medium']} label="Medium:" labelAlign="left">
        <Input />
      </Form.Item>

      <div className="title margin-40">Total Supply</div>
      <div className="tip margin-10"></div>
      <Form.Item className="margin-10" name="totalSupply">
        <InputNumber min={0} max={parseInt(config.maxSupply)} controls={false} precision={0} placeholder="Total supply e.g.1000" addonAfter={`max ${config.maxSupply}`} />
      </Form.Item>

      <div className="title margin-40">Enable Fork</div>
      <div className="tip margin-10">
        After allowing fork, a master artwork NFT must be submitted; note that you will earn transaction fees from all forked versions of this artwork in addition to being included in this collection.
      </div>
      <Switch className="margin-10" checked={forkable} onChange={onHandleChangeFork} />

      {forkable ? (
        <div>
          <div className="required-field title margin-40">Fork Time Frame</div>
          <Form.Item className="margin-10" rules={[{ required: true }]} name="timeline">
            <DatePicker.RangePicker
              style={{ width: '100%' }}
              showTime={{
                hideDisabledOptions: true,
                defaultValue: [moment('00:00:00', 'HH:mm'), moment('23:59:59', 'HH:mm')],
              }}
              placeholder={['Start time', 'End time']}
              format="YYYY-MM-DD HH:mm"
              separator={<span>to</span>}
              bordered={false}
            />
          </Form.Item>
          <div className="required-field title margin-40">Fork Royalty Ratio</div>
          <div className="tip margin-10">Earn a percentage from forks secondary market sale</div>
          <Form.Item className="margin-10" rules={[{ required: true }]} name="forkRoyaltyRatio">
            <InputNumber
              min={0}
              max={parseInt(config.maxForkRoyaltyRatio) / 10}
              controls={false}
              precision={1}
              placeholder="Percentage fork royalty fee e.g.2"
              addonAfter={`max ${parseInt(config.maxForkRoyaltyRatio) / 10}`}
            />
          </Form.Item>
          <div className="required-field title margin-40">Fork Fee</div>
          <div className="tip margin-10">Earn a fee each time any artwork in this collection is forked</div>
          <Form.Item className="margin-10" rules={[{ required: true }]} name="forkFee">
            <InputNumber
              min={0}
              max={parseFloat(getValueDivide8(config.maxForkFee))}
              controls={false}
              precision={4}
              placeholder="Fork fee e.g.0.2"
              addonAfter={`max ${getValueDivide8(config.maxForkFee)} WICP`}
            />
          </Form.Item>
          <div className="title margin-40">Enable WhiteList</div>
          <div className="tip margin-10">Enable WhiteList</div>
          <Radio.Group
            className="margin-10"
            onChange={(e) => {
              setWhiteListType(e.target.value);
            }}
            value={whiteListType}
          >
            <Radio value={0}>No whitelist</Radio>
            <Radio value={1}>Support Whitelist</Radio>
            <Radio value={2}>Only whitelist</Radio>
          </Radio.Group>
          {whiteListType === 1 && (
            <div>
              <div className="required-field title margin-40">Whitelist Fork Fee</div>
              <div className="tip margin-10">Earn a fee each time any artwork in this collection for whitelist is forked</div>
              <Form.Item className="margin-10" name="whiteListPrice">
                <InputNumber
                  min={0}
                  max={parseFloat(getValueDivide8(config.maxForkFee))}
                  controls={false}
                  precision={4}
                  placeholder="Fork fee e.g.0.2"
                  addonAfter={`max ${getValueDivide8(config.maxForkFee)} WICP`}
                />
              </Form.Item>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="required-field title margin-40">Royalty Ratio</div>
          <div className="tip margin-10">Earn a percentage from secondary market sale</div>
          <Form.Item className="margin-10" name="royaltyRatio">
            <InputNumber
              min={0}
              max={parseInt(config.maxRoyaltyRatio) / 10}
              controls={false}
              precision={1}
              placeholder="Percentage fork royalty fee e.g.2"
              addonAfter={`max ${parseInt(config.maxRoyaltyRatio) / 10}`}
            />
          </Form.Item>
        </div>
      )}

      <div className="divider margin-40"></div>

      <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 0 }} className="margin-40">
        <Button type="black" className="btn-normal" htmlType="submit" disabled={!submitEnable}>
          Create Collection
        </Button>
        <div className="required-field warning margin-10">{`Note that you need to pay ${getValueDivide8(config.createFee)} WICP to create a Collection`}</div>
      </Form.Item>
      <ConfirmModal
        style={{
          background: 'rgba(0, 0, 0, 0.8)',
        }}
        title={'Create Collection'}
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
          <div className="tips">{`Are you sure to pay ${getValueDivide8(config.createFee)} WICP to create an artwork? `}</div>
        </>
      </ConfirmModal>
    </Form>
  );
};

export default CreateCollection;
