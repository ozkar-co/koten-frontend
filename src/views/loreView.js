import { getLoreDocument, getLoreIndex, normalizeLoreHtml } from "../service.js";

export function createLoreViewController({
  raceList,
  languageList,
  ruleList,
  homeContent,
  loreContent,
}) {
  function createLoreMenuItem({ slug, title }, type) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.className = "btn-ghost";
    btn.textContent = title;
    btn.addEventListener("click", () => {
      loadLoreDocument(type, slug, title);
    });
    li.appendChild(btn);
    return li;
  }

  function getLoreTypeForCategory(category) {
    if (category === "languages") {
      return "lang";
    }

    return "races";
  }

  async function loadLoreIndex() {
    try {
      const index = await getLoreIndex();

      raceList.innerHTML = "";
      languageList.innerHTML = "";
      ruleList.innerHTML = "";

      index.races.forEach((item) => {
        raceList.appendChild(createLoreMenuItem(item, getLoreTypeForCategory("races")));
      });

      index.languages.forEach((item) => {
        languageList.appendChild(createLoreMenuItem(item, getLoreTypeForCategory("languages")));
      });
    } catch (error) {
      raceList.innerHTML = `<li>${error.message}</li>`;
      languageList.innerHTML = `<li>${error.message}</li>`;
      loreContent.innerHTML = `<p>${error.message}</p>`;
    }
  }

  async function loadHomeIntro() {
    homeContent.innerHTML = "<p>Cargando documento...</p>";

    try {
      const html = await getLoreDocument("lore", "koten");
      homeContent.innerHTML = normalizeLoreHtml(html);
      attachWordTooltips(homeContent);
      document.title = "Koten | Inicio";
    } catch (error) {
      homeContent.innerHTML = `<p>${error.message}</p>`;
    }
  }

  function attachWordTooltips(container) {
    container.querySelectorAll(".koten-word img").forEach((img) => {
      const match = img.src.match(/\/word\/[^/]+\/([^/?#]+)/);
      if (match) {
        const word = decodeURIComponent(match[1]);
        img.title = word;
        img.parentElement.title = word;
      }
    });
  }

  async function loadLoreDocument(type, slug, title) {
    try {
      loreContent.innerHTML = "<p>Cargando documento...</p>";
      const html = await getLoreDocument(type, slug);
      loreContent.innerHTML = normalizeLoreHtml(html);
      attachWordTooltips(loreContent);
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
    loadHomeIntro,
    loadLoreDocument,
    interceptMarkdownLinks,
  };
}
