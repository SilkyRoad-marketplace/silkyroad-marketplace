// /js/header-main.js
import { supabase } from "./auth.js";

// Load header HTML
async function loadHeaderMain() {
  const root = document.getElementById("header-root");
  if (!root) return;

  try {
    const res = await fetch("/partials/header-main.html");
    const html = await res.text();
    root.innerHTML = html;

    initHeaderMain();
  } catch (err) {
    console.error("Error loading main header:", err);
  }
}

// Initialize header logic
async function initHeaderMain() {
  const header = document.querySelector(".sr-header");
  if (!header) return;

  // ==========================
  // MOBILE DRAWER CONTROL
  // ==========================
  const navToggle = header.querySelector(".nav-toggle");
  const navPanel = header.querySelector("[data-nav-panel]");
  const navBackdrop = header.querySelector("[data-nav-backdrop]");
  const closeBtn = header.querySelector(".mobile-close-btn");
  const mobileLinks = header.querySelectorAll(".nav-mobile-panel a");

  function openMobile() {
    navPanel?.classList.add("open");
    navBackdrop?.classList.add("visible");
    navToggle?.setAttribute("aria-expanded", "true");
  }

  function closeMobile() {
    navPanel?.classList.remove("open");
    navBackdrop?.classList.remove("visible");
    navToggle?.setAttribute("aria-expanded", "false");
  }

  // Hamburger toggle
  navToggle?.addEventListener("click", () => {
    navPanel.classList.contains("open") ? closeMobile() : openMobile();
  });

  // Backdrop closes drawer
  navBackdrop?.addEventListener("click", closeMobile);

  // Close when clicking any mobile link
  mobileLinks.forEach((link) => {
    link.addEventListener("click", closeMobile);
  });

  // Close button "X"
  closeBtn?.addEventListener("click", closeMobile);

  // ==========================
  // AUTH UI STATE HANDLING
  // ==========================
  const loggedOutBlocks = header.querySelectorAll('[data-when="logged-out"]');
  const loggedInBlocks = header.querySelectorAll('[data-when="logged-in"]');

  function showLoggedOut() {
    loggedOutBlocks.forEach((el) => (el.style.display = ""));
    loggedInBlocks.forEach((el) => (el.style.display = "none"));
  }

  function showLoggedIn() {
    loggedOutBlocks.forEach((el) => (el.style.display = "none"));
    loggedInBlocks.forEach((el) => (el.style.display = ""));
  }

  // Check login state
  try {
    const { data } = await supabase.auth.getSession();

    if (data?.session) {
      showLoggedIn();
    } else {
      showLoggedOut();
    }
  } catch (err) {
    console.error("Auth session error:", err);
    showLoggedOut();
  }

  // ==========================
  // LOGOUT BUTTONS — FULL FIX
  // ==========================
  const logoutButtons = header.querySelectorAll(
    "#btn-logout-main, #btn-logout-main-mobile"
  );

  logoutButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Logout error:", err);
      }

      // Clear stale cached UI
      localStorage.clear();
      sessionStorage.clear();

      // Force fresh reload so mobile drawer updates instantly
      window.location.replace("/");
    });
  });
}

// Run on load
loadHeaderMain();
