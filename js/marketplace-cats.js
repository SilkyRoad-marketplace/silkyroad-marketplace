import { supabase } from "./auth.js";

async function waitForHeader() {
  if (window.srHeaderReady) {
    await window.srHeaderReady;
  }
}

async function fetchCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, sort_order")
    .order("sort_order", { ascending: true, nulls: "last" })
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to load categories", error);
    return [];
  }
  return data || [];
}

async function fetchSubcategories() {
  const { data, error } = await supabase
    .from("subcategories")
    .select("id, category_id, slug, name, sort_order")
    .order("sort_order", { ascending: true, nulls: "last" })
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to load subcategories", error);
    return [];
  }
  return data || [];
}

function groupCategories(categories, subs) {
  const map = new Map();
  categories.forEach((cat) => {
    map.set(cat.id, { ...cat, subcategories: [] });
  });
  subs.forEach((sub) => {
    const parent = map.get(sub.category_id);
    if (parent) parent.subcategories.push(sub);
  });
  return Array.from(map.values());
}

function sliceForDesktop(categories) {
  const shown = [];
  const overflow = [];
  let pastFilms = false;
  categories.forEach((cat) => {
    if (pastFilms) {
      overflow.push(cat);
    } else {
      shown.push(cat);
    }
    if (cat.slug?.toLowerCase() === "films") {
      pastFilms = true;
    }
  });
  return { shown, overflow };
}

function makePill(cat, onClick) {
  const wrap = document.createElement("div");
  wrap.className = "mp-cat-pill-wrap";

  const pill = document.createElement("button");
  pill.className = "mp-cat-pill";
  pill.dataset.cat = cat.slug;
  pill.textContent = cat.name;
  pill.addEventListener("click", () => onClick(cat, null));

  wrap.appendChild(pill);

  if (cat.subcategories?.length) {
    const dropdown = document.createElement("div");
    dropdown.className = "mp-cat-dropdown";

    const allBtn = document.createElement("button");
    allBtn.className = "mp-cat-drop-item";
    allBtn.textContent = `All in ${cat.name}`;
    allBtn.addEventListener("click", () => onClick(cat, null));
    dropdown.appendChild(allBtn);

    cat.subcategories.forEach((sub) => {
      const subBtn = document.createElement("button");
      subBtn.className = "mp-cat-drop-item";
      subBtn.textContent = sub.name;
      subBtn.dataset.sub = sub.slug;
      subBtn.addEventListener("click", () => onClick(cat, sub));
      dropdown.appendChild(subBtn);
    });

    wrap.appendChild(dropdown);
  }

  return wrap;
}

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
  const [categories, subcategories] = await Promise.all([
    fetchCategories(),
    fetchSubcategories(),
  ]);

  const grouped = groupCategories(categories, subcategories);
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
