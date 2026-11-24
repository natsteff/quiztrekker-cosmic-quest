const topics = {
  solar: "Solar System",
  scale: "Cosmic distances",
  stars: "Stars and black holes",
  physics: "Relativity",
  universe: "The universe"
};

const cards = [
  {
    id: "saturn", topic: "solar", title: "Saturn and its rings",
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
    id: "supernova", topic: "stars", title: "Supernovae",
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
    id: "time", topic: "physics", title: "Time dilation",
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
