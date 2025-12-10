// /js/header-main.js
import { supabase } from "./auth.js";

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

async function initHeaderMain() {
  const header = document.querySelector(".sr-header");
  if (!header) return;

  // --- Mobile drawer elements ---
  const navToggle = header.querySelector(".nav-toggle");
  const navPanel = header.querySelector("[data-nav-panel]");
  const navBackdrop = header.querySelector("[data-nav-backdrop]");
  const mobileLinks = header.querySelectorAll(".nav-mobile-panel a");

  function openMobile() {
    if (!navPanel) return;
    navPanel.classList.add("open");
    if (navBackdrop) navBackdrop.classList.add("visible");
    if (navToggle) navToggle.setAttribute("aria-expanded", "true");
  }

  function closeMobile() {
    if (!navPanel) return;
    navPanel.classList.remove("open");
    if (navBackdrop) navBackdrop.classList.remove("visible");
    if (navToggle) navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle && navPanel) {
    navToggle.addEventListener("click", () => {
      if (navPanel.classList.contains("open")) {
        closeMobile();
      } else {
        openMobile();
      }
    });
  }

  if (navBackdrop) {
    navBackdrop.addEventListener("click", () => {
      closeMobile();
    });
  }

  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMobile();
    });
  });

  // --- Auth visibility (logged-in vs logged-out) ---
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

  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    if (data && data.session) {
      showLoggedIn();
    } else {
      showLoggedOut();
    }
  } catch (err) {
    console.error("Error checking auth session in header:", err);
    showLoggedOut();
  }

  // --- Logout buttons (desktop + mobile) ---
  const logoutButtons = header.querySelectorAll(
    "#btn-logout-main, #btn-logout-main-mobile"
  );

  logoutButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Error during logout:", err);
      }
      showLoggedOut();
      window.location.href = "/"; // back to home
    });
  });
}

// run on load
loadHeaderMain();
