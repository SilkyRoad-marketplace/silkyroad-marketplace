import { initAuthUI } from "/js/auth.js";

function initCategoryMenus() {
  const items = document.querySelectorAll(".nav-cat-item");
  items.forEach((item) => {
    const trigger = item.querySelector(".nav-cat-trigger");
    const menu = item.querySelector(".nav-cat-menu");
    if (!trigger || !menu) return;

    const open = () => menu.classList.add("open");
    const close = () => menu.classList.remove("open");

    trigger.addEventListener("mouseenter", open);
    trigger.addEventListener("mouseleave", close);
    menu.addEventListener("mouseenter", open);
    menu.addEventListener("mouseleave", close);
  });
}

async function loadHeader() {
  const container = document.getElementById("header-root");
  if (!container) return;
  const res = await fetch("/partials/header-market.html");
  const html = await res.text();
  container.innerHTML = html;
  initAuthUI();
  initCategoryMenus();
}
loadHeader();
