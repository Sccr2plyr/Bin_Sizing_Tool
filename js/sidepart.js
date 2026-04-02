import * as THREE from "three";

export default class SidePart {
  constructor(
    depth,
    length,
    center,
    smallTrench,
    bigTrench,
    outerTriangleHeight,
    thickness,
    hypotenuse,
    svg
  ) {
    this.depth = depth;
    this.length = length;
    this.center = center;
    this.smallTrench = smallTrench;
    this.bigTrench = bigTrench;
    this.outerTriangleHeight = outerTriangleHeight;
    this.thickness = thickness;
    this.hypotenuse = hypotenuse;
    this.svg = svg;
    this.moves_for_svg = [
      [
        this.bigTrench.offset / Math.sqrt(2),
        this.bigTrench.offset / Math.sqrt(2),
      ],
      [-this.hypotenuse / 2 / Math.sqrt(2), this.hypotenuse / 2 / Math.sqrt(2)],
      [this.thickness / Math.sqrt(2), this.thickness / Math.sqrt(2)],
      [this.hypotenuse / 2 / Math.sqrt(2), -this.hypotenuse / 2 / Math.sqrt(2)],
      [
        (this.hypotenuse - this.smallTrench.offset - this.thickness) /
          Math.sqrt(2),
        (this.hypotenuse - this.smallTrench.offset - this.thickness) /
          Math.sqrt(2),
      ],
    ];
    this.#createPath();
    this.#createShape();
  }
  #createPath = () => {
    let halfDepth = this.depth / 2;
    let halfLength = this.length / 2;
    this.moves = [
      [-halfDepth, halfLength],
      [0, -this.length],
      [halfDepth, -this.outerTriangleHeight],
      [halfDepth, this.outerTriangleHeight],
      [0, this.length - this.smallTrench.offset - this.smallTrench.width],
      [-this.smallTrench.height, 0],
      [0, this.smallTrench.width],
      [this.smallTrench.height, 0],
      [0, this.smallTrench.offset],
      [-(this.depth - this.bigTrench.offset - this.bigTrench.width), 0],
      [0, -this.bigTrench.height],
      [-this.bigTrench.width, 0],
      [0, this.bigTrench.height],
      [-this.bigTrench.offset, 0],
    ];
  };
  #createShape = () => {
    this.shape = new THREE.Shape();
    let x = this.center.x + this.moves[0][0];
    let y = this.center.y + this.moves[0][1];
    this.shape.moveTo(x, y);
    for (let i = 1; i < this.moves.length; i++) {
      x = x + this.moves[i][0];
      y = y + this.moves[i][1];
      this.shape.lineTo(x, y);
    }

    this.svg.position.forEach((position, index) => {
      this.svg.ctx.beginPath();
      let x =
        position.x -
        2 * this.svg.scale * this.moves[0][0] * (index == 1 ? -1 : 1);
      let y = position.y - 2 * this.svg.scale * this.moves[0][1];
      this.svg.ctx.moveTo(x, y);
      for (let i = 1; i < this.moves.length - 1; i++) {
        if (i == 3) {
          for (let j = 0; j < this.moves_for_svg.length; j++) {
            x =
              x -
              2 *
                this.svg.scale *
                this.moves_for_svg[j][0] *
                (index == 1 ? -1 : 1);
            y = y - 2 * this.svg.scale * this.moves_for_svg[j][1];
            this.svg.ctx.lineTo(x, y);
          }
        } else {
          x = x - 2 * this.svg.scale * this.moves[i][0] * (index == 1 ? -1 : 1);
          y = y - 2 * this.svg.scale * this.moves[i][1];
          this.svg.ctx.lineTo(x, y);
        }
      }
      this.svg.ctx.lineTo(
        position.x + this.depth * this.svg.scale * (index == 1 ? -1 : 1),
        position.y - this.length * this.svg.scale - this.svg.scale * 0.3
      );
      this.svg.ctx.closePath();
      this.svg.ctx.stroke();
    });
  };
  createMesh = () => {
    const extrudeGeometry = new THREE.ExtrudeGeometry(this.shape, {
      depth: this.thickness,
      bevelEnabled: false,
    });
    const mesh = new THREE.Mesh(
      extrudeGeometry,
      new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 20 })
    );
    return mesh;
  };
  // #getPointOnLine = (p1, p2, distance) => {
  //   let v = [p2[0] - p1[0], p2[1] - p1[1]];
  //   let modV = Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2));
  //   let u = [v[0] / modV, v[1] / modV];
  //   let p = [p1[0] + distance * u[0], p1[1] + distance * u[1]];
  //   return p;
  // };
  // #calculateDistance = (p1, p2) => {
  //   return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
  // };
}
