import { memo, useEffect, useRef, useCallback } from "react";
import { getLocation, Pano } from "@/utils/pano";
import { history } from "umi";
import * as PANOLENS from "panolens";
import * as THREE from "three";
import p1 from "@/assets/pano/p1.jpg";
import p2 from "@/assets/pano/p2.jpg";
import enterIcon from "@/assets/pano/enter.png";
import dangerIcon from "@/assets/pano/danger.png";

const PanoramaImage = () => {
  const panoRef = useRef();

  const createP = useCallback(() => {
    const pano1 = new PANOLENS.ImagePanorama(p1);
    const pano2 = new PANOLENS.ImagePanorama(p2);

    pano1.link(pano2, new THREE.Vector3(2345.23, -354.4, -3149.48));

    pano2.link(
      pano1,
      new THREE.Vector3(...getLocation(33, 579, 2400, 1200, 5000)),
      400,
      enterIcon
    );

    const infospot2 = new PANOLENS.Infospot(350, PANOLENS.DataImage.Info);
    infospot2.position.set(475, 3800, -2945.25);
    infospot2.addHoverText("✨测试");
    pano2.add(infospot2);

    const infospot3 = new PANOLENS.Infospot(400, dangerIcon);
    infospot3.position.set(...getLocation(793, 571, 2400, 1200, 5000));
    infospot3.addEventListener("click", goOther);
    pano2.add(infospot3);

    const p = new Pano(
      {
        container: document.querySelector("#p-container"),
        controlBar: false,
        cameraFov: 100,
        autoHideInfospot: false,
      },
      pano1,
      pano2
    );

    panoRef.current = p

    pano1.addEventListener( 'enter-start', function(){
      p.viewer.tweenControlCenter( new THREE.Vector3(2345.23, -354.40, -3149.48), 5000 );
  } );


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
  history.push("/panoImage/building");
}

export default memo(PanoramaImage);
