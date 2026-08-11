const manifestUrl = 'data/releases.json';

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('theme', theme);
}

setTheme(localStorage.getItem('theme') || 'light');
document.getElementById('themeToggle').addEventListener('click', () => {
  setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});

function assetLink(card, selector, asset) {
  const link = card.querySelector(selector);
  if (!asset || !asset.url) return;
  link.href = asset.url;
  link.classList.remove('disabled');
  link.removeAttribute('aria-disabled');
}

function renderProduct(key, product) {
  const card = document.querySelector(`[data-product="${key}"]`);
  if (!card) return;
  const releases = Array.isArray(product.releases) ? product.releases : [];
  if (!releases.length) {
    card.querySelector('.version').textContent = '尚未发布';
    return;
  }
  const latest = releases[0];
  card.querySelector('.version').textContent = `v${latest.version}`;
  assetLink(card, '.windows', latest.assets && latest.assets.windows);
  assetLink(card, '.android', latest.assets && latest.assets.android);

  const checksums = card.querySelector('.checksums');
  const values = [];
  if (latest.assets?.windows?.sha256) values.push(`Windows SHA-256: ${latest.assets.windows.sha256}`);
  if (latest.assets?.android?.sha256) values.push(`Android SHA-256: ${latest.assets.android.sha256}`);
  checksums.innerHTML = values.map(value => `<div>${value}</div>`).join('');

  card.querySelector('.history').innerHTML = releases.map(release =>
    `<a href="${release.releaseNotesUrl}" target="_blank" rel="noopener">v${release.version} · ${release.publishedAt || ''}</a>`
  ).join('');
}

async function loadReleases() {
  const status = document.getElementById('manifestStatus');
  try {
    const response = await fetch(manifestUrl, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const manifest = await response.json();
    Object.entries(manifest.products || {}).forEach(([key, product]) => renderProduct(key, product));
    status.textContent = '下载信息来自各产品独立发布通道。';
  } catch (error) {
    status.innerHTML = '暂时无法读取版本清单，请前往 <a href="https://github.com/goodpcb/smhms-website/releases">GitHub Releases</a>。';
    console.error(error);
  }
}

loadReleases();
