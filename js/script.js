import * as THREE from "three";
import { OrbitControls } from "orbitcontrols";
import Bin from "whole";
import Measurements from "measurements";

const typeCheckbox = document.querySelector(".type-checkbox");
const unitLabels = document.querySelectorAll(".units");
const inputFields = document.querySelectorAll(".input-field");
const form = document.querySelector(".form");
const errorMsg = document.getElementById("error-msg");
const presetList = document.getElementById("preset-list");
const previewLink = document.getElementById("preset-preview");
const previewImg = document.getElementById("preset-preview-image");
const previewName = document.getElementById("preset-preview-name");
const previewMeta = document.getElementById("preset-preview-meta");
const affiliateTrackTop = document.getElementById("affiliate-track-top");
const affiliateTrackBottom = document.getElementById("affiliate-track-bottom");
const canvasTabs = Array.from(document.querySelectorAll(".canvas-tab"));
const previewPanel = document.getElementById("panel-preview");
const chatPanel = document.getElementById("panel-chat");
const giscusHost = document.getElementById("giscus-thread");
let selectedPresetId = null;
let giscusLoaded = false;
let currentUnit = "in";

const canvas = document.querySelector("canvas");
const canvasContainer = document.querySelector(".canvas-container");
canvas.width = canvasContainer.getBoundingClientRect().width;
canvas.height = canvasContainer.getBoundingClientRect().height;

const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
renderer.setPixelRatio(window.devicePixelRatio);

const fov = 60;
const aspect = canvas.width / canvas.height; // the canvas default
const near = 0.1;
const far = 1000;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(-35, 35, 70);

const controls = new OrbitControls(camera, renderer.domElement);

const scene = new THREE.Scene();
const bin3DObject = new Bin();
const partNames = ["front", "back", "left", "right", "bottom"];
let selectedParts = new Set(["front"]);

scene.add(bin3DObject.initialize(Measurements.measurements));
let svgContext = bin3DObject.getSvg();

const color = 0xffffff;
const intensity = 6;
const light = new THREE.DirectionalLight(color, intensity);
camera.add(light);
light.position.set(5, 5, 7);

scene.add(light);
scene.background = new THREE.Color(0xededed);

// Configure these with your Giscus repository details.
const giscusConfig = {
  repo: "YOUR_GITHUB_USERNAME/YOUR_REPO",
  repoId: "YOUR_REPO_ID",
  category: "General",
  categoryId: "YOUR_CATEGORY_ID",
  mapping: "pathname",
  strict: "0",
  reactionsEnabled: "1",
  emitMetadata: "0",
  inputPosition: "top",
  theme: "light",
  lang: "en",
};

function productPlaceholder(label, bg, fg) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='720' height='220' viewBox='0 0 720 220'>
    <rect width='720' height='220' fill='${bg}'/>
    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='${fg}'
      font-family='Arial, Helvetica, sans-serif' font-size='38' font-weight='700'>${label}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const binPresets = [
  {
    id: "small-desktop",
    name: "Small Desktop Bin",
    lengthIn: 10,
    breadthIn: 6,
    depthIn: 4,
    thicknessIn: 0.25,
    affiliateUrl: "https://example.com/small-desktop-bin",
    image: productPlaceholder("Small Bin", "#3d5a80", "#ffffff"),
  },
  {
    id: "craft-storage",
    name: "Craft Storage Bin",
    lengthIn: 14,
    breadthIn: 9,
    depthIn: 6,
    thicknessIn: 0.25,
    affiliateUrl: "https://example.com/craft-storage-bin",
    image: productPlaceholder("Craft Bin", "#6d597a", "#ffffff"),
  },
  {
    id: "deep-organizer",
    name: "Deep Organizer",
    lengthIn: 16,
    breadthIn: 10,
    depthIn: 8,
    thicknessIn: 0.3,
    affiliateUrl: "https://example.com/deep-organizer-bin",
    image: productPlaceholder("Deep Bin", "#355070", "#ffffff"),
  },
  {
    id: "garage-bin",
    name: "Garage Parts Bin",
    lengthIn: 20,
    breadthIn: 12,
    depthIn: 8,
    thicknessIn: 0.4,
    affiliateUrl: "https://example.com/garage-parts-bin",
    image: productPlaceholder("Garage Bin", "#293241", "#ffffff"),
  },
];

