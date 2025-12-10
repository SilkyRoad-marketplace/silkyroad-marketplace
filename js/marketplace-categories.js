/* ==========================================================
   SILKY ROAD – CATEGORY SYSTEM (PAYHIP NEW EDITION)
   ========================================================== */

/*  
Payhip NEW Categories (2024–2025)
We include intelligent subcategories based on industry standards.
*/

const SR_CATEGORIES = [
  {
    name: "Ebooks",
    slug: "ebooks",
    subcategories: [
      { name: "Fiction", slug: "fiction" },
      { name: "Non-Fiction", slug: "non-fiction" },
      { name: "Self-Help", slug: "self-help" },
      { name: "Business", slug: "business" }
    ]
  },
  {
    name: "Software",
    slug: "software",
    subcategories: [
      { name: "Apps", slug: "apps" },
      { name: "Scripts", slug: "scripts" },
      { name: "Tools", slug: "tools" }
    ]
  },
  {
    name: "Courses",
    slug: "courses",
    subcategories: [
      { name: "Video Courses", slug: "video-courses" },
      { name: "PDF Courses", slug: "pdf-courses" },
      { name: "Masterclasses", slug: "masterclasses" }
    ]
  },
  {
    name: "Templates",
    slug: "templates",
    subcategories: [
      { name: "Website Templates", slug: "website-templates" },
      { name: "Document Templates", slug: "document-templates" },
      { name: "Business Templates", slug: "business-templates" }
    ]
  },
  {
    name: "Graphics",
    slug: "graphics",
    subcategories: [
      { name: "Icons", slug: "icons" },
      { name: "Logos", slug: "logos" },
      { name: "UI Kits", slug: "ui-kits" },
      { name: "Illustrations", slug: "illustrations" }
    ]
  },
  {
    name: "3D Models",
    slug: "3d-models",
    subcategories: [
      { name: "Characters", slug: "characters" },
      { name: "Props", slug: "props" },
      { name: "Environments", slug: "environments" }
    ]
  },
  {
    name: "Game Assets",
    slug: "game-assets",
    subcategories: [
      { name: "Scripts", slug: "scripts" },
      { name: "Sprites", slug: "sprites" },
      { name: "VFX", slug: "vfx" }
    ]
  },
  {
    name: "Design Assets",
    slug: "design-assets",
    subcategories: [
      { name: "Fonts", slug: "fonts" },
      { name: "Branding Packs", slug: "branding-packs" },
      { name: "Print Packs", slug: "print-packs" }
    ]
  },
  {
    name: "Audio",
    slug: "audio",
    subcategories: [
      { name: "Music Packs", slug: "music-packs" },
      { name: "Loops", slug: "loops" },
      { name: "FX", slug: "fx" }
    ]
  },
  {
    name: "Video",
    slug: "video",
    subcategories: [
      { name: "Stock Footage", slug: "stock-footage" },
      { name: "Templates", slug: "templates" },
      { name: "Animations", slug: "animations" }
    ]
  },
  {
    name: "Photography",
    slug: "photography",
    subcategories: [
      { name: "Stock Photos", slug: "stock-photos" },
      { name: "Lightroom Presets", slug: "lightroom-presets" }
    ]
  },
  {
    name: "Printables",
    slug: "printables",
    subcategories: [
      { name: "Calendars", slug: "calendars" },
      { name: "Planners", slug: "planners" },
      { name: "Worksheets", slug: "worksheets" }
    ]
  },
  {
    name: "Memberships",
    slug: "memberships",
    subcategories: []
  }
];

/* Show first 8 categories before the "More ▼" dropdown */
const SR_VISIBLE_CATEGORIES = 8;


/* ==========================================================
   URL BUILDER
   ========================================================== */
function buildCategoryHref(categorySlug, subSlug) {
  const params = new URLSearchParams();
  if (categorySlug) params.set("category", categorySlug);
  if (subSlug) params.set("sub", subSlug);
  return `/category.html?${params.toString()}`;
}


/* ==========================================================
   DESKTOP CATEGORY BAR RENDERING
   ========================================================== */
