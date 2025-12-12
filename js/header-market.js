// /js/header-market.js
// MP VERSION (converted from sr-* → mp-*)

/* eslint-disable */
(function () {
  const headerRoot = document.getElementById("header-root");
  if (!headerRoot) return;

  // ===== SIMPLE AUTH STATE (dummy – same logic as before) =====
  const isLoggedIn = localStorage.getItem("mp_isLoggedIn") === "true";

  // ===== HEADER HTML =====
  headerRoot.innerHTML = `
    <header class="mp-header">
      <div class="mp-header-inner">

        <!-- ROW 1 -->
        <div class="mp-header-row1">

          <div class="mp-logo-wrap">
            <a href="/index.html" class="mp-logo-link">
              <img src="/logo-gold.png" alt="Silky Road" class="mp-logo-img">
            </a>
          </div>

          <div class="mp-search-wrap">
            <form class="mp-search" action="/marketplace.html" method="get">
              <input 
                type="text" 
                name="q" 
                class="mp-search-input" 
                placeholder="Search digital products, eBooks, music, templates..."
              >
              <button type="submit" class="mp-search-btn">
                <span class="mp-search-icon">🔍</span>
              </button>
            </form>
          </div>

          <div class="mp-header-actions">
            ${
              isLoggedIn
                ? `
              <a href="/dashboard.html" class="mp-link">Dashboard</a>
              <a href="/library.html" class="mp-link">Library</a>
              <button type="button" class="mp-icon-btn mp-cart-btn" aria-label="Cart">🛒</button>
              <button type="button" class="mp-link mp-logout-btn">Log out</button>
            `
                : `
              <a href="/login.html" class="mp-link">Log in</a>
              <a href="/start_selling.html" class="mp-btn mp-btn-gold">
                Start selling
              </a>
            `
            }
          </div>
        </div>

        <!-- ROW 2 – CATEGORY BAR (STATIC LEGACY VERSION) -->
        <nav class="mp-header-row2">
          <div class="mp-category-scroll">

            <div class="mp-cat-item mp-cat-with-menu">
              <button class="mp-cat-btn">All</button>
              <div class="mp-cat-menu">
                <a href="/marketplace.html">All Products</a>
              </div>
            </div>

            <div class="mp-cat-item mp-cat-with-menu">
              <button class="mp-cat-btn">3D</button>
              <div class="mp-cat-menu">
                <a href="/category.html?category=3D&sub=Models">Models</a>
                <a href="/category.html?category=3D&sub=Textures">Textures</a>
                <a href="/category.html?category=3D&sub=Characters">Characters</a>
              </div>
            </div>

            <div class="mp-cat-item mp-cat-with-menu">
              <button class="mp-cat-btn">Roblox</button>
              <div class="mp-cat-menu">
                <a href="/category.html?category=Roblox&sub=Maps">Maps</a>
                <a href="/category.html?category=Roblox&sub=Scripts">Scripts</a>
                <a href="/category.html?category=Roblox&sub=Assets">Assets</a>
              </div>
            </div>

            <div class="mp-cat-item mp-cat-with-menu">
              <button class="mp-cat-btn">Crafts</button>
              <div class="mp-cat-menu">
                <a href="/category.html?category=Crafts&sub=Printables">Printables</a>
                <a href="/category.html?category=Crafts&sub=Patterns">Patterns</a>
              </div>
            </div>

            <div class="mp-cat-item mp-cat-with-menu">
              <button class="mp-cat-btn">Design</button>
              <div class="mp-cat-menu">
                <a href="/category.html?category=Design&sub=Templates">Templates</a>
                <a href="/category.html?category=Design&sub=Fonts">Fonts</a>
                <a href="/category.html?category=Design&sub=Mockups">Mockups</a>
              </div>
            </div>

            <div class="mp-cat-item mp-cat-with-menu">
              <button class="mp-cat-btn">Drawing & Painting</button>
              <div class="mp-cat-menu">
                <a href="/category.html?category=Drawing%20%26%20Painting&sub=Brushes">Brushes</a>
                <a href="/category.html?category=Drawing%20%26%20Painting&sub=Tutorials">Tutorials</a>
              </div>
            </div>

            <div class="mp-cat-item mp-cat-with-menu">
              <button class="mp-cat-btn">Music & Sound Design</button>
              <div class="mp-cat-menu">
                <a href="/category.html?category=Music%20%26%20Sound%20Design&sub=Loops">Loops</a>
                <a href="/category.html?category=Music%20%26%20Sound%20Design&sub=Samples">Samples</a>
                <a href="/category.html?category=Music%20%26%20Sound%20Design&sub=Tracks">Tracks</a>
              </div>
            </div>

            <div class="mp-cat-item mp-cat-with-menu">
              <button class="mp-cat-btn">Education</button>
              <div class="mp-cat-menu">
                <a href="/category.html?category=Educational&sub=eBooks">eBooks</a>
                <a href="/category.html?category=Educational&sub=Courses">Courses</a>
                <a href="/category.html?category=Educational&sub=Worksheets">Worksheets</a>
              </div>
            </div>

            <div class="mp-cat-item mp-cat-with-menu">
              <button class="mp-cat-btn">More ▾</button>
              <div class="mp-cat-menu">
                <a href="/category.html?category=Photography">Photography</a>
                <a href="/category.html?category=Software">Software</a>
                <a href="/category.html?category=Games">Games</a>
                <a href="/category.html?category=Other">Other</a>
              </div>
            </div>

          </div>
        </nav>
      </div>
    </header>
  `;

  // ===== LOGOUT HANDLER =====
  const logoutBtn = headerRoot.querySelector(".mp-logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.setItem("mp_isLoggedIn", "false");
      window.location.href = "/index.html";
    });
  }
})();
