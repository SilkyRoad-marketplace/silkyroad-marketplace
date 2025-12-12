// /js/marketplace.js
import { supabase } from "./auth.js";

/* =========================================
   AUTH UI (header + drawer)
========================================= */

async function initAuthUI() {
  const loggedOutBlocks = document.querySelectorAll('[data-when="logged-out"]');
  const loggedInBlocks = document.querySelectorAll('[data-when="logged-in"]');

  function showLoggedOut() {
    loggedOutBlocks.forEach((el) => (el.style.display = ""));
    loggedInBlocks.forEach((el) => (el.style.display = "none"));
  }

  function showLoggedIn() {
    loggedOutBlocks.forEach((el) => (el.style.display = "none"));
    loggedInBlocks.forEach((el) => (el.style.display = ""));
  }

  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (data && data.session) {
      showLoggedIn();
    } else {
      showLoggedOut();
    }
    // also react to changes
    supabase.auth.onAuthStateChange((_evt, session) => {
      if (session) showLoggedIn();
      else showLoggedOut();
    });
  } catch (err) {
    console.error("Auth UI error:", err);
    showLoggedOut();
  }
}

/* =========================================
   CART COUNT (localStorage)
========================================= */

function initCartCount() {
  const countEls = document.querySelectorAll("[data-role='cart-count']");
  if (!countEls.length) return;

  let total = 0;
  try {
    const raw = localStorage.getItem("silkyroad_cart");
    if (raw) {
      const cart = JSON.parse(raw);
      if (Array.isArray(cart)) {
        total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      }
    }
  } catch (e) {
    console.warn("Failed to read cart:", e);
  }

  countEls.forEach((el) => {
    if (total > 0) {
      el.textContent = total;
      el.style.display = "inline";
    } else {
      el.style.display = "none";
    }
  });
}

/* =========================================
   GLOBAL STATE
========================================= */

let allProducts = [];
let filteredProducts = [];
let featuredProducts = [];
let filteredFeatured = [];

const state = {
  category: null,
  subcategory: null,
  search: "",
  tags: new Set(),
  types: new Set(),
  priceMin: null,
  priceMax: null,
  ratingMin: null,
  featuredPage: 1,
  productsPage: 1,
};

const PRODUCTS_PER_PAGE = 54;

function featuredPerPage() {
  if (window.innerWidth < 768) return 2;
  if (window.innerWidth < 1024) return 3;
  return 4;
}

/* =========================================
   FETCH PRODUCTS
========================================= */

async function loadProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load products:", error);
    allProducts = [];
  } else {
    allProducts = data || [];
  }

  featuredProducts = allProducts.filter((p) => p.is_featured);
  applyFilters();
}

/* =========================================
   FILTERS
========================================= */

function matchesFilters(p, search) {
  const title = (p.title || p.name || "").toLowerCase();
  const desc = (p.description || "").toLowerCase();
  const catSlug = (p.category_slug || "").toLowerCase();
  const subSlug = (p.subcategory_slug || "").toLowerCase();
  const catName = (p.category || "").toLowerCase();
  const subName = (p.subcategory || "").toLowerCase();
  const tags = (Array.isArray(p.tags) ? p.tags.join(" ") : (p.tags || "")).toLowerCase();
  const type = (p.file_type || p.type || "").toLowerCase();

  if (state.category) {
    const target = state.category.toLowerCase();
    if (catSlug !== target && catName !== target) return false;
  }
  if (state.subcategory) {
    const targetSub = state.subcategory.toLowerCase();
    if (subSlug !== targetSub && subName !== targetSub) return false;
  }

  if (search) {
    const hay = `${title} ${desc} ${catSlug} ${catName} ${subSlug} ${subName} ${tags}`;
    if (!hay.includes(search)) return false;
  }

  if (state.tags.size) {
    let matchTag = false;
    state.tags.forEach((t) => {
      if (tags.includes(t.toLowerCase())) matchTag = true;
    });
    if (!matchTag) return false;
  }

  if (state.types.size) {
    if (!state.types.has(type)) return false;
  }

  const priceCents = p.price_cents ?? p.priceCents ?? 0;
  const price = priceCents / 100;
  if (state.priceMin != null && price < state.priceMin) return false;
  if (state.priceMax != null && price > state.priceMax) return false;

  const rating = p.average_rating ?? p.rating ?? 0;
  if (state.ratingMin != null && rating < state.ratingMin) return false;

  return true;
}

function applyFilters() {
  const search = state.search.toLowerCase();

  filteredProducts = allProducts.filter((p) => matchesFilters(p, search));
  filteredFeatured = featuredProducts.filter((p) => matchesFilters(p, search));
  renderFeatured();
  renderProducts();
}

