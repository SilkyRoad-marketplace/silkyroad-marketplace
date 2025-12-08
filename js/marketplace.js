
// Basic config — replace with your real Supabase URL/key if needed
const SUPABASE_URL = "https://paqvgsruppgadgguynde.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhcXZnc3J1cHBnYWRnZ3V5bmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNTg3NTMsImV4cCI6MjA3NzkzNDc1M30.pwEE4WLFu2-tHkmH1fFYYwcEPmLPyavN7ykXdPGQ3AY";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Desktop primary cats (after these, everything else goes under More)
const PRIMARY_DESKTOP_CATS = [
  "3d",
  "roblox",
  "crafts",
  "design",
  "drawing-and-painting",
  "music-and-sound-design",
  "films",
];

// filter state
const filterState = {
  tag: null,
  fileType: null,
  priceMin: null,
  priceMax: null,
  ratingMin: null,
  search: null,
};

function getParams() {
  const params = new URLSearchParams(window.location.search);
  let catSlug = params.get("cat");
  let subSlug = params.get("sub");
  const q = params.get("q") || "";
  if (catSlug === "all") catSlug = null;
  return { catSlug, subSlug, q };
}

function setHeading(catSlug, subSlug) {
  const titleEl = document.getElementById("mp-products-title");
  const featTitle = document.getElementById("mp-featured-title");
  if (!titleEl || !featTitle) return;

  const unslug = (s) =>
    s
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  let base;
  if (!catSlug && !subSlug) base = "All products";
  else if (catSlug && !subSlug) base = unslug(catSlug);
  else base = unslug(catSlug) + " / " + unslug(subSlug);

  titleEl.textContent = base;
  featTitle.textContent =
    catSlug || subSlug ? `Featured in ${base}` : "Featured products";
}

// ---------- Helpers ----------

function formatSellerDisplay(name, plan) {
  if (!name) name = "Unknown seller";
  if (plan === "PRO") {
    return `${name} <span class="seller-badge-pro">[ ★ PRO ]</span>`;
  }
  if (plan === "ULTIMATE") {
    return `${name} <span class="seller-badge-ultimate">[ 👑 ULTIMATE ]</span>`;
  }
  return name;
}

function buildRatingHtml(avg, count) {
  if (!avg || !count || count <= 0) return "";
  const score = Number(avg).toFixed(1);
  return `<div class="mp-product-rating">★ ${score} (${count})</div>`;
}

function formatPrice(price) {
  if (typeof price === "number") return "US$" + price.toFixed(2);
  const n = Number(price);
  if (isNaN(n)) return "US$0.00";
  return "US$" + n.toFixed(2);
}

function applyFiltersToQuery(query) {
  if (filterState.tag) {
    query = query.contains("tags", [filterState.tag]);
  }
  if (filterState.fileType) {
    query = query.contains("file_types", [filterState.fileType]);
  }
  if (filterState.priceMin !== null) {
    query = query.gte("price", filterState.priceMin);
  }
  if (filterState.priceMax !== null) {
    query = query.lte("price", filterState.priceMax);
  }
  if (filterState.ratingMin !== null) {
    query = query.gte("rating_avg", filterState.ratingMin);
  }
  if (filterState.search) {
    const like = `%${filterState.search}%`;
    // simple OR filter on title + description if exists
    query = query.or(`title.ilike.${like},description.ilike.${like}`);
  }
  return query;
}

// ---------- Product card builders ----------

function buildProductCard(p) {
  const cover = p.cover_url || "/placeholder-product.png";
  const sellerHtml = formatSellerDisplay(p.seller_name, p.seller_plan);
  const ratingHtml = buildRatingHtml(p.rating_avg, p.rating_count);
  const priceText = formatPrice(p.price);
  const url = `/product.html?slug=${encodeURIComponent(p.slug || p.id)}`;

  return `
    <a href="${url}" class="mp-product-card">
      <div class="mp-product-thumb">
        <img src="${cover}" alt="${p.title || "Product"}">
      </div>
      <div class="mp-product-body">
        <div class="mp-product-title">${p.title || "Untitled product"}</div>
        <div class="mp-product-seller">${sellerHtml}</div>
        ${ratingHtml}
        <div class="mp-product-footer">
          <span class="mp-product-price">${priceText}</span>
          <span class="mp-product-cta">View</span>
        </div>
      </div>
    </a>
  `;
}

