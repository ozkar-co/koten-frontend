import { analyzeLexiconWord, getRootDetail, getWordImageUrl } from "../service.js";

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

export function createLexiconViewController({ analyzeForm, languageInput, wordInput, wordImage, analysisOutput }) {
  async function analyzeWord(event) {
    event.preventDefault();

    const language = languageInput.value;
    const word = wordInput.value.trim();

    if (!word) {
      return;
    }

    analysisOutput.classList.remove("empty");
    analysisOutput.innerHTML = "Analizando...";
    wordImage.src = getWordImageUrl(language, word);

    try {
      const analysis = await analyzeLexiconWord(language, word);

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
            const detail = await getRootDetail(root);
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

  function init() {
    analyzeForm.addEventListener("submit", analyzeWord);
  }

  return { init };
}