function showPart(name) {
  if (name === "all") {
    selectedParts = new Set(partNames);
  } else if (selectedParts.has(name)) {
    if (selectedParts.size > 1) selectedParts.delete(name);
  } else {
    selectedParts.add(name);
  }

  updateVisibleParts();
}

function updateVisibleParts() {
  if (!bin3DObject.meshes) return;

  Object.entries(bin3DObject.meshes).forEach(([key, mesh]) => {
    mesh.visible = selectedParts.has(key);
  });

  document.querySelectorAll(".part-btn").forEach((btn) => {
    const part = btn.dataset.part;
    const isActive =
      part === "all"
        ? selectedParts.size === partNames.length
        : selectedParts.has(part);
    btn.classList.toggle("active", isActive);
  });
}

function formatPresetDimension(inches) {
  return currentUnit === "in"
    ? `${inches.toFixed(2)} in`
    : `${(inches * 25.4).toFixed(1)} mm`;
}

function setInputValueFromInches(id, inches) {
  const el = document.getElementById(id);
  el.value = currentUnit === "in" ? inches.toFixed(2) : (inches * 25.4).toFixed(2);
}

function updatePresetPreview(preset) {
  const hasLink = Boolean((preset.affiliateUrl || "").trim());
  previewLink.href = hasLink ? preset.affiliateUrl : "#";
  previewLink.classList.toggle("disabled", !hasLink);
  previewImg.src = preset.image;
  previewName.textContent = preset.name;
  const base = `L ${formatPresetDimension(preset.lengthIn)} · W ${formatPresetDimension(preset.breadthIn)} · H ${formatPresetDimension(preset.depthIn)} · T ${formatPresetDimension(preset.thicknessIn)}`;
  previewMeta.textContent = hasLink ? base : `${base} · Reference link pending`;
}

function applyPreset(preset) {
  selectedPresetId = preset.id;
  setInputValueFromInches("length", preset.lengthIn);
  setInputValueFromInches("breadth", preset.breadthIn);
  setInputValueFromInches("depth", preset.depthIn);
  setInputValueFromInches("thickness", preset.thicknessIn);
  updatePresetPreview(preset);
  renderPresetList();
  handleInput();
}

function renderPresetList() {
  if (!presetList) return;
  presetList.innerHTML = "";
  binPresets.forEach((preset) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "preset-item";
    if (preset.id === selectedPresetId) button.classList.add("active");
    button.setAttribute("aria-label", `${preset.name} preset`);
    button.innerHTML = `<img src="${preset.image}" alt="${preset.name}"/><div class="preset-item-copy"><strong>${preset.name}</strong><span>L ${formatPresetDimension(preset.lengthIn)}</span></div>`;
    button.addEventListener("click", () => applyPreset(preset));
    presetList.appendChild(button);
  });
}

function renderAffiliateTrack(trackEl, items) {
  if (!trackEl) return;
  if (!items.length) {
    trackEl.innerHTML = '<span class="affiliate-tag">No affiliate links</span>';
    return;
  }

  const chipMarkup = items
    .map(
      (item) => `<a class="affiliate-chip" href="${item.url}" target="_blank" rel="noopener noreferrer nofollow sponsored" aria-label="Sponsored link: ${item.name}">${item.name}</a>`
    )
    .join("");

  const lane = `<div class="affiliate-lane"><span class="affiliate-tag" aria-hidden="true">Sponsored</span>${chipMarkup}</div>`;
  trackEl.innerHTML = `${lane}${lane}`;
}

function renderAffiliateStrips() {
  const items = binPresets
    .filter((preset) => (preset.affiliateUrl || "").trim())
    .map((preset) => ({ name: preset.name, url: preset.affiliateUrl }));

  renderAffiliateTrack(affiliateTrackTop, items);
  renderAffiliateTrack(affiliateTrackBottom, items);
}

