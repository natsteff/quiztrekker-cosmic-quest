"use strict";

(function () {
  const current = document.querySelector('meta[name="cq-release"]').content;
  const checkButton = $("check-updates");
  const applyButton = $("apply-update");
  const status = $("update-status");
  const notice = $("release-notice");
  const versionPattern = /^\d+\.\d+\.\d+$/;

  let available = null;
  let checking = false;
  let lastCheck = 0;
  let leaving = false;

  function newer(version) {
    const installed = current.split(".").map(Number);
    const candidate = version.split(".").map(Number);
    const difference = candidate.findIndex((part, index) => part !== installed[index]);
    return difference !== -1 && candidate[difference] > installed[difference];
  }

  function unfinishedRound() {
    return Boolean(gameMode && deck?.length && (!answered || position < deck.length - 1));
  }

  function reportAvailable() {
    if (!available) return;
    const blocked = unfinishedRound();
    const message = blocked
      ? `Version ${available} is available. Finish your round before updating.`
      : `Version ${available} is available in Settings.`;
    status.textContent = message;
    notice.textContent = message;
    notice.hidden = false;
    applyButton.hidden = false;
    applyButton.disabled = blocked;
  }

  function applyUpdate(explicit = false) {
    if (!available || leaving) return;
    if (unfinishedRound()) {
      reportAvailable();
      return;
    }
    const url = new URL(location.href);
    if (!explicit && url.searchParams.get("release") === available) {
      reportAvailable();
      return;
    }
    url.searchParams.delete("v");
    url.searchParams.set("release", available);
    // A unique same-origin URL bypasses the HTTP cache, including on retry.
    url.searchParams.set("reload", String(Date.now()));
    leaving = true;
    location.replace(url);
  }

  async function checkForUpdates(manual = false) {
    if (checking || leaving) return;
    checking = true;
    lastCheck = Date.now();
    checkButton.disabled = true;
    if (manual) status.textContent = "Checking for updates…";

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const url = new URL("release.json", document.baseURI);
      url.searchParams.set("check", String(lastCheck));
      const response = await fetch(url, { cache: "no-store", signal: controller.signal });
      if (!response.ok) throw new Error("Release check failed");
      const { version } = await response.json();
      if (typeof version !== "string" || !versionPattern.test(version)) throw new Error("Invalid release version");
      if (newer(version)) {
        available = version;
        reportAvailable();
        // Let players review a completed round or finish using Settings.
        if (!manual && !gameMode && !$("settings").open) applyUpdate();
      } else if (manual) {
        status.textContent = `You’re up to date. Version ${current}.`;
      }
    } catch {
      if (manual) status.textContent = "Couldn’t check for updates. Try again when you’re online.";
    } finally {
      clearTimeout(timeout);
      checkButton.disabled = false;
      checking = false;
    }
  }

  checkButton.addEventListener("click", () => checkForUpdates(true));
  applyButton.addEventListener("click", () => applyUpdate(true));
  $("settings").addEventListener("close", reportAvailable);
  $("settings-open").addEventListener("click", reportAvailable);
  document.addEventListener("cq-round-state", reportAvailable);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && Date.now() - lastCheck >= 60000) checkForUpdates();
  });
  checkForUpdates();
})();
