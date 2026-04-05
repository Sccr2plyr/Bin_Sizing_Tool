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
let selectedParts = new Set(partNames);

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
    image: productPlaceholder("Small Bin", "#3d5a80", "#ffffff"),
  },
  {
    id: "craft-storage",
    name: "Craft Storage Bin",
    lengthIn: 14,
    breadthIn: 9,
    depthIn: 6,
    thicknessIn: 0.25,
    image: productPlaceholder("Craft Bin", "#6d597a", "#ffffff"),
  },
  {
    id: "deep-organizer",
    name: "Deep Organizer",
    lengthIn: 16,
    breadthIn: 10,
    depthIn: 8,
    thicknessIn: 0.3,
    image: productPlaceholder("Deep Bin", "#355070", "#ffffff"),
  },
  {
    id: "garage-bin",
    name: "Garage Parts Bin",
    lengthIn: 20,
    breadthIn: 12,
    depthIn: 8,
    thicknessIn: 0.4,
    image: productPlaceholder("Garage Bin", "#293241", "#ffffff"),
  },
];

// Replace these placeholders with your real affiliate links and product images.
const affiliateProducts = [
  {
    id: "affiliate-1",
    name: "Honeycomb Laser Bed",
    url: "https://amzn.to/4mhfqPk",
    image: productPlaceholder("Honeycomb Bed", "#1d3557", "#ffffff"),
    alt: "Honeycomb laser bed",
  },
  {
    id: "affiliate-2",
    name: "Colored Basswood Sheets",
    url: "https://amzn.to/3PQ110o",
    image: productPlaceholder("Basswood", "#2a9d8f", "#ffffff"),
    alt: "Colored basswood sheets",
  },
  {
    id: "affiliate-3",
    name: "Natural Cork Coasters",
    url: "https://amzn.to/4dNPloT",
    image: productPlaceholder("Coasters", "#e76f51", "#ffffff"),
    alt: "Natural cork coasters",
  },
  {
    id: "affiliate-4",
    name: "Basswood Plywood Sheets",
    url: "https://amzn.to/48vXTgn",
    image: productPlaceholder("Plywood", "#6a4c93", "#ffffff"),
    alt: "Basswood plywood sheets",
  },
  {
    id: "affiliate-5",
    name: "Clear Acrylic Sheets",
    url: "https://amzn.to/4toovYH",
    image: productPlaceholder("Acrylic", "#457b9d", "#ffffff"),
    alt: "Clear acrylic sheets",
  },
  {
    id: "affiliate-6",
    name: "Colorful Aluminum Cards",
    url: "https://amzn.to/4bT1nMg",
    image: productPlaceholder("Aluminum", "#264653", "#ffffff"),
    alt: "Colorful aluminum cards",
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

function updatePresetPreview(item) {
  const hasLink = Boolean((item.url || "").trim());
  previewLink.href = hasLink ? item.url : "#";
  previewLink.classList.toggle("disabled", !hasLink);
  previewImg.src = item.image;
  previewName.textContent = item.name;
  previewMeta.textContent = hasLink
    ? "Sponsored affiliate product"
    : "Sponsored affiliate product · Link pending";
}

function renderPresetList() {
  if (!presetList) return;
  presetList.innerHTML = "";
  affiliateProducts.forEach((item) => {
    const card = document.createElement("a");
    card.className = "preset-item";
    card.href = (item.url || "").trim() || "#";
    card.target = "_blank";
    card.rel = "noopener noreferrer nofollow sponsored";
    card.setAttribute("aria-label", `Open sponsored link: ${item.name}`);
    card.innerHTML = `<img src="${item.image}" alt="${item.alt || item.name}"/><div class="preset-item-copy"><strong>${item.name}</strong><span>Sponsored link</span></div>`;
    presetList.appendChild(card);
  });
}

function renderAffiliateTrack(trackEl, items) {
  if (!trackEl) return;
  if (!items.length) {
    trackEl.innerHTML = '<span class="affiliate-tag">Add affiliate links in js/script.js</span>';
    return;
  }

  const chipMarkup = items
    .map(
      (item) => `<a class="affiliate-chip" href="${item.url}" target="_blank" rel="noopener noreferrer nofollow sponsored" aria-label="Sponsored link: ${item.name}"><img src="${item.image}" alt="${item.alt || item.name}" loading="lazy"/><span>${item.name}</span></a>`
    )
    .join("");

  const lane = `<div class="affiliate-lane"><span class="affiliate-tag" aria-hidden="true">Sponsored</span>${chipMarkup}</div>`;
  trackEl.innerHTML = `${lane}${lane}`;
}

function renderAffiliateStrips() {
  const items = affiliateProducts
    .filter((item) => (item.url || "").trim())
    .map((item) => ({
      name: item.name,
      url: item.url,
      image: item.image,
      alt: item.alt,
    }));

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

function handleInput(normalize = false) {
  if (normalize) formatInput();
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
  if (!handleInput(true)) return;
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
  handleInput();
});

inputFields.forEach((inputField) => {
  inputField.addEventListener("input", () => handleInput(false));
  inputField.addEventListener("change", () => handleInput(true));
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

if (affiliateProducts.length) {
  updatePresetPreview(affiliateProducts[0]);
}
renderPresetList();
renderAffiliateStrips();
setCanvasTab("preview");
handleInput(true);
