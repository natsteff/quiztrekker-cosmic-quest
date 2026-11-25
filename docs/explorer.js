"use strict";

const sizeSources = {
  planets: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/index.html",
  moons: "https://ssd.jpl.nasa.gov/sats/phys_par/",
  dwarf: "https://science.nasa.gov/solar-system/planets/planet-sizes-and-locations-in-our-solar-system/",
  sun: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/ves.html",
  betelgeuse: "https://doi.org/10.3847/1538-4357/abb8db",
  martianMoons: "https://science.nasa.gov/wp-content/uploads/2023/05/7a.20190117_PlanetaryProtectionClassificationofSample_RetMissionsfromtheMartianMoons.pdf",
  haumea: "https://www.sciencedirect.com/science/article/pii/S0019103518304159"
};

const moonSizes = {
  moon: 3474.8, phobos: 22.16, deimos: 12.4, io: 3642.98, europa: 3121.6,
  ganymede: 5262.4, callisto: 4820.6, titan: 5149.52, enceladus: 504.2,
  titania: 1577.8, triton: 2705.2, charon: 1212
};

const dwarfDiameters = { ceres: 964, pluto: 2376, eris: 2326, makemake: 1434 };
const dimensions = {
  phobos: [[26.06, 22.8, 18.28], sizeSources.martianMoons],
  deimos: [[15, 12.1, 10.4], sizeSources.martianMoons],
  haumea: [[2322, 1704, 1026], sizeSources.haumea]
};
const sunDiameter = 1392000;
const earthDiameter = planetMeasurements.earth[0];
const betelgeuseDiameter = sunDiameter * 764;
const planetIds = solarOrder.slice(1, 9);
const sizeOrder = [...planetIds].sort((a, b) => planetMeasurements[a][0] - planetMeasurements[b][0]);
const dwarfOrbits = { ceres: 413, pluto: 5906.4, haumea: 6500, makemake: 6900, eris: 10100 };

const worldColors = {
  sun: "#ffca6f", mercury: "#aaa3b3", venus: "#f3b26b", earth: "#79bbff",
  mars: "#ec8e74", jupiter: "#dec0a2", saturn: "#e8d1a7",
  uranus: "#a1e2e6", neptune: "#889fff", betelgeuse: "#f38c77"
};

function numberLabel(number, digits = 1) {
  return number.toLocaleString(undefined, { maximumFractionDigits: digits });
}

function measure(id) {
  if (planetMeasurements[id]) return [planetMeasurements[id][0], "Equatorial diameter", sizeSources.planets];
  if (moonSizes[id]) return [moonSizes[id], "Mean diameter", sizeSources.moons];
  if (dwarfDiameters[id]) return [dwarfDiameters[id], id === "pluto" ? "Diameter" : "Approximate equatorial diameter", sizeSources.dwarf];
  if (id === "haumea") return [2322, "Estimated longest axis", sizeSources.haumea];
  if (id === "sun") return [sunDiameter, "Approximate diameter", sizeSources.sun];
  return [betelgeuseDiameter, "Estimated diameter", sizeSources.betelgeuse];
}

function worldLabel(id) {
  return id === "betelgeuse" ? "Betelgeuse" : solarById.get(id).title;
}

function coloredDisk(id, width) {
  const disk = make("span");
  disk.className = "size-disk";
  disk.style.setProperty("--disk-size", width + "%");
  disk.style.setProperty("--disk-color", worldColors[id] || "#beb2d4");
  disk.setAttribute("aria-hidden", "true");
  return disk;
}

function sourceLink(label, url) {
  const link = make("a", label);
  link.href = url;
  return link;
}

function ratioLabel(value, reference) {
  const ratio = value / reference;
  if (ratio < .001) return "about 1/" + numberLabel(Math.round(1 / ratio), 0) + " as wide as";
  if (ratio < 1) return "about " + numberLabel(ratio * 100, 2) + "% as wide as";
  return "about " + numberLabel(ratio, ratio < 2 ? 2 : 1) + "× as wide as";
}

