// /js/marketplace-cats.js
// FINAL VERSION — MP SYSTEM
// A1 = Full width
// B1 = Hover dropdown
// C1 = Show EXACTLY 8 categories, rest → More
// Works with mp-* HTML + CSS (marketplace.html + marketplace.css)

import { supabase } from "./auth.js";

/* ===============================
   ELEMENT REFERENCES (MP)
=============================== */

// Desktop category bar
const desktopBar = document.getElementById("mp-cat-bar-inner");

// Mobile drawer
const drawer = document.getElementById("mp-cat-drawer");
const drawerCats = document.getElementById("mp-cat-drawer-body");
const backdrop = document.getElementById("mp-cat-backdrop");

// Buttons
const btnOpen = document.getElementById("mp-cat-toggle");
const btnClose = document.getElementById("mp-cat-close");

/* ===============================
   DRAWER OPEN / CLOSE
=============================== */

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

if (btnOpen) btnOpen.addEventListener("click", openDrawer);
if (btnClose) btnClose.addEventListener("click", closeDrawer);
if (backdrop) backdrop.addEventListener("click", closeDrawer);

/* ===============================
   FETCH CATEGORIES
=============================== */

async function fetchCategoryData() {
  const { data, error } = await supabase
    .from("products")
    .select("category, subcategory");

  if (error) {
    console.error("Category load failed:", error);
    return new Map();
  }

  const map = new Map();

  data.forEach((row) => {
    const cat = row.category?.trim();
    const sub = row.subcategory?.trim();

    if (!cat) return;
    if (!map.has(cat)) map.set(cat, new Set());
    if (sub) map.get(cat).add(sub);
  });

  return map;
}

/* ===============================
   CATEGORY CLICK HANDLER
=============================== */

function handleCategoryClick(category, subcategory = null) {
  // Desktop active state
  if (desktopBar) {
    desktopBar.querySelectorAll(".mp-cat-pill").forEach((pill) => {
      const cat = pill.dataset.cat || "";
      const sub = pill.dataset.sub || "";

      let active = false;
      if (!category && cat === "all") active = true;
      if (category && !subcategory && cat === category && !sub) active = true;
      if (category && subcategory && cat === category && sub === subcategory)
        active = true;

      pill.classList.toggle("is-active", active);
    });
  }

  // Notify marketplace.js
  if (typeof window.handleCategoryChange === "function") {
    window.handleCategoryChange({ category, subcategory });
  }

  // Close drawer on mobile
  if (window.innerWidth <= 900) closeDrawer();
}

/* ===============================
   BUILD UI
=============================== */

function buildUI(map) {
  if (desktopBar) desktopBar.innerHTML = "";
  if (drawerCats) drawerCats.innerHTML = "";

  const entries = Array.from(map.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  /* ---------- ALL ---------- */

  // Desktop "All"
  if (desktopBar) {
    const all = document.createElement("button");
    all.className = "mp-cat-pill is-active";
    all.dataset.cat = "all";
    all.textContent = "All";
    all.onclick = () => handleCategoryClick(null, null);
    desktopBar.appendChild(all);
  }

  // Mobile "All"
  if (drawerCats) {
    const allMobile = document.createElement("button");
    allMobile.className = "mp-cat-parent";
    allMobile.innerHTML = `<span>All products</span>`;
    allMobile.onclick = () => handleCategoryClick(null, null);
    drawerCats.appendChild(allMobile);
  }

  /* ---------- LIMIT ---------- */

  const LIMIT = 8;
  const visible = entries.slice(0, LIMIT);
  const extra = entries.slice(LIMIT);

  /* ---------- DESKTOP MAIN ---------- */

  visible.forEach(([category, subs]) => {
    const wrap = document.createElement("div");
    wrap.className = "mp-cat-pill-wrap";

    const pill = document.createElement("button");
    pill.className = "mp-cat-pill";
    pill.dataset.cat = category;
    pill.textContent = category;
    pill.onclick = () => handleCategoryClick(category, null);
    wrap.appendChild(pill);

    if (subs.size) {
      const drop = document.createElement("div");
      drop.className = "mp-cat-dropdown";

      const allBtn = document.createElement("button");
      allBtn.className = "mp-cat-drop-item";
      allBtn.textContent = `All in ${category}`;
      allBtn.onclick = () => handleCategoryClick(category, null);
      drop.appendChild(allBtn);

      subs.forEach((sub) => {
        const b = document.createElement("button");
        b.className = "mp-cat-drop-item";
        b.dataset.sub = sub;
        b.textContent = sub;
        b.onclick = () => handleCategoryClick(category, sub);
        drop.appendChild(b);
      });

      wrap.appendChild(drop);
    }

    desktopBar.appendChild(wrap);
  });

  /* ---------- DESKTOP MORE ---------- */

  if (extra.length) {
    const wrap = document.createElement("div");
    wrap.className = "mp-cat-pill-wrap";

    const pill = document.createElement("button");
    pill.className = "mp-cat-pill";
    pill.textContent = "More";
    wrap.appendChild(pill);

    const drop = document.createElement("div");
    drop.className = "mp-cat-dropdown";

    extra.forEach(([category, subs]) => {
      const catBtn = document.createElement("button");
      catBtn.className = "mp-cat-drop-item";
      catBtn.textContent = category;
      catBtn.onclick = () => handleCategoryClick(category, null);
      drop.appendChild(catBtn);

      subs.forEach((sub) => {
        const sb = document.createElement("button");
        sb.className = "mp-cat-drop-item";
        sb.textContent = `— ${sub}`;
        sb.onclick = () => handleCategoryClick(category, sub);
        drop.appendChild(sb);
      });
    });

    wrap.appendChild(drop);
    desktopBar.appendChild(wrap);
  }

  /* ---------- MOBILE DRAWER ---------- */

  entries.forEach(([category, subs]) => {
    const parent = document.createElement("button");
    parent.className = "mp-cat-parent";
    parent.innerHTML = `<span>${category}</span><span>▸</span>`;

    const subList = document.createElement("div");
    subList.className = "mp-cat-sublist";

    subs.forEach((sub) => {
      const s = document.createElement("button");
      s.className = "mp-cat-sub";
      s.textContent = sub;
      s.onclick = () => handleCategoryClick(category, sub);
      subList.appendChild(s);
    });

    parent.onclick = () => {
      const open = subList.classList.toggle("is-open");
      parent.querySelector("span:last-child").textContent = open ? "▾" : "▸";
    };

    drawerCats.appendChild(parent);
    drawerCats.appendChild(subList);
  });
}

/* ===============================
   INIT
=============================== */

(async function init() {
  try {
    const map = await fetchCategoryData();
    buildUI(map);
  } catch (e) {
    console.error("Category init failed:", e);
  }
})();
