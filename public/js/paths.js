(function (w) {
  function detectBase() {
    const { hostname, pathname } = w.location;
    if (/\.github\.io$/i.test(hostname)) {
      const repo = pathname.split('/').filter(Boolean)[0];
      return repo ? `/${repo}/` : '/';
    }
    return '/';
  }

  const base = detectBase();
  w.RAYUELA_BASE = base;

  w.assetUrl = function (path) {
    if (!path) return '';
    if (/^(https?:|data:|blob:)/i.test(path)) return path;
    return base + String(path).replace(/^\//, '');
  };
})(window);
