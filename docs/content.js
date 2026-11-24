const topics = {
  solar: "Solar System Basics",
  moons: "Moons of Other Planets",
  small: "Dwarf Planets & Small Worlds",
  scale: "Space & Time",
  stars: "Stars & Black Holes",
  universe: "Galaxies & the Universe"
};

const cards = [
  {
    id: "saturn", topic: "solar", title: "Saturn",
    intro: "Saturn is the sixth planet from the Sun. Its bright rings contain countless pieces of ice and rock orbiting the planet.",
    detail: "The rings are a broad, thin disk. Ring particles closer to Saturn orbit faster than particles farther away.",
    source: "https://science.nasa.gov/saturn/facts/",
    foundations: ["Which planet is best known for its bright, broad ring system?", "Saturn", "Mars", "Venus", "Earth"],
    advanced: ["How do particles in Saturn’s inner rings orbit compared with particles in its outer rings?", "They orbit faster", "They orbit more slowly", "They all orbit at the same speed", "They remain stationary"]
  },
  {
    id: "planets", topic: "solar", title: "Planetary scale",
    intro: "Jupiter is the largest planet in the Solar System. Its diameter is about 11 times Earth’s.",
    detail: "For two spheres, multiplying the diameter by 11 multiplies the volume by 11 cubed, or 1,331. This gives a rough sense of the size difference; real planets are slightly flattened.",
    source: "https://science.nasa.gov/solar-system/planets/planet-sizes-and-locations-in-our-solar-system/",
    foundations: ["Which planet has the largest diameter?", "Jupiter", "Saturn", "Neptune", "Earth"],
    advanced: ["A sphere has 11 times Earth’s diameter. Roughly how many Earth volumes would it contain?", "1,300", "11", "120", "13,000"]
  },
  {
    id: "light", topic: "scale", title: "Light-years",
    intro: "A light-year measures distance. It is how far light travels in a vacuum in one year.",
    detail: "Because light takes time to travel, looking farther away lets us see earlier events. Light from a nearby star 10 light-years away shows that star roughly 10 years in the past.",
    source: "https://science.nasa.gov/universe/cosmic-distances/",
    foundations: ["What does a light-year measure?", "Distance", "Time", "Brightness", "Speed"],
    advanced: ["A flash reaches Earth from a nearby star 10 light-years away. Roughly when did it happen?", "10 years before we saw it", "When we saw it", "1 year before we saw it", "100 years before we saw it"]
  },
  {
    id: "supernova", topic: "stars", title: "What Is a Supernova?",
    intro: "A supernova is an extremely powerful stellar explosion. One way it happens is when the core of a massive star collapses.",
    detail: "Another route involves a white dwarf undergoing a runaway thermonuclear explosion. The two mechanisms can leave very different remnants.",
    source: "https://science.nasa.gov/universe/glossary/#supernova",
    foundations: ["What is a supernova?", "A powerful stellar explosion", "A planet forming rings", "Two moons passing each other", "A galaxy completing an orbit"],
    advanced: ["What kind of stellar remnant is involved in a Type Ia supernova?", "A white dwarf", "A planetary ring", "A neutron star", "A stellar-mass black hole"]
  },
  {
    id: "black-hole", topic: "stars", title: "Black holes",
    intro: "A black hole’s event horizon is the boundary beyond which light and other signals cannot escape to distant observers.",
    detail: "Gas outside the horizon can heat up and shine as it swirls inward. That glowing material is called an accretion disk.",
    source: "https://science.nasa.gov/universe/10-questions-you-might-have-about-black-holes/",
    foundations: ["What cannot escape once it is inside a black hole’s event horizon?", "Light", "Only visible light", "Only solid objects", "Only objects without electric charge"],
    advanced: ["What produces the bright glow around some black holes?", "Hot matter orbiting outside the event horizon", "Light escaping through the event horizon", "A solid surface on the black hole", "The black hole reflecting starlight like a mirror"]
  },
  {
    id: "time", topic: "scale", title: "Time dilation",
    intro: "Two clocks can measure different amounts of elapsed time. Their motion and the gravity they experience can both affect the comparison.",
    detail: "GPS clocks gain time relative to ground clocks because they orbit higher in Earth’s gravitational field. Their speed makes them lose some time, but the gravity effect is bigger, so the net result is a gain.",
    source: "https://spaceplace.nasa.gov/time-travel/en/",
    foundations: ["Which two effects can change how much time two clocks measure?", "Motion and gravity", "Color and temperature alone", "Brightness and distance alone", "Clock size and design alone"],
    advanced: ["Why do uncorrected GPS satellite clocks gain time relative to clocks on Earth’s surface?", "The gravitational effect outweighs the effect of orbital speed", "Orbital speed and gravity both make them gain time", "Speed has no effect on satellite clocks", "The two effects cancel exactly"]
  },
  {
    id: "expansion", topic: "universe", title: "The expanding universe",
    intro: "On very large scales, distances between galaxies grow as the universe expands.",
    detail: "As light travels across expanding space, its wavelength stretches. Astronomers call this cosmological redshift.",
    source: "https://science.nasa.gov/universe/cosmic-distances/",
    foundations: ["What generally happens to the distance between widely separated galaxies as the universe expands?", "It increases", "It decreases", "It stays fixed", "It drops to zero each time they orbit"],
    advanced: ["What happens to a light wave’s wavelength as it travels through expanding space?", "It becomes longer", "It becomes shorter", "It stays fixed", "It becomes zero"]
  }
];

