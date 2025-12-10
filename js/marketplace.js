// /js/marketplace.js
// ES module. Uses the SAME Supabase client as the rest of your site.
import { supabase } from "/js/auth.js";

/**
 * CATEGORY TREE
 * You can edit / add subcategories here anytime.
 */
const CATEGORY_TREE = {
  "3D": [
    "Avatars & Characters",
    "Clothing & Accessories",
    "Vehicles",
    "Weapons",
    "UI Packs / Game Assets",
    "Scripts",
    "Animation",
    "Terrain / Maps",
    "Effects",
    "Tools / Plugins",
    "Icon Packs"
  ],
  "Roblox": [
    "Avatars & Characters",
    "Vehicles",
    "Weapons",
    "Maps",
    "UI Packs",
    "Plugins"
  ],
  "Crafts": [
    "Crochet Patterns",
    "Knitting Patterns",
    "Sewing Patterns",
    "Embroidery",
    "Quilting",
    "DIY Guides",
    "Printables"
  ],
  "Design": [
    "Graphic Templates",
    "Canva Templates",
    "Social Media Packs",
    "Print Templates",
    "Logo Templates",
    "UI/UX Kits",
    "Icon Sets",
    "Mockups",
    "Typography",
    "Resume Templates"
  ],
  "Drawing & Painting": [
    "Procreate Brushes",
    "Photoshop Brushes",
    "Clip Studio Brushes",
    "Digital Illustration",
    "Reference Packs",
    "Print-ready Artwork",
    "Tutorials"
  ],
  "Music & Sound Design": [
    "Sample Packs",
    "Loops",
    "Beats",
    "Vocals",
    "Sound Effects",
    "Mixing Templates",
    "Presets (Serum, Vital, etc)",
    "MIDI Packs"
  ],
  "Films": [
    "LUTs",
    "Premiere Pro Templates",
    "Final Cut Templates",
    "Motion Graphics",
    "Overlays",
    "Stock Footage",
    "Tutorials"
  ],
  // "More" group you asked for:
  "Audio": [
    "Meditation Music",
    "Healing Frequencies",
    "Subliminal Tracks",
    "Ambient / Relaxation",
    "Audiobooks"
  ],
  "Recorded Music": [
    "Albums",
    "Singles",
    "Instrumentals",
    "Remixes"
  ],
  "Comics & Graphic Novels": [
    "Manga",
    "Webcomics",
    "Graphic Novels",
    "Story Collections"
  ],
  "Fiction Books": [
    "Fantasy",
    "Romance",
    "Horror",
    "Thriller",
    "Sci-Fi",
    "Mystery",
    "Adventure"
  ],
  "Education": [
    "Courses",
    "Ebooks",
    "Worksheets",
    "Study Guides",
    "Teacher Resources"
  ],
  "Fitness & Health": [
    "Workout Guides",
    "Meal Plans",
    "Yoga Programs",
    "Detox / Diet Guides"
  ],
  "Photography": [
    "Lightroom Presets",
    "Photoshop Presets",
    "Stock Photos",
    "Posing Guides",
    "Background Packs"
  ],
  "Writing & Publishing": [
    "Writing Guides",
    "Templates",
    "Book Formatting",
    "Cover Templates",
    "Prompt Packs"
  ],
  "Business & Money": [
    "Marketing Guides",
    "Budget Templates",
    "Spreadsheets",
    "Digital Planners",
    "Side Hustle Guides"
  ],
  "Gaming": [
    "Game Assets",
    "Mods",
    "Skins",
    "Level Design Packs"
  ],
  "Software Development": [
    "Code Templates",
    "Scripts",
    "Plugins",
    "Tools",
    "Apps"
  ],
  "Other": [
    "Miscellaneous"
  ]
};

let ALL_PRODUCTS = [];
let CURRENT_FILTER = {
  category: null,
  subcategory: null,
  search: "",
  tags: new Set(),
  types: new Set(),
  priceMin: null,
  priceMax: null,
  ratingMin: null
};

/* ===========================
   INIT
=========================== */

document.addEventListener("DOMContentLoaded", () => {
  initAuthHeader();
  initSearch();
  initFilters();
  initCategoryDrawer();
  loadProducts();
});

/* ===========================
   Auth header (login vs dashboard)
=========================== */

async function initAuthHeader() {
  const root = document;
  const loggedOut = root.querySelectorAll('[data-when="logged-out"]');
  const loggedIn = root.querySelectorAll('[data-when="logged-in"]');

  function showLoggedOut() {
    loggedOut.forEach((el) => (el.style.display = ""));
    loggedIn.forEach((el) => (el.style.display = "none"));
  }

  function showLoggedIn() {
    loggedOut.forEach((el) => (el.style.display = "none"));
    loggedIn.forEach((el) => (el.style.display = ""));
  }

  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (data && data.session) {
      showLoggedIn();
    } else {
      showLoggedOut();
    }
  } catch (err) {
    console.error("Auth header session error:", err);
    showLoggedOut();
  }
}

/* ===========================
   Search
=========================== */

