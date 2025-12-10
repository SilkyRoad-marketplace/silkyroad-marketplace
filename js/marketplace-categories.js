// /js/marketplace-categories.js
// Unified category + subcategory navigation for marketplace
(function () {
  // -------------------------------
  // CATEGORY CONFIG
  // -------------------------------
  const CATEGORY_CONFIG = {
    all: {
      id: "all",
      label: "All",
      urlCategory: "All",
      subs: []
    },
    "3d": {
      id: "3d",
      label: "3D",
      urlCategory: "3D",
      subs: [
        "Avatars & Characters",
        "Buildings & Props",
        "Clothing & Accessories",
        "Vehicles",
        "Weapons",
        "UI Packs",
        "Game Assets",
        "Scripts",
        "Animation",
        "Terrain / Maps",
        "Effects",
        "Tools / Plugins",
        "Icon Packs"
      ]
    },
    roblox: {
      id: "roblox",
      label: "Roblox",
      urlCategory: "Roblox",
      subs: [
        "Avatars",
        "Characters",
        "Clothing",
        "Vehicles",
        "Weapons",
        "UI Packs",
        "Game Assets",
        "Scripts",
        "Animation",
        "Terrain / Maps",
        "Effects",
        "Tools / Plugins",
        "Icon Packs"
      ]
    },
    crafts: {
      id: "crafts",
      label: "Crafts",
      urlCategory: "Crafts",
      subs: [
        "Crochet Patterns",
        "Knitting Patterns",
        "Sewing Patterns",
        "Embroidery",
        "Quilting",
        "Printables",
        "DIY Guides",
        "Templates"
      ]
    },
    design: {
      id: "design",
      label: "Design",
      urlCategory: "Design",
      subs: [
        "Graphic Templates",
        "Canva Templates",
        "Social Media Packs",
        "Print Templates",
        "Logo Templates",
        "UI/UX Kits",
        "Icon Sets",
        "Mockups",
        "Typography",
        "Resume Templates"
      ]
    },
    drawing: {
      id: "drawing",
      label: "Drawing & Painting",
      urlCategory: "Drawing & Painting",
      subs: [
        "Procreate Brushes",
        "Photoshop Brushes",
        "Clip Studio Brushes",
        "Digital Illustration",
        "Tutorials",
        "Reference Packs",
        "Print-ready Artwork"
      ]
    },
    music: {
      id: "music",
      label: "Music & Sound Design",
      urlCategory: "Music & Sound Design",
      subs: [
        "Sample Packs",
        "Loops",
        "Beats",
        "Vocals",
        "Sound Effects",
        "Mixing Templates",
        "Presets (Serum, Vital, etc.)",
        "MIDI Packs"
      ]
    },
    films: {
      id: "films",
      label: "Films",
      urlCategory: "Films",
      subs: [
        "LUTs",
        "Premiere Pro Templates",
        "Final Cut Templates",
        "Motion Graphics",
        "Overlays",
        "Stock Footage",
        "Tutorials"
      ]
    }
  };

  const CATEGORY_ORDER = ["all", "3d", "roblox", "crafts", "design", "drawing", "music", "films"];
  let activeCatId = "all";

  // -------------------------------
  // DESKTOP BAR
  // -------------------------------
  function buildDesktopCategories() {
    const wrapper = document.getElementById("mp-cat-bar-inner");
    if (!wrapper) return;

    wrapper.innerHTML = "";

    const topRow = document.createElement("div");
    topRow.className = "mp-cat-row mp-cat-row-main";

    const subRow = document.createElement("div");
    subRow.className = "mp-cat-row mp-cat-row-sub";
    subRow.id = "mp-cat-sub-row";

    CATEGORY_ORDER.forEach((id) => {
      const cfg = CATEGORY_CONFIG[id];
      if (!cfg) return;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mp-cat-pill";
      btn.textContent = cfg.label;
      btn.dataset.catId = id;

      if (id === activeCatId) {
        btn.classList.add("is-active");
      }

      btn.addEventListener("click", () => {
        if (activeCatId === id) return;
        activeCatId = id;
        updateActiveDesktopPills();
        renderDesktopSubRow();
        updateProductsTitle();
      });

      topRow.appendChild(btn);
    });

    wrapper.appendChild(topRow);
    wrapper.appendChild(subRow);

    renderDesktopSubRow();
  }

  function updateActiveDesktopPills() {
    document.querySelectorAll(".mp-cat-pill").forEach((el) => {
      const id = el.dataset.catId;
      if (id === activeCatId) {
        el.classList.add("is-active");
      } else {
        el.classList.remove("is-active");
      }
    });
  }

  function renderDesktopSubRow() {
    const row = document.getElementById("mp-cat-sub-row");
    if (!row) return;

    const cfg = CATEGORY_CONFIG[activeCatId];
    row.innerHTML = "";

    if (!cfg || !cfg.subs || cfg.subs.length === 0) {
      row.style.display = "none";
      return;
    }

    row.style.display = "flex";

    cfg.subs.forEach((sub) => {
      const link = document.createElement("a");
      link.className = "mp-cat-sub-pill";
      link.textContent = sub;
      link.href =
        "/category.html?category=" +
        encodeURIComponent(cfg.urlCategory) +
        "&sub=" +
        encodeURIComponent(sub);
      row.appendChild(link);
    });
  }

  function updateProductsTitle() {
    const title = document.getElementById("mp-products-title");
    if (!title) return;

    if (activeCatId === "all") {
      title.textContent = "All products";
    } else {
      const cfg = CATEGORY_CONFIG[activeCatId];
      title.textContent = cfg ? cfg.label : "Products";
    }
  }

  // -------------------------------
  // MOBILE DRAWER
  // -------------------------------
  function buildMobileCategories() {
    const list = document.getElementById("mp-drawer-cat-list");
    if (!list) return;

    list.innerHTML = "";

    CATEGORY_ORDER.forEach((id) => {
      if (id === "all") return; // 'All products' button already in HTML

      const cfg = CATEGORY_CONFIG[id];
      if (!cfg) return;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mp-drawer-link";
      btn.textContent = cfg.label;
      btn.dataset.catId = id;

      btn.addEventListener("click", () => {
        openSubDrawer(id);
      });

      list.appendChild(btn);
    });

    const allBtn = document.querySelector("[data-drawer-all]");
    if (allBtn) {
      allBtn.addEventListener("click", () => {
        activeCatId = "all";
        updateActiveDesktopPills();
        renderDesktopSubRow();
        updateProductsTitle();
      });
    }

    const backBtn = document.getElementById("mp-drawer-back");
    const mainView = document.getElementById("mp-drawer-view-main");
    const subView = document.getElementById("mp-drawer-view-sub");

    if (backBtn && mainView && subView) {
      backBtn.addEventListener("click", () => {
        subView.style.display = "none";
        mainView.style.display = "block";
      });
    }
  }

  function openSubDrawer(catId) {
    const cfg = CATEGORY_CONFIG[catId];
    if (!cfg) return;

    const mainView = document.getElementById("mp-drawer-view-main");
    const subView = document.getElementById("mp-drawer-view-sub");
    const title = document.getElementById("mp-drawer-sub-title");
    const list = document.getElementById("mp-drawer-sub-list");

    if (!mainView || !subView || !title || !list) return;

    mainView.style.display = "none";
    subView.style.display = "block";

    title.textContent = cfg.label;
    list.innerHTML = "";

    cfg.subs.forEach((sub) => {
      const link = document.createElement("a");
      link.className = "mp-drawer-link";
      link.textContent = sub;
      link.href =
        "/category.html?category=" +
        encodeURIComponent(cfg.urlCategory) +
        "&sub=" +
        encodeURIComponent(sub);
      list.appendChild(link);
    });
  }

  // -------------------------------
  // INIT
  // -------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    buildDesktopCategories();
    buildMobileCategories();
    updateProductsTitle();
  });
})();
