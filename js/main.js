const manifestUrl = 'data/releases.json';

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('smhms-theme', theme);
  const toggle = document.getElementById('themeToggle');
  if (toggle) toggle.setAttribute('aria-pressed', String(theme === 'light'));
}

const savedTheme = localStorage.getItem('smhms-theme');
setTheme(savedTheme || 'dark');

document.getElementById('themeToggle')?.addEventListener('click', () => {
  setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});

window.addEventListener('scroll', () => {
  document.querySelector('.nav')?.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

function assetLink(card, selector, asset) {
  const link = card.querySelector(selector);
  if (!link || !asset?.url) return;
  link.href = asset.url;
  link.classList.remove('disabled');
  link.removeAttribute('aria-disabled');
  link.setAttribute('target', '_blank');
  link.setAttribute('rel', 'noopener');
}

function addChecksum(container, label, hash) {
  if (!hash) return;
  const row = document.createElement('div');
  row.textContent = `${label} SHA-256 · ${hash}`;
  container.appendChild(row);
}

function renderHistory(container, releases) {
  container.replaceChildren();
  releases.forEach((release) => {
    const link = document.createElement('a');
    link.href = release.releaseNotesUrl || '#';
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = `v${release.version} · ${release.publishedAt || '未标注日期'}`;
    container.appendChild(link);
  });
}

function renderProduct(key, product) {
  const card = document.querySelector(`[data-product="${key}"]`);
  if (!card) return;

  const releases = Array.isArray(product.releases) ? product.releases : [];
  const version = card.querySelector('.version');
  if (!releases.length) {
    version.lastChild.textContent = '等待首次发布';
    renderHistory(card.querySelector('.history'), []);
    return;
  }

  const latest = releases[0];
  version.lastChild.textContent = `v${latest.version}`;
  assetLink(card, '.windows', latest.assets?.windows);
  assetLink(card, '.android', latest.assets?.android);

  const checksums = card.querySelector('.checksums');
  checksums.replaceChildren();
  addChecksum(checksums, 'Windows', latest.assets?.windows?.sha256);
  addChecksum(checksums, 'Android', latest.assets?.android?.sha256);
  renderHistory(card.querySelector('.history'), releases);
}

async function loadReleases() {
  const status = document.getElementById('manifestStatus');
  try {
    const response = await fetch(manifestUrl, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const manifest = await response.json();
    Object.entries(manifest.products || {}).forEach(([key, product]) => renderProduct(key, product));
    status.textContent = '版本信息来自三个产品各自独立的发布通道。';
  } catch (error) {
    status.textContent = '暂时无法读取版本清单，请稍后重试或前往 GitHub Releases。';
    console.error('Release manifest unavailable:', error);
  }
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
document.getElementById('currentYear').textContent = String(new Date().getFullYear());
loadReleases();
