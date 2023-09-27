import { memo, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as PANOLENS from 'panolens';
import * as THREE from 'three';

import dangerIcon from '@/assets/pano/danger.png';
import enterIcon from '@/assets/pano/enter.png';
import p1 from '@/assets/pano/p1.jpg';
import p2 from '@/assets/pano/p2.jpg';
import { getLocation, Pano } from '@/utils/pano';

const wrap = document.createElement('div');
wrap.id = 'container-123';
wrap.style.width = '100%';
wrap.style.height = '100%';

const PanoramaImage = () => {
  const panoRef = useRef();

  const navigate = useNavigate();

  const goBack = useCallback(() => {
    navigate(-1);
  }, []);

  const createP = useCallback(() => {
    if (panoRef.current) {
      console.log('🚀 ~ file: Pano.tsx:29 ~ createP ~ panoRef.current:', panoRef.current);
      panoRef.current.destroy();
      return;
    }

    const pano1 = new PANOLENS.ImagePanorama(p1);
    const pano2 = new PANOLENS.ImagePanorama(p2);

    pano1.link(pano2, new THREE.Vector3(2345.23, -354.4, -3149.48));

    pano2.link(pano1, new THREE.Vector3(...getLocation(33, 579, 2400, 1200, 5000)), 400, enterIcon);

    const infospot2 = new PANOLENS.Infospot(350, PANOLENS.DataImage.Info);
    infospot2.position.set(475, 3800, -2945.25);
    infospot2.addHoverText('✨测试');
    pano2.add(infospot2);

    const infospot3 = new PANOLENS.Infospot(400, dangerIcon);
    infospot3.position.set(...getLocation(793, 571, 2400, 1200, 5000));
    infospot3.addEventListener('click', goBack);
    pano2.add(infospot3);

    document.querySelector('#p-container')!.innerHTML = '';
    document.querySelector('#p-container')?.appendChild(wrap);

    const p = new Pano(
      {
        container: wrap,
        controlBar: false,
        cameraFov: 100,
        autoHideInfospot: false,
      },
      pano1,
      pano2,
    );

    panoRef.current = p;

    pano1.addEventListener('enter-start', function () {
      p.viewer.tweenControlCenter(new THREE.Vector3(2345.23, -354.4, -3149.48), 5000);
    });
  }, []);

  useEffect(() => {
    createP();
    return function () {
      panoRef.current.destroy();
      console.log('🚀 ~ file: Pano.tsx:76 ~ panoRef.current:', panoRef.current);
      // panoRef.current = null
    };
  }, []);
  return <div id="p-container" style={{ height: '100%', width: '100%', overflow: 'hidden' }}></div>;
};

export default memo(PanoramaImage);
