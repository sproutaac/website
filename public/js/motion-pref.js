// Pause-animations preference. Loaded in <head> (not deferred) so the choice
// applies before the first paint. A saved choice wins; otherwise it follows the
// system "Reduce motion" setting. Everything keys off <html data-motion>:
// CSS in /css/motion.css, and page scripts check isMotionReduced().
(function () {
  var KEY = 'motion';
  var root = document.documentElement;
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');

  function saved() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function set(reduce) {
    root.setAttribute('data-motion', reduce ? 'reduce' : 'full');
    document.dispatchEvent(new CustomEvent('motionchange', { detail: { reduce: reduce } }));
  }

  function apply() {
    var choice = saved();
    set(choice ? choice === 'reduce' : mq.matches);
  }

  window.isMotionReduced = function () { return root.getAttribute('data-motion') === 'reduce'; };

  apply();
  if (mq.addEventListener) mq.addEventListener('change', apply);

  function wire() {
    document.querySelectorAll('[data-motion-toggle]').forEach(function (btn) {
      function sync() {
        var reduced = window.isMotionReduced();
        btn.setAttribute('aria-pressed', String(reduced));
        btn.title = reduced ? 'Play animations' : 'Pause animations';
      }
      sync();
      document.addEventListener('motionchange', sync);
      btn.addEventListener('click', function () {
        var reduce = !window.isMotionReduced();
        try { localStorage.setItem(KEY, reduce ? 'reduce' : 'full'); } catch (e) { /* private mode: applies to this page only */ }
        set(reduce);
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();
})();
