import { createLexiconViewController } from "./views/lexiconView.js";
import { createLoreViewController } from "./views/loreView.js";
import { getLexiconLanguages } from "./service.js";

const sidebar      = document.getElementById("sidebar");
const loreContent  = document.getElementById("lore-content");
const loreView     = document.getElementById("lore-view");
const lexiconView  = document.getElementById("lexicon-view");
const raceList     = document.getElementById("race-list");
const languageList = document.getElementById("language-list");
const ruleList    = document.getElementById("rule-list");
const racesMenu    = document.getElementById("races-menu");
const languagesMenu = document.getElementById("languages-menu");
const rulesMenu    = document.getElementById("rules-menu");
const lexiconMenu  = document.getElementById("lexicon-menu");
const siteNavButtons = document.querySelectorAll("button.site-nav-btn");

let loreViewController;

function showSidebarMenu(id) {
  [racesMenu, languagesMenu, rulesMenu, lexiconMenu].forEach((m) =>
    m.classList.toggle("hidden", m.id !== id)
  );
}

function setActiveTopMenu(target) {
  siteNavButtons.forEach((btn) =>
    btn.classList.toggle("btn-active", btn.dataset.target === target)
  );
}

async function navigate(target) {
  setActiveTopMenu(target);

  const isHome    = target === "home";
  const isLexicon = target === "lexicon";

  sidebar.classList.toggle("hidden", isHome);
  loreView.classList.toggle("hidden", isLexicon);
  lexiconView.classList.toggle("hidden", !isLexicon);

  if (isHome) {
    [racesMenu, languagesMenu, rulesMenu, lexiconMenu].forEach(m => m.classList.add("hidden"));
    await loreViewController.loadHomeIntro();
    return;
  }

  if (isLexicon) { showSidebarMenu("lexicon-menu"); return; }
  showSidebarMenu(`${target}-menu`);

  const loreTargets = {
    races:     ["races", "races",  "Razas de Koten"],
    languages: ["lang",  "lang",   "Los idiomas de Koten"],
    rules:     ["rules", "rules",  "Reglas"],
  };
  if (loreTargets[target]) await loreViewController.loadLoreDocument(...loreTargets[target]);
}

function initNavigation() {
  siteNavButtons.forEach((btn) =>
    btn.addEventListener("click", () => navigate(btn.dataset.target))
  );

  document.getElementById("races-menu-link").addEventListener("click",    () => navigate("races"));
  document.getElementById("languages-menu-link").addEventListener("click", () => navigate("languages"));
  document.getElementById("rules-menu-link").addEventListener("click",     () => navigate("rules"));
  document.getElementById("lexicon-menu-link").addEventListener("click",   () => navigate("lexicon"));
  document.getElementById("open-analyzer").addEventListener("click",       () => navigate("lexicon"));
}

async function bootstrap() {
  loreViewController = createLoreViewController({ raceList, languageList, ruleList, loreContent });
  initNavigation();
  loreViewController.interceptMarkdownLinks();
  await loreViewController.loadLoreIndex();
  const lexiconLanguages = await getLexiconLanguages();
  createLexiconViewController(lexiconView, lexiconLanguages);
  await navigate("home");
}

bootstrap();