function buildFeaturedCard(p) {
  const cover = p.cover_url || "/placeholder-product.png";
  const sellerHtml = formatSellerDisplay(p.seller_name, p.seller_plan);
  const priceText = formatPrice(p.price);
  const url = `/product.html?slug=${encodeURIComponent(p.slug || p.id)}`;

  return `
    <a href="${url}" class="mp-featured-card">
      <div class="mp-featured-thumb">
        <img src="${cover}" alt="${p.title || "Product"}">
      </div>
      <div class="mp-featured-body">
        <div class="mp-featured-title">${p.title || "Untitled product"}</div>
        <div class="mp-featured-meta">${sellerHtml}</div>
        <div class="mp-featured-price">${priceText}</div>
      </div>
    </a>
  `;
}

// ---------- Filters ----------

function initFilters(onChange) {
  // tags
  document.querySelectorAll(".mp-chip-tag").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tag = btn.dataset.tag;
      if (filterState.tag === tag) {
        filterState.tag = null;
        btn.classList.remove("active");
      } else {
        filterState.tag = tag;
        document
          .querySelectorAll(".mp-chip-tag")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      }
      onChange();
    });
  });

  // file types
  document.querySelectorAll(".mp-chip-type").forEach((btn) => {
    btn.addEventListener("click", () => {
      const t = btn.dataset.type;
      if (filterState.fileType === t) {
        filterState.fileType = null;
        btn.classList.remove("active");
      } else {
        filterState.fileType = t;
        document
          .querySelectorAll(".mp-chip-type")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      }
      onChange();
    });
  });

  // price
  const minInput = document.getElementById("mp-price-min");
  const maxInput = document.getElementById("mp-price-max");

  function parseIntOrNull(el) {
    const v = el.value.trim();
    if (!v) return null;
    const n = parseInt(v, 10);
    if (isNaN(n) || n < 0) return null;
    return n;
  }

  [minInput, maxInput].forEach((input) => {
    input.addEventListener("change", () => {
      filterState.priceMin = parseIntOrNull(minInput);
      filterState.priceMax = parseIntOrNull(maxInput);
      onChange();
    });
  });

  // rating
  document
    .querySelectorAll('input[name="mp-rating-min"]')
    .forEach((radio) => {
      radio.addEventListener("change", () => {
        const v = radio.value;
        filterState.ratingMin = v === "" ? null : parseFloat(v);
        onChange();
      });
    });

  // clear
  document
    .getElementById("mp-filters-clear")
    .addEventListener("click", () => {
      filterState.tag = null;
      filterState.fileType = null;
      filterState.priceMin = null;
      filterState.priceMax = null;
      filterState.ratingMin = null;

      document
        .querySelectorAll(".mp-chip-tag, .mp-chip-type")
        .forEach((b) => b.classList.remove("active"));
      minInput.value = "";
      maxInput.value = "";
      document
        .querySelectorAll('input[name="mp-rating-min"]')
        .forEach((r) => (r.checked = false));

      onChange();
    });
}

// Mobile filters drawer
function initFiltersDrawer() {
  const toggle = document.getElementById("mp-filters-toggle");
  const sidebar = document.getElementById("mp-filters");
  const overlay = document.getElementById("mp-filters-overlay");
  if (!toggle || !sidebar || !overlay) return;

  function open() {
    sidebar.classList.add("open");
    overlay.classList.add("show");
  }
  function close() {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  }

  toggle.addEventListener("click", open);
  overlay.addEventListener("click", close);
}

// ---------- Data loading ----------

async function loadFeatured(catSlug, subSlug) {
  const track = document.getElementById("mp-featured-track");
  const empty = document.getElementById("mp-featured-empty");
  if (!track || !empty) return;

  track.innerHTML = "";
  empty.style.display = "none";

  let query = supabase
    .from("products")
    .select(
      "id, slug, title, price, cover_url, seller_name, seller_plan, rating_avg, rating_count, category_slug, subcategory_slug, is_featured, is_active"
    )
    .eq("is_active", true)
    .eq("is_featured", true)
    .limit(10);

  if (catSlug) query = query.eq("category_slug", catSlug);
  if (subSlug) query = query.eq("subcategory_slug", subSlug);

  query = applyFiltersToQuery(query);

  const { data, error } = await query;
  if (error) {
    console.error("Featured error", error);
    empty.textContent = "Failed to load featured products.";
    empty.style.display = "block";
    return;
  }

  if (!data || data.length === 0) {
    empty.style.display = "block";
    return;
  }

  data.forEach((p) => {
    track.insertAdjacentHTML("beforeend", buildFeaturedCard(p));
  });
}