function initSearch() {
  const input = document.getElementById("mp-search-input");
  const clearBtn = document.getElementById("mp-search-clear");

  if (!input) return;

  input.addEventListener("input", () => {
    CURRENT_FILTER.search = input.value.trim();
    renderProducts();
  });

  clearBtn.addEventListener("click", () => {
    input.value = "";
    CURRENT_FILTER.search = "";
    renderProducts();
  });
}

/* ===========================
   Filters (tags, file types, price, rating)
=========================== */

function initFilters() {
  // Tag chips
  document.querySelectorAll(".mp-chip-tag").forEach((chip) => {
    chip.addEventListener("click", () => {
      const tag = chip.dataset.tag;
      if (!tag) return;

      if (CURRENT_FILTER.tags.has(tag)) {
        CURRENT_FILTER.tags.delete(tag);
        chip.classList.remove("is-active");
      } else {
        CURRENT_FILTER.tags.add(tag);
        chip.classList.add("is-active");
      }
      renderProducts();
    });
  });

  // Type chips
  document.querySelectorAll(".mp-chip-type").forEach((chip) => {
    chip.addEventListener("click", () => {
      const t = chip.dataset.type;
      if (!t) return;
      if (CURRENT_FILTER.types.has(t)) {
        CURRENT_FILTER.types.delete(t);
        chip.classList.remove("is-active");
      } else {
        CURRENT_FILTER.types.add(t);
        chip.classList.add("is-active");
      }
      renderProducts();
    });
  });

  // Price
  const minInput = document.getElementById("mp-price-min");
  const maxInput = document.getElementById("mp-price-max");

  minInput?.addEventListener("input", () => {
    CURRENT_FILTER.priceMin = minInput.value ? parseFloat(minInput.value) : null;
    renderProducts();
  });
  maxInput?.addEventListener("input", () => {
    CURRENT_FILTER.priceMax = maxInput.value ? parseFloat(maxInput.value) : null;
    renderProducts();
  });

  // Rating
  document.querySelectorAll('input[name="mp-rating-min"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      const v = radio.value;
      CURRENT_FILTER.ratingMin = v ? parseInt(v, 10) : null;
      renderProducts();
    });
  });

  // Clear filters
  const clearBtn = document.getElementById("mp-filters-clear");
  clearBtn.addEventListener("click", () => {
    CURRENT_FILTER.tags.clear();
    CURRENT_FILTER.types.clear();
    CURRENT_FILTER.priceMin = null;
    CURRENT_FILTER.priceMax = null;
    CURRENT_FILTER.ratingMin = null;

    document.querySelectorAll(".mp-chip.is-active").forEach((c) =>
      c.classList.remove("is-active")
    );
    minInput.value = "";
    maxInput.value = "";
    const anyRating = document.querySelector('input[name="mp-rating-min"][value=""]');
    if (anyRating) anyRating.checked = true;

    renderProducts();
  });

  // Mobile filters slide out
  const filters = document.getElementById("mp-filters");
  const toggleBtn = document.getElementById("mp-filters-toggle");
  const overlay = document.getElementById("mp-filters-overlay");

  function openFilters() {
    filters.classList.add("is-open");
    overlay.classList.add("is-open");
  }
  function closeFilters() {
    filters.classList.remove("is-open");
    overlay.classList.remove("is-open");
  }

  toggleBtn.addEventListener("click", openFilters);
  overlay.addEventListener("click", closeFilters);
}

/* ===========================
   Category Drawer
=========================== */

function initCategoryDrawer() {
  const drawer = document.getElementById("mp-cat-drawer");
  const backdrop = document.getElementById("mp-cat-backdrop");
  const toggle = document.getElementById("mp-cat-toggle");
  const closeBtn = document.getElementById("mp-cat-close");
  const body = document.getElementById("mp-cat-drawer-body");
  const catLabel = document.getElementById("mp-current-cat-label");

  // Build drawer DOM
  body.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.type = "button";
  allBtn.className = "mp-cat-parent";
  allBtn.dataset.cat = "";
  allBtn.innerHTML = `<span>All products</span><span>⟲</span>`;
  body.appendChild(allBtn);

  allBtn.addEventListener("click", () => {
    CURRENT_FILTER.category = null;
    CURRENT_FILTER.subcategory = null;
    catLabel.textContent = "Showing: All categories";
    renderProducts();
    closeDrawer();
  });

  Object.entries(CATEGORY_TREE).forEach(([category, subs]) => {
    const parent = document.createElement("button");
    parent.type = "button";
    parent.className = "mp-cat-parent";
    parent.dataset.cat = category;
    parent.innerHTML = `<span>${category}</span><span>▸</span>`;

    const subWrap = document.createElement("div");
    subWrap.className = "mp-cat-sublist";
    subWrap.dataset.forCat = category;

    subs.forEach((sub) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mp-cat-sub";
      btn.dataset.cat = category;
      btn.dataset.subcat = sub;
      btn.textContent = sub;

      btn.addEventListener("click", () => {
        CURRENT_FILTER.category = category;
        CURRENT_FILTER.subcategory = sub;
        catLabel.textContent = `Showing: ${category} › ${sub}`;
        renderProducts();
        closeDrawer();
      });

      subWrap.appendChild(btn);
    });

    parent.addEventListener("click", () => {
      const open = subWrap.classList.toggle("is-open");
      parent.querySelector("span:last-child").textContent = open ? "▾" : "▸";
    });

    body.appendChild(parent);
    body.appendChild(subWrap);
  });

  function openDrawer() {
    drawer.classList.add("is-open");
    backdrop.classList.add("is-open");
  }
  function closeDrawer() {
    drawer.classList.remove("is-open");
    backdrop.classList.remove("is-open");
  }

  toggle.addEventListener("click", openDrawer);
  closeBtn.addEventListener("click", closeDrawer);
  backdrop.addEventListener("click", closeDrawer);
}

