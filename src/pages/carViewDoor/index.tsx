import { forwardRef, Suspense, useCallback, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import {
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
  PerspectiveCamera,
  Preload,
} from '@react-three/drei';
import { Canvas, useFrame, useThree  } from '@react-three/fiber';
import TWEEN from '@tweenjs/tween.js';
import { useEventListener } from 'ahooks';
import { debounce } from 'lodash-es';
import { Box3, Vector3 } from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

import ThreeLoading from '@/components/PageLoading/ThreeLoading';

import { Model } from './components/Oddysey2021';
// import BallHelper from '@/components/BallHelper';

interface ParmasTweenType {
  position: number[];
  from?: number[];
  time?: number;
  start?: boolean;
  onComplete?: () => void;
  onStart?: () => void;
  easing?: 'In' | 'Out' | 'InOut' | '';
  fov?: number;
}

interface ContentProps {
  setViewType?: (v: string) => void;
  viewType: string;
}

const cameraFovDict = {
  outer: 30,
  inner: 60,
};

const fov = cameraFovDict.outer;

const cameraPostionDict = {
  default: [66.74, 15.84, 77.45],
  outer: [13.32, 2.148, -4.624],
  // inner: [0.7906261500896024, 1.0997603195922938, 0.29990554332955877],
  inner: [0.804848063247332, 1.0888146224524293, 0.350574554579251],
  // door: [5.650331640624267, 1.2999570060822698, 0.3141459889139111],
  door: [5.726680374077233, 1.1010344963824925, 1.2710330027769454],
  // doorTarget: [2, 0.5, 2],
};

const controlOuterDict = {
  target: [0, 0, 0],
  rotateSpeed: 1,
  maxDistance: 100,
  minDistance: 12,
  maxPolarAngle: Math.PI / 2,
};
const controlInnerDict = {
  target: [0.75, 0.85, 1.12],
  rotateSpeed: -0.25,
  maxDistance: 0.8,
  minDistance: 0,
  maxPolarAngle: Math.PI,
};

const leftDoorDict = {
  defaultRotationY: 0,
  openRotationY: -Math.PI / 2.4,
};

const openR = Math.sqrt((-31.2) ** 2 + (-41.24) ** 2);
const openRA = Math.atan(31.2 / 41.24);

const targetSize = 4;

const intensity = 1;
const config = {
  main: [1, 2, 1],
  fill: [-2, -0.5, -2],
};
const radius = 7;

const bgColor = '#666';

let angleV = 0

const Content = forwardRef((props: ContentProps, ref: React.Ref<unknown>) => {
  const { setViewType, viewType } = props;
  const { viewport, scene } = useThree((state) => ({ scene: state.scene, viewport: state.viewport }));

  const cameraRef = useRef(null);
  const controlRef = useRef(null);
  const modelRef = useRef(null);
  const modelSizeRef = useRef<any>(null);
  const tweenCameraRef = useRef();
  const tweenControlRef = useRef();

  const lightLeftRef = useRef();

  const outTargetPosition = useRef();

  const [modelScale, setmodelScale] = useState(1);
  const [modelVisible, setmodelVisible] = useState(false);

  function resetControl(){
    console.log('-----');
    angleV = 0
    controlRef.current?.setAzimuthalAngle?.(0)
  }
  function moveConrol(step = Math.PI*2/36){
    // const cur = controlRef.current?.getAzimuthalAngle() || 0
    const cur = angleV
    let v = cur + step 
    if(v >= Math.PI){
      v = v - Math.PI*2
    }
    angleV = v
    controlRef.current?.setAzimuthalAngle(v)
  }

  useFrame((state, delta, xrFrame) => {
    // if (tweenCameraRef.current || tweenControlRef.current || tweenLeftDoor.current) {
    TWEEN.update();
    // }
  });

  const tweenStop = () => {
    tweenCameraRef.current?.stop?.();
    tweenControlRef.current?.stop?.();
  };

  const handleTweenControlTarget = ({ position, start = false, time = 400 }: ParmasTweenType) => {
    // tweenStop();
    const { x, y, z } = controlRef.current.target;
    const tw = new TWEEN.Tween([x, y, z])
      .to(position, time)
      // .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(function ([cx, cy, cz]) {
        controlRef.current?.target?.set?.(cx, cy, cz);
      });
    if (start) {
      tw.start();
    }
    return tw;
  };

  const handleTweenCameraPositionCustom = ({
    position,
    from,
    start = false,
    time = 600,
    onComplete,
    onStart,
    easing = 'InOut',
    fov,
  }: ParmasTweenType) => {
    let _from = from as number[];
    if (!from) {
      const { x, y, z } = cameraRef.current.position;
      _from = [x, y, z];
    }

    _from = fov ? [..._from, cameraRef.current.fov] : _from;
    const _to = fov ? [...position, fov] : position;
    const tw = new TWEEN.Tween(_from)
      .to(_to, time)
      .onUpdate(function ([cx, cy, cz, cf]) {
        cameraRef.current?.position?.set?.(cx, cy, cz);
        controlRef.current?.update?.();
        if (fov) {
          cameraRef.current.fov = cf;
          cameraRef.current.updateProjectionMatrix();
        }
      })
      .onStart(onStart)
      .onComplete(onComplete);
    if (easing) {
      tw.easing(TWEEN.Easing.Quadratic[easing]);
    }
    if (start) {
      tw.start();
    }
    return tw;
  };

  const handleTweenLeftDoor = ({
    position,
    start = false,
    time = 600,
    onComplete,
    easing = 'InOut',
  }: ParmasTweenType) => {
    tweenStop();
    const leftDoor = modelRef.current.leftDoor;
    const { y: ry } = leftDoor.rotation;

    const tw = new TWEEN.Tween([ry])
      .to(position, time)
      .easing(TWEEN.Easing.Quadratic[easing])
      .onUpdate(function ([ry2]) {
        const rry = Math.abs(ry2);
        leftDoor.rotation.y = ry2;
        const a = openRA - rry / 2;
        const d = 2 * openR * Math.sin(rry / 2);
        leftDoor.position.set(-d * Math.cos(a), 0, d * Math.sin(a));
      })
      .onComplete(onComplete);
    if (start) {
      tw.start();
    }
    return tw;
  };

  const closeLeftDoor = (start = true) => {
    return handleTweenLeftDoor({
      position: [leftDoorDict.defaultRotationY],
      start,
      easing: 'In',
    });
  };

  const openLeftDoor = (start = true) => {
    return handleTweenLeftDoor({
      position: [leftDoorDict.openRotationY],
      start,
    });
  };

  const getModelSize = useCallback(() => {
    if (modelSizeRef.current) {
      return modelSizeRef.current;
    }
    const boundingBox = new Box3().setFromObject(modelRef.current.model);
    const modelSize = boundingBox.getSize(new Vector3());
    const { x, y, z } = modelSize;
    const scale = Number((targetSize / y).toFixed(4));
    setmodelScale(scale);
    setmodelVisible(true);

    const scaled_x = x * scale;
    const scaled_y = y * scale;
    const scaled_z = z * scale;

    const maxDimension = Math.max(scaled_x, scaled_y, scaled_z);

    const orgDistance = maxDimension / (2 * Math.tan((Math.PI * fov) / 360));

    const modelSizeData = {
      x,
      y,
      z,
      scale,
      scaled_x,
      scaled_y,
      scaled_z,
      maxDimension,
      orgDistance,
    };
    modelSizeRef.current = modelSizeData;
    return modelSizeData;
  }, []);

  const setPort = (params = {}) => {
    const { customeScale = 1, targetPosition, time } = params;
    if (!modelRef.current) {
      return;
    }
    const cur_viewport = viewport.getCurrentViewport();
    const { width: viewportWidth, height: viewportHeight, distance: currentDistance } = cur_viewport;
    const { maxDimension } = getModelSize();
    const cur_p = targetPosition || cameraRef.current.position;
    const { x: cx, y: cy, z: cz } = cur_p;

    const curW = Math.min(viewportWidth, viewportHeight);

    const targetDistance = targetPosition && Math.sqrt(cx ** 2 + cy ** 2 + cz ** 2);
    const targetW = targetPosition && (targetDistance * curW) / currentDistance;
    const tw = targetW || curW;
    const scale = (tw / maxDimension) * customeScale;

    const tp = [cx / scale, cy / scale, cz / scale];
    outTargetPosition.current = tp;

    return handleTweenCameraPositionCustom({ position: tp, start: true, time });

    // cameraRef.current?.position?.set?.(cx / scale / customeScale, cy / scale / customeScale, cz / scale / customeScale);
    // controlRef.current?.update?.();
  };

  const handleResize = useCallback(
    debounce(() => {
      if (viewType === 'outer') {
        setPort();
      }
    }, 100),
    [viewType],
  );

  useEventListener('resize', handleResize, { target: window });

  useLayoutEffect(() => {
    console.log('lightLeftRef', lightLeftRef.current);
    console.log('scene', scene);

    // lightLeftRef.current.target.position.set(1.4, -2, 22);
    // scene.add(lightLeftRef.current.target);

    if (modelSizeRef.current) {
      return;
    }
    setPort();
  }, []);

  const handleViewInner = useCallback(() => {
    // 设置相机位置 - 开门 - 进车 - 关门
    setViewType('process');

    const leftDoorTween = openLeftDoor(false);
    leftDoorTween.onComplete(() => {
      setTimeout(() => {
        goDoor();
      }, 200);
    });

    const goInner = () => {
      handleTweenCameraPositionCustom({
        position: cameraPostionDict.inner,
        time: 1200,
        start: true,
        easing: 'Out',
        fov: cameraFovDict.inner,
        onComplete: () => {
          controlRef.current.maxDistance = controlInnerDict.maxDistance;
          controlRef.current.maxPolarAngle = controlInnerDict.maxPolarAngle;
          controlRef.current.rotateSpeed = controlInnerDict.rotateSpeed;

          closeLeftDoor().onComplete(() => {
            setViewType('inner');
          });
        },
      });
      // handleTweenControlTarget({
      //   position: controlInnerDict.target,
      //   time: 1500,
      //   start: true,
      // });
    };
    const goDoor = () => {
      handleTweenCameraPositionCustom({
        position: cameraPostionDict.door,
        time: 1000,
        easing: 'Out',
        start: true,
      }).onComplete(goInner);

      handleTweenControlTarget({
        position: controlInnerDict.target,
        time: 1000,
        start: true,
      }).onStart(() => {
        controlRef.current.minDistance = controlInnerDict.minDistance;
      });
    };

    const { x, y, z } = cameraRef.current.position;
    const [tx, ty, tz] = cameraPostionDict.outer;
    const t = Math.max(Math.abs(tx - x), Math.abs(ty - y), Math.abs(tz - z));
    const time = (t / 25) * 600;

    const cameraTween = setPort({ customeScale: 1.3, targetPosition: { x: tx, y: ty, z: tz }, time });

    cameraTween?.chain(leftDoorTween);
  }, []);

  const handleViewOuter = useCallback(() => {
    // 出车到门位置 - 开门 - 相机远处 - 关门

    setViewType('process');

    const leftDoorTween = openLeftDoor(false);
    leftDoorTween.onComplete(() => {
      setTimeout(() => {
        outInner();
      }, 200);
    });

    const { x, y, z } = cameraRef.current.position;
    const [tx, ty, tz] = cameraPostionDict.inner;
    const t = Math.max(Math.abs(tx - x), Math.abs(ty - y), Math.abs(tz - z));
    const time = (t / 0.5) * 350;
    handleTweenCameraPositionCustom({
      position: cameraPostionDict.inner,
      time,
      easing: '',
      start: true,
    }).chain(leftDoorTween);

    const outInner = () => {
      handleTweenCameraPositionCustom({
        position: cameraPostionDict.door,
        time: 1200,
        start: true,
        easing: 'In',
        fov: cameraFovDict.outer,
      })
        .onComplete(outDoor)
        .onStart(() => {
          controlRef.current.maxDistance = controlOuterDict.maxDistance;
        });
    };
    const outDoor = () => {
      handleTweenCameraPositionCustom({
        position: outTargetPosition.current,
        time: 1000,
        easing: 'In',
        start: true,
      }).onComplete(() => {
        closeLeftDoor(true).onComplete(() => {
          setViewType('outer');
        });
      });

      handleTweenControlTarget({
        position: controlOuterDict.target,
        time: 1000,
        start: true,
      }).onComplete(() => {
        controlRef.current.minDistance = controlOuterDict.minDistance;
        controlRef.current.maxPolarAngle = controlOuterDict.maxPolarAngle;
        controlRef.current.rotateSpeed = controlOuterDict.rotateSpeed;
      });
    };
  }, []);

  useImperativeHandle(ref, () => ({
    viewInner: handleViewInner,
    viewOuter: handleViewOuter,
    resetControl,
    moveConrol
  }));

  return (
    <>
      {/* <Stage environment={false} intensity={0.5} shadows={{ type: 'contact', opacity: 0.6 }} adjustCamera={false}> */}

      <Model
        ref={modelRef}
        scale={modelScale}
        position={[0, -targetSize / 2, 0]}
        rotation={[0, Math.PI, 0]}
        visible={modelVisible}
      />

      {/* <spotLight
        ref={lightLeftRef}
        angle={0.2}
        penumbra={1}
        position={[1.4, -0.15, 5.2]}
        intensity={0.8}
        castShadow
        shadow-bias={-0.0001}
        shadow-normalBias={0}
        shadow-mapSize={1024}
      /> */}

      {/* </Stage> */}

      {/* <ContactShadows opacity={0.5} scale={10} blur={3} far={5} position={[0, -2, 0]} resolution={256} color="#000000" /> */}

      <PerspectiveCamera ref={cameraRef} makeDefault fov={fov} position={cameraPostionDict.default} />

      <OrbitControls
        ref={controlRef}
        makeDefault
        enablePan={false}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
        minDistance={controlOuterDict.minDistance}
        maxDistance={controlOuterDict.maxDistance}
        onEnd={(e) => {
          console.log('---', controlRef.current.getDistance());
          console.log(cameraRef.current);
          console.log(controlRef.current);
          console.log(controlRef.current.getAzimuthalAngle(), controlRef.current.getPolarAngle());
          // console.log('viewport', viewport.getCurrentViewport());
        }}
      />
    </>
  );
});

