export const API_BASE = "https://koten-api.ozkr.net";

export function normalizeLoreHtml(html) {
  return html
    .replaceAll('src="/api/word/', `src="${API_BASE}/word/`)
    .replaceAll('src="/word/', `src="${API_BASE}/word/`)
    .replaceAll('href="/api/word/', `href="${API_BASE}/word/`)
    .replaceAll('href="/word/', `href="${API_BASE}/word/`);
}

export async function fetchJson(path, options = {}) {
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

export async function fetchText(path) {
  const response = await fetch(`${API_BASE}${path}`);

  if (!response.ok) {
    throw new Error(`No se pudo cargar: ${path}`);
  }

  return response.text();
}

export function getWordImageUrl(language, word) {
  return `${API_BASE}/word/${encodeURIComponent(language)}/${encodeURIComponent(word)}`;
}

export async function getLoreIndex() {
  return fetchJson("/lore/index");
}

export async function getLoreDocument(type, slug) {
  return fetchText(`/lore/${type}/${slug}`);
}

export async function analyzeLexiconWord(language, word) {
  return fetchJson("/lexicon/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language_code: language, word }),
  });
}

export async function getRootDetail(root) {
  return fetchJson(`/lexicon/roots/${encodeURIComponent(root)}`);
}
