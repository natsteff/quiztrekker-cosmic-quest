"use strict";

const planetFactSource = "https://nssdc.gsfc.nasa.gov/planetary/factsheet/";
const moonCountSource = "https://ssd.jpl.nasa.gov/sats/discovery.html";
const planetFacts = {
  mercury: ["Rocky planet", 1407.6, 88, .330, 0, "A very thin exosphere contains oxygen, sodium, hydrogen, helium, and potassium.", "Silicate rock surrounds a disproportionately large iron-rich core.", "One spin takes about 59 Earth days. From one solar noon to the next takes about 176 Earth days."],
  venus: ["Rocky planet", -5832.5, 224.7, 4.87, 0, "Mostly carbon dioxide, with nitrogen and clouds of sulfuric acid.", "A rocky crust and mantle surround a metallic core.", "Venus spins backward relative to its orbit. One spin takes about 243 Earth days, while solar noon returns after about 117 Earth days."],
  earth: ["Rocky planet", 23.9, 365.2, 5.97, 1, "Mostly nitrogen and oxygen, with argon, carbon dioxide, and variable water vapor.", "A rocky crust and mantle surround an iron-rich core. Liquid water covers much of the surface.", "A spin relative to the stars takes just under 24 hours. The average solar day is 24 hours."],
  mars: ["Rocky planet", 24.6, 687, .642, 2, "A thin atmosphere dominated by carbon dioxide, with nitrogen and argon.", "Rock and iron-rich dust cover a rocky mantle and a metallic core.", "A spin takes about 24 hours 37 minutes. A Martian solar day, called a sol, is about 24 hours 39 minutes."],
  jupiter: ["Gas giant", 9.9, 4331, 1898, 115, "Mostly hydrogen and helium. Ammonia ice helps form the upper clouds.", "Mostly hydrogen and helium, with liquid metallic hydrogen deep inside and heavier material toward the center.", "The quoted spin is a reference period. Cloud bands at different latitudes rotate at different rates."],
  saturn: ["Gas giant", 10.7, 10747, 568, 293, "Mostly hydrogen and helium, with traces of methane and ammonia.", "Hydrogen and helium dominate, with liquid metallic hydrogen deep inside and a region enriched in heavier materials.", "The quoted spin is approximate. Saturn has no solid surface to track, and its cloud bands rotate at different rates."],
  uranus: ["Ice giant", -17.2, 30589, 86.8, 29, "Mostly hydrogen and helium, with methane that absorbs red light.", "An envelope of gas surrounds a hot, dense interior rich in water, methane, and ammonia above a rocky core.", "Uranus rotates on its side and in the retrograde direction. The quoted spin is a reference period."],
  neptune: ["Ice giant", 16.1, 59800, 102, 16, "Mostly hydrogen and helium, with a smaller amount of methane.", "An envelope of gas surrounds a hot, dense interior rich in water, methane, and ammonia above heavier core material.", "The quoted spin is a reference period. Neptune’s visible atmosphere moves at different speeds with latitude."]
};

const moonOrbits = {
  moon: 27.3, phobos: .319, deimos: 1.26, io: 1.77, europa: 3.55,
  ganymede: 7.15, callisto: 16.69, titan: 15.95, enceladus: 1.37,
  titania: 8.71, triton: 5.88, charon: 6.39
};

