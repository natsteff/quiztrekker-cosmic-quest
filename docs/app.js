"use strict";
const $ = (id) => document.getElementById(id);
const key = "quiztrekker.cosmic-quest.v1";
const topicIds = Object.keys(topics);
let saved;
try {
  saved = JSON.parse(localStorage.getItem(key));
} catch {
  saved = null;
}
const count = (value) => Number.isSafeInteger(value) && value >= 0 ? value : 0;
const preferences = {
  level: saved?.level === "advanced" ? "advanced" : "foundations",
  topics: topicIds.filter((id) => Array.isArray(saved?.topics) && saved.topics.includes(id)),
  points: count(saved?.points),
  answered: count(saved?.answered),
  correct: count(saved?.correct),
  bestStreak: count(saved?.bestStreak),
  explored: cards.filter((card) => Array.isArray(saved?.explored) && saved.explored.includes(card.id)).map((card) => card.id)
};
if (!preferences.topics.length) preferences.topics = [...topicIds];

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

let deck;
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

function renderQuestion(focus = false) {
  answered = false;
  const card = deck[position];
  const [question, correct, ...distractors] = card[preferences.level];
  $("progress").textContent = `Question ${position + 1} of ${deck.length}`;
  $("points").textContent = `${preferences.points.toLocaleString()} pts`;
  $("topic").textContent = topics[card.topic];
  $("play-title").textContent = question;
  $("feedback").replaceChildren();
  $("next").hidden = true;
  $("study").hidden = true;
  $("choices").replaceChildren();
  const buttons = shuffle([correct, ...distractors]).map((choice, index) => {
    const button = make("button");
    button.append(make("strong", String.fromCharCode(65 + index)), make("span", choice));
    button.addEventListener("click", () => {
      if (answered) return;
      answered = true;
      const right = choice === correct;
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
      for (const option of buttons) option.disabled = true;
      buttons.find((option) => option.lastChild.textContent === correct).dataset.result = "correct";
      if (!right) button.dataset.result = "wrong";
      const result = right ? `Correct! +${award} points` : `Correct answer: ${correct}`;
      $("feedback").append(make("strong", result), make("p", preferences.level === "advanced" ? card.detail : card.intro));
      if (!storageAvailable) $("feedback").append(make("p", "Points are available for this visit. Browser storage is unavailable."));
      $("study").hidden = false;
      $("next").hidden = false;
      $("next").textContent = position + 1 === deck.length ? "New round" : "Next question";
      $("next").focus();
    });
    return button;
  });
  $("choices").append(...buttons);
  if (focus) $("play-title").focus();
}

function start(previousId) {
  deck = shuffle(cards.filter((card) => preferences.topics.includes(card.topic)));
  if (deck.length > 1 && deck[0].id === previousId) {
    deck.push(deck.shift());
  }
  position = 0;
  streak = 0;
  renderQuestion();
}

function renderCard() {
  const card = cards[cardIndex];
  const [file, alt, caption, credit, creditUrl] = artwork[card.id];
  $("card-position").textContent = `${cardIndex + 1} / ${cards.length}`;
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
  cardIndex = (index + cards.length) % cards.length;
  flipped = false;
  renderCard();
}

function renderProgress() {
  $("total-points").textContent = preferences.points.toLocaleString();
  $("cards-explored").textContent = `${preferences.explored.length} / ${cards.length}`;
  $("total-answered").textContent = preferences.answered.toLocaleString();
  $("total-correct").textContent = preferences.correct.toLocaleString();
  $("best-streak").textContent = preferences.bestStreak.toLocaleString();
  $("progress-note").textContent = storageAvailable
    ? "Points and activity are saved in this browser. Activity tracking began in version 0.2.0."
    : "Progress is available for this visit. Browser storage is unavailable.";
}

function updateSettings() {
  storageAvailable = save();
  $("settings-status").textContent = storageAvailable ? "Settings saved. A new round is ready." : "Settings apply for this visit.";
  renderCard();
  start();
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
  selectCard(cards.indexOf(deck[position]));
  show("learn", false);
  $("flip-card").focus();
});
$("settings-open").addEventListener("click", () => $("settings").showModal());
$("start-quiz").addEventListener("click", () => {
  $("game-menu").hidden = true;
  $("quiz").hidden = false;
  $("play").setAttribute("aria-labelledby", "play-title");
  if (!deck) start();
  $("play-title").focus();
});
$("quiz-menu").addEventListener("click", () => {
  $("quiz").hidden = true;
  $("game-menu").hidden = false;
  $("play").setAttribute("aria-labelledby", "play-menu-title");
  $("start-quiz").textContent = "Resume space quiz";
  $("play-menu-title").focus();
});
$("flip-card").addEventListener("click", () => {
  flipped = !flipped;
  const id = cards[cardIndex].id;
  if (flipped && !preferences.explored.includes(id)) {
    preferences.explored.push(id);
    storageAvailable = save();
  }
  renderCard();
});
$("previous-card").addEventListener("click", () => selectCard(cardIndex - 1));
$("next-card").addEventListener("click", () => selectCard(cardIndex + 1));
for (const card of cards) {
  const option = make("option", card.title);
  option.value = card.id;
  $("card-select").append(option);
}
$("card-select").addEventListener("change", (event) => selectCard(event.target.selectedIndex));

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
for (const id of topicIds) {
  const label = make("label");
  const input = make("input");
  input.type = "checkbox";
  input.checked = preferences.topics.includes(id);
  input.addEventListener("change", () => {
    if (!input.checked && preferences.topics.length === 1) {
      input.checked = true;
      $("settings-status").textContent = "Keep at least one topic selected to play.";
      return;
    }
    preferences.topics = input.checked ? [...preferences.topics, id] : preferences.topics.filter((topic) => topic !== id);
    updateSettings();
  });
  label.append(input, make("span", topics[id]));
  $("filters").append(label);
}
renderCard();
