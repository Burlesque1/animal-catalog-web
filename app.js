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

  /* Notes use exact source-text keys so a later data change cannot silently reuse a stale translation. */
  var EN_NOTES = {
    "来源 thewildregister.com(TacMaps)：白化仅雌性": "Source: thewildregister.com (TacMaps): Albino is listed for females only.",
    "少见: 深棕/金/灰/金发/灵": "Uncommon: Dark Brown / Gold / Grey / Blonde / Spirit.",
    "传奇毛色: 栗/冰川/灵/斑点(GO)": "Great One fur reference: Chestnut / Glacier / Spirit / Spotted.",
    "实机修正: 白变/黑化实为稀有(r2)": "Recorded in-game correction: Leucistic / Melanistic listed as Rare (r2).",
    "四源互证: 第二项为白变(Leucistic)非黑化": "Cross-check across four sources: the second entry is Leucistic, not Melanistic.",
    "任务毛色: 幻影/恶人/暗影": "Mission fur references: Phantom / Villain / Shadow (translations of the existing Chinese note; official names not verified).",
    "Acromelanistic/Melanistic Charcoal 官方8.2新增(稀有); 深灰/红棕/蛋白白 tier 待实机r2/r3": "Acromelanistic / Melanistic Charcoal were added in official Patch 8.2 (Rare). Dark Grey / Red Brown / Egg White tiers await in-game r2/r3 verification.",
    "本地游戏配置已核：9个非普通资源变体、7个显示名称键；中文重名按英文和资源编号区分。运行时覆盖及02实际外观未验证。": "Local game configuration verified: 9 non-common resource variants and 7 display-name keys. Distinguish shared names by English name and resource index. Runtime overrides and the actual 02 patterns have not been verified.",
    "黑化 tier=极稀有(Fandom); 白化/白变原稀有保留待核": "Melanistic is listed as Very Rare by Fandom. The existing Rare classification for Albino / Leucistic is retained pending verification.",
    "已删蚀羽: 系雄性common蚀羽39.97%,非稀有毛色": "Eclipse entry removed: male Common Eclipse (39.97%), not a rare fur type.",
    "传奇毛色: 卷云/风暴斗篷/日蚀/星蓟/藏红花辉(GO)": "Great One fur reference (unverified): Cirrus / Stromcloak / Eclipse / Starthistle / Saffronglow.",
    "已删黑化(极稀有): 三源均无Melanistic, 幻条目": "Very Rare Melanistic entry removed: it was not listed in the three sources reviewed and was treated as an invalid catalog entry.",
    "传奇毛色: 斑点(GO)": "Great One fur reference: Spotted.",
    "传奇毛色: 双色/桦/云杉/灰/橡木/斑点(GO)": "Great One fur reference: Two-Tone / Birch / Spruce / Ashen / Oak / Speckled.",
    "传奇毛色: 彩绘/罩/银/金/摩卡(GO); 9.1新增 Acromelanistic/红变/白变": "Great One fur reference: Painted / Hooded / Silver / Golden / Mocha. Patch 9.1 added Acromelanistic / Erythristic / Leucistic."
  };
  function noteText(a) { return LANG === "en" ? (EN_NOTES[a.note] || a.note) : a.note; }

  /* ---- 双语字典 ---- */
  var I18N = {
    heroTitle: { en: "Rare Fur & Mount Catalog", zh: "全物种稀有毛色图鉴" },
    heroSub: { en: "127 species · rare furs · reserves · Matt mount blueprints — every hunt worth taking, at a glance", zh: "127 种动物 · 稀有毛色 · 地图分布 · Matt 底座蓝图 —— 一站查清值得打的每一只" },
    lgRare: { en: "Rare fur (0.1%–1%)", zh: "稀有毛色（0.1%–1%）" },
    lgVeryrare: { en: "Very rare fur (<0.1%)", zh: "极稀有毛色（<0.1%）" },
    lgGo: { en: "GO fur records", zh: "GO毛色资料" },
    lgGoShort: { en: "GO", zh: "传奇" },
    tabAnimals: { en: "Species", zh: "动物图鉴" },
    tabMounts: { en: "Mounts", zh: "底座总览" },
    lblFamily: { en: "Animal type", zh: "动物类别" },
    lblMap: { en: "Reserve", zh: "地图" },
    lblSpecies: { en: "Species", zh: "物种" },
    allSpecies: { en: "All species", zh: "全部物种" },
    phSpecies: { en: "Search species name or code", zh: "搜索物种名称或代码" },
    noSpeciesSelected: { en: "No species selected", zh: "未选择物种" },
    noSpeciesOptions: { en: "No matching species", zh: "没有匹配的物种" },
    lblRarity: { en: "Rarity", zh: "稀有度" },
    lblSort: { en: "Sort", zh: "排序" },
    optRareAll: { en: "All rare & above", zh: "全部稀有以上" },
    optAll: { en: "All", zh: "全部" },
    optRare: { en: "Rare only", zh: "仅含稀有" },
    optVeryrare: { en: "Very rare only", zh: "仅含极稀有" },
    rarityRare: { en: "Rare", zh: "稀有" },
    rarityVeryrare: { en: "Very Rare", zh: "极稀有" },
    rarityGO: { en: "Great One", zh: "传奇" },
    raritySelectAll: { en: "Select all", zh: "全选" },
    rarityClear: { en: "Clear", zh: "清空" },
    rarityNone: { en: "Select rarity", zh: "请选择稀有度" },
    rarityOr: { en: "Multi-select: selected rarities combine with OR.", zh: "可多选，所选等级取“或”。" },
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
    stRareEntries: { en: "Rare+ name entries", zh: "稀有以上名称条目" },
    stGOSpecies: { en: "Species with GO records", zh: "收录GO资料的物种" },
    sumCurrent: { en: "Current species", zh: "当前物种" },
    sumRare: { en: "Rare+ name entries", zh: "稀有以上名称条目" },
    sumMaps: { en: "Reserves", zh: "覆盖地图" },
    sumGO: { en: "Species with GO records", zh: "有GO资料的物种" },
    mHintNoMap1: { en: "species have multi-animal mounts;", zh: "种动物有多动物底座；" },
    mHintNoMap2: { en: "species have GO records.", zh: "种动物收录了GO资料。" },
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
    lblClass:{en:"Animal Class",zh:"动物等级"},classUnknown:{en:"Class unverified",zh:"等级待核实"},classConflict:{en:"Class sources disagree; unverified",zh:"等级来源冲突，待核实"},filterHelp:{en:"Selections within Species or Rarity combine with OR; different filters combine with AND. Animal Class is not difficulty or a medal.",zh:"物种或稀有度各自多选取“或”，不同筛选取“且”；动物等级不是难度或奖牌。"},noGroup:{en:"No species in the current catalog",zh:"当前图鉴暂无该类物种"},classSources:{en:"Class sources",zh:"等级来源"},
    footClasses: {en:"Animal types follow the four Trophy Manager groups. Animal Class uses public references (The Wild Register / TacMaps and CoTW Guide), not difficulty or medals; unresolved entries stay unverified.",zh:"动物类别对齐战利品管理器四大类。动物等级来自 The Wild Register / TacMaps、CoTW Guide 公共参考，不是难度或奖牌；缺少依据及冲突条目保留待核实。"},
    footSrc: { en: "Sources: gameslikefinder Rare Fur Types List (2026-06-24, 20 reserves) · thewildregister.com / TacMaps (vicuña) · Matt mount blueprints from thehuntercotw.wordpress.com (2025-07-06).", zh: "数据源：gameslikefinder《Rare Fur Types List》（2026-06-24，20 张地图）· thewildregister.com / TacMaps（骆马）· Matt 底座蓝图来自 thehuntercotw.wordpress.com（2025-07-06）。" },
    footNote: { en: "Release updated 2026-10-26. Game subcategory filters are not yet available; sex labels retain the existing reference data.", zh: "更新于2026-10-26。游戏二级分类筛选尚未提供；性别标签沿用现有参考资料。" }
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

  var EN_GRADE = { "稀有": "Rare", "极稀有": "Very Rare", "传奇": "Great One", "罕见": "Rare", "极其罕见": "Very Rare", "常见": "Common", "少见": "Uncommon" };

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
  // Verified per-resource labels live in each row's metadata; other species retain their reference labels.
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
    q: "", family: "", species: null, map: "", rarities: ["rare", "veryrare", "go"], animalClass:"", sort: "family",
    open: {}
  };

  var el = {
    heroStats: document.getElementById("heroStats"),
    q: document.getElementById("q"),
    fFamily: document.getElementById("fFamily"),
    fSpecies: document.getElementById("fSpecies"),
    speciesSearch: document.getElementById("speciesSearch"),
    speciesOptions: document.getElementById("speciesOptions"),
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
    var parts = [a.zh, (EN_SPECIES[a.code] || ""), a.code, familyOf(a), a.family, (EN_FAMILY[a.family] || "")].concat(a.maps, a.nameAliases || []);
    a.maps.forEach(function (m) {
      if (EN_MAP[m]) parts.push(EN_MAP[m]);
      if (MAP_WORDS[m]) parts = parts.concat(MAP_WORDS[m]);
    });
    a.rare.forEach(function (r) {
      parts.push(r[0]);
      if (r[2]) {
        parts.push(r[2].en, r[2].displayKey, r[2].resourceSuffix);
        parts = parts.concat(r[2].aliases || []);
      }
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
      red_fox: ["Fabled Candycane"],
      tahr: ["Fabled Grey", "Fabled Scar"]
    };
    if (a.resourceEvidence) a.resourceEvidence.variants.forEach(function(v){parts.push(v.key);});
    if (HISTORY_ALIAS[a.code]) parts = parts.concat(HISTORY_ALIAS[a.code]);
    hayCache[a.code] = { l: LANG, s: parts.join(" ").toLowerCase() };
    return hayCache[a.code].s;
  }

  // null = no species restriction; [] = explicit empty selection, never silently reset to all.
  var speciesQuery = "";
  function speciesSelected(code) { return state.species === null || state.species.indexOf(code) >= 0; }
  function speciesNameHay(a) { return [a.zh,EN_SPECIES[a.code] || "",a.code].concat(a.nameAliases || []).join(" ").toLowerCase(); }
  function renderSpeciesOptions() {
    var q=speciesQuery.trim().toLowerCase();
    var list=data.filter(function(a){return !q || speciesNameHay(a).indexOf(q)>=0;}).slice().sort(function(a,b){return nameOf(a).localeCompare(nameOf(b),LANG === "en" ? "en" : "zh-CN");});
    el.speciesOptions.innerHTML=list.length ? list.map(function(a){
      return '<label class="species-option"><input type="checkbox" value="'+escAttr(a.code)+'"'+(speciesSelected(a.code)?' checked':'')+'><span><span class="species-name">'+esc(nameOf(a))+'</span><span class="species-code">'+esc(a.code)+'</span></span></label>';
    }).join("") : '<p class="species-empty">'+esc(T("noSpeciesOptions"))+'</p>';
    syncSpeciesControl();
  }
  function syncSpeciesControl() {
    Array.prototype.forEach.call(el.speciesOptions.querySelectorAll('input[type="checkbox"]'),function(box){box.checked=speciesSelected(box.value);});
    var selected=state.species === null ? data : data.filter(function(a){return state.species.indexOf(a.code)>=0;});
    var summary=document.getElementById("speciesSummary");
    summary.textContent=state.species===null ? T("allSpecies") : (!selected.length ? T("noSpeciesSelected") : nameOf(selected[0])+(selected.length>1?' +'+(selected.length-1):''));
    summary.title=state.species===null ? T("allSpecies") : selected.map(nameOf).join(LANG==='en'?', ':'、');
    document.getElementById("speciesStatus").textContent=LANG==='en' ? selected.length+' of '+data.length+' species selected. Multi-select uses OR.' : '已选 '+selected.length+' / '+data.length+' 个物种，多选取“或”。';
    positionSpeciesMenu();
  }
  function positionSpeciesMenu() {
    if(!el.fSpecies.open) return;
    var menu=document.getElementById("speciesMenu"),r=el.fSpecies.getBoundingClientRect();
    menu.style.left='0px';menu.style.top='';menu.style.bottom='auto';menu.style.maxHeight='';
    var below=Math.max(0,innerHeight-r.bottom-12),above=Math.max(0,r.top-12),natural=Math.min(420,menu.scrollHeight);
    var up=below<natural && above>below;el.fSpecies.classList.toggle('opens-up',up);
    menu.style.maxHeight=Math.min(innerHeight-24,Math.max(150,Math.min(natural,up?above:below)))+'px';
    var height=menu.getBoundingClientRect().height;
    var y=up?r.top-height-6:r.bottom+6;
    y=Math.max(12,Math.min(y,innerHeight-height-12));
    menu.style.top=(y-r.top)+'px';
    var x=Math.max(16,Math.min(r.left,innerWidth-menu.getBoundingClientRect().width-16));
    menu.style.left=(x-r.left)+'px';
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
    renderSpeciesOptions();
  }

  function hasGO(a) { return (a.go && a.go.length > 0) || /传奇毛色/.test(a.note || ""); }
  // 官方来源确认 GO（存在级官方证据；社区/存疑/待核不计入）
  var OFFICIAL_GO = { black_bear:1, gray_wolf:1, jaguar:1, moose:1, mule_deer:1, roe_deer:1, tahr:1, whitetail_deer:1, wild_boar:1 };
  var COMMUNITY_GO = { red_deer:1, fallow_deer:1, ring_necked_pheasant:1 };
  function hasOfficialGO(a){ return !!OFFICIAL_GO[a.code]; }
  function hasEvidenceGO(a){ return hasOfficialGO(a) || !!COMMUNITY_GO[a.code]; }
  function goTierLabel(a){
    if (hasOfficialGO(a)) return LANG === "en" ? "GO official" : "GO官方";
    if (!!COMMUNITY_GO[a.code]) return LANG === "en" ? "GO community" : "GO社区";
    return LANG === "en" ? "GO unverified" : "GO待核";
  }
  var VERIFIED_GO_DISPLAY = { tahr:1, wild_boar:1, gray_wolf:1, moose:1, ring_necked_pheasant:1, red_fox:1, mule_deer:1, fallow_deer:1, black_bear:1 };
  function goDisplayVerified(a,g){ return !!VERIFIED_GO_DISPLAY[a.code] && !!g.z; }
  function goNameEvidenceNote(a){
    var verified=!!VERIFIED_GO_DISPLAY[a.code];
    var nameNote=a.code === "tahr"
      ? (LANG === "en" ? "The species-configuration and EN/ZH display-key bindings have been verified for all seven Great One fur entries." : "七条传奇毛色的物种配置与中英文显示键关联已核实。")
      : verified
      ? (LANG === "en" ? "Chinese display text verified against the local game's EN/ZH dictionary on 2026-10-25; species-resource binding remains unverified." : "中文显示词已于2026-10-25对照本地游戏中英文词典核实；物种资源关联仍待核。")
      : (LANG === "en" ? "† = Chinese display text unverified; existing names are retained as references." : "† = 中文显示词未核实，现有名称保留供参考。");
    var existence=hasOfficialGO(a)
      ? (LANG === "en" ? "GO existence: official-source evidence." : "GO存在性：有官方来源证据。")
      : (!!COMMUNITY_GO[a.code]
        ? (LANG === "en" ? "GO existence: community-source evidence." : "GO存在性：社区来源证据。")
        : (LANG === "en" ? "GO existence unverified; dictionary text alone does not establish existence." : "GO存在性待核；词典存在该词不代表已确认该物种有GO。"));
    var suffix=a.code === "black_bear" ? (LANG === "en" ? "Glacier variation suffixes remain unverified." : "冰川变体后缀仍待核。") : "";
    return [nameNote,existence,suffix].filter(Boolean).join(" ");
  }

  var RARITY_KEYS = ["rare", "veryrare", "go"];
  var RARITY_TEXT = {rare:"rarityRare", veryrare:"rarityVeryrare", go:"rarityGO"};
  function positionRarityMenu() {
    if(!el.fRarity.open) return;
    var menu=document.getElementById("rarityMenu"), control=el.fRarity.getBoundingClientRect();
    menu.style.maxHeight="";menu.style.left="0px";
    var natural=menu.scrollHeight, below=Math.max(0,innerHeight-control.bottom-14), above=Math.max(0,control.top-14);
    var upwards=below<natural && above>below;
    el.fRarity.classList.toggle("opens-up",upwards);
    menu.style.maxHeight=Math.max(44,Math.min(natural,upwards?above:below))+"px";
    var rect=menu.getBoundingClientRect();
    if(rect.right>innerWidth-16)menu.style.left=Math.min(0,innerWidth-16-rect.right)+"px";
  }
  function syncRarityControl() {
    Array.prototype.forEach.call(el.fRarity.querySelectorAll('input[type="checkbox"]'), function (box) { box.checked = state.rarities.indexOf(box.value) >= 0; });
    var summary=document.getElementById("raritySummary");
    summary.textContent = state.rarities.length === 3 ? T("optRareAll") : (state.rarities.length ? state.rarities.map(function(k){return T(RARITY_TEXT[k]);}).join(" / ") : T("rarityNone"));
    summary.title = summary.textContent;
    positionRarityMenu();
  }
  // Legacy rows use reference tier words; verified rows carry stable ids independently of display language.
  var LEGACY_RARITY_IDS = {"稀有":"rare", "极稀有":"veryrare"};
  function rarityId(r) { return r[2] && r[2].rarityId ? r[2].rarityId : LEGACY_RARITY_IDS[r[1]]; }
  function rowFurName(a, r) { return r[2] ? (LANG === "en" ? r[2].en : r[0]) : furName(a,r[0]); }
  function furRowCount(a) { return a.rare.length; }
  function furNameCount(a) { return unique(a.rare.map(function(r){return r[2] ? r[2].displayKey : r[0];})).length; }
  function hasSelectedRarity(a) {
    return state.rarities.some(function(k){
      if(k === "go") return hasGO(a);
      return a.rare.some(function(r){return rarityId(r) === k;});
    });
  }
  function matches(a) {
    if (!speciesSelected(a.code)) return false;
    if (state.family && groupOf(a) !== state.family) return false;
    if(state.animalClass && (state.animalClass==="unknown"?classOf(a)!=null:String(classOf(a))!==state.animalClass))return false;
    if (state.map && a.maps.indexOf(state.map) < 0) return false;
    if (!hasSelectedRarity(a)) return false;
    if (state.q && searchHay(a).indexOf(state.q.toLowerCase()) < 0) return false;
    return true;
  }

  function sortKey(a) {
    var nm = nameOf(a);
    if (state.sort === "name") return [nm];
    if (state.sort === "rareCount") return [-furNameCount(a), nm];
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
      rareCount += furNameCount(a);
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
      rareCount += furNameCount(a);
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
          state.q = "";state.species=[a.code];speciesQuery="";el.speciesSearch.value="";renderSpeciesOptions();state.family="";state.map="";state.rarities=RARITY_KEYS.slice();state.animalClass="";el.fFamily.value="";el.fMap.value="";el.fClass.value="";
          el.q.value = "";
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

  function configRarityText(e, raw) {
    var label=e.rarityLabels[String(raw)];
    return label ? (LANG === "en" ? label.en : label.zh) : (LANG === "en" ? "Unresolved" : "未定位");
  }
  function configEvidenceMarkup(a) {
    var e=a.configEvidence;
    if (!e || !e.entries.length) return "";
    var en=LANG === "en";
    var entries=e.entries.map(function(item){
      var config=item.rawSet.map(function(raw){return configRarityText(e,raw)+" ("+raw+")";}).join(" / ");
      var rows=item.variants.map(function(v){
        var nums=v.numericSuffixes.length ? " · "+(en?"suffix ":"后缀 ")+v.numericSuffixes.join(" / ") : "";
        function pathLine(path,status,label){
          var text=path || (status === "MISSING_PROPERTY" ? (en ? "Property absent" : "属性缺失") : (en ? "Empty field" : "字段为空"));
          return '<div class="config-path"><span>'+esc(label)+'</span><code>'+esc(text)+'</code></div>';
        }
        return '<li data-resource-index="'+v.index+'"><div class="config-variant-head"><strong>#'+v.index+esc(nums)+'</strong><span>'+esc(configRarityText(e,v.rawRarity))+' <code>('+v.rawRarity+')</code></span></div>'+pathLine(v.malePath,v.maleStatus,en?"Male path field":"雄性路径字段")+pathLine(v.femalePath,v.femaleStatus,en?"Female path field":"雌性路径字段")+'</li>';
      }).join("");
      return '<section class="config-entry" data-config-key="'+escAttr(item.displayKey)+'"><h4>'+esc(furName(a,item.referenceName))+'</h4><div class="config-comparison"><div><span>'+esc(en?"Web frequency reference":"网页频率参考")+'</span><strong>'+esc(gradeName(item.referenceGrade))+'</strong></div><div><span>'+esc(en?"Game file enum":"游戏文件枚举")+'</span><strong>'+esc(config)+'</strong></div></div><p class="config-mapping">'+esc(en?"Config species: ":"配置物种：")+'<code>'+esc(item.configSpecies)+'</code></p><details class="config-resource-list"><summary>'+esc(en?"Resource records":"资源记录")+' ('+item.variants.length+')</summary><code class="config-display-key">'+esc(item.displayKey)+'</code><ul>'+rows+'</ul></details></section>';
    }).join("");
    var count=e.entries.reduce(function(n,item){return n+item.variants.length;},0);
    var limits=en
      ? "Configuration fields verified against original game-file bytes. Frequency reference labels remain separate: enum values do not establish spawn percentages or the Trophy Manager's five filter tiers. Numbered resources sharing a display key are not additional color names. Missing path properties do not establish runtime sex restrictions; model appearance and runtime overrides remain unverified."
      : "配置字段已与游戏文件原始字节核对。网页频率参考与文件枚举分列：枚举不代表生成百分比，也不等同于管理器五档筛选。同显示键的编号资源不另算新毛色名称；路径属性缺失不等于运行时性别禁用，模型外观与运行时覆盖仍未核。";
    return '<details class="resource-evidence config-evidence"><summary>'+esc(en?"Game file grades & resource variants":"游戏文件等级与资源变体")+' · '+e.entries.length+' / '+count+'</summary><p>'+esc(en?"Source: ":"来源：")+esc(e.source.file)+'</p><p>'+esc(limits)+'</p><div class="config-entries">'+entries+'</div></details>';
  }
  function configInlineMarkup(a,index) {
    if (!a.configEvidence) return "";
    var entries=a.configEvidence.entries.filter(function(item){return item.referenceIndex===index;});
    if (!entries.length) return "";
    return '<span class="config-inline">'+esc(LANG === "en" ? "File enum: " : "文件枚举：")+esc(entries[0].rawSet.map(function(raw){return configRarityText(a.configEvidence,raw)+" ("+raw+")";}).join(" / "))+'</span>';
  }

  function resourceEvidenceMarkup(a) {
    var e = a.gameFurEvidence;
    if (!e) return "";
    var en = LANG === "en";
    var rows = e.variants.map(function(v){
      var loc=v.localization, tier=e.rarityLabels[v.type_rarity];
      var suffix=v.index === 8 || v.index === 9 ? " · 02" : "";
      var name=en ? loc.en : loc.zh + " · " + loc.en;
      var paths=[v.male_path,v.female_path].map(function(path){return '<code class="config-code">'+esc(path)+'</code>';}).join("");
      return '<tr data-config-index="'+v.index+'"><td>'+v.index+'</td><td><strong>'+esc(name+suffix)+'</strong><details><summary>'+esc(en ? "Display key / model paths" : "显示键／模型路径")+'</summary><code class="config-code">'+esc(v.display_key)+'</code><code class="config-code">hash '+esc(loc.hash)+'</code>'+paths+'</details></td><td data-label="'+escAttr(en ? "Config rarity: " : "配置稀有度：")+'">'+esc(en?tier.en:tier.zh)+'<br><code>'+v.type_rarity+'</code></td></tr>';
    }).join("");
    var limits=en
      ? "Verified: configuration index, male/female path fields, display keys, same-hash EN/ZH text, type_rarity and the game EXE enum-label branches. Not verified: runtime overrides, full caller data-flow or the actual 02 patterns. The four config values are not equated to the Trophy Manager's five filter tiers."
      : "已核：配置编号、雄雌路径字段、显示键、同哈希中英词、type_rarity及游戏程序枚举显示分支。未核：运行时覆盖、完整调用数据流、02实际花纹；四值配置枚举不等同于管理器五档筛选。";
    return '<details class="resource-evidence tiger-config"><summary>'+esc(en ? "Complete game configuration" : "完整游戏配置")+' ('+e.variants.length+')</summary><p>'+esc(en ? "Source: game32.arc / global/global_animal_types.blo; display text: game67.arc / settings/hp_settings/string_ids.stringlookup. Orange is Common and is excluded from the nine non-common variants." : "来源：game32.arc / global/global_animal_types.blo；显示词：game67.arc / settings/hp_settings/string_ids.stringlookup。橙色为常见，不计入九个非普通变体。")+'</p><table><colgroup><col style="width:10%"><col style="width:65%"><col style="width:25%"></colgroup><thead><tr><th>'+esc(en?"Index":"编号")+'</th><th>'+esc(en?"Display name / resource":"显示名称／资源")+'</th><th>'+esc(en?"Config rarity":"配置稀有度")+'</th></tr></thead><tbody>'+rows+'</tbody></table><p>'+esc(limits)+'</p></details>';
  }

  function tigerFurMarkup(a, r) {
    var m=r[2], name=rowFurName(a,r), secondary=LANG === "zh" ? '<span class="tiger-en">'+esc(m.en)+'</span>' : "";
    return '<li class="tiger-fur-row" data-variant-index="'+m.index+'" data-rarity-id="'+m.rarityId+'"><span class="grade grade-'+(m.rarityId === "veryrare" ? "vr" : "r")+'">'+esc(gradeName(r[1]))+'</span><span class="tiger-fur-name"><strong>'+esc(name)+'</strong>'+secondary+'</span><span class="tiger-variant">'+esc((m.variantCode ? "02 · " : "")+"#"+m.index)+'</span></li>';
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
        return '<i class="dot ' + (rarityId(r) === "veryrare" ? "dot-veryrare" : "dot-rare") + '" title="' + esc(rowFurName(a, r)) + (r[2] ? " #"+r[2].index : "") + " · " + esc(gradeName(r[1])) + '"></i>';
      }).join("");
      if (hasGO(a)) dots += '<i class="dot dot-go" title="' + esc(LANG === "en" ? "Has Great One fur" : "有传奇毛色") + '"></i>';
      var mountChips = a.mounts.map(function (m) {
        return '<span class="mount-chip">' + esc(m[0]) + (m[1] ? '<span class="size-chip">' + esc(m[1]) + "</span>" : "") + "</span>";
      }).join("");
      var classEvidence=infoOf(a).sources.map(function(url){return '<a href="'+escAttr(url)+'" target="_blank" rel="noopener noreferrer">'+esc(new URL(url).hostname)+'</a>';}).join(" / ");
      var detailMount = mountChips || '<span style="color:rgba(30,43,36,0.45);font-size:12px">' + esc(T("noMountDetail")) + '</span>';
      var rareLis = a.rare.map(function (r,ri) {
        if (a.gameFurEvidence) return tigerFurMarkup(a,r);
        var sx = (a.sex && a.sex[r[0]]) || "";
        var sxTag = sx === "f" ? '<span class="sex-tag">♀</span>'
          : sx === "m" ? '<span class="sex-tag">♂</span>'
          : sx === "b" ? '<span class="sex-tag">♂♀</span>'
          : sx === "fu" ? '<span class="sex-tag" title="' + escAttr(LANG === "en" ? "Single source; unverified" : "单源,待互证") + '">♀?</span>'
          : sx === "mu" ? '<span class="sex-tag" title="' + escAttr(LANG === "en" ? "Single source; unverified" : "单源,待互证") + '">♂?</span>'
          : "";
        return '<li>' + '<span class="grade grade-' + (r[1] === "极稀有" ? "vr" : "r") + '" title="' + escAttr(a.configEvidence ? (LANG === "en" ? "Web frequency reference; separate from game file enum" : "网页频率参考，与游戏文件枚举分列") : "") + '">' + esc(gradeName(r[1])) + "</span>" + esc(furName(a, r[0])) + sxTag + configInlineMarkup(a,ri) + (a.resourceEvidence ? '<span class="views-note" title="' + escAttr(LANG === "en" ? "Reference name and rarity; not game-verified" : "参考名称与稀有度，非游戏核证结论") + '"> *</span>' : "") + "</li>";
      }).join("");
      var goLis = (a.go || []).map(function (g) {
        var name = LANG === "en" ? g.en : (g.z || g.en);
        var untr = (LANG === "zh" && !goDisplayVerified(a,g)) ? '<span class="unverified">†</span>' : "";
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
          '<span class="main"><span class="zh">' + esc(nameOf(a)) + (hasGO(a) ? '<span class="go-mark">' + esc(goTierLabel(a)) + '</span>' : "") + "</span>" +
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
            '<div'+(a.gameFurEvidence ? ' class="tiger-furs"' : '')+'><h3>' + esc(a.gameFurEvidence ? (LANG === "en" ? "Non-common resource variants" : "非普通资源变体") : T("dRareFurs")) + " · " + furRowCount(a) + "</h3>" + (a.gameFurEvidence ? '<p class="tiger-count">'+furNameCount(a)+' '+esc(LANG === "en" ? 'display-name keys; 02 shares its base display key, not a new name. Config rarity uses verified game text; filters retain Rare / Very Rare IDs.' : '个显示名称键；02与基础变体共用显示键，不另算新名称。配置等级采用游戏译词，筛选仍使用稀有／极稀有ID。')+'</p>' : '') + '<ul'+(a.gameFurEvidence ? ' class="tiger-fur-list"' : '')+'>' + rareLis + "</ul>" + (goLis ? "<h3>" + esc(T("dGoFurs")) + " · " + (a.go||[]).length + "</h3><ul>" + goLis + "</ul><p class='views-note'>" + esc(goNameEvidenceNote(a)) + "</p>" : "") + "</div>" +
            "<div><h3>" + esc(T("dReserves")) + "</h3><ul>" + mapLis + "</ul></div>" +
            "<div><h3>" + esc(T("dMounts")) + "</h3>" + detailMount + "</div>" +
          "</div>" +
          (a.note ? '<p class="note">' + esc(noteText(a)) + "</p>" : "") +
          resourceEvidenceMarkup(a) + configEvidenceMarkup(a) +
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
    syncSpeciesControl();
    syncRarityControl();
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
    el.speciesSearch.addEventListener("input",function(){speciesQuery=el.speciesSearch.value;renderSpeciesOptions();});
    el.speciesOptions.addEventListener("change",function(e){
      var box=e.target;if(box.type!=="checkbox") return;
      if(state.species===null)state.species=data.map(function(a){return a.code;});
      if(box.checked && state.species.indexOf(box.value)<0)state.species.push(box.value);
      if(!box.checked)state.species=state.species.filter(function(c){return c!==box.value;});
      if(state.species.length===data.length)state.species=null;
      apply();
    });
    document.getElementById("speciesAll").addEventListener("click",function(){state.species=null;apply();});
    document.getElementById("speciesClear").addEventListener("click",function(){state.species=[];apply();});
    el.fSpecies.addEventListener("toggle",positionSpeciesMenu);
    el.fSpecies.querySelector("summary").addEventListener("click",function(){el.fRarity.open=false;requestAnimationFrame(positionSpeciesMenu);});
    window.addEventListener("resize",positionSpeciesMenu);
    window.addEventListener("scroll",positionSpeciesMenu,{passive:true});
    el.fSpecies.addEventListener("keydown",function(e){if(e.key==='Escape' && el.fSpecies.open){el.fSpecies.open=false;el.fSpecies.querySelector('summary').focus();e.stopPropagation();}});
    document.addEventListener("click",function(e){if(!el.fSpecies.contains(e.target))el.fSpecies.open=false;});
    document.addEventListener("focusin",function(e){if(!el.fSpecies.contains(e.target))el.fSpecies.open=false;});
    el.q.addEventListener("input", function () { state.q = el.q.value.trim(); apply(); });
    el.fFamily.addEventListener("change", function () { state.family = el.fFamily.value; apply(); });
    el.fMap.addEventListener("change", function () { state.map = el.fMap.value; apply(); });
    el.fClass.addEventListener("change",function(){state.animalClass=el.fClass.value;apply();});
    el.fRarity.addEventListener("change", function (e) {
      if(e.target.type !== "checkbox") return;
      state.rarities=Array.prototype.filter.call(el.fRarity.querySelectorAll('input[type="checkbox"]'),function(b){return b.checked;}).map(function(b){return b.value;});
      apply();
    });
    document.getElementById("rarityAll").addEventListener("click",function(){state.rarities=RARITY_KEYS.slice();apply();});
    document.getElementById("rarityClear").addEventListener("click",function(){state.rarities=[];apply();});
    el.fRarity.addEventListener("toggle",positionRarityMenu);
    el.fRarity.querySelector("summary").addEventListener("click",function(){el.fSpecies.open=false;requestAnimationFrame(positionRarityMenu);});
    window.addEventListener("resize",positionRarityMenu);
    window.addEventListener("scroll",positionRarityMenu,{passive:true});
    el.fRarity.addEventListener("keydown",function(e){
      if(e.key === "Escape" && el.fRarity.open){el.fRarity.open=false;el.fRarity.querySelector("summary").focus();e.stopPropagation();}
    });
    document.addEventListener("click",function(e){if(!el.fRarity.contains(e.target))el.fRarity.open=false;});
    document.addEventListener("focusin",function(e){if(!el.fRarity.contains(e.target))el.fRarity.open=false;});
    el.fSort.addEventListener("change", function () { state.sort = el.fSort.value; apply(); });
    el.btnReset.addEventListener("click", function () {
      state = { q: "", family: "", species:null, map: "", rarities: RARITY_KEYS.slice(), animalClass:"", sort: "family", open: {} };
      el.q.value = ""; el.fFamily.value = ""; el.fMap.value = ""; el.fRarity.open=false; el.fSort.value = "family";el.fClass.value="";speciesQuery="";el.speciesSearch.value="";el.fSpecies.open=false;renderSpeciesOptions();
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