function appendSizeDetails(container, card) {
  const { id, topic } = card;
  let comparisons;
  if (id === "sun") comparisons = ["earth", "betelgeuse"];
  else if (planetMeasurements[id]) comparisons = [id === "earth" ? "jupiter" : "earth", "sun"];
  else if (id === "moon") comparisons = ["earth"];
  else if (id === "charon") comparisons = ["moon", "pluto"];
  else if (card.parent) comparisons = ["moon", card.parent.toLowerCase()];
  else if (topic === "small" && (dwarfDiameters[id] || id === "haumea")) comparisons = ["moon", "earth"];
  else return;

  const [value, kind, source] = measure(id);
  const section = make("section");
  section.className = "size-details";
  const measurement = make("p");
  measurement.append(make("strong", kind + " · "), numberLabel(value, 2) + " km");
  section.append(make("h2", "Size"), measurement);
  if (dimensions[id]) {
    const [axes, link] = dimensions[id];
    const axisLabel = make("p", "Estimated dimensions: " + axes.map((axis) => numberLabel(axis, 2)).join(" × ") + " km");
    axisLabel.append(" · ", sourceLink("Dimensions source", link));
    section.append(axisLabel);
  }
  for (const reference of comparisons) {
    const [otherValue, , otherSource] = measure(reference);
    const largest = Math.max(value, otherValue);
    const pair = make("figure");
    pair.className = "comparison-pair";
    const bars = make("div");
    bars.className = "comparison-disks";
    for (const [world, width] of [[id, value], [reference, otherValue]]) {
      const column = make("div");
      column.className = "comparison-column";
      const proportional = width / largest * 86;
      const area = make("div");
      area.className = "comparison-disk-area";
      area.append(coloredDisk(world, proportional));
      column.append(area, make("span", worldLabel(world)));
      if (proportional < 8) {
        const inset = make("div");
        inset.className = "comparison-inset";
        const magnification = Math.ceil(14 / proportional);
        inset.append(coloredDisk(world, proportional * magnification), make("small", magnification + "× inset"));
        column.append(inset);
      }
      bars.append(column);
    }
    const caption = make("figcaption", card.title + " is " + ratioLabel(value, otherValue) + " " + worldLabel(reference) + ".");
    caption.append(" ", sourceLink(reference === "betelgeuse" ? "Betelgeuse size estimate" : "Reference measurement", otherSource));
    pair.append(bars, caption);
    section.append(pair);
  }
  section.append(sourceLink("Size measurement source", source));
  container.append(section);
}

let explorerMode = "browse";
let explorerSystem = null;
let explorerZoom = 1;
let explorerReturn = false;
let explorerCardButton = null;
let explorerCardId = null;
let explorerScroll = 0;
let explorerViewport;
let explorerCanvas;
let markerObserver;
let explorerPlanets = new Set();

function setExplorerReturn(value) {
  explorerReturn = value;
  const button = $("open-explorer");
  const longLabel = make("span", "Solar System ");
  longLabel.className = "wide-explorer-label";
  button.replaceChildren(...(value ? ["Back to Explorer"] : [longLabel, "Explorer"]));
}

function showCards() {
  $("explorer").hidden = true;
  $("learn-cards").hidden = false;
  $("open-explorer").hidden = false;
}

function openExplorer() {
  if (fullscreenLayout) return;
  document.body.classList.remove("inner-scroll");
  $("learn-cards").hidden = true;
  $("open-explorer").hidden = true;
  $("explorer").hidden = false;
  const button = explorerCardButton?.isConnected ? explorerCardButton :
    [...$("explorer-map").querySelectorAll("[data-world]")].find((item) => item.dataset.world === explorerCardId);
  if (explorerReturn && button) {
    button.focus({ preventScroll: true });
    window.scrollTo(0, explorerScroll);
  } else $("explorer-title").focus();
}

function explorerMoons(id) {
  const title = worldLabel(id);
  return learnCards.filter((card) => card.parent === title ||
    (id === "earth" && card.id === "moon") || (id === "pluto" && card.id === "charon"));
}

function makeWorldButton(id, label = worldLabel(id)) {
  const button = make("button", label);
  button.dataset.world = id;
  button.addEventListener("click", () => {
    explorerScroll = window.scrollY;
    explorerCardButton = button;
    explorerCardId = id;
    showCards();
    setExplorerReturn(true);
    selectCard(learnCards.findIndex((card) => card.id === id));
    $("flip-card").focus();
  });
  return button;
}

