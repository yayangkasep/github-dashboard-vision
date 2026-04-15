/**
 * GITVISION - Core Logic
 * Handles GitHub API fetching, UI rendering, and animations.
 */

const API_BASE = "https://api.github.com";

// Elements
const heroSearchInput = document.getElementById('heroSearchInput');
const heroSearchBtn = document.getElementById('heroSearchBtn');
const navSearchInput = document.getElementById('searchInput');
const loadingOverlay = document.getElementById('loadingOverlay');
const dashboard = document.getElementById('dashboard');
const heroSection = document.querySelector('.hero-section');

// Utility: Format numbers (e.g., 1200 -> 1.2k)
const formatNum = (num) => {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num;
};

// --- DATA FETCHING ---
async function fetchGithubData(username) {
  showLoading(true);
  try {
    // 1. Fetch User Profile
    const userRes = await fetch(`${API_BASE}/users/${username}`);
    if (!userRes.ok) throw new Error("User not found");
    const userData = await userRes.json();

    // 2. Fetch Repos
    const reposRes = await fetch(`${API_BASE}/users/${username}/repos?sort=updated&per_page=100`);
    const reposData = await reposRes.json();

    // 3. Process Data
    renderDashboard(userData, reposData);
    startVibeLogs();
    
    // Switch Views
    heroSection.style.display = 'none';
    dashboard.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });

  } catch (err) {
    showToast(err.message || "Error fetching data", "error");
  } finally {
    showLoading(false);
  }
}

// --- RENDER FUNCTIONS ---
function renderDashboard(user, repos) {
  // Profile Header
  document.getElementById('profileAvatar').src = user.avatar_url;
  document.getElementById('profileName').textContent = user.name || user.login;
  document.getElementById('profileLogin').textContent = `@${user.login}`;
  document.getElementById('profileBio').textContent = user.bio || "No bio description provided.";
  document.getElementById('profileTypeBadge').textContent = user.type;
  document.getElementById('profileGhLink').href = user.html_url;

  // Stats
  document.getElementById('followersCount').textContent = formatNum(user.followers);
  document.getElementById('followingCount').textContent = formatNum(user.following);
  document.getElementById('reposCount').textContent = user.public_repos;
  
  const totalStars = repos.reduce((acc, repo) => acc + repo.stargazers_count, 0);
  const totalForks = repos.reduce((acc, repo) => acc + repo.forks_count, 0);
  document.getElementById('totalStars').textContent = formatNum(totalStars);

  // Cards
  document.getElementById('sc-repos').textContent = user.public_repos;
  document.getElementById('sc-stars').textContent = totalStars;
  document.getElementById('sc-forks').textContent = totalForks;
  document.getElementById('sc-followers').textContent = user.followers;

  // Repos List (Top 6 by Stars)
  const topRepos = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 6);
  const reposList = document.getElementById('reposList');
  reposList.innerHTML = topRepos.map(repo => `
    <a href="${repo.html_url}" target="_blank" class="repo-item">
      <div class="repo-name">${repo.name}</div>
      <div class="repo-desc">${repo.description || 'No description.'}</div>
      <div class="repo-meta">
        <div class="rm-item">
          <span class="ld-dot" style="background:${getLangColor(repo.language)}"></span>
          ${repo.language || 'Plain'}
        </div>
        <div class="rm-item">⭐ ${repo.stargazers_count}</div>
        <div class="rm-item">🍴 ${repo.forks_count}</div>
      </div>
    </a>
  `).join('');

  // Languages Breakdown
  renderLanguages(repos);

  // Activity & Topics (Mock or simple based on repos)
  renderTopics(repos);
}