const objectFacts = {
  sun: ["Star", "Hydrogen and helium plasma", "Energy", "Fusion in its core releases the energy that lights and warms the Solar System."],
  moon: ["Natural satellite", "Rocky surface", "Surface", "Fine dust and broken rock cover ancient craters and darker volcanic plains."],
  phobos: ["Natural satellite", "Irregular rocky body", "Surface", "Large impact craters and grooves mark its irregular surface."],
  deimos: ["Natural satellite", "Irregular rocky body", "Surface", "Loose surface debris softens the outlines of many of its craters."],
  io: ["Natural satellite", "Volcanic rocky surface", "Surface", "Volcanoes continually reshape the surface and leave colorful sulfur-rich deposits."],
  europa: ["Natural satellite", "Water-ice shell", "Interior", "A likely salty ocean lies between the outer ice shell and the rocky interior."],
  ganymede: ["Natural satellite", "Rock and water ice", "Interior", "Models suggest layers of ice and liquid water above its rocky interior."],
  callisto: ["Natural satellite", "Rock and water ice", "Surface", "Its dark, densely cratered surface preserves a long history of impacts."],
  titan: ["Natural satellite", "Thick nitrogen atmosphere", "Surface liquids", "Lakes and seas of methane and ethane collect mostly near the poles."],
  enceladus: ["Natural satellite", "Water-ice crust", "Interior", "A salty ocean under the ice feeds plumes that escape through south-polar fractures."],
  titania: ["Natural satellite", "Rock and water ice", "Surface", "Impact craters and large valleys mark the surface of Uranus’s largest moon."],
  triton: ["Natural satellite", "Nitrogen ice at the surface", "Orbit direction", "Its retrograde orbit runs opposite Neptune’s spin, evidence for a likely capture."],
  charon: ["Natural satellite", "Water ice at the surface", "Orbit", "Charon and Pluto circle their shared center of mass and keep the same faces toward one another."],
  ceres: ["Dwarf planet", "Main asteroid belt", "Surface", "Bright salt-rich deposits in Occator Crater point to brines that reached the surface."],
  pluto: ["Dwarf planet", "Kuiper Belt", "Surface", "Nitrogen ice fills Sputnik Planitia, the western half of Pluto’s bright heart-shaped region."],
  haumea: ["Dwarf planet", "Kuiper Belt", "Shape and ring", "A rapid spin helps explain its elongated shape. A stellar occultation revealed its ring."],
  makemake: ["Dwarf planet", "Kuiper Belt", "Surface", "Spectra reveal frozen methane. Hubble observations revealed a small moon."],
  eris: ["Dwarf planet", "Beyond Neptune", "Moon", "Dysnomia’s orbit lets astronomers estimate the mass of the Eris system."],
  asteroids: ["Small bodies", "Mostly rock or metal", "Example · Bennu", "OSIRIS-REx photographed Bennu and returned a sample to Earth. Asteroids span a wide range of sizes."],
  comets: ["Small bodies", "Ice, dust, and rock", "Coma and tails", "Warming can release gas and dust from the nucleus. The ion tail generally points away from the Sun."]
};

const conceptExamples = {
  planets: "Compare Earth and Jupiter by diameter. A globe about 11 times wider has roughly 11 cubed, or 1,300 times, the volume if both are treated as spheres.",
  light: "A signal from a star 10 light-years away takes about 10 years to arrive. We see that star as it was about 10 years ago.",
  supernova: "The Crab Nebula is debris left behind by an explosion that observers on Earth recorded in 1054. Its core contains a rapidly spinning neutron star.",
  "black-hole": "Gas can glow brightly as it circles outside a black hole. Once light crosses the event horizon, it cannot escape to distant observers.",
  time: "Satellite and ground clocks can accumulate different amounts of time. GPS accounts for both orbital speed and the difference in gravity.",
  expansion: "If a light wave’s wavelength doubles while crossing expanding space, its received wavelength is twice its emitted wavelength."
};

const conceptUses = {
  planets: "Diameter comparisons help you see how different rocky planets and giants are in size.",
  light: "Light-years make distances between stars easier to describe.",
  supernova: "These explosions spread material that can become part of new stars and planets.",
  "black-hole": "Black holes let scientists study gravity in extreme conditions.",
  time: "Accounting for clock differences helps GPS give accurate positions.",
  expansion: "Changing wavelengths help astronomers study how the universe has expanded."
};

const locationFacts = new Set(["ceres", "pluto", "haumea", "makemake", "eris"]);

function factRows(rows, className = "") {
  const list = make("dl");
  list.className = "learn-facts " + className;
  for (const [label, value] of rows) {
    const row = make("div");
    row.append(make("dt", label));
    const detail = make("dd");
    detail.append(value);
    row.append(detail);
    list.append(row);
  }
  return list;
}

function orbitTime(days) {
  return numberLabel(days, 3) + " Earth days" +
    (days >= 365 ? " (" + numberLabel(days / 365.25, 2) + " Earth years)" : "");
}

function oneSpin(hours) {
  const duration = Math.abs(hours);
  return duration >= 48 ? numberLabel(duration / 24, 1) + " Earth days" : numberLabel(duration) + " Earth hours";
}

function moonParent(card) {
  return card.id === "moon" ? "Earth" : card.id === "charon" ? "Pluto" : card.parent;
}

