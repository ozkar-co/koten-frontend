import { getLoreDocument, getLoreIndex, normalizeLoreHtml } from "../service.js";

export function createLoreViewController({ raceList, languageList, loreContent, menuNote }) {
  function createLoreMenuItem({ slug, title }, type) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.className = "menu-item-btn";
    btn.textContent = title;
    btn.addEventListener("click", () => {
      loadLoreDocument(type, slug, title);
    });
    li.appendChild(btn);
    return li;
  }

  async function loadLoreIndex() {
    try {
      const index = await getLoreIndex();

      raceList.innerHTML = "";
      languageList.innerHTML = "";

      index.races.forEach((item) => {
        raceList.appendChild(createLoreMenuItem(item, "races"));
      });

      index.languages.forEach((item) => {
        languageList.appendChild(createLoreMenuItem(item, "lang"));
      });

      menuNote.textContent = "Selecciona una seccion.";
    } catch (error) {
      menuNote.textContent = "No se pudo cargar el indice.";
      loreContent.innerHTML = `<p>${error.message}</p>`;
    }
  }

  async function loadLoreDocument(type, slug, title) {
    try {
      loreContent.innerHTML = "<p>Cargando documento...</p>";
      const html = await getLoreDocument(type, slug);
      loreContent.innerHTML = normalizeLoreHtml(html);
      document.title = `Koten | ${title}`;
    } catch (error) {
      loreContent.innerHTML = `<p>${error.message}</p>`;
    }
  }

  function interceptMarkdownLinks() {
    loreContent.addEventListener("click", (event) => {
      const link = event.target.closest("a");

      if (!link) {
        return;
      }

      if (link.getAttribute("href")?.endsWith(".md")) {
        event.preventDefault();
      }
    });
  }

  return {
    loadLoreIndex,
    interceptMarkdownLinks,
  };
}
