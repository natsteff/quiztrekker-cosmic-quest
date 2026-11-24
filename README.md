# QuizTrekker: Cosmic Quest

A mobile-first space science quiz for high-school learners and curious explorers. Flip through illustrated Learn cards, practice in Play, and track your points and activity in My Progress. Use the Settings gear to add content packs, choose a learning level, and pick which enabled topics appear in quizzes. New players start with Solar System Basics. Open Solar System Explorer from Learn to browse planets and moon systems without scoring. Play offers Space Quiz, Planet Order, Match the Moon to Its Planet, Image Identification, Planet Size, and Orbital Distance, depending on the active topics. Every Learn card stays available regardless of your quiz filters. Progress and settings are stored in the current browser.

## Run locally

```sh
python3 -m http.server 8001 --bind 127.0.0.1 --directory docs
```

Open http://127.0.0.1:8001. The prototype is a static site. GitHub Pages serves the `main` branch’s `/docs` folder.

## Learn artwork

- Saturn is a color- and contrast-enhanced Cassini image credited to NASA/JPL/Space Science Institute. [Image source](https://science.nasa.gov/image-detail/pia05380-saturn-with-rings-16x9/) · [JPL image use policy](https://www.jpl.nasa.gov/jpl-image-use-policy/)
- The Crab Nebula is a Webb infrared composite credited to NASA, ESA, CSA, STScI, and Tea Temim (Princeton University), with image processing by Joseph DePasquale (STScI). The bundled JPEG is resized and re-encoded. [Image source](https://science.nasa.gov/asset/webb/crab-nebula-nircam-and-miri-image/) · [STScI content use policy](https://www.stsci.edu/copyright)
- The black hole is a visualization credited to NASA’s Goddard Space Flight Center/Jeremy Schnittman. [Visual source](https://svs.gsfc.nasa.gov/13326/) · [NASA SVS usage guidance](https://svs.gsfc.nasa.gov/help/)
- The planetary scale, light-year, time dilation, and expansion diagrams were drawn for Cosmic Quest.

The expanded Solar System cards show their individual [NASA Photojournal](https://science.nasa.gov/photojournal/) credits and source links beside each image. Resized JPEGs keep the game lightweight. Haumea, Makemake, Eris, asteroids, and comets use labeled illustrations.

Planet Size uses equatorial diameters. Orbital Distance compares orbital semimajor axes around the Sun. [NASA Planetary Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/index.html)
