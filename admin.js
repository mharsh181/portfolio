/**
 * Harsh Mishra | Portfolio Admin Console Logic
 * Full CRUD, Multi-Source Persistence (Server API, LocalStorage, JSON Export/Import)
 */

// Default Baseline Data
let portfolioData = null;
let isServerConnected = false;
const PASSCODE = 'admin123';

document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initTabNavigation();
    loadPortfolioData();
    initGlobalActionButtons();
});

/* ==========================================================================
   1. Passcode Authentication
   ========================================================================== */
function initAuth() {
    const authOverlay = document.getElementById('auth-overlay');
    const authForm = document.getElementById('auth-form');
    const authInput = document.getElementById('auth-passcode');
    const authError = document.getElementById('auth-error');
    const logoutBtn = document.getElementById('btn-logout');

    const isAuthenticated = sessionStorage.getItem('admin_authenticated') === 'true';

    if (isAuthenticated) {
        authOverlay.classList.add('hidden');
    } else {
        authOverlay.classList.remove('hidden');
    }

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const entered = authInput.value.trim();

        if (entered === PASSCODE) {
            sessionStorage.setItem('admin_authenticated', 'true');
            authOverlay.classList.add('hidden');
            authError.textContent = '';
            showToast('Admin Console Unlocked', 'success');
        } else {
            authError.textContent = 'Invalid security passcode. Please try again.';
            authInput.value = '';
            authInput.focus();
        }
    });

    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('admin_authenticated');
        authOverlay.classList.remove('hidden');
        authInput.value = '';
        showToast('Console Locked', 'info');
    });
}

/* ==========================================================================
   2. Tab Navigation & Mobile Drawer
   ========================================================================== */
function initTabNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    const sidebar = document.getElementById('admin-sidebar');
    const mobileToggle = document.getElementById('mobile-sidebar-toggle');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-tab');
            switchTab(targetId);

            if (window.innerWidth <= 992 && sidebar) {
                sidebar.classList.remove('open');
            }
        });
    });

    if (mobileToggle && sidebar) {
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }
}

function switchTab(tabId) {
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

    const activeTab = document.querySelector(`.nav-tab[data-tab="${tabId}"]`);
    const activePane = document.getElementById(tabId);

    if (activeTab) activeTab.classList.add('active');
    if (activePane) activePane.classList.add('active');
}

/* ==========================================================================
   3. Data Loading & Persistence Detection
   ========================================================================== */
async function loadPortfolioData() {
    updateServerStatus('checking');

    // 1. Try local server API first
    try {
        const res = await fetch('/api/data', { cache: 'no-store' });
        if (res.ok) {
            portfolioData = await res.json();
            isServerConnected = true;
            updateServerStatus('connected');
            renderAllTabs();
            return;
        }
    } catch (e) {
        // Server not running, fallback to static / localStorage
    }

    // 2. Try browser localStorage
    const localSaved = localStorage.getItem('portfolio_custom_data');
    if (localSaved) {
        try {
            portfolioData = JSON.parse(localSaved);
            updateServerStatus('browser');
            renderAllTabs();
            return;
        } catch (e) {
            console.warn('Failed parsing localStorage data', e);
        }
    }

    // 3. Try fetching static portfolio-data.json
    try {
        const staticRes = await fetch('portfolio-data.json', { cache: 'no-store' });
        if (staticRes.ok) {
            portfolioData = await staticRes.json();
            updateServerStatus('browser');
            renderAllTabs();
            return;
        }
    } catch (e) {
        console.warn('Failed fetching static portfolio-data.json', e);
    }

    // 4. Ultimate Fallback: Embedded Baseline Data
    portfolioData = getBaselineData();
    updateServerStatus('browser');
    renderAllTabs();
}

function updateServerStatus(status) {
    const pill = document.getElementById('server-status-pill');
    const text = document.getElementById('server-status-text');
    const guideBox = document.getElementById('persistence-guide-box');

    if (status === 'connected') {
        pill.className = 'server-status connected';
        text.textContent = 'Disk Server Active (localhost)';
        if (guideBox) {
            guideBox.innerHTML = `
                <p><i class="fa-solid fa-circle-check" style="color:var(--accent-emerald);"></i> <strong>Live Disk Persistence is Active!</strong></p>
                <p>Changes you save will write directly to <code>portfolio-data.json</code> on your computer. When you reload or publish to GitHub Pages, the latest data will be live.</p>
            `;
        }
    } else if (status === 'browser') {
        pill.className = 'server-status disconnected';
        text.textContent = 'Browser Storage Mode';
        if (guideBox) {
            guideBox.innerHTML = `
                <p><i class="fa-solid fa-circle-info" style="color:var(--accent-amber);"></i> <strong>Running in Browser Storage Mode</strong></p>
                <p>Changes will save to this browser's <code>LocalStorage</code> and reflect immediately on your portfolio. To write directly to files on disk, run <code>python admin_server.py</code> in this directory.</p>
            `;
        }
    } else {
        pill.className = 'server-status';
        text.textContent = 'Checking Server...';
    }
}

/* ==========================================================================
   4. Renderers for All Tabs
   ========================================================================== */
function renderAllTabs() {
    if (!portfolioData) return;
    renderDashboard();
    renderProfile();
    renderMetrics();
    renderSocials();
    renderExperience();
    renderProjects();
    renderAiSimulator();
    renderSkills();
    renderEducation();
}

// 4.1 Dashboard Overview
function renderDashboard() {
    document.getElementById('count-exp').textContent = portfolioData.experience ? portfolioData.experience.length : 0;
    document.getElementById('count-proj').textContent = portfolioData.projects ? portfolioData.projects.length : 0;
    document.getElementById('count-ai').textContent = portfolioData.aiSimulator ? portfolioData.aiSimulator.length : 0;

    document.getElementById('stat-proj-num').textContent = portfolioData.projects ? portfolioData.projects.length : 0;
    document.getElementById('stat-exp-num').textContent = portfolioData.experience ? portfolioData.experience.length : 0;
    document.getElementById('stat-ai-num').textContent = portfolioData.aiSimulator ? portfolioData.aiSimulator.length : 0;
    document.getElementById('stat-cert-num').textContent = portfolioData.certificates ? portfolioData.certificates.length : 0;

    const statusToggle = document.getElementById('dash-status-toggle');
    const statusLabel = document.getElementById('dash-status-label');
    const isOpen = portfolioData.profile && portfolioData.profile.status ? portfolioData.profile.status.toLowerCase().includes('open') : true;

    statusToggle.checked = isOpen;
    statusLabel.textContent = portfolioData.profile.status || 'Open to AI/ML Roles';

    statusToggle.onchange = () => {
        portfolioData.profile.status = statusToggle.checked ? 'Open to AI/ML Roles' : 'Not Currently Looking';
        statusLabel.textContent = portfolioData.profile.status;
        document.getElementById('prof-status').value = portfolioData.profile.status;
        showToast(`Status updated: ${portfolioData.profile.status}`, 'info');
    };
}

