/* ===== 图鉴交互逻辑：筛选(AND) · 搜索 · 排序 · 展开 · 统计联动 · 中英双语（默认英文） ===== */
(function () {
  "use strict";
  var data = window.ANIMALS || [];
  var manager = window.MANAGER_RARITY || {labels:{},species:{}};
  var LANG = "en";
  var game = window.GAME_FILTERS || {groups:{},animals:{}};
  var subcats = window.GAME_SUBCATEGORIES || {groups:{},order:[],animals:{},unbound:{}};
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
    rarityCommon:{en:"Common",zh:"普通"},rarityUncommon:{en:"Uncommon",zh:"少有"},rarityFabled:{en:"Fabled",zh:"珍稀"},rarityPending:{en:"Binding pending",zh:"绑定待核"},
    stPendingSpecies:{en:"Species binding pending",zh:"物种绑定待核"},sumResources:{en:"Selected resource records",zh:"所选资源记录"},referenceDetails:{en:"Existing references · separate from manager tiers",zh:"原有参考 · 与管理器五档分开"},
    heroTitle: { en: "Fur Tiers & Mount Catalog", zh: "全物种毛色等级图鉴" },
    heroSub: { en: "127 species · Trophy Manager five-tier grades · reserves · Matt mounts", zh: "127 种动物 · 管理器五档毛色 · 地图分布 · Matt 底座" },
    lgRare: { en: "Rare · manager value 2", zh: "稀有 · 管理器值 2" },
    lgVeryrare: { en: "Very Rare · manager value 3", zh: "罕见 · 管理器值 3" },
    lgGo: { en: "Fabled · manager value 4", zh: "珍稀 · 管理器值 4" },
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
    optRareAll: { en: "All tiers + pending", zh: "全部档位与待核" },
    optAll: { en: "All", zh: "全部" },
    optRare: { en: "Rare only", zh: "仅含稀有" },
    optVeryrare: { en: "Very rare only", zh: "仅含极稀有" },
    rarityRare: { en: "Rare", zh: "稀有" },
    rarityVeryrare: { en: "Very Rare", zh: "罕见" },
    rarityGO: { en: "Great One", zh: "传奇" },
    raritySelectAll: { en: "Select all", zh: "全选" },
    rarityClear: { en: "Clear", zh: "清空" },
    lblSubcat: { en: "Subcategory", zh: "子分类" },
    subcatAll: { en: "Select all", zh: "全选" },
    subcatNone: { en: "No subcategory", zh: "无子分类" },
    subcatEmpty: { en: "No game-data subcategory", zh: "无游戏数据子分类" },
    subcatAllLabel: { en: "All subcategories", zh: "全部子分类" },
    rarityNone: { en: "Select rarity", zh: "请选择稀有度" },
    rarityOr: { en: "Multi-select: selected rarities combine with OR.", zh: "可多选，所选等级取“或”。" },
    optSortFamily: { en: "Type · Name", zh: "类别 · 名称" },
    optSortName: { en: "Name", zh: "名称" },
    optSortCount: { en: "Verified fur name count", zh: "已核毛色名称数" },
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
    stRareEntries: { en: "Verified fur name keys", zh: "已核毛色名称键" },
    stGOSpecies: { en: "Species with GO records", zh: "收录GO资料的物种" },
    sumCurrent: { en: "Current species", zh: "当前物种" },
    sumRare: { en: "Selected fur name keys", zh: "所选毛色名称键" },
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
    dRareFurs: { en: "Historical frequency references", zh: "原有频率参考" },
    dGoFurs: { en: "Existing GO name references", zh: "既有 GO 名称参考" },
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
    footNote: { en: "Local five-tier preview, not published. Static current-installation rule verified; unresolved bindings stay pending. No live manager sampling or game writes.", zh: "五档本地预览，未发布。当前安装版本静态转换规则已核，未绑定条目保留待核；未采样实机管理器输出，未写游戏。" }
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
    "萨尔茨维森公园": "Salzwiesen Park", "阿尔伯塔狩猎保护区": "Askiy Ridge Hunting Preserve", "托尔南西恩": "Tòrr nan Sìthean Hunting Estate",
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
  function subcatsOf(a){return subcats.animals[a.code]||[];}
  function subcatLabel(key){var g=subcats.groups[key];return g?g[LANG]:key;}
  function subcatCount(k){return data.filter(function(a){return subcatsOf(a).indexOf(k)>=0;}).length;}
  function mapBase(m) { return LANG === "en" ? (EN_MAP[m] || m) : (MAP_DISPLAY[m] || m); }
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
    "托尔南西恩": ["苏格兰", "scotland", "torr nan sithean", "托尔南西恩", "精灵之丘狩猎庄园"],
    "阿尔伯塔狩猎保护区": ["阿尔伯塔", "alberta", "askiy ridge", "阿斯基岭狩猎保护区"]
  };
  var MAP_DISPLAY = {
    "因蒂苏尤": "因蒂苏尤（秘鲁）",
    "托尔南西恩": "精灵之丘狩猎庄园",
    "阿尔伯塔狩猎保护区": "阿斯基岭狩猎保护区"
  };

  var state = {
    q: "", family: "", species: null, map: "", rarities: ["common", "uncommon", "rare", "veryrare", "fabled", "pending"], animalClass:"", subcats: null, sort: "family",
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
    fSubcats: document.getElementById("fSubcats"),
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
    managerInfo(a).rows.forEach(function(r){parts.push(r.zh,r.en,r.displayKey);});
    a.maps.forEach(function (m) {
      if (EN_MAP[m]) parts.push(EN_MAP[m]);
      if (MAP_DISPLAY[m]) parts.push(MAP_DISPLAY[m]);
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

  function hasResourceGO(a) {
    var info=managerInfo(a);
    if(isPending(a)) return false;
    return info.rows.some(function(r){
      return r.rarityId==="fabled" && r.rarity===4 && r.status==="static-rule-verified" &&
        r.variants.length>0 && r.variants.every(function(v){
          return v.type_rarity===3 && v.flag_raw!==0 && v.manager_value_from_static_rule===4;
        });
    });
  }
  function hasGO(a) { return hasResourceGO(a) || (a.go && a.go.length > 0) || /传奇毛色/.test(a.note || ""); }
  // 官方来源确认 GO（存在级官方证据；社区/存疑/待核不计入）
  var OFFICIAL_GO = { black_bear:1, gray_wolf:1, jaguar:1, moose:1, mule_deer:1, roe_deer:1, tahr:1, whitetail_deer:1, wild_boar:1 };
  var COMMUNITY_GO = { red_deer:1, fallow_deer:1, ring_necked_pheasant:1 };
  function hasOfficialGO(a){ return !!OFFICIAL_GO[a.code]; }
  function hasEvidenceGO(a){ return hasResourceGO(a) || hasOfficialGO(a) || !!COMMUNITY_GO[a.code]; }
  function goTierLabel(a){
    if (hasResourceGO(a)) return LANG === "en" ? "GO · game resources" : "GO · 游戏资源已核";
    if (hasOfficialGO(a)) return LANG === "en" ? "GO official" : "GO官方";
    if (!!COMMUNITY_GO[a.code]) return LANG === "en" ? "GO community" : "GO社区";
    return LANG === "en" ? "GO unverified" : "GO待核";
  }
  var VERIFIED_GO_DISPLAY = { tahr:1, wild_boar:1, gray_wolf:1, moose:1, ring_necked_pheasant:1, red_fox:1, mule_deer:1, fallow_deer:1, black_bear:1 };
  function goDisplayVerified(a,g){ return !!VERIFIED_GO_DISPLAY[a.code] && !!g.z; }
  function goNameEvidenceNote(a){
    if(a.code==="tahr" && hasResourceGO(a)) {
      return LANG === "en" ?
        "All seven Fabled resource and display-name bindings are verified. Male symbols below are preserved legacy references, not a verified male-only runtime restriction. The original configuration records gender=1 for all seven; its enum meaning and runtime eligibility have not been established by this audit." :
        "七条珍稀毛色的资源及名称关联已核。下列雄性符号保留自旧参考，不作为实机“仅限雄性”的已证规则。七条原配置均为 gender=1；本次尚未核实其枚举含义和运行时性别限制。";
    }
    if(hasResourceGO(a)) {
      return LANG === "en" ?
        "The current game configuration includes verified Fabled resources for this species, shown in the five-tier list above. The legacy reference list is retained separately; this does not claim that every legacy entry, suffix or sex restriction is individually resource-bound." :
        "当前游戏配置已核实该物种的珍稀资源，详见上方五档列表。此处旧参考单独保留，不代表其中每条名称、编号后缀或性别限制均已逐项完成资源绑定。";
    }
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

  var RARITY_KEYS = ["common", "uncommon", "rare", "veryrare", "fabled", "pending"];
  var RARITY_TEXT = {common:"rarityCommon",uncommon:"rarityUncommon",rare:"rarityRare",veryrare:"rarityVeryrare",fabled:"rarityFabled",pending:"rarityPending"};
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
    summary.textContent = state.rarities.length === RARITY_KEYS.length ? T("optRareAll") : (state.rarities.length ? state.rarities.map(function(k){return T(RARITY_TEXT[k]);}).join(" / ") : T("rarityNone"));
    summary.title = summary.textContent;
    positionRarityMenu();
  }
  // Legacy rows use reference tier words; verified rows carry stable ids independently of display language.
  var SUBCAT_ORDER = subcats.order.length ? subcats.order : [];
  function renderSubcatOptions() {
    if(!el.fSubcats) return;
    var opts=SUBCAT_ORDER.map(function(k){
      var g=subcats.groups[k]||{}, label=g[LANG]||k;
      return '<label class="rarity-option"><input type="checkbox" value="'+escAttr(k)+'"'+(state.subcats===null||state.subcats.indexOf(k)>=0?' checked':'')+'><span>'+esc(label)+'</span> <span class="subcat-count">'+subcatCount(k)+'</span></label>';
    }).join("");
    document.getElementById("subcatOptions").innerHTML = opts;
  }
  function positionSubcatMenu() {
    if(!el.fSubcats || !el.fSubcats.open) return;
    var menu=document.getElementById("subcatMenu"), control=el.fSubcats.getBoundingClientRect();
    menu.style.maxHeight="";menu.style.left="0px";
    var natural=menu.scrollHeight, below=Math.max(0,innerHeight-control.bottom-14), above=Math.max(0,control.top-14);
    var upwards=below<natural && above>below;
    el.fSubcats.classList.toggle("opens-up",upwards);
    menu.style.maxHeight=Math.max(44,Math.min(natural,upwards?above:below))+"px";
    var rect=menu.getBoundingClientRect();
    if(rect.right>innerWidth-16)menu.style.left=Math.min(0,innerWidth-16-rect.right)+"px";
  }
  function syncSubcatControl() {
    if(!el.fSubcats) return;
    Array.prototype.forEach.call(el.fSubcats.querySelectorAll('input[type="checkbox"]'), function (box) { box.checked = state.subcats===null || state.subcats.indexOf(box.value) >= 0; });
    var summary=document.getElementById("subcatSummary");
    summary.textContent = state.subcats===null ? T("subcatAllLabel") : (state.subcats.length ? state.subcats.map(subcatLabel).join(" / ") : T("subcatNone"));
    summary.title = summary.textContent;
    positionSubcatMenu();
  }
  var LEGACY_RARITY_IDS = {"稀有":"rare", "极稀有":"veryrare"};
  function rarityId(r) { return r[2] && r[2].rarityId ? r[2].rarityId : LEGACY_RARITY_IDS[r[1]]; }
  function mainRarityText(r) { return gradeName(r[1]); }
  function rowFurName(a, r) { return r[2] ? (LANG === "en" ? r[2].en : r[0]) : furName(a,r[0]); }
  function referenceRowCount(a) { return a.rare.length; }
  function referenceNameCount(a) { return unique(a.rare.map(function(r){return r[2] ? r[2].displayKey : r[0];})).length; }
  function managerInfo(a) {
    var info=manager.species[a.code];
    if(!info) return {status:"species-binding-pending",rows:[]};
    if(info.status!=="shared-reserve-config") return info;
    var group=(manager.sharedGroups || {})[info.configSpecies], source=manager.species[info.sharedWith];
    if(!group || group.canonicalCode!==info.sharedWith || group.catalogCodes.indexOf(a.code)<0 || !source ||
       (source.status!=="exact-species-code" && source.status!=="resource-identity-verified") || source.configSpecies!==info.configSpecies) {
      return {status:"species-binding-pending",rows:[]};
    }
    return {status:info.status,configSpecies:source.configSpecies,sharedWith:info.sharedWith,
      rows:source.rows,resourceCount:source.resourceCount,bindingEvidence:info.bindingEvidence};
  }
  function managerSharedNote(a) {
    var info=managerInfo(a), group=(manager.sharedGroups || {})[info.configSpecies];
    if(!group || group.catalogCodes.indexOf(a.code)<0) return "";
    var text=LANG==="en" ? "Shared configuration: Wild Hog / Feral Pig. Both map records are retained; fur resources use one configuration and are counted once in combined statistics. The Mississippi reserve object links wildhog spawn maps to Feral Pig behavior. Static association only; runtime overrides have not been sampled." :
      "共享配置：美洲野猪／野化猪。两条地图记录保留，毛色引用同一套配置，合并统计只计一次。密西西比配置对象将 wildhog 生成图与 Feral Pig 行为关联；依据为静态配置，未采样实机覆盖规则。";
    if(info.configSpecies==="wild_turkey") {
      text=LANG==="en" ? "Shared configuration: Wild Turkey / Merriam's Turkey. Both map records are retained; these six resources use one configuration and are counted once in combined statistics. The Te Awaroa object links Wild Turkey spawn maps to wild_turkey behavior; the canonical animal name key identifies Merriam Turkey. Static reserve association only; runtime overrides have not been sampled." :
        "共享配置：火鸡／梅里亚姆火鸡。两条地图记录保留，共用同一套6条资源，合并统计只计一次。蒂阿拉罗瓦对象将 Wild Turkey 生成图与 wild_turkey 行为关联，该动物定义名称键对应梅里亚姆火鸡；依据限静态保护区配置，未采样实机覆盖规则。";
    }
    return '<p class="manager-shared-note manager-method" data-shared-config="'+escAttr(info.configSpecies)+'">'+esc(text)+'</p>';
  }
  function managerRows(a, selectedOnly) {
    var rows=managerInfo(a).rows;
    return selectedOnly ? rows.filter(function(r){return state.rarities.indexOf(r.rarityId)>=0;}) : rows;
  }
  function furRowCount(a) { return managerRows(a,true).length; }
  function furNameCount(a) { return unique(managerRows(a,true).map(function(r){return r.displayKey;})).length; }
  function managerTierText(id) { return T(RARITY_TEXT[id] || "rarityPending"); }
  function isPending(a) { var s=managerInfo(a).status; return s!=="exact-species-code" && s!=="resource-identity-verified" && s!=="shared-reserve-config"; }

  function hasSelectedRarity(a) {
    if(isPending(a)) return state.rarities.indexOf("pending")>=0;
    return managerRows(a,true).length>0;
  }
  function matches(a) {
    if (!speciesSelected(a.code)) return false;
    if (state.family && groupOf(a) !== state.family) return false;
    if(state.subcats!==null){
      var scs=subcatsOf(a);
      if(!state.subcats.length) return false;
      if(!scs.some(function(s){return state.subcats.indexOf(s)>=0;})) return false;
    }
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

  /* Exact config resource -> manager tier; old frequency/name references stay separate. */
  function managerFurMarkup(a) {
    var en=LANG==="en", rows=managerRows(a,true),info=managerInfo(a);
    var title=en?"Furs · Trophy Manager tiers":"毛色 · 战利品管理器五档";
    var lead='<h3>'+esc(title)+'</h3>'+managerSharedNote(a);
    if(isPending(a)) return lead+'<p class="manager-pending">'+esc(en?"Species-resource binding pending. Existing references remain below; no five-tier value has been assumed.":"物种与资源绑定待核，现有参考保留在下方；未推定五档等级。")+'</p>';
    var keys=unique(rows.map(function(r){return r.displayKey;})).length;
    var resourceCount=rows.reduce(function(n,r){return n+r.variants.length;},0);
    lead+='<p class="manager-count">'+keys+' '+esc(en?"display keys":"显示名称键")+' / '+resourceCount+' '+esc(en?"resource records · selected tiers only":"资源记录 · 仅显示所选档位")+'</p>';
    var lis=rows.map(function(r){
      var name=en?r.en:r.zh,secondary=en?"":'<span class="manager-en">'+esc(r.en)+'</span>';
      var textPending=r.textStatus!=="original-text-bytes-verified"?'<span class="manager-text-pending">'+esc(en?"Display text unresolved":"译词待核")+'</span>':"";
      var ids=r.indices.map(function(i){return "#"+i;}).join(" / ");
      var variantTag=a.code==="bengal_tiger" && (r.indices[0]===8 || r.indices[0]===9)?"02 · ":"";
      var resources=r.variants.map(function(v){
        var paths=[v.malePath,v.femalePath].filter(Boolean).map(function(p){return '<code class="manager-path">'+esc(p)+'</code>';}).join("");
        return '<li><strong>#'+v.index+'</strong> · type_rarity='+v.type_rarity+' · flag='+v.flag_raw+' → m_Rarity='+v.manager_value_from_static_rule+paths+'</li>';
      }).join("");
      return '<li class="manager-fur-row" data-manager-rarity="'+r.rarity+'" data-display-key="'+escAttr(r.displayKey)+'" data-variant-indices="'+r.indices.join(',')+'"><span class="grade manager-grade-'+r.rarityId+'">'+esc(managerTierText(r.rarityId))+'</span><span class="manager-fur-name"><strong>'+esc(name)+'</strong>'+secondary+textPending+'</span><span class="manager-index">'+esc(variantTag+ids)+'</span><details class="manager-resources"><summary>'+esc(en?"Resource evidence":"资源依据")+'</summary><code class="manager-key">'+esc(r.displayKey)+'</code><ul>'+resources+'</ul></details></li>';
    }).join("");
    return lead+'<ul class="manager-fur-list">'+lis+'</ul><p class="manager-method">'+esc(en?"Current installation: static resource → manager data-construction rule verified. Tier labels do not imply spawn percentages. A shared display key can occupy different tiers; resource numbers are not new color names. Live manager outputs and appearance are not tested.":"当前安装版本：已核资源到管理器数据构造的静态规则。等级不表示生成百分比；同显示键可能归入不同档位，资源编号不另算新毛色名。尚未采样实机管理器输出及外观。")+'</p>';
  }
  function managerStats(list, selectedOnly) {
    var result={keys:0,resources:0,pending:0,fabledSpecies:0,tiers:[0,0,0,0,0]};
    var seenKeys={},seenRows={},seenResources={},seenFabled={};
    list.forEach(function(a){
      if(isPending(a)){result.pending++;return;}
      var info=managerInfo(a), rows=managerRows(a,selectedOnly), config=info.configSpecies;
      rows.forEach(function(r){
        var nameId=config+"|"+r.displayKey;
        if(!seenKeys[nameId]) {seenKeys[nameId]=1;result.keys++;}
        var rowId=nameId+"|"+r.rarity+"|"+r.indices.join(",");
        if(!seenRows[rowId]) {seenRows[rowId]=1;result.tiers[r.rarity]++;}
        r.variants.forEach(function(v){
          var resourceId=manager.source.configSHA256+"|"+v.node_offset;
          if(!seenResources[resourceId]) {seenResources[resourceId]=1;result.resources++;}
        });
        if(r.rarity===4 && !seenFabled[config]) {seenFabled[config]=1;result.fabledSpecies++;}
      });
    });
    return result;
  }
  function tierStrip(stats) {
    return '<div class="manager-tier-strip">'+["common","uncommon","rare","veryrare","fabled"].map(function(id,i){return '<span class="manager-tier-total" data-tier="'+i+'"><i class="dot dot-manager-'+id+'" aria-hidden="true"></i>'+esc(managerTierText(id))+' <b>'+stats.tiers[i]+'</b></span>';}).join("")+'<span class="manager-tier-total">'+esc(T("rarityPending"))+' <b>'+stats.pending+'</b> '+esc(LANG==="en"?"species":"物种")+'</span><span class="manager-stat-note">'+esc(LANG==="en"?"Tier counts: configuration × display-key × tier groups; shared map records are deduplicated, and numbered resources are not additional names.":"档位计数按“配置 × 显示键 × 等级”分组；共享地图记录去重，同名资源不额外计作毛色名称。")+'</span></div>';
  }
  // Read-only diagnostics for reproducible acceptance, using the same runtime projection.
  window.CATALOG_MANAGER_CHECK={rows:function(code){var a=data.find(function(a){return a.code===code;});return a?managerRows(a,true):[];},stats:function(){return managerStats(filtered(),true);}};

  /* ---- 渲染 ---- */
  function renderHeroStats() {
    var stats=managerStats(data,false);
    var items=[[data.length,T("stSpecies")],[allFamilies().length,T("stFamilies")],[allMaps().length,T("stMaps")],[stats.keys,T("stRareEntries")],[stats.pending,T("stPendingSpecies")]];
    el.heroStats.innerHTML=items.map(function(it){return '<div class="stat"><b>'+it[0]+'</b><span>'+esc(it[1])+'</span></div>';}).join("");
  }
  function renderSummary(list) {
    var maps=unique(list.reduce(function(acc,a){return acc.concat(mapsOf(a));},[])),stats=managerStats(list,true);
    var items=[[list.length,T("sumCurrent")],[stats.keys,T("sumRare")],[stats.resources,T("sumResources")],[maps.length,T("sumMaps")]];
    el.summaryStrip.innerHTML=items.map(function(it){return '<div class="summary-item"><b>'+it[0]+'</b><span>'+esc(it[1])+'</span></div>';}).join("")+tierStrip(stats);
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
      ? "Configuration fields verified against original game-file bytes. Frequency reference labels remain separate: enum values alone do not establish spawn percentages or the Trophy Manager's five filter tiers; the main list additionally applies the verified resource flag and native bridge. Numbered resources sharing a display key are not additional color names. Missing path properties do not establish runtime sex restrictions; model appearance and runtime overrides remain unverified."
      : "配置字段已与游戏文件原始字节核对。网页频率参考与文件枚举分列：枚举不代表生成百分比；主列表结合已核资源标志与程序转换分支生成管理器五档，未绑定记录不推定。同显示键的编号资源不另算新毛色名称；路径属性缺失不等于运行时性别禁用，模型外观与运行时覆盖仍未核。";
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
      ? "Verified: configuration index, male/female path fields, display keys, same-hash EN/ZH text, type_rarity and the game EXE enum-label branches. Not verified: runtime overrides, full caller data-flow or the actual 02 patterns. Raw config labels remain separate; the main list now applies the verified native bridge plus flag to produce the five manager tiers."
      : "已核：配置编号、雄雌路径字段、显示键、同哈希中英词、type_rarity及游戏程序枚举显示分支。未核：运行时覆盖、完整调用数据流、02实际花纹；配置原词仍保留；主列表已按已核程序分支与资源标志计算管理器五档。";
    return '<details class="resource-evidence tiger-config"><summary>'+esc(en ? "Complete game configuration" : "完整游戏配置")+' ('+e.variants.length+')</summary><p>'+esc(en ? "Source: game32.arc / global/global_animal_types.blo; display text: game67.arc / settings/hp_settings/string_ids.stringlookup. Orange is Common and is excluded from the nine non-common variants." : "来源：game32.arc / global/global_animal_types.blo；显示词：game67.arc / settings/hp_settings/string_ids.stringlookup。橙色为常见，不计入九个非普通变体。")+'</p><table><colgroup><col style="width:10%"><col style="width:65%"><col style="width:25%"></colgroup><thead><tr><th>'+esc(en?"Index":"编号")+'</th><th>'+esc(en?"Display name / resource":"显示名称／资源")+'</th><th>'+esc(en?"Config rarity":"配置稀有度")+'</th></tr></thead><tbody>'+rows+'</tbody></table><p>'+esc(limits)+'</p></details>';
  }

  function tigerFurMarkup(a, r) {
    var m=r[2], name=rowFurName(a,r), secondary=LANG === "zh" ? '<span class="tiger-en">'+esc(m.en)+'</span>' : "";
    return '<li class="tiger-fur-row" data-variant-index="'+m.index+'" data-rarity-id="'+m.rarityId+'"><span class="grade grade-'+(m.rarityId === "veryrare" ? "vr" : "r")+'">'+esc(mainRarityText(r))+'</span><span class="tiger-fur-name"><strong>'+esc(name)+'</strong>'+secondary+'</span><span class="tiger-variant">'+esc((m.variantCode ? "02 · " : "")+"#"+m.index)+'</span></li>';
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
      var dots=managerRows(a,true).map(function(r){return '<i class="dot dot-manager-'+r.rarityId+'" title="'+escAttr((LANG==="en"?r.en:r.zh)+" · "+managerTierText(r.rarityId))+'"></i>';}).join("");
      if(isPending(a)) dots='<span class="manager-pending-chip">'+esc(T("rarityPending"))+'</span>';
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
        return '<li>' + '<span class="grade grade-' + (r[1] === "极稀有" ? "vr" : "r") + '" title="' + escAttr(LANG === "en" ? "Web frequency reference; separate from game file enum" : "网页频率参考，与游戏文件枚举分列") + '">' + esc(mainRarityText(r)) + "</span>" + esc(furName(a, r[0])) + sxTag + configInlineMarkup(a,ri) + (a.resourceEvidence ? '<span class="views-note" title="' + escAttr(LANG === "en" ? "Reference name and rarity; not game-verified" : "参考名称与稀有度，非游戏核证结论") + '"> *</span>' : "") + "</li>";
      }).join("");
      var goLis = (a.go || []).map(function (g) {
        var name = LANG === "en" ? g.en : (g.z || g.en);
        var untr = (LANG === "zh" && !goDisplayVerified(a,g)) ? '<span class="unverified">†</span>' : "";
        var sxTag = g.sx === "m" ? '<span class="sex-tag">♂</span>'
          : g.sx === "f" ? '<span class="sex-tag">♀</span>'
          : g.sx === "mi" ? '<span class="sex-tag" title="' + escAttr(LANG === "en" ? "Inferred from antlers/tusks — not officially stated" : "由角/牙推断雄性,非官方性别陈述") + '">♂*</span>'
          : '<span class="sex-tag sex-unknown">' + (LANG === "en" ? "sex TBD" : "性别待核") + '</span>';
        if(a.code==="tahr" && g.sx==="m") {
          sxTag='<span class="sex-tag legacy-sex-reference" data-source="legacy-reference" title="'+
            escAttr(LANG==="en" ? "Legacy reference; male-only runtime restriction is not proven by gender=1." : "旧参考标记；gender=1尚不足以证明实机仅限雄性。")+'">'+
            esc(LANG==="en" ? "Male (reference)" : "雄性（参考）")+'</span>';
        }
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
      var subTags = subcatsOf(a);
      var subRow = subTags.length
        ? '<p class="subcat-line"><strong>'+esc(T("lblSubcat"))+'</strong>: '+subTags.map(subcatLabel).join(" / ")+' <span class="views-note" title="'+escAttr(LANG==="en"?"Trophy Manager filter rule vs species tag chain (game assets); multi-membership is the literal rule result.":"战利品管理器筛选规则×物种标签链（游戏资源）；多重归属为筛选规则字面结果。")+'">*</span></p>'
        : '<p class="subcat-line subcat-empty">'+esc(T("subcatEmpty"))+'</p>';
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
          subRow +
          '<div class="detail-grid">' +
            '<div class="manager-furs">'+managerFurMarkup(a)+'<details class="legacy-references"><summary>'+esc(T("referenceDetails"))+'</summary><h3>'+esc(T("dRareFurs"))+' · '+referenceRowCount(a)+'</h3><ul'+(a.gameFurEvidence?' class="tiger-fur-list"':'')+'>'+rareLis+'</ul>'+(goLis?'<h3>'+esc(T("dGoFurs"))+' · '+(a.go||[]).length+'</h3><ul>'+goLis+'</ul><p class="views-note">'+esc(goNameEvidenceNote(a))+'</p>':'')+'</details></div>'+
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
    document.title = LANG === "en" ? "theHunter: Call of the Wild — Fur Tiers & Mount Catalog" : "猎人：荒野的呼唤 · 全物种毛色等级图鉴";
  }

  /* ---- 状态与联动 ---- */
  function apply() {
    syncSpeciesControl();
    syncRarityControl();
    syncSubcatControl();
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
    if(el.fSubcats){
      el.fSubcats.addEventListener("change", function (e) {
        if(e.target.type !== "checkbox") return;
        var k=e.target.value;
        if(state.subcats===null)state.subcats=SUBCAT_ORDER.slice();
        if(e.target.checked && state.subcats.indexOf(k)<0)state.subcats.push(k);
        if(!e.target.checked)state.subcats=state.subcats.filter(function(x){return x!==k;});
        if(state.subcats.length===SUBCAT_ORDER.length)state.subcats=null;
        apply();
      });
      document.getElementById("subcatAll").addEventListener("click",function(){state.subcats=null;apply();});
      document.getElementById("subcatClear").addEventListener("click",function(){state.subcats=[];apply();});
      el.fSubcats.addEventListener("toggle",positionSubcatMenu);
      el.fSubcats.querySelector("summary").addEventListener("click",function(){el.fRarity.open=false;el.fSpecies.open=false;requestAnimationFrame(positionSubcatMenu);});
      window.addEventListener("resize",positionSubcatMenu);
      window.addEventListener("scroll",positionSubcatMenu,{passive:true});
      el.fSubcats.addEventListener("keydown",function(e){if(e.key==="Escape" && el.fSubcats.open){el.fSubcats.open=false;el.fSubcats.querySelector("summary").focus();e.stopPropagation();}});
      document.addEventListener("click",function(e){if(!el.fSubcats.contains(e.target))el.fSubcats.open=false;});
      document.addEventListener("focusin",function(e){if(!el.fSubcats.contains(e.target))el.fSubcats.open=false;});
    }
    el.fSort.addEventListener("change", function () { state.sort = el.fSort.value; apply(); });
    el.btnReset.addEventListener("click", function () {
      state = { q: "", family: "", species:null, map: "", rarities: RARITY_KEYS.slice(), animalClass:"", subcats:null, sort: "family", open: {} };
      el.q.value = ""; el.fFamily.value = ""; el.fMap.value = ""; el.fRarity.open=false; el.fSort.value = "family";el.fClass.value="";speciesQuery="";el.speciesSearch.value="";el.fSpecies.open=false;if(el.fSubcats)el.fSubcats.open=false;renderSpeciesOptions();
      apply();
    });
    el.btnLang.addEventListener("click", function () {
      LANG = LANG === "en" ? "zh" : "en";
      hayCache = {};
      updateStatic();
      rebuildSelects();
      renderSubcatOptions();
      renderHeroStats();
      renderMountCatalog();
      apply();
    });
    el.mcQ.addEventListener("input", function () { renderMountCatalog(); });
    el.tabAnimals.addEventListener("click", function () { setView("animals"); });
    el.tabMounts.addEventListener("click", function () { setView("mounts"); });
  }

  rebuildSelects();
  renderSubcatOptions();
  renderHeroStats();
  updateStatic();
  bind();
  setView("animals");
  apply();
  renderMountCatalog();
})();