const artwork = {
  saturn: ["saturn.jpg", "Cassini image of Saturn and its rings", "Spacecraft image, color and contrast enhanced", "NASA/JPL/Space Science Institute", "https://science.nasa.gov/image-detail/pia05380-saturn-with-rings-16x9/"],
  planets: ["planets.svg", "Jupiter shown about eleven times wider than Earth", "Diagram of approximate relative diameters"],
  light: ["light.svg", "Light travels from a star ten light-years away to Earth in about ten years", "Distance diagram"],
  supernova: ["supernova.jpg", "Bright filaments and glowing gas in the Crab Nebula", "Crab Nebula supernova remnant, Webb infrared composite", "NASA, ESA, CSA, STScI, Tea Temim (Princeton University). Image processing by Joseph DePasquale (STScI)", "https://science.nasa.gov/asset/webb/crab-nebula-nircam-and-miri-image/"],
  "black-hole": ["black-hole.jpg", "A bright, warped disk of gas surrounds the dark center of a simulated black hole", "Black hole accretion disk visualization", "NASA’s Goddard Space Flight Center/Jeremy Schnittman", "https://svs.gsfc.nasa.gov/13326/"],
  time: ["time.svg", "An Earth clock and a traveling clock record different elapsed times", "Illustrative clock comparison after a journey"],
  expansion: ["expansion.svg", "The same galaxies are shown farther apart at a later time", "Schematic of expansion on large scales"]
};

