"use strict";
const $ = (id) => document.getElementById(id);
const key = "quiztrekker.cosmic-quest.v1";
const topicIds = Object.keys(topics);
const originalPacks = ["solar", "scale", "stars", "universe"];
let saved;
try {
  saved = JSON.parse(localStorage.getItem(key));
} catch {
  saved = null;
}
const count = (value) => Number.isSafeInteger(value) && value >= 0 ? value : 0;
const savedPacks = Array.isArray(saved?.packs) ? topicIds.filter((id) => saved.packs.includes(id)) : [];
const savedTopics = Array.isArray(saved?.topics) ? saved.topics : null;
const practiceTopics = !savedTopics ? topicIds : topicIds.filter((id) =>
  savedTopics.includes(id) ||
  (!savedPacks.length && (!originalPacks.includes(id) || (id === "scale" && savedTopics.includes("physics"))))
);
const preferences = {
  packs: savedPacks.length ? savedPacks : saved ? [...originalPacks] : ["solar"],
  level: saved?.level === "advanced" ? "advanced" : "foundations",
  topics: practiceTopics,
  points: count(saved?.points),
  answered: count(saved?.answered),
  correct: count(saved?.correct),
  bestStreak: count(saved?.bestStreak),
  explored: allCards.filter((card) => Array.isArray(saved?.explored) && saved.explored.includes(card.id)).map((card) => card.id)
};
if (!preferences.packs.some((id) => preferences.topics.includes(id))) {
  preferences.topics.push(preferences.packs[0]);
}

function save() {
  try {
    localStorage.setItem(key, JSON.stringify(preferences));
    return true;
  } catch {
    return false;
  }
}

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function make(tag, text) {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  return element;
}

let learnCards = [];
let gameMode;
let deck;
let orderChoices = [];
let quizLearnCard;
const moonParents = ["Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"];
const planetsInOrder = solarOrder.slice(1, 9).map((id) => solarById.get(id).title);
let position;
let answered;
let streak = 0;
let cardIndex = 0;
let flipped = false;
let storageAvailable = true;
const tabs = [...document.querySelectorAll("[data-view]")];

function show(view, focus = true) {
  for (const tab of tabs) {
    const active = tab.dataset.view === view;
    $(tab.dataset.view).hidden = !active;
    if (active) tab.setAttribute("aria-current", "page");
    else tab.removeAttribute("aria-current");
  }
  if (view === "my-progress") renderProgress();
  if (focus) {
    const heading = view === "play" && !$("game-menu").hidden ? "play-menu-title" : view + "-title";
    $(heading).focus();
  }
}

function grade(right, correct, explanation) {
  answered = true;
  preferences.answered++;
  let award = 0;
  if (right) {
    award = 100 + Math.min(streak * 10, 100);
    streak++;
    preferences.points += award;
    preferences.correct++;
    preferences.bestStreak = Math.max(preferences.bestStreak, streak);
  } else {
    streak = 0;
  }
  storageAvailable = save();
  $("points").textContent = `${preferences.points.toLocaleString()} pts`;
  const result = right ? `Correct! +${award} points` : `Correct answer: ${correct}`;
  $("feedback").append(make("strong", result), make("p", explanation));
  if (!storageAvailable) $("feedback").append(make("p", "Points are available for this visit. Browser storage is unavailable."));
  $("study").hidden = false;
  $("next").hidden = false;
  $("next").textContent = position + 1 === deck.length ? "New round" : "Next question";
  $("next").focus();
}

function updateOrderControls() {
  $("planet-sequence").textContent = orderChoices.length
    ? orderChoices.join(" → ")
    : "Select each planet from closest to farthest.";
  for (const button of $("choices").children) {
    button.disabled = answered || orderChoices.includes(button.textContent);
  }
  $("order-undo").disabled = answered || !orderChoices.length;
  $("order-clear").disabled = answered || !orderChoices.length;
  $("order-submit").disabled = answered || orderChoices.length !== planetsInOrder.length;
}

function imageTargets(eligible) {
  return eligible.filter((card) => Object.hasOwn(identificationClues, card.id));
}