async function loadProducts(catSlug, subSlug) {
  const grid = document.getElementById("mp-products-grid");
  const empty = document.getElementById("mp-products-empty");
  if (!grid || !empty) return;

  grid.innerHTML = "";
  empty.style.display = "none";

  let query = supabase
    .from("products")
    .select(
      "id, slug, title, price, cover_url, seller_name, seller_plan, rating_avg, rating_count, category_slug, subcategory_slug, is_active"
    )
    .eq("is_active", true);

  if (catSlug) query = query.eq("category_slug", catSlug);
  if (subSlug) query = query.eq("subcategory_slug", subSlug);

  query = applyFiltersToQuery(query);

  const { data, error } = await query;
  if (error) {
    console.error("Products error", error);
    empty.textContent = "Failed to load products.";
    empty.style.display = "block";
    return;
  }

  if (!data || data.length === 0) {
    empty.style.display = "block";
    return;
  }

  data.forEach((p) => {
    grid.insertAdjacentHTML("beforeend", buildProductCard(p));
  });
}

// Featured horizontal scroll
function initFeaturedScroll() {
  const track = document.getElementById("mp-featured-track");
  const prev = document.getElementById("mp-featured-prev");
  const next = document.getElementById("mp-featured-next");
  if (!track || !prev || !next) return;

  const amount = 260;
  prev.addEventListener("click", () => {
    track.scrollBy({ left: -amount, behavior: "smooth" });
  });
  next.addEventListener("click", () => {
    track.scrollBy({ left: amount, behavior: "smooth" });
  });
}

// ---------- Header auth + cart ----------

function getCartCount() {
  try {
    const raw = localStorage.getItem("sr_cart_items");
    if (!raw) return 0;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

function updateCartCount() {
  const count = getCartCount();
  document.querySelectorAll('[data-role="cart-count"]').forEach((el) => {
    if (count > 0) {
      el.style.display = "inline-flex";
      el.textContent = count;
    } else {
      el.style.display = "none";
      el.textContent = "";
    }
  });
}

function applyAuthState(loggedIn) {
  document.querySelectorAll('[data-role="login-link"]').forEach((el) => {
    el.style.display = loggedIn ? "none" : "";
  });
  document.querySelectorAll('[data-role="start-link"]').forEach((el) => {
    el.style.display = loggedIn ? "none" : "";
  });
  document.querySelectorAll('[data-role="library-link"]').forEach((el) => {
    el.style.display = loggedIn ? "" : "none";
  });
  document.querySelectorAll('[data-role="dashboard-link"]').forEach((el) => {
    el.style.display = loggedIn ? "" : "none";
  });
}

async function initAuthAndCart() {
  try {
    const { data } = await supabase.auth.getSession();
    applyAuthState(!!data.session);
    supabase.auth.onAuthStateChange((_event, session) => {
      applyAuthState(!!session);
    });
  } catch (err) {
    console.error("Auth state error", err);
  }

  document.querySelectorAll('[data-role="cart-button"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      window.location.href = "/checkout.html";
    });
  });

  updateCartCount();
}

// ---------- Category nav from Supabase ----------

const drawerCatMap = {}; // slug -> { name, subs }

