// ===============================
// SILKY ROAD HEADER MAIN JS
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const headerRoot = document.getElementById("header-root");

  // Sample login state (replace with real check from Supabase)
  const isLoggedIn = false;

  headerRoot.innerHTML = `
    <div class="header-container">
      <div class="header-logo">
        <a href="/"><img src="/favicon.png" alt="Silky Road Logo"></a>
      </div>

      <nav class="nav-menu" id="nav-menu">
        <a href="/marketplace.html">Marketplace</a>
        <a href="/category.html?category=Ebooks">Ebooks</a>
        <a href="/category.html?category=Design">Design</a>
        <a href="/category.html?category=Music">Music</a>
      </nav>

      <div class="header-buttons">
        ${isLoggedIn ? 
          `<a href="/dashboard.html" class="btn btn-ghost">Dashboard</a>
           <a href="/logout.html" class="btn btn-ghost">Log Out</a>` :
          `<a href="/login.html" class="btn btn-ghost">Log In</a>
           <a href="/sign_up.html" class="btn btn-primary">Start Selling</a>`
        }
      </div>

      <div class="hamburger" id="hamburger-btn">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;

  // Hamburger toggle
  const hamburger = document.getElementById("hamburger-btn");
  const navMenu = document.getElementById("nav-menu");

  hamburger.addEventListener("click", () => {
    navMenu.classList.toggle("active");
  });
});