function comparison(card) {
  const size = gameMode === "size";
  const advanced = preferences.level === "advanced";
  const metric = size ? 0 : 1;
  const choices = [card, ...shuffle(deck.filter((other) => other !== card)).slice(0, advanced ? 3 : 1)];
  const lower = Math.random() < .5;
  const sorted = [...choices].sort((a, b) => planetMeasurements[a.id][metric] - planetMeasurements[b.id][metric]);
  const correct = lower ? sorted[0] : sorted.at(-1);
  const adjective = size ? (lower ? "smallest" : "largest") : (lower ? "shortest" : "longest");
  const measure = size ? "equatorial diameter" : "average orbital distance from the Sun";
  const unit = size ? "km" : "million km";
  const values = sorted.map((item) => `${item.title}: ${planetMeasurements[item.id][metric].toLocaleString()} ${unit}`);
  return {
    question: [`Which planet has the ${adjective} ${measure}?`, correct.title, ...choices.filter((item) => item !== correct).map((item) => item.title)],
    explanation: values.join(" · "),
    learnCard: correct
  };
}

function renderQuestion(focus = false) {
  answered = false;
  const card = deck[position];
  const isOrder = gameMode === "order";
  const isMoon = gameMode === "moons";
  $("progress").textContent = `Question ${position + 1} of ${deck.length}`;
  $("points").textContent = `${preferences.points.toLocaleString()} pts`;
  $("topic").textContent = isMoon ? "Match the Moon to Its Planet" : topics[card.topic];
  $("feedback").replaceChildren();
  $("next").hidden = true;
  $("study").hidden = true;
  $("choices").replaceChildren();
  $("order-tools").hidden = !isOrder;
  orderChoices = [];
  quizLearnCard = card;
  const isImage = gameMode === "image";
  const figure = $("quiz-image");
  figure.hidden = !isImage;
  const caption = figure.querySelector("figcaption");
  caption.hidden = true;
  const image = figure.querySelector("img");
  if (isImage) {
    image.src = "assets/" + artwork[card.id][0];
    image.alt = identificationClues[card.id];
  } else {
    image.removeAttribute("src");
  }

  if (isOrder) {
    $("play-title").textContent = "Put all eight planets in order from the Sun.";
    for (const planet of shuffle(planetsInOrder)) {
      const button = make("button", planet);
      button.addEventListener("click", () => {
        orderChoices.push(planet);
        updateOrderControls();
        ($("choices").querySelector("button:not(:disabled)") || $("order-submit")).focus();
      });
      $("choices").append(button);
    }
    updateOrderControls();
  } else {
    const parent = card.parent || "Earth";
    const compared = gameMode === "size" || gameMode === "distance" ? comparison(card) : null;
    if (compared) quizLearnCard = compared.learnCard;
    const imageQuestion = () => {
      const category = (item) => item.parent ? "moon" : item.topic === "small" ? "dwarf planet" : "planet";
      const others = deck.filter((item) => item !== card);
      const similar = shuffle(others.filter((item) => category(item) === category(card)));
      const rest = shuffle(others.filter((item) => category(item) !== category(card)));
      const maximum = preferences.level === "advanced" ? 4 : 2;
      return ["Which world is shown?", card.title, ...[...similar, ...rest].slice(0, maximum).map((item) => item.title)];
    };
    const [question, correct, ...distractors] = isMoon
      ? [`Which planet does ${card.id === "moon" ? "the Moon" : card.title} orbit?`, parent, ...shuffle(moonParents.filter((name) => name !== parent)).slice(0, preferences.level === "advanced" ? 5 : 3)]
      : compared?.question || (isImage ? imageQuestion() : card[preferences.level]);
    $("play-title").textContent = question;
    const buttons = shuffle([correct, ...distractors]).map((choice, index) => {
      const button = make("button");
      button.append(make("strong", String.fromCharCode(65 + index)), make("span", choice));
      button.addEventListener("click", () => {
        if (answered) return;
        const right = choice === correct;
        for (const option of buttons) option.disabled = true;
        buttons.find((option) => option.lastChild.textContent === correct).dataset.result = "correct";
        if (!right) button.dataset.result = "wrong";
        const explanation = preferences.level === "advanced"
          ? `${card.intro} ${card.detail}` : card.intro;
        if (isImage) {
          const [, alt, type, credit, url] = artwork[card.id];
          image.alt = alt;
          const source = make("a", credit);
          source.href = url;
          caption.replaceChildren(type + " · ", source);
          caption.hidden = false;
        }
        grade(right, correct, compared?.explanation || explanation);
      });
      return button;
    });
    $("choices").append(...buttons);
  }
  if (focus) $("play-title").focus();
}

