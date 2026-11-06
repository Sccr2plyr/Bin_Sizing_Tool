import * as THREE from "three";
// // import * as _ from "./config.js";
import BackPart from "backpart";
import BottomPart from "bottompart";
import SidePart from "sidepart";
import FrontPart from "frontpart";

export default class Bin {
  initialize = (_) => {
    // Measurements.setInches(0.5);
    _.SVG_GAP = _.SVG_SCALE * 3;
    this.svgCtx = new C2S(
      _.DEPTH * 4 * _.SVG_SCALE +
        _.BREADTH * 2 * _.SVG_SCALE +
        200 +
        2 * _.SVG_GAP,
      _.DEPTH * 4 * _.SVG_SCALE +
        _.LENGTH * 2 * _.SVG_SCALE +
        150 +
        2 * _.SVG_GAP
    );
    this.svgCtx.strokeStyle = "#222222";
    this.svgCtx.strokeWidth = 0.5;
    this.svgCtx.gap = _.SVG_GAP;
    this.svgCtx.scale = _.SVG_SCALE;

    this.draw(_);
    this.#createGroup();
    return this.group;
  };

  getSvg = () => {
    return this.svgCtx;
  };

  draw = (_) => {
    this.#initializeBackPart(_);
    this.#initializeBottomPart(_);
    this.#initializeSidePart(_);
    this.#initializeFrontPart(_);
  };

