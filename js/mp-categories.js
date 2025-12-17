document.addEventListener("DOMContentLoaded", () => {
  const bar = document.getElementById("category-bar");
  if (!bar) return;

  // PAYHIP-STYLE CATEGORIES (MARKETPLACE)
  const CATEGORIES = [
    {
      name: "Ebooks",
      slug: "ebooks",
      subs: ["Business", "Marketing", "Finance", "Health", "Education"]
    },
    {
      name: "Software",
      slug: "software",
      subs: ["Web Apps", "Mobile Apps", "AI Tools", "Automation"]
    },
    {
      name: "Design",
      slug: "design",
      subs: ["UI Kits", "Templates", "Logos", "Branding"]
    },
    {
      name: "Video",
      slug: "video",
      subs: ["Courses", "Stock Video", "Editing Presets"]
    },
    {
      name: "Audio",
      slug: "audio",
      subs: ["Music", "Sound Effects", "Podcasts"]
    }
  ];

  // RENDER CATEGORY BAR
  bar.innerHTML = `
    <div class="cat-inner">
      ${CATEGORIES.map(cat => `
        <div class="cat-item">
          <a href="/marketplace.html?cat=${cat.slug}">
            ${cat.name}
          </a>
          <div class="cat-dropdown">
            ${cat.subs.map(sub => `
              <a href="/marketplace.html?cat=${cat.slug}&sub=${encodeURIComponent(sub)}">
                ${sub}
              </a>
            `).join("")}
          </div>
        </div>
      `).join("")}
    </div>
  `;
});
