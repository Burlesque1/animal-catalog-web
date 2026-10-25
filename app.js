/* ===== 图鉴交互逻辑：筛选(AND) · 搜索 · 排序 · 展开 · 统计联动 · 中英双语（默认英文） ===== */
(function () {
  "use strict";
  var data = window.ANIMALS || [];
  var LANG = "en";
  var game = window.GAME_FILTERS || {groups:{},animals:{}};
  var GROUP_ORDER = ["birds","mammals","reptiles","other"];
  function infoOf(a){return game.animals[a.code] || {group:null,animalClass:null,classStatus:"unverified",sources:[]};}
  function groupOf(a){return infoOf(a).group;}
  function classOf(a){return infoOf(a).animalClass;}
  function classText(a){return classOf(a)==null?T("classUnknown"):(LANG==="en"?"Class "+classOf(a):classOf(a)+" 级");}

  // GO 视角备注双语: 已知结构化短语译双语; 未知原文保留不丢信息
  function viewsLabel(v){
    if(!v) return "";
    if(v.indexOf("侧面视角")>=0) return LANG==="en" ? "Left/Right side views; pattern not yet confirmed" : "左/右侧面视图；花纹差异尚未确认";
    return v;
  }

  /* ---- 双语字典 ---- */
  var I18N = {
    heroTitle: { en: "Rare Fur & Mount Catalog", zh: "全物种稀有毛色图鉴" },
    heroSub: { en: "127 species · rare furs · reserves · Matt mount blueprints — every hunt worth taking, at a glance", zh: "127 种动物 · 稀有毛色 · 地图分布 · Matt 底座蓝图 —— 一站查清值得打的每一只" },
    lgRare: { en: "Rare fur (0.1%–1%)", zh: "稀有毛色（0.1%–1%）" },
    lgVeryrare: { en: "Very rare fur (<0.1%)", zh: "极稀有毛色（<0.1%）" },
    lgGo: { en: "Has Great One fur", zh: "有 Great One 传奇毛色" },
    lgGoShort: { en: "GO", zh: "传奇" },
    tabAnimals: { en: "Species", zh: "动物图鉴" },
    tabMounts: { en: "Mounts", zh: "底座总览" },
    lblFamily: { en: "Animal type", zh: "动物类别" },
    lblMap: { en: "Reserve", zh: "地图" },
    lblRarity: { en: "Rarity", zh: "稀有度" },
    lblSort: { en: "Sort", zh: "排序" },
    optRareAll: { en: "All rare & above", zh: "全部稀有以上" },
    optAll: { en: "All", zh: "全部" },
    optRare: { en: "Rare only", zh: "仅含稀有" },
    optVeryrare: { en: "Very rare only", zh: "仅含极稀有" },
    optGo: { en: "GO-supported (incl. community)", zh: "有证据支持 GO（含社区）" },
    optGoOfficial: { en: "Official-source GO", zh: "官方来源确认 GO" },
    optSortFamily: { en: "Type · Name", zh: "类别 · 名称" },
    optSortName: { en: "Name", zh: "名称" },
    optSortCount: { en: "Rare count", zh: "稀有毛色数" },
    btnReset: { en: "Reset", zh: "重置" },
    phSearch: { en: "Search species or code, e.g. blue_sheep", zh: "搜索动物名称或代码，如 蓝羊 / blue_sheep" },
    ptFamilies: { en: "Animal types", zh: "动物类别" },
    ptMaps: { en: "Reserves", zh: "地图分布" },
    ptMounts: { en: "Matt Mount Quick Look", zh: "Matt 底座速查" },
    lblAnimals: { en: "Animals", zh: "动物" },
    listHint: { en: "Click a row to expand furs / maps / mounts", zh: "点击行展开毛色 / 地图 / 底座详情" },
    empty1: { en: "No species match the filters.", zh: "没有符合条件的物种。" },
    empty2: { en: "Try loosening animal type, class, reserve or rarity filters.", zh: "试试放宽动物类别、等级、地图或稀有度筛选。" },
    ptMountCatalog: { en: "All Matt Mount Blueprints", zh: "Matt 底座总览" },
    phMounts: { en: "Search mount name, e.g. Duck Out", zh: "搜索底座名，如 Duck Out" },
    mcHint: { en: "Aggregated by mount — every blueprint and its supported species; click a species to jump back to the catalog.", zh: "按底座聚合，展示每个多功能底座支持的动物；点击动物标签可跳转到动物图鉴并定位该物种。" },
    stSpecies: { en: "Species", zh: "物种总数" },
    stFamilies: { en: "Animal types", zh: "动物类别" },
    stMaps: { en: "Reserves", zh: "地图" },
    stRareEntries: { en: "Rare fur entries", zh: "稀有以上毛色条目" },
    stGOSpecies: { en: "Species w/ Great One", zh: "有传奇毛色的物种" },
    sumCurrent: { en: "Current species", zh: "当前物种" },
    sumRare: { en: "Rare entries", zh: "稀有毛色条目" },
    sumMaps: { en: "Reserves", zh: "覆盖地图" },
    sumGO: { en: "With Great One", zh: "含传奇毛色物种" },
    mHintNoMap1: { en: "species have official multi-mounts;", zh: "种动物有官方多功能底座，" },
    mHintNoMap2: { en: "species have a Great One fur.", zh: "种有传奇毛色。" },
    mHintNoMap3: { en: "Pick a reserve (sidebar or dropdown) to see its mount list.", zh: "在地图分布或地图下拉中选择一张地图，即可查看该图能制作的底座清单。" },
    mHintEmpty1: { en: "No official multi-mounts on this reserve (as of Patch 9.2).", zh: "该图暂无官方多功能底座（截至 Patch 9.2）。" },
    mHintEmpty2: { en: "of them are DLC newcomers whose mounts are not released yet.", zh: "种为 DLC 新物种，官方尚未发布其底座。" },
    mHintList1: { en: "species with mounts:", zh: "种动物可做底座：" },
    mNoMountMore: { en: "Plus", zh: "另有" },
    mNoMountNo: { en: "species without mounts:", zh: "种暂无底座：" },
    dRareFurs: { en: "Rare+ Furs", zh: "稀有以上毛色" },
    dGoFurs: { en: "Great One Furs", zh: "传奇(GO)毛色" },
    dReserves: { en: "Reserves", zh: "出现地图" },
    dMounts: { en: "Matt Mount Blueprints", zh: "Matt 底座蓝图" },
    noMountDetail: { en: "No official multi-mount for this species (as of Patch 9.2)", zh: "官方暂无该物种多功能底座（截至 Patch 9.2）" },
    noMountRow: { en: "No mounts", zh: "暂无底座" },
    mapsSuffix: { en: "maps", zh: "图" },
    mcCountTpl: { en: "mounts ·", zh: "个底座 ·" },
    mcCountSp: { en: "species", zh: "种支持" },
    lblClass:{en:"Animal Class",zh:"动物等级"},classUnknown:{en:"Class unverified",zh:"等级待核实"},classConflict:{en:"Class sources disagree; unverified",zh:"等级来源冲突，待核实"},filterHelp:{en:"Independent filters; selections combine with AND. Animal Class is not difficulty or a medal.",zh:"各项可独立筛选，同时选择取交集；动物等级不是难度或奖牌。"},noGroup:{en:"No species in the current catalog",zh:"当前图鉴暂无该类物种"},classSources:{en:"Class sources",zh:"等级来源"},
    footClasses: {en:"Animal types follow the four Trophy Manager groups. Animal Class uses public references (The Wild Register / TacMaps and CoTW Guide), not difficulty or medals; unresolved entries stay unverified.",zh:"动物类别对齐战利品管理器四大类。动物等级来自 The Wild Register / TacMaps、CoTW Guide 公共参考，不是难度或奖牌；缺少依据及冲突条目保留待核实。"},
    footSrc: { en: "Sources: gameslikefinder Rare Fur Types List (2026-06-24, 20 reserves) · thewildregister.com / TacMaps (vicuña) · Matt mount blueprints from thehuntercotw.wordpress.com (2025-07-06).", zh: "数据源：gameslikefinder《Rare Fur Types List》（2026-06-24，20 张地图）· thewildregister.com / TacMaps（骆马）· Matt 底座蓝图来自 thehuntercotw.wordpress.com（2025-07-06）。" },
    footNote: { en: "Blue sheep & Bengal tiger rarities corrected against live in-game variant data (read 2026-10-24); live data wins over third-party articles. Available online via GitHub Pages; the local copy can also be opened through index.html with its accompanying files.", zh: "蓝羊、孟加拉虎稀有度已按实机变体数组（2026-10-24 游戏运行中读取）修正，与第三方文章有出入处以实机为准。已通过 GitHub Pages 在线发布；本地副本保留配套文件后，也可双击 index.html 打开。" }
  };

  var EN_FAMILY = {
    "兔形目": "Lagomorphs", "其他": "Others", "啮齿类": "Rodents", "浣熊科": "Procyonids",
    "熊科": "Bears", "爬行类": "Reptiles", "牛科": "Bovids", "犬科": "Canids",
    "猪科": "Suids", "猫科": "Felids", "袋鼠科": "Kangaroos", "雉鸡类": "Galliforms",
    "鸭雁类": "Waterfowl", "鹿科": "Cervids", "鼬科": "Mustelids", "鼬科/獾": "Mustelids & Badgers"
  };

  var EN_MAP = {
    "莱顿湖": "Layton Lake", "银岭峰": "Silver Ridge Peaks", "赫希费尔登": "Hirschfelden",
    "梅德韦泰嘉": "Medved-Taiga", "乌尔霍加热带稀树草原": "Vurhonga Savanna", "费南多自然公园": "Parque Fernando",
    "育空河谷": "Yukon Valley", "夸特罗·科利纳斯野生动物保护区": "Cuatro Colinas", "密西西比阿克里斯保护区": "Mississippi Acres Preserve",
    "新英格兰山脉": "New England Mountains", "阿罗约牧场": "Rancho del Arroyo", "蒂阿拉罗瓦国家公园": "Te Awaroa National Park",
    "雷文图里海岸": "Revontuli Coast", "翡翠海岸": "Emerald Coast", "桑达帕坦": "Sundarpatan",
    "萨尔茨维森公园": "Salzwiesen Park", "阿尔伯塔狩猎保护区": "Askiy Ridge", "托尔南西恩": "Torr nan Sithean",
    "因蒂苏尤": "Intisuyu"
  };
  var EN_MAP_SUFFIX = { "因蒂苏尤": " (Peru)", "托尔南西恩": " (Scotland)" };

  var EN_FUR = {
    "白化": "Albino", "黑化": "Melanistic", "白变": "Leucistic", "斑驳": "Piebald",
    "换毛": "Molt", "白": "White", "浅灰": "Light Grey", "深灰": "Dark Grey", "灰斑驳": "Grey Piebald",
    "金发斑驳": "Blonde Piebald", "金发": "Blonde", "深棕": "Dark Brown", "红变": "Red",
    "淡色": "Light", "稀释银": "Diluted Silver", "无纹": "Unpatterned", "金面": "Blond Faced",
    "米黄": "Light Brown", "深色": "Dark", "金": "Blond", "浅棕": "Light Brown",
    "红": "Red", "深红": "Dark Red", "黑": "Black", "暗色": "Dark", "红棕": "Reddish Brown",
    "橙色": "Orange", "橙": "Orange", "棕": "Brown", "肉桂": "Cinnamon", "皇冠纹": "Crowned",
    "混合": "Mixed", "赭色": "Ochre", "蓝": "Blue", "白无纹": "White Stripeless",
    "伪黑变白": "Pseudo-Melanistic White", "伪黑变": "Pseudo-Melanistic", "灰": "Grey",
    "稀释": "Diluted", "奶油": "Cream", "蚀羽": "Eclipse", "红变金": "Red-Gold",
    "绿杂交": "Green Hybrid", "蓝杂交": "Blue Hybrid", "杂交": "Hybrid", "蓝型": "Blue Phase",
    "中间型": "Intermediate", "红斑点": "Red-Spotted", "红巧克力": "Red Chocolate",
    "茶褐": "Tawny", "银": "Silver", "黑金": "Black-Gold", "蛋白白": "Egg White",
    "冬": "Winter", "纯净": "Clean", "橄榄": "Olive", "烟灰": "Smoky", "沙色": "Sandy",
    "粉红": "Pink", "棕杂交": "Brown Hybrid", "浅灰白变": "Light Grey Leucistic",
    "白杂交": "White Hybrid", "红棕": "Reddish Brown", "稀银": "Diluted Silver"
  };

  // 物种级毛色英文覆盖：同一中文毛色名在不同物种英文不同，优先于全局 EN_FUR。
  // 依据：thewildregister / cotwhub 物种页、nexusmods 物种毛色表、官方 Patch 8.4/9.0。
  var SPECIES_FUR_EN = {
    "south_american_tapir": { "红变": "Erythristic" },
    "spectacled_bear": { "红变": "Erythristic Red" },
    "gemsbok": { "米黄": "Beige", "金": "Gold" },
    "wild_yak": { "金": "Gold" },
    "bengal_tiger": { "金": "Gold" },
    "willow_ptarmigan": { "红": "Erythristic" }
  };

  var EN_SPECIES = {
    "eastern_cottontail_rabbit": "Eastern Cottontail Rabbit", "mountain_hare": "Mountain Hare",
    "european_hare": "European Hare", "european_rabbit": "European Rabbit", "scrub_hare": "Scrub Hare",
    "white_tailed_jackrabbit": "White-tailed Jackrabbit", "woolly_hare": "Woolly Hare",
    "antelope_jackrabbit": "Antelope Jackrabbit", "south_american_tapir": "South American Tapir",
    "lion": "Lion", "vicuna": "Vicuña", "north_american_beaver": "North American Beaver",
    "capybara": "Capybara", "common_raccoon": "Raccoon", "western_mountain_coati": "Western Mountain Coati",
    "brown_bear": "Brown Bear", "grizzly_bear": "Grizzly Bear", "spectacled_bear": "Spectacled Bear",
    "black_bear": "Black Bear", "saltwater_crocodile": "Saltwater Crocodile",
    "american_alligator": "American Alligator", "black_caiman": "Black Caiman",
    "se_spain_ibex": "Southeastern Spanish Ibex", "iberian_mouflon": "Iberian Mouflon",
    "gemsbok": "Gemsbok", "tahr": "Tahr", "bighorn_sheep": "Bighorn Sheep",
    "lesser_kudu": "Lesser Kudu", "chamois": "Chamois", "plains_bison": "Plains Bison",
    "wood_bison": "Wood Bison", "gredos_ibex": "Gredos Ibex", "european_bison": "European Bison",
    "water_buffalo": "Water Buffalo", "banteng": "Banteng", "mountain_goat": "Mountain Goat",
    "nilgai": "Nilgai", "blue_sheep": "Blue Sheep", "blue_wildebeest": "Blue Wildebeest",
    "beceite_ibex": "Beceite Ibex", "springbok": "Springbok", "feral_goat": "Feral Goat",
    "wild_yak": "Wild Yak", "cape_buffalo": "Cape Buffalo", "blackbuck": "Blackbuck",
    "ronda_ibex": "Ronda Ibex", "iberian_wolf": "Iberian Wolf", "sidestriped_jackal": "Side-striped Jackal",
    "grey_fox": "Grey Fox", "gray_wolf": "Gray Wolf", "tibetan_fox": "Tibetan Fox",
    "raccoon_dog": "Raccoon Dog", "red_fox": "Red Fox", "coyote": "Coyote",
    "wild_boar": "Wild Boar", "warthog": "Warthog", "wild_hog": "Wild Hog",
    "feral_pig": "Feral Pig", "collared_peccary": "Collared Peccary",
    "mexican_bobcat": "Mexican Bobcat", "bengal_tiger": "Bengal Tiger", "bobcat": "Bobcat",
    "eurasian_lynx": "Eurasian Lynx", "puma": "Puma", "jaguar": "Jaguar", "ocelot": "Ocelot",
    "snow_leopard": "Snow Leopard", "eastern_grey_kangaroo": "Eastern Grey Kangaroo",
    "eastern_wild_turkey": "Eastern Wild Turkey", "bobwhite_quail": "Bobwhite Quail",
    "rock_ptarmigan": "Rock Ptarmigan", "dusky_grouse": "Dusky Grouse",
    "willow_ptarmigan": "Willow Ptarmigan", "merriam_turkey": "Merriam's Turkey",
    "himalayan_monal": "Himalayan Monal", "hazel_grouse": "Hazel Grouse", "wild_turkey": "Wild Turkey",
    "ring_necked_pheasant": "Ring-necked Pheasant", "stubble_quail": "Stubble Quail",
    "red_grouse": "Red Grouse", "western_capercaillie": "Western Capercaillie",
    "rio_grande_turkey": "Rio Grande Turkey", "black_grouse": "Black Grouse",
    "harlequin_duck": "Harlequin Duck", "eurasian_woodcock": "Eurasian Woodcock",
    "tundra_bean_goose": "Tundra Bean Goose", "tufted_duck": "Tufted Duck",
    "canada_goose": "Canada Goose", "wood_duck": "Wood Duck", "cinnamon_teal": "Cinnamon Teal",
    "eurasian_teal": "Eurasian Teal", "greylag_goose": "Greylag Goose", "mallard": "Mallard",
    "green_winged_teal": "Green-winged Teal", "ferruginous_duck": "Ferruginous Duck",
    "gadwall": "Gadwall", "eurasian_wigeon": "Eurasian Wigeon", "goldeneye": "Common Goldeneye",
    "northern_pintail": "Northern Pintail", "snow_goose": "Snow Goose", "magpie_goose": "Magpie Goose",
    "taruca": "Taruca", "caribou": "Grant Caribou", "woodland_caribou": "Woodland Caribou",
    "sika_deer": "Sika Deer", "sambar_deer": "Sambar Deer", "barasingha": "Barasingha",
    "javan_rusa": "Javan Rusa", "roe_deer": "Roe Deer", "whitetail_deer": "Whitetail Deer",
    "roosevelt_elk": "Roosevelt Elk", "axis_deer": "Axis Deer", "rocky_mountain_elk": "Rocky Mountain Elk",
    "siberian_musk_deer": "Siberian Musk Deer", "hog_deer": "Hog Deer",
    "northern_red_muntjac": "Northern Red Muntjac", "manitoban_elk": "Manitoban Elk",
    "red_deer": "Red Deer", "reindeer": "Mountain Reindeer", "moose": "Moose", "mule_deer": "Mule Deer",
    "fallow_deer": "Fallow Deer", "blacktail_deer": "Blacktail Deer", "greater_grison": "Greater Grison",
    "eurasian_pine_marten": "Eurasian Pine Marten", "american_mink": "American Mink",
    "european_badger": "European Badger"
  };

  var EN_GRADE = { "稀有": "Rare", "极稀有": "Very Rare", "传奇": "Great One" };

  function T(k) {
    var e = I18N[k];
    return e ? (e[LANG] != null ? e[LANG] : e.zh) : k;
  }
  function nameOf(a) { return LANG === "en" ? (EN_SPECIES[a.code] || a.code) : a.zh; }
  function familyOf(a) { var g=game.groups[groupOf(a)];return g?g[LANG]:T("noGroup"); }
  function groupLabel(key){var g=game.groups[key];return g?g[LANG]:key;}
  function mapBase(m) { return LANG === "en" ? (EN_MAP[m] || m) : m; }
  function mapDisplay(m) {
    if (LANG === "en") return mapBase(m) + (EN_MAP_SUFFIX[m] || "");
    return MAP_DISPLAY[m] || m;
  }
  function furName(a, f) {
    if (LANG !== "en") return f;
    var sp = SPECIES_FUR_EN[a.code];
    if (sp && sp[f]) return sp[f];
    return EN_FUR[f] || f;
  }
  function gradeName(g) { return LANG === "en" ? (EN_GRADE[g] || g) : g; }

  var MAP_WORDS = {
    "因蒂苏尤": ["秘鲁", "peru", "intisuyu", "因蒂苏尤"],
    "托尔南西恩": ["苏格兰", "scotland", "torr nan sithean", "托尔南西恩"]
  };
  var MAP_DISPLAY = {
    "因蒂苏尤": "因蒂苏尤（秘鲁）",
    "托尔南西恩": "托尔南西恩（苏格兰）"
  };

  var state = {
    q: "", family: "", map: "", rarity: "", animalClass:"", sort: "family",
    open: {}
  };

  var el = {
    heroStats: document.getElementById("heroStats"),
    q: document.getElementById("q"),
    fFamily: document.getElementById("fFamily"),
    fMap: document.getElementById("fMap"),
    fClass: document.getElementById("fClass"),
    fRarity: document.getElementById("fRarity"),
    fSort: document.getElementById("fSort"),
    btnReset: document.getElementById("btnReset"),
    btnLang: document.getElementById("btnLang"),
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

  function unique(arr) {
    var seen = {}, out = [];
    arr.forEach(function (x) { if (!seen[x]) { seen[x] = 1; out.push(x); } });
    return out;
  }

  function mapsOf(a) { return a.maps; }

  // Hide catalog-wide empty categories; other filters do not make categories disappear.
  function allFamilies() { return GROUP_ORDER.filter(function (k) { return data.some(function (a) { return groupOf(a) === k; }); }); }
  function allMaps() { return unique(data.reduce(function (acc, a) { return acc.concat(mapsOf(a)); }, [])).sort(); }

  /* 每动物预建搜索文本：中/英文名、代码、类别、地图 + 地图俗称 */
  var hayCache = {};
  function searchHay(a) {
    if (hayCache[a.code] && hayCache[a.code].l === LANG) return hayCache[a.code].s;
    var parts = [a.zh, (EN_SPECIES[a.code] || ""), a.code, familyOf(a), a.family, (EN_FAMILY[a.family] || "")].concat(a.maps);
    a.maps.forEach(function (m) {
      if (EN_MAP[m]) parts.push(EN_MAP[m]);
      if (MAP_WORDS[m]) parts = parts.concat(MAP_WORDS[m]);
    });
    a.rare.forEach(function (r) {
      parts.push(r[0]);
      var spFur = SPECIES_FUR_EN[a.code];
      if (spFur && spFur[r[0]]) parts.push(spFur[r[0]]);
      else if (EN_FUR[r[0]]) parts.push(EN_FUR[r[0]]);
    });
    (a.go || []).forEach(function (g) {
      parts.push(g.en);
      if (g.z) parts.push(g.z);
    });
    var HISTORY_ALIAS = {
      wild_boar: ["Fabled Stripple"],
      gray_wolf: ["Fabled Battlethorne"],
      moose: ["Fabled Two Tones"],
      red_fox: ["Fabled Candycane"]
    };
    if (HISTORY_ALIAS[a.code]) parts = parts.concat(HISTORY_ALIAS[a.code]);
    hayCache[a.code] = { l: LANG, s: parts.join(" ").toLowerCase() };
    return hayCache[a.code].s;
  }

  function rebuildSelects() {
    el.fFamily.innerHTML = '<option value="">' + esc(T("optAll")) + '</option>';
    allFamilies().forEach(function (f) {
      var o = document.createElement("option");
      o.value = f; o.textContent = groupLabel(f);
      el.fFamily.appendChild(o);
    });
    el.fMap.innerHTML = '<option value="">' + esc(T("optAll")) + '</option>';
    allMaps().forEach(function (m) {
      var o = document.createElement("option");
      o.value = m; o.textContent = mapDisplay(m);
      el.fMap.appendChild(o);
    });
    el.fClass.innerHTML = '<option value="">'+esc(T("optAll"))+'</option>'+Array.from({length:9},function(_,i){return '<option value="'+(i+1)+'">'+(LANG==="en"?"Class "+(i+1):(i+1)+" 级")+'</option>';}).join("")+'<option value="unknown">'+esc(T("classUnknown"))+'</option>';el.fClass.value=state.animalClass;
    el.fFamily.value = state.family;
    el.fMap.value = state.map;
  }

  function hasGO(a) { return (a.go && a.go.length > 0) || /传奇毛色/.test(a.note || ""); }
  // 官方来源确认 GO（存在级官方证据；社区/存疑/待核不计入）
  var OFFICIAL_GO = { black_bear:1, jaguar:1, moose:1, mule_deer:1, roe_deer:1, tahr:1, whitetail_deer:1, wild_boar:1 };
  function hasOfficialGO(a){ return !!OFFICIAL_GO[a.code]; }

  function matches(a) {
    if (state.family && groupOf(a) !== state.family) return false;
    if(state.animalClass && (state.animalClass==="unknown"?classOf(a)!=null:String(classOf(a))!==state.animalClass))return false;
    if (state.map && a.maps.indexOf(state.map) < 0) return false;
    if (state.rarity === "rare" && !a.rare.some(function (r) { return r[1] === "稀有"; })) return false;
    if (state.rarity === "veryrare" && !a.rare.some(function (r) { return r[1] === "极稀有"; })) return false;
    if (state.rarity === "go" && !hasGO(a)) return false;
    if (state.rarity === "go_official" && !hasOfficialGO(a)) return false;
    if (state.q && searchHay(a).indexOf(state.q.toLowerCase()) < 0) return false;
    return true;
  }

  function sortKey(a) {
    var nm = nameOf(a);
    if (state.sort === "name") return [nm];
    if (state.sort === "rareCount") return [-a.rare.length, nm];
    return [GROUP_ORDER.indexOf(groupOf(a)), nm];
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
      [data.length, T("stSpecies")],
      [allFamilies().length, T("stFamilies")],
      [allMaps().length, T("stMaps")],
      [rareCount, T("stRareEntries")],
      [goCount, T("stGOSpecies")]
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
      [list.length, T("sumCurrent")],
      [rareCount, T("sumRare")],
      [maps.length, T("sumMaps")],
      [goCount, T("sumGO")]
    ];
    el.summaryStrip.innerHTML = items.map(function (it) {
      return '<div class="summary-item"><b>' + it[0] + '</b><span>' + it[1] + '</span></div>';
    }).join("");
  }

  function renderBars(container, entries, total, active, onPick, labelFn) {
    var html = entries.map(function (e) {
      var pct = total ? Math.round(e[1] / total * 100) : 0;
      var cls = e[0] === active ? "bar active" : "bar";
      var label = labelFn(e[0]);
      return '<div class="' + cls + '" role="button" tabindex="0" aria-pressed="'+(e[0]===active?'true':'false')+'" data-key="' + escAttr(e[0]) + '">' +
        '<span class="name" title="' + escAttr(label) + '">' + esc(label) + '</span>' +
        '<span class="track"><span class="fill" style="width:' + pct + '%"></span></span>' +
        '<span class="num">' + e[1] + '</span></div>';
    }).join("");
    container.innerHTML = html;
    Array.prototype.forEach.call(container.querySelectorAll(".bar"), function (b) {
      b.addEventListener("click", function () { onPick(b.getAttribute("data-key")); });
      b.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();onPick(b.getAttribute("data-key"));}});
    });
  }

  function familyCounts() {
    var map = {};
    data.forEach(function (a) { var k=groupOf(a);map[k] = (map[k] || 0) + 1; });
    return allFamilies().map(function (k) { return [k, map[k] || 0]; });
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
    }, groupLabel);
    renderBars(el.mapBars, mapCounts(), total, state.map, function (k) {
      state.map = state.map === k ? "" : k;
      el.fMap.value = state.map;
      apply();
    }, mapDisplay);
  }

  /* 底座速查：无地图筛选时给统计与引导，选地图后列出该图物种底座 */
  function renderMountPanel(list) {
    if (!state.map) {
      var withMount = data.filter(function (a) { return a.mounts.length; });
      var goCnt = data.filter(hasGO).length;
      el.mountList.innerHTML =
        '<p class="mount-hint">' + withMount.length + ' ' + T("mHintNoMap1") + ' ' + goCnt + ' ' + T("mHintNoMap2") + '</p>' +
        '<p class="mount-hint">' + T("mHintNoMap3") + '</p>';
      return;
    }
    var onMap = list.filter(function (a) { return a.mounts.length; });
    var noMount = list.filter(function (a) { return !a.mounts.length; });
    if (!onMap.length) {
      el.mountList.textContent = LANG==="en"?"No mount blueprints among the current filtered species.":"当前筛选结果中没有关联底座的物种。";
      return;
    }
    var html = '<p class="mount-hint">' + mapDisplay(state.map) + ' · ' + onMap.length + ' ' + T("mHintList1") + '</p>' +
      '<ul class="mount-list">' + onMap.map(function (a) {
        return '<li><span class="m-zh">' + esc(nameOf(a)) + '</span>' +
          a.mounts.map(function (m) {
            return '<span class="mount-chip">' + esc(m[0]) + (m[1] ? '<span class="size-chip">' + esc(m[1]) + "</span>" : "") + "</span>";
          }).join("") + "</li>";
      }).join("") + "</ul>";
    if (noMount.length) {
      html += '<p class="mount-hint">' + T("mNoMountMore") + ' ' + noMount.length + ' ' + T("mNoMountNo") + ' ' +
        esc(noMount.map(function (a) { return nameOf(a); }).join(LANG === "en" ? ", " : "、")) + ".</p>";
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
      .sort(function (x, y) { return y.species.length - x.species.length || x.name.localeCompare(y.name, "en"); });
  }

  function renderMountCatalog() {
    if (!mountCatalogData) mountCatalogData = buildMountCatalog();
    var q = (el.mcQ.value || "").trim().toLowerCase();
    var list = q ? mountCatalogData.filter(function (m) { return (m.name + " " + m.size).toLowerCase().indexOf(q) >= 0; }) : mountCatalogData;
    var spTotal = list.reduce(function (n, m) { return n + m.species.length; }, 0);
    el.mcCount.textContent = "(" + list.length + " " + T("mcCountTpl") + " " + spTotal + " " + T("mcCountSp") + ")";
    el.mcGrid.innerHTML = list.map(function (m) {
      var sp = m.species.map(function (s) {
        return '<button type="button" class="mc-chip" data-code="' + escAttr(s.code) + '">' + esc(LANG === "en" ? (EN_SPECIES[s.code] || s.code) : s.zh) + "</button>";
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
          state.q = a.zh;state.family="";state.map="";state.rarity="";state.animalClass="";el.fFamily.value="";el.fMap.value="";el.fRarity.value="";el.fClass.value="";
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
        return '<i class="dot ' + (r[1] === "极稀有" ? "dot-veryrare" : "dot-rare") + '" title="' + esc(furName(a, r[0])) + " · " + esc(gradeName(r[1])) + '"></i>';
      }).join("");
      if (hasGO(a)) dots += '<i class="dot dot-go" title="' + esc(LANG === "en" ? "Has Great One fur" : "有传奇毛色") + '"></i>';
      var mountChips = a.mounts.map(function (m) {
        return '<span class="mount-chip">' + esc(m[0]) + (m[1] ? '<span class="size-chip">' + esc(m[1]) + "</span>" : "") + "</span>";
      }).join("");
      var classEvidence=infoOf(a).sources.map(function(url){return '<a href="'+escAttr(url)+'" target="_blank" rel="noopener noreferrer">'+esc(new URL(url).hostname)+'</a>';}).join(" / ");
      var detailMount = mountChips || '<span style="color:rgba(30,43,36,0.45);font-size:12px">' + esc(T("noMountDetail")) + '</span>';
      var rareLis = a.rare.map(function (r) {
        var sx = (a.sex && a.sex[r[0]]) || "";
        var sxTag = sx === "f" ? '<span class="sex-tag">♀</span>'
          : sx === "m" ? '<span class="sex-tag">♂</span>'
          : sx === "b" ? '<span class="sex-tag">♂♀</span>'
          : sx === "fu" ? '<span class="sex-tag" title="' + escAttr(LANG === "en" ? "Single source; unverified" : "单源,待互证") + '">♀?</span>'
          : sx === "mu" ? '<span class="sex-tag" title="' + escAttr(LANG === "en" ? "Single source; unverified" : "单源,待互证") + '">♂?</span>'
          : "";
        return '<li>' + '<span class="grade grade-' + (r[1] === "极稀有" ? "vr" : "r") + '">' + esc(gradeName(r[1])) + "</span>" + esc(furName(a, r[0])) + sxTag + "</li>";
      }).join("");
      var goLis = (a.go || []).map(function (g) {
        var name = LANG === "en" ? g.en : (g.z || g.en);
        var untr = (LANG === "zh" && !g.z) ? '<span class="unverified">†</span>' : "";
        var sxTag = g.sx === "m" ? '<span class="sex-tag">♂</span>'
          : g.sx === "f" ? '<span class="sex-tag">♀</span>'
          : g.sx === "mi" ? '<span class="sex-tag" title="' + escAttr(LANG === "en" ? "Inferred from antlers/tusks — not officially stated" : "由角/牙推断雄性,非官方性别陈述") + '">♂*</span>'
          : '<span class="sex-tag sex-unknown">' + (LANG === "en" ? "sex TBD" : "性别待核") + '</span>';
        var viewsTxt = viewsLabel(g.views);
        var views = viewsTxt ? ' <span class="views-note">(' + esc(viewsTxt) + ")</span>" : "";
        return '<li><span class="grade grade-go">' + esc(T("lgGoShort")) + '</span>' + esc(name) + untr + sxTag + views + "</li>";
      }).join("");
      var mapLis = a.maps.map(function (m) {
        return '<li>' + ICONS.pin + esc(mapDisplay(m)) + "</li>";
      }).join("");
      var rowMount;
      if (a.mounts.length) {
        rowMount = '<span class="chip chip-mount" title="' + escAttr(a.mounts.map(function (m) { return m[0] + (m[1] ? "(" + m[1] + ")" : ""); }).join("、")) + '">' +
          ICONS.mount + esc(a.mounts[0][0]) + (a.mounts.length > 1 ? " +" + a.mounts.length : "") + "</span>";
      } else {
        rowMount = '<span class="chip chip-none">' + esc(T("noMountRow")) + '</span>';
      }
      return '<div class="animal-card' + open + '" data-code="' + escAttr(a.code) + '">' +
        '<div class="animal-row">' +
          '<span class="fam-tag">' + esc(familyOf(a)) + "</span>" +
          '<span class="main"><span class="zh">' + esc(nameOf(a)) + (hasGO(a) ? '<span class="go-mark">GO</span>' : "") + "</span>" +
          '<span class="code">' + esc(a.code) + "</span></span>" +
          '<span class="meta">' +
            '<span class="chip class-chip">'+esc(classText(a))+'</span>'+
            '<span class="chip">' + esc(a.maps.length) + " " + esc(T("mapsSuffix")) + "</span>" +
            rowMount +
            '<span class="dots">' + dots + "</span>" +
            ICONS.caret +
          "</span>" +
        "</div>" +
        '<div class="detail">' +
          '<div class="detail-grid">' +
            "<div><h3>" + esc(T("dRareFurs")) + " · " + a.rare.length + "</h3><ul>" + rareLis + "</ul>" + (goLis ? "<h3>" + esc(T("dGoFurs")) + " · " + (a.go||[]).length + "</h3><ul>" + goLis + "</ul><p class='views-note'>" + esc(LANG==="en" ? "† = Chinese display name not officially verified. Himalayan Tahr's seven Great One furs now carry game-localized Chinese names (verified against the game's internal SortedPairs string table, 2025-10-25); other species' GO names remain community/shorthand names pending verification. Side notes are render views, not separate furs." : "† = 中文显示名未经官方核实。喜马拉雅塔尔羊七种传奇毛色已采用游戏本地化中文名（2025-10-25 对照游戏内部 SortedPairs 字符串表核实）；其余物种 GO 名为社区/简称，待核。括号视图为渲染侧面，非独立毛色。") + "</p>" : "") + "</div>" +
            "<div><h3>" + esc(T("dReserves")) + "</h3><ul>" + mapLis + "</ul></div>" +
            "<div><h3>" + esc(T("dMounts")) + "</h3>" + detailMount + "</div>" +
          "</div>" +
          (a.note ? '<p class="note">' + esc(a.note) + "</p>" : "") +
          '<p class="note">'+esc(infoOf(a).classStatus==="conflict"?T("classConflict"):classText(a))+(classEvidence?" · "+esc(T("classSources"))+": "+classEvidence:"")+"</p>" +
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

  /* ---- 静态文案（index.html data-i18n 节点） ---- */
  function updateStatic() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-i18n]"), function (n) {
      var k = n.getAttribute("data-i18n");
      if (I18N[k]) n.textContent=T(k);
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-i18n-ph]"), function (n) {
      var k = n.getAttribute("data-i18n-ph");
      if (I18N[k]) n.setAttribute("placeholder", T(k));
    });
    el.btnLang.textContent = LANG === "en" ? "中文" : "EN";
    document.documentElement.lang = LANG === "en" ? "en" : "zh-CN";
    document.title = LANG === "en" ? "theHunter: Call of the Wild — Rare Fur & Mount Catalog" : "猎人：荒野的呼唤 · 全物种稀有毛色图鉴";
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
    el.fClass.addEventListener("change",function(){state.animalClass=el.fClass.value;apply();});
    el.fRarity.addEventListener("change", function () { state.rarity = el.fRarity.value; apply(); });
    el.fSort.addEventListener("change", function () { state.sort = el.fSort.value; apply(); });
    el.btnReset.addEventListener("click", function () {
      state = { q: "", family: "", map: "", rarity: "", animalClass:"", sort: "family", open: {} };
      el.q.value = ""; el.fFamily.value = ""; el.fMap.value = ""; el.fRarity.value = ""; el.fSort.value = "family";el.fClass.value="";
      apply();
    });
    el.btnLang.addEventListener("click", function () {
      LANG = LANG === "en" ? "zh" : "en";
      hayCache = {};
      updateStatic();
      rebuildSelects();
      renderHeroStats();
      renderMountCatalog();
      apply();
    });
    el.mcQ.addEventListener("input", function () { renderMountCatalog(); });
    el.tabAnimals.addEventListener("click", function () { setView("animals"); });
    el.tabMounts.addEventListener("click", function () { setView("mounts"); });
  }

  rebuildSelects();
  renderHeroStats();
  updateStatic();
  bind();
  setView("animals");
  apply();
  renderMountCatalog();
})();