function giscusIsConfigured() {
  return !Object.values(giscusConfig).some((v) => String(v).includes("YOUR_"));
}

function loadGiscusIfNeeded() {
  if (giscusLoaded || !giscusHost) return;

  if (!giscusIsConfigured()) {
    giscusHost.innerHTML =
      '<p class="chat-note">Configure giscusConfig in js/script.js with your repo, repoId, and categoryId.</p>';
    giscusLoaded = true;
    return;
  }

  const script = document.createElement("script");
  script.src = "https://giscus.app/client.js";
  script.async = true;
  script.crossOrigin = "anonymous";
  script.setAttribute("data-repo", giscusConfig.repo);
  script.setAttribute("data-repo-id", giscusConfig.repoId);
  script.setAttribute("data-category", giscusConfig.category);
  script.setAttribute("data-category-id", giscusConfig.categoryId);
  script.setAttribute("data-mapping", giscusConfig.mapping);
  script.setAttribute("data-strict", giscusConfig.strict);
  script.setAttribute("data-reactions-enabled", giscusConfig.reactionsEnabled);
  script.setAttribute("data-emit-metadata", giscusConfig.emitMetadata);
  script.setAttribute("data-input-position", giscusConfig.inputPosition);
  script.setAttribute("data-theme", giscusConfig.theme);
  script.setAttribute("data-lang", giscusConfig.lang);
  giscusHost.appendChild(script);
  giscusLoaded = true;
}

function setCanvasTab(tabName) {
  const isChat = tabName === "chat";

  canvasTabs.forEach((btn) => {
    const active = btn.dataset.tab === tabName;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", String(active));
  });

  previewPanel?.classList.toggle("active", !isChat);
  chatPanel?.classList.toggle("active", isChat);
  chatPanel?.setAttribute("aria-hidden", String(!isChat));

  if (isChat) loadGiscusIfNeeded();
}

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
      errorMsg.textContent = isNotValid[1];
      errorMsg.style.display = "block";
      return false;
    }

    errorMsg.style.display = "none";
    Measurements.set("LENGTH", length, unit);
    Measurements.set("BREADTH", breadth, unit);
    Measurements.set("DEPTH", depth, unit);
    Measurements.set("THICKNESS", thickness, unit);
    scene.remove(scene.getObjectByName("bin"));
    scene.add(bin3DObject.initialize(Measurements.measurements));
    svgContext = bin3DObject.getSvg();
    updateVisibleParts();
  }
  return true;
}

function downloadSvg() {
  if (!handleInput()) return;
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
  const nextUnit = typeCheckbox.checked ? "mm" : "in";
  unitLabels.forEach((label) => {
    label.innerHTML = typeCheckbox.checked ? "(mm)" : "(in)";
  });
  inputFields.forEach((inputField) => {
    inputField.value = Measurements.convert(
      parseFloat(inputField.value),
      nextUnit
    );
  });
  currentUnit = nextUnit;
  renderPresetList();
  if (selectedPresetId) {
    const preset = binPresets.find((p) => p.id === selectedPresetId);
    if (preset) updatePresetPreview(preset);
  }
  handleInput();
});

inputFields.forEach((inputField) => {
  inputField.addEventListener("input", handleInput);
  inputField.addEventListener("change", handleInput);
});
form.addEventListener("submit", (e) => {
  e.preventDefault();
  downloadSvg();
});

canvasTabs.forEach((btn) => {
  btn.addEventListener("click", () => setCanvasTab(btn.dataset.tab));
});

document.querySelectorAll(".part-btn").forEach((btn) => {
  btn.addEventListener("click", () => showPart(btn.dataset.part));
});

if (binPresets.length) {
  selectedPresetId = binPresets[0].id;
  updatePresetPreview(binPresets[0]);
}
renderPresetList();
renderAffiliateStrips();
setCanvasTab("preview");
handleInput();
