import * as THREE from "three";

export default class BottomPart {
  constructor(
    breadth,
    length,
    barLength,
    center,
    trenchOffset,
    trenchLength,
    trenchWidth,
    holeOffset,
    thickness,
    svg
  ) {
    this.breadth = breadth;
    this.length = length;
    this.center = center;
    this.barLength = barLength;
    this.trenchLength = trenchLength;
    this.trenchOffset = trenchOffset;
    this.trenchWidth = trenchWidth;
    this.holeOffset = holeOffset;
    this.thickness = thickness;
    this.svg = svg;
    this.#createPath();
    this.#createShape();
  }
  #createPath = () => {
    let halfBreadth = this.breadth / 2;
    let halfLength = this.length / 2;
    this.moves = [
      [
        [-halfBreadth, halfLength],
        [0, -this.length],
        [this.trenchOffset, 0],
        [0, this.trenchLength],
        [this.trenchWidth, 0],
        [0, -this.trenchLength],
        [this.breadth - 2 * (this.trenchOffset + this.trenchWidth), 0],
        [0, this.trenchLength],
        [this.trenchWidth, 0],
        [0, -this.trenchLength],
        [this.trenchOffset, 0],
        [0, this.length],
        [-this.breadth, 0],
      ],
      [
        [-this.barLength / 2, this.length / 2 - this.holeOffset],
        [0, -this.thickness],
        [this.barLength, 0],
        [0, this.thickness],
        [-this.barLength, 0],
      ],
    ];
  };
  #createShape = () => {
    let shape = [];
    this.svg.ctx.beginPath();
    for (let i = 0; i < this.moves.length; i++) {
      let move = this.moves[i];
      const temp = new THREE.Shape();
      let x = this.center.x + move[0][0];
      let y = this.center.y + move[0][1];

      let svgX = this.svg.position.x + 2 * this.svg.scale * move[0][0];
      let svgY = this.svg.position.y - 2 * this.svg.scale * move[0][1];

      temp.moveTo(x, y);
      this.svg.ctx.moveTo(svgX, svgY);
      for (let i = 1; i < move.length; i++) {
        x = x + move[i][0];
        y = y + move[i][1];
        temp.lineTo(x, y);

        svgX = svgX + 2 * this.svg.scale * move[i][0];
        svgY = svgY - 2 * this.svg.scale * move[i][1];
        this.svg.ctx.lineTo(svgX, svgY);
      }
      shape.push(temp);

      this.svg.ctx.closePath();
      this.svg.ctx.stroke();
    }
    this.shape = shape[0];
    this.shape.holes.push(shape[1]);
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
