// /js/marketplace-cats.js
// Builds desktop category bar + mobile drawer from Supabase "products" table

// Supabase CDN is loaded in marketplace.html so global "supabase" exists.
const { createClient } = supabase;

// Use same project as auth.js
const SUPABASE_URL = "https://paqvgsruppgadgguynde.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhcXZnc3J1cHBnYWRnZ3V5bmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNTg3NTMsImV4cCI6MjA3NzkzNDc1M30.pwEE4WLFu2-tHkmH1fFYYwcEPmLPyavN7ykXdPGQ3AY";

const client = createClient(SUPABASE_URL, SUPABASE_ANON);

// DOM refs
const desktopBar  = document.getElementById("mp-cat-bar-inner");
const drawerBody  = document.getElementById("mp-cat-drawer-body");
const drawer      = document.getElementById("mp-cat-drawer");
const backdrop    = document.getElementById("mp-cat-backdrop");
const btnToggle   = document.getElementById("mp-cat-toggle");
const btnClose    = document.getElementById("mp-cat-close");

// ---------- Drawer open / close ----------

function openDrawer() {
  if (!drawer || !backdrop) return;
  drawer.classList.add("is-open");
  backdrop.classList.add("is-open");
}

function closeDrawer() {
  if (!drawer || !backdrop) return;
  drawer.classList.remove("is-open");
  backdrop.classList.remove("is-open");
}

if (btnToggle) btnToggle.addEventListener("click", openDrawer);
if (btnClose)  btnClose.addEventListener("click", closeDrawer);
if (backdrop)  backdrop.addEventListener("click", closeDrawer);

// ---------- Fetch category map from Supabase ----------

async function fetchCategoryMap() {
  // assumes table "products" with columns "category" and "subcategory"
  const { data, error } = await client
    .from("products")
    .select("category, subcategory");

  if (error) {
    console.error("Failed to load categories:", error);
    return new Map();
  }

  const map = new Map(); // category -> Set(subcats)

  data.forEach((row) => {
    const cat = row.category ? String(row.category).trim() : "";
    const sub = row.subcategory ? String(row.subcategory).trim() : "";
    if (!cat) return;

    if (!map.has(cat)) map.set(cat, new Set());
    if (sub) map.get(cat).add(sub);
  });

  return map;
}

// ---------- Interaction with product list ----------

function handleCategoryClick(category, subcategory = null) {
  // Update label over featured grid
  const labelEl = document.getElementById("mp-current-cat-label");
  if (labelEl) {
    if (!category && !subcategory) {
      labelEl.textContent = "Showing: All categories";
    } else if (category && !subcategory) {
      labelEl.textContent = `Showing: ${category}`;
    } else {
      labelEl.textContent = `Showing: ${category} › ${subcategory}`;
    }
  }

  // Update active state in desktop pills
  if (desktopBar) {
    desktopBar.querySelectorAll(".mp-cat-pill").forEach((btn) => {
      const btnCat = btn.dataset.cat || "";
      const isAll  = btnCat === "all" && !category && !subcategory;
      const match  = btnCat === category && !subcategory;
      btn.classList.toggle("is-active", isAll || match);
    });
  }

  // Notify marketplace.js (if it defines this hook)
  if (typeof window.handleCategoryChange === "function") {
    window.handleCategoryChange({ category, subcategory });
  } else {
    console.log("Category selected:", category, subcategory);
  }

  // On mobile, close drawer when a subcategory is picked
  if (window.innerWidth <= 900) {
    closeDrawer();
  }
}

// ---------- Build desktop bar + mobile drawer ----------

function buildUI(categoryMap) {
  if (desktopBar) desktopBar.innerHTML = "";
  if (drawerBody) drawerBody.innerHTML = "";

  // Desktop "All" pill
  if (desktopBar) {
    const allBtn = document.createElement("button");
    allBtn.className = "mp-cat-pill is-active";
    allBtn.textContent = "All";
    allBtn.dataset.cat = "all";
    allBtn.addEventListener("click", () => handleCategoryClick(null, null));
    desktopBar.appendChild(allBtn);
  }

  // Drawer "Browse" title + "All products"
  if (drawerBody) {
    const title = document.createElement("div");
    title.className = "mp-cat-section-title";
    title.textContent = "Browse";
    drawerBody.appendChild(title);

    const allBtnMobile = document.createElement("button");
    allBtnMobile.className = "mp-cat-parent";
    allBtnMobile.innerHTML = "<span>All products</span>";
    allBtnMobile.addEventListener("click", () => handleCategoryClick(null, null));
    drawerBody.appendChild(allBtnMobile);
  }

  // Each category
  for (const [category, subSet] of categoryMap.entries()) {
    // Desktop pill
    if (desktopBar) {
      const pill = document.createElement("button");
      pill.className = "mp-cat-pill";
      pill.dataset.cat = category;
      pill.textContent = category;
      pill.addEventListener("click", () => handleCategoryClick(category, null));
      desktopBar.appendChild(pill);
    }

    // Mobile accordion
    if (!drawerBody) continue;

    const parentBtn = document.createElement("button");
    parentBtn.className = "mp-cat-parent";
    parentBtn.innerHTML = `<span>${category}</span><span>▸</span>`;

    const sublist = document.createElement("div");
    sublist.className = "mp-cat-sublist";

    if (subSet.size) {
      subSet.forEach((sub) => {
        const subBtn = document.createElement("button");
        subBtn.className = "mp-cat-sub";
        subBtn.textContent = sub;
        subBtn.addEventListener("click", () =>
          handleCategoryClick(category, sub)
        );
        sublist.appendChild(subBtn);
      });
    }

    parentBtn.addEventListener("click", () => {
      const open = sublist.classList.toggle("is-open");
      const arrow = parentBtn.querySelector("span:last-child");
      if (arrow) arrow.textContent = open ? "▾" : "▸";
    });

    drawerBody.appendChild(parentBtn);
    drawerBody.appendChild(sublist);
  }
}

// ---------- Init on load ----------

(async function initCategories() {
  try {
    const map = await fetchCategoryMap();
    buildUI(map);
  } catch (e) {
    console.error("Error initialising categories:", e);
  }
})();
