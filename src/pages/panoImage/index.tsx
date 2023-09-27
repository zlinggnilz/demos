import React, { useRef } from 'react';
import { AutorotatePlugin } from '@photo-sphere-viewer/autorotate-plugin';
import { utils as SphereUtils } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';

import dangerIcon from '@/assets/pano/danger.png';
import enterIcon from '@/assets/pano/enter.png';
import jumpIcon from '@/assets/pano/jump.png';
import p1 from '@/assets/pano/p1.jpg';
import p2 from '@/assets/pano/p2.jpg';
import PhotoSphereViewer from '@/components/PhotoSphereViewer';

import '@photo-sphere-viewer/markers-plugin/index.css';
// import { useNavigate } from 'react-router-dom';

const animatedValues = {
  pitch: { start: -Math.PI / 2, end: 0.2 },
  yaw: { start: Math.PI, end: 0 },
  zoom: { start: 0, end: 50 },
  fisheye: { start: 2, end: 0 },
};

const p1_markers = [
  {
    id: 'p1_door',
    imageLayer: enterIcon,
    size: { width: 56, height: 56 },
    position: { textureX: 2654, textureY: 1095 },
    // position: { yaw: '0.9346041636673994deg', pitch: '-0.045631498852262364deg' },
    tooltip: 'test2',
  },
  {
    id: 'window',
    imageLayer: dangerIcon,
    size: { width: 56, height: 56 },
    position: { textureX: 2170, textureY: 988 },
    tooltip: 'test1',
  },
];

const p2_markers = [
  {
    id: 'p2_out',
    imageLayer: jumpIcon,
    size: { width: 100, height: 100 },
    position: { textureX: 1380, textureY: 515 },
    // position: { yaw: '0.4637758146992498deg', pitch: '0.18389220691619945deg' },
    tooltip: 'click',
  },
];

function PanoImage() {
  // const navigate = useNavigate();

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
    const markersPlugin = viewer.getPlugin(MarkersPlugin);
    console.log('🚀 ~ file: index.tsx:71 ~ handleReady ~ markersPlugin:', markersPlugin);
    markersPlugin?.addEventListener?.('select-marker', ({ marker, doubleClick, rightClick }) => {
      console.log('-----', marker);
      let mks: any[] = [];
      let cp = '';
      if (marker.id === 'p1_door') {
        // navigate('/panoImage/cube')
        cp = p2;
        mks = p2_markers;
      } else if (marker.id === 'p2_out') {
        cp = p1;
        mks = p1_markers;
      } else {
        return;
      }
      markersPlugin.clearMarkers();
      viewer.setPanorama(cp, { position: { yaw: 0, pitch: 0 } }).then(() => {
        mks.forEach((item) => {
          markersPlugin.addMarker(item);
        });
      });
    });
  };

  const plugins = [
    [
      MarkersPlugin,
      {
        markers: p1_markers,
      },
    ],
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
    console.log(data, [data.data.yaw, data.data.pitch]);
  };

  return (
    <PhotoSphereViewer
      ref={psRef}
      options={{
        panorama: p1,
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

export default PanoImage;
