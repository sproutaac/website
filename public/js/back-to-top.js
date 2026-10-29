const easeInOutCubic = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
function smoothScrollToTop() {
  const start = window.scrollY;
  let startTime = null;
  function step(ts) {
    if (!startTime) startTime = ts;
    const progress = Math.min((ts - startTime) / 1600, 1);
    window.scrollTo(0, start * (1 - easeInOutCubic(progress)));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
const btt = document.getElementById('back-to-top');
window.addEventListener('scroll', function() {
  btt.classList.toggle('visible', window.scrollY > 300);
}, { passive: true });
btt.addEventListener('click', function() {
  if (navigator.vibrate) navigator.vibrate(40);
  smoothScrollToTop();
});