function renderSizeLineup(map) {
  const panel = make("section");
  panel.className = "panel size-lineup";
  function lineup(ids, maximum, title) {
    const heading = make("h3", title);
    const list = make("ol");
    for (const id of ids) {
      const item = make("li");
      const [diameter, kind] = measure(id);
      const row = makeWorldButton(id);
      const measurement = make("span", numberLabel(diameter, 0) + " km");
      if (id === "moon") measurement.append(make("small", kind));
      row.replaceChildren(make("strong", worldLabel(id)), measurement, make("span", numberLabel(diameter / earthDiameter, 2) + "× Earth"));
      const graphic = make("span");
      graphic.className = "lineup-graphic";
      graphic.append(coloredDisk(id, diameter / maximum * 92));
      row.append(graphic);
      item.append(row);
      list.append(item);
    }
    panel.append(heading, list);
  }
  lineup(["moon", ...sizeOrder, "sun"], sunDiameter, "Smallest to largest · Sun, planets, and Moon");
  lineup(sizeOrder, planetMeasurements.jupiter[0], "Planets · magnified about 10×");
  lineup(sizeOrder.slice(0, 4), earthDiameter, "Rocky planets · magnified about 11× from the planet view");
  panel.append(sourceLink("NASA planetary measurements", sizeSources.planets), " · ",
    sourceLink("Sun diameter", sizeSources.sun), " · ", sourceLink("Moon diameter", sizeSources.moons));
  map.append(panel);
}

function orbitSVG(radii) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 800 800");
  svg.setAttribute("aria-hidden", "true");
  for (const radius of radii) {
    const ring = document.createElementNS(ns, "circle");
    ring.setAttribute("cx", "400");
    ring.setAttribute("cy", "400");
    ring.setAttribute("r", radius);
    svg.append(ring);
  }
  return svg;
}

function fitDistanceMarkers(canvas) {
  const markers = [...canvas.querySelectorAll(".orbit-world")];
  const width = canvas.offsetWidth;
  const positions = markers.map((marker) => [
    parseFloat(marker.style.left) * width / 100,
    parseFloat(marker.style.top) * width / 100
  ]);
  for (const [index, marker] of markers.entries()) {
    const [x, y] = positions[index];
    const closest = Math.min(...positions.map(([otherX, otherY], other) =>
      other === index ? Infinity : Math.hypot(x - otherX, y - otherY)));
    const hitSize = Math.min(44, Math.max(2, (closest - 1) / Math.SQRT2));
    marker.style.setProperty("--orbit-hit-size", hitSize + "px");
    // At overview scale, move tightly clustered worlds to the full-size list.
    const crowded = hitSize < 24;
    marker.classList.toggle("orbit-crowded", crowded);
    if (marker instanceof HTMLButtonElement) marker.tabIndex = crowded ? -1 : 0;
  }
}

function applyZoom(zoom, center) {
  const viewport = explorerViewport;
  const canvas = explorerCanvas;
  const size = canvas.offsetWidth;
  const base = Math.max(1, Math.min(viewport.clientWidth, viewport.clientHeight));
  const midpoint = center ? [.5, .5] : [
    (viewport.scrollLeft + viewport.clientWidth / 2) / size,
    (viewport.scrollTop + viewport.clientHeight / 2) / size
  ];
  explorerZoom = Math.min(96, Math.max(1, zoom));
  canvas.style.width = base * explorerZoom + "px";
  viewport.scrollLeft = midpoint[0] * canvas.offsetWidth - viewport.clientWidth / 2;
  viewport.scrollTop = midpoint[1] * canvas.offsetHeight - viewport.clientHeight / 2;
  if (viewport.classList.contains("orbit-distance")) fitDistanceMarkers(canvas);
  $("orbit-zoom-level").textContent = numberLabel(explorerZoom, 2) + "×";
}

