import React, { memo, useRef, useEffect, useState } from 'react';
import CanvasHeaderLeft from './canvas-header/header-left';
import CanvasHeaderRight from './canvas-header/header-right';
import './style.less';
import { CCCPaint } from 'ccc-react-paint';
import { getCreateCollectionSettings, getCreateNFTMetaDataByIndex } from '@/pages/home/store/actions';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

const Jimp = require('jimp').default;
function CanvasContent(props) {
  const dispatch = useDispatch();
  const { createType, param1, param2, param3 } = props.match.params;
  const isFork = createType === 'fork';
  const [params] = useState(
    isFork
      ? {
          type: param1,
          forkIndex: param2,
          originImage: decodeURIComponent(param3),
        }
      : { width: param1, height: param2, background: decodeURIComponent(param3) },
  );
  const [showArea, setShowArea] = useState(null);
  const paint = useRef();
  const { mutableLink, createNFTInfo } = useSelector((state) => {
    const config = isFork ? state.allcavans.getIn([`artCollectionConfig-${params.type}`]) || null : null;
    const createNFTInfo = isFork && state.allcavans && state.allcavans.getIn([`createNFT-${params.type}-${params.forkIndex}`]);
    return { mutableLink: config?.mutablePhotoLink || null, createNFTInfo };
  }, shallowEqual);

  useEffect(() => {
    if (isFork && params.type) {
      dispatch(getCreateCollectionSettings(param1));
      if (!createNFTInfo) dispatch(getCreateNFTMetaDataByIndex(params.type, parseInt(params.forkIndex)));
    }
  }, [isFork, params]);

  const getCanvasImageData = () => {
    return paint.current.getCurrentImageData();
  };

  useEffect(() => {
    if (mutableLink?.length) {
      Jimp.read(mutableLink[0]).then((image) => {
        let notEmpty = [];
        for (let i = 0; i < image.bitmap.width; i++) {
          for (let j = 0; j < image.bitmap.height; j++) {
            let colorInt = image.getPixelColor(i, j);
            let color = parseInt(colorInt);
            let string = color.toString(16);
            string = (Array(8).join(0) + string).slice(-8);
            let a = parseInt('0x' + string.slice(6, 8));
            if (a > 0) {
              notEmpty.push([i, j]);
            }
          }
        }
        setShowArea(notEmpty);
      });
    }
  }, [mutableLink]);

  const defaultWrapperContent = (
    <div className="content-detail">
      <div className="paint-wrapper">
        <CCCPaint width={params.width} height={params.height} background={params.background} id="ccc-id" imgSrc={params.originImage} showArea={showArea} ThumbSrc={mutableLink} cRef={paint} />
      </div>
      <CanvasHeaderLeft />
      <CanvasHeaderRight getCanvasImageData={getCanvasImageData} {...params} />
    </div>
  );

  const mainContent = <div className="canvas-content-wrapper">{defaultWrapperContent}</div>;

  return mainContent;
}

export default memo(CanvasContent);
