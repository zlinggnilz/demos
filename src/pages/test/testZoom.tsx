import React from 'react';
import { animated, useSpring } from '@react-spring/three';
import { OrbitControls } from '@react-three/drei';
import { Canvas, useThree, Vector3 } from '@react-three/fiber';

interface ZoomInProps {
  from: number;
  to: number;
  onRest?: () => void;
  children: React.ReactNode;
}

export const ZoomIn = ({ from, to, onRest, children }: ZoomInProps) => {
  const { position } = useSpring({
    position: [0, 0, -to],
    from: { position: [0, 0, -from] },
    onRest,
  });

  return <animated.group position={position as unknown as Vector3}>{children}</animated.group>;
};

function Box(props) {
  return (
    <mesh {...props} scale={[1, 1, 1]}>
      <boxBufferGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

function Controls() {
  const { gl, camera } = useThree();
  return <OrbitControls target={[0, 0, 0]} args={[camera, gl.domElement]} />;
}

export default function Scene() {
  return (
    <Canvas>
      <Controls />
      <ambientLight />
      <ZoomIn from={200} to={0}>
        <Box />
        <pointLight position={[10, 10, 10]} />
      </ZoomIn>
    </Canvas>
  );
}
