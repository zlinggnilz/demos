import { useEffect } from 'react';
import { Html, useProgress } from '@react-three/drei';

function Loading() {
  return (
    <Html fullscreen>
      <div className="loaderWrap">
        <span className="loader"></span>
      </div>
    </Html>
  );
}

export default Loading;