function start(previousId) {
  const eligible = learnCards.filter((card) => preferences.topics.includes(card.topic));
  if (gameMode === "order") deck = [solarById.get("sun")];
  else if (gameMode === "moons") deck = shuffle(eligible.filter((card) => card.id === "moon" || card.parent));
  else if (gameMode === "image") deck = shuffle(imageTargets(eligible));
  else if (gameMode === "size" || gameMode === "distance") {
    deck = shuffle(eligible.filter((card) => Object.hasOwn(planetMeasurements, card.id)));
  } else deck = shuffle(eligible);
  if (deck.length > 1 && deck[0].id === previousId) {
    deck.push(deck.shift());
  }
  position = 0;
  streak = 0;
  renderQuestion();
}

function renderCard() {
  const card = learnCards[cardIndex];
  const [file, alt, caption, credit, creditUrl] = artwork[card.id];
  $("card-position").textContent = `${cardIndex + 1} / ${learnCards.length}`;
  $("card-select").value = card.id;

  const image = make("img");
  image.src = "assets/" + file;
  image.alt = alt;
  const title = make("strong", card.title);
  title.className = "card-title";
  const hint = make("span", flipped ? "Show card front" : "Flip card");
  hint.className = "card-action";
  const front = $("flip-card");
  front.replaceChildren(...(flipped ? [title, hint] : [image, title, hint]));
  front.setAttribute("aria-expanded", String(flipped));

  const imageInfo = $("card-image-info");
  imageInfo.textContent = caption;
  imageInfo.hidden = flipped;
  if (credit) {
    const link = make("a", credit);
    link.href = creditUrl;
    imageInfo.append(" · ", link);
  }

  const back = $("card-back");
  back.hidden = !flipped;
  if (!flipped) return;
  back.replaceChildren(make("p", card.intro));
  if (preferences.level === "advanced") back.append(make("p", card.detail));
  const source = make("a", "Read more at NASA");
  source.href = card.source;
  back.append(source);
}

function selectCard(index) {
  cardIndex = (index + learnCards.length) % learnCards.length;
  flipped = false;
  renderCard();
}

function renderProgress() {
  $("total-points").textContent = preferences.points.toLocaleString();
  $("cards-explored").textContent = `${learnCards.filter((card) => preferences.explored.includes(card.id)).length} / ${learnCards.length}`;
  $("total-answered").textContent = preferences.answered.toLocaleString();
  $("total-correct").textContent = preferences.correct.toLocaleString();
  $("best-streak").textContent = preferences.bestStreak.toLocaleString();
  $("progress-note").textContent = storageAvailable
    ? "Points and activity are saved in this browser. Activity tracking began in version 0.2.0."
    : "Progress is available for this visit. Browser storage is unavailable.";
}

function updatePools() {
  const current = learnCards[cardIndex]?.id;
  learnCards = allCards.filter((card) => preferences.packs.includes(card.topic));
  const groups = new Map();
  for (const card of learnCards) {
    if (!groups.has(card.topic)) {
      const group = make("optgroup");
      group.label = topics[card.topic];
      groups.set(card.topic, group);
    }
    const option = make("option", card.title);
    option.value = card.id;
    groups.get(card.topic).append(option);
  }
  $("card-select").replaceChildren(...groups.values());
  selectCard(Math.max(0, learnCards.findIndex((card) => card.id === current)));
  const orderEnabled = preferences.packs.includes("solar") && preferences.topics.includes("solar");
  const moonsEnabled = learnCards.some((card) => (card.id === "moon" || card.parent) && preferences.topics.includes(card.topic));
  document.querySelector('[data-game="order"]').disabled = !orderEnabled;
  document.querySelector('[data-game="moons"]').disabled = !moonsEnabled;
  const eligible = learnCards.filter((card) => preferences.topics.includes(card.topic));
  const imageEnabled = imageTargets(eligible).length >= 2;
  document.querySelector('[data-game="image"]').disabled = !imageEnabled;
  for (const mode of ["size", "distance"]) {
    document.querySelector(`[data-game="${mode}"]`).disabled = !orderEnabled;
  }
  renderExplorer();
  $("game-availability").textContent = !orderEnabled || !moonsEnabled || !imageEnabled
    ? "Enable the relevant content packs and practice topics in Settings to unlock more games." : "";
  if (gameMode && document.querySelector(`[data-game="${gameMode}"]`).disabled) {
    gameMode = null;
    openGameMenu(false);
  }
  if (gameMode) start();
  if (!$("my-progress").hidden) renderProgress();
}

