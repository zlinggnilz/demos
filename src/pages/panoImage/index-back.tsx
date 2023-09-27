import { Suspense, useState } from 'react';
import { Html, OrbitControls, Preload, useProgress } from '@react-three/drei';
import { Canvas, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

import enterIcon from '@/assets/pano/enter.png';
// import dangerIcon from '@/assets/pano/danger.png';
import p1 from '@/assets/pano/p1.jpg';
import p2 from '@/assets/pano/p2.jpg';
import ThreeLoading from '@/components/PageLoading/ThreeLoading';
import { getLocation, Pano } from '@/utils/pano';

const radius = 500;

const store = [
  { name: 'outside', color: 'lightpink', position: getLocation(2666, 1070, 4096, 2048, radius), url: p1, link: 1 },
  { name: 'inside', color: 'lightblue', position: getLocation(33, 579, 2400, 1200, radius), url: p2, link: 0 },
];

function Dome({ name, position, texture, onClick }) {
  const map = useLoader(THREE.TextureLoader, enterIcon);
  return (
    <group>
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[radius, 60, 40]} />
        <meshBasicMaterial map={texture} side={THREE.BackSide} />
      </mesh>
      {/* <sprite position={position} scale={[30, 30, 1]}>
        <spriteMaterial map={map} side={THREE.DoubleSide} depthTest={false} transparent />
      </sprite> */}
    </group>
  );
}

function Portals() {
  const [which, set] = useState(0);
  const { link, ...props } = store[which];
  const maps = useLoader(
    THREE.TextureLoader,
    store.map((entry) => entry.url),
  );
  return <Dome onClick={() => set(link)} {...props} texture={maps[which]} />;
}

export default function App() {
  return (
    <Canvas frameloop="demand" camera={{ position: [0, 0, 300], fov: 60 }}>
      <Suspense fallback={<ThreeLoading />}>
        <Preload all />
        <Portals />
      </Suspense>

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
      />

      {/* <mesh position={getLocation(94.2, 38.5, 144.5, 72.25, radius)}>
          <sphereGeometry args={[16, 6, 6]} />
          <meshBasicMaterial color="green" />
        </mesh> */}
    </Canvas>
  );
}
