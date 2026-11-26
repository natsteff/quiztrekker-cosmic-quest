"use strict";
const $ = (id) => document.getElementById(id);
const fullscreenLayout =
  new URLSearchParams(window.location.search).get("fullscreen") === "1";
document.documentElement.classList.toggle("tv-layout", fullscreenLayout);

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
const savedCardIds = (ids) => allCards.filter((card) => Array.isArray(ids) && ids.includes(card.id)).map((card) => card.id);
const preferences = {
  packs: savedPacks.length ? savedPacks : saved ? [...originalPacks] : ["solar"],
  level: saved?.level === "advanced" ? "advanced" : "foundations",
  topics: practiceTopics,
  points: count(saved?.points),
  answered: count(saved?.answered),
  correct: count(saved?.correct),
  bestStreak: count(saved?.bestStreak),
  explored: savedCardIds(saved?.explored),
  mastered: savedCardIds(saved?.mastered)
};
if (!preferences.packs.some((id) => preferences.topics.includes(id))) {
  preferences.topics.push(preferences.packs[0]);
}

function save() {
  try {
    localStorage.setItem(key, JSON.stringify({ ...saved, ...preferences }));
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
let roundCorrect = 0;
let roundPoints = 0;
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
  if (view === "learn") recordExploration();
  if (focus) {
    const heading = view !== "play" ? view + "-title" :
      !$("game-menu").hidden ? "play-menu-title" : !$("round-results").hidden ? "round-title" : "play-title";
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
    roundCorrect++;
    roundPoints += award;
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
  const final = position + 1 === deck.length;
  $("next").textContent = final ? "Round results" : "Next question";
  if (final) showRoundResults();
  else $("next").focus();
}

function updateOrderControls() {
  $("planet-sequence").textContent = orderChoices.length
    ? orderChoices.join(" → ")
    : "Select each planet from closest to farthest.";
  for (const button of $("choices").children) {
    const index = orderChoices.indexOf(button.dataset.planet);
    const selected = index !== -1;
    button.disabled = answered;
    button.setAttribute("aria-pressed", String(selected));
    button.setAttribute("aria-label", selected ? `${button.dataset.planet}, position ${index + 1}` : button.dataset.planet);
    button.firstElementChild.textContent = selected ? String(index + 1) : "";
    button.firstElementChild.hidden = !selected;
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
  $("question-card").scrollTop = 0;
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
      const button = make("button");
      button.dataset.planet = planet;
      const badge = make("strong");
      badge.setAttribute("aria-hidden", "true");
      button.append(badge, make("span", planet));
      button.addEventListener("click", () => {
        const index = orderChoices.indexOf(planet);
        if (index === -1) orderChoices.push(planet);
        else orderChoices.splice(index, 1);
        updateOrderControls();
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
          image.alt = artwork[card.id][1];
          renderImageCredit(caption, card);
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
  roundCorrect = 0;
  roundPoints = 0;
  showQuestionCard();
  renderQuestion();
  document.dispatchEvent(new Event("cq-round-state"));
}

const starfieldCards = new Set(["mercury", "earth", "moon", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"]);
const immersiveCards = new Set(["supernova", "black-hole", "comets"]);

function renderCard() {
  const card = learnCards[cardIndex];
  const [file, alt] = artwork[card.id];
  $("card-position").textContent = `${cardIndex + 1} / ${learnCards.length}`;
  $("card-select").value = card.id;
  renderLearnProgress();

  const image = make("img");
  const isHaumea = card.id === "haumea";
  const usesStarfield = starfieldCards.has(card.id);
  const frontArt = isHaumea ? "haumea-concept.svg" : usesStarfield ? card.id + "-cutout.webp" : file;
  image.src = "assets/" + frontArt;
  image.alt = isHaumea ? "Illustration of elongated Haumea and its ring, not to scale" : alt;
  $("card-title").textContent = card.title;
  const orbitalPosition = planetIds.indexOf(card.id);
  const ordinal = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"][orbitalPosition];
  $("planet-position").hidden = !ordinal;
  $("planet-position").textContent = ordinal ? ordinal + " from the Sun" : "";
  const hint = make("span", flipped ? "Show card front" : "Flip card");
  hint.className = "card-action";
  const front = $("flip-card");
  front.dataset.scene = flipped ? "" : usesStarfield ? "stars" :
    immersiveCards.has(card.id) ? "wide" : "image";
  front.dataset.subject = card.id;
  front.replaceChildren(...(flipped ? [hint] : [image, hint]));
  front.setAttribute("aria-label", `${hint.textContent}: ${card.title}`);
  $("card-facts").textContent = flipped ? "Card front" : "More facts";
  $("card-facts").setAttribute("aria-expanded", String(flipped));
  front.setAttribute("aria-expanded", String(flipped));

  const snapshot = $("card-snapshot");
  $("card-details").hidden = flipped;
  if (!flipped) renderSnapshot(snapshot, card);

  const imageInfo = $("card-image-info");
  if (!flipped) {
    if (isHaumea) imageInfo.textContent = "Illustration · Hubble observation in More facts";
    else renderImageCredit(imageInfo, card);
    if (usesStarfield) {
      const skyCredit = make("span");
      skyCredit.className = "starfield-credit";
      skyCredit.append(
        sourceLink("ESO and Digitized Sky Survey 2", "https://www.eso.org/public/images/eso0949l/"),
        ". Acknowledgment: Davide De Martin and S. Guisard (",
        sourceLink("www.eso.org/~sguisard", "https://www.eso.org/~sguisard"),
        ") · ",
        sourceLink("CC BY 4.0", "https://creativecommons.org/licenses/by/4.0/"),
        " · Filtered and cropped"
      );
      imageInfo.append(skyCredit);
    }
  }

  const back = $("card-back");
  back.hidden = !flipped;
  if (!flipped) return;
  appendLearnFacts(back, card);
  if (isHaumea) {
    const observation = make("figure");
    observation.className = "card-observation";
    const photograph = make("img");
    photograph.src = "assets/" + file;
    photograph.alt = alt;
    const caption = make("figcaption");
    caption.className = "image-credit";
    renderImageCredit(caption, card);
    observation.append(photograph, caption);
    back.append(observation);
  }
  appendSizeDetails(back, card);
  const references = make("div");
  references.className = "learn-references";
  references.append(sourceLink("Read more at NASA", card.source));
  back.append(references);
}

function selectCard(index) {
  $("card-face").scrollTop = 0;
  if (fullscreenLayout) $("flashcard").scrollTop = 0;
  cardIndex = (index + learnCards.length) % learnCards.length;
  flipped = false;
  recordExploration();
  renderCard();
}

function recordExploration() {
  if ($("learn").hidden || $("learn-cards").hidden || $("welcome").open || $("settings").open) return;
  const id = learnCards[cardIndex]?.id;
  if (id && !preferences.explored.includes(id)) {
    preferences.explored.push(id);
    storageAvailable = save();
    renderLearnProgress();
  }
}

function enabledCount(ids) {
  return learnCards.filter((card) => ids.includes(card.id)).length;
}

function renderLearnProgress() {
  const mastered = enabledCount(preferences.mastered);
  const total = learnCards.length;
  const progress = $("learn-progress-bar");
  progress.max = total;
  const explored = enabledCount(preferences.explored);
  progress.value = mastered || explored;
  $("learn-explored").hidden = !mastered;
  $("learn-explored").textContent = `${explored} / ${total} explored`;
  $("learn-progress-label").textContent = `${progress.value} / ${total} cards ${mastered ? "mastered" : "explored"}`;
  const marked = preferences.mastered.includes(learnCards[cardIndex].id);
  $("mastery-label").textContent = marked ? "Mastered ✓" : "Mark as mastered";
  $("mastery").setAttribute("aria-pressed", String(marked));
  $("mastery").classList.toggle("is-mastered", marked);
}

function renderProgress() {
  $("total-points").textContent = preferences.points.toLocaleString();
  $("cards-explored").textContent = `${enabledCount(preferences.explored)} / ${learnCards.length}`;
  $("cards-mastered").textContent = `${enabledCount(preferences.mastered)} / ${learnCards.length}`;
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
  const moonsEnabled = preferences.packs.includes("moons") && preferences.topics.includes("moons");
  $("moon-availability").textContent = moonsEnabled ? "" : "To play Moon Match, enable Moons of Other Planets in Choose content and Practice topics.";
  document.querySelector('[data-game="order"]').disabled = !orderEnabled;
  document.querySelector('[data-game="moons"]').disabled = !moonsEnabled;
  const eligible = learnCards.filter((card) => preferences.topics.includes(card.topic));
  const imageEnabled = imageTargets(eligible).length >= 2;
  document.querySelector('[data-game="image"]').disabled = !imageEnabled;
  for (const mode of ["size", "distance"]) {
    document.querySelector(`[data-game="${mode}"]`).disabled = !orderEnabled;
  }
  renderExplorer();
  $("game-availability").textContent = !orderEnabled || !imageEnabled
    ? "Enable the relevant content packs and practice topics in Settings to unlock more games." : "";
  if (gameMode && document.querySelector(`[data-game="${gameMode}"]`).disabled) {
    gameMode = null;
    openGameMenu(false);
  }
  if (gameMode) start();
  if (!$("my-progress").hidden) renderProgress();
}

function updateSettings() {
  storageAvailable = save();
  $("settings-status").textContent = storageAvailable ? "Settings saved." : "Settings apply for this visit.";
  updatePools();
  renderFilters();
}

for (const tab of tabs) tab.addEventListener("click", () => show(tab.dataset.view));
function showQuestionCard() {
  $("round-results").hidden = true;
  $("question-card").hidden = false;
  $("play").setAttribute("aria-labelledby", "play-title");
}

function showRoundResults() {
  $("round-summary").textContent = `${roundCorrect} of ${deck.length} correct · ${roundPoints.toLocaleString()} points earned this round`;
  $("question-card").hidden = true;
  $("round-results").hidden = false;
  $("round-results").scrollTop = 0;
  $("play").setAttribute("aria-labelledby", "round-title");
  $("round-title").focus();
  document.dispatchEvent(new Event("cq-round-state"));
}

$("next").addEventListener("click", () => {
  if (position + 1 === deck.length) showRoundResults();
  else {
    position++;
    renderQuestion(true);
  }
});
$("review-answer").addEventListener("click", () => {
  showQuestionCard();
  $("feedback").tabIndex = -1;
  $("feedback").focus();
});
$("round-games").addEventListener("click", () => {
  gameMode = null;
  openGameMenu();
});
$("play-again").addEventListener("click", () => {
  start(deck[position].id);
  $("play-title").focus();
});
$("study").addEventListener("click", () => {
  showCards();
  setExplorerReturn(false);
  selectCard(learnCards.indexOf(quizLearnCard));
  show("learn", false);
  $("flip-card").focus();
});
$("settings-open").addEventListener("click", () => $("settings").showModal());
$("settings").addEventListener("close", recordExploration);
for (const button of document.querySelectorAll("[data-game]")) {
  button.addEventListener("click", () => {
    $("game-menu").hidden = true;
    $("quiz").hidden = false;
    if (gameMode !== button.dataset.game) {
      gameMode = button.dataset.game;
      start();
    }
    const heading = $("round-results").hidden ? $("play-title") : $("round-title");
    $("play").setAttribute("aria-labelledby", heading.id);
    heading.focus();
    document.dispatchEvent(new Event("cq-round-state"));
  });
}

function openGameMenu(focus = true) {
  $("quiz").hidden = true;
  $("game-menu").hidden = false;
  $("play").setAttribute("aria-labelledby", "play-menu-title");
  if (focus) $("play-menu-title").focus();
  document.dispatchEvent(new Event("cq-round-state"));
}

$("quiz-menu").addEventListener("click", () => openGameMenu());
$("order-undo").addEventListener("click", () => {
  const planet = orderChoices.pop();
  updateOrderControls();
  if ($("order-undo").disabled) {
    [...$("choices").children].find((button) => button.dataset.planet === planet).focus();
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

function flipLearnCard() {
  $("card-face").scrollTop = 0;
  if (fullscreenLayout) $("flashcard").scrollTop = 0;
  flipped = !flipped;
  renderCard();
  if (flipped && document.activeElement === $("card-facts")) {
    $("card-back").tabIndex = -1;
    $("card-back").focus();
  }
}
$("flip-card").addEventListener("click", flipLearnCard);
$("card-facts").addEventListener("click", flipLearnCard);
$("mastery").addEventListener("click", () => {
  const id = learnCards[cardIndex].id;
  const index = preferences.mastered.indexOf(id);
  if (index === -1) preferences.mastered.push(id);
  else preferences.mastered.splice(index, 1);
  storageAvailable = save();
  renderLearnProgress();
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

renderImageCreditsIndex();

function showFirstLaunchWelcome() {
  if (saved) return;
  const welcomeKey = "quiztrekker.cosmic-quest.welcome.v1";
  try {
    if (localStorage.getItem(welcomeKey) === "dismissed") return;
  } catch {
    // Storage may be unavailable. The welcome can still be dismissed this visit.
  }

  const launchedFromHomeScreen = navigator.standalone === true ||
    matchMedia("(display-mode: standalone)").matches ||
    matchMedia("(display-mode: fullscreen)").matches ||
    matchMedia("(display-mode: minimal-ui)").matches;
  const appleMobile = /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const android = /Android/i.test(navigator.userAgent);
  if (!launchedFromHomeScreen && (appleMobile || android)) {
    $("welcome-install").hidden = false;
    $(appleMobile ? "welcome-ios" : "welcome-android").hidden = false;
  }

  const welcome = $("welcome");
  welcome.addEventListener("close", () => {
    try {
      localStorage.setItem(welcomeKey, "dismissed");
    } catch {
      // Continue into the game even when browser storage is unavailable.
    }
    recordExploration();
    $("learn-title").focus({ preventScroll: true });
  }, { once: true });
  welcome.showModal();
}

showFirstLaunchWelcome();
updatePools();
renderFilters();

const bottomNav = document.querySelector(".bottom-nav");
const viewport = window.visualViewport;
let layoutFrame = 0;

function fitVisibleLayout() {
  layoutFrame = 0;
  document.body.style.setProperty("--nav-height", bottomNav.offsetHeight + "px");
  const height = viewport && viewport.scale === 1 ? viewport.height : document.documentElement.clientHeight;
  if (!viewport || viewport.scale === 1) {
    document.body.style.setProperty("--visible-height", Math.floor(height) + "px");
  }

  const showingLearn = !$("learn").hidden && !$("learn-cards").hidden;
  const showingPlay = !$("play").hidden;
  const showingProgress = !$("my-progress").hidden;
  document.body.classList.toggle("inner-scroll", (fullscreenLayout || height >= 460) && (showingLearn || showingPlay || showingProgress));
  if (document.body.classList.contains("inner-scroll")) {
    const compactTV = fullscreenLayout && matchMedia("(max-height: 28rem)").matches;
    const scrollArea = showingLearn ? $(compactTV ? "flashcard" : "card-face") :
      showingProgress ? $("my-progress") :
      !$("game-menu").hidden ? $("game-menu") :
      !$("round-results").hidden ? $("round-results") : $("question-card");
    if (scrollArea.clientHeight < Math.min(fullscreenLayout ? 64 : 112, scrollArea.scrollHeight)) {
      document.body.classList.remove("inner-scroll");
    }
  }

  const image = $("flip-card").querySelector("img");
  if (!showingLearn || !image || !image.offsetHeight) return;
  // Hold room for the complete card and navigation before sizing its artwork.
  const face = $("card-face");
  const overflow = Math.max(0, face.scrollHeight - face.clientHeight);
  const cardBottom = flashcard.getBoundingClientRect().bottom + window.scrollY + overflow;
  const reservedBottom = parseFloat(getComputedStyle(document.body).paddingBottom);
  const imageSpace = height - reservedBottom - (cardBottom - image.getBoundingClientRect().height);
  flashcard.style.setProperty("--learn-image-space", Math.max(0, Math.floor(imageSpace)) + "px");
}

function scheduleLayoutFit() {
  if (!layoutFrame) layoutFrame = requestAnimationFrame(fitVisibleLayout);
}

const layoutObserver = new ResizeObserver(scheduleLayoutFit);
for (const element of [bottomNav, flashcard, $("card-face"), $("learn-progress-label"), $("play"), $("question-card"), $("round-results"), document.querySelector("body > header"), $("release-notice")]) {
  layoutObserver.observe(element, { box: "border-box" });
}
window.addEventListener("resize", scheduleLayoutFit);
viewport?.addEventListener("resize", scheduleLayoutFit);
scheduleLayoutFit();