  #createGroup = () => {
    this.group = new THREE.Group();
    this.group.add(
      this.backPartMesh,
      this.bottomPartMesh,
      this.leftSideMesh,
      this.rightSideMesh,
      this.frontPartMesh
    );
    this.group.rotation.set(
      this.#radians(-90),
      this.#radians(0),
      this.#radians(0)
    );
    this.group.name = "bin";
  };

  #initializeBackPart = (_) => {
    this.backPart = new BackPart(
      _.BREADTH,
      _.DEPTH,
      { x: 0, y: 0 },
      _.TRENCH_OFFSET,
      _.DEPTH * 0.45,
      _.THICKNESS,
      _.THICKNESS + 0.5,
      _.BAR_OFFSET,
      _.THICKNESS,
      {
        ctx: this.svgCtx,
        position: {
          x: this.svgCtx.width / 2,
          y: 75 + _.DEPTH * this.svgCtx.scale,
        },
        scale: this.svgCtx.scale,
      }
    );
    this.backPartMesh = this.backPart.createMesh();
    this.backPartMesh.position.set(
      0,
      _.LENGTH / 2 - _.HOLE_OFFSET,
      _.DEPTH / 2 + _.THICKNESS
    );
    this.backPartMesh.rotation.set(
      this.#radians(90),
      this.#radians(0),
      this.#radians(0)
    );
  };

  #initializeBottomPart = (_) => {
    this.bottomPart = new BottomPart(
      _.BREADTH,
      _.LENGTH,
      _.BREADTH - 2 * (_.TRENCH_OFFSET + _.THICKNESS + _.BAR_OFFSET),
      { x: 0, y: 0 },
      _.TRENCH_OFFSET,
      _.LENGTH / 2,
      _.THICKNESS,
      _.HOLE_OFFSET,
      _.THICKNESS,
      {
        ctx: this.svgCtx,
        position: {
          x: this.svgCtx.width / 2,
          y:
            75 +
            2 * _.DEPTH * this.svgCtx.scale +
            _.LENGTH * this.svgCtx.scale +
            _.THICKNESS * 2 * this.svgCtx.scale +
            this.svgCtx.gap,
        },
        scale: this.svgCtx.scale,
      }
    );
    this.bottomPartMesh = this.bottomPart.createMesh();
  };

  #initializeSidePart = (_) => {
    const height = this.#calculateHeight(_.FRONT_ANGLE, _.DEPTH / 2);
    const hypotenuse = this.#calculateHypotenuse(_.DEPTH / 2, height);
    this.sidePart = new SidePart(
      _.DEPTH + 1,
      _.LENGTH,
      { x: 0, y: 0 },
      {
        width: _.THICKNESS,
        height: _.DEPTH * 0.5,
        offset: _.HOLE_OFFSET,
      },
      { width: _.THICKNESS, height: _.LENGTH / 2, offset: _.TRENCH_OFFSET },
      this.#calculateHeight(_.FRONT_ANGLE, _.DEPTH / 2),
      _.THICKNESS,
      hypotenuse,
      {
        ctx: this.svgCtx,
        position: [
          {
            x:
              this.svgCtx.width / 2 -
              _.BREADTH * this.svgCtx.scale -
              _.DEPTH * this.svgCtx.scale -
              this.svgCtx.gap,
            y:
              75 +
              2 * this.svgCtx.scale * _.DEPTH +
              _.LENGTH * this.svgCtx.scale +
              _.THICKNESS * 2 * this.svgCtx.scale +
              this.svgCtx.gap,
          },
          {
            x:
              this.svgCtx.width / 2 +
              _.BREADTH * this.svgCtx.scale +
              _.DEPTH * this.svgCtx.scale +
              this.svgCtx.gap,
            y:
              75 +
              2 * this.svgCtx.scale * _.DEPTH +
              _.LENGTH * this.svgCtx.scale +
              _.THICKNESS * 2 * this.svgCtx.scale +
              this.svgCtx.gap,
          },
        ],
        scale: this.svgCtx.scale,
      }
    );

    this.leftSideMesh = this.sidePart.createMesh();
    this.leftSideMesh.position.set(
      -_.BREADTH / 2 + _.TRENCH_OFFSET + _.THICKNESS,
      0,
      _.DEPTH / 2 - _.TRENCH_OFFSET / 2
    );
    this.leftSideMesh.rotation.set(
      this.#radians(0),
      this.#radians(-90),
      this.#radians(0)
    );

    this.rightSideMesh = this.sidePart.createMesh();
    this.rightSideMesh.position.set(
      _.BREADTH / 2 - _.TRENCH_OFFSET,
      0,
      _.DEPTH / 2 - _.TRENCH_OFFSET / 2
    );
    this.rightSideMesh.rotation.set(
      this.#radians(0),
      this.#radians(-90),
      this.#radians(0)
    );
  };

  #initializeFrontPart = (_) => {
    const height = this.#calculateHeight(_.FRONT_ANGLE, _.DEPTH / 2);
    const hypotenuse = this.#calculateHypotenuse(_.DEPTH / 2, height);
    this.frontPart = new FrontPart(
      _.BREADTH,
      hypotenuse,
      { x: 0, y: 0 },
      _.TRENCH_OFFSET,
      _.THICKNESS,
      _.THICKNESS,
      {
        ctx: this.svgCtx,
        position: {
          x: this.svgCtx.width / 2,
          y:
            75 +
            2 * this.svgCtx.scale * _.DEPTH +
            2 * this.svgCtx.scale * _.LENGTH +
            hypotenuse * this.svgCtx.scale +
            this.svgCtx.gap * 2 +
            10,
        },
        scale: this.svgCtx.scale,
      }
    );

    this.frontPartMesh = this.frontPart.createMesh();
    this.frontPartMesh.position.set(
      0,
      -_.LENGTH / 2 - height / 2,
      _.DEPTH / 4 + _.THICKNESS
    );
    this.frontPartMesh.rotation.set(
      this.#radians(90 + _.FRONT_ANGLE-1),
      this.#radians(0),
      this.#radians(0)
    );
  };
  #radians = (deg) => (deg * Math.PI) / 180;
  #calculateHeight = (angle, halfDepth) => {
    const res = Math.tan(this.#radians(angle));
    return res * halfDepth;
  };
  #calculateHypotenuse = (a, b) => {
    return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
  };
}
