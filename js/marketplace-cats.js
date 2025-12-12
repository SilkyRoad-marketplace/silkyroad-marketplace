// /js/marketplace-cats.js
// FINAL VERSION — supports:
// A1 = Full width
// B1 = Hover dropdown
// C1 = Show EXACTLY 8 categories, rest → More
// Works with sr-* HTML + CSS (header-market.html + marketplace.css)

import { supabase } from "./auth.js";

// Desktop
const desktopBar = document.getElementById("srDesktopCategoryBar");

// Drawer (mobile/tablet)
const drawer = document.getElementById("srDrawer");
const drawerCats = document.getElementById("srDrawerCategories");
const overlay = document.getElementById("srOverlay");

const btnOpen = document.getElementById("srHamburgerBtn");
const btnClose = document.getElementById("srCloseDrawerBtn");

// ----------------------------------------
// Drawer Open / Close
// ----------------------------------------

function openDrawer() {
  drawer.classList.add("is-open");
  overlay.classList.add("is-active");
}

function closeDrawer() {
  drawer.classList.remove("is-open");
  overlay.classList.remove("is-active");
}

if (btnOpen) btnOpen.addEventListener("click", openDrawer);
if (btnClose) btnClose.addEventListener("click", closeDrawer);
if (overlay) overlay.addEventListener("click", closeDrawer);

// ----------------------------------------
// Fetch categories from Supabase
// ----------------------------------------

async function fetchCategoryData() {
  const { data, error } = await supabase
    .from("products")
    .select("category, subcategory");

  if (error) {
    console.error("Category load failed:", error);
    return new Map();
  }

  const catMap = new Map();

  data.forEach((row) => {
    const cat = row.category?.trim() || "";
    const sub = row.subcategory?.trim() || "";

    if (!cat) return;

    if (!catMap.has(cat)) catMap.set(cat, new Set());
    if (sub) catMap.get(cat).add(sub);
  });

  return catMap;
}

// ----------------------------------------
// Handle category click
// ----------------------------------------

function handleCategoryClick(category, subcategory = null) {
  // Update desktop active state
  if (desktopBar) {
    desktopBar.querySelectorAll(".sr-cat-pill").forEach((pill) => {
      const cat = pill.dataset.cat || "";
      const sub = pill.dataset.sub || "";

      let active = false;

      if (!category && cat === "all") active = true;
      if (category && !subcategory && cat === category && !sub) active = true;
      if (category && subcategory && cat === category && sub === subcategory)
        active = true;

      pill.classList.toggle("active", active);
    });
  }

  // Notify main page
  if (typeof window.handleCategoryChange === "function") {
    window.handleCategoryChange({ category, subcategory });
  }

  // Mobile drawer closing
  if (window.innerWidth <= 900) closeDrawer();
}

// ----------------------------------------
// Build UI (Desktop + Mobile)
// ----------------------------------------