function renderSnapshot(container, card) {
  const planet = planetFacts[card.id];
  const object = objectFacts[card.id];
  container.replaceChildren();
  if (planet) {
    const [type, spin, orbit, , moons] = planet;
    const values = [type, oneSpin(spin), orbitTime(orbit), String(moons)];
    const rows = planetComparisons.map((metric, index) => {
      const button = make("button", values[index]);
      button.className = "fact-compare";
      button.setAttribute("aria-haspopup", "dialog");
      button.setAttribute("aria-label", `Compare ${metric.label.toLowerCase()}: ${values[index]}`);
      button.addEventListener("click", () => openPlanetComparison(metric, card.id));
      return [metric.label, button];
    });
    container.append(factRows(rows, "snapshot-facts"));
  } else if (object) {
    const [kind, makeup] = object;
    const rows = [["Type", kind], [locationFacts.has(card.id) ? "Location" : "Makeup", makeup]];
    if (moonOrbits[card.id]) {
      rows.push(["Orbits", moonParent(card)], ["One orbit", orbitTime(moonOrbits[card.id])]);
    }
    container.append(factRows(rows, "snapshot-facts"));
  } else {
    container.append(make("p", card.intro));
    if (conceptUses[card.id]) container.append(make("p", conceptUses[card.id]));
  }
}

function appendLearnFacts(back, card) {
  const planet = planetFacts[card.id];
  const object = objectFacts[card.id];
  back.replaceChildren();
  if (planet) {
    const [, spin, orbit, mass, moons, atmosphere, interior, day] = planet;
    const examples = make("span");
    const related = allCards.filter((candidate) => moonOrbits[candidate.id] && moonParent(candidate) === card.title);
    for (const [index, item] of related.entries()) {
      if (index) examples.append(", ");
      const position = learnCards.findIndex((candidate) => candidate.id === item.id);
      if (position < 0) examples.append(item.title);
      else {
        const button = make("button", item.title);
        button.className = "related-card";
        button.addEventListener("click", () => {
          selectCard(position);
          $("flip-card").focus();
        });
        examples.append(button);
      }
    }
    const count = make("span", moons + " confirmed as of November 24, 2026. ");
    count.append(sourceLink("Moon count source", moons === 0 || card.id === "earth" ? "https://science.nasa.gov/solar-system/moons/facts/" : moonCountSource));
    const rows = [
      ["Atmosphere", atmosphere], ["Surface and interior", interior],
      ["Day and year", oneSpin(spin) + " per spin. " + orbitTime(orbit) + " per orbit. " + day],
      ["Mass", numberLabel(mass, 3) + " × 10²⁴ kg · " + numberLabel(mass / planetFacts.earth[3], 2) + " Earth masses"],
      ["Moons", count]
    ];
    if (related.length) rows.push(["Featured moons", examples]);
    back.append(factRows(rows), sourceLink("Rotation, orbit, and mass data", planetFactSource));
  } else if (object) {
    const [, makeup, label, fact] = object;
    const rows = [["Overview", card.intro], [locationFacts.has(card.id) ? "Location" : "Makeup", makeup], [label, fact]];
    if (moonOrbits[card.id]) {
      const orbit = make("span", orbitTime(moonOrbits[card.id]) + " around " + moonParent(card) + ". ");
      orbit.append(sourceLink("Orbit source", "https://ssd.jpl.nasa.gov/sats/elem/"));
      rows.push(["Orbital period", orbit]);
    }
    back.append(factRows(rows));
  } else {
    back.append(factRows([["Example", conceptExamples[card.id] || card.intro]]));
  }
  if (preferences.level === "advanced") {
    back.append(factRows([["Go deeper", card.detail]]));
  } else if (planet) {
    back.append(factRows([["Worth knowing", card.intro]]));
  }
}

const fullAdjacentCredits = new Set(["haumea", "supernova"]);
const shortCredits = {
  mercury: "NASA / JHU APL / Carnegie Institution",
  pluto: "NASA / JHU APL / SwRI",
  charon: "NASA / JHU APL / SwRI",
  phobos: "NASA / JPL-Caltech / UArizona",
  deimos: "NASA / JPL-Caltech / UArizona",
  io: "NASA / JPL / UArizona",
  jupiter: "NASA / JPL / UArizona",
  "black-hole": "NASA Goddard / Jeremy Schnittman"
};

const creditCaptions = {
  saturn: "Color and contrast enhanced",
  deimos: "Cropped HiRISE view",
  titan: "Natural color",
  sun: "Ultraviolet image",
  venus: "Radar simulation",
  charon: "Enhanced color",
  ceres: "Approximate color",
  haumea: "Hubble observation · Surface and ring unresolved",
  makemake: "Artist’s concept",
  eris: "Artist’s concept",
  supernova: "Webb infrared composite",
  "black-hole": "Visualization",
  comets: "Comet NEOWISE · Cropped and resized"
};