// 4.2 Profile & Hero Editor
function renderProfile() {
    const prof = portfolioData.profile || {};

    document.getElementById('prof-name').value = prof.name || '';
    document.getElementById('prof-status').value = prof.status || '';
    document.getElementById('prof-desc').value = prof.heroDesc || '';
    document.getElementById('prof-location').value = prof.location || '';
    document.getElementById('prof-availability').value = prof.availability || '';
    document.getElementById('prof-degree').value = prof.degree || '';
    document.getElementById('prof-undergrad').value = prof.undergrad || '';
    document.getElementById('prof-stack').value = prof.primaryStack || '';
    document.getElementById('prof-focus').value = prof.aiFocus || '';
    document.getElementById('prof-philosophy').value = prof.philosophy || '';

    // Render Typewriter dynamic phrases
    renderTypewriterList(prof.typingStrings || []);
}

function renderTypewriterList(strings) {
    const container = document.getElementById('typewriter-list');
    container.innerHTML = '';

    strings.forEach((str, idx) => {
        const row = document.createElement('div');
        row.className = 'dynamic-item-row';
        row.innerHTML = `
            <input type="text" class="form-control typewriter-input" value="${escapeHtml(str)}">
            <button type="button" class="btn-remove-item" title="Remove phrase" onclick="removeTypewriterPhrase(${idx})">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        container.appendChild(row);
    });

    document.getElementById('btn-add-typewriter').onclick = () => {
        if (!portfolioData.profile.typingStrings) portfolioData.profile.typingStrings = [];
        portfolioData.profile.typingStrings.push('New Skill Phrase');
        renderTypewriterList(portfolioData.profile.typingStrings);
    };
}

function removeTypewriterPhrase(idx) {
    gatherProfileFromInputs();
    portfolioData.profile.typingStrings.splice(idx, 1);
    renderTypewriterList(portfolioData.profile.typingStrings);
}

function gatherProfileFromInputs() {
    if (!portfolioData.profile) portfolioData.profile = {};
    portfolioData.profile.name = document.getElementById('prof-name').value.trim();
    portfolioData.profile.status = document.getElementById('prof-status').value.trim();
    portfolioData.profile.heroDesc = document.getElementById('prof-desc').value.trim();
    portfolioData.profile.location = document.getElementById('prof-location').value.trim();
    portfolioData.profile.availability = document.getElementById('prof-availability').value.trim();
    portfolioData.profile.degree = document.getElementById('prof-degree').value.trim();
    portfolioData.profile.undergrad = document.getElementById('prof-undergrad').value.trim();
    portfolioData.profile.primaryStack = document.getElementById('prof-stack').value.trim();
    portfolioData.profile.aiFocus = document.getElementById('prof-focus').value.trim();
    portfolioData.profile.philosophy = document.getElementById('prof-philosophy').value.trim();

    const phrases = [];
    document.querySelectorAll('.typewriter-input').forEach(inp => {
        if (inp.value.trim()) phrases.push(inp.value.trim());
    });
    portfolioData.profile.typingStrings = phrases;
}

// 4.3 Metrics Editor
function renderMetrics() {
    const container = document.getElementById('metrics-editor-container');
    container.innerHTML = '';

    const metrics = portfolioData.metrics || [];
    metrics.forEach((m, idx) => {
        const card = document.createElement('div');
        card.className = 'metric-edit-card';
        card.innerHTML = `
            <div class="metric-card-title">Metric Slot #${idx + 1}</div>
            <div class="form-group">
                <label>Value / Highlight</label>
                <input type="text" class="form-control metric-val-input" data-index="${idx}" value="${escapeHtml(m.val)}">
            </div>
            <div class="form-group" style="margin-bottom:0;">
                <label>Label / Subtitle</label>
                <input type="text" class="form-control metric-lbl-input" data-index="${idx}" value="${escapeHtml(m.lbl)}">
            </div>
        `;
        container.appendChild(card);
    });
}

function gatherMetricsFromInputs() {
    const vals = document.querySelectorAll('.metric-val-input');
    const lbls = document.querySelectorAll('.metric-lbl-input');
    portfolioData.metrics = [];

    vals.forEach((vInput, i) => {
        portfolioData.metrics.push({
            val: vInput.value.trim(),
            lbl: lbls[i] ? lbls[i].value.trim() : ''
        });
    });
}

// 4.4 Socials & Resume
function renderSocials() {
    const soc = portfolioData.socials || {};
    const res = portfolioData.resume || {};

    document.getElementById('soc-email').value = soc.email || '';
    document.getElementById('soc-phone').value = soc.phone || '';
    document.getElementById('soc-linkedin').value = soc.linkedin || '';
    document.getElementById('soc-github').value = soc.github || '';
    document.getElementById('soc-blog').value = soc.blog || '';

    document.getElementById('res-pdf').value = res.pdf || '';
    document.getElementById('res-html').value = res.html || '';
}

function gatherSocialsFromInputs() {
    portfolioData.socials = {
        email: document.getElementById('soc-email').value.trim(),
        phone: document.getElementById('soc-phone').value.trim(),
        linkedin: document.getElementById('soc-linkedin').value.trim(),
        github: document.getElementById('soc-github').value.trim(),
        blog: document.getElementById('soc-blog').value.trim()
    };
    portfolioData.resume = {
        pdf: document.getElementById('res-pdf').value.trim(),
        html: document.getElementById('res-html').value.trim()
    };
}

// 4.5 Experience Manager
function renderExperience() {
    const container = document.getElementById('experience-list-container');
    container.innerHTML = '';

    const list = portfolioData.experience || [];

    list.forEach((exp, expIdx) => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div class="item-card-header">
                <div class="item-title-group">
                    <span class="badge-tag">${escapeHtml(exp.period || '')}</span>
                    <span class="item-title">${escapeHtml(exp.role || 'Position')}</span>
                </div>
                <div class="item-card-actions">
                    <button type="button" class="btn btn-danger btn-xs" onclick="deleteExperience(${expIdx})">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </div>
            </div>
            <div class="item-card-body">
                <div class="form-row">
                    <div class="form-group">
                        <label>Role / Job Title</label>
                        <input type="text" class="form-control exp-role" data-exp="${expIdx}" value="${escapeHtml(exp.role)}">
                    </div>
                    <div class="form-group">
                        <label>Organization / Ministry</label>
                        <input type="text" class="form-control exp-company" data-exp="${expIdx}" value="${escapeHtml(exp.company)}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Period / Duration</label>
                        <input type="text" class="form-control exp-period" data-exp="${expIdx}" value="${escapeHtml(exp.period)}">
                    </div>
                    <div class="form-group">
                        <label>Location</label>
                        <input type="text" class="form-control exp-loc" data-exp="${expIdx}" value="${escapeHtml(exp.location)}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Badge Header (e.g. Government of India)</label>
                    <input type="text" class="form-control exp-badge-input" data-exp="${expIdx}" value="${escapeHtml(exp.badge || '')}">
                </div>
                <div class="form-group">
                    <label>Overall Summary</label>
                    <textarea class="form-control exp-summary" data-exp="${expIdx}" rows="2">${escapeHtml(exp.summary || '')}</textarea>
                </div>

                <!-- Deliverables List -->
                <div class="form-group">
                    <label>Key Impact Deliverables / Achievements</label>
                    <div class="deliverables-sublist" id="deliverables-sublist-${expIdx}">
                        ${renderDeliverablesHTML(exp.deliverables || [], expIdx)}
                    </div>
                    <button type="button" class="btn btn-outline btn-xs" style="margin-top:0.5rem;" onclick="addDeliverable(${expIdx})">
                        <i class="fa-solid fa-plus"></i> Add Deliverable
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    document.getElementById('btn-add-exp').onclick = () => {
        gatherExperienceFromInputs();
        portfolioData.experience.push({
            id: 'exp-' + Date.now(),
            role: 'AI/ML Engineer',
            company: 'Company / Organization Name',
            badge: 'Enterprise / Industry',
            period: 'Jan 2026 – Present',
            location: 'Remote / Hybrid',
            summary: 'Summary of contributions and impact.',
            deliverables: [
                {
                    title: 'Core Achievement',
                    desc: 'Detailed description of the technical work done.',
                    tag: 'Python · FastAPI · LLMs'
                }
            ]
        });
        renderExperience();
        renderDashboard();
    };
}

function renderDeliverablesHTML(deliverables, expIdx) {
    return deliverables.map((d, dIdx) => `
        <div class="dynamic-item-row" style="margin-bottom:0.6rem; align-items:flex-start;">
            <div style="flex-grow:1; display:flex; flex-direction:column; gap:0.3rem;">
                <input type="text" class="form-control d-title-input" placeholder="Deliverable Title" value="${escapeHtml(d.title)}">
                <textarea class="form-control d-desc-input" rows="2" placeholder="Description">${escapeHtml(d.desc)}</textarea>
                <input type="text" class="form-control d-tag-input" placeholder="Tech Tags (e.g. Python · RAG)" value="${escapeHtml(d.tag)}">
            </div>
            <button type="button" class="btn-remove-item" onclick="removeDeliverable(${expIdx}, ${dIdx})">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `).join('');
}

function addDeliverable(expIdx) {
    gatherExperienceFromInputs();
    portfolioData.experience[expIdx].deliverables.push({
        title: 'New Achievement Title',
        desc: 'Description of technical implementation.',
        tag: 'Tech · Stack'
    });
    renderExperience();
}

function removeDeliverable(expIdx, dIdx) {
    gatherExperienceFromInputs();
    portfolioData.experience[expIdx].deliverables.splice(dIdx, 1);
    renderExperience();
}

function deleteExperience(expIdx) {
    if (confirm('Are you sure you want to remove this experience position?')) {
        gatherExperienceFromInputs();
        portfolioData.experience.splice(expIdx, 1);
        renderExperience();
        renderDashboard();
    }
}

function gatherExperienceFromInputs() {
    const expCards = document.querySelectorAll('#experience-list-container .item-card');
    portfolioData.experience = [];

    expCards.forEach((card, idx) => {
        const role = card.querySelector('.exp-role').value.trim();
        const company = card.querySelector('.exp-company').value.trim();
        const period = card.querySelector('.exp-period').value.trim();
        const location = card.querySelector('.exp-loc').value.trim();
        const badge = card.querySelector('.exp-badge-input').value.trim();
        const summary = card.querySelector('.exp-summary').value.trim();

        const deliverables = [];
        card.querySelectorAll('.deliverables-sublist .dynamic-item-row').forEach(dRow => {
            deliverables.push({
                title: dRow.querySelector('.d-title-input').value.trim(),
                desc: dRow.querySelector('.d-desc-input').value.trim(),
                tag: dRow.querySelector('.d-tag-input').value.trim()
            });
        });

        portfolioData.experience.push({
            id: 'exp-' + (idx + 1),
            role, company, period, location, badge, summary, deliverables
        });
    });
}

// 4.6 Projects Manager
function renderProjects() {
    const container = document.getElementById('projects-list-container');
    container.innerHTML = '';

    const list = portfolioData.projects || [];

    list.forEach((proj, projIdx) => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div class="item-card-header">
                <div class="item-title-group">
                    <span class="badge-tag">${escapeHtml(proj.category.toUpperCase())}</span>
                    <span class="item-title">${escapeHtml(proj.title || 'Project Title')}</span>
                </div>
                <div class="item-card-actions">
                    <button type="button" class="btn btn-danger btn-xs" onclick="deleteProject(${projIdx})">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </div>
            </div>
            <div class="item-card-body">
                <div class="form-row">
                    <div class="form-group">
                        <label>Project Title</label>
                        <input type="text" class="form-control proj-title" value="${escapeHtml(proj.title)}">
                    </div>
                    <div class="form-group">
                        <label>Category Filter</label>
                        <select class="form-control proj-cat">
                            <option value="genai" ${proj.category === 'genai' ? 'selected' : ''}>Generative AI & RAG</option>
                            <option value="cv" ${proj.category === 'cv' ? 'selected' : ''}>Computer Vision & DL</option>
                            <option value="ml" ${proj.category === 'ml' ? 'selected' : ''}>Machine Learning & Data</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Badge Callout (e.g. Flagship GenAI)</label>
                        <input type="text" class="form-control proj-badge" value="${escapeHtml(proj.badge || '')}">
                    </div>
                    <div class="form-group">
                        <label>Timeline / Date</label>
                        <input type="text" class="form-control proj-date" value="${escapeHtml(proj.date || '')}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Headline Subtitle</label>
                    <input type="text" class="form-control proj-headline" value="${escapeHtml(proj.headline || '')}">
                </div>
                <div class="form-group">
                    <label>Overview Description</label>
                    <textarea class="form-control proj-desc" rows="2">${escapeHtml(proj.desc || '')}</textarea>
                </div>

                <div class="form-group">
                    <label>Architecture Flow Steps (comma-separated, e.g. "Input, Vector Search, LLM, Output")</label>
                    <input type="text" class="form-control proj-arch" value="${escapeHtml((proj.archFlow || []).join(', '))}">
                </div>

                <div class="form-group">
                    <label>Key Features / Bullet Points (one per line)</label>
                    <textarea class="form-control proj-features" rows="3">${escapeHtml((proj.features || []).join('\n'))}</textarea>
                </div>

                <div class="form-group">
                    <label>Tech Stack Tags (comma-separated, e.g. "Python, FastAPI, Ollama")</label>
                    <input type="text" class="form-control proj-tags" value="${escapeHtml((proj.tags || []).join(', '))}">
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>GitHub Repository URL</label>
                        <input type="url" class="form-control proj-repo" value="${escapeHtml(proj.repoUrl || '')}">
                    </div>
                    <div class="form-group">
                        <label>AI Terminal Question Prompt</label>
                        <input type="text" class="form-control proj-ask" value="${escapeHtml(proj.askPrompt || '')}">
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    document.getElementById('btn-add-project').onclick = () => {
        gatherProjectsFromInputs();
        portfolioData.projects.push({
            id: 'proj-' + Date.now(),
            title: 'New AI/ML System',
            category: 'genai',
            badge: 'Generative AI',
            date: 'Jan 2026 – Present',
            headline: 'Brief technical description of architecture',
            desc: 'Detailed overview of the engineering approach and model performance.',
            archFlow: ['Input', 'Model', 'API', 'Output'],
            features: [
                'High performance processing with low inference latency.',
                'Modular scalable architecture.'
            ],
            tags: ['Python', 'PyTorch', 'FastAPI'],
            repoUrl: 'https://github.com/mharsh181',
            askPrompt: 'Explain this new AI system.'
        });
        renderProjects();
        renderDashboard();
    };
}

function deleteProject(projIdx) {
    if (confirm('Are you sure you want to delete this project?')) {
        gatherProjectsFromInputs();
        portfolioData.projects.splice(projIdx, 1);
        renderProjects();
        renderDashboard();
    }
}

function gatherProjectsFromInputs() {
    const cards = document.querySelectorAll('#projects-list-container .item-card');
    portfolioData.projects = [];

    cards.forEach((card, idx) => {
        const title = card.querySelector('.proj-title').value.trim();
        const category = card.querySelector('.proj-cat').value;
        const badge = card.querySelector('.proj-badge').value.trim();
        const date = card.querySelector('.proj-date').value.trim();
        const headline = card.querySelector('.proj-headline').value.trim();
        const desc = card.querySelector('.proj-desc').value.trim();
        const archFlow = card.querySelector('.proj-arch').value.split(',').map(s => s.trim()).filter(Boolean);
        const features = card.querySelector('.proj-features').value.split('\n').map(s => s.trim()).filter(Boolean);
        const tags = card.querySelector('.proj-tags').value.split(',').map(s => s.trim()).filter(Boolean);
        const repoUrl = card.querySelector('.proj-repo').value.trim();
        const askPrompt = card.querySelector('.proj-ask').value.trim();

        portfolioData.projects.push({
            id: 'proj-' + (idx + 1),
            title, category, badge, date, headline, desc, archFlow, features, tags, repoUrl, askPrompt
        });
    });
}

// 4.7 AI Simulator Knowledge Base
function renderAiSimulator() {
    const container = document.getElementById('ai-simulator-list-container');
    container.innerHTML = '';

    const list = portfolioData.aiSimulator || [];

    list.forEach((item, idx) => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div class="item-card-header">
                <div class="item-title-group">
                    <span class="badge-tag">AI Preset #${idx + 1}</span>
                    <span class="item-title">${escapeHtml(item.prompt || 'Prompt')}</span>
                </div>
                <div class="item-card-actions">
                    <button type="button" class="btn btn-danger btn-xs" onclick="deleteAiItem(${idx})">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </div>
            </div>
            <div class="item-card-body">
                <div class="form-row">
                    <div class="form-group">
                        <label>Prompt Button Chip Title</label>
                        <input type="text" class="form-control ai-prompt" value="${escapeHtml(item.prompt || '')}">
                    </div>
                    <div class="form-group">
                        <label>Trigger Keywords (comma-separated)</label>
                        <input type="text" class="form-control ai-keywords" value="${escapeHtml((item.keywords || []).join(', '))}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Agent Response (Rich HTML supported: &lt;strong&gt;, &lt;br&gt;, &lt;a&gt;)</label>
                    <textarea class="form-control ai-response" rows="4">${escapeHtml(item.response || '')}</textarea>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    document.getElementById('btn-add-ai').onclick = () => {
        gatherAiFromInputs();
        portfolioData.aiSimulator.push({
            id: 'ai-' + Date.now(),
            prompt: '🤖 New AI Prompt',
            keywords: ['topic', 'keyword'],
            response: '<strong>Title:</strong><br>Detailed technical explanation provided by the AI agent.'
        });
        renderAiSimulator();
        renderDashboard();
    };
}

function deleteAiItem(idx) {
    if (confirm('Delete this AI prompt & response scenario?')) {
        gatherAiFromInputs();
        portfolioData.aiSimulator.splice(idx, 1);
        renderAiSimulator();
        renderDashboard();
    }
}

function gatherAiFromInputs() {
    const cards = document.querySelectorAll('#ai-simulator-list-container .item-card');
    portfolioData.aiSimulator = [];

    cards.forEach((card, idx) => {
        const prompt = card.querySelector('.ai-prompt').value.trim();
        const keywords = card.querySelector('.ai-keywords').value.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
        const response = card.querySelector('.ai-response').value.trim();

        portfolioData.aiSimulator.push({
            id: 'ai-' + (idx + 1),
            prompt, keywords, response
        });
    });
}

// 4.8 Skills Matrix
function renderSkills() {
    const container = document.getElementById('skills-list-container');
    container.innerHTML = '';

    const list = portfolioData.skills || [];

    list.forEach((cat, idx) => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div class="item-card-header">
                <div class="item-title-group">
                    <span class="badge-tag">Category #${idx + 1}</span>
                    <span class="item-title">${escapeHtml(cat.title)}</span>
                </div>
                <div class="item-card-actions">
                    <button type="button" class="btn btn-danger btn-xs" onclick="deleteSkillCategory(${idx})">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </div>
            </div>
            <div class="item-card-body">
                <div class="form-row">
                    <div class="form-group">
                        <label>Category Title</label>
                        <input type="text" class="form-control skill-title" value="${escapeHtml(cat.title)}">
                    </div>
                    <div class="form-group">
                        <label>FontAwesome Icon (e.g. fa-brain, fa-eye, fa-database)</label>
                        <input type="text" class="form-control skill-icon" value="${escapeHtml(cat.icon || 'fa-code')}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Subtitle / Domain Callout</label>
                    <input type="text" class="form-control skill-subtitle" value="${escapeHtml(cat.subtitle || '')}">
                </div>
                <div class="form-group">
                    <label>Technology Badges (comma-separated)</label>
                    <textarea class="form-control skill-badges" rows="2">${escapeHtml((cat.badges || []).join(', '))}</textarea>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    document.getElementById('btn-add-skill-cat').onclick = () => {
        gatherSkillsFromInputs();
        portfolioData.skills.push({
            id: 'skill-' + Date.now(),
            title: 'New Skill Category',
            icon: 'fa-microchip',
            iconClass: 'genai-icon',
            subtitle: 'Domain Focus',
            badges: ['Skill 1', 'Skill 2', 'Skill 3']
        });
        renderSkills();
    };
}

function deleteSkillCategory(idx) {
    if (confirm('Delete this skill category?')) {
        gatherSkillsFromInputs();
        portfolioData.skills.splice(idx, 1);
        renderSkills();
    }
}

function gatherSkillsFromInputs() {
    const cards = document.querySelectorAll('#skills-list-container .item-card');
    portfolioData.skills = [];

    cards.forEach((card, idx) => {
        const title = card.querySelector('.skill-title').value.trim();
        const icon = card.querySelector('.skill-icon').value.trim();
        const subtitle = card.querySelector('.skill-subtitle').value.trim();
        const badges = card.querySelector('.skill-badges').value.split(',').map(s => s.trim()).filter(Boolean);

        portfolioData.skills.push({
            id: 'skill-' + (idx + 1),
            title, icon, subtitle, badges
        });
    });
}

// 4.9 Education & Certifications
function renderEducation() {
    const eduContainer = document.getElementById('education-list-container');
    const certContainer = document.getElementById('certs-list-container');

    eduContainer.innerHTML = '';
    certContainer.innerHTML = '';

    // Degrees
    (portfolioData.education || []).forEach((edu, idx) => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div class="item-card-header">
                <span class="item-title">${escapeHtml(edu.degree)}</span>
                <button type="button" class="btn btn-danger btn-xs" onclick="deleteDegree(${idx})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
            <div class="item-card-body">
                <div class="form-group">
                    <label>Degree Title</label>
                    <input type="text" class="form-control edu-degree" value="${escapeHtml(edu.degree)}">
                </div>
                <div class="form-group">
                    <label>Institution</label>
                    <input type="text" class="form-control edu-inst" value="${escapeHtml(edu.institution)}">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Timeline / Years</label>
                        <input type="text" class="form-control edu-duration" value="${escapeHtml(edu.duration)}">
                    </div>
                    <div class="form-group">
                        <label>CGPA / Grade</label>
                        <input type="text" class="form-control edu-cgpa" value="${escapeHtml(edu.cgpa)}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Notes / Focus Areas</label>
                    <textarea class="form-control edu-notes" rows="2">${escapeHtml(edu.notes || '')}</textarea>
                </div>
            </div>
        `;
        eduContainer.appendChild(card);
    });

    // Certs
    (portfolioData.certificates || []).forEach((cert, idx) => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div class="item-card-header">
                <span class="item-title">${escapeHtml(cert.title)}</span>
                <button type="button" class="btn btn-danger btn-xs" onclick="deleteCert(${idx})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
            <div class="item-card-body">
                <div class="form-group">
                    <label>Certificate Name</label>
                    <input type="text" class="form-control cert-title" value="${escapeHtml(cert.title)}">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Issuer / Platform</label>
                        <input type="text" class="form-control cert-issuer" value="${escapeHtml(cert.issuer)}">
                    </div>
                    <div class="form-group">
                        <label>Issue Date</label>
                        <input type="text" class="form-control cert-duration" value="${escapeHtml(cert.duration)}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Verification Link URL</label>
                    <input type="url" class="form-control cert-url" value="${escapeHtml(cert.verifyUrl || '')}">
                </div>
                <div class="form-group">
                    <label>Description Notes</label>
                    <textarea class="form-control cert-notes" rows="2">${escapeHtml(cert.notes || '')}</textarea>
                </div>
            </div>
        `;
        certContainer.appendChild(card);
    });

    document.getElementById('btn-add-edu').onclick = () => {
        gatherEducationFromInputs();
        portfolioData.education.push({
            id: 'edu-' + Date.now(),
            degree: 'Degree / Qualification',
            institution: 'University / College',
            duration: '2024 – 2026',
            cgpa: '8.00 / 10',
            notes: 'Coursework and academic focus areas.'
        });
        renderEducation();
    };

    document.getElementById('btn-add-cert').onclick = () => {
        gatherEducationFromInputs();
        portfolioData.certificates.push({
            id: 'cert-' + Date.now(),
            title: 'Certification Name',
            issuer: 'Issuing Organization',
            duration: 'Issued: 2025',
            verifyUrl: 'https://',
            notes: 'Skills verified by credential.',
            platform: 'Verified',
            icon: 'fa-certificate',
            type: 'ibm'
        });
        renderEducation();
    };
}

function deleteDegree(idx) {
    if (confirm('Delete this degree entry?')) {
        gatherEducationFromInputs();
        portfolioData.education.splice(idx, 1);
        renderEducation();
    }
}

function deleteCert(idx) {
    if (confirm('Delete this certificate entry?')) {
        gatherEducationFromInputs();
        portfolioData.certificates.splice(idx, 1);
        renderEducation();
        renderDashboard();
    }
}

function gatherEducationFromInputs() {
    const eduCards = document.querySelectorAll('#education-list-container .item-card');
    portfolioData.education = [];
    eduCards.forEach((card, idx) => {
        portfolioData.education.push({
            id: 'edu-' + (idx + 1),
            degree: card.querySelector('.edu-degree').value.trim(),
            institution: card.querySelector('.edu-inst').value.trim(),
            duration: card.querySelector('.edu-duration').value.trim(),
            cgpa: card.querySelector('.edu-cgpa').value.trim(),
            notes: card.querySelector('.edu-notes').value.trim()
        });
    });

    const certCards = document.querySelectorAll('#certs-list-container .item-card');
    portfolioData.certificates = [];
    certCards.forEach((card, idx) => {
        portfolioData.certificates.push({
            id: 'cert-' + (idx + 1),
            title: card.querySelector('.cert-title').value.trim(),
            issuer: card.querySelector('.cert-issuer').value.trim(),
            duration: card.querySelector('.cert-duration').value.trim(),
            verifyUrl: card.querySelector('.cert-url').value.trim(),
            notes: card.querySelector('.cert-notes').value.trim(),
            platform: 'Verified',
            icon: 'fa-certificate',
            type: 'ibm'
        });
    });
}

/* ==========================================================================
   5. Save, Export & Backup Actions
   ========================================================================== */
function gatherAllInputs() {
    gatherProfileFromInputs();
    gatherMetricsFromInputs();
    gatherSocialsFromInputs();
    gatherExperienceFromInputs();
    gatherProjectsFromInputs();
    gatherAiFromInputs();
    gatherSkillsFromInputs();
    gatherEducationFromInputs();
}

function initGlobalActionButtons() {
    // Top Save All Button
    document.getElementById('btn-save-all').addEventListener('click', () => {
        saveAllData();
    });

    // Quick Export Button in Topbar
    document.getElementById('btn-quick-export').addEventListener('click', () => {
        downloadJsonFile();
    });

    // Save to Disk Button in Backup Tab
    document.getElementById('btn-save-disk').addEventListener('click', () => {
        saveAllData();
    });

    // Download JSON Button in Backup Tab
    document.getElementById('btn-download-json').addEventListener('click', () => {
        downloadJsonFile();
    });

    // File Import Button in Backup Tab
    const importInput = document.getElementById('file-import-input');
    importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                if (imported.profile && imported.projects) {
                    portfolioData = imported;
                    saveAllData();
                    renderAllTabs();
                    showToast('Configuration imported successfully!', 'success');
                } else {
                    showToast('Invalid portfolio-data.json structure', 'error');
                }
            } catch (err) {
                showToast('Error parsing JSON file: ' + err.message, 'error');
            }
        };
        reader.readAsText(file);
    });

    // Factory Reset Button
    document.getElementById('btn-factory-reset').addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all data back to the 8-Sept factory baseline? All custom changes will be overwritten.')) {
            portfolioData = getBaselineData();
            saveAllData();
            renderAllTabs();
            showToast('All portfolio data restored to 8-Sept baseline.', 'info');
        }
    });
}

async function saveAllData() {
    gatherAllInputs();

    // 1. Save to LocalStorage immediately
    localStorage.setItem('portfolio_custom_data', JSON.stringify(portfolioData));

    // 2. If server is active, attempt to write directly to disk
    try {
        const res = await fetch('/api/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(portfolioData)
        });

        if (res.ok) {
            updateServerStatus('connected');
            showToast('Saved to disk (portfolio-data.json) & LocalStorage!', 'success');
            return;
        }
    } catch (e) {
        // Server not reachable
    }

    updateServerStatus('browser');
    showToast('Saved to Browser Storage! (Download JSON to commit to GitHub)', 'info');
}

function downloadJsonFile() {
    gatherAllInputs();
    const jsonStr = JSON.stringify(portfolioData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('portfolio-data.json downloaded!', 'success');
}

/* ==========================================================================
   6. Toast Notifications Utility
   ========================================================================== */
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-triangle-exclamation';
    if (type === 'info') icon = 'fa-circle-info';

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/* ==========================================================================
   7. Baseline 8-Sept Resume Data
   ========================================================================== */
function getBaselineData() {
    return {
        profile: {
            name: "Harsh Mishra",
            status: "Open to AI/ML Roles",
            typingStrings: [
                "AI / ML Engineering",
                "Generative AI & RAG Architectures",
                "Autonomous LLM Agents",
                "Computer Vision & Deep Learning",
                "Scalable FastAPI Backends"
            ],
            heroDesc: "Results-driven AI/ML Engineer with hands-on expertise architecting autonomous LLM agents, enterprise RAG pipelines, and computer vision systems. Ex-Tech Intern at CGPDTM (Ministry of Commerce & Industry) developing production conversational AI and Text-to-SQL engines.",
            location: "Bilaspur / Delhi, India",
            degree: "MCA (CGPA: 8.00 / 10)",
            undergrad: "B.Sc Computer Science Hons (7.78)",
            primaryStack: "Python, FastAPI, PyTorch, scikit-learn",
            aiFocus: "GenAI, RAG, NLP, Computer Vision",
            availability: "Available Immediately",
            philosophy: "I build AI systems designed for the real world — focusing not just on model benchmarks, but on latency, hallucination mitigation, secure context retrieval, and robust API integration."
        },
        metrics: [
            { val: "CGPDTM", lbl: "Tech Intern (AI/ML)" },
            { val: "8.00", lbl: "MCA CGPA (GGV)" },
            { val: "100k+", lbl: "Data Records Modeled" },
            { val: "3+", lbl: "Flagship AI Systems" }
        ],
        socials: {
            github: "https://github.com/mharsh181",
            linkedin: "https://linkedin.com/in/harshmishra95",
            email: "mharsh181@gmail.com",
            phone: "+91-6266384539",
            blog: "https://computervigyanofficial.blogspot.com/"
        },
        resume: {
            pdf: "Harsh_Mishra_resume-8sept.pdf",
            html: "harsh_mishra_resume.html"
        },
        experience: [
            {
                id: "exp-1",
                role: "Tech Intern — AI/ML Development & Backend",
                company: "CGPDTM (Controller General of Patents, Designs and Trade Marks), Delhi",
                badge: "Government of India · Ministry of Commerce & Industry",
                period: "Apr 2026 – Sep 2026",
                location: "Delhi, India",
                summary: "Spearheaded Generative AI solutions and autonomous database query systems for national intellectual property operations, architecting conversational assistants, RAG pipelines, and automated high-throughput data extraction services.",
                deliverables: [
                    {
                        title: "Generative AI & IP Saarthi 2.0",
                        desc: "Architected IP Saarthi 2.0, an NLP-powered conversational chatbot built using Python, LLMs, and advanced prompt engineering to automate and streamline complex intellectual property inquiries for citizens.",
                        tag: "Python · LLMs · Prompt Engineering · NLP"
                    },
                    {
                        title: "Autonomous RAG-Powered Text-to-SQL Agent",
                        desc: "Engineered an autonomous Text-to-SQL AI Agent on SQL Server Database, automating dynamic schema retrieval, SQL query generation, automated guardrails, tabular reporting, and chart-based data visualizations.",
                        tag: "SQL Server · RAG · Autonomous Agents · Data Viz"
                    },
                    {
                        title: "Legal Document Intelligence & OCR Pipeline",
                        desc: "Engineered an end-to-end RAG pipeline scraping IP legal documents, integrating OCR, and fine-tuning document chunking and parsing strategies to enhance context retrieval accuracy.",
                        tag: "OCR · Document Chunking · Vector Search · RAG"
                    },
                    {
                        title: "Workflow & Performance Optimization",
                        desc: "Optimized LLM prompt workflows, query validation, and error handling mechanisms to minimize token overhead, eliminate hallucinations, and improve generation accuracy and response latency.",
                        tag: "Latency Optimization · Hallucination Defense · Evaluation"
                    },
                    {
                        title: "High-Volume Database Pipeline Automation",
                        desc: "Engineered automated Python and SQL scripts for high-volume Trademark BLOB file extraction, binary decoding, and enterprise data preprocessing pipelines.",
                        tag: "BLOB Processing · Python ETL · SQL Server · Batch Pipelines"
                    }
                ]
            }
        ],
        projects: [
            {
                id: "proj-1",
                title: "Multi-Agent SQL AI System",
                category: "genai",
                badge: "Flagship GenAI",
                date: "Jan 2026 – Mar 2026",
                headline: "Multilingual, Schema-Aware Natural Language to SQL Generation Platform",
                desc: "Developed a multilingual, RAG-powered Natural Language to SQL system using FastAPI and Ollama (Local LLMs) for secure, schema-aware query generation, validation, and automated execution.",
                archFlow: ["NL Prompt", "FAISS Schema RAG", "Ollama LLM", "SQL Guardrail", "Visual Output"],
                features: [
                    "Multilingual RAG: Handles diverse language input with vector embeddings in FAISS.",
                    "Safe Execution: Automated schema retrieval and strict query sanitization preventing destructive operations.",
                    "Local Privacy: Runs entirely on Ollama local models with zero data leakage."
                ],
                tags: ["Python", "FastAPI", "Ollama", "FAISS", "SQLite", "RAG"],
                repoUrl: "https://github.com/mharsh181",
                askPrompt: "Explain the Multi-Agent Text-to-SQL architecture."
            },
            {
                id: "proj-2",
                title: "Image Captioning with Object Detection",
                category: "cv",
                badge: "Deep Learning & Vision",
                date: "Aug 2025 – Dec 2025",
                headline: "Encoder-Decoder Vision Model integrating YOLOv8 and VGG16",
                desc: "Designed a dual-encoder image captioning architecture integrating YOLOv8 object tags into a CNN–LSTM sequence decoder, yielding a ~40% improvement in semantic context precision over baseline models.",
                archFlow: ["Image Input", "VGG16 + YOLOv8", "LSTM Decoder", "Beam Search", "Rich Caption"],
                features: [
                    "Context Injection: YOLOv8 object tags injected into the caption decoder for rich vocabulary.",
                    "Beam Search Decoding: Coherent n-best hypothesis generation over Flickr8k dataset.",
                    "CustomTkinter GUI: Intuitive desktop interface for real-time inference and caption overlay."
                ],
                tags: ["Python", "Deep Learning", "Computer Vision", "YOLOv8", "VGG16", "CNN-LSTM"],
                repoUrl: "https://github.com/mharsh181",
                askPrompt: "How does the YOLOv8 + VGG16 Image Captioning system work?"
            },
            {
                id: "proj-3",
                title: "Weather Prediction ML Engine",
                category: "ml",
                badge: "Machine Learning & Analytics",
                date: "Jun 2025 – Jul 2025",
                headline: "Streamlit-Powered Climate Metric Regression on 100,000+ Records",
                desc: "Engineered and deployed an interactive machine learning regression pipeline trained on 100,000+ historical climate records to predict multiple meteorological parameters with robust hyperparameter tuning.",
                archFlow: ["100k+ Records", "Feature Engineering", "scikit-learn Regressors", "Streamlit UI"],
                features: [
                    "Big Data Preprocessing: Handled missing values, outliers, and cyclical time features across 100k records.",
                    "Model Benchmarking: Evaluated Multiple Regression, Random Forest, and Gradient Boosting.",
                    "Streamlit Deployment: Interactive sliders, parameter adjustments, and live data charts."
                ],
                tags: ["Python", "Machine Learning", "scikit-learn", "Pandas", "NumPy", "Streamlit"],
                repoUrl: "https://github.com/mharsh181",
                askPrompt: "Explain the Weather Prediction regression pipeline."
            }
        ],
        aiSimulator: [
            {
                id: "ai-1",
                prompt: "🏛️ CGPDTM Experience",
                keywords: ["cgpdtm", "intern", "experience", "patent", "ministry", "saarthi"],
                response: "<strong>CGPDTM Tech Internship Highlights (Apr 2026 – Sep 2026):</strong><br>• <strong>IP Saarthi 2.0:</strong> Architected a high-accuracy conversational GenAI assistant using Python, LLMs, and prompt engineering to guide users through Indian Patent, Trademark, and Design queries.<br>• <strong>Autonomous Text-to-SQL:</strong> Engineered an autonomous agent on SQL Server automating schema discovery, query validation, and generating real-time tabular and chart visualizations.<br>• <strong>Document Intelligence & OCR:</strong> Built an end-to-end legal document RAG pipeline with custom OCR, semantic chunking, and FAISS vector retrieval.<br>• <strong>BLOB Automation:</strong> Automated high-volume Trademark binary BLOB data pipelines for seamless preprocessing."
            },
            {
                id: "ai-2",
                prompt: "⚡ Text-to-SQL Architecture",
                keywords: ["sql", "multi-agent", "text-to-sql", "query", "ollama", "fastapi"],
                response: "<strong>Multi-Agent SQL AI System Architecture:</strong><br>• <strong>Vector Schema Retrieval:</strong> Database schemas & sample queries are embedded and indexed into FAISS.<br>• <strong>RAG & Ollama Inference:</strong> User input (multilingual) is retrieved with the schema context and synthesized into SQL via local Ollama models (privacy-first).<br>• <strong>Guardrail & Execution:</strong> Queries pass through an AST-level syntax sanitizer to prevent destructive commands (DROP/DELETE) before safe execution on SQLite/Postgres.<br>• <strong>Output:</strong> Generates both raw tabular datasets and automated dynamic charts."
            },
            {
                id: "ai-3",
                prompt: "👁️ YOLOv8 + VGG16 Pipeline",
                keywords: ["caption", "image", "vision", "yolo", "vgg16", "cv", "object"],
                response: "<strong>Image Captioning with Object Detection (YOLOv8 + VGG16):</strong><br>• <strong>Dual Feature Extraction:</strong> Combines spatial image embeddings from VGG16 with contextual semantic object labels predicted in real-time by YOLOv8.<br>• <strong>Tag Injection:</strong> Detected object tags are appended to context tokens, yielding a <strong>~40% precision improvement</strong> in generating accurate descriptive captions.<br>• <strong>CNN-LSTM & Beam Search:</strong> Decodes coherent sentences using n-best hypothesis beam search over the Flickr8k benchmark.<br>• <strong>CustomTkinter GUI:</strong> Integrated a clean desktop app for instant image drag-and-drop and caption generation."
            },
            {
                id: "ai-4",
                prompt: "🎓 Tech Stack & CGPA",
                keywords: ["skills", "stack", "education", "cgpa", "degree", "python"],
                response: "<strong>Harsh Mishra's Technical Profile & Education:</strong><br>• <strong>Education:</strong> MCA (2024–2026) at Guru Ghasidas Vishwavidyalaya (CGPA: <strong>8.00 / 10</strong>).<br>• <strong>Undergrad:</strong> B.Sc Computer Science Hons (CGPA: <strong>7.78 / 10</strong>).<br>• <strong>AI & ML:</strong> LLMs, RAG, FAISS, Prompt Engineering, PyTorch, scikit-learn, OpenCV, YOLOv8.<br>• <strong>Backend & Data:</strong> Python, FastAPI, Flask, Django, SQL Server, MySQL, SQLite, Pandas, NumPy.<br>• <strong>DevOps & Tools:</strong> Docker, Git, Linux, Jupyter, Streamlit.<br>• <strong>Certifications:</strong> IBM SkillsBuild (ML), Udemy (Python & Security), Google Cloud Training."
            },
            {
                id: "ai-5",
                prompt: "📬 Contact & Hiring",
                keywords: ["contact", "email", "hire", "phone", "linkedin", "github"],
                response: "<strong>Get in Touch with Harsh:</strong><br>• <strong>Email:</strong> <a href=\"mailto:mharsh181@gmail.com\" style=\"color:var(--accent-cyan);\">mharsh181@gmail.com</a><br>• <strong>Phone:</strong> +91-6266384539<br>• <strong>LinkedIn:</strong> <a href=\"https://linkedin.com/in/harshmishra95\" target=\"_blank\" style=\"color:var(--accent-cyan);\">linkedin.com/in/harshmishra95</a><br>• <strong>GitHub:</strong> <a href=\"https://github.com/mharsh181\" target=\"_blank\" style=\"color:var(--accent-cyan);\">github.com/mharsh181</a><br>• <strong>Status:</strong> Actively interviewing for AI/ML Engineer, GenAI, and Python Backend roles!"
            }
        ],
        skills: [
            {
                id: "skill-1",
                title: "GenAI, LLMs & NLP",
                icon: "fa-brain",
                subtitle: "Core Specialization",
                badges: ["RAG Architectures", "Prompt Engineering", "Ollama & Local LLMs", "FAISS Vector DB", "NLP & Text-to-SQL", "Document Chunking", "Conversational Chatbots"]
            },
            {
                id: "skill-2",
                title: "Vision & Deep Learning",
                icon: "fa-eye",
                subtitle: "Models & Frameworks",
                badges: ["Deep Learning", "YOLOv8", "OpenCV", "VGG16 & CNNs", "CNN-LSTM", "OCR Integration", "scikit-learn"]
            },
            {
                id: "skill-3",
                title: "Backend & Systems",
                icon: "fa-python",
                subtitle: "Fast & Scalable",
                badges: ["Python (Expert)", "FastAPI", "Flask", "Django", "RESTful APIs", "Error Handling & Validation"]
            },
            {
                id: "skill-4",
                title: "Data & Databases",
                icon: "fa-database",
                subtitle: "ETL & Storage",
                badges: ["SQL Server", "MySQL", "SQLite", "NumPy", "Pandas", "BLOB Processing"]
            },
            {
                id: "skill-5",
                title: "Tools, DevOps & Collaboration",
                icon: "fa-toolbox",
                subtitle: "Workflow & Production",
                badges: ["Git", "GitHub", "Docker", "Jupyter Notebook", "Streamlit", "Linux", "Team Collaboration", "SDLC & Documentation"]
            }
        ],
        education: [
            {
                id: "edu-1",
                duration: "2024 – 2026",
                degree: "Master of Computer Applications (MCA)",
                institution: "Guru Ghasidas Vishwavidyalaya (Central University), Bilaspur, C.G",
                cgpa: "8.00 / 10",
                notes: "Advanced coursework in Machine Learning, Deep Learning, NLP, Distributed Systems, and Advanced Algorithms."
            },
            {
                id: "edu-2",
                duration: "2021 – 2024",
                degree: "Bachelor of Computer Science (Hons)",
                institution: "Guru Ghasidas Vishwavidyalaya, Bilaspur, C.G",
                cgpa: "7.78 / 10",
                notes: "Foundations in Python, Data Structures & Algorithms, Database Management Systems, and Object-Oriented Design."
            }
        ],
        certificates: [
            {
                id: "cert-1",
                duration: "Issued: Feb 20, 2025",
                title: "Machine Learning for Data Science Projects",
                issuer: "IBM SkillsBuild",
                notes: "Hands-on model training, feature selection, evaluation metrics, and supervised/unsupervised ML implementations.",
                verifyUrl: "https://www.credly.com/badges/aa75f805-2302-499c-8360-0c8fdc992632",
                platform: "Credly",
                icon: "fa-brain",
                type: "ibm"
            },
            {
                id: "cert-2",
                duration: "Issued: July 17, 2025",
                title: "Learn Python & Ethical Hacking From Scratch",
                issuer: "Udemy (Zaid Sabih)",
                notes: "Network programming, automated packet analysis, security auditing, and Python vulnerability scripting.",
                verifyUrl: "https://www.udemy.com/certificate/UC-1ea6e132-e54a-4ba6-a70e-c68af22fb2ee/",
                platform: "Udemy",
                icon: "fa-shield-halved",
                type: "udemy"
            },
            {
                id: "cert-3",
                duration: "Issued: Oct 3, 2024",
                title: "Exploring Data Transformation with Google Cloud",
                issuer: "Google Cloud Training (Coursera)",
                notes: "Cloud data engineering, pipeline design, BigQuery analytics, and automated cloud transformations.",
                verifyUrl: "https://www.coursera.org/account/accomplishments/certificate/GA5HY9AX2YGU",
                platform: "Coursera",
                icon: "fa-google",
                type: "gcp"
            }
        ]
    };
}