async function buildCategoryNav(catSlug) {
  const bar = document.getElementById("mp-cat-bar");
  const drawerList = document.getElementById("mp-drawer-cat-list");
  if (!bar || !drawerList) return;

  bar.innerHTML = "";
  drawerList.innerHTML = "";

  // All button
  const allBtn = document.createElement("button");
  allBtn.className = "mp-cat-pill";
  allBtn.textContent = "All";
  allBtn.addEventListener("click", () => {
    window.location.href = "/marketplace.html";
  });
  const allItem = document.createElement("div");
  allItem.className = "mp-cat-item";
  allItem.appendChild(allBtn);
  bar.appendChild(allItem);

  // Load cats + subs
  const { data: cats, error: catErr } = await supabase
    .from("categories")
    .select("id, slug, name, sort_order")
    .order("sort_order", { ascending: true });

  if (catErr) {
    console.error("Category error", catErr);
    return;
  }

  const { data: subs, error: subErr } = await supabase
    .from("subcategories")
    .select("id, category_id, slug, name, sort_order")
    .order("sort_order", { ascending: true });

  if (subErr) {
    console.error("Subcategory error", subErr);
    return;
  }

  const subsByCat = {};
  (subs || []).forEach((s) => {
    if (!subsByCat[s.category_id]) subsByCat[s.category_id] = [];
    subsByCat[s.category_id].push(s);
  });

  const primary = [];
  const more = [];

  (cats || []).forEach((c) => {
    const entry = {
      id: c.id,
      slug: c.slug,
      name: c.name,
      subs: subsByCat[c.id] || [],
    };
    drawerCatMap[c.slug] = { name: c.name, subs: entry.subs };
    if (PRIMARY_DESKTOP_CATS.includes(c.slug)) primary.push(entry);
    else more.push(entry);
  });

  // desktop primary
  primary.forEach((c) => {
    const item = document.createElement("div");
    item.className = "mp-cat-item";

    const pill = document.createElement("button");
    pill.className = "mp-cat-pill";
    pill.textContent = c.name;
    pill.addEventListener("click", () => {
      window.location.href = `/marketplace.html?cat=${encodeURIComponent(
        c.slug
      )}`;
    });

    const menu = document.createElement("div");
    menu.className = "mp-cat-menu";

    if (c.subs.length > 0) {
      c.subs.forEach((s) => {
        const a = document.createElement("a");
        a.href = `/marketplace.html?cat=${encodeURIComponent(
          c.slug
        )}&sub=${encodeURIComponent(s.slug)}`;
        a.textContent = s.name;
        menu.appendChild(a);
      });
    } else {
      const a = document.createElement("a");
      a.href = `/marketplace.html?cat=${encodeURIComponent(c.slug)}`;
      a.textContent = `All ${c.name}`;
      menu.appendChild(a);
    }

    item.appendChild(pill);
    item.appendChild(menu);
    bar.appendChild(item);
  });

  // desktop more
  if (more.length > 0) {
    const moreItem = document.createElement("div");
    moreItem.className = "mp-cat-item mp-cat-more";

    const moreBtn = document.createElement("button");
    moreBtn.className = "mp-cat-more-btn";
    moreBtn.textContent = "More ▾";

    const menu = document.createElement("div");
    menu.className = "mp-cat-more-menu";

    more.forEach((c) => {
      const groupTitle = document.createElement("div");
      groupTitle.className = "more-group-title";
      groupTitle.textContent = c.name;
      menu.appendChild(groupTitle);

      if (c.subs.length > 0) {
        c.subs.forEach((s) => {
          const a = document.createElement("a");
          a.href = `/marketplace.html?cat=${encodeURIComponent(
            c.slug
          )}&sub=${encodeURIComponent(s.slug)}`;
          a.textContent = s.name;
          menu.appendChild(a);
        });
      } else {
        const a = document.createElement("a");
        a.href = `/marketplace.html?cat=${encodeURIComponent(c.slug)}`;
        a.textContent = `All ${c.name}`;
        menu.appendChild(a);
      }
    });

    moreItem.appendChild(moreBtn);
    moreItem.appendChild(menu);
    bar.appendChild(moreItem);
  }

  // mobile drawer list — combine primary + more
  [...primary, ...more].forEach((c) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mp-drawer-link";
    btn.textContent = `${c.name} ›`;
    btn.dataset.catSlug = c.slug;
    drawerList.appendChild(btn);
  });

  // mark active
  if (!catSlug) return;
  bar
    .querySelectorAll(".mp-cat-pill")
    .forEach((p) => p.classList.remove("active"));
  bar
    .querySelectorAll(".mp-cat-item")
    .forEach((item) => {
      const pill = item.querySelector(".mp-cat-pill");
      if (pill && pill.textContent.trim() === "") return;
    });

  // simpler: highlight pill whose click leads to current catSlug
  bar.querySelectorAll(".mp-cat-item button.mp-cat-pill").forEach((btn) => {
    const targetSlug = cats.find((c) => c.name === btn.textContent)?.slug;
    if (targetSlug && targetSlug === catSlug) {
      btn.classList.add("active");
    }
  });
}

