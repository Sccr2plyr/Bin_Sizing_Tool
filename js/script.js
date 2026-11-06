import * as THREE from "three";
import { OrbitControls } from "orbitcontrols";
import Bin from "whole";
import Measurements from "measurements";

const typeCheckbox = document.querySelector(".type-checkbox");
const unitLabels = document.querySelectorAll(".units");
const inputFields = document.querySelectorAll(".input-field");
const form = document.querySelector(".form");

const canvas = document.querySelector("canvas");
const canvasContainer = document.querySelector(".canvas-container");
canvas.width = canvasContainer.getBoundingClientRect().width;
canvas.height = canvasContainer.getBoundingClientRect().height;

const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

const fov = 60;
const aspect = canvas.width / canvas.height; // the canvas default
const near = 0.1;
const far = 1000;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(-35, 35, 70);

const controls = new OrbitControls(camera, renderer.domElement);

const scene = new THREE.Scene();
const bin3DObject = new Bin();

scene.add(bin3DObject.initialize(Measurements.measurements));
let svgContext = bin3DObject.getSvg();

const color = 0xffffff;
const intensity = 6;
const light = new THREE.DirectionalLight(color, intensity);
camera.add(light);
light.position.set(5, 5, 7);

scene.add(light);
scene.background = new THREE.Color(0x666666);

function render() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
requestAnimationFrame(render);

function formatInput() {
  let length = form["length"].value;
  let breadth = form["breadth"].value;
  let depth = form["depth"].value;
  let thickness = form["thickness"].value;

  let formatted = [length, breadth, depth, thickness].map((item) => {
    let [before, after] = item.split(".");
    if (after) {
      return before + "." + (after.length > 3 ? after.substring(0, 3) : after);
    } else {
      return before;
    }
  });
  form["length"].value = formatted[0];
  form["breadth"].value = formatted[1];
  form["depth"].value = formatted[2];
  form["thickness"].value = formatted[3];
}

function handleInput() {
  formatInput();
  let length = parseFloat(form["length"].value);
  let breadth = parseFloat(form["breadth"].value);
  let depth = parseFloat(form["depth"].value);
  let thickness = parseFloat(form["thickness"].value);
  if (
    Number.isFinite(length) &&
    Number.isFinite(breadth) &&
    Number.isFinite(depth) &&
    Number.isFinite(thickness)
  ) {
    let unit = typeCheckbox.checked ? "mm" : "in";
    let isNotValid = Measurements.isNotValid(
      length,
      breadth,
      depth,
      thickness,
      unit
    );

    if (isNotValid[0]) {
      alert(isNotValid[1]);
      return;
    }
    Measurements.set("LENGTH", length, unit);
    Measurements.set("BREADTH", breadth, unit);
    Measurements.set("DEPTH", depth, unit);
    Measurements.set("THICKNESS", thickness, unit);
    scene.remove(scene.getObjectByName("bin"));
    scene.add(bin3DObject.initialize(Measurements.measurements));
    svgContext = bin3DObject.getSvg();
  }
}

function downloadSvg() {
  let dl = document.createElement("a");
  document.body.appendChild(dl); // This line makes it work in Firefox.
  dl.style.display = "none";
  let svg = svgContext.getSvg();
  let svgString;
  if (window.ActiveXObject) {
    svgString = svg.xml;
  } else {
    let oSerializer = new XMLSerializer();
    svgString = oSerializer.serializeToString(svg);
  }
  dl.download = "binplan.svg";
  dl.href = "data:image/svg+xml;utf8," + encodeURIComponent(svgString);
  dl.click();
}

window.addEventListener("resize", () => {
  canvas.width = canvasContainer.getBoundingClientRect().width;
  canvas.height = canvasContainer.getBoundingClientRect().height;
  camera.aspect = canvas.width / canvas.height;
  camera.updateProjectionMatrix();
  renderer.setSize(canvas.width, canvas.height);
});

typeCheckbox.addEventListener("change", () => {
  unitLabels.forEach((label) => {
    label.innerHTML = typeCheckbox.checked ? "(mm)" : "(in)";
  });
  inputFields.forEach((inputField) => {
    inputField.value = Measurements.convert(
      parseFloat(inputField.value),
      typeCheckbox.checked ? "mm" : "in"
    );
  });
});

inputFields.forEach((inputField) => {
  inputField.addEventListener("change", handleInput);
});
form.addEventListener("submit", (e) => {
  e.preventDefault();
  downloadSvg();
});
