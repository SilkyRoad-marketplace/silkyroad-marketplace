// /js/marketplace-cats.js
// Builds desktop category bar + mobile drawer from Supabase "products" table

import { supabase } from "./auth.js"; // reuse same client as auth

const desktopBar = document.getElementById("mp-cat-bar-inner");
const drawerBody = document.getElementById("mp-cat-drawer-body");
const drawer = document.getElementById("mp-cat-drawer");
const backdrop = document.getElementById("mp-cat-backdrop");
const btnToggle = document.getElementById("mp-cat-toggle");
const btnClose = document.getElementById("mp-cat-close");

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

if (btnToggle) {
  btnToggle.addEventListener("click", openDrawer);
}
if (btnClose) {
  btnClose.addEventListener("click", closeDrawer);
}
if (backdrop) {
  backdrop.addEventListener("click", closeDrawer);
}

// ---------- Build category map from Supabase ----------

async function fetchCategoryMap() {
  // assumes table "products" with columns "category" and "subcategory"
  const { data, error } = await supabase
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

// ---------- Handle click (desktop & mobile) ----------

function handleCategoryClick(category, subcategory = null) {
  // Update active state in desktop pills
  if (desktopBar) {
    desktopBar.querySelectorAll(".mp-cat-pill").forEach((btn) => {
      const cat = btn.dataset.cat || "";
      const sub = btn.dataset.sub || "";
      const isActive =
        (category === null && cat === "all") ||
        (category && !subcategory && cat === category && !sub) ||
        (category && subcategory && cat === category && sub === subcategory);

      btn.classList.toggle("is-active", isActive);
    });
  }

  // Notify main code to filter products
  if (typeof window.handleCategoryChange === "function") {
    window.handleCategoryChange({ category, subcategory });
  } else {
    console.log("Category selected:", category, subcategory);
  }

  // On mobile, close drawer after selection
  if (window.innerWidth <= 900) {
    closeDrawer();
  }
}

// ---------- Render desktop bar + mobile drawer ----------

function buildUI(categoryMap) {
  if (desktopBar) desktopBar.innerHTML = "";
  if (drawerBody) drawerBody.innerHTML = "";

  // ---- DESKTOP "ALL" pill ----
  if (desktopBar) {
    const wrap = document.createElement("div");
    wrap.className = "mp-cat-pill-wrap";

    const allBtn = document.createElement("button");
    allBtn.className = "mp-cat-pill is-active";
    allBtn.textContent = "All";
    allBtn.dataset.cat = "all";
    allBtn.addEventListener("click", () => handleCategoryClick(null, null));

    wrap.appendChild(allBtn);
    desktopBar.appendChild(wrap);
  }

  // ---- MOBILE drawer top section title + "All" ----
  if (drawerBody) {
    const title = document.createElement("div");
    title.className = "mp-cat-section-title";
    title.textContent = "Browse";
    drawerBody.appendChild(title);

    const allBtnMobile = document.createElement("button");
    allBtnMobile.className = "mp-cat-parent";
    allBtnMobile.innerHTML = `<span>All products</span>`;
    allBtnMobile.addEventListener("click", () => handleCategoryClick(null, null));
    drawerBody.appendChild(allBtnMobile);
  }

  // Convert map to array so we can loop in a stable order
  const entries = Array.from(categoryMap.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  for (const [category, subSet] of entries) {
    // ---- DESKTOP pill + dropdown ----
    if (desktopBar) {
      const wrap = document.createElement("div");
      wrap.className = "mp-cat-pill-wrap";

      const pill = document.createElement("button");
      pill.className = "mp-cat-pill";
      pill.dataset.cat = category;
      pill.textContent = category;
      pill.addEventListener("click", () => handleCategoryClick(category, null));
      wrap.appendChild(pill);

      if (subSet.size) {
        const dropdown = document.createElement("div");
        dropdown.className = "mp-cat-dropdown";

        // First item: All in this category
        const allSub = document.createElement("button");
        allSub.className = "mp-cat-drop-item";
        allSub.textContent = `All in ${category}`;
        allSub.dataset.cat = category;
        allSub.addEventListener("click", () =>
          handleCategoryClick(category, null)
        );
        dropdown.appendChild(allSub);

        // Then each subcategory
        subSet.forEach((sub) => {
          const subBtn = document.createElement("button");
          subBtn.className = "mp-cat-drop-item";
          subBtn.textContent = sub;
          subBtn.dataset.cat = category;
          subBtn.dataset.sub = sub;
          subBtn.addEventListener("click", () =>
            handleCategoryClick(category, sub)
          );
          dropdown.appendChild(subBtn);
        });

        wrap.appendChild(dropdown);
      }

      desktopBar.appendChild(wrap);
    }

    // ---- MOBILE accordion ----
    if (!drawerBody) continue;

    const parentBtn = document.createElement("button");
    parentBtn.className = "mp-cat-parent";
    parentBtn.innerHTML = `<span>${category}</span><span>▸</span>`;

    const sublist = document.createElement("div");
    sublist.className = "mp-cat-sublist";

    if (subSet.size) {
      subSet.forEach((sub) => {
        const sbtn = document.createElement("button");
        sbtn.className = "mp-cat-sub";
        sbtn.textContent = sub;
        sbtn.addEventListener("click", () =>
          handleCategoryClick(category, sub)
        );
        sublist.appendChild(sbtn);
      });
    }

    // expand / collapse
    parentBtn.addEventListener("click", () => {
      const open = sublist.classList.toggle("is-open");
      const arrow = parentBtn.querySelector("span:last-child");
      if (arrow) arrow.textContent = open ? "▾" : "▸";
    });

    drawerBody.appendChild(parentBtn);
    drawerBody.appendChild(sublist);
  }
}

// ---------- Init ----------

(async function initCategories() {
  try {
    const map = await fetchCategoryMap();
    buildUI(map);
  } catch (e) {
    console.error("Error initialising categories:", e);
  }
})();
