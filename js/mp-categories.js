// /js/mp-categories.js
// STEP 2 — Category Navigation (Desktop + Mobile)
// Source of truth: mpCategories (static)

const mpCategories = {
  "3D": ["3D Assets","3D Modeling","Animating","Avatars","Textures","VRChat"],
  "Roblox": ["Aircraft","Assets","Boats","Games","Kits","Scripts","UI","Vehicles","Weapons"],
  "Crafts": ["3D Printing","Coloring Books","Crochet","Cross Stitch","Embroidery","Knitting","Lego","Papercrafts","Quilting","Sewing"],
  "Design": ["Architecture","Branding","Entertainment Design","Fashion Design","Fonts","Graphics","Icons","Interior Design","Premade Book Covers","Print & Packaging","Logos"],
  "Drawing & Painting": ["Artwork & Commissions","Digital Illustration","Traditional Art"],
  "Music & Sound Design": ["Dance & Theater","Instruments","Sound Design","Vocal"],
  "Films": ["Movie","Short Film","Theater","Video Production & Editing","Videography"],

  // ---- MORE ----
  "Fiction Books": ["Children's Books","Fantasy","Mystery","Romance","Science Fiction","Teen & Young Adult"],
  "Photography": ["Photo Courses","Photo Presets & Actions","Reference Photos","Stock Photos"],
  "Fitness & Health": ["Exercise & Workout","Running","Sports","Weight Loss & Dieting","Yoga"],
  "Business & Money": ["Accounting","Entrepreneurship","Gigs & Side Projects","Investing","Management & Leadership","Marketing & Sales","Networking, Careers & Jobs","Personal Finance","Real Estate"],
  "Education": ["Classroom","English","History","Math","Music","Science","Social Studies","Specialties","Test Prep"],
  "Audio": ["Healing","Hypnosis","Sleep & Meditation","Subliminal Messages"],
  "Gaming": ["Game Assets","Game Mods","Game Scripts","UI & HUD","Weapons & Items"],
  "Self Improvement": ["Cooking","Dating & Relationships","Digital Planner","Outdoors","Philosophy","Productivity","Psychology","Spirituality","Travel"],
  "Recorded Music": ["Albums","Singles"],
  "Other": ["Miscellaneous"]
};

// ------------------------------------------------
// DESKTOP NAV
// ------------------------------------------------
const desktopBar = document.getElementById("mpDesktopCategoryBar");

const VISIBLE_LIMIT = 8;
const entries = Object.entries(mpCategories);
const visible = entries.slice(0, VISIBLE_LIMIT);
const more = entries.slice(VISIBLE_LIMIT);

function buildDesktop() {
  if (!desktopBar) return;
  desktopBar.innerHTML = "";

  const makeItem = (cat, subs) => {
    const wrap = document.createElement("div");
    wrap.className = "mp-cat-wrap";

    const btn = document.createElement("button");
    btn.className = "mp-cat-btn";
    btn.textContent = cat;

    const drop = document.createElement("div");
    drop.className = "mp-cat-dropdown";

    const all = document.createElement("a");
    all.textContent = `All ${cat}`;
    all.href = `/marketplace.html?category=${encodeURIComponent(cat)}`;
    drop.appendChild(all);

    subs.forEach(sub => {
      const a = document.createElement("a");
      a.textContent = sub;
      a.href = `/marketplace.html?category=${encodeURIComponent(cat)}&sub=${encodeURIComponent(sub)}`;
      drop.appendChild(a);
    });

    wrap.append(btn, drop);
    return wrap;
  };

  visible.forEach(([cat, subs]) => desktopBar.appendChild(makeItem(cat, subs)));

  if (more.length) {
    const moreWrap = document.createElement("div");
    moreWrap.className = "mp-cat-wrap";

    const moreBtn = document.createElement("button");
    moreBtn.className = "mp-cat-btn";
    moreBtn.textContent = "More";

    const drop = document.createElement("div");
    drop.className = "mp-cat-dropdown";

    more.forEach(([cat, subs]) => {
      const a = document.createElement("div");
      a.className = "mp-more-item";
      a.textContent = cat;
      a.onclick = () => openMobileCategory(cat);
      drop.appendChild(a);
    });

    moreWrap.append(moreBtn, drop);
    desktopBar.appendChild(moreWrap);
  }
}

// ------------------------------------------------
// MOBILE DRAWER
// ------------------------------------------------
const drawer = document.getElementById("mpDrawer");
const drawerContent = document.getElementById("mpDrawerContent");
const overlay = document.getElementById("mpDrawerOverlay");
const btnOpen = document.getElementById("mpHamburgerBtn");
const btnClose = document.getElementById("mpDrawerClose");
const btnBack = document.getElementById("mpDrawerBack");

let currentCategory = null;

function openDrawer() {
  drawer.classList.add("open");
  overlay.classList.add("show");
  renderRoot();
}

function closeDrawer() {
  drawer.classList.remove("open");
  overlay.classList.remove("show");
}

function renderRoot() {
  currentCategory = null;
  drawerContent.innerHTML = "";

  Object.keys(mpCategories).forEach(cat => {
    const item = document.createElement("div");
    item.className = "mp-drawer-item";
    item.innerHTML = `<span>${cat}</span><span>›</span>`;
    item.onclick = () => openMobileCategory(cat);
    drawerContent.appendChild(item);
  });
}

function openMobileCategory(cat) {
  currentCategory = cat;
  drawerContent.innerHTML = "";

  const all = document.createElement("div");
  all.className = "mp-drawer-sub";
  all.textContent = `All ${cat}`;
  all.onclick = () => {
    window.location.href = `/marketplace.html?category=${encodeURIComponent(cat)}`;
  };
  drawerContent.appendChild(all);

  mpCategories[cat].forEach(sub => {
    const s = document.createElement("div");
    s.className = "mp-drawer-sub";
    s.textContent = sub;
    s.onclick = () => {
      window.location.href =
        `/marketplace.html?category=${encodeURIComponent(cat)}&sub=${encodeURIComponent(sub)}`;
    };
    drawerContent.appendChild(s);
  });
}

// ------------------------------------------------
// EVENTS
// ------------------------------------------------
btnOpen && btnOpen.addEventListener("click", openDrawer);
btnClose && btnClose.addEventListener("click", closeDrawer);
overlay && overlay.addEventListener("click", closeDrawer);
btnBack && btnBack.addEventListener("click", renderRoot);

// INIT
buildDesktop();
