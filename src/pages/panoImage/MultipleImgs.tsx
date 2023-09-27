import { useEffect, useRef } from 'react';

import { publicPath } from '@/constant';
import eye from '@/utils/3dEye';

const imgPath = publicPath + 'car/';

const MultipleImgs: React.FC = () => {
  const eyeRef = useRef();

  useEffect(() => {
    if (eyeRef.current) {
      eyeRef.current?.destroy?.();
    }

    eyeRef.current = eye('#mulImgWrap', { imagePath: imgPath, totalImages: 36, imageExtension: 'png' });

    return function () {
      eyeRef.current?.destroy?.();
    };
  }, []);

  return (
    <div style={{ height: '100%', width: '100%' }} className="d-flex justify-center flex-direction-column">
      <div
        id="mulImgWrap"
        style={{
          width: '100%',
          height: '500px',
          maxHeight: '100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'contain',
          transition: 'background 0.1s',
        }}
      />
    </div>
  );
};

export default MultipleImgs;
