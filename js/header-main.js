// /js/header-main.js

(function () {
  const headerRoot = document.getElementById("header-root");
  if (!headerRoot) return;

  // ===== SIMPLE AUTH STATE (ADAPT TO YOUR REAL AUTH) =====
  const isLoggedIn = localStorage.getItem("sr_isLoggedIn") === "true";

  // ===== HEADER HTML =====
  headerRoot.innerHTML = `
    <header class="sr-header">
      <div class="sr-header-inner">
        <!-- ROW 1 -->
        <div class="sr-header-row1">
          <div class="sr-logo-wrap">
            <a href="/index.html" class="sr-logo-link">
              <img src="/logo-gold.png" alt="Silky Road" class="sr-logo-img">
            </a>
          </div>

          <div class="sr-search-wrap">
            <form class="sr-search-form" action="/marketplace.html" method="get">
              <input 
                type="text" 
                name="q" 
                class="sr-search-input" 
                placeholder="Search digital products, eBooks, music, templates..."
              >
              <button type="submit" class="sr-search-btn">
                <span class="sr-search-icon">🔍</span>
              </button>
            </form>
          </div>

          <div class="sr-header-actions">
            ${
              isLoggedIn
                ? `
              <a href="/dashboard.html" class="sr-header-link">Dashboard</a>
              <a href="/library.html" class="sr-header-link">Library</a>
              <button type="button" class="sr-icon-btn sr-cart-btn" aria-label="Cart">
                🛒
              </button>
              <button type="button" class="sr-header-link sr-logout-btn">Log out</button>
            `
                : `
              <a href="/login.html" class="sr-header-link">Login</a>
              <a href="/start_selling.html" class="sr-header-btn sr-header-btn-gold">
                Start Selling
              </a>
            `
            }
          </div>
        </div>

        <!-- ROW 2 – CATEGORY BAR -->
        <nav class="sr-header-row2">
          <div class="sr-category-scroll">
            <!-- Main categories with dropdowns -->
            <div class="sr-cat-item sr-cat-with-menu">
              <button class="sr-cat-btn">All</button>
              <div class="sr-cat-menu">
                <a href="/marketplace.html">All Products</a>
              </div>
            </div>

            <div class="sr-cat-item sr-cat-with-menu">
              <button class="sr-cat-btn">3D</button>
              <div class="sr-cat-menu">
                <a href="/category.html?category=3D&sub=Models">Models</a>
                <a href="/category.html?category=3D&sub=Textures">Textures</a>
                <a href="/category.html?category=3D&sub=Characters">Characters</a>
              </div>
            </div>

            <div class="sr-cat-item sr-cat-with-menu">
              <button class="sr-cat-btn">Roblox</button>
              <div class="sr-cat-menu">
                <a href="/category.html?category=Roblox&sub=Maps">Maps</a>
                <a href="/category.html?category=Roblox&sub=Scripts">Scripts</a>
                <a href="/category.html?category=Roblox&sub=Assets">Assets</a>
              </div>
            </div>

            <div class="sr-cat-item sr-cat-with-menu">
              <button class="sr-cat-btn">Crafts</button>
              <div class="sr-cat-menu">
                <a href="/category.html?category=Crafts&sub=Printables">Printables</a>
                <a href="/category.html?category=Crafts&sub=Patterns">Patterns</a>
              </div>
            </div>

            <div class="sr-cat-item sr-cat-with-menu">
              <button class="sr-cat-btn">Design</button>
              <div class="sr-cat-menu">
                <a href="/category.html?category=Design&sub=Templates">Templates</a>
                <a href="/category.html?category=Design&sub=Fonts">Fonts</a>
                <a href="/category.html?category=Design&sub=Mockups">Mockups</a>
              </div>
            </div>

            <div class="sr-cat-item sr-cat-with-menu">
              <button class="sr-cat-btn">Drawing & Painting</button>
              <div class="sr-cat-menu">
                <a href="/category.html?category=Drawing%20%26%20Painting&sub=Brushes">Brushes</a>
                <a href="/category.html?category=Drawing%20%26%20Painting&sub=Tutorials">Tutorials</a>
              </div>
            </div>

            <div class="sr-cat-item sr-cat-with-menu">
              <button class="sr-cat-btn">Music & Sound Design</button>
              <div class="sr-cat-menu">
                <a href="/category.html?category=Music%20%26%20Sound%20Design&sub=Loops">Loops</a>
                <a href="/category.html?category=Music%20%26%20Sound%20Design&sub=Samples">Samples</a>
                <a href="/category.html?category=Music%20%26%20Sound%20Design&sub=Tracks">Tracks</a>
              </div>
            </div>

            <div class="sr-cat-item sr-cat-with-menu">
              <button class="sr-cat-btn">Films</button>
              <div class="sr-cat-menu">
                <a href="/category.html?category=Films&sub=Stock%20Footage">Stock Footage</a>
                <a href="/category.html?category=Films&sub=Overlays">Overlays</a>
              </div>
            </div>

            <div class="sr-cat-item sr-cat-with-menu">
              <button class="sr-cat-btn">Education</button>
              <div class="sr-cat-menu">
                <a href="/category.html?category=Educational&sub=eBooks">eBooks</a>
                <a href="/category.html?category=Educational&sub=Courses">Courses</a>
                <a href="/category.html?category=Educational&sub=Worksheets">Worksheets</a>
              </div>
            </div>

            <!-- MORE DROPDOWN: remaining categories go here -->
            <div class="sr-cat-item sr-cat-with-menu">
              <button class="sr-cat-btn">More ▾</button>
              <div class="sr-cat-menu">
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

  // ===== LOGOUT HANDLER (DUMMY) =====
  const logoutBtn = headerRoot.querySelector(".sr-logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.setItem("sr_isLoggedIn", "false");
      window.location.href = "/index.html";
    });
  }

  // OPTIONAL: You can also add JS-based hover control if you ever need
  // more complex behavior than the CSS :hover. For now, CSS handles
  // "stay open while mouse moves" by wrapping button+menu together.
})();