function renderDesktopCategories() {
  const container = document.getElementById("srDesktopCategoryBar");
  if (!container) return;

  const list = document.createElement("div");
  list.className = "sr-category-list";

  const mainCats = SR_CATEGORIES.slice(0, SR_VISIBLE_CATEGORIES);
  const moreCats = SR_CATEGORIES.slice(SR_VISIBLE_CATEGORIES);

  // Main visible categories
  mainCats.forEach(cat => {
    const item = document.createElement("div");
    item.className = "sr-cat-item" + (cat.subcategories.length ? " sr-cat-has-sub" : "");

    const link = document.createElement("a");
    link.href = buildCategoryHref(cat.slug);
    link.className = "sr-cat-link";
    link.textContent = cat.name;
    item.appendChild(link);

    if (cat.subcategories.length) {
      const submenu = document.createElement("div");
      submenu.className = "sr-sub-menu";

      cat.subcategories.forEach(sub => {
        const a = document.createElement("a");
        a.href = buildCategoryHref(cat.slug, sub.slug);
        a.textContent = sub.name;
        submenu.appendChild(a);
      });

      item.appendChild(submenu);
    }

    list.appendChild(item);
  });

  // MORE ▼
  if (moreCats.length > 0) {
    const moreItem = document.createElement("div");
    moreItem.className = "sr-cat-item sr-cat-has-sub";

    const button = document.createElement("button");
    button.className = "sr-cat-button";
    button.textContent = "More ▾";
    moreItem.appendChild(button);

    const submenu = document.createElement("div");
    submenu.className = "sr-sub-menu";

    moreCats.forEach(cat => {
      const link = document.createElement("a");
      link.href = buildCategoryHref(cat.slug);
      link.textContent = cat.name;
      submenu.appendChild(link);
    });

    moreItem.appendChild(submenu);
    list.appendChild(moreItem);
  }

  container.innerHTML = "";
  container.appendChild(list);
}


/* ==========================================================
   MOBILE DRAWER CATEGORY RENDERING
   ========================================================== */
function renderDrawerCategories() {
  const container = document.getElementById("srDrawerCategories");
  if (!container) return;

  container.innerHTML = "";

  SR_CATEGORIES.forEach(cat => {
    const wrap = document.createElement("div");
    const hasSub = cat.subcategories.length > 0;

    wrap.className = "sr-drawer-cat" + (hasSub ? " sr-drawer-cat-has-sub" : "");

    const link = document.createElement("a");
    link.className = "sr-drawer-cat-link";
    link.href = buildCategoryHref(cat.slug);
    link.textContent = cat.name;

    wrap.appendChild(link);

    if (hasSub) {
      const subWrap = document.createElement("div");
      subWrap.className = "sr-drawer-sub";

      cat.subcategories.forEach(sub => {
        const subLink = document.createElement("a");
        subLink.href = buildCategoryHref(cat.slug, sub.slug);
        subLink.textContent = sub.name;
        subWrap.appendChild(subLink);
      });

      wrap.appendChild(subWrap);

      // Mobile tap → open subcategories
      link.addEventListener("click", (e) => {
        e.preventDefault();
        wrap.classList.toggle("open");
      });
    }

    container.appendChild(wrap);
  });
}


/* ==========================================================
   DRAWER + OVERLAY + LOGOUT + CART
   ========================================================== */

function setupDrawer() {
  const drawer = document.getElementById("srDrawer");
  const overlay = document.getElementById("srOverlay");
  const openBtn = document.getElementById("srHamburgerBtn");
  const closeBtn = document.getElementById("srCloseDrawerBtn");

  if (!drawer || !overlay || !openBtn || !closeBtn) return;

  const open = () => {
    drawer.classList.add("open");
    overlay.classList.add("show");
  };

  const close = () => {
    drawer.classList.remove("open");
    overlay.classList.remove("show");
  };

  openBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", close);
}

function setupLogoutButtons() {
  const logout1 = document.getElementById("srLogoutBtn");
  const logout2 = document.getElementById("srDrawerLogoutBtn");

  async function doLogout(e) {
    e.preventDefault();

    // Supabase logout if present
    if (window.supabase && supabase.auth) {
      try {
        await supabase.auth.signOut();
      } catch (err) {}
    }

    localStorage.removeItem("sr_user");
    location.reload();
  }

  if (logout1) logout1.addEventListener("click", doLogout);
  if (logout2) logout2.addEventListener("click", doLogout);
}

function refreshCartCount() {
  const el = document.getElementById("srCartCount");
  if (!el) return;
  const count = localStorage.getItem("sr_cartCount") || 0;
  el.textContent = count;
}

async function refreshAuthUI() {
  let loggedIn = false;

  if (window.supabase && supabase.auth) {
    try {
      const { data } = await supabase.auth.getUser();
      loggedIn = !!data.user;
    } catch {}
  } else {
    loggedIn = !!localStorage.getItem("sr_user");
  }

  document.querySelectorAll(".sr-logged-in").forEach(el => {
    el.style.display = loggedIn ? "inline-block" : "none";
  });
  document.querySelectorAll(".sr-logged-out").forEach(el => {
    el.style.display = loggedIn ? "none" : "inline-block";
  });
}


/* ==========================================================
   INIT
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  renderDesktopCategories();
  renderDrawerCategories();
  setupDrawer();
  setupLogoutButtons();
  refreshCartCount();
  refreshAuthUI();
});