/* =========================================
   RENDERING
========================================= */

function formatPrice(p) {
  const cents = p.price_cents ?? p.priceCents ?? 0;
  const currency = p.currency || "USD";
  const value = (cents / 100).toFixed(2);
  return `${currency} ${value}`;
}

function buildRatingStars(p) {
  const rating =
    p.average_rating ??
    p.rating ??
    0;
  const count = p.rating_count ?? p.ratingCount ?? 0;

  if (!rating && !count) return "";

  const full = Math.round(rating);
  const stars =
    "★★★★★".slice(0, full) + "☆☆☆☆☆".slice(0, 5 - full);

  return `
    <div class="mp-product-rating">
      <span class="mp-stars">${stars}</span>
      <span class="mp-rating-count">(${count})</span>
    </div>
  `;
}

function renderCard(p) {
  const grid = document.createElement("article");
  grid.className = "mp-product-card";

  const title = p.title || p.name || "Untitled product";
  const cat = p.category || "";
  const sub = p.subcategory || "";
  const cover =
    p.cover_url ||
    p.coverUrl ||
    "/placeholder-cover.png";

  const ratingHtml = buildRatingStars(p);

  grid.innerHTML = `
    <img src="${cover}" alt="${title}" class="mp-product-cover">
    <h3 class="mp-product-title">${title}</h3>
    <div class="mp-product-meta">
      ${cat ? cat : ""}${sub ? " · " + sub : ""}
    </div>
    ${ratingHtml}
    <div class="mp-product-price">${formatPrice(p)}</div>
  `;

  return grid;
}

function renderFeatured() {
  const grid = document.getElementById("mp-featured-grid");
  const empty = document.getElementById("mp-featured-empty");
  const pagination = document.getElementById("mp-featured-pagination");
  if (!grid || !empty) return;

  grid.innerHTML = "";
  const base = (state.category || state.subcategory) ? filteredFeatured : featuredProducts;
  const perPage = featuredPerPage();
  const pages = Math.max(1, Math.ceil(base.length / perPage));
  state.featuredPage = Math.min(state.featuredPage, pages);
  const start = (state.featuredPage - 1) * perPage;
  const list = base.slice(start, start + perPage);

  if (!list.length) {
    empty.style.display = "block";
    pagination && (pagination.innerHTML = "");
    return;
  }
  empty.style.display = "none";

  list.forEach((p) => grid.appendChild(renderCard(p)));
  renderPagination(pagination, pages, state.featuredPage, (page) => {
    state.featuredPage = page;
    renderFeatured();
  });
}

