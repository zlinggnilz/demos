import { useControls } from 'leva';

interface BallProp {
  radius?: number;
  color?: string;
}

const BallHelper: React.FC = ({ radius = 0.2, color = 'red' }: BallProp) => {
  const { x, y, z } = useControls({
    x: { value: 0, min: -Infinity, max: Infinity, step: 0.01 },
    y: { value: 0, min: -Infinity, max: Infinity, step: 0.01 },
    z: { value: 0, min: -Infinity, max: Infinity, step: 0.01 },
  });

  return (
    <>
      <mesh position={[x, y, z]}>
        <sphereGeometry args={[radius, 6, 6]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </>
  );
};

export default BallHelper;