function buildUI(catMap) {
  if (desktopBar) desktopBar.innerHTML = "";
  if (drawerCats) drawerCats.innerHTML = "";

  // Convert map to sorted array
  const entries = Array.from(catMap.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  // ------------------------------------
  // "All" pill + drawer entry
  // ------------------------------------

  // Desktop "All"
  if (desktopBar) {
    const all = document.createElement("button");
    all.className = "sr-cat-pill active";
    all.dataset.cat = "all";
    all.textContent = "All";
    all.addEventListener("click", () => handleCategoryClick(null, null));
    desktopBar.appendChild(all);
  }

  // Mobile "All"
  if (drawerCats) {
    const allMobile = document.createElement("div");
    allMobile.className = "sr-cat-parent";
    allMobile.innerHTML = `<span>All products</span>`;
    allMobile.addEventListener("click", () => handleCategoryClick(null, null));
    drawerCats.appendChild(allMobile);
  }

  // ------------------------------------
  // LIMIT = EXACTLY 8 visible categories
  // ------------------------------------
  const VISIBLE_LIMIT = 8;

  const visibleCategories = entries.slice(0, VISIBLE_LIMIT);
  const extraCategories = entries.slice(VISIBLE_LIMIT);

  // ------------------------------------
  // DESKTOP: Build visible categories
  // ------------------------------------
  visibleCategories.forEach(([category, subSet]) => {
    const pillWrap = document.createElement("div");
    pillWrap.className = "sr-cat-pill-wrap";

    const pill = document.createElement("button");
    pill.className = "sr-cat-pill";
    pill.dataset.cat = category;
    pill.textContent = category;

    pill.addEventListener("click", () => handleCategoryClick(category, null));
    pillWrap.appendChild(pill);

    // Dropdown for subcategories
    if (subSet.size > 0) {
      const drop = document.createElement("div");
      drop.className = "sr-cat-dropdown";

      // "All in category"
      const allBtn = document.createElement("button");
      allBtn.className = "sr-cat-drop-item";
      allBtn.textContent = `All in ${category}`;
      allBtn.addEventListener("click", () =>
        handleCategoryClick(category, null)
      );
      drop.appendChild(allBtn);

      // Subcategories
      subSet.forEach((sub) => {
        const btn = document.createElement("button");
        btn.className = "sr-cat-drop-item";
        btn.textContent = sub;
        btn.dataset.sub = sub;
        btn.addEventListener("click", () =>
          handleCategoryClick(category, sub)
        );
        drop.appendChild(btn);
      });

      pillWrap.appendChild(drop);
    }

    desktopBar.appendChild(pillWrap);
  });

  // ------------------------------------
  // DESKTOP: MORE CATEGORY
  // ------------------------------------
  if (extraCategories.length > 0) {
    const moreWrap = document.createElement("div");
    moreWrap.className = "sr-cat-pill-wrap";

    const morePill = document.createElement("button");
    morePill.className = "sr-cat-pill";
    morePill.dataset.cat = "more";
    morePill.textContent = "More";
    moreWrap.appendChild(morePill);

    const drop = document.createElement("div");
    drop.className = "sr-cat-dropdown";

    extraCategories.forEach(([category, subSet]) => {
      // Category name inside "More"
      const catBtn = document.createElement("button");
      catBtn.className = "sr-cat-drop-item";
      catBtn.textContent = category;
      catBtn.addEventListener("click", () =>
        handleCategoryClick(category, null)
      );
      drop.appendChild(catBtn);

      // Subcategories
      subSet.forEach((sub) => {
        const subBtn = document.createElement("button");
        subBtn.className = "sr-cat-drop-item";
        subBtn.textContent = `— ${sub}`;
        subBtn.addEventListener("click", () =>
          handleCategoryClick(category, sub)
        );
        drop.appendChild(subBtn);
      });
    });

    moreWrap.appendChild(drop);
    desktopBar.appendChild(moreWrap);
  }

  // ------------------------------------
  // MOBILE / TABLET drawer
  // ------------------------------------

  entries.forEach(([category, subSet]) => {
    const parent = document.createElement("div");
    parent.className = "sr-cat-parent";
    parent.innerHTML = `<span>${category}</span><span>▸</span>`;

    const subList = document.createElement("div");
    subList.className = "sr-sublist";

    subSet.forEach((sub) => {
      const s = document.createElement("div");
      s.className = "sr-cat-sub";
      s.textContent = sub;
      s.addEventListener("click", () => handleCategoryClick(category, sub));
      subList.appendChild(s);
    });

    // Expand/collapse
    parent.addEventListener("click", () => {
      const open = subList.classList.toggle("open");
      parent.querySelector("span:last-child").textContent = open ? "▾" : "▸";
    });

    drawerCats.appendChild(parent);
    drawerCats.appendChild(subList);
  });
}

// ----------------------------------------
// Initialize
// ----------------------------------------

(async function init() {
  try {
    const map = await fetchCategoryData();
    buildUI(map);
  } catch (e) {
    console.error("Category init failed:", e);
  }
})();
