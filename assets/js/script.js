var nr = 0;

function bright() {
  document.getElementById("background_overlay").value = "#fff";
  document.getElementById("killfeed-generator").style.backgroundColor =
    "#fff";
}

function dark() {
  document.getElementById("background_overlay").value = "#222222";
  document.getElementById("killfeed-generator").style.backgroundColor =
    "#222222";
}

function background_apply() {
  var background = document.getElementById("background_overlay").value;
  document.getElementById("killfeed-generator").style.backgroundColor =
    background;
}

function players_apply() {
  var player_1 = document.getElementById("player_1").value;
  var player_2 = document.getElementById("player_2").value;
  console.log("Player 1: " + player_1 + " Player 2: " + player_2);
  var p1 = document.getElementsByClassName("player1");
  for (var i = 0; i < p1.length; i++) {
    p1[i].innerHTML = player_1;
  }
  var p2 = document.getElementsByClassName("player2");
  for (var i = 0; i < p2.length; i++) {
    p2[i].innerHTML = player_2;
  }
}

function customize() {
  $("#options").toggle();
  $("#customize").toggleClass("btn-active");
}

function applyItemStyle() {
  var root = document.documentElement;
  root.style.setProperty(
    "--rkg-font-size-selected",
    document.getElementById("item_font_size").value + "px",
  );
  root.style.setProperty(
    "--rkg-font-family-selected",
    "'" + document.getElementById("item_font_family").value + "'",
  );
  root.style.setProperty(
    "--rkg-p-x-selected",
    document.getElementById("item_p_x").value + "px",
  );
  root.style.setProperty(
    "--rkg-p-y-selected",
    document.getElementById("item_p_y").value + "px",
  );
  root.style.setProperty(
    "--rkg-font-color-selected",
    document.getElementById("item_font_color").value,
  );
  root.style.setProperty(
    "--rkg-background-color-selected",
    document.getElementById("item_bg_color").value,
  );
  root.style.setProperty(
    "--rkg-border-width-selected",
    document.getElementById("item_border_width").value + "px",
  );
  root.style.setProperty(
    "--rkg-border-color-selected",
    document.getElementById("item_border_color").value,
  );
}

function loadFontFromUrl(src, family) {
  var familyValue = family || "CustomFont";
  var srcValue = src || document.getElementById("item_font_src").value.trim();
  if (!srcValue) {
    console.warn("Provide a Font URL.");
    return;
  }
  var style = document.createElement("style");
  style.innerHTML =
    "@font-face { font-family: '" +
    familyValue +
    "'; src: url('" +
    srcValue +
    "'); }";
  document.head.appendChild(style);
  document.documentElement.style.setProperty(
    "--rkg-font-family-selected",
    "'" + familyValue + "'",
  );
  console.log("Loading font: " + familyValue + " from " + srcValue);
}

function loadExampleFont(src, family) {
  if (!src) {
    return;
  }
  var srcInput = document.getElementById("item_font_src");
  if (srcInput) {
    srcInput.value = src;
  }
  loadFontFromUrl(src, family);
}

function loadImage(src) {
  return new Promise(function (resolve, reject) {
    fetch(src)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Failed to load image: " + src);
        }
        return response.blob();
      })
      .then(function (blob) {
        var objectUrl = URL.createObjectURL(blob);
        var img = new Image();
        img.onload = function () {
          URL.revokeObjectURL(objectUrl);
          resolve(img);
        };
        img.onerror = function () {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Failed to load image: " + src));
        };
        img.src = objectUrl;
      })
      .catch(function (err) {
        reject(err);
      });
  });
}

