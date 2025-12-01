import { initAuthUI } from "/js/auth.js";

async function loadHeader() {
  const container = document.getElementById("header-root");
  if (!container) return;
  const res = await fetch("/partials/header-main.html");
  const html = await res.text();
  container.innerHTML = html;
  initAuthUI();
}
loadHeader();
