// /js/sidebar.js
// MP VERSION (converted from sr-* → mp-*)

export function initSidebar(options) {
  const { current, supabase, logoutButtonId } = options || {};

  // ----------------------------------------
  // Highlight active link
  // ----------------------------------------
  if (current) {
    document.querySelectorAll(".mp-side-link").forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) return;

      if (current === "dashboard" && href.includes("dashboard.html")) {
        link.classList.add("is-active");
      } else if (current === "library" && href.includes("library.html")) {
        link.classList.add("is-active");
      }
    });
  }

  // ----------------------------------------
  // Mobile sidebar drawer
  // ----------------------------------------
  const menuToggle = document.getElementById("app-menu-toggle");
  const sidebar = document.getElementById("mp-side-nav");
  const backdrop = document.getElementById("mp-side-backdrop");

  if (menuToggle && sidebar && backdrop) {
    const open = () => {
      sidebar.classList.add("is-open");
      backdrop.classList.add("is-visible");
    };

    const close = () => {
      sidebar.classList.remove("is-open");
      backdrop.classList.remove("is-visible");
    };

    menuToggle.addEventListener("click", open);
    backdrop.addEventListener("click", close);
  }

  // ----------------------------------------
  // Logout button (Supabase)
  // ----------------------------------------
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
