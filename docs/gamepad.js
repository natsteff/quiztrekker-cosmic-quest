"use strict";

(() => {
  const actions = {
    a: ["A · Select or answer 1", 0], b: ["B · Close or answer 2", 1],
    x: ["X · Flip or answer 3", 2], y: ["Y · Explorer or answer 4", 3],
    lb: ["LB · Previous tab", 4], rb: ["RB · Next tab", 5],
    lt: ["LT · Previous card, undo or scroll up", 6], rt: ["RT · Next, check or scroll down", 7],
    view: ["View · Back or games", 8], menu: ["Menu · Settings", 9],
    up: ["D-pad up", 12], down: ["D-pad down", 13],
    left: ["D-pad left", 14], right: ["D-pad right", 15],
    scrollUp: ["Scroll up"], scrollDown: ["Scroll down"]
  };
  const face = ["a", "b", "x", "y"];
  const directions = ["up", "down", "left", "right"];
  const profileKey = "quiztrekker.cosmic-quest.controllerProfiles.v1";
  const helpKey = "quiztrekker.cosmic-quest.controllerHelp.v1";
  const profiles = new Map();
  let device, capture, lastFocus, lastView = "learn", preview = false, faceLatched = false;
  let identity, held = new Set(), repeatAt = new Map(), lastAction = "None yet";
  let blocked = false, lastDiagnostics = -Infinity;

  try {
    const stored = JSON.parse(localStorage.getItem(profileKey) || "{}");
    for (const [id, profile] of Object.entries(stored || {}).slice(0, 32)) {
      if (!profile || typeof profile !== "object") continue;
      const bindings = {};
      for (const [action, binding] of Object.entries(profile.bindings || {})) {
        if (!Object.hasOwn(actions, action) || !Number.isInteger(binding?.index) ||
            binding.index < 0 || binding.index > 63) continue;
        if (binding.type === "button") bindings[action] = { type: "button", index: binding.index };
        if (binding.type === "axis" && Number.isFinite(binding.rest) && Math.abs(binding.rest) <= 1 &&
            [1, -1].includes(binding.direction)) bindings[action] = binding;
      }
      profiles.set(id, { fallback: profile.fallback === true, bindings });
    }
    preview = localStorage.getItem(helpKey) === "true";
  } catch {}

  function persist() {
    try {
      localStorage.setItem(profileKey, JSON.stringify(Object.fromEntries(profiles)));
      return "";
    } catch {
      return " Session only; storage unavailable.";
    }
  }

  function visible(element) {
    if (!element || element.matches(":disabled,[aria-disabled=true]") || element.closest("[hidden],[inert]") ||
        !element.getClientRects().length || getComputedStyle(element).visibility !== "visible") return false;
    for (let parent = element.parentElement; parent; parent = parent.parentElement) {
      if (parent.matches("details:not([open])") && !parent.querySelector(":scope > summary")?.contains(element)) return false;
    }
    return true;
  }

  const controls = (root) => [...root.querySelectorAll("button,a[href],input:not([type=hidden]),select,summary")].filter(visible);
  const modal = () => [...document.querySelectorAll("dialog:modal")].at(-1);
  const currentTab = () => tabs.find((tab) => tab.hasAttribute("aria-current")).dataset.view;
  const onCards = () => currentTab() === "learn" && !$("learn-cards").hidden;
  const quiz = () => currentTab() === "play" && !$("quiz").hidden && !$("question-card").hidden;
  const choices = () => [...$("choices").querySelectorAll("button")].filter(visible);

  function click(id) {
    const element = $(id);
    if (!visible(element)) return false;
    element.click();
    return true;
  }

  function focus(element) {
    if (!visible(element)) return;
    lastFocus?.removeAttribute("data-pad-focus");
    lastFocus = element;
    element.setAttribute("data-pad-focus", "");
    element.focus({ preventScroll: true });
    element.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  function activeControl(items) {
    return items.find((item) => item === document.activeElement) ||
      items.find((item) => item === lastFocus);
  }

  const enabledOptions = (select) => [...select.options].filter((option) =>
    !option.disabled && !option.hidden && !option.closest("optgroup:disabled,[hidden]"));

  function choose(select, option) {
    if (!option || select.selectedIndex === option.index) return;
    select.selectedIndex = option.index;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function openPicker(select) {
    const popup = make("dialog");
    popup.className = "controller-picker";
    const title = select.labels?.[0]?.textContent.trim() || select.getAttribute("aria-label") || "Choose an option";
    popup.setAttribute("aria-label", title);
    popup.append(make("h2", title));
    let selected;
    for (const option of enabledOptions(select)) {
      const button = make("button", option.textContent + (option.selected ? " · Selected" : ""));
      button.setAttribute("aria-pressed", String(option.selected));
      button.addEventListener("click", () => { choose(select, option); popup.close(); });
      popup.append(button);
      if (option.selected) selected = button;
    }
    const cancel = make("button", "Cancel");
    cancel.addEventListener("click", () => popup.close());
    popup.append(cancel);
    popup.addEventListener("close", () => {
      popup.remove();
      focus(select);
    }, { once: true });
    document.body.append(popup);
    popup.showModal();
    focus(selected || controls(popup)[0]);
  }

  function activate(element) {
    if (!element) return;
    if (element.matches("select")) {
      openPicker(element);
    } else {
      focus(element);
      element.click();
    }
  }

  function scroll(direction) {
    const dialog = modal();
    const view = currentTab();
    const panes = dialog ? [dialog] : [
      ...(onCards() ? [$("card-face"), $("flashcard")] : []),
      ...(view === "play" ? [$("question-card"), $("round-results"), $("game-menu")] : []),
      $(view), document.scrollingElement
    ];
    for (const pane of panes) {
      if (!pane?.getClientRects().length) continue;
      if (pane !== document.scrollingElement && !/auto|scroll/.test(getComputedStyle(pane).overflowY)) continue;
      const limit = pane.scrollHeight - pane.clientHeight;
      if (limit <= 1 || (direction < 0 ? pane.scrollTop <= 0 : pane.scrollTop >= limit - 1)) continue;
      pane.scrollTop += direction * Math.max(120, Math.min(320, pane.clientHeight * .65));
      break;
    }
  }

  function navigate(action, items) {
    const active = activeControl(items);
    const step = action === "left" || action === "up" ? -1 : 1;
    if (action === "left" || action === "right") {
      if (active?.matches("select")) {
        const options = enabledOptions(active);
        const index = options.indexOf(active.selectedOptions[0]);
        if (options.length) choose(active, options[index < 0 ? 0 : (index + step + options.length) % options.length]);
        focus(active);
        return;
      }
      if (active?.matches("summary")) {
        active.parentElement.open = step > 0;
        return;
      }
    }
    const index = items.indexOf(active);
    focus(items[index < 0 ? 0 : Math.max(0, Math.min(items.length - 1, index + step))]);
  }

  function route(action) {
    const dialog = modal();
    const view = currentTab();
    if (action === "scrollUp" || action === "scrollDown") return scroll(action === "scrollUp" ? -1 : 1);
    if (dialog) {
      if (action === "b" || action === "view" || (action === "menu" && dialog.id === "settings")) dialog.close();
      else if (action === "lt" || action === "rt") scroll(action === "lt" ? -1 : 1);
      else if (action === "a") {
        const items = controls(dialog);
        activate(activeControl(items) || items[0]);
      } else if (directions.includes(action)) navigate(action, controls(dialog));
      return;
    }

    if (action === "menu") return click("settings-open");
    if (action === "lb" || action === "rb") {
      const index = tabs.findIndex((tab) => tab.dataset.view === view);
      tabs[(index + (action === "lb" ? 2 : 1)) % tabs.length].click();
      return;
    }
    if (view === "my-progress") {
      if (["view", "b"].includes(action)) tabs.find((tab) => tab.dataset.view === lastView).click();
      else if (["lt", "rt", "up", "down"].includes(action)) scroll(["lt", "up"].includes(action) ? -1 : 1);
      return;
    }

    if (view === "play") {
      if (action === "view") {
        openGameMenu(false);
        focus(controls($("game-menu"))[0]);
        return;
      }
      if (quiz()) {
        if (action === "rt") {
          if (answered) click("next");
          else if (gameMode === "order") click("order-submit");
          return;
        }
        if (action === "lt" && gameMode === "order" && !answered) return click("order-undo");
        if (face.includes(action) && !answered) {
          const items = choices();
          const direct = gameMode !== "order" && items.length <= 4;
          if (direct) return activate(items[face.indexOf(action)]);
          if (action === "a") return activate(activeControl(items) || items[0]);
          return;
        }
        if (!answered && directions.includes(action)) return navigate(action, choices());
        if (answered && face.includes(action) && action !== "a") return;
        if (answered && action === "a") {
          const actions = [$("study"), $("quiz-image").querySelector(".credit-link")].filter(visible);
          activate(activeControl(actions));
          return;
        }
      }
    } else if (onCards()) {
      if (action === "lt") return click("previous-card");
      if (action === "rt") return click("next-card");
      if (action === "x") return click("flip-card");
      if (action === "y" && !fullscreenLayout) return click("open-explorer");
      if (action === "up" || action === "down") return scroll(action === "up" ? -1 : 1);
      if (action === "a") {
        const items = [$("mastery"), $("card-select"), $("card-face").querySelector(".credit-link")].filter(visible);
        const active = activeControl(items);
        if (active) return activate(active);
        return click("card-facts");
      }
      if (action === "left" || action === "right") {
        const items = [$("mastery"), $("card-facts"), $("card-face").querySelector(".credit-link"), $("card-select")].filter(visible);
        return navigate(action, items);
      }
    } else if (["b", "view", "y"].includes(action)) {
      return click("close-explorer");
    }

    const items = controls($(view));
    if (action === "a") activate(activeControl(items) || items[0]);
    else if (directions.includes(action)) navigate(action, items);
  }

  function pressed(pad, binding, wasHeld) {
    const threshold = wasHeld ? .25 : .55;
    if (binding?.type === "axis") {
      return (pad.axes[binding.index] - binding.rest) * binding.direction > threshold;
    }
    if (pad.mapping === "standard" && binding?.index === 16) return false;
    const button = pad.buttons[binding?.index];
    return !!button && (button.pressed || button.value > threshold);
  }

  function tickInput(pad, bindings, time) {
    if (!pad) {
      identity = undefined;
      faceLatched = false;
      return;
    }
    const signature = JSON.stringify([pad.index, pad.id, pad.mapping]);
    const reserved = new Set(Object.values(bindings).filter((binding) => binding.type === "axis").map((binding) => binding.index));
    const nextHeld = new Set();
    for (const [action, [, index]] of Object.entries(actions)) {
      const binding = bindings[action] || { type: "button", index };
      if (pressed(pad, binding, held.has(action))) nextHeld.add(action);
    }
    for (const [axis, negative, positive] of [
      [0, "left", "right"], [1, "up", "down"], [3, "scrollUp", "scrollDown"]
    ]) {
      if (reserved.has(axis)) continue;
      const value = pad.axes[axis];
      if (value < (held.has(negative) ? -.25 : -.6)) nextHeld.add(negative);
      if (value > (held.has(positive) ? .25 : .6)) nextHeld.add(positive);
    }

    if (identity !== signature) {
      identity = signature;
      held = nextHeld;
      repeatAt = new Map();
      faceLatched = face.some((action) => held.has(action));
      return;
    }

    if (!face.some((action) => nextHeld.has(action))) faceLatched = false;
    const events = [];
    for (const action of Object.keys(actions)) {
      if (!nextHeld.has(action)) {
        repeatAt.delete(action);
      } else if (!held.has(action)) {
        events.push(action);
        repeatAt.set(action, time + 400);
      } else if ((directions.includes(action) || action.startsWith("scroll")) &&
          time >= (repeatAt.get(action) ?? Infinity)) {
        events.push(action);
        repeatAt.set(action, time + 150);
      }
    }
    held = nextHeld;
    const action = events.find((event) => !faceLatched || !face.includes(event));
    if (!action) return;
    if (face.includes(action)) faceLatched = true;
    lastAction = actions[action][0];
    route(action);
  }

  function write(id, value) {
    const element = $(id);
    if (element.textContent !== value) element.textContent = value;
  }

  function endCapture(message) {
    capture = null;
    lastDiagnostics = -Infinity;
    identity = undefined;
    write("controller-assignment", message);
  }

  const previewInput = $("controller-preview");
  const fallbackInput = $("controller-fallback");
  const actionSelect = $("controller-action");
  const assign = $("controller-assign");
  const cancel = $("controller-cancel");
  const reset = $("controller-reset");
  const getProfile = (id) => {
    if (!profiles.has(id)) profiles.set(id, { fallback: false, bindings: {} });
    return profiles.get(id);
  };
  previewInput.checked = preview;
  previewInput.addEventListener("change", () => {
    preview = previewInput.checked;
    try { localStorage.setItem(helpKey, String(preview)); } catch {}
  });
  fallbackInput.addEventListener("change", () => {
    if (!device) return;
    getProfile(device.id).fallback = fallbackInput.checked;
    identity = undefined;
    write("controller-assignment", "Fallback setting saved." + persist());
  });
  for (const [value, [label]] of Object.entries(actions)) actionSelect.add(new Option(label, value));
  assign.addEventListener("click", () => {
    if (!device || capture) return;
    capture = {
      action: actionSelect.value, id: device.id, index: device.index,
      buttons: Array.from(device.buttons, (_, index) => pressed(device, { index })),
      axes: Array.from(device.axes), deadline: performance.now() + 15000
    };
    lastDiagnostics = -Infinity;
    write("controller-assignment", `Press ${actions[capture.action][0]} now. Keep sticks still. Input is paused during assignment.`);
  });
  cancel.addEventListener("click", () => endCapture("Assignment cancelled."));
  reset.addEventListener("click", () => {
    if (!device) return;
    profiles.delete(device.id);
    endCapture("Original browser mapping restored." + persist());
  });

  function checkCapture(pad, time) {
    if (pad?.id !== capture.id || pad.index !== capture.index) return endCapture("Controller disconnected. Assignment cancelled.");
    if (time > capture.deadline) return endCapture("Assignment timed out. Try again.");
    const button = Array.from(pad.buttons).findIndex((_, index) => {
      if (!pressed(pad, { index }, capture.buttons[index])) capture.buttons[index] = false;
      return !capture.buttons[index] && pressed(pad, { index });
    });
    const axis = Array.from(pad.axes).findIndex((value, index) => Math.abs(value - capture.axes[index]) > .65);
    if (button < 0 && axis < 0) return;
    const binding = button >= 0 ? { type: "button", index: button } : {
      type: "axis", index: axis, rest: capture.axes[axis], direction: Math.sign(pad.axes[axis] - capture.axes[axis])
    };
    getProfile(pad.id).bindings[capture.action] = binding;
    endCapture(`${actions[capture.action][0]} assigned to ${binding.type} ${binding.index}.${persist()} Release the control before using it.`);
  }

  function diagnostics(pad, usable, profile) {
    const status = document.hidden ? "Controller input paused while this page is in the background." :
      !navigator.getGamepads ? "This browser has no Gamepad API." :
      blocked ? "Browser access to controllers is blocked." :
      !pad ? "No controller detected. Focus this page, then press and release a controller button. A keyboard-emulating mapper does not appear as a gamepad." :
      `${usable ? "Connected" : "Unsupported layout"}: ${pad.id}. Mapping: ${pad.mapping || "unmapped"}. ${pad.buttons.length} buttons, ${pad.axes.length} axes. ${Object.keys(profile?.bindings || {}).length} custom assignments.` +
        (usable ? "" : " Assign controls below and enable the standard-layout fallback to test this controller.");
    write("controller-status", status);
    const buttons = Array.from(pad?.buttons || [], (button, index) =>
      `${index}:${Math.max(button.pressed ? 1 : 0, button.value).toFixed(2)}`);
    const axes = Array.from(pad?.axes || [], (value, index) => `${index}:${value.toFixed(2)}`);
    write("controller-inputs", `Buttons: ${buttons.join(" ") || "none"} · Axes: ${axes.join(" ") || "none"} · Last action: ${lastAction}`);
    fallbackInput.checked = !!profile?.fallback;
    fallbackInput.disabled = !pad || pad.mapping === "standard" || !!capture;
    actionSelect.disabled = assign.disabled = reset.disabled = !pad || !!capture;
    cancel.disabled = !capture;
  }

  function renderHelp(usable) {
    const showHelp = usable || preview;
    $("controller-help").hidden = !showHelp;
    document.body.classList.toggle("controller-ready", showHelp);
    if (!showHelp && !document.querySelector(".pad-badge")) return;
    const options = quiz() && !answered && gameMode !== "order" ? choices() : [];
    const direct = options.length > 0 && options.length <= 4;
    for (const badge of $("choices").querySelectorAll(".pad-badge")) {
      if (!showHelp || !direct) badge.remove();
    }
    if (!showHelp) return;
    if (direct) options.forEach((button, index) => {
      if (button.querySelector(".pad-badge")) return;
      const badge = make("span", face[index].toUpperCase());
      badge.className = "pad-badge";
      badge.setAttribute("aria-hidden", "true");
      button.prepend(badge);
    });

    const dialog = modal();
    const view = currentTab();
    let hint;
    if (capture) hint = "Input paused for assignment";
    else if (dialog) hint = "D-pad / left stick: move · A: select · ←→: change option · LT / RT: scroll · B / View: close";
    else if (view === "my-progress") hint = "LT / RT: scroll · B / View: back";
    else if (onCards()) {
      hint = "LT / RT: previous / next · X: flip · A: facts / selected control · ←→: card controls · ↑↓: scroll";
      if (!fullscreenLayout) hint += " · Y: Explorer";
    } else if (view === "learn") hint = "D-pad / left stick: move · A: select · Y / B: back to cards";
    else if (quiz()) {
      if (answered) {
        hint = `RT: ${position + 1 === deck.length ? "round results" : "next question"} · A: open selected Learn card`;
        if (gameMode === "image") hint += " or credit";
      }
      else if (direct) hint = face.slice(0, options.length).join(" / ").toUpperCase() + ": answer";
      else if (gameMode === "order") hint = "D-pad / left stick: move · A: add / remove · LT: undo · RT: check order";
      else hint = "D-pad / left stick: move · A: answer";
    } else hint = "D-pad / left stick: move · A: select";
    if (!dialog && view === "play") hint += " · View: games";
    if (!dialog) hint += " · LB / RB: tabs · Menu: Settings";
    if (!capture) hint += " · Right stick ↑↓: scroll";
    if (!usable) hint = "Controls preview — no active controller. " + hint;
    write("controller-help", hint);
  }

  const allowed = (pad) => pad.mapping === "standard" || profiles.get(pad.id)?.fallback;
  function frame(time) {
    let pads = [];
    blocked = false;
    try {
      if (!document.hidden) pads = Array.from(navigator.getGamepads?.() || []).filter((pad) => pad?.connected);
    } catch {
      blocked = true;
    }
    const previousDevice = device;
    device = capture ? pads.find((pad) => pad.index === capture.index && pad.id === capture.id) :
      pads.find(allowed) || pads[0];
    if (previousDevice?.id !== device?.id || previousDevice?.index !== device?.index) lastDiagnostics = -Infinity;
    if (capture) checkCapture(device, time);
    if (currentTab() !== "my-progress") lastView = currentTab();
    const profile = profiles.get(device?.id);
    const usable = !!device && allowed(device);
    tickInput(usable && !capture ? device : null, profile?.bindings || {}, time);
    if (time - lastDiagnostics >= 100) {
      diagnostics(device, usable, profile);
      lastDiagnostics = time;
    }
    renderHelp(usable);
    requestAnimationFrame(frame);
  }

  document.addEventListener("visibilitychange", () => {
    identity = undefined;
    if (document.hidden && capture) endCapture("Page moved to the background. Assignment cancelled.");
    if (document.hidden) write("controller-status", "Controller input paused while this page is in the background.");
  });
  window.addEventListener("gamepaddisconnected", () => { identity = undefined; });
  requestAnimationFrame(frame);
})();
