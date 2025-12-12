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

// ---------- fetchCategoriesWithSubs from Supabase ----------

async function fetchCategoriesWithSubs() {
  const { data, error } = await supabase
    .from("categories")
    .select(
      `id, slug, name, sort_order,
      subcategories:subcategories (id, category_id, slug, name, sort_order)`
    )
    .order("sort_order", { ascending: true, nulls: "last" })
    .order("name", { ascending: true })
    .order("subcategories.sort_order", { ascending: true, nulls: "last" })
    .order("subcategories.name", { ascending: true });

  if (error) {
    console.error("Failed to load categories", error);
    return [];
  }

  return (data || []).map((cat) => ({
    ...cat,
    subcategories: (cat.subcategories || []).filter(Boolean),
  }));
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

// ----------  ----------

function renderDesktop(categories, onClick) {
  const container = document.getElementById("mp-cat-bar-inner");
  if (!container) {
    console.error("Category bar container not found; cannot render categories");
    return;
  }
  container.innerHTML = "";

  const allWrap = document.createElement("div");
  allWrap.className = "mp-cat-pill-wrap";
  const allBtn = document.createElement("button");
  allBtn.className = "mp-cat-pill is-active";
  allBtn.dataset.cat = "";
  allBtn.textContent = "All";
  allBtn.addEventListener("click", () => onClick(null, null));
  allWrap.appendChild(allBtn);
  container.appendChild(allWrap);

  const { shown, overflow } = sliceForDesktop(categories);
  shown.forEach((cat) => container.appendChild(makePill(cat, onClick)));

  if (overflow.length) {
    const moreWrap = document.createElement("div");
    moreWrap.className = "mp-cat-pill-wrap mp-cat-more";
    const moreBtn = document.createElement("button");
    moreBtn.className = "mp-cat-pill";
    moreBtn.textContent = "More";
    moreWrap.appendChild(moreBtn);

    const dropdown = document.createElement("div");
    dropdown.className = "mp-cat-dropdown";
    overflow.forEach((cat) => {
      const btn = document.createElement("button");
      btn.className = "mp-cat-drop-item";
      btn.textContent = cat.name;
      btn.addEventListener("click", () => onClick(cat, null));
      dropdown.appendChild(btn);
    });
    moreWrap.appendChild(dropdown);
    container.appendChild(moreWrap);
  }

  if (!categories.length) {
    const note = document.createElement("div");
    note.className = "mp-cat-empty";
    note.textContent = "Categories are unavailable right now.";
    container.appendChild(note);
  }
}

function renderDrawer(categories, onClick) {
  const main = document.getElementById("mp-cat-drawer-main");
  const subView = document.getElementById("mp-cat-drawer-sub");
  const subList = document.getElementById("mp-cat-drawer-sublist");
  const subTitle = document.getElementById("mp-cat-subtitle");
  const back = document.getElementById("mp-cat-back");
  if (!main || !subView || !subList || !subTitle || !back) {
    console.error("Category drawer containers missing; cannot render drawer navigation");
    return;
  }

  main.innerHTML = "";
  subList.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.className = "mp-cat-parent";
  allBtn.innerHTML = `<span>All</span><span>▸</span>`;
  allBtn.addEventListener("click", () => onClick(null, null));
  main.appendChild(allBtn);

  categories.forEach((cat) => {
    const parent = document.createElement("button");
    parent.className = "mp-cat-parent";
    parent.dataset.cat = cat.slug;
    parent.innerHTML = `<span>${cat.name}</span><span>▸</span>`;
    parent.addEventListener("click", () => {
      main.setAttribute("hidden", "hidden");
      subView.removeAttribute("hidden");
      subTitle.textContent = cat.name;
      subList.innerHTML = "";

      const allInCat = document.createElement("button");
      allInCat.className = "mp-cat-sub";
      allInCat.dataset.cat = cat.slug;
      allInCat.textContent = `All in ${cat.name}`;
      allInCat.addEventListener("click", () => onClick(cat, null));
      subList.appendChild(allInCat);

      (cat.subcategories || []).forEach((sub) => {
        const subBtn = document.createElement("button");
        subBtn.className = "mp-cat-sub";
        subBtn.dataset.cat = cat.slug;
        subBtn.dataset.sub = sub.slug;
        subBtn.textContent = sub.name;
        subBtn.addEventListener("click", () => onClick(cat, sub));
        subList.appendChild(subBtn);
      });
    });
    main.appendChild(parent);
  });

  back.addEventListener("click", () => {
    subView.setAttribute("hidden", "hidden");
    main.removeAttribute("hidden");
  });
}

function syncActiveState(category, subcategory) {
  const pills = document.querySelectorAll(".mp-cat-pill, .mp-cat-drop-item, .mp-cat-sub, .mp-cat-parent");
  pills.forEach((el) => {
    const cat = el.dataset.cat || el.dataset.category || "";
    const sub = el.dataset.sub || "";
    const active =
      (!category && !sub) ||
      (cat === category && !subcategory && !sub) ||
      (cat === category && sub === subcategory);
    if (active) el.classList.add("is-active");
    else el.classList.remove("is-active");
  });
}

function handleCategoryClick(onChange, catObj, subObj) {
  const payload = {
    category: catObj ? catObj.slug : null,
    categoryName: catObj ? catObj.name : null,
    subcategory: subObj ? subObj.slug : null,
    subcategoryName: subObj ? subObj.name : null,
  };
  onChange(payload);
  syncActiveState(payload.category, payload.subcategory);
}

async function initCategories() {
  await waitForHeader();
  const grouped = await fetchCategoriesWithSubs();
  if (!grouped.length) {
    console.error("Category init failed: no categories returned from Supabase");
  }

  const onChange = (payload) => {
    if (typeof window.handleCategoryChange === "function") {
      window.handleCategoryChange(payload);
    } else {
      console.warn("handleCategoryChange not defined");
    }
    document.dispatchEvent(new CustomEvent("sr:category-change", { detail: payload }));
    document.getElementById("mp-cat-drawer")?.classList.remove("is-open");
    document.getElementById("mp-cat-backdrop")?.classList.remove("is-open");
  };

  renderDesktop(grouped, (cat, sub) => handleCategoryClick(onChange, cat, sub));
  renderDrawer(grouped, (cat, sub) => handleCategoryClick(onChange, cat, sub));

  const params = new URLSearchParams(window.location.search);
  const cat = params.get("category") || null;
  const sub = params.get("sub") || params.get("subcategory") || null;
  syncActiveState(cat, sub);
}

initCategories().catch((err) => console.error("Category init failed", err));
  }
})();
