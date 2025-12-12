export async function loadFooter() {
  const root = document.getElementById("footer-root");
  if (!root) return;
  try {
    const res = await fetch("/partials/footer.html");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    root.innerHTML = html;
  } catch (err) {
    console.error("Failed to load footer partial", err);
  }
}
loadFooter();
