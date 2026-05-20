import { createLexiconViewController } from "./views/lexiconView.js";
import { createLoreViewController } from "./views/loreView.js";

const raceList = document.getElementById("race-list");
const languageList = document.getElementById("language-list");
const loreContent = document.getElementById("lore-content");
const loreMenu = document.getElementById("lore-menu");
const lexiconMenu = document.getElementById("lexicon-menu");
const loreView = document.getElementById("lore-view");
const lexiconView = document.getElementById("lexicon-view");
const navButtons = document.querySelectorAll(".nav-btn");
const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");
const openAnalyzerBtn = document.getElementById("open-analyzer");
const menuNote = document.querySelector(".menu-note");

const analyzeForm = document.getElementById("analyze-form");
const languageInput = document.getElementById("language");
const wordInput = document.getElementById("word");
const wordImage = document.getElementById("word-image");
const analysisOutput = document.getElementById("analysis-output");

function setView(view) {
  const isLore = view === "lore";

  loreView.classList.toggle("hidden", !isLore);
  lexiconView.classList.toggle("hidden", isLore);
  loreMenu.classList.toggle("hidden", !isLore);
  lexiconMenu.classList.toggle("hidden", isLore);

  navButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === view);
  });

  sidebar.classList.remove("open");
}

function initNavigation() {
  navButtons.forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });

  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });

  openAnalyzerBtn.addEventListener("click", () => setView("lexicon"));
}

function bootstrap() {
  const loreViewController = createLoreViewController({
    raceList,
    languageList,
    loreContent,
    menuNote,
  });

  const lexiconViewController = createLexiconViewController({
    analyzeForm,
    languageInput,
    wordInput,
    wordImage,
    analysisOutput,
  });

  initNavigation();
  loreViewController.interceptMarkdownLinks();
  loreViewController.loadLoreIndex();
  lexiconViewController.init();
}

bootstrap();
