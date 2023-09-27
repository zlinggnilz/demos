import React from 'react';
import { CubemapAdapter } from '@photo-sphere-viewer/cubemap-adapter';

import PhotoSphereViewer from '@/components/PhotoSphereViewer';
import { publicPath } from '@/constant';

const imgPath = publicPath + 'cube/';

function PanoCube() {
  const psRef = React.createRef<any>();

  return (
    <PhotoSphereViewer
      ref={psRef}
      options={{
        adapter: CubemapAdapter,
        panorama: {
          left: imgPath + 'tile_1.jpg',
          front: imgPath + 'tile_6.jpg',
          right: imgPath + 'tile_2.jpg',
          back: imgPath + 'tile_5.jpg',
          top: imgPath + 'tile_3.jpg',
          bottom: imgPath + 'tile_4.jpg',
        },
        size: {
          height: '100%',
          width: '100%',
        },
        navbar: false,
      }}
    />
  );
}

export default PanoCube;
