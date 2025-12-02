// /js/header-market.js

const CATEGORY_CONFIG = [
  { id: "all", label: "All", href: "/marketplace.html" },
  { id: "design", label: "Design", href: "/category.html?category=Design" },
  { id: "software", label: "Software Development", href: "/category.html?category=Software%20Development" },
  { id: "3d", label: "3D", href: "/category.html?category=3D" },
  { id: "films", label: "Films", href: "/category.html?category=Films" },
  { id: "crafts", label: "Crafts", href: "/category.html?category=Crafts" },
  { id: "education", label: "Education", href: "/category.html?category=Education" }
];

// simple example subcategories (you can change the names later)
const SUBCATEGORIES = {
  Design: ["Templates", "Logos", "UI Kits", "Branding"],
  "Software Development": ["Web Dev", "Game Dev", "Scripts", "Tools"],
  "3D": ["Avatars", "Assets", "Environment"],
  Films: ["LUTs", "Transitions", "Overlays"],
  Crafts: ["Patterns", "Printables", "Guides"],
  Education: ["Courses", "Workbooks", "Tutorials"]
};

function buildCategoryDropdown(label) {
  const subs = SUBCATEGORIES[label];
  if (!subs || !subs.length) return "";
  const encodedCat = encodeURIComponent(label);
  const links = subs
    .map(
      s =>
        `<a href="/category.html?category=${encodedCat}&sub=${encodeURIComponent(
          s
        )}">${s}</a>`
    )
    .join("");
  return `<div class="nav-cat-menu nav-cat-menu-wide">${links}</div>`;
}

function renderMarketHeader() {
  const root = document.getElementById("header-root");
  if (!root) return;

  const desktopCats = CATEGORY_CONFIG.map(cat => {
    if (cat.label === "All") {
      return `
        <div class="nav-cat-item">
          <button class="nav-cat-trigger" data-cat-id="${cat.id}" data-href="${cat.href}">
            ${cat.label}
          </button>
        </div>`;
    }

    // dropdown for cats that have subcategories
    if (SUBCATEGORIES[cat.label]) {
      return `
        <div class="nav-cat-item">
          <button class="nav-cat-trigger" data-cat-id="${cat.id}" data-href="${cat.href}">
            ${cat.label}
          </button>
          ${buildCategoryDropdown(cat.label)}
        </div>`;
    }

    // simple button → category page
    return `
      <div class="nav-cat-item">
        <button class="nav-cat-trigger" data-cat-id="${cat.id}" data-href="${cat.href}">
          ${cat.label}
        </button>
      </div>`;
  }).join("");

  const mobileCats = CATEGORY_CONFIG.map(
    c =>
      `<a href="${c.href}" class="nav-link">${c.label}</a>`
  ).join("");

  root.innerHTML = `
    <header class="sr-header">
      <div class="sr-container sr-header-inner">
        <a class="logo-link" href="/index.html">
          <img src="/logo.png" alt="Silky Road" class="logo-img">
        </a>

        <div class="market-search">
          <input id="market-search-input" type="search" placeholder="Search digital products…">
        </div>

        <nav class="nav-main nav-main-market">
          <div class="nav-categories">
            ${desktopCats}
          </div>
        </nav>

        <div class="nav-actions nav-actions-market">
          <a href="/library.html" class="nav-link nav-link-small">Library</a>
          <a href="/sign_up.html" class="nav-link nav-link-small">Start selling</a>
          <a href="/dashboard.html" class="nav-link nav-link-small">Dashboard</a>
          <a href="/checkout.html" class="cart-link" aria-label="Cart">
            <span class="cart-icon">🛒</span>
          </a>
        </div>

        <button class="nav-toggle" id="nav-toggle" aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>
      </div>

      <div class="nav-mobile-panel" id="nav-mobile-panel">
        <div class="nav-mobile-section">
          <strong>Categories</strong>
          <div class="nav-categories-mobile">
            ${mobileCats}
          </div>
        </div>
        <div class="nav-mobile-section">
          <strong>Account</strong>
          <div class="nav-actions-mobile">
            <a href="/library.html" class="nav-link nav-link-small">Library</a>
            <a href="/sign_up.html" class="nav-link nav-link-small">Start selling</a>
            <a href="/dashboard.html" class="nav-link nav-link-small">Dashboard</a>
            <a href="/checkout.html" class="nav-link nav-link-small">Cart 🛒</a>
          </div>
        </div>
      </div>
    </header>
  `;
}

function wireMarketHeaderEvents() {
  // Search: redirect on Enter
  const searchInput = document.getElementById("market-search-input");
  if (searchInput) {
    searchInput.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        const q = searchInput.value.trim();
        const url = q
          ? `/marketplace.html?search=${encodeURIComponent(q)}`
          : "/marketplace.html";
        window.location.href = url;
      }
    });
  }

  // Category buttons (desktop)
  document.querySelectorAll(".nav-cat-trigger").forEach(btn => {
    const href = btn.getAttribute("data-href") || "/marketplace.html";

    // click → go to category page
    btn.addEventListener("click", () => {
      window.location.href = href;
    });

    // dropdown hover for those that have menu
    const parent = btn.closest(".nav-cat-item");
    const menu = parent?.querySelector(".nav-cat-menu");
    if (menu) {
      parent.addEventListener("mouseenter", () => {
        menu.classList.add("open");
      });
      parent.addEventListener("mouseleave", () => {
        menu.classList.remove("open");
      });
    }
  });

  // Mobile hamburger
  const toggle = document.getElementById("nav-toggle");
  const panel = document.getElementById("nav-mobile-panel");
  if (toggle && panel) {
    toggle.addEventListener("click", () => {
      panel.classList.toggle("open");
    });
  }
}

(function initMarketHeader() {
  renderMarketHeader();
  wireMarketHeaderEvents();
})();
