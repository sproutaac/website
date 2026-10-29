// Click a swatch to copy its hex code
const toast = document.getElementById('toast');
let toastTimer;
document.querySelectorAll('.swatch').forEach((btn) => {
  btn.setAttribute('aria-label', btn.querySelector('.name').textContent + ' ' + btn.dataset.hex + ', copy hex code');
  btn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(btn.dataset.hex); toast.textContent = btn.dataset.hex + ' copied'; }
    catch { toast.textContent = btn.dataset.hex; }
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  });
});
