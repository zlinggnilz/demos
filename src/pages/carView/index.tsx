import { Suspense, useMemo, useRef, useState } from 'react';
import {
  Environment,
  Lightformer,
  OrbitControls,
  PerspectiveCamera,
  Preload,
  Stage,
  useProgress,
} from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import classnames from 'classnames';

// import BallHelper from '@/components/BallHelper';
import ThreeLoading from '@/components/PageLoading/ThreeLoading';

import { Model } from './components/Md';

const colors = ['#333', '#718e77', '#9e252c'];
const seatColors = ['#444', '#222'];

type PositionType = [number, number, number];
type ViewType = 'inner' | 'outer';

interface PositionDictType {
  outer: PositionType;
  inner: PositionType;
}

const cameraPositionDict: PositionDictType = {
  outer: [-43, 11, 114],
  inner: [0.058, 4.97, -3.93],
};

const controlTargetDict: PositionDictType = {
  outer: [0, 0, 0],
  inner: [0, 4.2, 1],
};

const CarView: React.FC = () => {
  const [color, setcolor] = useState(colors[0]);
  const [seatColor, setseatColor] = useState(seatColors[0]);
  const [viewType, setviewType] = useState<ViewType>('outer');

  const defaultPosition = useMemo(() => cameraPositionDict[viewType], []);
  const colorsList = useMemo(() => (viewType === 'inner' ? seatColors : colors), [viewType]);
  const activeColor = useMemo(() => (viewType === 'inner' ? seatColor : color), [viewType, seatColor, color]);

  // const { active, progress, errors, item, loaded, total } = useProgress();

  const cameraRef = useRef(null);

  const controlRef = useRef(null);

  const buttonText = useMemo(() => (viewType === 'inner' ? '查看外部' : '查看内部'), [viewType]);

  const handleColor = (v: string) => {
    if (viewType === 'inner') {
      setseatColor(v);
    } else {
      setcolor(v);
    }
  };

  const handleViewType = () => {
    const v: ViewType = viewType === 'inner' ? 'outer' : 'inner';
    console.log('v', v);
    setviewType(v);

    const cameraP = cameraPositionDict[v];
    cameraRef.current?.position?.set?.(...cameraP);
    controlRef.current?.update?.();

    const controlTarget = controlTargetDict[v];

    if (v === 'inner') {
      controlRef.current.target.set(...controlTarget);
      controlRef.current?.setAzimuthalAngle?.(3.13);
      controlRef.current?.setPolarAngle?.(1.41);
    } else {
      controlRef.current?.setAzimuthalAngle?.(-0, 3);
      controlRef.current?.setPolarAngle?.(1.5);
    }
  };

  const controlProps = useMemo(
    () =>
      viewType === 'inner'
        ? {
            minPolarAngle: 0,
            maxPolarAngle: Math.PI,
            minDistance: 0,
            maxDistance: 5,
            rotateSpeed: -0.25,
            // target: controlTargetDict[viewType],
          }
        : {
            minPolarAngle: 0,
            maxPolarAngle: Math.PI / 2,
            minDistance: 68,
            maxDistance: 400,
            rotateSpeed: 1,
            // target: controlTargetDict[viewType],
          },
    [viewType],
  );

  return (
    <div className="container" style={{ background: '#666' }}>
      <Canvas gl={{ antialias: false }} dpr={[1, 2]} shadows>
        <Suspense fallback={<ThreeLoading />}>
          <Preload all />
          <Stage
            environment={false}
            intensity={0.5}
            shadows={{ type: 'contact', opacity: 0.7 }}
            adjustCamera={viewType === 'inner' ? false : 0.9}
          >
            <Model color={color} seatColor={seatColor} scale={0.12} rotation={[0, Math.PI, Math.PI]} />
          </Stage>
        </Suspense>

        {/* <axesHelper args={[10]} /> */}
        {/* <BallHelper /> */}

        <PerspectiveCamera
          makeDefault
          fov={viewType === 'inner' ? 80 : 25}
          position={defaultPosition}
          ref={cameraRef}
        />
        <OrbitControls
          makeDefault
          enablePan={false}
          {...controlProps}
          ref={controlRef}
          onEnd={(e) => {
            console.log(controlRef.current.getDistance());
            console.log(cameraRef.current);
            console.log(controlRef.current);
            console.log(controlRef.current.getAzimuthalAngle(), controlRef.current.getPolarAngle());
          }}
        />

        {/* </Stage> */}
        <Environment resolution={512}>
          {/* Ceiling */}
          <Lightformer intensity={2 + 2} rotation-x={Math.PI / 2} position={[0, 4, -9]} scale={[10, 1, 1]} />
          <Lightformer intensity={2 + 2} rotation-x={Math.PI / 2} position={[0, 4, -6]} scale={[10, 1, 1]} />
          <Lightformer intensity={2 + 2} rotation-x={Math.PI / 2} position={[0, 4, -3]} scale={[10, 1, 1]} />
          <Lightformer intensity={2 + 2} rotation-x={Math.PI / 2} position={[0, 4, 0]} scale={[10, 1, 1]} />
          <Lightformer intensity={2 + 2} rotation-x={Math.PI / 2} position={[0, 4, 3]} scale={[10, 1, 1]} />
          <Lightformer intensity={2 + 2} rotation-x={Math.PI / 2} position={[0, 4, 6]} scale={[10, 1, 1]} />
          <Lightformer intensity={2 + 2} rotation-x={Math.PI / 2} position={[0, 4, 9]} scale={[10, 1, 1]} />
          {/* Sides */}
          <Lightformer intensity={3 + 2} rotation-y={Math.PI / 2} position={[-30, 0, 0]} scale={[100, 2, 1]} />
          <Lightformer intensity={3 + 2} rotation-y={-Math.PI / 2} position={[30, 0, 0]} scale={[100, 2, 1]} />
          <Lightformer intensity={2 + 2} rotation-x={-Math.PI / 2} position={[0, 0, 30]} scale={[100, 2, 1]} />
          <Lightformer intensity={2 + 2} rotation-x={-Math.PI / 2} position={[0, 0, -30]} scale={[100, 2, 1]} />
          {/* Key */}
          <Lightformer
            form="ring"
            color="white"
            intensity={10}
            scale={2}
            position={[10, 5, 10]}
            onUpdate={(self) => self.lookAt(0, 0, 0)}
          />
        </Environment>
      </Canvas>

      <div className="d-flex align-center justify-center bottom-bar px-4 pb-6 gap-4">
        {colorsList.map((item) => (
          <div
            className={classnames('text-16 dot', { active: item === activeColor })}
            style={{ background: item }}
            onClick={() => {
              handleColor(item);
            }}
            key={item}
          />
        ))}
        <div className="btn text-white bg-primary rounded-md" onClick={handleViewType}>
          {buttonText}
        </div>
      </div>
    </div>
  );
};

export default CarView;
