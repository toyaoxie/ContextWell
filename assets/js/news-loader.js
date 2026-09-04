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
   * Format date as "Jan 15, 2026"
   */
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  }

  /**
   * Render a single news item
   */
  function renderNewsItem(item, isCompact = false) {
    const hasImage = item.image && item.image.trim() !== "";
    const dateFormatted = formatDate(item.date);

    if (isCompact) {
      // Compact version for sidebar / latest news sections
      return `
        <a href="${item.link}" class="block rounded-lg border border-slate-800 bg-slate-900 p-4 hover:border-emerald-400 transition">
          <div class="text-xs text-slate-400 mb-2">${dateFormatted}</div>
          <div class="text-sm font-semibold text-slate-100 line-clamp-2 mb-2">${item.title}</div>
          <div class="text-xs text-slate-400 line-clamp-2">${item.description}</div>
        </a>
      `;
    }

    // Full version for news page
    return `
      <article id="${item.id}" class="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden hover:border-emerald-400 transition">
        ${
          hasImage
            ? `<img src="${item.image}" alt="${item.title}" class="w-full h-48 object-cover bg-slate-800" />`
            : `<div class="w-full h-48 bg-slate-800 flex items-center justify-center">
            <div class="text-slate-600 text-sm">No image</div>
          </div>`
        }
        <div class="p-6">
          <div class="text-xs text-emerald-400 font-semibold mb-2">${dateFormatted}</div>
          <a href="${item.link}" class="block">
            <h3 class="text-xl font-semibold text-slate-100 mb-2 hover:text-emerald-400">${item.title}</h3>
          </a>
          <p class="text-slate-400 text-sm mb-4">${item.description}</p>
          <a href="${item.link}" class="inline-block text-xs rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-300 hover:border-emerald-400 hover:text-emerald-400 transition">
            Read more →
          </a>
        </div>
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
