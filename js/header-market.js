document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("market-nav");
  if (!nav) return;

  // AUTH STATE
  const loggedIn = localStorage.getItem("sr_logged_in") === "true";

  // RENDER NAV
  nav.innerHTML = loggedIn
    ? `
        <a href="/library.html">Library</a>
        <a href="/dashboard.html">Dashboard</a>
        <a href="#" id="logoutBtn">Logout</a>
      `
    : `
        <a href="/login.html">Login</a>
        <a href="/upload.html" class="btn-primary">Start Selling</a>
      `;

  // LOGOUT
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("sr_logged_in");
      location.reload();
    });
  }
});
