import { supabase } from "./auth.js";

const headerReadyResolver = {};
window.srHeaderReady = new Promise((resolve) => {
  headerReadyResolver.resolve = resolve;
});

async function loadHeader() {
  const root = document.getElementById("header-market-root");
  if (!root) {
    headerReadyResolver.resolve?.();
    return null;
  }

  try {
    const res = await fetch("/partials/header-market.html");
    if (!res.ok) throw new Error(`Failed to load header partial: ${res.status}`);
    root.innerHTML = await res.text();
    return root;
  } catch (err) {
    console.error("Header load error", err);
    headerReadyResolver.resolve?.();
    return null;
  }
}

function syncAuthUI() {
  const loggedOutBlocks = document.querySelectorAll('[data-when="logged-out"]');
  const loggedInBlocks = document.querySelectorAll('[data-when="logged-in"]');

  function show(loggedIn) {
    loggedOutBlocks.forEach((el) => (el.style.display = loggedIn ? "none" : ""));
    loggedInBlocks.forEach((el) => (el.style.display = loggedIn ? "" : "none"));
  }

  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error("Auth session error", error);
      show(false);
      return;
    }
    show(!!data?.session);
  });

  supabase.auth.onAuthStateChange((_evt, session) => show(!!session));
}

function initCartCount() {
  const countEls = document.querySelectorAll("[data-role='cart-count']");
  if (!countEls.length) return;
  let total = 0;
  try {
    const raw = localStorage.getItem("silkyroad_cart");
    if (raw) {
      const cart = JSON.parse(raw);
      if (Array.isArray(cart)) total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    }
  } catch (e) {
    console.warn("Failed to read cart", e);
  }
  countEls.forEach((el) => {
    if (total > 0) {
      el.textContent = total;
      el.style.display = "inline";
    } else {
      el.style.display = "none";
    }
  });
}

function syncSearchInputs() {
  const desktop = document.getElementById("mp-search-input");
  const mobile = document.getElementById("mp-search-input-mobile");
  const clearDesktop = document.getElementById("mp-search-clear");
  const clearMobile = document.getElementById("mp-search-clear-mobile");

  function syncValue(source, target) {
    if (!source || !target) return;
    source.addEventListener("input", () => (target.value = source.value));
  }

  syncValue(desktop, mobile);
  syncValue(mobile, desktop);

  if (clearDesktop && desktop) {
    clearDesktop.addEventListener("click", () => {
      desktop.value = "";
      if (mobile) mobile.value = "";
      desktop.dispatchEvent(new Event("input"));
    });
  }
  if (clearMobile && mobile) {
    clearMobile.addEventListener("click", () => {
      mobile.value = "";
      if (desktop) desktop.value = "";
      mobile.dispatchEvent(new Event("input"));
    });
  }
}

function bindDrawerControls() {
  const drawer = document.getElementById("mp-cat-drawer");
  const backdrop = document.getElementById("mp-cat-backdrop");
  const toggleButtons = [
    document.getElementById("mp-cat-toggle"),
    document.getElementById("mp-cat-toggle-inline"),
  ].filter(Boolean);
  const closeBtn = document.getElementById("mp-cat-close");

  const open = () => {
    if (!drawer || !backdrop) return;
    drawer.classList.add("is-open");
    backdrop.classList.add("is-open");
  };
  const close = () => {
    if (!drawer || !backdrop) return;
    drawer.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    document.getElementById("mp-cat-drawer-sub")?.setAttribute("hidden", "hidden");
    document.getElementById("mp-cat-drawer-main")?.removeAttribute("hidden");
  };

  toggleButtons.forEach((btn) => btn.addEventListener("click", open));
  closeBtn?.addEventListener("click", close);
  backdrop?.addEventListener("click", close);

  return { open, close };
}

async function initHeader() {
  const root = await loadHeader();
  if (!root) return;

  syncAuthUI();
  initCartCount();
  syncSearchInputs();
  const drawer = bindDrawerControls();

  document.dispatchEvent(new CustomEvent("sr:header-mounted", { detail: { drawer } }));
  if (headerReadyResolver.resolve) headerReadyResolver.resolve();
}

initHeader();
