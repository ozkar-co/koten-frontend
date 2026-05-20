import { createLexiconViewController } from "./views/lexiconView.js";
import { createLoreViewController } from "./views/loreView.js";

const raceList = document.getElementById("race-list");
const languageList = document.getElementById("language-list");
const ruleList = document.getElementById("rule-list");
const homeContent = document.getElementById("home-content");
const loreContent = document.getElementById("lore-content");
const homeView = document.getElementById("home-view");
const racesMenu = document.getElementById("races-menu");
const languagesMenu = document.getElementById("languages-menu");
const rulesMenu = document.getElementById("rules-menu");
const lexiconMenu = document.getElementById("lexicon-menu");
const loreView = document.getElementById("lore-view");
const lexiconView = document.getElementById("lexicon-view");
const siteNavButtons = document.querySelectorAll("button.site-nav-btn");
const sidebar = document.getElementById("sidebar");
const racesMenuLink = document.getElementById("races-menu-link");
const languagesMenuLink = document.getElementById("languages-menu-link");
const rulesMenuLink = document.getElementById("rules-menu-link");
const lexiconMenuLink = document.getElementById("lexicon-menu-link");
const openAnalyzerBtn = document.getElementById("open-analyzer");

let loreViewController;

function setView(view, sidebarMenu = null) {
  const isHome = view === "home";
  const isLore = view === "lore";
  const isLexicon = view === "lexicon";
  const showSidebar = isLore || isLexicon;

  homeView.classList.toggle("hidden", !isHome);
  loreView.classList.toggle("hidden", !isLore);
  lexiconView.classList.toggle("hidden", !isLexicon);

  racesMenu.classList.toggle("hidden", sidebarMenu !== "races");
  languagesMenu.classList.toggle("hidden", sidebarMenu !== "languages");
  rulesMenu.classList.toggle("hidden", sidebarMenu !== "rules");
  lexiconMenu.classList.toggle("hidden", sidebarMenu !== "lexicon");

  sidebar.classList.toggle("hidden", !showSidebar);
}

function setActiveTopMenu(target) {
  siteNavButtons.forEach((button) => {
    button.classList.toggle("btn-active", button.dataset.target === target);
  });
}

async function handleTopMenuSelection(target) {
  if (target === "home") {
    setView("home");
    setActiveTopMenu("home");
    await loreViewController.loadHomeIntro();
    return;
  }

  if (target === "lexicon") {
    setView("lexicon", "lexicon");
    setActiveTopMenu("lexicon");
    return;
  }

  if (target === "races") {
    setView("lore", "races");
    setActiveTopMenu("races");
    await loreViewController.loadLoreDocument("races", "races", "Razas de Koten");
    return;
  }

  if (target === "languages") {
    setView("lore", "languages");
    setActiveTopMenu("languages");
    await loreViewController.loadLoreDocument("lang", "lang", "Los idiomas de Koten");
    return;
  }

  if (target === "rules") {
    setView("lore", "rules");
    setActiveTopMenu("rules");
    await loreViewController.loadLoreDocument("rules", "rules", "Reglas");
  }
}

async function reloadSidebarSection(section) {
  if (section === "races") {
    await handleTopMenuSelection("races");
    return;
  }

  if (section === "languages") {
    await handleTopMenuSelection("languages");
    return;
  }

  if (section === "rules") {
    await handleTopMenuSelection("rules");
    return;
  }

  if (section === "lexicon") {
    setView("lexicon", "lexicon");
    setActiveTopMenu("lexicon");
  }
}

function initNavigation() {
  siteNavButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      await handleTopMenuSelection(button.dataset.target);
    });
  });

  racesMenuLink.addEventListener("click", async () => {
    await reloadSidebarSection("races");
  });

  languagesMenuLink.addEventListener("click", async () => {
    await reloadSidebarSection("languages");
  });

  rulesMenuLink.addEventListener("click", async () => {
    await reloadSidebarSection("rules");
  });

  lexiconMenuLink.addEventListener("click", async () => {
    await reloadSidebarSection("lexicon");
  });

  openAnalyzerBtn.addEventListener("click", async () => {
    await reloadSidebarSection("lexicon");
  });
}

async function bootstrap() {
  loreViewController = createLoreViewController({
    raceList,
    languageList,
    ruleList,
    homeContent,
    loreContent,
  });

  initNavigation();
  loreViewController.interceptMarkdownLinks();
  const index = await loreViewController.loadLoreIndex();
  const languages = index?.languages || [];
  createLexiconViewController(lexiconView, languages);
  setView("home");
  loreViewController.loadHomeIntro();
}

bootstrap();
