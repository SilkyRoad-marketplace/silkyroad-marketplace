// /js/marketplace-cats.js  (MP ONLY)
// A1 = full width (CSS handles)
// B1 = hover dropdown (desktop)
// C1 = exactly 8 categories then "More"
// Mobile = left drawer + Go Back (2-level)

import { supabase } from "./supabaseClient.js";

const VISIBLE_LIMIT = 8;

// Desktop
const desktopInner = document.getElementById("mp-cat-bar-inner");

// Mobile drawer
const drawer = document.getElementById("mp-cat-drawer");
const drawerBody = document.getElementById("mp-cat-drawer-body");
const backdrop = document.getElementById("mp-cat-backdrop");
const btnOpen = document.getElementById("mp-cat-toggle");
const btnClose = document.getElementById("mp-cat-close");

// ----------------------
// Drawer open/close
// ----------------------
function openDrawer() {
  if (!drawer || !backdrop) return;
  drawer.classList.add("is-open");
  backdrop.classList.add("is-active");
}
function closeDrawer() {
  if (!drawer || !backdrop) return;
  drawer.classList.remove("is-open");
  backdrop.classList.remove("is-active");
}

if (btnOpen) btnOpen.addEventListener("click", openDrawer);
if (btnClose) btnClose.addEventListener("click", closeDrawer);
if (backdrop) backdrop.addEventListener("click", closeDrawer);

// ----------------------
// Fetch categories from Supabase products
// ----------------------
async function fetchCategoryMap() {
  const { data, error } = await supabase
    .from("products")
    .select("category, subcategory");

  if (error) {
    console.error("Category load failed:", error);
    return new Map();
  }

  const map = new Map();
  for (const row of data || []) {
    const cat = (row.category || "").trim();
    const sub = (row.subcategory || "").trim();
    if (!cat) continue;

    if (!map.has(cat)) map.set(cat, new Set());
    if (sub) map.get(cat).add(sub);
  }
  return map;
}

// ----------------------
// Notify marketplace.js
// ----------------------
function emitChange(category, subcategory = null) {
  if (typeof window.handleCategoryChange === "function") {
    window.handleCategoryChange({ category, subcategory });
  }
  // close on mobile
  if (window.innerWidth <= 900) closeDrawer();
}

