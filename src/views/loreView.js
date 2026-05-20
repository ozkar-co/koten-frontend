import { fetchText, getLoreDocument, getLoreIndex, normalizeLoreHtml } from "../service.js";

export function createLoreViewController({
  raceList,
  languageList,
  ruleList,
  loreContent,
}) {
  let loreIndexCache = null;
  let currentLoreType = null;

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

  async function loadLoreIndex() {
    try {
      const index = await getLoreIndex();
      loreIndexCache = index;

      raceList.innerHTML = "";
      languageList.innerHTML = "";
      ruleList.innerHTML = "";

      index.races.filter((item) => item.slug !== "races").forEach((item) => {
        raceList.appendChild(createLoreMenuItem(item, "races"));
      });

      index.languages.filter((item) => item.slug !== "lang").forEach((item) => {
        languageList.appendChild(createLoreMenuItem(item, "lang"));
      });

      (index.sections?.rules || []).filter((item) => item.slug !== "rules").forEach((item) => {
        ruleList.appendChild(createLoreMenuItem(item, "rules"));
      });

      return index;
    } catch (error) {
      raceList.innerHTML = `<li>${error.message}</li>`;
      languageList.innerHTML = `<li>${error.message}</li>`;
      loreContent.innerHTML = `<p>${error.message}</p>`;
      return null;
    }
  }

  function attachImageModal(container) {
    container.querySelectorAll("img.lore-image").forEach((img) => {
      img.addEventListener("click", () => {
        const modal = document.createElement("div");
        modal.className = "img-modal";
        const full = document.createElement("img");
        full.src = img.src.replace(/_thumb(?=([?#]|$))/, "");
        full.alt = img.alt;
        modal.appendChild(full);
        modal.addEventListener("click", () => modal.remove());
        document.body.appendChild(modal);
      });
    });
  }

  async function loadHomeIntro() {
    currentLoreType = null;
    loreContent.innerHTML = "<p>Cargando documento...</p>";

    try {
      const html = await fetchText("/lore/koten");
      loreContent.innerHTML = normalizeLoreHtml(html);
      attachWordTooltips(loreContent);
      attachImageModal(loreContent);
      document.title = "Koten | Inicio";
    } catch (error) {
      loreContent.innerHTML = `<p>${error.message}</p>`;
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
      currentLoreType = type;
      loreContent.innerHTML = "<p>Cargando documento...</p>";
      const html = await getLoreDocument(type, slug);
      loreContent.innerHTML = normalizeLoreHtml(html);
      attachWordTooltips(loreContent);
      attachImageModal(loreContent);
      document.title = `Koten | ${title}`;
    } catch (error) {
      loreContent.innerHTML = `<p>${error.message}</p>`;
    }
  }

  function findLoreDocumentBySlug(slug) {
    if (!loreIndexCache) return null;

    const races = loreIndexCache.races || [];
    const languages = loreIndexCache.languages || [];
    const rules = loreIndexCache.sections?.rules || [];

    const raceMatch = races.find((item) => item.slug === slug);
    if (raceMatch) return { type: "races", title: raceMatch.title || slug, slug };

    const languageMatch = languages.find((item) => item.slug === slug);
    if (languageMatch) return { type: "lang", title: languageMatch.title || slug, slug };

    const ruleMatch = rules.find((item) => item.slug === slug);
    if (ruleMatch) return { type: "rules", title: ruleMatch.title || slug, slug };

    return null;
  }

  function parseMarkdownLink(href) {
    const cleanHref = href.split("#")[0].split("?")[0].trim();
    if (!cleanHref || !cleanHref.endsWith(".md")) return null;

    const parts = cleanHref.split("/").filter(Boolean);
    const file = parts[parts.length - 1];
    const slug = file.replace(/\.md$/i, "");
    if (!slug) return null;

    const explicitType = parts.length > 1 ? parts[0] : null;
    if (explicitType === "races") return { type: "races", slug };
    if (explicitType === "lang" || explicitType === "languages") return { type: "lang", slug };
    if (explicitType === "rules") return { type: "rules", slug };

    return { type: currentLoreType, slug };
  }

  function interceptMarkdownLinks() {
    loreContent.addEventListener("click", async (event) => {
      const link = event.target.closest("a");

      if (!link) {
        return;
      }

      const href = link.getAttribute("href") || "";
      const target = parseMarkdownLink(href);

      if (!target) {
        return;
      }

      event.preventDefault();

      const fromIndex = findLoreDocumentBySlug(target.slug);
      const resolvedType = fromIndex?.type || target.type;

      if (!resolvedType) {
        loreContent.innerHTML = `<p>No se pudo resolver el enlace: ${href}</p>`;
        return;
      }

      await loadLoreDocument(resolvedType, target.slug, fromIndex?.title || target.slug);
    });
  }

  return {
    loadLoreIndex,
    loadHomeIntro,
    loadLoreDocument,
    interceptMarkdownLinks,
  };
}