function renderOrbits(map, center, ids) {
  const distance = explorerMode === "distance" && !explorerSystem;
  const colors = worldColors;
  const metrics = (id) => planetMeasurements[id]?.[1] || dwarfOrbits[id];
  const maximum = distance ? Math.max(...ids.map(metrics), 4515) : 1;
  const radii = ids.map((id, index) => distance
    ? 345 * metrics(id) / maximum
    : 62 + index * (283 / Math.max(1, ids.length - 1)));
  const tools = make("div");
  tools.className = "orbit-tools";
  const zoomLevel = make("output", "1×");
  zoomLevel.id = "orbit-zoom-level";
  for (const [label, action] of [
    ["Zoom in", () => applyZoom(explorerZoom * 2, false)],
    ["Zoom out", () => applyZoom(explorerZoom / 2, false)],
    ["Reset view", () => applyZoom(1, true)]
  ]) {
    const button = make("button", label);
    button.addEventListener("click", action);
    tools.append(button);
  }
  if (distance) {
    const inner = make("button", "Zoom to inner planets");
    inner.addEventListener("click", () => {
      const base = Math.min(explorerViewport.clientWidth, explorerViewport.clientHeight);
      const mercuryRadius = 345 * planetMeasurements.mercury[1] / maximum;
      const zoom = Math.max(16, Math.ceil(46 * 800 / (base * mercuryRadius)));
      applyZoom(zoom, true);
    });
    tools.append(inner);
  }
  tools.append(zoomLevel);
  explorerViewport = make("div");
  explorerViewport.className = "orbit-viewport";
  explorerViewport.tabIndex = 0;
  explorerViewport.setAttribute("aria-label", "Scrollable orbit map");
  explorerCanvas = make("div");
  explorerCanvas.className = "orbit-canvas";
  explorerCanvas.append(orbitSVG(radii));
  for (const [index, id] of [center, ...ids].entries()) {
    const radius = index ? radii[index - 1] : 0;
    const angle = (index * 137.5 - 117) * Math.PI / 180;
    const px = (400 + radius * Math.cos(angle)) / 8;
    const py = (400 + radius * Math.sin(angle)) / 8;
    const node = explorerPlanets.has(id) ? makeWorldButton(id) : make("span", worldLabel(id));
    node.className = "orbit-world";
    node.style.left = px + "%";
    node.style.top = py + "%";
    node.style.setProperty("--world-color", colors[id] || "#c6b9e8");
    const dot = make("span");
    dot.className = "orbit-world-dot";
    dot.setAttribute("aria-hidden", "true");
    const name = make("span", worldLabel(id));
    name.className = "orbit-world-name";
    node.replaceChildren(dot, name);
    if (distance && index && metrics(id)) {
      node.title = numberLabel(metrics(id)) + " million km from the Sun";
    }
    explorerCanvas.append(node);
  }
  explorerViewport.classList.toggle("orbit-distance", distance);
  explorerViewport.append(explorerCanvas);
  map.append(tools, explorerViewport);
  const viewport = explorerViewport;
  if (distance) {
    const canvas = explorerCanvas;
    markerObserver = new ResizeObserver(() => {
      if (canvas.offsetWidth) fitDistanceMarkers(canvas);
    });
    markerObserver.observe(canvas);
  }
  let drag;
  viewport.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0 || event.target.closest("button")) return;
    drag = [event.clientX + viewport.scrollLeft, event.clientY + viewport.scrollTop];
    viewport.setPointerCapture(event.pointerId);
  });
  viewport.addEventListener("pointermove", (event) => {
    if (drag) viewport.scrollTo(drag[0] - event.clientX, drag[1] - event.clientY);
  });
  viewport.addEventListener("lostpointercapture", () => { drag = null; });
  requestAnimationFrame(() => {
    if (explorerViewport === viewport && !$("explorer").hidden) applyZoom(explorerZoom, true);
  });
}

