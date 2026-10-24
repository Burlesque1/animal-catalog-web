/* ===== 图鉴交互逻辑：筛选(AND) · 搜索 · 排序 · 展开 · 统计联动 ===== */
(function () {
  "use strict";
  var data = window.ANIMALS || [];
  var state = {
    q: "", family: "", map: "", rarity: "", sort: "family",
    open: {}
  };

  var el = {
    heroStats: document.getElementById("heroStats"),
    q: document.getElementById("q"),
    fFamily: document.getElementById("fFamily"),
    fMap: document.getElementById("fMap"),
    fRarity: document.getElementById("fRarity"),
    fSort: document.getElementById("fSort"),
    btnReset: document.getElementById("btnReset"),
    summaryStrip: document.getElementById("summaryStrip"),
    familyBars: document.getElementById("familyBars"),
    mapBars: document.getElementById("mapBars"),
    mountList: document.getElementById("mountList"),
    listCount: document.getElementById("listCount"),
    animalList: document.getElementById("animalList"),
    emptyState: document.getElementById("emptyState"),
    mcQ: document.getElementById("mcQ"),
    mcCount: document.getElementById("mcCount"),
    mcGrid: document.getElementById("mcGrid"),
    tabAnimals: document.getElementById("tabAnimals"),
    tabMounts: document.getElementById("tabMounts"),
    mountCatalog: document.getElementById("mountCatalog")
  };

  /* 地图显示名与搜索别名（方便用户用俗称搜到，如 秘鲁/苏格兰/Peru/Scotland） */
  var MAP_WORDS = {
    "因蒂苏尤": ["秘鲁", "peru", "intisuyu", "因蒂苏尤"],
    "托尔南西恩": ["苏格兰", "scotland", "torr nan sithean", "托尔南西恩"]
  };
  var MAP_DISPLAY = {
    "因蒂苏尤": "因蒂苏尤（秘鲁）",
    "托尔南西恩": "托尔南西恩（苏格兰）"
  };
  function mapDisplay(m) { return MAP_DISPLAY[m] || m; }

  function unique(arr) {
    var seen = {}, out = [];
    arr.forEach(function (x) { if (!seen[x]) { seen[x] = 1; out.push(x); } });
    return out;
  }

  function familyOf(a) { return a.family; }
  function mapsOf(a) { return a.maps; }

  function allFamilies() { return unique(data.map(familyOf)).sort(); }
  function allMaps() { return unique(data.reduce(function (acc, a) { return acc.concat(mapsOf(a)); }, [])).sort(); }

  /* 每动物预建搜索文本：中文名/代码/类别/地图 + 地图俗称 */
  var hayCache = {};
  function searchHay(a) {
    if (hayCache[a.code]) return hayCache[a.code];
    var parts = [a.zh, a.code, a.family].concat(a.maps);
    a.maps.forEach(function (m) {
      if (MAP_WORDS[m]) parts = parts.concat(MAP_WORDS[m]);
    });
    hayCache[a.code] = parts.join(" ").toLowerCase();
    return hayCache[a.code];
  }

  function initSelects() {
    allFamilies().forEach(function (f) {
      var o = document.createElement("option");
      o.value = f; o.textContent = f;
      el.fFamily.appendChild(o);
    });
    allMaps().forEach(function (m) {
      var o = document.createElement("option");
      o.value = m; o.textContent = mapDisplay(m);
      el.fMap.appendChild(o);
    });
  }

  function hasGO(a) { return /传奇毛色/.test(a.note || ""); }

  function matches(a) {
    if (state.family && a.family !== state.family) return false;
    if (state.map && a.maps.indexOf(state.map) < 0) return false;
    if (state.rarity === "rare" && !a.rare.some(function (r) { return r[1] === "稀有"; })) return false;
    if (state.rarity === "veryrare" && !a.rare.some(function (r) { return r[1] === "极稀有"; })) return false;
    if (state.rarity === "go" && !hasGO(a)) return false;
    if (state.q && searchHay(a).indexOf(state.q.toLowerCase()) < 0) return false;
    return true;
  }

  function sortKey(a) {
    if (state.sort === "name") return [a.zh];
    if (state.sort === "rareCount") return [-a.rare.length, a.zh];
    return [a.family, a.zh];
  }

  function filtered() {
    return data.filter(matches).sort(function (x, y) {
      var kx = sortKey(x), ky = sortKey(y);
      for (var i = 0; i < kx.length; i++) {
        if (kx[i] < ky[i]) return -1;
        if (kx[i] > ky[i]) return 1;
      }
      return 0;
    });
  }

  /* ---- 渲染 ---- */
  function renderHeroStats() {
    var rareCount = 0, goCount = 0;
    data.forEach(function (a) {
      rareCount += a.rare.length;
      if (hasGO(a)) goCount++;
    });
    var items = [
      [data.length, "物种总数"],
      [unique(data.map(familyOf)).length, "动物类别"],
      [allMaps().length, "地图"],
      [rareCount, "稀有以上毛色条目"],
      [goCount, "有传奇毛色的物种"]
    ];
    el.heroStats.innerHTML = items.map(function (it) {
      return '<div class="stat"><b>' + it[0] + '</b><span>' + it[1] + '</span></div>';
    }).join("");
  }

  function renderSummary(list) {
    var maps = unique(list.reduce(function (acc, a) { return acc.concat(mapsOf(a)); }, []));
    var rareCount = 0, goCount = 0;
    list.forEach(function (a) {
      rareCount += a.rare.length;
      if (hasGO(a)) goCount++;
    });
    var items = [
      [list.length, "当前物种"],
      [rareCount, "稀有毛色条目"],
      [maps.length, "覆盖地图"],
      [goCount, "含传奇毛色物种"]
    ];
    el.summaryStrip.innerHTML = items.map(function (it) {
      return '<div class="summary-item"><b>' + it[0] + '</b><span>' + it[1] + '</span></div>';
    }).join("");
  }

  function renderBars(container, entries, total, active, onPick) {
    var html = entries.map(function (e) {
      var pct = total ? Math.round(e[1] / total * 100) : 0;
      var cls = e[0] === active ? "bar active" : "bar";
      return '<div class="' + cls + '" data-key="' + escAttr(e[0]) + '">' +
        '<span class="name" title="' + escAttr(mapDisplay(e[0])) + '">' + esc(mapDisplay(e[0])) + '</span>' +
        '<span class="track"><span class="fill" style="width:' + pct + '%"></span></span>' +
        '<span class="num">' + e[1] + '</span></div>';
    }).join("");
    container.innerHTML = html;
    Array.prototype.forEach.call(container.querySelectorAll(".bar"), function (b) {
      b.addEventListener("click", function () { onPick(b.getAttribute("data-key")); });
    });
  }

  function familyCounts() {
    var map = {};
    data.forEach(function (a) { map[a.family] = (map[a.family] || 0) + 1; });
    return Object.keys(map).sort().map(function (k) { return [k, map[k]]; });
  }
  function mapCounts() {
    var map = {};
    data.forEach(function (a) {
      a.maps.forEach(function (m) { map[m] = (map[m] || 0) + 1; });
    });
    return Object.keys(map).sort(function (x, y) { return map[y] - map[x] || x.localeCompare(y, "zh"); })
      .map(function (k) { return [k, map[k]]; });
  }

  function renderSide() {
    var total = data.length;
    renderBars(el.familyBars, familyCounts(), total, state.family, function (k) {
      state.family = state.family === k ? "" : k;
      el.fFamily.value = state.family;
      apply();
    });
    renderBars(el.mapBars, mapCounts(), total, state.map, function (k) {
      state.map = state.map === k ? "" : k;
      el.fMap.value = state.map;
      apply();
    });
  }

  /* 底座速查：无地图筛选时给统计与引导，选地图后列出该图物种底座 */
  function renderMountPanel(list) {
    if (!state.map) {
      var withMount = data.filter(function (a) { return a.mounts.length; });
      var goCnt = data.filter(hasGO).length;
      el.mountList.innerHTML =
        '<p class="mount-hint">' + withMount.length + ' 种动物有官方多功能底座，' + goCnt + ' 种有传奇毛色。</p>' +
        '<p class="mount-hint">在地图分布或地图下拉中选择一张地图，即可查看该图能制作的底座清单。</p>';
      return;
    }
    var onMap = list.filter(function (a) { return a.mounts.length; });
    var noMount = list.filter(function (a) { return !a.mounts.length; });
    if (!onMap.length) {
      el.mountList.innerHTML =
        '<p class="mount-hint">该图 ' + list.length + ' 种动物暂无官方多功能底座（截至 Patch 9.2）。</p>' +
        '<p class="mount-hint">其中 ' + noMount.length + ' 种为 DLC 新物种，官方尚未发布其底座。</p>';
      return;
    }
    var html = '<p class="mount-hint">' + mapDisplay(state.map) + ' · ' + onMap.length + ' 种动物可做底座：</p>' +
      '<ul class="mount-list">' + onMap.map(function (a) {
        return '<li><span class="m-zh">' + esc(a.zh) + '</span>' +
          a.mounts.map(function (m) {
            return '<span class="mount-chip">' + esc(m[0]) + (m[1] ? '<span class="size-chip">' + esc(m[1]) + "</span>" : "") + "</span>";
          }).join("") + "</li>";
      }).join("") + "</ul>";
    if (noMount.length) {
      html += '<p class="mount-hint">另有 ' + noMount.length + ' 种暂无底座：' + esc(noMount.map(function (a) { return a.zh; }).join("、")) + "。</p>";
    }
    el.mountList.innerHTML = html;
  }

  /* 全部底座总览：按 底座名+尺寸 聚合支持物种 */
  var mountCatalogData = null;
  function buildMountCatalog() {
    var map = {};
    data.forEach(function (a) {
      a.mounts.forEach(function (m) {
        var key = m[0] + "||" + m[1];
        if (!map[key]) map[key] = { name: m[0], size: m[1], species: [] };
        map[key].species.push({ zh: a.zh, code: a.code });
      });
    });
    return Object.keys(map).map(function (k) { return map[k]; })
      .sort(function (x, y) { return y.species.length - x.species.length || x.name.localeCompare(y.name, "zh"); });
  }

  function renderMountCatalog() {
    if (!mountCatalogData) mountCatalogData = buildMountCatalog();
    var q = (el.mcQ.value || "").trim().toLowerCase();
    var list = q ? mountCatalogData.filter(function (m) { return (m.name + " " + m.size).toLowerCase().indexOf(q) >= 0; }) : mountCatalogData;
    var spTotal = list.reduce(function (n, m) { return n + m.species.length; }, 0);
    el.mcCount.textContent = "(" + list.length + " 个底座 · " + spTotal + " 种支持)";
    el.mcGrid.innerHTML = list.map(function (m) {
      var sp = m.species.map(function (s) {
        return '<button type="button" class="mc-chip" data-code="' + escAttr(s.code) + '">' + esc(s.zh) + "</button>";
      }).join("");
      return '<div class="mc-card">' +
        '<div class="mc-name">' + esc(m.name) + (m.size ? '<span class="size-chip">' + esc(m.size) + "</span>" : "") + "</div>" +
        '<div class="mc-species">' + sp + "</div>" +
        "</div>";
    }).join("");
    Array.prototype.forEach.call(el.mcGrid.querySelectorAll(".mc-chip"), function (btn) {
      btn.addEventListener("click", function () {
        var code = btn.getAttribute("data-code");
        var a = data.find(function (x) { return x.code === code; });
        if (a) {
          state.q = a.zh;
          el.q.value = a.zh;
          setView("animals");
          apply();
        }
      });
    });
  }

  var ICONS = {
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-5.1-7-11a7 7 0 1 1 14 0c0 5.9-7 11-7 11z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="10" r="2.6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    mount: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V9l8-5 8 5v11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 20v-6h6v6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    caret: '<svg viewBox="0 0 24 24" class="caret" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function escAttr(s) {
    return esc(s).replace(/"/g, "&quot;");
  }

  function renderList(list) {
    el.listCount.textContent = "(" + list.length + ")";
    if (!list.length) {
      el.animalList.innerHTML = "";
      el.emptyState.hidden = false;
      return;
    }
    el.emptyState.hidden = true;
    var html = list.map(function (a) {
      var open = state.open[a.code] ? " open" : "";
      var dots = a.rare.map(function (r) {
        return '<i class="dot ' + (r[1] === "极稀有" ? "dot-veryrare" : "dot-rare") + '" title="' + esc(r[0]) + " · " + esc(r[1]) + '"></i>';
      }).join("");
      if (hasGO(a)) dots += '<i class="dot dot-go" title="有传奇毛色"></i>';
      var mountChips = a.mounts.map(function (m) {
        return '<span class="mount-chip">' + esc(m[0]) + (m[1] ? '<span class="size-chip">' + esc(m[1]) + "</span>" : "") + "</span>";
      }).join("");
      var detailMount = mountChips || '<span style="color:rgba(30,43,36,0.45);font-size:12px">官方暂无该物种多功能底座（截至 Patch 9.2）</span>';
      var rareLis = a.rare.map(function (r) {
        return '<li>' + '<span class="grade grade-' + (r[1] === "极稀有" ? "vr" : "r") + '">' + esc(r[1]) + "</span>" + esc(r[0]) + "</li>";
      }).join("");
      var mapLis = a.maps.map(function (m) {
        return '<li>' + ICONS.pin + esc(mapDisplay(m)) + "</li>";
      }).join("");
      /* 行内底座摘要：有底座显示首个名字，多个加 +N；无底座标“暂无底座” */
      var rowMount;
      if (a.mounts.length) {
        rowMount = '<span class="chip chip-mount" title="' + escAttr(a.mounts.map(function (m) { return m[0] + (m[1] ? "(" + m[1] + ")" : ""); }).join("、")) + '">' +
          ICONS.mount + esc(a.mounts[0][0]) + (a.mounts.length > 1 ? " +" + a.mounts.length : "") + "</span>";
      } else {
        rowMount = '<span class="chip chip-none">暂无底座</span>';
      }
      return '<div class="animal-card' + open + '" data-code="' + escAttr(a.code) + '">' +
        '<div class="animal-row">' +
          '<span class="fam-tag">' + esc(a.family) + "</span>" +
          '<span class="main"><span class="zh">' + esc(a.zh) + (hasGO(a) ? '<span class="go-mark">GO</span>' : "") + "</span>" +
          '<span class="code">' + esc(a.code) + "</span></span>" +
          '<span class="meta">' +
            '<span class="chip">' + esc(a.maps.length) + " 图</span>" +
            rowMount +
            '<span class="dots">' + dots + "</span>" +
            ICONS.caret +
          "</span>" +
        "</div>" +
        '<div class="detail">' +
          '<div class="detail-grid">' +
            "<div><h3>稀有以上毛色 · " + a.rare.length + "</h3><ul>" + rareLis + "</ul></div>" +
            "<div><h3>出现地图</h3><ul>" + mapLis + "</ul></div>" +
            "<div><h3>Matt 底座蓝图</h3>" + detailMount + "</div>" +
          "</div>" +
          (a.note ? '<p class="note">' + esc(a.note) + "</p>" : "") +
        "</div>" +
      "</div>";
    }).join("");
    el.animalList.innerHTML = html;

    Array.prototype.forEach.call(el.animalList.querySelectorAll(".animal-row"), function (row) {
      row.addEventListener("click", function () {
        var card = row.parentElement;
        var code = card.getAttribute("data-code");
        state.open[code] = !state.open[code];
        renderList(filtered());
      });
    });
  }

  /* ---- 状态与联动 ---- */
  function apply() {
    var list = filtered();
    renderSummary(list);
    renderSide();
    renderMountPanel(list);
    renderList(list);
  }

  /* ---- 视图切换（动物图鉴 / 底座总览） ---- */
  function setView(v) {
    var showAnimals = v === "animals";
    Array.prototype.forEach.call(document.querySelectorAll(".view-animals"), function (n) {
      n.classList.toggle("hide", !showAnimals);
    });
    el.mountCatalog.hidden = showAnimals;
    el.tabAnimals.classList.toggle("active", showAnimals);
    el.tabMounts.classList.toggle("active", !showAnimals);
  }

  function bind() {
    el.q.addEventListener("input", function () { state.q = el.q.value.trim(); apply(); });
    el.fFamily.addEventListener("change", function () { state.family = el.fFamily.value; apply(); });
    el.fMap.addEventListener("change", function () { state.map = el.fMap.value; apply(); });
    el.fRarity.addEventListener("change", function () { state.rarity = el.fRarity.value; apply(); });
    el.fSort.addEventListener("change", function () { state.sort = el.fSort.value; apply(); });
    el.btnReset.addEventListener("click", function () {
      state = { q: "", family: "", map: "", rarity: "", sort: "family", open: {} };
      el.q.value = ""; el.fFamily.value = ""; el.fMap.value = ""; el.fRarity.value = ""; el.fSort.value = "family";
      apply();
    });
    el.mcQ.addEventListener("input", function () { renderMountCatalog(); });
    el.tabAnimals.addEventListener("click", function () { setView("animals"); });
    el.tabMounts.addEventListener("click", function () { setView("mounts"); });
  }

  initSelects();
  renderHeroStats();
  bind();
  setView("animals");
  apply();
  renderMountCatalog();
})();
