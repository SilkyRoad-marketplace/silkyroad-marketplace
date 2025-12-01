export async function loadFooter() {
  const root = document.getElementById("footer-root");
  if (!root) return;
  const res = await fetch("/partials/footer.html");
  const html = await res.text();
  root.innerHTML = html;
}
loadFooter();
