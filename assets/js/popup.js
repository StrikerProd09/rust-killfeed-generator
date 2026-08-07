(function () {
  var activeOverlay = null;
  var movedSource = null; // original .gameplay element, if moved into popup
  var movedParent = null; // original parent to restore on close

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
      // Move the game element back to where it was, if it was moved in.
      if (movedSource && movedParent) {
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

    var video = sourceEl.querySelector && sourceEl.querySelector("video");
    if (video) {
      // Move the original element (with its live video/animation) into the popup.
      movedSource = sourceEl;
      movedParent = sourceEl.parentNode;
      content.appendChild(sourceEl);
    } else {
      // Static content (e.g. images): clone it to avoid side effects.
      var clone = sourceEl.cloneNode(true);
      clone.removeAttribute("data-popup");
      clone.removeAttribute("data-popup");
      content.appendChild(clone);
    }

    activeOverlay = overlay;
  }

  function init() {
    document.querySelectorAll("[data-popup='true'], [data-popup='true']").forEach(function (el) {
      el.addEventListener("click", function () {
        openPopup(el);
      });
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