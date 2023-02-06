import * as PANOLENS from "panolens";

export function getLocation(
  x: number,
  y: number,
  imgwidth: number,
  imgheight: number,
  r: number
): [number, number, number] {
  var u = (360 / imgwidth) * x;
  var v = (180 / imgheight) * y - 90;
  var wd = (u * Math.PI) / 180,
    jd = (v * Math.PI) / 180,
    x = -r * Math.cos(jd) * Math.cos(wd),
    y = -r * Math.sin(jd),
    z = r * Math.cos(jd) * Math.sin(wd);
  return [x, y, z];
}

export class Pano {
  viewer: any = null;
  panos: Array<object | null> = [];

  constructor(options: object, ...panos: Array<object>) {
    const viewer = new PANOLENS.Viewer(options);
    viewer.add(...panos);
    this.viewer = viewer;
  }

  removePano(item: any) {
    item.dispose();
    this.viewer.remove(item);
  }

  destroy() {
    if (this.viewer) {
      this.panos.forEach((item, index) => {
        this.removePano(item)
        this.panos[index] = null;
      });
      this.panos = [];
      this.viewer.destroy();
    }
  }
}