const CarView: React.FC = () => {
  const contentRef = useRef();

  const [viewType, setViewType] = useState('outer');
  // const { active, progress, errors, item, loaded, total } = useProgress();

  const handleViewInner = () => {
    contentRef.current?.viewInner?.();
  };
  const handleViewOuter = () => {
    contentRef.current?.viewOuter?.();
  };

  return (
    <div className="container" style={{ background: bgColor }}>
      <Canvas gl={{ antialias: true }} shadows="soft">
        {/* <fog args={['white', 10, 15]} /> */}
        <Suspense fallback={<ThreeLoading />}>
          <Preload all />
          <Content ref={contentRef} viewType={viewType} setViewType={setViewType} />
        </Suspense>

        {/* <mesh castShadow receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}> */}
        {/* <planeGeometry args={[1200, 1200]} />
          <meshStandardMaterial color={bgColor} fog /> */}
        {/* <MeshReflectorMaterial
            blur={[300, 100]}
            resolution={512}
            mixBlur={1}
            mixStrength={50}
            roughness={1}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#000"
            metalness={0}
          /> */}
        {/* </mesh> */}

        <ContactShadows position={[0, -2, 0]} scale={radius * 4} far={radius} blur={1.5} opacity={0.7} />

        {/* <axesHelper args={[2]} /> */}
        {/* <BallHelper radius={0.05} color="green" /> */}

        <ambientLight intensity={intensity / 3} />
        <spotLight
          penumbra={1}
          position={[config.main[0] * radius, config.main[1] * radius, config.main[2] * radius]}
          intensity={intensity * 2}
          castShadow
          shadow-bias={-0.0001}
          shadow-normalBias={0}
          shadow-mapSize={1024}
        />

        <pointLight
          position={[config.fill[0] * radius, config.fill[1] * radius, config.fill[2] * radius]}
          intensity={intensity}
        />

        <Environment resolution={512} preset={false}>
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
        {viewType === 'outer' && (
          <div className="btn text-white bg-primary rounded-md" onClick={handleViewInner}>
            查看内部
          </div>
        )}
        {viewType === 'inner' && (
          <div className="btn text-white bg-info rounded-md" onClick={handleViewOuter}>
            查看外部
          </div>
        )}
        <div className='btn text-white bg-primary rounded-md' onClick={()=>contentRef.current?.resetControl?.()}>reset</div>
        <div className='btn text-white bg-primary rounded-md' onClick={()=>contentRef.current?.moveConrol?.()}>move</div>
      </div>
    </div>
  );
};

export default CarView;
