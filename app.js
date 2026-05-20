const API_BASE = "https://koten-api.ozkr.net";

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

const analyzeForm = document.getElementById("analyze-form");
const languageInput = document.getElementById("language");
const wordInput = document.getElementById("word");
const wordImage = document.getElementById("word-image");
const analysisOutput = document.getElementById("analysis-output");

const menuNote = document.querySelector(".menu-note");

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

function normalizeLoreHtml(html) {
  return html
    .replaceAll('src="/api/word/', `src="${API_BASE}/word/`)
    .replaceAll('src="/word/', `src="${API_BASE}/word/`)
    .replaceAll('href="/api/word/', `href="${API_BASE}/word/`)
    .replaceAll('href="/word/', `href="${API_BASE}/word/`);
}

async function fetchJson(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);

  if (!response.ok) {
    let detail = `Error ${response.status}`;

    try {
      const payload = await response.json();
      detail = payload.detail || detail;
    } catch {
      // Keep fallback message.
    }

    throw new Error(detail);
  }

  return response.json();
}

async function fetchText(path) {
  const response = await fetch(`${API_BASE}${path}`);

  if (!response.ok) {
    throw new Error(`No se pudo cargar: ${path}`);
  }

  return response.text();
}

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
    const index = await fetchJson("/lore/index");

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
    const html = await fetchText(`/lore/${type}/${slug}`);
    loreContent.innerHTML = normalizeLoreHtml(html);
    document.title = `Koten | ${title}`;
  } catch (error) {
    loreContent.innerHTML = `<p>${error.message}</p>`;
  }
}

function renderAnalysisCard(data, rootDetailsMap) {
  const roots = data.roots || [];

  if (!roots.length) {
    return "<p>No se encontraron raices.</p>";
  }

  const rows = roots
    .map((root) => {
      const lapagRoots = root.lapag_roots || [];
      const details = lapagRoots
        .map((r) => rootDetailsMap.get(r))
        .filter(Boolean)
        .map((detail) => {
          const equivalents = (detail.equivalents || [])
            .map((eq) => `${eq.language_code}: ${eq.language_root}`)
            .join(" | ");
          return `<div><strong>${detail.lapag_root}</strong>: ${detail.meaning || "sin significado"}<br><small>${equivalents}</small></div>`;
        })
        .join("");

      return `
        <div class="root-item">
          <div><strong>Posicion:</strong> ${root.position}</div>
          <div><strong>Fragmento:</strong> ${root.source_root}</div>
          <div><strong>Raices lapag:</strong> ${lapagRoots.join(", ") || "-"}</div>
          ${details || ""}
        </div>
      `;
    })
    .join("");

  return `
    <div>
      <div><strong>Palabra:</strong> ${data.word}</div>
      <div><strong>Normalizada:</strong> ${data.normalized_word || data.word}</div>
      <div><strong>Idioma:</strong> ${data.language_code}</div>
      ${rows}
    </div>
  `;
}

async function analyzeWord(event) {
  event.preventDefault();

  const language = languageInput.value;
  const word = wordInput.value.trim();

  if (!word) {
    return;
  }

  analysisOutput.classList.remove("empty");
  analysisOutput.innerHTML = "Analizando...";

  wordImage.src = `${API_BASE}/word/${encodeURIComponent(language)}/${encodeURIComponent(word)}`;

  try {
    const analysis = await fetchJson("/lexicon/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language_code: language, word }),
    });

    const uniqueRoots = [
      ...new Set(
        (analysis.roots || []).flatMap((r) =>
          (r.lapag_roots || []).filter((root) => typeof root === "string")
        )
      ),
    ];

    const rootResponses = await Promise.all(
      uniqueRoots.map(async (root) => {
        try {
          const detail = await fetchJson(`/lexicon/roots/${encodeURIComponent(root)}`);
          return [root, detail];
        } catch {
          return [root, null];
        }
      })
    );

    const rootDetailsMap = new Map(rootResponses);
    analysisOutput.innerHTML = renderAnalysisCard(analysis, rootDetailsMap);
  } catch (error) {
    analysisOutput.innerHTML = `No se pudo analizar: ${error.message}`;
  }
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

openAnalyzerBtn.addEventListener("click", () => setView("lexicon"));

loreContent.addEventListener("click", (event) => {
  const link = event.target.closest("a");

  if (!link) {
    return;
  }

  if (link.getAttribute("href")?.endsWith(".md")) {
    event.preventDefault();
  }
});

analyzeForm.addEventListener("submit", analyzeWord);

loadLoreIndex();