const solarSystemCards = [
  {
    "id": "sun",
    "title": "The Sun",
    "topic": "solar",
    "intro": "The Sun is the star at the center of our Solar System.",
    "detail": "Fusion in its core combines hydrogen nuclei into helium and releases the energy that powers the Sun.",
    "source": "https://science.nasa.gov/sun/facts/",
    "foundations": ["What kind of object is the Sun?", "A star", "A planet", "A moon", "A comet"],
    "advanced": ["What supplies the Sun’s energy?", "Nuclear fusion", "Chemical combustion", "Reflected light", "Radioactive decay alone"]
  },
  {
    "id": "mercury",
    "title": "Mercury",
    "topic": "solar",
    "intro": "Mercury orbits closest to the Sun and has a heavily cratered surface.",
    "detail": "Its weak exosphere holds little heat, contributing to large temperature differences between day and night.",
    "source": "https://science.nasa.gov/mercury/facts/",
    "foundations": ["Which planet orbits closest to the Sun?", "Mercury", "Venus", "Earth", "Mars"],
    "advanced": ["Why does Mercury have such large day–night temperature differences?", "It has almost no atmosphere to retain and redistribute heat", "It has permanent daylight everywhere", "Its surface is made of ice", "It has a thick heat-trapping atmosphere"]
  },
  {
    "id": "venus",
    "title": "Venus",
    "topic": "solar",
    "intro": "Venus has the hottest surface of any planet in the Solar System.",
    "detail": "Its thick carbon dioxide atmosphere traps outgoing heat through a strong greenhouse effect.",
    "source": "https://science.nasa.gov/venus/facts/",
    "foundations": ["Which planet has the hottest surface?", "Venus", "Mercury", "Mars", "Jupiter"],
    "advanced": ["What makes Venus hotter at the surface than Mercury?", "Its strong greenhouse effect", "Its faster spin", "It directly produces sunlight", "It has no atmosphere"]
  },
  {
    "id": "earth",
    "title": "Earth",
    "topic": "solar",
    "intro": "Earth is the third planet from the Sun and has abundant liquid water at its surface.",
    "detail": "Earth’s tilted axis changes the angle and duration of sunlight across the year, driving the seasons.",
    "source": "https://science.nasa.gov/earth/facts/",
    "foundations": ["Which planet is third from the Sun?", "Earth", "Venus", "Mars", "Mercury"],
    "advanced": ["What primarily causes Earth’s seasons?", "Earth’s axial tilt", "Earth’s daily rotation alone", "The Moon’s phases", "Changes in the Sun’s size"]
  },
  {
    "id": "mars",
    "title": "Mars",
    "topic": "solar",
    "intro": "Mars is often called the Red Planet because iron minerals in its surface material have oxidized.",
    "detail": "Mars hosts Olympus Mons, an enormous shield volcano built by many layers of flowing lava.",
    "source": "https://science.nasa.gov/mars/facts/",
    "foundations": ["Which planet is known as the Red Planet?", "Mars", "Venus", "Mercury", "Neptune"],
    "advanced": ["What gives much of Mars’s soil its reddish color?", "Oxidized iron minerals", "Hot lava everywhere", "Red clouds of water vapor", "Red sunlight"]
  },
  {
    "id": "jupiter",
    "title": "Jupiter",
    "topic": "solar",
    "intro": "Jupiter is the largest planet. Its Great Red Spot is a giant storm.",
    "detail": "Jupiter turns in roughly ten hours, and its rapid rotation contributes to its visibly flattened shape.",
    "source": "https://science.nasa.gov/jupiter/facts/",
    "foundations": ["Which planet has the Great Red Spot?", "Jupiter", "Saturn", "Mars", "Venus"],
    "advanced": ["Why does Jupiter bulge at its equator?", "Its rapid rotation", "Its unusually slow rotation", "Its solid surface", "Pressure from its rings"]
  },
  {
    "id": "uranus",
    "title": "Uranus",
    "topic": "solar",
    "intro": "Uranus is an ice giant whose rotation axis lies almost sideways.",
    "detail": "Its extreme axial tilt produces very different patterns of sunlight as it makes its long orbit around the Sun.",
    "source": "https://science.nasa.gov/uranus/facts/",
    "foundations": ["Which planet is famous for rotating almost on its side?", "Uranus", "Jupiter", "Mercury", "Earth"],
    "advanced": ["What is a major effect of Uranus’s extreme tilt?", "Its poles experience long periods of sunlight and darkness", "Its seasons disappear", "Its orbit takes one Earth day", "Its rings stop orbiting"]
  },
  {
    "id": "neptune",
    "title": "Neptune",
    "topic": "solar",
    "intro": "Neptune is the eighth and most distant planet from the Sun.",
    "detail": "Astronomers predicted Neptune’s location partly from unexplained changes in Uranus’s orbit.",
    "source": "https://science.nasa.gov/neptune/facts/",
    "foundations": ["Which planet orbits farthest from the Sun?", "Neptune", "Uranus", "Saturn", "Jupiter"],
    "advanced": ["What provided a clue to Neptune’s location before it was observed?", "Irregularities in Uranus’s orbit", "Changes in the phases of Venus", "Sunspots", "The orbit of Earth’s Moon"]
  },
  {
    "id": "moon",
    "title": "Earth’s Moon",
    "topic": "solar",
    "intro": "The Moon is Earth’s natural satellite. Its sunlit portion appears to change shape as it orbits.",
    "detail": "The Moon rotates once per orbit, so nearly the same hemisphere faces Earth. This is called synchronous rotation.",
    "source": "https://science.nasa.gov/moon/facts/",
    "foundations": ["What causes the Moon’s regular phases?", "We see different amounts of its sunlit half", "Earth’s shadow always covers part of it", "Its surface changes color", "It makes its own light"],
    "advanced": ["Why do we usually see the same side of the Moon?", "Its rotation period matches its orbital period", "It never rotates", "The Sun lights only one side permanently", "Earth spins at the same rate"]
  },
  {
    "id": "phobos",
    "title": "Phobos",
    "topic": "moons",
    "intro": "Phobos is the larger of Mars’s two small moons.",
    "detail": "Phobos slowly spirals inward toward Mars.",
    "source": "https://science.nasa.gov/mars/moons/phobos/",
    "foundations": ["Which moon is larger, Phobos or Deimos?", "Phobos", "Deimos", "They are the same size", "Neither orbits Mars"],
    "advanced": ["How is Phobos’s orbit changing over time?", "It is slowly drawing closer to Mars", "It is steadily moving away from Mars", "It has stopped changing", "It is switching to orbit Earth"],
    "parent": "Mars"
  },
  {
    "id": "deimos",
    "title": "Deimos",
    "topic": "moons",
    "intro": "Deimos is the smaller and more distant of Mars’s two moons.",
    "detail": "Its low gravity and irregular shape make it look very different from Earth’s nearly spherical Moon.",
    "source": "https://science.nasa.gov/mars/moons/deimos/",
    "foundations": ["Which of Mars’s moons orbits farther out?", "Deimos", "Phobos", "The Moon", "Triton"],
    "advanced": ["What helps explain why a tiny moon like Deimos can have an irregular shape?", "Its gravity is too weak to pull it into a nearly round shape", "It has an extremely thick atmosphere", "It is a ball of hot gas", "The Sun always shines on both sides"],
    "parent": "Mars"
  },
  {
    "id": "io",
    "title": "Io",
    "topic": "moons",
    "intro": "Io is a moon of Jupiter with many active volcanoes.",
    "detail": "Tidal forces repeatedly flex Io as it orbits, generating internal heat.",
    "source": "https://science.nasa.gov/jupiter/moons/io/",
    "foundations": ["Which moon is famous for its active volcanoes?", "Io", "Callisto", "Titania", "Deimos"],
    "advanced": ["What powers much of Io’s volcanic activity?", "Tidal heating", "Sunlight alone", "A thick atmosphere", "Solar fusion"],
    "parent": "Jupiter"
  },
  {
    "id": "europa",
    "title": "Europa",
    "topic": "moons",
    "intro": "Europa is an icy moon of Jupiter with strong evidence for a subsurface ocean.",
    "detail": "Observations of Jupiter’s magnetic field near Europa support the presence of a conductive layer, consistent with salty water beneath the ice.",
    "source": "https://science.nasa.gov/jupiter/moons/europa/",
    "foundations": ["Where is Europa’s suspected ocean?", "Below the ice", "Above its atmosphere", "Inside Jupiter", "On the exposed surface"],
    "advanced": ["What could explain the conductive layer inferred beneath Europa’s ice?", "A salty ocean", "Dry sand", "Clouds of nitrogen", "A layer of vacuum"],
    "parent": "Jupiter"
  },
  {
    "id": "ganymede",
    "title": "Ganymede",
    "topic": "moons",
    "intro": "Ganymede is Jupiter’s largest moon and the largest moon in the Solar System.",
    "detail": "Ganymede has its own magnetic field, a rare property for a moon.",
    "source": "https://science.nasa.gov/jupiter/moons/ganymede/",
    "foundations": ["Which is the Solar System’s largest moon?", "Ganymede", "Europa", "Titania", "Phobos"],
    "advanced": ["Which unusual property has been detected on Ganymede?", "Its own magnetic field", "Nuclear fusion in its core", "A tail pointing away from the Sun", "A ring made of liquid water"],
    "parent": "Jupiter"
  },
  {
    "id": "callisto",
    "title": "Callisto",
    "topic": "moons",
    "intro": "Callisto is an icy moon of Jupiter with a heavily cratered surface.",
    "detail": "Its many surviving craters preserve a record of impacts across a very old surface.",
    "source": "https://science.nasa.gov/jupiter/moons/callisto/",
    "foundations": ["What is a striking feature of Callisto’s surface?", "Many impact craters", "Wide liquid rivers", "An ocean exposed to space", "A single active volcano"],
    "advanced": ["What can a heavily cratered surface suggest?", "Many impacts accumulated without widespread resurfacing", "The surface formed very recently", "The moon has a thick atmosphere", "The moon has no gravity"],
    "parent": "Jupiter"
  },
  {
    "id": "titan",
    "title": "Titan",
    "topic": "moons",
    "intro": "Titan is Saturn’s largest moon. It has a thick atmosphere and lakes of liquid methane and ethane.",
    "detail": "At Titan’s low surface temperatures, methane can evaporate, form clouds, rain, and collect on the surface.",
    "source": "https://science.nasa.gov/saturn/moons/titan/",
    "foundations": ["What liquid is common in Titan’s lakes?", "Methane", "Water", "Molten iron", "Liquid salt"],
    "advanced": ["Which process on Titan resembles Earth’s water cycle?", "Methane evaporates and returns as rain", "Salt rock turns directly into sunshine", "Its lakes freeze solid every night", "Water vapor alone transports all surface liquids"],
    "parent": "Saturn"
  },
  {
    "id": "enceladus",
    "title": "Enceladus",
    "topic": "moons",
    "intro": "Enceladus is an icy moon of Saturn that sprays material from its south polar region.",
    "detail": "Cassini flew through the plumes and sampled material linked to an ocean beneath the ice.",
    "source": "https://science.nasa.gov/saturn/moons/enceladus/",
    "foundations": ["What erupts from Enceladus’s south polar region?", "Plumes of water vapor and ice", "Molten iron", "Liquid methane lakes", "Sunlight"],
    "advanced": ["How could Cassini investigate material from Enceladus’s hidden ocean?", "By flying through and sampling its plumes", "By drilling through the ice", "By sampling Saturn’s rings alone", "By landing in an exposed ocean"],
    "parent": "Saturn"
  },
  {
    "id": "titania",
    "title": "Titania",
    "topic": "moons",
    "intro": "Titania is the largest moon of Uranus.",
    "detail": "Voyager 2 images show long faults and valleys, evidence that Titania’s crust was stretched and broken.",
    "source": "https://science.nasa.gov/uranus/moons/titania/",
    "foundations": ["Which is Uranus’s largest moon?", "Titania", "Titan", "Triton", "Europa"],
    "advanced": ["What do long faults on Titania tell us about its past?", "Its crust deformed and fractured", "It once produced its own light", "It never had a solid crust", "It stopped orbiting Uranus"],
    "parent": "Uranus"
  },
  {
    "id": "triton",
    "title": "Triton",
    "topic": "moons",
    "intro": "Triton is Neptune’s largest moon and orbits backward relative to Neptune’s rotation.",
    "detail": "A retrograde orbit is one clue that Triton likely formed elsewhere and was captured by Neptune.",
    "source": "https://science.nasa.gov/neptune/moons/triton/",
    "foundations": ["Which planet does Triton orbit?", "Neptune", "Uranus", "Saturn", "Jupiter"],
    "advanced": ["Why is Triton’s retrograde orbit significant?", "It supports the idea that Neptune captured Triton", "It proves that Triton is a planet", "It means Triton has no gravity", "It means Neptune has no other moons"],
    "parent": "Neptune"
  },
  {
    "id": "ceres",
    "title": "Ceres",
    "topic": "small",
    "intro": "Ceres is the largest object in the main asteroid belt, between Mars and Jupiter.",
    "detail": "Dawn found that bright deposits in Occator Crater contain salts, evidence that briny material reached the surface.",
    "source": "https://science.nasa.gov/dwarf-planets/ceres/facts/",
    "foundations": ["Where does Ceres orbit?", "In the main asteroid belt", "Beyond Neptune", "Inside Mercury’s orbit", "Between Earth and the Moon"],
    "advanced": ["What makes some deposits in Ceres’s Occator Crater bright?", "Salts left by briny material", "Pools of molten iron", "Permanent lightning", "Reflected light from a nearby moon"]
  },
  {
    "id": "pluto",
    "title": "Pluto",
    "topic": "small",
    "intro": "Pluto is a dwarf planet in the Kuiper Belt. New Horizons revealed a bright, heart-shaped region.",
    "detail": "Pluto shares its orbital neighborhood with other Kuiper Belt objects, which matters under the definition of a planet.",
    "source": "https://science.nasa.gov/dwarf-planets/pluto/facts/",
    "foundations": ["What is Pluto classified as?", "A dwarf planet", "A gas giant", "A moon of Neptune", "A comet"],
    "advanced": ["Why is Pluto classified as a dwarf planet?", "It has not cleared its orbital neighborhood", "It does not orbit the Sun", "It is too small to be nearly round", "It is made entirely of gas"]
  },
  {
    "id": "haumea",
    "title": "Haumea",
    "topic": "small",
    "intro": "Haumea is an elongated dwarf planet that spins in about four hours.",
    "detail": "Its rapid spin helps explain its elongated shape. Observations also show a ring around it.",
    "source": "https://science.nasa.gov/dwarf-planets/",
    "foundations": ["Which dwarf planet is known for its elongated shape and rapid spin?", "Haumea", "Ceres", "Earth", "Charon"],
    "advanced": ["Which property helps explain Haumea’s elongated shape?", "Rapid rotation", "A dense atmosphere", "A slow orbit around Earth", "A tail of dust"]
  },
  {
    "id": "makemake",
    "title": "Makemake",
    "topic": "small",
    "intro": "Makemake is a dwarf planet in the Kuiper Belt beyond Neptune.",
    "detail": "Spectroscopy detects signatures of frozen methane on Makemake’s surface.",
    "source": "https://science.nasa.gov/dwarf-planets/",
    "foundations": ["Where is Makemake found?", "In the Kuiper Belt", "In the main asteroid belt", "Inside Earth’s orbit", "In Saturn’s rings"],
    "advanced": ["How can astronomers identify methane ice on Makemake from afar?", "By analyzing its spectrum", "By timing Earth’s seasons", "By counting Saturn’s rings", "By measuring its name’s length"]
  },
  {
    "id": "eris",
    "title": "Eris",
    "topic": "small",
    "intro": "Eris is a distant dwarf planet. Its discovery helped prompt astronomers to define what counts as a planet.",
    "detail": "Eris has a moon, Dysnomia. Tracking the moon’s orbit lets astronomers estimate the mass of the system.",
    "source": "https://science.nasa.gov/dwarf-planets/",
    "foundations": ["Which dwarf planet has a moon named Dysnomia?", "Eris", "Ceres", "Pluto", "Makemake"],
    "advanced": ["What can astronomers estimate by tracking Dysnomia’s orbit?", "The mass of the Eris system", "The distance from Earth to the Moon", "The age of the Sun", "The temperature of all dwarf planets"]
  },
  {
    "id": "charon",
    "title": "Charon",
    "topic": "small",
    "intro": "Charon is Pluto’s largest moon and is about half Pluto’s diameter.",
    "detail": "Pluto and Charon are mutually tidally locked, so the same sides always face each other.",
    "source": "https://science.nasa.gov/dwarf-planets/pluto/moons/charon/",
    "foundations": ["What does Charon orbit?", "Pluto", "Mars", "Eris", "Neptune"],
    "advanced": ["What does mutual tidal locking mean for Pluto and Charon?", "The same sides of both worlds always face each other", "Neither world rotates", "Both keep the same side facing the Sun", "Their separation increases every day"]
  },
  {
    "id": "asteroids",
    "title": "Asteroids",
    "topic": "small",
    "intro": "Asteroids are rocky or metallic bodies that orbit the Sun. Many are found between Mars and Jupiter.",
    "detail": "Asteroids preserve material from Solar System formation; returned samples let scientists study it directly.",
    "source": "https://science.nasa.gov/solar-system/asteroids/facts/",
    "foundations": ["Where is the main asteroid belt?", "Between Mars and Jupiter", "Between Earth and the Moon", "Inside Mercury’s orbit", "Beyond all stars"],
    "advanced": ["Why are asteroid samples valuable to scientists?", "They preserve clues to the early Solar System", "They contain fragments of modern satellites only", "They all come from Earth’s crust", "They record future solar activity"]
  },
  {
    "id": "comets",
    "title": "Comets",
    "topic": "small",
    "intro": "Comets contain ice, dust, and rock. Warming near the Sun can produce a glowing coma and long tails.",
    "detail": "The ion tail typically points away from the Sun as the solar wind carries ionized gas outward.",
    "source": "https://science.nasa.gov/solar-system/comets/facts/",
    "foundations": ["What can form as a comet warms near the Sun?", "A coma and tails", "A solid planetary ring", "An ocean around the Sun", "A second star"],
    "advanced": ["Which way does a comet’s ion tail generally point?", "Away from the Sun", "Always behind the comet’s motion", "Toward the Sun", "Toward Earth"]
  }
];