function renderImageCredit(container, card) {
  const [, , , credit] = artwork[card.id];
  const caption = creditCaptions[card.id] || (credit ? "" : "Illustration");
  container.replaceChildren(caption);
  if (!credit) return;
  if (caption) container.append(" · ");
  const button = make("button", shortCredits[card.id] || credit);
  button.className = "credit-link";
  button.setAttribute("aria-label", "Full image credit for " + card.title);
  button.addEventListener("click", () => {
    const index = $("image-credits");
    const entry = $("image-credit-" + card.id);
    $("settings").showModal();
    index.open = true;
    entry.open = true;
    entry.querySelector("summary").focus();
  });
  if (fullAdjacentCredits.has(card.id)) {
    button.textContent = "Full details";
    container.append(credit, " · ", button);
  } else {
    container.append(button);
  }
}

function renderImageCreditsIndex() {
  const list = $("image-credit-list");
  for (const card of allCards) {
    const [, , type, credit, origin] = artwork[card.id];
    const entry = make("details");
    entry.id = "image-credit-" + card.id;
    entry.append(make("summary", card.title), make("p", type), make("p", credit || "Original Cosmic Quest diagram"));
    if (origin) entry.append(sourceLink("Original image", origin), " · ");
    if (card.id === "comets") {
      entry.append(sourceLink("CC BY 2.0 license", "https://creativecommons.org/licenses/by/2.0/"),
        make("p", "Cropped and resized for the Learn card."));
    } else if (origin?.includes("photojournal.jpl.nasa.gov") || card.id === "eris") {
      entry.append(sourceLink("JPL image use policy", "https://www.jpl.nasa.gov/jpl-image-use-policy/"));
    } else if (origin) {
      entry.append(sourceLink("NASA image use guidelines", "https://www.nasa.gov/nasa-brand-center/images-and-media/"));
      if (fullAdjacentCredits.has(card.id)) {
        entry.append(" · ", sourceLink("STScI content use policy", "https://www.stsci.edu/copyright"));
      }
    }
    list.append(entry);
  }
}

const planetComparisons = [
  { label: "Planet type", note: "The eight planets grouped by composition.", source: "https://science.nasa.gov/solar-system/planets/" },
  { label: "One spin", note: "Shortest to longest rotation relative to the stars. Giant-planet periods are reference values.", source: planetFactSource, value: (facts) => Math.abs(facts[1]), display: (facts) => oneSpin(facts[1]) + (facts[1] < 0 ? " · retrograde" : "") },
  { label: "One orbit", note: "Shortest to longest time to orbit the Sun.", source: planetFactSource, value: (facts) => facts[2], display: (facts) => orbitTime(facts[2]) },
  { label: "Confirmed moons", note: "Most to fewest. Equal counts share a rank. Counts checked November 24, 2026.", source: moonCountSource, value: (facts) => -facts[4], display: (facts) => String(facts[4]) }
];

function planetComparisonName(id, current) {
  const name = make("span", solarById.get(id).title);
  if (id === current) {
    const marker = make("small", "Current planet");
    marker.className = "comparison-current";
    name.append(marker);
  }
  return name;
}

function openPlanetComparison(metric, current) {
  const body = $("planet-comparison-body");
  $("planet-comparison-title").textContent = metric.label;
  $("planet-comparison-note").textContent = metric.note;
  $("planet-comparison-source").replaceChildren(sourceLink("Source data", metric.source));
  body.replaceChildren();

  if (metric.value) {
    const table = make("table");
    table.className = "planet-rank-table";
    const header = table.createTHead().insertRow();
    for (const label of ["Rank", "Planet", metric.label]) {
      const heading = make("th", label);
      heading.scope = "col";
      header.append(heading);
    }
    const rows = table.createTBody();
    const ranked = [...planetIds].sort((a, b) => metric.value(planetFacts[a]) - metric.value(planetFacts[b]));
    let rank = 0;
    let previous;
    for (const [index, id] of ranked.entries()) {
      const value = metric.value(planetFacts[id]);
      if (value !== previous) rank = index + 1;
      previous = value;
      const row = rows.insertRow();
      row.classList.toggle("is-current", id === current);
      row.insertCell().textContent = rank;
      const name = make("th");
      name.scope = "row";
      name.append(planetComparisonName(id, current));
      row.append(name);
      row.insertCell().textContent = metric.display(planetFacts[id]);
    }
    body.append(table);
  } else {
    const types = new Set(planetIds.map((id) => planetFacts[id][0]));
    for (const type of types) {
      const list = make("ul");
      list.className = "planet-type-list";
      for (const id of planetIds.filter((planet) => planetFacts[planet][0] === type)) {
        const item = make("li");
        item.classList.toggle("is-current", id === current);
        item.append(planetComparisonName(id, current));
        list.append(item);
      }
      body.append(make("h3", type === "Rocky planet" ? "Rocky planets" : type + "s"), list);
    }
  }

  $("planet-comparison").showModal();
  $("planet-comparison-title").focus();
}
