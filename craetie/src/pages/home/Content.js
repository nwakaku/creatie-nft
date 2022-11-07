import React, { useEffect } from 'react';
import { Layout, Button } from 'antd';
import { useHistory } from 'react-router-dom';
import { listHomeData, listTopCollections } from './store/actions';
import Img from './Img';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import TopList from './TopList';
import Vision from '@/assets/images/vision.png';
import { useViewport } from '@/components/hooks';
import { POPULAR_ALONE_CANVAS, POPULAR_COLLECTIBLES, HOME_BANNER_AD } from './store/constants';
import Dialog from '@/components/dialog';
import CreateAll from '@/pages/create/view/create-all';

const { Content } = Layout;

export default React.memo(() => {
  const history = useHistory();
  const dispatch = useDispatch();
  useEffect(async () => {
    dispatch(listHomeData(POPULAR_ALONE_CANVAS));
    dispatch(listHomeData(POPULAR_COLLECTIBLES));
    dispatch(listHomeData(HOME_BANNER_AD));
    dispatch(listTopCollections());
  }, []);

  const headerImg = {
    image_url: 'https://i7o7s-yyaaa-aaaah-qcwda-cai.raw.ic0.app/token/2018',
    type: 'avocado',
    index: 2018,
    cid: 'i7o7s-yyaaa-aaaah-qcwda-cai',
    owner_pid: 'zphcx-gjyuf-nfrjb-4nxyh-un7ec-33ljz-2zvec-hiuc3-nqrm4-ccfwx-5ae',
    name: 'Avocado Research#2018',
    owner_avatar_url: '',
  };

  const { imgList, result, homeBannner, CollectiblesData } = useSelector((state) => {
    let res = state.allcavans.getIn([POPULAR_ALONE_CANVAS]);
    return {
      headerImg: res?.data[0] || {},
      imgList: res?.data.slice(1),
      result: (state.allcavans.getIn(['topCollectibles'])?.results || []).map((item) => {
        return { ...item };
      }),
      homeBannner: state.allcavans.getIn([HOME_BANNER_AD]),
      CollectiblesData: state.allcavans.getIn([POPULAR_COLLECTIBLES]),
    };
  }, shallowEqual);

  const jumpToDetail = (item) => {
    if (item.link) history.push(item.link);
    else history.push(`/collection/${item.project}/items`);
  };

  const { width } = useViewport();
  const breakpoint = 1200;
  return (
    <Content className="home-content">
      <div className="header" style={{ backgroundImage: `url(${headerImg.image_url})` }}></div>
      <div className="home-mainContent">
        <div className="header-content">
          <div className="left">
            <div className="left-title">
              <>Create, Discover, collect and</>
              <span className="title-sell">sell collectibles in Web3.</span>
            </div>
            <p className="left-text">Dcreate: Create, Trade & Earn.</p>
            <div>
              <Button className="dc-confirm-btn" onClick={() => history.push(`/marketplace`)}>
                Explore
              </Button>
              <Button className="dc-cancel-btn" style={{ marginLeft: '40px' }} onClick={() => Dialog.createAndShowDialog(<CreateAll />, 0)}>
                Create
              </Button>
            </div>
          </div>
          <div className="right">
            <Img item={headerImg} className={'headerImg'} type={'showHeader'} />
          </div>
        </div>
        <div className="content">
          {/* {homeBannner && homeBannner.length > 0 && (
            <div className="banner">
              {
                <Carousel autoplay effect="fade">
                  {homeBannner.map((item, index) => {
                    return (
                      <div key={index} style={{ width: '100%', height: 'fit-content' }}>
                        <img
                          src={item.image_url}
                          onClick={() => jumpToDetail(item)}
                          style={{
                            objectFit: 'cover',
                            width: '100%',
                            height: '100%',
                            borderRadius: '10px',
                          }}
                        ></img>
                      </div>
                    );
                  })}
                </Carousel>
              }
            </div>
          )} */}
          <div className="art-work">
            <TopList title={'Top collections over'} data={result || []} width={width} />
          </div>
          <div className="dc-png">
            <p className="title">
              <span>Connector Between Creators & Web3</span>
            </p>
            <div className="img">
              <img alt="" src={Vision} />
            </div>
          </div>
        </div>
      </div>
    </Content>
  );
});
