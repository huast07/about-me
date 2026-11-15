/* Progressive navigation keeps the soundtrack alive. Each URL is also a complete
   static page for direct visits, refreshes, and browsers without JavaScript. */
(() => {
  if (location.protocol === 'file:') return;
  const base = new URL('../', document.currentScript.src);
  const names = ['index.html', 'research.html', 'industry.html', 'military.html', 'volunteering.html', 'travels.html', 'readings.html'];
  const allowed = new Set(names.map(name => new URL(name, base).pathname));
  const key = url => url.pathname === base.pathname ? new URL('index.html', base).pathname : url.pathname;
  const pages = new Map();
  let current = key(new URL(location.href)), version = 0;
  let homeLoaded = !!document.getElementById('tree'), homeLoading = null;
  const capture = () => ({ node: document.getElementById('page'), title: document.title, className: document.body.className, y: scrollY });
  pages.set(current, capture());
  history.scrollRestoration = 'manual';

  async function loadHome() {
    if (homeLoaded) return;
    for (const name of ['content', 'seasons', 'backdrop', 'tree']) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = new URL(`js/${name}.js`, base);
        script.onload = resolve; script.onerror = reject;
        document.body.appendChild(script);
      });
    }
    homeLoaded = true;
  }

  async function loadTravel() {
    if (document.querySelector('#travel-app[data-ready]')) return;
    for (const name of ['assets/vendor/d3.min.js', 'assets/vendor/topojson-client.min.js', 'js/travel-content.js', 'js/travels.js']) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script'); script.src = new URL(name, base);
        script.onload = resolve; script.onerror = reject; document.body.appendChild(script);
      });
    }
  }

  async function navigate(url, push) {
    const request = ++version, target = key(url);
    try {
      // Let first-time home initialization finish before detaching its DOM.
      if (homeLoading) await homeLoading;
      if (request !== version) return;
      let next = pages.get(target);
      if (!next) {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Page unavailable');
        const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
        const node = doc.getElementById('page');
        if (!node) throw new Error('Page has no navigation container');
        next = { node, title: doc.title, className: doc.body.className, y: 0 };
      }
      if (request !== version) return;
      pages.set(current, capture());
      if (push) history.pushState({}, '', url);
      document.getElementById('page').replaceWith(next.node);
      document.body.className = next.className;
      document.title = next.title;
      current = target;
      pages.set(target, next);
      if (next.node.querySelector('#tree') && !homeLoaded) {
        homeLoading = loadHome();
        await homeLoading;
        homeLoading = null;
      }
      if (next.node.querySelector('#travel-app')) await loadTravel();
      if (request !== version) return;
      dispatchEvent(new CustomEvent('portfolio:pagechange', { detail: { travel: !!next.node.querySelector('#travel-app') } }));
      dispatchEvent(new Event('resize'));
      scrollTo({ top: next.y, behavior: 'instant' });
      const heading = next.node.querySelector('#tree') ? next.node : next.node.querySelector('h1');
      if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
    } catch (error) {
      if (request === version) location.assign(url.href);
    }
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || !allowed.has(key(url)) || url.hash || url.search) return;
    event.preventDefault();
    if (key(url) === current) { scrollTo({ top: 0, behavior: 'smooth' }); return; }
    navigate(url, true);
  });
  addEventListener('popstate', () => navigate(new URL(location.href), false));
})();