function renderExplorer() {
  const map = $("explorer-map");
  markerObserver?.disconnect();
  map.replaceChildren();
  explorerViewport = null;
  explorerPlanets = new Set(learnCards.map((card) => card.id));
  const note = $("explorer-note");
  if (explorerMode === "sizes") {
    note.textContent = "Compare diameters on a common scale. Planets use equatorial diameter; the Moon uses mean diameter. Saturn’s rings are excluded.";
    if (explorerPlanets.has("sun")) renderSizeLineup(map);
    else map.append(make("p", "Enable Solar System Basics in Settings to compare planet sizes."));
    return;
  }

  const parents = [...planetIds, "pluto"].filter((id) => explorerMoons(id).length);
  if (explorerSystem && !parents.includes(explorerSystem)) explorerSystem = null;
  const header = make("div");
  header.className = "orbit-system-controls";
  if (explorerSystem) {
    const back = make("button", "Back to Solar System");
    back.addEventListener("click", () => {
      explorerSystem = null;
      explorerZoom = 1;
      renderExplorer();
      $("explorer-title").focus();
    });
    header.append(make("strong", worldLabel(explorerSystem) + " system"), back);
  } else if (parents.length) {
    const select = make("select");
    const label = make("label", "Moon systems");
    label.append(select);
    select.append(make("option", "Choose a system"));
    for (const id of parents) {
      const option = make("option", worldLabel(id));
      option.value = id;
      select.append(option);
    }
    select.addEventListener("change", () => {
      if (!parents.includes(select.value)) return;
      explorerSystem = select.value;
      explorerZoom = 1;
      renderExplorer();
      map.querySelector("button").focus();
    });
    header.append(label);
  }
  if (header.children.length) map.append(header);

  const ids = explorerSystem ? explorerMoons(explorerSystem).map((card) => card.id) :
    [...planetIds, ...Object.keys(dwarfOrbits)].filter((id) => explorerPlanets.has(id))
      .sort((a, b) => (planetMeasurements[a]?.[1] || dwarfOrbits[a]) - (planetMeasurements[b]?.[1] || dwarfOrbits[b]));
  if (explorerSystem) note.textContent = "Moon system schematic. Orbit spacing, positions, and icon sizes are illustrative.";
  else if (explorerMode === "distance") note.textContent = "Each ring radius represents the orbit’s semimajor axis on one linear distance scale. Orbits are drawn as circles. Icon sizes and positions along the rings are illustrative. Zoom in or use the world list to choose a crowded marker.";
  else note.textContent = "Schematic orbit map. Sizes, spacing, and positions are illustrative. Rotate to landscape for more room.";

  if (ids.length || explorerPlanets.has("sun")) {
    renderOrbits(map, explorerSystem || "sun", ids);
    if (explorerMode === "distance" && !explorerSystem) {
      const sources = make("p");
      sources.className = "orbit-sources";
      sources.append(sourceLink("Planet orbit distances", sizeSources.planets));
      if (ids.some((id) => Object.hasOwn(dwarfOrbits, id))) {
        sources.append(" · ", sourceLink("Dwarf planet orbit distances", sizeSources.dwarf));
      }
      map.append(sources);
    }
    const list = make("details");
    list.className = "panel orbit-world-list";
    list.open = explorerMode === "distance" && !explorerSystem;
    list.append(make("summary", "List of worlds on this map"));
    const choices = make("div");
    choices.className = "choices";
    for (const id of [explorerSystem || "sun", ...ids].filter((id) => explorerPlanets.has(id))) {
      choices.append(makeWorldButton(id));
    }
    for (const id of ["asteroids", "comets"].filter((id) => !explorerSystem && explorerPlanets.has(id))) {
      choices.append(makeWorldButton(id));
    }
    list.append(choices);
    map.append(list);
  } else if (!parents.length) {
    map.append(make("p", "Enable a Solar System content pack in Settings to explore its worlds."));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  $("open-explorer").addEventListener("click", () => {
    openExplorer();
    if (!explorerReturn && explorerViewport) applyZoom(explorerZoom, true);
  });
  $("close-explorer").addEventListener("click", () => {
    showCards();
    setExplorerReturn(false);
    $("open-explorer").focus();
  });
  for (const button of document.querySelectorAll("[data-explorer-mode]")) {
    button.addEventListener("click", () => {
      explorerMode = button.dataset.explorerMode;
      explorerSystem = null;
      explorerZoom = 1;
      for (const item of document.querySelectorAll("[data-explorer-mode]")) {
        item.setAttribute("aria-pressed", String(item === button));
      }
      renderExplorer();
    });
  }
});