const explorerRegions = [
  ["Inner Solar System", ["sun", "mercury", "venus", "earth", "mars"]],
  ["Outer Solar System", ["jupiter", "saturn", "uranus", "neptune"]],
  ["Dwarf planets and small worlds", ["ceres", "pluto", "haumea", "makemake", "eris", "asteroids", "comets"]]
];
let lastExplorerWorld = null;
let lastExplorerButton;

function renderExplorer() {
  const map = $("explorer-map");
  const previouslyOpen = new Map([...map.querySelectorAll("details")].map((region) => [region.dataset.region, region.open]));
  const byId = new Map(learnCards.map((card) => [card.id, card]));
  function worldButton(card) {
    const button = make("button");
    button.dataset.world = card.id;
    const image = make("img");
    image.src = "assets/" + artwork[card.id][0];
    image.alt = "";
    image.loading = "lazy";
    button.append(image, make("span", card.title));
    button.addEventListener("click", () => {
      lastExplorerWorld = card.id;
      lastExplorerButton = button;
      showCards();
      $("return-explorer").hidden = false;
      selectCard(learnCards.indexOf(card));
      $("flip-card").focus();
    });
    return button;
  }
  map.replaceChildren();
  const overview = make("div");
  overview.className = "panel orbit-overview";
  overview.append(make("h3", "From the Sun outward"));
  const track = make("div");
  track.className = "orbit-track";
  for (const id of solarOrder.slice(0, 9)) {
    if (byId.has(id)) track.append(worldButton(byId.get(id)));
  }
  if (track.children.length) {
    overview.append(track);
    map.append(overview);
  }
  for (const [name, ids] of explorerRegions) {
    const region = make("details");
    region.dataset.region = name;
    region.className = "panel orbit-region";
    region.open = previouslyOpen.get(name) ?? true;
    region.append(make("summary", name));
    for (const id of ids) {
      const object = solarById.get(id);
      const moons = learnCards.filter((card) => card.parent === object.title ||
        (id === "earth" && card.id === "moon") || (id === "pluto" && card.id === "charon"));
      if (!byId.has(id) && !moons.length) continue;
      const lane = make("div");
      lane.className = "orbit-lane";
      lane.append(byId.has(id) ? worldButton(object) : make("strong", object.title));
      if (moons.length) {
        const satellites = make("div");
        satellites.className = "orbital-moons";
        satellites.setAttribute("role", "group");
        satellites.setAttribute("aria-label", `Moons of ${object.title}`);
        satellites.append(...moons.map(worldButton));
        lane.append(satellites);
      }
      region.append(lane);
    }
    if (region.children.length > 1) map.append(region);
  }
  if (!map.children.length) map.append(make("p", "Enable a Solar System content pack in Settings to explore its worlds."));
}

function showCards() {
  $("explorer").hidden = true;
  $("learn-cards").hidden = false;
  $("card-position").hidden = false;
}

function openExplorer(returning) {
  $("learn-cards").hidden = true;
  $("card-position").hidden = true;
  $("explorer").hidden = false;
  const world = returning && lastExplorerWorld
    ? lastExplorerButton?.isConnected
      ? lastExplorerButton
      : $("explorer-map").querySelector(`[data-world="${lastExplorerWorld}"]`)
    : null;
  (world || $("explorer-title")).focus();
}

$("open-explorer").addEventListener("click", () => openExplorer(false));
$("return-explorer").addEventListener("click", () => openExplorer(true));
$("close-explorer").addEventListener("click", () => {
  showCards();
  $("open-explorer").focus();
});

function updateSettings() {
  storageAvailable = save();
  $("settings-status").textContent = storageAvailable ? "Settings saved." : "Settings apply for this visit.";
  updatePools();
  renderFilters();
}

for (const tab of tabs) tab.addEventListener("click", () => show(tab.dataset.view));
$("next").addEventListener("click", () => {
  if (position + 1 === deck.length) {
    start(deck[position].id);
    $("play-title").focus();
  } else {
    position++;
    renderQuestion(true);
  }
});
$("study").addEventListener("click", () => {
  showCards();
  $("return-explorer").hidden = true;
  selectCard(learnCards.indexOf(quizLearnCard));
  show("learn", false);
  $("flip-card").focus();
});
$("settings-open").addEventListener("click", () => $("settings").showModal());
for (const button of document.querySelectorAll("[data-game]")) {
  button.addEventListener("click", () => {
    $("game-menu").hidden = true;
    $("quiz").hidden = false;
    $("play").setAttribute("aria-labelledby", "play-title");
    if (gameMode !== button.dataset.game) {
      gameMode = button.dataset.game;
      start();
    }
    $("play-title").focus();
  });
}

