import { OrbitControls, Stage } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

import { Model } from './components/Datsun';

export default function App() {
  const color = '#000';
  return (
    <div className="container" style={{ background: '#333' }}>
      <Canvas shadows camera={{ position: [4, 0, -12], fov: 35 }}>
        <Stage
          intensity={1.5}
          environment="city"
          shadows={{ type: 'basic', color, colorBlend: 2, opacity: 2 }}
          adjustCamera={0.9}
        >
          <Model color={color} />
        </Stage>
        <OrbitControls makeDefault minPolarAngle={Math.PI / 2} maxPolarAngle={Math.PI / 2} />
      </Canvas>
    </div>
  );
}
