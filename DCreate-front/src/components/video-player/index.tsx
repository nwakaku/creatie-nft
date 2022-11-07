import React, { MutableRefObject, useEffect, useRef, useState } from 'react';
import Videojs from 'video.js/dist/video.min.js';
import 'video.js/dist/video-js.css';
import './style.less';

interface propsType {
  src: string;
  controls?: boolean;
}

export default React.memo(function VideoPlayer(props: propsType) {
  const [videoId] = useState('custom-video' + +new Date());
  const videoRef: MutableRefObject<any> = useRef();

  useEffect(() => {
    const { src, controls } = props;
    let player = initVideo(src, controls);
    return () => {
      player && player.dispose();
    };
  }, []);

  useEffect(() => {
    if (videoRef && videoRef.current && props.src) {
      videoRef.current.src = props.src;
      videoRef.current.load(); // 1. 先load
      const playPromise = videoRef.current.play(); // 2.再play
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            videoRef?.current?.play();
          })
          .catch(() => {
            videoRef?.current?.pause();
          });
      }
    }
  }, [props.src]);

  const initVideo = (src, controls) => {
    const player = Videojs(
      videoId,
      {
        controls: controls || false,
        preload: 'auto',
        loop: true,
        fluid: false,
      },
      function onPlayerReady() {
        videoRef.current.load();
        let promise = videoRef.current.play();
        if (promise !== undefined) {
          promise.then((res) => {}).catch((error) => {});
        }
      },
    );
    return player;
  };

  return (
    <div className="custom-video-warpper">
      <video id={videoId} className="video-js vjs-big-play-centered" autoPlay={true} ref={videoRef}>
        <source src={props.src} type="video/mp4" />
      </video>
    </div>
  );
});
