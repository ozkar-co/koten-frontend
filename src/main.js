import { createLexiconViewController } from "./views/lexiconView.js";
import { createLoreViewController } from "./views/loreView.js";
import { getLexiconLanguages } from "./service.js";

const siteNav      = document.getElementById("site-nav");
const sidebar      = document.getElementById("sidebar");
const loreContent  = document.getElementById("lore-content");
const loreView     = document.getElementById("lore-view");
const lexiconView  = document.getElementById("lexicon-view");

let loreViewController;
let sectionTargets = [];

function createTopNavButton(target, label, isActive = false) {
  const button = document.createElement("button");
  button.className = `btn btn-pill site-nav-btn${isActive ? " btn-active" : ""}`;
  button.dataset.target = target;
  button.textContent = label;
  return button;
}

function renderTopNavigation(sections) {
  sectionTargets = sections.map((section) => section.key);

  siteNav.querySelectorAll("button.site-nav-btn").forEach((button) => button.remove());

  const loginLink = siteNav.querySelector('a[href="/admin/login"]');
  const nodes = [
    createTopNavButton("home", "Inicio", true),
    ...sections.map((section) => createTopNavButton(section.key, section.title)),
    createTopNavButton("lexicon", "Lexicon"),
  ];

  nodes.forEach((node) => {
    siteNav.insertBefore(node, loginLink || null);
  });
}

function setActiveTopMenu(target) {
  siteNav.querySelectorAll("button.site-nav-btn").forEach((btn) =>
    btn.classList.toggle("btn-active", btn.dataset.target === target)
  );
}

async function navigate(target) {
  setActiveTopMenu(target);

  const isHome    = target === "home";
  const isLexicon = target === "lexicon";
  const isSection = sectionTargets.includes(target);

  sidebar.classList.toggle("hidden", isHome || isLexicon || !isSection);
  loreView.classList.toggle("hidden", isLexicon);
  lexiconView.classList.toggle("hidden", !isLexicon);

  if (isHome) {
    loreViewController.showSectionMenu("");
    await loreViewController.loadHomeIntro();
    return;
  }

  if (isLexicon) return;
  if (!isSection) return;

  loreViewController.showSectionMenu(target);
  await loreViewController.loadSectionRoot(target);
}

function initNavigation() {
  siteNav.addEventListener("click", (event) => {
    const button = event.target.closest("button.site-nav-btn");
    if (!button) return;
    navigate(button.dataset.target);
  });
}

async function bootstrap() {
  loreViewController = createLoreViewController({ sidebar, loreContent });
  initNavigation();
  loreViewController.interceptMarkdownLinks();
  const loreIndex = await loreViewController.loadLoreIndex();
  renderTopNavigation(loreIndex.sections);
  const lexiconLanguages = await getLexiconLanguages();
  createLexiconViewController(lexiconView, lexiconLanguages);
  await navigate("home");
}

bootstrap();
