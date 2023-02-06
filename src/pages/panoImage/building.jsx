import { memo,useRef ,useCallback,useEffect} from 'react';
import * as PANOLENS from "panolens";
import { getLocation, Pano } from "@/utils/pano";
import { history } from 'umi';
import p3 from "@/assets/pano/p3.jpg";
import enterIcon from '@/assets/pano/enter.png'

const Building = () => {
  const panoRef = useRef();

  const createP = useCallback(() => {
    const pano3 = new PANOLENS.ImagePanorama(p3);


    const infospot1 = new PANOLENS.Infospot(350, PANOLENS.DataImage.Info);
    infospot1.position.set(...getLocation(1826, 775, 2400, 1200, 5000));
    infospot1.addHoverText('🍇测试测试');
    pano3.add(infospot1);

    const infospot2 = new PANOLENS.Infospot(300, enterIcon);
    infospot2.position.set(...getLocation(2379, 618, 2400, 1200, 5000));
    infospot2.addEventListener('click', goOther);
    pano3.add(infospot2);

    panoRef.current = new Pano(
      {
        container: document.querySelector("#p-container"),
        controlBar: false,
        cameraFov: 100,
        autoHideInfospot: false,
      },
      pano3,
    );

   
  }, []);

  useEffect(() => {
    createP();
    return function () {
      panoRef.current.destroy();
    };
  }, []);
  return <div id="p-container" style={{ height: "100%", width: "100%",overflow:"hidden" }}></div>;
};

function goOther() {
  history.push("/panoImage")
}

export default memo(Building);