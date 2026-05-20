// GitHub API 配置
const GITHUB_REPO = 'goodpcb/smhms-website';

// 从 GitHub API 获取最新版本信息
async function fetchLatestRelease() {
    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
        if (!response.ok) throw new Error('Failed to fetch release info');
        return await response.json();
    } catch (error) {
        console.error('Error fetching release:', error);
        return null;
    }
}

// 更新下载区域的版本信息
function updateDownloadSection(release) {
    if (!release) return;

    const version = release.tag_name || 'Unknown';
    const assets = release.assets || [];

    // 查找 Windows 和 Android APK 文件
    let windowsAsset = assets.find(a => a.name.toLowerCase().includes('windows') || a.name.toLowerCase().endsWith('.zip'));
    let androidAsset = assets.find(a => a.name.toLowerCase().includes('android') || a.name.toLowerCase().includes('.apk'));

    // 更新版本显示
    document.querySelectorAll('.download-version').forEach(el => {
        el.textContent = `版本 ${version}`;
    });

    // 更新 "关于" 区域的版本
    const versionEl = document.querySelector('.stat-number');
    if (versionEl && versionEl.nextElementSibling && versionEl.nextElementSibling.textContent === '当前版本') {
        versionEl.textContent = version;
    }

    // 更新下载链接
    const downloadCards = document.querySelectorAll('.download-card');
    downloadCards.forEach(card => {
        const title = card.querySelector('h3').textContent;
        const link = card.querySelector('.btn-download');

        if (title.includes('Android') && androidAsset) {
            link.href = androidAsset.browser_download_url;
        } else if (title.includes('Windows') && windowsAsset) {
            link.href = windowsAsset.browser_download_url;
        }
    });
}

// 页面加载时获取最新版本
document.addEventListener('DOMContentLoaded', async () => {
    const release = await fetchLatestRelease();
    updateDownloadSection(release);
});

// 主题切换功能
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('.theme-icon');

// 从本地存储读取主题设置
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// 更新导航菜单高亮
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a');

    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// 滚动显示动画
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card, .download-card, .stat-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});
