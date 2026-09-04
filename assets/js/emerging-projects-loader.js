/**
 * Emerging Projects Loader — Static site-wide rendering
 * Purpose: Load emerging-projects.json and render into any container with data-emerging-projects-container
 * Usage: <div data-emerging-projects-container></div>
 * Data: assets/data/emerging-projects.json — an array of high-level, early-stage project summaries
 *
 * Supported fields per item (all optional except title):
 *   title, shortDescription, whyItMatters, stage, priority,
 *   supportNeeded (array), collaborationOpportunity, interestCTA, url
 */

(function () {
  const BASE = "/contextwell";
  const EMERGING_PROJECTS_JSON_URL = `${BASE}/assets/data/emerging-projects.json`;
  const CONTACT_EMAIL = "yao.xie@ucdconnect.ie";

  // Cache to avoid multiple fetches
  let cachedProjects = null;

  /**
   * Fetch and parse emerging-projects.json
   */
  async function loadEmergingProjectsData() {
    if (cachedProjects) return cachedProjects;
    try {
      const res = await fetch(EMERGING_PROJECTS_JSON_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to fetch emerging projects: ${res.status}`);
      cachedProjects = await res.json();
      return cachedProjects;
    } catch (err) {
      console.warn("Error loading emerging projects:", err);
      return [];
    }
  }

  /**
   * Escape a value for safe interpolation into HTML
   */
  function escapeHtml(value) {
    if (typeof value !== "string") return "";
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /**
   * Render a single emerging project card
   */
  function renderProjectCard(item) {
    const stage = item.stage || "";
    const description = item.shortDescription || "";
    const whyItMatters = item.whyItMatters || "";
    const supportNeeded = Array.isArray(item.supportNeeded) ? item.supportNeeded : [];
    const supportNeededText = supportNeeded.map(escapeHtml).join(" · ");
    const url = typeof item.url === "string" ? item.url.trim() : "";
    const ctaHref = url !== "" ? escapeHtml(url) : `mailto:${CONTACT_EMAIL}`;
    const ctaLabel = item.interestCTA || "Show Interest →";
    const priority = item.priority || "";

    return `
      <div class="card-hover bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div class="flex items-center justify-between gap-2 mb-2">
          <p class="text-xs uppercase tracking-wide text-emerald-400">${escapeHtml(stage)}</p>
          ${
            priority
              ? `<p class="text-[11px] uppercase tracking-wide text-slate-500">${escapeHtml(priority)}</p>`
              : ""
          }
        </div>
        <h3 class="text-lg font-semibold mb-2">${escapeHtml(item.title)}</h3>
        <p class="text-slate-400 text-sm mb-4">${escapeHtml(description)}</p>
        ${
          whyItMatters
            ? `<p class="text-sm mb-4"><span class="text-emerald-400 font-semibold">Why it matters:</span> <span class="text-slate-400">${escapeHtml(whyItMatters)}</span></p>`
            : ""
        }
        ${
          item.collaborationOpportunity
            ? `<p class="text-sm mb-4"><span class="text-slate-300 font-semibold">Collaboration opportunity:</span> <span class="text-slate-400">${escapeHtml(item.collaborationOpportunity)}</span></p>`
            : ""
        }
        ${
          supportNeededText
            ? `<p class="text-xs text-slate-500 mb-4"><span class="text-slate-300 font-semibold">Currently seeking:</span> ${supportNeededText}</p>`
            : ""
        }
        <a href="${ctaHref}" class="inline-block text-xs rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-emerald-400 hover:border-emerald-400 transition">
          ${escapeHtml(ctaLabel)}
        </a>
      </div>
    `;
  }

  /**
   * Render emerging projects into a container
   */
  async function renderEmergingProjects(container) {
    if (!container) return;

    const limit = parseInt(container.dataset.emergingProjectsLimit) || null;

    let items = await loadEmergingProjectsData();
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
      .map(renderProjectCard)
      .join("")}</div>`;
  }

  /**
   * Initialize on DOMContentLoaded
   */
  function init() {
    document.querySelectorAll("[data-emerging-projects-container]").forEach(renderEmergingProjects);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose for manual re-render if needed
  window.CWEmergingProjects = { reload: init };
})();
