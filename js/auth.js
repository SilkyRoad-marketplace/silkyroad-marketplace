import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const supabase = createClient(
  "https://paqvgsruppgadgguynde.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhcXZnc3J1cHBnYWRnZ3V5bmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNTg3NTMsImV4cCI6MjA3NzkzNDc1M30.pwEE4WLFu2-tHkmH1fFYYwcEPmLPyavN7ykXdPGQ3AY"
);

function toggleElements(selector, show) {
  document.querySelectorAll(selector).forEach((el) => {
    el.style.display = show ? "" : "none";
  });
}

function initMobileToggle() {
  const header = document.querySelector(".sr-header");
  if (!header) return;
  const toggle = header.querySelector(".nav-toggle");
  const panel = header.querySelector(".nav-mobile-panel");
  if (!toggle || !panel) return;

  toggle.addEventListener("click", () => {
    panel.classList.toggle("open");
  });
}

function updateUI(session) {
  const loggedIn = !!session;
  toggleElements('[data-visible="logged-in"]', loggedIn);
  toggleElements('[data-visible="logged-out"]', !loggedIn);
}

export async function initAuthUI() {
  initMobileToggle();

  // Initial session check
  const { data } = await supabase.auth.getSession();
  updateUI(data.session);

  // React to changes (login/logout)
  supabase.auth.onAuthStateChange((_event, session) => {
    updateUI(session);
  });

  const logoutButtons = document.querySelectorAll('[data-auth="logout"]');
  logoutButtons.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      await supabase.auth.signOut();
      window.location.href = "/index.html";
    });
  });
}
