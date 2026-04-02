import * as THREE from "three";

export default class BackPart {
  constructor(
    breadth,
    depth,
    center,
    trenchOffset,
    trenchLength,
    trenchWidth,
    barWidth,
    barOffset,
    thickness,
    svg
  ) {
    if (trenchLength > depth / 2) {
      trenchLength = depth / 2;
    }
    this.breadth = breadth;
    this.depth = depth;
    this.center = center;
    this.trenchLength = trenchLength;
    this.trenchOffset = trenchOffset;
    this.trenchWidth = trenchWidth;
    this.barWidth = barWidth;
    this.barOffset = barOffset;
    this.thickness = thickness;
    this.svg = svg;
    this.#createPath();
    this.#createShape();
  }
  #createPath = () => {
    let halfBreadth = this.breadth / 2;
    let halfDepth = this.depth / 2;
    this.moves = [
      [-halfBreadth, halfDepth],
      [0, -this.depth],
      [this.trenchOffset, 0],
      [0, this.trenchLength],
      [this.trenchWidth, 0],
      [0, -this.trenchLength],
      [this.barOffset, 0],
      [0, -this.barWidth],
      [
        this.breadth -
          2 * (this.trenchOffset + this.trenchWidth + this.barOffset),
        0,
      ],
      [0, this.barWidth],
      [this.barOffset, 0],
      [0, this.trenchLength],
      [this.trenchWidth, 0],
      [0, -this.trenchLength],
      [this.trenchOffset, 0],
      [0, this.depth],
      [-this.breadth, 0],
    ];
  };
  #createShape = () => {
    this.shape = new THREE.Shape();
    let x = this.center.x + this.moves[0][0];
    let svgX = this.svg.position.x + 2 * this.svg.scale * this.moves[0][0];
    let y = this.center.y + this.moves[0][1];
    let svgY = this.svg.position.y - 2 * this.svg.scale * this.moves[0][1];

    this.shape.moveTo(x, y);
    this.svg.ctx.beginPath();
    this.svg.ctx.moveTo(svgX, svgY);
    for (let i = 1; i < this.moves.length; i++) {
      x = x + this.moves[i][0];
      y = y + this.moves[i][1];
      this.shape.lineTo(x, y);

      svgX = svgX + 2 * this.svg.scale * this.moves[i][0];
      svgY = svgY - 2 * this.svg.scale * this.moves[i][1];
      this.svg.ctx.lineTo(svgX, svgY);
    }

    this.svg.ctx.closePath();
    this.svg.ctx.stroke();
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
}
