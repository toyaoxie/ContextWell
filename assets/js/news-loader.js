/**
 * News Loader — Static site-wide news rendering
 * Purpose: Load news.json and render into any container with data-news-container
 * Usage: <div data-news-container="latest" data-news-limit="3"></div>
 * Modes: 'latest' (most recent), 'all' (all items), 'featured' (featured only)
 */

(function () {
  const BASE = "/contextwell";
  const NEWS_JSON_URL = `${BASE}/assets/data/news.json`;

  // Cache to avoid multiple fetches
  let cachedNews = null;

  /**
   * Fetch and parse news.json
   */
  async function loadNewsData() {
    if (cachedNews) return cachedNews;
    try {
      const res = await fetch(NEWS_JSON_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to fetch news: ${res.status}`);
      cachedNews = await res.json();
      return cachedNews;
    } catch (err) {
      console.error("Error loading news:", err);
      return [];
    }
  }

  /**
   * Sort news chronologically (newest first)
   */
  function sortNewsChronologically(items) {
    return [...items].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  /**
   * Filter news by mode
   */
  function filterNews(items, mode) {
    if (mode === "featured") {
      return items.filter((item) => item.featured === true);
    }
    return items; // 'latest' and 'all' return everything; limiting is done separately
  }

  /**
   * Format date as "Jan 2026"
   */
  function formatDate(dateStr) {
    const date = new Date(`${dateStr}-01T00:00:00`);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
    }).format(date);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[character]));
  }

  function safeUrl(value) {
    return /^(?:https?:\/\/|\/contextwell\/)/.test(value) ? escapeHtml(value) : "#";
  }

  /**
   * Render a single news item
   */
  function renderNewsItem(item, isCompact = false) {
    const dateFormatted = formatDate(item.date);
    const title = escapeHtml(item.title);
    const category = escapeHtml(item.category);
    const excerpt = escapeHtml(item.excerpt);
    const url = safeUrl(item.url);

    if (isCompact) {
      return `
        <article class="rounded-xl border border-slate-800 bg-slate-900 p-5 hover:border-emerald-400 transition">
          <div class="mb-3 flex items-center gap-2 text-xs">
            <span class="rounded-full bg-emerald-400/10 px-2 py-1 font-semibold text-emerald-400">${category}</span>
            <time class="text-slate-400">${dateFormatted}</time>
          </div>
          <h3 class="text-lg font-semibold text-slate-100 mb-2">${title}</h3>
          <p class="text-sm text-slate-400">${excerpt}</p>
        </article>
      `;
    }

    return `
      <article class="rounded-xl border border-slate-800 bg-slate-900 p-6 hover:border-emerald-400 transition">
          <div class="mb-3 flex items-center gap-2 text-xs">
            <span class="rounded-full bg-emerald-400/10 px-2 py-1 font-semibold text-emerald-400">${category}</span>
            <time class="text-slate-400">${dateFormatted}</time>
          </div>
          <h3 class="text-xl font-semibold text-slate-100 mb-2">${title}</h3>
          <p class="text-slate-400 text-sm mb-4">${excerpt}</p>
          <a href="${url}" class="inline-block text-xs rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-300 hover:border-emerald-400 hover:text-emerald-400 transition">
            Read more →
          </a>
      </article>
    `;
  }

  /**
   * Render news into a container
   */
  async function renderNews(container) {
    if (!container) return;

    const mode = container.dataset.newsContainer; // 'latest', 'all', 'featured'
    const limit = parseInt(container.dataset.newsLimit) || null;
    const compact = container.dataset.newsCompact === "true";

    let items = await loadNewsData();
    items = sortNewsChronologically(items);
    items = filterNews(items, mode);

    if (limit) {
      items = items.slice(0, limit);
    }

    if (items.length === 0) {
      container.innerHTML = `<div class="text-slate-400 text-sm">No news items available.</div>`;
      return;
    }

    if (compact) {
      // Compact mode: render as vertical list
      container.innerHTML = items.map((item) => renderNewsItem(item, true)).join("");
    } else {
      // Full mode: render as grid
      const gridClass = items.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      container.innerHTML = `<div class="grid ${gridClass} gap-6">${items
        .map((item) => renderNewsItem(item, false))
        .join("")}</div>`;
    }
  }

  /**
   * Initialize on DOMContentLoaded
   */
  function init() {
    document.querySelectorAll("[data-news-container]").forEach(renderNews);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose for manual re-render if needed
  window.CWNews = { reload: init };
})();
