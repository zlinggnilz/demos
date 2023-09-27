import React from 'react';
import { AutorotatePlugin, MarkersPlugin, ReactPhotoSphereViewer } from 'react-photo-sphere-viewer';
import { utils as SphereUtils } from '@photo-sphere-viewer/core';

// import ballBlue from '@/assets/pano/ball-blue.png';
import dangerIcon from '@/assets/pano/danger.png';
import enterIcon from '@/assets/pano/enter.png';
import p1 from '@/assets/pano/p1.jpg';
import p2 from '@/assets/pano/p2.jpg';
import { getDeg } from '@/utils/pano';

const l_1 = getDeg(954, 783, 4096, 2048);
// const l_2 = getDeg(33, 579, 2400, 1200)

const animatedValues = {
  pitch: { start: -Math.PI / 2, end: 0.2 },
  yaw: { start: Math.PI, end: 0 },
  zoom: { start: 0, end: 50 },
  fisheye: { start: 2, end: 0 },
};

function PanoImage() {
  const psRef = React.createRef<any>();

  const handleReady = () => {
    const autorotate = psRef.current.getPlugin(AutorotatePlugin);
    autorotate.stop();

    new SphereUtils.Animation({
      properties: animatedValues,
      duration: 1500,
      easing: 'inOutQuad',
      onTick: (properties) => {
        psRef.current.setOption('fisheye', properties.fisheye);
        psRef.current.rotate({ yaw: properties.yaw, pitch: properties.pitch });
        psRef.current.zoom(properties.zoom);
      },
    });
  };

  const plugins = [
    [
      MarkersPlugin,
      {
        // list of markers
        markers: [
          {
            id: 'image',
            position: { textureX: 2654, textureY: 1095 },
            image: enterIcon,
            anchor: 'bottom center',
            size: { width: 48, height: 32 },
            tooltip: 'test2',
          },
          {
            id: 'imageLayer',
            imageLayer: dangerIcon,
            size: { width: 48, height: 48 },
            position: { textureX: 2170, textureY: 988 },
            tooltip: 'test1',
          },
        ],
      },
    ],
    // [
    //   AutorotatePlugin,
    //   {
    //     autostartDelay: null,
    //     autostartOnIdle: false,
    //     autorotatePitch: animatedValues.pitch.end,
    //   },
    // ],
  ];

  const handleClick = (data) => {
    console.log(data);
  };

  return (
    <ReactPhotoSphereViewer
      ref={psRef}
      src={p1}
      height={'100%'}
      width={'100%'}
      littlePlanet={false}
      onClick={handleClick}
      navbar={false}
      defaultPitch={animatedValues.pitch.start}
      defaultYaw={animatedValues.yaw.start}
      defaultZoomLvl={animatedValues.zoom.start}
      fisheye={animatedValues.fisheye.start}
      onReady={handleReady}
      plugins={plugins}
    />
  );
}

export default PanoImage;
