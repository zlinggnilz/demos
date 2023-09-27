import { Suspense, useLayoutEffect, useRef } from 'react';
import { Html, OrbitControls, PerspectiveCamera, Preload, useProgress } from '@react-three/drei';
import { Canvas, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

import car_inner_Img from '@/assets/pano/car_inner.jpg';
import ThreeLoading from '@/components/PageLoading/ThreeLoading';
import { getLocation } from '@/utils/pano';

const radius = 500;

function Dome({ mapImg, radius = 500 }: { mapImg: string; radius: number }) {
  const texture = useLoader(THREE.TextureLoader, mapImg);
  return (
    <group>
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[radius, 60, 40]} />
        <meshBasicMaterial map={texture} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

export default function App() {
  const cameraRef = useRef();
  const controlRef = useRef();

  useLayoutEffect(() => {
    // console.log(controlRef.current);
  }, []);

  function moveToTarget(v) {
    const spherical = new THREE.Spherical(radius).setFromCartesianCoords(...v);
    const polarAngle = Math.PI - spherical.phi;
    const azimuthalAngle = Math.PI + spherical.theta;
    // phi - 与 y (up) 轴的极角（以弧度为单位）。 默认值为 0。
    // theta - 绕 y (up) 轴的赤道角(方位角)（以弧度为单位）。 默认值为 0。

    controlRef.current.setPolarAngle(polarAngle);
    controlRef.current.setAzimuthalAngle(azimuthalAngle);
  }

  const hanldeClick = () => {
    // console.log(canvasRef.current);
    moveToTarget(getLocation(52.8, 39.2, 132.3, 66.15, radius));
  };

  return (
    <>
      <Canvas frameloop="demand">
        <Suspense fallback={<ThreeLoading />}>
          <Preload all />
          <Dome mapImg={car_inner_Img} radius={radius} />
        </Suspense>

        <PerspectiveCamera makeDefault fov={60} position={[230, 86, -171]} ref={cameraRef} />
        <OrbitControls
          makeDefault
          // enableZoom={false}
          enablePan={false}
          // enableDamping
          // dampingFactor={0.2}
          autoRotate={false}
          rotateSpeed={-0.25}
          maxDistance={radius * 0.9}
          minDistance={1}
          zoomSpeed={3}
          ref={controlRef}
          // onEnd={() => {
          //   console.log(cameraRef.current.position);
          // }}
        />

        {/* <axesHelper args={[80]} /> */}
      </Canvas>
      {/* <button style={{ position: 'fixed', bottom: 0, right: 0 }} onClick={hanldeClick}>
        click
      </button> */}
    </>
  );
}
