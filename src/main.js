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
let homeDocument = null;

function getImageName(src) {
  try {
    const url = new URL(src, window.location.href);
    const pathParts = url.pathname.split("/").filter(Boolean);
    return decodeURIComponent(pathParts[pathParts.length - 1] || "imagen");
  } catch {
    return "imagen";
  }
}

function resolveFullImageSrc(src) {
  try {
    const url = new URL(src, window.location.href);
    url.pathname = url.pathname.replace(/_thumb(?=\.[^/.]+$|$)/, "");
    return url.toString();
  } catch {
    return src.replace(/_thumb(?=\.[^/.]+$|$)/, "");
  }
}

function openImageModal(src, alt = "") {
  const fullSrc = resolveFullImageSrc(src);
  const modal = document.createElement("div");
  modal.className = "image-modal";

  const content = document.createElement("div");
  content.className = "image-modal-content";

  const fullImage = document.createElement("img");
  fullImage.src = fullSrc;
  fullImage.alt = alt;

  const caption = document.createElement("p");
  caption.className = "image-modal-caption";
  caption.textContent = getImageName(fullSrc);

  content.append(fullImage, caption);
  modal.appendChild(content);

  modal.addEventListener("click", () => modal.remove());
  content.addEventListener("click", (event) => event.stopPropagation());

  document.body.appendChild(modal);
}

function initGlobalImageModal() {
  document.addEventListener("click", (event) => {
    const image = event.target.closest("img");
    if (!image || image.closest(".image-modal")) return;
    openImageModal(image.currentSrc || image.src, image.alt || "");
  });
}

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
    createTopNavButton("home", homeDocument.title, true),
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
  initGlobalImageModal();
  loreViewController.interceptMarkdownLinks();
  const loreIndex = await loreViewController.loadLoreIndex();
  homeDocument = loreIndex.home;
  renderTopNavigation(loreIndex.sections);
  const lexiconLanguages = await getLexiconLanguages();
  createLexiconViewController(lexiconView, lexiconLanguages);
  await navigate("home");
}

bootstrap();
