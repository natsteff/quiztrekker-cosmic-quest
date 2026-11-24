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
const preferences = {
  level: saved?.level === "advanced" ? "advanced" : "foundations",
  topics: topicIds.filter((id) => Array.isArray(saved?.topics) && saved.topics.includes(id)),
  points: Number.isSafeInteger(saved?.points) && saved.points >= 0 ? saved.points : 0
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
const tabs = [...document.querySelectorAll("[data-view]")];

function show(view, focus = true) {
  for (const tab of tabs) {
    const active = tab.dataset.view === view;
    $(tab.dataset.view).hidden = !active;
    if (active) tab.setAttribute("aria-current", "page");
    else tab.removeAttribute("aria-current");
  }
  if (focus) $(view + "-title").focus();
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
      let stored = true;
      if (right) {
        preferences.points += 100;
        stored = save();
      }
      $("points").textContent = `${preferences.points.toLocaleString()} pts`;
      for (const option of buttons) option.disabled = true;
      buttons.find((option) => option.lastChild.textContent === correct).dataset.result = "correct";
      if (!right) button.dataset.result = "wrong";
      const result = right ? "Correct! +100 points" : `Correct answer: ${correct}`;
      $("feedback").append(make("strong", result), make("p", preferences.level === "advanced" ? card.detail : card.intro));
      if (!stored) $("feedback").append(make("p", "Points are available for this visit. Browser storage is unavailable."));
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
  renderQuestion();
}

function buildLibrary() {
  const advanced = preferences.level === "advanced";
  $("library").replaceChildren(...cards.map((card) => {
    const entry = make("details");
    entry.id = "learn-" + card.id;
    const source = make("a", "Read more at NASA");
    source.href = card.source;
    entry.append(make("summary", card.title), make("p", card.intro));
    if (advanced) entry.append(make("p", card.detail));
    entry.append(source);
    return entry;
  }));
}

function updateSettings() {
  const stored = save();
  $("settings-status").textContent = stored ? "Settings saved. A new round is ready." : "Settings apply for this visit.";
  buildLibrary();
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
  show("learn", false);
  const entry = $("learn-" + deck[position].id);
  entry.open = true;
  entry.querySelector("summary").focus();
});

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
buildLibrary();
start();
