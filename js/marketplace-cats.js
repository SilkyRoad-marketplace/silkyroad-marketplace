// /js/marketplace-cats.js
// Builds desktop category bar + mobile drawer using sr-* classes

import { supabase } from "./auth.js";

// Desktop bar
const desktopBar = document.getElementById("srDesktopCategoryBar");

// Drawer
const drawer = document.getElementById("srDrawer");
const drawerCats = document.getElementById("srDrawerCategories");
const overlay = document.getElementById("srOverlay");

// Buttons
const btnOpen = document.getElementById("srHamburgerBtn");
const btnClose = document.getElementById("srCloseDrawerBtn");

// ----------------------------------------
// Drawer Logic
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
// Fetch categories + subcategories
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
// Handle Click
// ----------------------------------------

function handleCategoryClick(category, subcategory = null) {
  // Update Pills Active State
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

  // Notify page
  if (typeof window.handleCategoryChange === "function") {
    window.handleCategoryChange({ category, subcategory });
  }

  // Mobile closes drawer
  if (window.innerWidth <= 900) closeDrawer();
}

// ----------------------------------------
// Build UI
// ----------------------------------------

function buildUI(catMap) {
  if (desktopBar) desktopBar.innerHTML = "";
  if (drawerCats) drawerCats.innerHTML = "";

  // -----------------------------
  // DESKTOP: "All"
  // -----------------------------
  if (desktopBar) {
    const all = document.createElement("button");
    all.className = "sr-cat-pill active";
    all.dataset.cat = "all";
    all.textContent = "All";
    all.addEventListener("click", () => handleCategoryClick(null, null));
    desktopBar.appendChild(all);
  }

  // -----------------------------
  // MOBILE: All
  // -----------------------------
  if (drawerCats) {
    const allMobile = document.createElement("div");
    allMobile.className = "sr-drawer-item sr-cat-parent";
    allMobile.innerHTML = `<span>All products</span>`;
    allMobile.addEventListener("click", () => handleCategoryClick(null, null));
    drawerCats.appendChild(allMobile);
  }

  // Sort categories alphabetically
  const entries = Array.from(catMap.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  for (const [category, subSet] of entries) {
    // -----------------------------
    // DESKTOP CATEGORY PILL
    // -----------------------------
    if (desktopBar) {
      const pillWrap = document.createElement("div");
      pillWrap.className = "sr-cat-pill-wrap";

      const pill = document.createElement("button");
      pill.className = "sr-cat-pill";
      pill.dataset.cat = category;
      pill.textContent = category;

      pill.addEventListener("click", () => handleCategoryClick(category, null));
      pillWrap.appendChild(pill);

      // Dropdown
      if (subSet.size > 0) {
        const drop = document.createElement("div");
        drop.className = "sr-cat-dropdown";

        // All in Category
        const allBtn = document.createElement("button");
        allBtn.className = "sr-cat-drop-item";
        allBtn.textContent = `All in ${category}`;
        allBtn.addEventListener("click", () =>
          handleCategoryClick(category, null)
        );
        drop.appendChild(allBtn);

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
    }

    // -----------------------------
    // MOBILE DRAWER CATEGORY LIST
    // -----------------------------
    if (drawerCats) {
      const parent = document.createElement("div");
      parent.className = "sr-drawer-item sr-cat-parent";
      parent.innerHTML = `<span>${category}</span><span>▸</span>`;

      const subList = document.createElement("div");
      subList.className = "sr-sublist";

      subSet.forEach((sub) => {
        const s = document.createElement("div");
        s.className = "sr-drawer-item sr-cat-sub";
        s.textContent = sub;
        s.addEventListener("click", () => handleCategoryClick(category, sub));
        subList.appendChild(s);
      });

      // Expand/Collapse
      parent.addEventListener("click", () => {
        const open = subList.classList.toggle("open");
        parent.querySelector("span:last-child").textContent = open
          ? "▾"
          : "▸";
      });

      drawerCats.appendChild(parent);
      drawerCats.appendChild(subList);
    }
  }
}

// ----------------------------------------
// Init
// ----------------------------------------

(async function init() {
  try {
    const map = await fetchCategoryData();
    buildUI(map);
  } catch (e) {
    console.error("Category init failed:", e);
  }
})();