function renderProducts() {
  const grid = document.getElementById("mp-products-grid");
  const empty = document.getElementById("mp-products-empty");
  const pagination = document.getElementById("mp-products-pagination");
  if (!grid || !empty) return;

  grid.innerHTML = "";

  if (!filteredProducts.length) {
    empty.style.display = "block";
    pagination && (pagination.innerHTML = "");
    return;
  }
  empty.style.display = "none";

  const pages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  state.productsPage = Math.min(state.productsPage, pages);
  const start = (state.productsPage - 1) * PRODUCTS_PER_PAGE;
  filteredProducts
    .slice(start, start + PRODUCTS_PER_PAGE)
    .forEach((p) => grid.appendChild(renderCard(p)));

  renderPagination(pagination, pages, state.productsPage, (page) => {
    state.productsPage = page;
    renderProducts();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function renderPagination(container, pages, current, onChange) {
  if (!container) return;
  container.innerHTML = "";
  if (pages <= 1) return;

  for (let i = 1; i <= pages; i += 1) {
    const btn = document.createElement("button");
    btn.className = "mp-page-btn";
    btn.textContent = String(i);
    if (i === current) btn.classList.add("is-active");
    btn.addEventListener("click", () => onChange(i));
    container.appendChild(btn);
  }
}

/* =========================================
   FILTER UI HANDLERS
========================================= */

async function initFilterUI() {
  if (window.srHeaderReady) await window.srHeaderReady;

  const searchInput = document.getElementById("mp-search-input");
  const searchInputMobile = document.getElementById("mp-search-input-mobile");
  const searchClear = document.getElementById("mp-search-clear");
  const searchClearMobile = document.getElementById("mp-search-clear-mobile");
  const filterToggle = document.getElementById("mp-filters-toggle");
  const filtersPanel = document.getElementById("mp-filters");
  const filtersOverlay = document.getElementById("mp-filters-overlay");
  const clearFiltersBtn = document.getElementById("mp-filters-clear");

  // Search
  function handleSearchInput(value) {
    state.search = value.trim();
    state.featuredPage = 1;
    state.productsPage = 1;
    applyFilters();
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => handleSearchInput(searchInput.value));
  }
  if (searchInputMobile) {
    searchInputMobile.addEventListener("input", () => handleSearchInput(searchInputMobile.value));
  }
  if (searchClear && searchInput) {
    searchClear.addEventListener("click", () => {
      searchInput.value = "";
      if (searchInputMobile) searchInputMobile.value = "";
      handleSearchInput("");
    });
  }
  if (searchClearMobile && searchInputMobile) {
    searchClearMobile.addEventListener("click", () => {
      searchInputMobile.value = "";
      if (searchInput) searchInput.value = "";
      handleSearchInput("");
    });
  }

  // Tags
  document.querySelectorAll(".mp-chip-tag").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tag = (btn.dataset.tag || "").toLowerCase();
      if (!tag) return;
      if (state.tags.has(tag)) {
        state.tags.delete(tag);
        btn.classList.remove("is-active");
      } else {
        state.tags.add(tag);
        btn.classList.add("is-active");
      }
      applyFilters();
    });
  });

  // Types
  document.querySelectorAll(".mp-chip-type").forEach((btn) => {
    btn.addEventListener("click", () => {
      const t = (btn.dataset.type || "").toLowerCase();
      if (!t) return;
      if (state.types.has(t)) {
        state.types.delete(t);
        btn.classList.remove("is-active");
      } else {
        state.types.add(t);
        btn.classList.add("is-active");
      }
      applyFilters();
    });
  });

  // Price inputs
  const minInput = document.getElementById("mp-price-min");
  const maxInput = document.getElementById("mp-price-max");

  function parsePrice(val) {
    const num = Number(val);
    return Number.isFinite(num) && num >= 0 ? num : null;
  }

  if (minInput) {
    minInput.addEventListener("input", () => {
      state.priceMin = parsePrice(minInput.value);
      applyFilters();
    });
  }
  if (maxInput) {
    maxInput.addEventListener("input", () => {
      state.priceMax = parsePrice(maxInput.value);
      applyFilters();
    });
  }

  // Rating radio
  document.querySelectorAll('input[name="mp-rating-min"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      const val = radio.value;
      state.ratingMin = val ? Number(val) : null;
      applyFilters();
    });
  });

  // Clear filters
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", () => {
      state.search = "";
      state.tags.clear();
      state.types.clear();
      state.priceMin = null;
      state.priceMax = null;
      state.ratingMin = null;

      if (searchInput) searchInput.value = "";
      if (minInput) minInput.value = "";
      if (maxInput) maxInput.value = "";
      document.querySelectorAll(".mp-chip").forEach((b) => b.classList.remove("is-active"));
      document
        .querySelectorAll('input[name="mp-rating-min"]')
        .forEach((r) => (r.checked = false));

      applyFilters();
    });
  }

  // Filters slide-in (mobile)
  function openFilters() {
    if (!filtersPanel || !filtersOverlay) return;
    filtersPanel.classList.add("is-open");
    filtersOverlay.classList.add("is-open");
  }

  function closeFilters() {
    if (!filtersPanel || !filtersOverlay) return;
    filtersPanel.classList.remove("is-open");
    filtersOverlay.classList.remove("is-open");
  }

  if (filterToggle) {
    filterToggle.addEventListener("click", openFilters);
  }
  if (filtersOverlay) {
    filtersOverlay.addEventListener("click", closeFilters);
  }
}

/* =========================================
   CATEGORY HANDLER (used by marketplace-cats.js)
========================================= */

window.handleCategoryChange = function ({ category, subcategory, categoryName, subcategoryName }) {
  state.category = category || null;
  state.subcategory = subcategory || null;
  state.featuredPage = 1;
  state.productsPage = 1;

  const label = document.getElementById("mp-current-cat-label");
  if (label) {
    if (!category && !subcategory) {
      label.textContent = "Showing: All categories";
    } else if (category && !subcategory) {
      label.textContent = `Showing: ${categoryName || category}`;
    } else {
      label.textContent = `Showing: ${categoryName || category} › ${subcategoryName || subcategory}`;
    }
  }

  applyFilters();
};

/* =========================================
   INIT
========================================= */

function initFromQuery() {
  const params = new URLSearchParams(window.location.search);
  state.category = params.get("category") || null;
  state.subcategory = params.get("sub") || params.get("subcategory") || null;
  state.search = params.get("q") || "";
}

(async function initMarketplace() {
  initFromQuery();
  await initAuthUI();
  initCartCount();
  await initFilterUI();

  const searchInput = document.getElementById("mp-search-input");
  const searchInputMobile = document.getElementById("mp-search-input-mobile");
  if (searchInput && state.search) searchInput.value = state.search;
  if (searchInputMobile && state.search) searchInputMobile.value = state.search;

  await loadProducts();
})();