const solarOrder = ["sun", "mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune", "moon", "planets"];
const solarById = new Map([...cards, ...solarSystemCards].map((card) => [card.id, card]));
const allCards = [
  ...solarOrder.map((id) => solarById.get(id)),
  ...Object.keys(topics).filter((id) => id !== "solar")
    .flatMap((id) => [...solarSystemCards, ...cards].filter((card) => card.topic === id))
];

Object.assign(artwork, {
  "sun": ["sun.jpg", "Handle-shaped Prominence", "SOHO ultraviolet observation", "ESA/NASA/SOHO", "https://photojournal.jpl.nasa.gov/catalog/PIA03149"],
  "mercury": ["mercury.jpg", "Mercury Globe: 0°N, 180°E", "MESSENGER image mosaic", "NASA/Johns Hopkins University Applied Physics Laboratory/Carnegie Institution of Washington", "https://photojournal.jpl.nasa.gov/catalog/PIA15162"],
  "venus": ["venus.jpg", "Venus - Computer Simulated Global View of the Northern Hemisphere", "Simulated view from Magellan radar data", "NASA/JPL", "https://photojournal.jpl.nasa.gov/catalog/PIA00271"],
  "earth": ["earth.jpg", "Earth", "Spacecraft image", "NASA", "https://photojournal.jpl.nasa.gov/catalog/PIA18033"],
  "mars": ["mars.jpg", "Global Color Views of Mars", "Viking image mosaics", "NASA/JPL/USGS", "https://photojournal.jpl.nasa.gov/catalog/PIA00407"],
  "jupiter": ["jupiter.jpg", "High Resolution Globe of Jupiter", "Cassini image mosaic", "NASA/JPL/University of Arizona", "https://photojournal.jpl.nasa.gov/catalog/PIA02873"],
  "uranus": ["uranus.jpg", "Uranus as seen by NASA's Voyager 2", "Voyager 2 image", "NASA/JPL-Caltech", "https://photojournal.jpl.nasa.gov/catalog/PIA18182"],
  "neptune": ["neptune.jpg", "Neptune Full Disk View", "Voyager 2 image", "NASA/JPL", "https://photojournal.jpl.nasa.gov/catalog/PIA01492"],
  "moon": ["moon.jpg", "Nearside of Earth's Moon as Seen by the Clementine Spacecraft", "Clementine image mosaic", "NASA/JPL/USGS", "https://photojournal.jpl.nasa.gov/catalog/PIA00302"],
  "phobos": ["phobos.jpg", "Phobos from 6,800 Kilometers (Color)", "Mars Reconnaissance Orbiter image", "NASA/JPL-Caltech/University of Arizona", "https://photojournal.jpl.nasa.gov/catalog/PIA10368"],
  "deimos": ["deimos.jpg", "Martian Moon Deimos in High Resolution", "Mars Reconnaissance Orbiter image", "NASA/JPL-Caltech/University of Arizona", "https://photojournal.jpl.nasa.gov/catalog/PIA11826"],
  "io": ["io.jpg", "Global image of Io (true color)", "Galileo image mosaic", "NASA/JPL/University of Arizona", "https://photojournal.jpl.nasa.gov/catalog/PIA02308"],
  "europa": ["europa.jpg", "Europa's Stunning Surface", "Reprocessed Galileo image mosaic", "NASA/JPL-Caltech/SETI Institute", "https://photojournal.jpl.nasa.gov/catalog/PIA19048"],
  "ganymede": ["ganymede.jpg", "Ganymede Color Global", "Galileo image mosaic", "NASA/JPL", "https://photojournal.jpl.nasa.gov/catalog/PIA00716"],
  "callisto": ["callisto.jpg", "Global Callisto in Color", "Galileo image mosaic", "NASA/JPL/DLR", "https://photojournal.jpl.nasa.gov/catalog/PIA03456"],
  "titan": ["titan.jpg", "True Colors, Deceptive Sizes", "Cassini image of Titan and Dione", "NASA/JPL-Caltech/Space Science Institute", "https://photojournal.jpl.nasa.gov/catalog/PIA14912"],
  "enceladus": ["enceladus.jpg", "Approaching Enceladus", "Cassini image", "NASA/JPL-Caltech/Space Science Institute", "https://photojournal.jpl.nasa.gov/catalog/PIA17202"],
  "titania": ["titania.jpg", "Titania - Highest Resolution Voyager Picture", "Voyager 2 image", "NASA/JPL", "https://photojournal.jpl.nasa.gov/catalog/PIA00039"],
  "triton": ["triton.jpg", "Global Color Mosaic of Triton", "Voyager 2 image mosaic", "NASA/JPL/USGS", "https://photojournal.jpl.nasa.gov/catalog/PIA00317"],
  "charon": ["charon.jpg", "Charon in Enhanced Color", "New Horizons enhanced-color image", "NASA/Johns Hopkins University Applied Physics Laboratory/Southwest Research Institute", "https://photojournal.jpl.nasa.gov/catalog/PIA19968"],
  "ceres": ["ceres.jpg", "Ceres in Color", "Dawn approximate-color composite", "NASA/JPL-Caltech/UCLA/MPS/DLR/IDA", "https://photojournal.jpl.nasa.gov/catalog/PIA21079"],
  "pluto": ["pluto.jpg", "Pluto in True Color", "New Horizons color composite", "NASA/Johns Hopkins University Applied Physics Laboratory/Southwest Research Institute", "https://photojournal.jpl.nasa.gov/catalog/PIA19857"],
  "haumea": ["haumea.jpg", "Three points of light, with Haumea brightest in the center and its two moons nearby", "Hubble observation of Haumea, Namaka, and Hiʻiaka; surface and ring are unresolved", "NASA, ESA, and D. Ragozzine (Brigham Young University); image processing: Gladys Kober (NASA/Catholic University of America)", "https://science.nasa.gov/dwarf-planets/haumea/"],
  "makemake": ["makemake.jpg", "A reddish dwarf planet with a smaller dark moon against a star field", "Artist’s concept of Makemake and its moon MK 2", "NASA, ESA, and A. Parker (SWRI)", "https://science.nasa.gov/image-detail/makemakemoon100mile/"],
  "eris": ["eris.jpg", "An icy dwarf planet and its moon, with the distant Sun in the background", "Artist’s concept of Eris and Dysnomia", "NASA/JPL-Caltech", "https://science.nasa.gov/photojournal/eris-and-dysnomia-artist-concept/"],
  "asteroids": ["asteroids.jpg", "A diamond-shaped asteroid with a rocky, boulder-covered surface", "Asteroid Bennu · OSIRIS-REx spacecraft image mosaic", "NASA/Goddard/University of Arizona", "https://science.nasa.gov/resource/bennu-mosaic/"],
  "comets": ["comets.jpg", "Bright comet head with a tapering golden tail against the dark sky", "Comet NEOWISE · stacked photograph, cropped and resized", "Hypatia Alexandria · CC BY 2.0", "https://commons.wikimedia.org/wiki/File:Comet_NEOWISE_Close_Up_(50079181406).jpg"]
});

// NASA Planetary Fact Sheet. Diameters are equatorial; orbital distances are
// semimajor axes, expressed in millions of kilometers.
const planetMeasurements = {
  mercury: [4879, 57.9], venus: [12104, 108.2], earth: [12756, 149.6],
  mars: [6792, 228], jupiter: [142984, 778.5], saturn: [120536, 1432],
  uranus: [51118, 2867], neptune: [49528, 4515]
};

// Describe visible clues without revealing the answer. Only use distinctive,
// clearly resolved objects whose pictures show the target on its own.
const identificationClues = {
  mercury: "A gray globe densely covered with impact craters.",
  earth: "A blue globe with white cloud swirls and visible land.",
  mars: "A rust-colored globe with darker surface patches and a light polar cap.",
  jupiter: "A striped cream-and-brown globe with an enormous oval storm.",
  saturn: "A pale globe framed by broad bands of rings.",
  uranus: "A pale blue-green globe with few visible markings.",
  neptune: "A blue globe with a large dark storm and bright clouds.",
  io: "A yellowish moon mottled with black, red, and white deposits.",
  europa: "An icy moon crisscrossed with long reddish streaks.",
  pluto: "A mottled world with a large, bright, heart-shaped region."
};