function drawKillfeedItem(item, scale) {
  return new Promise(function (resolve, reject) {
    var spec = window.getComputedStyle(item);
    var isFontFamilyKnown =
      spec.fontFamily && spec.fontFamily.indexOf("serif") === -1;

    var rootStyle = window.getComputedStyle(document.documentElement);
    var varFamily = (
      rootStyle.getPropertyValue("--rkg-font-family-selected") || ""
    )
      .replace(/["']/g, "")
      .trim();
    var varSize = rootStyle.getPropertyValue("--rkg-font-size-selected") || "";

    var fontFamily = isFontFamilyKnown
      ? spec.fontFamily.replace(/["']/g, "")
      : varFamily || "Roboto-Medium";
    var fontSize = isFontFamilyKnown
      ? parseFloat(spec.fontSize)
      : parseFloat(varSize);
    fontSize = fontSize && fontSize > 0 ? fontSize : 25;

    var fontColor =
      spec.color && spec.color !== "rgb(0, 0, 0)" ? spec.color : "#000";
    var bgColor = spec.backgroundColor || "#fff";
    var borderWidth = parseFloat(spec.borderLeftWidth) || 0;
    var borderColor = spec.borderColor || "#000";
    var padX = parseFloat(spec.paddingLeft) || 0;
    var padY = parseFloat(spec.paddingTop) || 0;

    var p1El = item.querySelector(".player1");
    var p2El = item.querySelector(".player2");
    var player1 = p1El ? p1El.textContent : "";
    var player2 = p2El ? p2El.textContent : "";

    var weaponEl = item.querySelector("img.sp_icon");
    var additionalEls = Array.prototype.slice.call(
      item.querySelectorAll(".additional"),
    );
    var weaponSrc = weaponEl ? weaponEl.getAttribute("src") : null;

    var loaders = [];
    if (weaponSrc) loaders.push(loadImage(weaponSrc));
    additionalEls.forEach(function (slot) {
      var imgEl = slot.querySelector("img");
      var src = imgEl ? imgEl.getAttribute("src") : null;
      if (src) loaders.push(loadImage(src));
    });

    Promise.all(loaders)
      .then(function (imgs) {
        var weapon = imgs[0] || null;
        var additionalsImages = [];
        for (var k = 1; k < imgs.length; k++) {
          additionalsImages.push(imgs[k]);
        }

        var probe = document.createElement("canvas");
        var pctx = probe.getContext("2d");
        pctx.font = fontSize + "px " + fontFamily;
        var w1 = pctx.measureText(player1).width;
        var w2 = pctx.measureText(player2).width;

        var iconMaxH = Math.min(fontSize * 2, 50);
        var weaponW = weapon
          ? iconMaxH * (weapon.naturalWidth / weapon.naturalHeight)
          : 0;
        var additionalsW = additionalsImages.map(function (img) {
          return img
            ? iconMaxH * (img.naturalWidth / img.naturalHeight)
            : 0;
        });

        var gap = 10;
        var innerH = Math.max(fontSize, iconMaxH);
        var contentW = w1 + gap + weaponW;
        additionalsW.forEach(function (w) {
          contentW += w ? gap + w : 0;
        });
        contentW += gap + w2;
        var totalW = contentW + padX * 2 + borderWidth * 2;
        var totalH = innerH + padY * 2 + borderWidth * 2;
        var centerY = totalH / 2;

        var canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(totalW * scale));
        canvas.height = Math.max(1, Math.round(totalH * scale));
        var ctx = canvas.getContext("2d");
        ctx.scale(scale, scale);

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, totalW, totalH);

        if (borderWidth > 0) {
          ctx.lineWidth = borderWidth;
          ctx.strokeStyle = borderColor;
          ctx.strokeRect(
            borderWidth / 2,
            borderWidth / 2,
            totalW - borderWidth,
            totalH - borderWidth,
          );
        }

        ctx.font = fontSize + "px " + fontFamily;
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.fillStyle = fontColor;

        var cursor = borderWidth + padX;
        ctx.fillText(player1, cursor, centerY);
        cursor += w1 + gap;

        if (weapon) {
          ctx.drawImage(
            weapon,
            cursor,
            centerY - iconMaxH / 2,
            weaponW,
            iconMaxH,
          );
          cursor += weaponW + gap;
        }

        for (var a = 0; a < additionalsImages.length; a++) {
          var aImg = additionalsImages[a];
          var aW = additionalsW[a];
          if (!aImg || !aW) {
            continue;
          }
          ctx.drawImage(aImg, cursor, centerY - iconMaxH / 2, aW, iconMaxH);
          cursor += aW + gap;
        }

        ctx.fillText(player2, cursor, centerY);

        resolve(canvas);
      })
      .catch(reject);
  });
}

function renderElementToCanvas(element) {
  return new Promise(function (resolve, reject) {
    var items;
    if (element.classList && element.classList.contains("killfeed-item")) {
      items = [element];
    } else {
      items = Array.prototype.slice.call(
        element.querySelectorAll(".killfeed-item"),
      );
    }
    var scale = 2;
    if (!items.length) {
      reject(new Error("No .killfeed-item found to render."));
      return;
    }
    Promise.all(
      items.map(function (item) {
        return drawKillfeedItem(item, scale);
      }),
    )
      .then(function (canvases) {
        resolve(canvases.length === 1 ? canvases[0] : canvases);
      })
      .catch(reject);
  });
}

function combineCanvases(canvases) {
  var gap = 16;
  var maxWidth = 0;
  var totalHeight = 0;
  canvases.forEach(function (canvas) {
    maxWidth = Math.max(maxWidth, canvas.width);
    totalHeight += canvas.height;
  });
  totalHeight += gap * (canvases.length - 1);

  var combined = document.createElement("canvas");
  combined.width = maxWidth;
  combined.height = totalHeight;
  var ctx = combined.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, combined.width, combined.height);

  var y = 0;
  canvases.forEach(function (canvas) {
    ctx.drawImage(canvas, (maxWidth - canvas.width) / 2, y);
    y += canvas.height + gap;
  });
  return combined;
}

function takeScreenShot() {
  document.getElementById("download_img").style.display = "flex";
  document.getElementById("convert_elem_msg").style.display = "flex";

  var preview = document.getElementById("target_preview");
  var source =
    preview &&
    (preview.classList.contains("killfeed-item") ||
      preview.querySelector(".killfeed-item"))
      ? preview
      : document.getElementById("killfeed-generator");

  var allContent = document.getElementById("download1").checked;

  return renderElementToCanvas(source).then(function (result) {
    var canvases = Array.isArray(result) ? result : [result];
    if (allContent && canvases.length > 1) {
      var combined = combineCanvases(canvases);
      combined.id = "IMG_" + nr + "_all";
      nr++;
      var downloadImg = document.getElementById("download_img");
      downloadImg.insertAdjacentElement("afterend", combined);
      combined.scrollIntoView();
      return [combined];
    }
    canvases.forEach(function (canvas, i) {
      canvas.id = "IMG_" + nr + "_" + i;
      nr++;
      var downloadImg = document.getElementById("download_img");
      downloadImg.insertAdjacentElement("afterend", canvas);
    });
    var last = canvases[canvases.length - 1];
    last.scrollIntoView();
    return canvases;
  });
}

$(document).ready(function () {
  var generatorElement = document.getElementById("killfeed-generator");
  var paramsFile = generatorElement
    ? generatorElement.getAttribute("params") || "killfeed-rust-params.json"
    : "killfeed-rust-params.json";

  function loadParams(fileName) {
    if (typeof images !== "undefined") {
      return;
    }
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "assets/json/" + fileName, false);
    try {
      xhr.send(null);
      if (xhr.status === 200 || xhr.status === 0) {
        var params = JSON.parse(xhr.responseText);
        images = params.images || [];
        path = params.path || "assets/img/killfeed-icons/rust/";
        player1 = params.player1 || "Player1";
        player2 = params.player2 || "Player2";
        additionals = params.additionals || [];
      } else {
        console.error("Failed to load params: " + fileName + " (" + xhr.status + ")");
      }
    } catch (e) {
      console.error("Failed to load params: " + fileName, e);
    }
  }

  loadParams(paramsFile);

  function resolveFontSrc(src) {
    try {
      return new URL(src, window.location.href).href;
    } catch (e) {
      return src;
    }
  }

  function selectLocalFont() {
    var select = document.getElementById("item_font_family");
    var opt = select.options[select.selectedIndex];
    if (!opt) {
      return;
    }
    var src = resolveFontSrc(opt.getAttribute("data-src") || "");
    var srcInput = document.getElementById("item_font_src");
    if (srcInput) {
      srcInput.value = src;
    }
    loadFontFromUrl(src, opt.value);
  }

  function loadLocalFonts() {
    var select = document.getElementById("item_font_family");
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "assets/json/fonts.json", false);
    try {
      xhr.send(null);
      if (xhr.status === 200 || xhr.status === 0) {
        var fonts = JSON.parse(xhr.responseText);
        select.innerHTML = "";
        fonts.forEach(function (font) {
          var opt = document.createElement("option");
          opt.value = font["font-family"];
          opt.setAttribute("data-src", font.src || "");
          opt.textContent = font["font-family"];
          select.appendChild(opt);
        });
        select.value = fonts[0]["font-family"] || "";
      } else {
        console.error("Failed to load fonts (" + xhr.status + ")");
      }
    } catch (e) {
      console.error("Failed to load fonts", e);
    }

    select.addEventListener("change", selectLocalFont);
    selectLocalFont();
  }

  loadLocalFonts();

  function additionalSlotsHtml(location) {
    var html = "";
    for (var i = 0; i < additionals.length; i++) {
      html +=
        "<span class='additional' data-additional='" +
        additionals[i] +
        "' data-location='" +
        location +
        "' data-order='" +
        (i + 1) +
        "'></span>";
    }
    return html;
  }

  function renderKillfeedItems() {
    var items = document.querySelectorAll("killfeed-item");
    if (!items.length) {
      return;
    }
    items.forEach(function (el) {
      var img = el.getAttribute("img") || "";
      var p1 = el.getAttribute("player_name_1") || player1;
      var p2 = el.getAttribute("player_name_2") || player2;
      var id = el.getAttribute("id") || "";
      var location = el.getAttribute("location") || "suffix";
      var item = document.createElement("div");
      item.className = "killfeed-item";
      if (id) {
        item.id = id;
      }
      item.innerHTML =
        "<p class='player1'>" +
        p1 +
        "</p><img class='sp_icon' alt='Weapon' src='" +
        path +
        img +
        ".webp'>" +
        additionalSlotsHtml(location) +
        "<p class='player2'>" +
        p2 +
        "</p>";
      el.appendChild(item);
    });
  }

  renderKillfeedItems();

  console.log("Length Array: " + images.length);

  var cookieNotice = document.getElementById("cookie-notice");
  var cookieAccept = document.getElementById("cookie-accept");

  function getConsent() {
    try {
      if (localStorage.getItem("rkg_cookie_consent") === "accepted") {
        return true;
      }
    } catch (e) {
      // ignore
    }
    return document.cookie.indexOf("rkg_cookie_consent=accepted") !== -1;
  }

  function saveConsent() {
    var expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);
    document.cookie =
      "rkg_cookie_consent=accepted; expires=" +
      expiry.toUTCString() +
      "; path=/";
    try {
      localStorage.setItem("rkg_cookie_consent", "accepted");
    } catch (e) {
      // localStorage unavailable; rely on document.cookie above.
    }
  }

  if (cookieNotice) {
    if (!getConsent()) {
      cookieNotice.style.display = "flex";
    }
  }
  if (cookieAccept) {
    cookieAccept.addEventListener("click", function () {
      saveConsent();
      if (cookieNotice) {
        cookieNotice.style.display = "none";
      }
    });
  }

  var navShare = document.getElementById("nav-share");
  var navShareLabel = document.getElementById("nav-share-label");
  if (navShare && navShareLabel) {
    navShare.addEventListener("click", function () {
      var url = window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(showCopied);
      } else {
        var input = document.createElement("input");
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
        showCopied();
      }
    });
    navShareLabel.addEventListener("click", function (evt) {
      evt.stopPropagation();
    });
  }

  function showCopied() {
    navShareLabel.classList.add("show");
    clearTimeout(navShare._timer);
    navShare._timer = setTimeout(function () {
      navShareLabel.classList.remove("show");
    }, 1500);
  }

  function togglePreviewBox() {
    var box = document.getElementById("preview-box-output");
    var target = document.getElementById("target");
    if (!box || !target) {
      return;
    }
    var hasContent = target.querySelector(".killfeed-item") !== null;
    box.style.display = hasContent ? "flex" : "none";
  }
  togglePreviewBox();

  var navToggle = document.getElementById("nav-toggle");
  var mainNav = document.querySelector(".main-nav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var open = mainNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.classList.toggle("open", open);
    });
    mainNav.addEventListener("click", function () {
      mainNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.classList.remove("open");
    });
  }

  var text = "";
  for (var j = 0; j < images.length; j++) {
    text +=
"<div id=" +
        j +
        "_" +
        images[j] +
        " class='killfeed-item'><p class='player1'>" +
        player1 +
        "</p><img class='sp_icon' alt='Weapon' src='" +
        path +
        images[j] +
        ".webp'>" +
        additionalSlotsHtml("suffix") +
        "<p class='player2'>" +
        player2 +
        "</p></div>";
  }
  document.getElementById("killfeed-generator").innerHTML = text;

  $(".toggle-switch input[type='checkbox'][location][order]").on(
    "change",
    function (evt) {
      var location = $(this).attr("location");
      var order = parseInt($(this).attr("order"), 10);
      var enabled = $(this).is(":checked");
      var name = additionals[order - 1];
      var selector =
        ".additional[data-location='" +
        location +
        "'][data-order='" +
        order +
        "']";
      var slots = document.querySelectorAll(selector);
      for (var i = 0; i < slots.length; i++) {
        slots[i].innerHTML = enabled
          ? "<img class='sp_icon' alt='" +
            name +
            "' src='" +
            path +
            name +
            ".webp'>"
          : "";
      }
    },
  );

  $("#download_img").hide();
  $("#convert_elem").hide();
  $("#convert_elem_msg").hide();

  $(".killfeed-item").click(function (evt) {
    $("#convert_elem").show();
    var id = $(this).attr("id");
    console.log("Element selected - ID: " + id);
    var preview = document.getElementById(id);
    console.log("killfeed-generator " + id + ": " + preview);
    document.getElementById("target").innerHTML =
      "<div id='target_preview' id_target=" +
      id +
      " class='killfeed-item'>" +
      preview.innerHTML +
      "</div>";
    togglePreviewBox();
  });

  $("#download1").on("change", function (evt) {
    $("#convert_elem").show();
    var id = $(this).attr("id");
    console.log("All killfeed-generator selected - ID: " + id);
    if ($(this).is(":checked")) {
      var preview = document.getElementById("killfeed-generator");
      console.log("killfeed-generator " + id + ": " + preview);
      document.getElementById("target").innerHTML =
        "<div id='target_preview' id_target=" +
        id +
        ">" +
        preview.innerHTML +
        "</div>";
      togglePreviewBox();
    }
  });

  document
    .getElementById("download_link")
    .addEventListener("click", function (evt) {
      var canvases = Array.prototype.slice.call(
        document.querySelectorAll("#killfeed-generator-output canvas"),
      );
      if (canvases.length) {
        if (document.getElementById("download1").checked) {
          canvases.forEach(downloadCanvas);
        } else {
          downloadCanvas(canvases[canvases.length - 1]);
        }
      } else {
        takeScreenShot().then(function (result) {
          var list = Array.isArray(result) ? result : [result];
          var latest = list[list.length - 1];
          if (latest) {
            downloadCanvas(latest);
          }
        });
      }
    });

  function downloadCanvas(canvas) {
    canvas.toBlob(function (blob) {
      if (blob) {
        var url = URL.createObjectURL(blob);
        var link = document.createElement("a");
        link.download = (canvas.id || "killfeed") + ".webp";
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        console.error("Could not generate image blob.");
      }
    }, "image/webp");
  }

  var itemStyleSection = document.querySelector(".item-style-tab");
  if (itemStyleSection) {
    ["input", "change"].forEach(function (eventName) {
      itemStyleSection.addEventListener(eventName, function (evt) {
        var target = evt.target;
        if (
          target &&
          target.id &&
          target.id.indexOf("item_") === 0 &&
          target.id !== "item_font_src"
        ) {
          applyItemStyle();
        }
      });
    });
  }
});
