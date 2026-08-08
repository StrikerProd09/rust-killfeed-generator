(function () {
  var activeOverlay = null;
  var movedSource = null;
  var movedParent = null;

  function createPopup() {
    var overlay = document.createElement("div");
    overlay.className = "popup-overlay";
    overlay.addEventListener("click", function (evt) {
      if (evt.target === overlay || evt.target.closest(".popup-close")) {
        closePopup();
      }
    });

    var content = document.createElement("div");
    content.className = "popup-content";
    overlay.appendChild(content);

    var closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "popup-close";
    closeBtn.setAttribute("aria-label", "Close popup");
    closeBtn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M18 6L6 18"></path>' +
      '<path d="M6 6l12 12"></path>' +
      "</svg>";
    overlay.appendChild(closeBtn);

    document.querySelector("main").appendChild(overlay);
    return overlay;
  }

  function closePopup() {
    if (!activeOverlay || activeOverlay.classList.contains("popup-closing")) {
      return;
    }
    activeOverlay.classList.add("popup-closing");
    setTimeout(function () {
      if (movedSource && movedParent) {
        movedSource.setAttribute("data-popup", "true");
        movedParent.appendChild(movedSource);
        movedSource = null;
        movedParent = null;
      }
      activeOverlay.remove();
      activeOverlay = null;
    }, 200);
  }

  function openPopup(sourceEl) {
    var overlay = createPopup();
    var content = overlay.querySelector(".popup-content");

    // Elements that hold live behavior (video, buttons, sliders) must be
    // moved, not cloned, because cloned nodes lose their event listeners.
    var hasInteraction =
      sourceEl.querySelector &&
      sourceEl.querySelector("video, button, input, select, textarea, a");

    if (hasInteraction) {
      movedSource = sourceEl;
      movedParent = sourceEl.parentNode;
      sourceEl.removeAttribute("data-popup");
      content.appendChild(sourceEl);
    } else {
      var clone = sourceEl.cloneNode(true);
      clone.removeAttribute("data-popup");
      content.appendChild(clone);
    }

    activeOverlay = overlay;
  }

  function init() {
    document.addEventListener("click", function (evt) {
      var trigger = evt.target.closest("[data-popup='true']");
      if (trigger) {
        var interactive = evt.target.closest(
          "button, input, select, textarea, a, label, [contenteditable]",
        );
        if (interactive) {
          return;
        }
        openPopup(trigger);
      }
    });
  }

  document.addEventListener("keydown", function (evt) {
    if (evt.key === "Escape") {
      closePopup();
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
