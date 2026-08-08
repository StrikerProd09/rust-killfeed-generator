(function () {
  function init() {
    var slider = document.getElementById("banner-slider");
    if (!slider) {
      return;
    }

    var track = document.getElementById("banner-slider-track");
    var dots = document.getElementById("banner-slider-dots");
    var slides = track.querySelectorAll(".banner-slide");
    var current = 0;

    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "banner-dot" + (i === 0 ? " active" : "");
      dot.setAttribute("aria-label", "Go to slide " + (i + 1));
      dot.addEventListener("click", function (evt) {
        evt.stopPropagation();
        goTo(i);
      });
      dots.appendChild(dot);
    });

    var prev = slider.querySelector(".banner-slider-prev");
    var next = slider.querySelector(".banner-slider-next");
    prev.addEventListener("click", function (evt) {
      evt.stopPropagation();
      goTo(current - 1);
    });
    next.addEventListener("click", function (evt) {
      evt.stopPropagation();
      goTo(current + 1);
    });

    function goTo(index) {
      var length = slides.length;
      current = (index + length) % length;
      track.style.transform = "translateX(-" + current * 100 + "%)";
      dots.querySelectorAll(".banner-dot").forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    goTo(0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();