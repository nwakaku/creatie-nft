import React, { memo, useRef, useEffect, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { getCanvasWidth, AloneCreate } from '@/constants';
import PixelThumb from '@/components/pixel-thumb';
import PlayIcon from '@/assets/images/market/m1155/play.svg';
import CanvasHeatMap from '@/components/heatmap';
import VideoPlayer from '@/components/video-player';
import './style.less';

function CanvasPictureInfo(props) {
  // canvas index
  const tokenIndex = parseInt(props.index);
  const type = props.type;
  // id,cansiterid
  const canvasPrinId = props.prinId;
  const CanvasWidth = getCanvasWidth(type);
  const isAlone = () => {
    return type === AloneCreate;
  };
  const pixParent = useRef();
  const thumbParent = useRef();

  const [scale, setScale] = useState(1);
  const [thumbScale, setThumbScale] = useState(1);
  const allThumbTypes = ['thumb', 'heatmap', 'video'];
  const [thumbType, setThumbType] = useState(allThumbTypes[0]);

  const { canvasInfo } = useSelector((state) => {
    let key1 = `canvasInfo-${type}-${canvasPrinId}`;
    let canvasInfo = (state.allcavans && state.allcavans.getIn([key1])) || {};
    return {
      canvasInfo: canvasInfo,
    };
  }, shallowEqual);

  const addListener = () => {
    window.addEventListener('resize', onWindowResize);
    onWindowResize();
  };
  const removeListener = () => {
    window.removeEventListener('resize', onWindowResize);
  };

  const onWindowResize = () => {
    pixParent && pixParent.current && setScale(pixParent.current.clientWidth / CanvasWidth);
    thumbParent && thumbParent.current && setThumbScale((thumbParent.current.clientHeight - 28) / CanvasWidth);
  };

  useEffect(() => {
    addListener();
    onWindowResize();
    return () => {
      removeListener();
    };
  }, []);

  return (
    <div className="canvas-thv-wrapper">
      <div className="canvas-pixel" ref={pixParent}>
        {thumbType === allThumbTypes[0] && canvasPrinId && <PixelThumb scale={scale / 2} width={CanvasWidth * 2} prinId={canvasPrinId} type={type} canvasInfo={canvasInfo} />}
        {thumbType === allThumbTypes[1] && !isAlone() && (
          <div className="heatmap" style={{ transform: `translate(-50%, -50%) scale(${scale})`, width: `${CanvasWidth}px`, height: `${CanvasWidth}px` }}>
            <CanvasHeatMap showWidth={CanvasWidth} heatMapShow={thumbType === allThumbTypes[1]} multiple={1} emptyWidth={0} canvasInfo={canvasInfo} prinId={canvasPrinId} type={type} />
          </div>
        )}
        {thumbType === allThumbTypes[2] && !isAlone() && <VideoPlayer src={canvasInfo ? canvasInfo.videoLink : ''} controls={true} />}
      </div>
      {!isAlone() && (
        <div className="thumb-list" ref={thumbParent}>
          {canvasPrinId && (
            <div className={thumbType === allThumbTypes[0] ? 'select-frame' : 'empty-frame'}>
              <div
                className="canvas-parent"
                onClick={() => {
                  setThumbType(allThumbTypes[0]);
                }}
              >
                <PixelThumb scale={thumbScale} prinId={canvasPrinId} type={type} canvasInfo={canvasInfo} />
              </div>
            </div>
          )}

          <div className={thumbType === allThumbTypes[1] ? 'select-frame' : 'empty-frame'}>
            <div
              className="heatmap-thumb"
              onClick={() => {
                setThumbType(allThumbTypes[1]);
              }}
            >
              <div className="thumb" style={{ transform: `scale(${thumbScale})` }}>
                <CanvasHeatMap
                  showWidth={CanvasWidth}
                  heatMapShow={true}
                  multiple={1}
                  emptyWidth={0}
                  canvasInfo={canvasInfo}
                  prinId={canvasPrinId}
                  type={type}
                  onClick={() => {
                    setThumbType(allThumbTypes[1]);
                  }}
                />
              </div>
            </div>
          </div>

          {canvasInfo.canisterId && (
            <div className={thumbType === allThumbTypes[2] ? 'select-frame' : 'empty-frame'}>
              <div
                className="canvas-parent"
                onClick={() => {
                  if (canvasInfo && canvasInfo.videoLink) setThumbType(allThumbTypes[2]);
                  else {
                    console.log('video error ', canvasInfo);
                  }
                }}
              >
                <PixelThumb scale={thumbScale} prinId={canvasPrinId} type={type} canvasInfo={canvasInfo} />
                <img alt="" src={PlayIcon}></img>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(CanvasPictureInfo);