// ----------------------
// Desktop UI (All + 8 + More)
// ----------------------
function buildDesktop(catMap) {
  if (!desktopInner) return;
  desktopInner.innerHTML = "";

  const entries = Array.from(catMap.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  // All pill
  const allBtn = document.createElement("button");
  allBtn.className = "mp-cat-pill active";
  allBtn.textContent = "All";
  allBtn.dataset.cat = "all";
  allBtn.addEventListener("click", () => setActiveDesktop(null, null, true));
  desktopInner.appendChild(allBtn);

  const visible = entries.slice(0, VISIBLE_LIMIT);
  const extra = entries.slice(VISIBLE_LIMIT);

  for (const [category, subSet] of visible) {
    desktopInner.appendChild(makeDesktopPill(category, subSet));
  }

  if (extra.length) {
    const wrap = document.createElement("div");
    wrap.className = "mp-cat-pill-wrap";

    const pill = document.createElement("button");
    pill.className = "mp-cat-pill";
    pill.textContent = "More";
    pill.dataset.cat = "more";
    wrap.appendChild(pill);

    const drop = document.createElement("div");
    drop.className = "mp-cat-dropdown";

    for (const [category, subSet] of extra) {
      const catBtn = document.createElement("button");
      catBtn.className = "mp-cat-drop-item";
      catBtn.textContent = category;
      catBtn.addEventListener("click", () => {
        setActiveDesktop(category, null, false);
        emitChange(category, null);
      });
      drop.appendChild(catBtn);

      for (const sub of Array.from(subSet).sort((a, b) => a.localeCompare(b))) {
        const subBtn = document.createElement("button");
        subBtn.className = "mp-cat-drop-item";
        subBtn.textContent = `— ${sub}`;
        subBtn.addEventListener("click", () => {
          setActiveDesktop(category, sub, false);
          emitChange(category, sub);
        });
        drop.appendChild(subBtn);
      }
    }

    wrap.appendChild(drop);
    desktopInner.appendChild(wrap);
  }

  function makeDesktopPill(category, subSet) {
    const wrap = document.createElement("div");
    wrap.className = "mp-cat-pill-wrap";

    const pill = document.createElement("button");
    pill.className = "mp-cat-pill";
    pill.textContent = category;
    pill.dataset.cat = category;

    pill.addEventListener("click", () => {
      setActiveDesktop(category, null, false);
      emitChange(category, null);
    });

    wrap.appendChild(pill);

    if (subSet && subSet.size) {
      const drop = document.createElement("div");
      drop.className = "mp-cat-dropdown";

      const allIn = document.createElement("button");
      allIn.className = "mp-cat-drop-item";
      allIn.textContent = `All ${category}`;
      allIn.addEventListener("click", () => {
        setActiveDesktop(category, null, false);
        emitChange(category, null);
      });
      drop.appendChild(allIn);

      for (const sub of Array.from(subSet).sort((a, b) => a.localeCompare(b))) {
        const btn = document.createElement("button");
        btn.className = "mp-cat-drop-item";
        btn.textContent = sub;
        btn.addEventListener("click", () => {
          setActiveDesktop(category, sub, false);
          emitChange(category, sub);
        });
        drop.appendChild(btn);
      }

      wrap.appendChild(drop);
    }

    return wrap;
  }

  function setActiveDesktop(category, subcategory, isAll) {
    if (!desktopInner) return;

    // clear active
    desktopInner.querySelectorAll(".mp-cat-pill").forEach((x) =>
      x.classList.remove("active")
    );

    // set active
    if (isAll) {
      desktopInner.querySelector('.mp-cat-pill[data-cat="all"]')?.classList.add("active");
      emitChange(null, null);
      return;
    }

    // try match a visible pill
    const exact = desktopInner.querySelector(`.mp-cat-pill[data-cat="${CSS.escape(category)}"]`);
    if (exact) exact.classList.add("active");
    else {
      // If it is under More, highlight More
      desktopInner.querySelector('.mp-cat-pill[data-cat="more"]')?.classList.add("active");
    }
  }
}

// ----------------------
// Mobile Drawer UI (Go Back stack)
// ----------------------
function buildDrawer(catMap) {
  if (!drawerBody) return;
  drawerBody.innerHTML = "";

  const entries = Array.from(catMap.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  // stack screens
  const stack = [];

  function renderRoot() {
    drawerBody.innerHTML = "";

    // All
    const all = document.createElement("button");
    all.className = "mp-drawer-item";
    all.textContent = "All";
    all.addEventListener("click", () => emitChange(null, null));
    drawerBody.appendChild(all);

    for (const [category, subSet] of entries) {
      const row = document.createElement("button");
      row.className = "mp-drawer-item mp-drawer-parent";
      row.innerHTML = `<span>${category}</span><span class="mp-drawer-arrow">›</span>`;

      row.addEventListener("click", () => {
        stack.push({ type: "root" });
        renderSub(category, subSet);
      });

      drawerBody.appendChild(row);
    }
  }

  function renderSub(category, subSet) {
    drawerBody.innerHTML = "";

    // Go back
    const back = document.createElement("button");
    back.className = "mp-drawer-back";
    back.innerHTML = `‹ <span>Go Back</span>`;
    back.addEventListener("click", () => {
      stack.pop();
      renderRoot();
    });
    drawerBody.appendChild(back);

    // All in category
    const allIn = document.createElement("button");
    allIn.className = "mp-drawer-item";
    allIn.textContent = `All ${category}`;
    allIn.addEventListener("click", () => emitChange(category, null));
    drawerBody.appendChild(allIn);

    const subs = Array.from(subSet || []).sort((a, b) => a.localeCompare(b));
    for (const sub of subs) {
      const row = document.createElement("button");
      row.className = "mp-drawer-item";
      row.textContent = sub;
      row.addEventListener("click", () => emitChange(category, sub));
      drawerBody.appendChild(row);
    }
  }

  renderRoot();
}

// ----------------------
// Init
// ----------------------
(async function init() {
  try {
    const map = await fetchCategoryMap();
    buildDesktop(map);
    buildDrawer(map);
  } catch (e) {
    console.error("Category init failed:", e);
  }
})();
