// Load header into #header-root
async function loadHeader() {
  const container = document.getElementById("header-root");
  if (!container) return;

  const html = await fetch("/partials/header-main.html").then(r => r.text());
  container.innerHTML = html;

  initHeaderEvents(); // activate hamburger AFTER header loads
}

function initHeaderEvents() {
  const toggle = document.querySelector(".nav-toggle");
  const panel = document.querySelector(".nav-mobile-panel");

  if (!toggle || !panel) return;

  // Create backdrop
  const backdrop = document.createElement("div");
  backdrop.className = "nav-backdrop";
  document.body.appendChild(backdrop);

  toggle.addEventListener("click", () => {
    panel.classList.toggle("open");
    backdrop.classList.toggle("visible");
  });

  backdrop.addEventListener("click", () => {
    panel.classList.remove("open");
    backdrop.classList.remove("visible");
  });
}

loadHeader();
