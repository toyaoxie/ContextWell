/**
 * Emerging Projects Loader — Static site-wide rendering
 * Purpose: Load emerging-projects.json and render into any container with data-emerging-research-container
 * Usage: <div data-emerging-research-container></div>
 * Data: assets/data/emerging-projects.json — an array of early-stage project abstracts
 */

(function () {
  const BASE = "/contextwell";
  const EMERGING_PROJECTS_JSON_URL = `${BASE}/assets/data/emerging-projects.json`;
  const LEGACY_EMERGING_RESEARCH_JSON_URL = `${BASE}/assets/data/emerging-research.json`;
  const CONTACT_EMAIL = "yao.xie@ucdconnect.ie";

  let cachedProjects = null;

  function getValue(item, ...keys) {
   for (const key of keys) {
     if (!item || typeof item !== "object") return "";
     if (item[key] !== undefined && item[key] !== null && item[key] !== "") return item[key];
   }
   return "";
  }

  async function loadEmergingResearchData() {
   if (cachedProjects) return cachedProjects;

   const candidates = [EMERGING_PROJECTS_JSON_URL, LEGACY_EMERGING_RESEARCH_JSON_URL];
   for (const url of candidates) {
     try {
       const res = await fetch(url, { cache: "no-store" });
       if (!res.ok) continue;
       cachedProjects = await res.json();
       return Array.isArray(cachedProjects) ? cachedProjects : [];
     } catch (err) {
       console.warn("Error loading emerging projects:", err);
     }
   }

   cachedProjects = [];
   return [];
  }

  function escapeHtml(value) {
   if (typeof value !== "string") return "";
   return value
     .replace(/&/g, "&amp;")
     .replace(/</g, "&lt;")
     .replace(/>/g, "&gt;")
     .replace(/"/g, "&quot;")
     .replace(/'/g, "&#39;");
  }

  function renderResearchCard(item) {
   const title = escapeHtml(getValue(item, "title", "name") || "Emerging Project");
   const stage = escapeHtml(getValue(item, "stage", "researchArea") || "Early-stage opportunity");
   const shortDescription = escapeHtml(getValue(item, "shortDescription", "description") || "Early-stage concept under development.");
   const whyItMatters = getValue(item, "whyItMatters", "significance");
   const supportNeeded = getValue(item, "supportNeeded", "seeking");
   const collaborationOpportunity = getValue(item, "collaborationOpportunity");
   const interestCTA = getValue(item, "interestCTA", "ctaLabel", "cta") || "Get Involved";
   const url = typeof item.url === "string" ? item.url.trim() : "";
   const ctaHref = url !== "" ? escapeHtml(url) : `mailto:${CONTACT_EMAIL}`;

   const supportText = Array.isArray(supportNeeded)
     ? supportNeeded.map(String).join(" · ")
     : (typeof supportNeeded === "string" ? supportNeeded : "");

   return `
     <div class="card-hover bg-slate-900 border border-slate-800 rounded-xl p-6">
       <p class="text-xs uppercase tracking-wide text-emerald-400 mb-2">${stage}</p>
       <h3 class="text-lg font-semibold mb-2">${title}</h3>
       <p class="text-slate-400 text-sm mb-4">${shortDescription}</p>
       ${
         whyItMatters
           ? `<p class="text-sm mb-4"><span class="text-emerald-400 font-semibold">Why it matters:</span> <span class="text-slate-400">${escapeHtml(String(whyItMatters))}</span></p>`
           : ""
       }
       ${
         supportText
           ? `<p class="text-xs text-slate-500 mb-4"><span class="text-slate-300 font-semibold">Support needed:</span> ${escapeHtml(supportText)}</p>`
           : ""
       }
       ${
         collaborationOpportunity
           ? `<p class="text-xs text-slate-500 mb-4"><span class="text-slate-300 font-semibold">Collaboration:</span> ${escapeHtml(String(collaborationOpportunity))}</p>`
           : ""
       }
       <a href="${ctaHref}" class="inline-block text-xs rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-emerald-400 hover:border-emerald-400 transition">
         ${escapeHtml(String(interestCTA))} →
       </a>
     </div>
   `;
  }

  async function renderEmergingResearch(container) {
   if (!container) return;

   const limit = parseInt(container.dataset.emergingResearchLimit) || null;

   let items = await loadEmergingResearchData();
   if (!Array.isArray(items)) items = [];

   if (limit) {
     items = items.slice(0, limit);
   }

   if (items.length === 0) {
     container.innerHTML = "";
     return;
   }

   container.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-3 gap-6">${items
     .map(renderResearchCard)
     .join("")}</div>`;
  }

  function init() {
   document.querySelectorAll("[data-emerging-research-container]").forEach(renderEmergingResearch);
  }

  if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", init);
  } else {
   init();
  }

  window.CWEmergingResearch = { reload: init };
  window.CWEmergingProjects = window.CWEmergingResearch;
})();
