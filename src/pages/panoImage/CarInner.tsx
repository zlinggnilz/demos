import React from 'react';
import { AutorotatePlugin } from '@photo-sphere-viewer/autorotate-plugin';
import { utils as SphereUtils } from '@photo-sphere-viewer/core';

import car_inner_Img from '@/assets/pano/car_inner.jpg';
import PhotoSphereViewer from '@/components/PhotoSphereViewer';

const animatedValues = {
  pitch: { start: -Math.PI / 2, end: 0.2 },
  yaw: { start: Math.PI, end: 0 },
  zoom: { start: 0, end: 50 },
  fisheye: { start: 2, end: 0 },
};

function CarInner() {
  const psRef = React.createRef<any>();

  const handleReady = (viewer) => {
    const autorotate = psRef.current.getPlugin(AutorotatePlugin);
    autorotate.stop();

    new SphereUtils.Animation({
      properties: animatedValues,
      duration: 1500,
      easing: 'inOutQuad',
      onTick: (properties) => {
        viewer.setOption('fisheye', properties.fisheye);
        viewer.rotate({ yaw: properties.yaw, pitch: properties.pitch });
        viewer.zoom(properties.zoom);
      },
    });
  };

  const plugins = [
    [
      AutorotatePlugin,
      {
        autostartDelay: null,
        autostartOnIdle: false,
        autorotatePitch: animatedValues.pitch.end,
      },
    ],
  ];

  const handleClick = (data) => {
    console.log(data);
  };

  return (
    <PhotoSphereViewer
      ref={psRef}
      options={{
        panorama: car_inner_Img,
        size: {
          height: '100%',
          width: '100%',
        },
        navbar: false,
        defaultPitch: animatedValues.pitch.start,
        defaultYaw: animatedValues.yaw.start,
        defaultZoomLvl: animatedValues.zoom.start,
        fisheye: animatedValues.fisheye.start,
        plugins,
      }}
      onClick={handleClick}
      onReady={handleReady}
    />
  );
}

export default CarInner;
