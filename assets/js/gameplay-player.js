(function () {
  function init() {
    var sections = document.querySelectorAll("#preview-killfeed-gameplay .gameplay");
    if (!sections.length) {
      return;
    }
    sections.forEach(function (gameplay) {
      setupGameplay(gameplay);
    });
  }

  function setupGameplay(gameplay) {
    var src = gameplay.getAttribute("root");
    var start = parseInt(gameplay.getAttribute("killfeed-item-start"), 10);
    var end = parseInt(gameplay.getAttribute("killfeed-item-end"), 10);
    var fps = parseFloat(gameplay.getAttribute("fps")) || 24;
    if (!src || isNaN(start) || isNaN(end)) {
      return;
    }

    var killfeedItem = gameplay.querySelector(".killfeed-item");

    var video = document.createElement("video");
    video.className = "gameplay-video";
    video.src = src;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";
    gameplay.insertBefore(video, gameplay.firstChild);

    var startTime = start / fps;
    var endTime = end / fps;

    function update() {
      if (killfeedItem) {
        var visible = video.currentTime >= startTime && video.currentTime <= endTime;
        killfeedItem.style.opacity = visible ? "1" : "0";
      }
    }

    video.addEventListener("timeupdate", update);
    video.addEventListener("play", update);
    video.addEventListener("play", function () {
      requestAnimationFrame(update);
    });

    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        // Autoplay blocked; fall back to showing the first frame.
        update();
      });
    } else {
      update();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();