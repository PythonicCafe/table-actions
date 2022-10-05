// Toggle if user OS theme setted as dark mode [demo purposes only]
if (window.matchMedia("(prefers-color-scheme: dark)").matches) toggleTheme();
function toggleTheme() {
  document.querySelector("body").classList.toggle("dark");
}
