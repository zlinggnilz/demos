import * as PANOLENS from 'panolens';

export function getLocation(
  x: number,
  y: number,
  imgwidth: number,
  imgheight: number,
  r: number,
): [number, number, number] {
  const u = (360 / imgwidth) * x;
  const v = (180 / imgheight) * y - 90;
  const wd = (u * Math.PI) / 180;
  const jd = (v * Math.PI) / 180;
  const l_x = r * Math.cos(jd) * Math.cos(wd);
  const l_y = -r * Math.sin(jd);
  const l_z = r * Math.cos(jd) * Math.sin(wd);
  return [l_x, l_y, l_z];
}

export class Pano {
  viewer: any = null;
  panos: Array<object | null> = [];

  constructor(options: object, ...panos: Array<object>) {
    console.log('create pano');
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
        this.removePano(item);
        this.panos[index] = null;
      });
      this.panos = [];
      this.viewer.destroy();
    }
  }
}