function renderLanguages(repos) {
  const langs = {};
  repos.forEach(r => {
    if (r.language) langs[r.language] = (langs[r.language] || 0) + 1;
  });

  const sortedLangs = Object.entries(langs).sort((a, b) => b[1] - a[1]);
  const langList = document.getElementById('langList');
  
  if (sortedLangs.length > 0) {
    const topLang = sortedLangs[0][0];
    const totalCount = repos.length;
    const pct = Math.round((sortedLangs[0][1] / totalCount) * 100);
    
    document.getElementById('langCenterName').textContent = topLang;
    document.getElementById('langCenterPct').textContent = `${pct}%`;

    langList.innerHTML = sortedLangs.slice(0, 5).map(([name, count]) => `
      <div class="lang-row">
        <div class="lang-name-dot">
          <span class="ld-dot" style="background:${getLangColor(name)}"></span>
          <span>${name}</span>
        </div>
        <span class="section-badge">${Math.round((count/totalCount)*100)}%</span>
      </div>
    `).join('');
  }
}

function renderTopics(repos) {
  const topics = new Set();
  repos.forEach(r => (r.topics || []).forEach(t => topics.add(t)));
  const topicsCloud = document.getElementById('topicsCloud');
  
  if (topics.size > 0) {
    topicsCloud.innerHTML = Array.from(topics).slice(0, 15).map(t => `
      <span class="suggestion-chip" style="margin: 0.2rem">${t}</span>
    `).join('');
  }
}

// --- AI VIBE LOGS ---
function startVibeLogs() {
  const container = document.getElementById('vibeLogs');
  const logs = [
    "[SYS] Analyzing codebase density...",
    "[AI] Applying glassmorphism filters.",
    "[SYS] Optimization: O(log n) achieved.",
    "[AI] Ghost in the shell detected.",
    "[SYS] Neural pathways synchronized.",
    "[AI] Scaling vector assets...",
    "[SYS] Deploying AI-powered UI components."
  ];
  let i = 0;
  setInterval(() => {
    const line = document.createElement('div');
    line.className = 'log-line';
    line.innerHTML = `<span>[VIBE]</span> ${logs[i % logs.length]}`;
    container.appendChild(line);
    if (container.children.length > 8) container.removeChild(container.firstChild);
    i++;
  }, 2000);
}

// Helpers
function getLangColor(lang) {
  const colors = {
    JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5", 
    HTML: "#e34c26", CSS: "#563d7c", Java: "#b07219", Go: "#00ADD8", 
    Rust: "#dea584", "C++": "#f34b7d", PHP: "#4F5D95"
  };
  return colors[lang] || "#94a3b8";
}

function showLoading(show) {
  loadingOverlay.style.display = show ? 'grid' : 'none';
}

function showToast(msg, type = "info") {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// --- EVENT LISTENERS ---
const handleSearch = () => {
  const user = heroSearchInput.value.trim() || navSearchInput.value.trim();
  if (user) fetchGithubData(user);
};

heroSearchBtn.addEventListener('click', handleSearch);
heroSearchInput.addEventListener('keypress', (e) => e.key === 'Enter' && handleSearch());
navSearchInput.addEventListener('keypress', (e) => e.key === 'Enter' && handleSearch());

document.querySelectorAll('.suggestion-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    fetchGithubData(chip.dataset.user);
  });
});

// Particles Effect
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function initParticles() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  particles = Array.from({ length: 50 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2,
    speedX: (Math.random() - 0.5) * 0.5,
    speedY: (Math.random() - 0.5) * 0.5,
    opacity: Math.random()
  }));
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p, index) => {
    p.x += p.speedX;
    p.y += p.speedY;
    if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
    if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
    
    // Neural Connections
    for (let j = index + 1; j < particles.length; j++) {
      const p2 = particles[j];
      const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
      if (dist < 100) {
        ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 * (1 - dist/100)})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }

    ctx.fillStyle = `rgba(124, 58, 237, ${p.opacity * 0.3})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
  requestAnimationFrame(animateParticles);
}

window.addEventListener('resize', initParticles);
initParticles();
animateParticles();

// Navbar Scroll
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (window.scrollY > 50) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
});
