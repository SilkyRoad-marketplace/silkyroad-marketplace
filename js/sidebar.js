// /js/sidebar.js
export function initSidebar(options) {
  const { current, supabase, logoutButtonId } = options || {};

  // highlight active link based on "current" key
  if (current) {
    document.querySelectorAll(".sr-side-link").forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) return;
      if (current === "dashboard" && href.includes("dashboard.html")) {
        link.classList.add("is-active");
      } else if (current === "library" && href.includes("library.html")) {
        link.classList.add("is-active");
      }
    });
  }

  // mobile drawer behaviour
  const menuToggle = document.getElementById("app-menu-toggle");
  const sidebar = document.getElementById("sr-side-nav");
  const backdrop = document.getElementById("sr-side-backdrop");

  if (menuToggle && sidebar && backdrop) {
    const open = () => {
      sidebar.classList.add("open");
      backdrop.classList.add("visible");
    };
    const close = () => {
      sidebar.classList.remove("open");
      backdrop.classList.remove("visible");
    };

    menuToggle.addEventListener("click", open);
    backdrop.addEventListener("click", close);
  }

  // logout button (uses Supabase if passed)
  const logoutBtn = logoutButtonId
    ? document.getElementById(logoutButtonId)
    : null;

  if (logoutBtn && supabase) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Logout error", err);
      }
      window.location.href = "/index.html";
    });
  }
}