// ---------- Mobile nav drawer ----------

function initNavDrawer() {
  const toggle = document.getElementById("mp-menu-toggle");
  const backdrop = document.getElementById("mp-drawer-backdrop");
  const drawer = document.getElementById("mp-drawer");
  const closeBtn = document.getElementById("mp-drawer-close");
  const backBtn = document.getElementById("mp-drawer-back");
  const viewMain = document.getElementById("mp-drawer-view-main");
  const viewSub = document.getElementById("mp-drawer-view-sub");
  const subTitle = document.getElementById("mp-drawer-sub-title");
  const subList = document.getElementById("mp-drawer-sub-list");
  const catList = document.getElementById("mp-drawer-cat-list");

  if (!toggle || !backdrop || !drawer) return;

  function open() {
    backdrop.classList.add("open");
  }
  function close() {
    backdrop.classList.remove("open");
    viewMain.style.display = "";
    viewSub.style.display = "none";
  }

  toggle.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });

  backBtn.addEventListener("click", () => {
    viewMain.style.display = "";
    viewSub.style.display = "none";
  });

  // All products button
  document
    .querySelectorAll("[data-drawer-all]")
    .forEach((btn) =>
      btn.addEventListener("click", () => {
        window.location.href = "/marketplace.html";
      })
    );

  // Category -> subcats
  catList.addEventListener("click", (e) => {
    const btn = e.target.closest(".mp-drawer-link");
    if (!btn || !btn.dataset.catSlug) return;
    const slug = btn.dataset.catSlug;
    const entry = drawerCatMap[slug];
    if (!entry) return;

    subTitle.textContent = entry.name;
    subList.innerHTML = "";

    const allLink = document.createElement("a");
    allLink.href = `/marketplace.html?cat=${encodeURIComponent(slug)}`;
    allLink.textContent = `All ${entry.name}`;
    allLink.className = "mp-drawer-link";
    subList.appendChild(allLink);

    (entry.subs || []).forEach((s) => {
      const a = document.createElement("a");
      a.href = `/marketplace.html?cat=${encodeURIComponent(
        slug
      )}&sub=${encodeURIComponent(s.slug)}`;
      a.textContent = s.name;
      a.className = "mp-drawer-link";
      subList.appendChild(a);
    });

    viewMain.style.display = "none";
    viewSub.style.display = "";
  });
}

// ---------- Search clear + sync ----------

function initSearchControls(initialQ) {
  const form = document.getElementById("mp-search-form");
  const input = document.getElementById("mp-search-input");
  const clearBtn = document.getElementById("mp-search-clear");
  if (!form || !input || !clearBtn) return;

  if (initialQ) input.value = initialQ;

  function sync() {
    clearBtn.style.display =
      input.value && input.value.trim().length > 0 ? "inline" : "none";
  }

  input.addEventListener("input", sync);
  clearBtn.addEventListener("click", () => {
    input.value = "";
    sync();
    input.focus();
    // also clear search filter and reload
    filterState.search = null;
    const url = new URL(window.location.href);
    url.searchParams.delete("q");
    window.history.replaceState({}, "", url.toString());
    // reload via custom event
    document.dispatchEvent(new CustomEvent("mp:reload-products"));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = input.value.trim();
    filterState.search = q || null;

    const url = new URL(window.location.href);
    if (q) url.searchParams.set("q", q);
    else url.searchParams.delete("q");
    window.history.replaceState({}, "", url.toString());

    document.dispatchEvent(new CustomEvent("mp:reload-products"));
  });

  sync();
}

// ---------- INIT ----------

async function initMarketplace() {
  const { catSlug, subSlug, q } = getParams();
  filterState.search = q || null;
  setHeading(catSlug, subSlug);

  await buildCategoryNav(catSlug);
  initNavDrawer();
  initAuthAndCart();
  initFeaturedScroll();
  initFiltersDrawer();

  const reloadAll = () => {
    loadFeatured(catSlug, subSlug);
    loadProducts(catSlug, subSlug);
  };

  initFilters(reloadAll);
  initSearchControls(q);

  document.addEventListener("mp:reload-products", reloadAll);

  reloadAll();
}

document.addEventListener("DOMContentLoaded", initMarketplace);
