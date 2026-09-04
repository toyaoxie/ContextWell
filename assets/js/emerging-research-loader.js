/**
 * Emerging Research Loader — Static site-wide rendering
 * Purpose: Load emerging-research.json and render into any container with data-emerging-research-container
 * Usage: <div data-emerging-research-container></div>
 * Data: assets/data/emerging-research.json — an array of high-level research abstracts
 */

(function () {
  const BASE = "/contextwell";
  const EMERGING_RESEARCH_JSON_URL = `${BASE}/assets/data/emerging-research.json`;
  const CONTACT_EMAIL = "yao.xie@ucdconnect.ie";

  // Cache to avoid multiple fetches
  let cachedResearch = null;

  /**
   * Fetch and parse emerging-research.json
   */
  async function loadEmergingResearchData() {
    if (cachedResearch) return cachedResearch;
    try {
      const res = await fetch(EMERGING_RESEARCH_JSON_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to fetch emerging research: ${res.status}`);
      cachedResearch = await res.json();
      return cachedResearch;
    } catch (err) {
      console.warn("Error loading emerging research:", err);
      return [];
    }
  }

  /**
   * Render a single research card
   */
  function renderResearchCard(item) {
    const seeking = Array.isArray(item.seeking) ? item.seeking.join(" · ") : "";
    const ctaHref = item.url && item.url.trim() !== "" ? item.url : `mailto:${CONTACT_EMAIL}`;

    return `
      <div class="card-hover bg-slate-900 border border-slate-800 rounded-xl p-6">
        <p class="text-xs uppercase tracking-wide text-emerald-400 mb-2">${item.researchArea || ""}</p>
        <h3 class="text-lg font-semibold mb-2">${item.title || ""}</h3>
        <p class="text-xs text-slate-500 mb-3">${item.stage || ""}</p>
        <p class="text-slate-400 text-sm mb-4">${item.description || ""}</p>
        ${
          item.significance
            ? `<p class="text-sm mb-4"><span class="text-emerald-400 font-semibold">Why it matters:</span> <span class="text-slate-400">${item.significance}</span></p>`
            : ""
        }
        ${
          seeking
            ? `<p class="text-xs text-slate-500 mb-4"><span class="text-slate-300 font-semibold">Currently seeking:</span> ${seeking}</p>`
            : ""
        }
        <a href="${ctaHref}" class="inline-block text-xs rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-emerald-400 hover:border-emerald-400 transition">
          Discuss this Research Opportunity →
        </a>
      </div>
    `;
  }

  /**
   * Render emerging research into a container
   */
  async function renderEmergingResearch(container) {
    if (!container) return;

    const limit = parseInt(container.dataset.emergingResearchLimit) || null;

    let items = await loadEmergingResearchData();
    if (!Array.isArray(items)) items = [];

    if (limit) {
      items = items.slice(0, limit);
    }

    if (items.length === 0) {
      // Empty state: leave the container clean with no cards, placeholders, or errors.
      container.innerHTML = "";
      return;
    }

    container.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-3 gap-6">${items
      .map(renderResearchCard)
      .join("")}</div>`;
  }

  /**
   * Initialize on DOMContentLoaded
   */
  function init() {
    document.querySelectorAll("[data-emerging-research-container]").forEach(renderEmergingResearch);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose for manual re-render if needed
  window.CWEmergingResearch = { reload: init };
})();