function openGameMenu(focus = true) {
  $("quiz").hidden = true;
  $("game-menu").hidden = false;
  $("play").setAttribute("aria-labelledby", "play-menu-title");
  if (focus) $("play-menu-title").focus();
}

$("quiz-menu").addEventListener("click", () => openGameMenu());
$("order-undo").addEventListener("click", () => {
  const planet = orderChoices.pop();
  updateOrderControls();
  if ($("order-undo").disabled) {
    [...$("choices").children].find((button) => button.textContent === planet).focus();
  }
});
$("order-clear").addEventListener("click", () => {
  orderChoices = [];
  updateOrderControls();
  $("choices").firstElementChild.focus();
});
$("order-submit").addEventListener("click", () => {
  if (answered || orderChoices.length !== planetsInOrder.length) return;
  const correct = planetsInOrder.join(" → ");
  grade(orderChoices.join(" → ") === correct, correct, `From closest to farthest: ${correct}.`);
  updateOrderControls();
});

$("flip-card").addEventListener("click", () => {
  flipped = !flipped;
  const id = learnCards[cardIndex].id;
  if (flipped && !preferences.explored.includes(id)) {
    preferences.explored.push(id);
    storageAvailable = save();
  }
  renderCard();
});
$("previous-card").addEventListener("click", () => selectCard(cardIndex - 1));
$("next-card").addEventListener("click", () => selectCard(cardIndex + 1));
$("card-select").addEventListener("change", (event) => {
  selectCard(learnCards.findIndex((card) => card.id === event.target.value));
});

let touch;
let suppressClick = false;
const flashcard = $("flashcard");
flashcard.addEventListener("touchstart", (event) => {
  suppressClick = false;
  const point = event.touches[0];
  touch = event.touches.length === 1 ? { x: point.clientX, y: point.clientY } : null;
}, { passive: true });
flashcard.addEventListener("touchcancel", () => { touch = null; });
flashcard.addEventListener("touchend", (event) => {
  if (!touch) return;
  const point = event.changedTouches[0];
  const x = point.clientX - touch.x;
  const y = point.clientY - touch.y;
  touch = null;
  if (Math.abs(x) < 45 || Math.abs(x) < Math.abs(y) * 1.5) return;
  suppressClick = true;
  selectCard(cardIndex + (x < 0 ? 1 : -1));
}, { passive: true });
flashcard.addEventListener("click", (event) => {
  if (!suppressClick || event.detail === 0) return;
  suppressClick = false;
  event.preventDefault();
  event.stopPropagation();
}, true);

for (const input of document.querySelectorAll('[name="level"]')) {
  input.checked = input.value === preferences.level;
  input.addEventListener("change", () => {
    preferences.level = input.value;
    updateSettings();
  });
}
function renderFilters() {
  for (const [container, property, ids] of [
    ["packs", "packs", topicIds],
    ["filters", "topics", topicIds.filter((id) => preferences.packs.includes(id))]
  ]) {
    const group = $(container);
    const focusedId = group.contains(document.activeElement) ? document.activeElement.value : null;
    group.replaceChildren();
    for (const id of ids) {
      const label = make("label");
      const input = make("input");
      input.type = "checkbox";
      input.value = id;
      input.checked = preferences[property].includes(id);
      input.addEventListener("change", () => {
        const next = input.checked ? [...preferences[property], id] : preferences[property].filter((selected) => selected !== id);
        if (property === "packs" && !next.length) {
          input.checked = true;
          $("settings-status").textContent = "Keep at least one content pack enabled.";
          return;
        }
        if (property === "topics" && !preferences.packs.some((pack) => next.includes(pack))) {
          input.checked = true;
          $("settings-status").textContent = "Keep at least one practice topic selected.";
          return;
        }
        preferences[property] = next;
        if (property === "packs" && !next.some((pack) => preferences.topics.includes(pack))) {
          preferences.topics.push(next[0]);
        }
        updateSettings();
      });
      label.append(input, make("span", topics[id]));
      group.append(label);
      if (focusedId === id) input.focus();
    }
  }
}

updatePools();
renderFilters();