/* ===========================
   Products: load + render
=========================== */

async function loadProducts() {
  const grid = document.getElementById("mp-featured-grid");
  const empty = document.getElementById("mp-featured-empty");

  grid.innerHTML = "<p class='mp-empty'>Loading products…</p>";

  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        "id,title,description,price_cents,cover_url,category,subcategory,tags,file_type,avg_rating,ratings_count,created_at"
      )
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    ALL_PRODUCTS = data || [];
    if (!ALL_PRODUCTS.length) {
      grid.innerHTML = "";
      empty.style.display = "block";
      return;
    }

    empty.style.display = "none";
    renderProducts();
  } catch (err) {
    console.error("Error loading products:", err);
    grid.innerHTML =
      "<p class='mp-empty'>Could not load products. Please try again later.</p>";
  }
}

function renderProducts() {
  const grid = document.getElementById("mp-featured-grid");
  const empty = document.getElementById("mp-featured-empty");

  if (!ALL_PRODUCTS.length) {
    grid.innerHTML = "";
    empty.style.display = "block";
    return;
  }

  const filtered = ALL_PRODUCTS.filter((p) => {
    // Category / Subcategory
    if (CURRENT_FILTER.category && p.category !== CURRENT_FILTER.category) {
      return false;
    }
    if (CURRENT_FILTER.subcategory && p.subcategory !== CURRENT_FILTER.subcategory) {
      return false;
    }

    // Search
    if (CURRENT_FILTER.search) {
      const haystack = `${p.title || ""} ${p.description || ""}`.toLowerCase();
      if (!haystack.includes(CURRENT_FILTER.search.toLowerCase())) {
        return false;
      }
    }

    // Tags (assume p.tags is array of strings or comma string)
    if (CURRENT_FILTER.tags.size) {
      const tags = Array.isArray(p.tags)
        ? p.tags
        : typeof p.tags === "string"
        ? p.tags.split(",").map((t) => t.trim())
        : [];
      const lower = tags.map((t) => t.toLowerCase());
      for (const t of CURRENT_FILTER.tags) {
        if (!lower.includes(t.toLowerCase())) return false;
      }
    }

    // Types (file_type column, eg 'pdf', 'zip')
    if (CURRENT_FILTER.types.size && p.file_type) {
      const type = String(p.file_type).toLowerCase();
      let ok = true;
      for (const t of CURRENT_FILTER.types) {
        if (type !== t.toLowerCase()) {
          ok = false;
          break;
        } else {
          ok = true;
        }
      }
      if (!ok) return false;
    }

    // Price (price_cents integer)
    if (CURRENT_FILTER.priceMin != null) {
      const price = (p.price_cents || 0) / 100;
      if (price < CURRENT_FILTER.priceMin) return false;
    }
    if (CURRENT_FILTER.priceMax != null) {
      const price = (p.price_cents || 0) / 100;
      if (price > CURRENT_FILTER.priceMax) return false;
    }

    // Rating
    if (CURRENT_FILTER.ratingMin != null) {
      const rating = p.avg_rating || 0;
      if (rating < CURRENT_FILTER.ratingMin) return false;
    }

    return true;
  });

  // Show max 10 featured on page
  const toShow = filtered.slice(0, 10);

  grid.innerHTML = "";

  if (!toShow.length) {
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";

  for (const p of toShow) {
    const card = document.createElement("article");
    card.className = "mp-product-card";

    const img = document.createElement("img");
    img.className = "mp-product-cover";
    img.src = p.cover_url || "/placeholder-cover.png";
    img.alt = p.title || "Product cover";
    card.appendChild(img);

    const title = document.createElement("h3");
    title.className = "mp-product-title";
    title.textContent = p.title || "Untitled product";
    card.appendChild(title);

    const price = document.createElement("div");
    price.className = "mp-product-price";
    const amount = (p.price_cents || 0) / 100;
    price.textContent = amount === 0 ? "Free" : `$${amount.toFixed(2)}`;
    card.appendChild(price);

    const meta = document.createElement("div");
    meta.className = "mp-product-meta";
    const rating = p.avg_rating || 0;
    const count = p.ratings_count || 0;
    if (count > 0) {
      meta.textContent = `★ ${rating.toFixed(1)} · ${count} ratings`;
    } else {
      meta.textContent = p.category && p.subcategory
        ? `${p.category} • ${p.subcategory}`
        : "Digital product";
    }
    card.appendChild(meta);

    grid.appendChild(card);
  }
}
