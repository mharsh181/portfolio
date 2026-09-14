/**
 * Harsh Mishra | AI/ML Engineer Portfolio
 * Interactive Architecture, Dynamic Integrations, AI Agent Simulator & Live Hydration
 */

let dynamicData = null;

document.addEventListener('DOMContentLoaded', async () => {
    initNavigation();
    initTheme();
    initCustomCursor();
    initQuickContact();

    // 1. Asynchronously load and hydrate dynamic data if available
    await loadDynamicData();

    // 2. Initialize UI components with active data
    initTyped();
    initAiTerminal();
    initProjectFilters();
    fetchGitHubRepos();
    fetchBlogPosts();
});

// Live synchronization: if admin saves changes in another tab, reflect immediately
window.addEventListener('storage', (e) => {
    if (e.key === 'portfolio_custom_data' && e.newValue) {
        try {
            dynamicData = JSON.parse(e.newValue);
            hydrateDOM(dynamicData);
        } catch (err) {
            console.warn('Storage sync parse failed', err);
        }
    }
});

/* ==========================================================================
   0. Dynamic Data Loader & Hydration Engine
   ========================================================================== */
async function loadDynamicData() {
    // 1. Try LocalStorage first (instant reflection from Admin Panel)
    const localSaved = localStorage.getItem('portfolio_custom_data');
    if (localSaved) {
        try {
            dynamicData = JSON.parse(localSaved);
            hydrateDOM(dynamicData);
            return;
        } catch (e) {
            console.warn('Failed parsing local storage data', e);
        }
    }

    // 2. Try fetching static portfolio-data.json
    try {
        const res = await fetch('portfolio-data.json', { cache: 'no-store' });
        if (res.ok) {
            dynamicData = await res.json();
            hydrateDOM(dynamicData);
            return;
        }
    } catch (e) {
        // Fallback to existing pre-rendered HTML
    }
}

function hydrateDOM(data) {
    if (!data) return;

    // A. Profile & Hero
    if (data.profile) {
        const prof = data.profile;
        const statusBadge = document.querySelector('.status-badge-nav .status-text');
        if (statusBadge && prof.status) statusBadge.textContent = prof.status;

        const heroName = document.querySelector('.hero-title .gradient-text');
        if (heroName && prof.name) heroName.textContent = prof.name;

        const heroDesc = document.querySelector('.hero-desc');
        if (heroDesc && prof.heroDesc) heroDesc.innerHTML = prof.heroDesc;

        // About section details
        const listItems = document.querySelectorAll('#about .profile-list li');
        if (listItems.length >= 6) {
            if (prof.location) listItems[0].querySelector('.p-val').textContent = prof.location;
            if (prof.degree) listItems[1].querySelector('.p-val').textContent = prof.degree;
            if (prof.undergrad) listItems[2].querySelector('.p-val').textContent = prof.undergrad;
            if (prof.primaryStack) listItems[3].querySelector('.p-val').textContent = prof.primaryStack;
            if (prof.aiFocus) listItems[4].querySelector('.p-val').textContent = prof.aiFocus;
            if (prof.availability) listItems[5].querySelector('.p-val').textContent = prof.availability;
        }

        const philosophyP = document.querySelector('#about .main-about p');
        if (philosophyP && prof.philosophy) philosophyP.innerHTML = prof.philosophy;
    }

    // B. Hero Metrics
    if (Array.isArray(data.metrics) && data.metrics.length >= 4) {
        const metricItems = document.querySelectorAll('.hero-metrics .metric-item');
        data.metrics.forEach((m, idx) => {
            if (metricItems[idx]) {
                const valEl = metricItems[idx].querySelector('.metric-val');
                const lblEl = metricItems[idx].querySelector('.metric-lbl');
                if (valEl) valEl.textContent = m.val;
                if (lblEl) lblEl.textContent = m.lbl;
            }
        });
    }

    // C. Socials & Resume
    if (data.socials) {
        const s = data.socials;
        const ghLink = document.querySelector('.hero-socials a[title="GitHub"]');
        const liLink = document.querySelector('.hero-socials a[title="LinkedIn"]');
        const emLink = document.querySelector('.hero-socials a[title="Email"]');

        if (ghLink && s.github) ghLink.href = s.github;
        if (liLink && s.linkedin) liLink.href = s.linkedin;
        if (emLink && s.email) emLink.href = `mailto:${s.email}`;
    }

    // D. Experience Section
    if (Array.isArray(data.experience) && data.experience.length > 0) {
        hydrateExperience(data.experience);
    }

    // E. Flagship Projects Grid
    if (Array.isArray(data.projects) && data.projects.length > 0) {
        hydrateProjects(data.projects);
    }

    // F. Skills Matrix
    if (Array.isArray(data.skills) && data.skills.length > 0) {
        hydrateSkills(data.skills);
    }

    // G. Education & Certifications
    if (Array.isArray(data.education) || Array.isArray(data.certificates)) {
        hydrateEducation(data.education || [], data.certificates || []);
    }

    // H. AI Simulator Chips
    if (Array.isArray(data.aiSimulator) && data.aiSimulator.length > 0) {
        hydrateAiTerminalChips(data.aiSimulator);
    }
}

function hydrateExperience(expList) {
    const showcase = document.querySelector('.experience-showcase');
    if (!showcase) return;

    showcase.innerHTML = expList.map(exp => `
        <div class="exp-main-card" style="margin-bottom: 2rem;">
            <div class="exp-header">
                <div class="exp-role-info">
                    ${exp.badge ? `<div class="exp-badge">${escapeHtml(exp.badge)}</div>` : ''}
                    <h3 class="exp-role">${escapeHtml(exp.role)}</h3>
                    <h4 class="exp-company">${escapeHtml(exp.company)}</h4>
                </div>
                <div class="exp-period">
                    <span class="date-tag"><i class="fa-regular fa-calendar"></i> ${escapeHtml(exp.period)}</span>
                    ${exp.location ? `<span class="loc-tag"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(exp.location)}</span>` : ''}
                </div>
            </div>

            ${exp.summary ? `<p class="exp-summary">${escapeHtml(exp.summary)}</p>` : ''}

            <div class="exp-deliverables-grid">
                ${(exp.deliverables || []).map(d => `
                    <div class="deliverable-card">
                        <div class="d-icon"><i class="fa-solid fa-bolt"></i></div>
                        <div class="d-content">
                            <h4>${escapeHtml(d.title)}</h4>
                            <p>${escapeHtml(d.desc)}</p>
                            ${d.tag ? `<span class="d-tag">${escapeHtml(d.tag)}</span>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function hydrateProjects(projList) {
    const grid = document.querySelector('.projects-grid');
    if (!grid) return;

    grid.innerHTML = projList.map(proj => {
        let bannerClass = '';
        if (proj.category === 'cv') bannerClass = 'cv-banner';
        if (proj.category === 'ml') bannerClass = 'ml-banner';

        return `
            <div class="project-card" data-category="${escapeHtml(proj.category)}">
                <div class="project-banner ${bannerClass}">
                    <div class="project-banner-header">
                        <span class="project-cat-badge"><i class="fa-solid fa-sparkles"></i> ${escapeHtml(proj.badge || 'AI Project')}</span>
                        <span class="project-date">${escapeHtml(proj.date || '')}</span>
                    </div>
                    <h3 class="project-title">${escapeHtml(proj.title)}</h3>
                    <p class="project-headline">${escapeHtml(proj.headline || '')}</p>
                </div>

                <div class="project-body">
                    <p class="project-desc">${escapeHtml(proj.desc)}</p>

                    ${Array.isArray(proj.archFlow) && proj.archFlow.length > 0 ? `
                        <div class="arch-flow">
                            ${proj.archFlow.map((step, sIdx) => `
                                <span class="arch-step">${escapeHtml(step)}</span>
                                ${sIdx < proj.archFlow.length - 1 ? '<i class="fa-solid fa-arrow-right arch-arr"></i>' : ''}
                            `).join('')}
                        </div>
                    ` : ''}

                    ${Array.isArray(proj.features) && proj.features.length > 0 ? `
                        <ul class="project-features">
                            ${proj.features.map(f => `
                                <li><i class="fa-solid fa-check"></i> <div>${escapeHtml(f)}</div></li>
                            `).join('')}
                        </ul>
                    ` : ''}

                    <div class="project-tags">
                        ${(proj.tags || []).map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('')}
                    </div>

                    <div class="project-links">
                        ${proj.repoUrl ? `
                            <a href="${escapeHtml(proj.repoUrl)}" target="_blank" class="proj-link-btn primary">
                                <i class="fa-brands fa-github"></i> Repository
                            </a>
                        ` : ''}
                        ${proj.askPrompt ? `
                            <a href="#playground" class="proj-link-btn secondary" onclick="askTerminal('${escapeHtml(proj.askPrompt)}')">
                                <i class="fa-solid fa-terminal"></i> Ask Terminal
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    initProjectFilters();
}

function hydrateSkills(skillList) {
    const grid = document.querySelector('.skills-matrix-grid');
    if (!grid) return;

    grid.innerHTML = skillList.map((cat, idx) => `
        <div class="skill-category-card ${idx === skillList.length - 1 ? 'full-span' : ''}">
            <div class="cat-header">
                <div class="cat-icon genai-icon"><i class="fa-solid ${escapeHtml(cat.icon || 'fa-microchip')}"></i></div>
                <div>
                    <h3>${escapeHtml(cat.title)}</h3>
                    <span class="cat-count">${escapeHtml(cat.subtitle || 'Skills')}</span>
                </div>
            </div>
            <div class="skill-badges">
                ${(cat.badges || []).map(b => `<div class="badge-item"><i class="fa-solid fa-check"></i> ${escapeHtml(b)}</div>`).join('')}
            </div>
        </div>
    `).join('');
}

function hydrateEducation(eduList, certList) {
    const container = document.querySelector('.edu-cert-container');
    if (!container) return;

    container.innerHTML = `
        <div class="timeline-column">
            <h3 class="column-title"><i class="fa-solid fa-building-columns"></i> Academic Qualifications</h3>
            ${eduList.map(edu => `
                <div class="timeline-card">
                    <div class="tl-logo">
                        <img src="ggv_logo.png" alt="GGV Logo">
                    </div>
                    <div class="tl-content">
                        <span class="tl-duration">${escapeHtml(edu.duration)}</span>
                        <h4>${escapeHtml(edu.degree)}</h4>
                        <p class="tl-inst">${escapeHtml(edu.institution)}</p>
                        ${edu.cgpa ? `<div class="tl-grade-badge"><i class="fa-solid fa-medal"></i> CGPA: <strong>${escapeHtml(edu.cgpa)}</strong></div>` : ''}
                        ${edu.notes ? `<p class="tl-notes">${escapeHtml(edu.notes)}</p>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="timeline-column">
            <h3 class="column-title"><i class="fa-solid fa-certificate"></i> Verified Certifications</h3>
            ${certList.map(cert => `
                <div class="timeline-card cert-card">
                    <div class="tl-cert-icon ${cert.type || 'ibm'}"><i class="fa-solid ${escapeHtml(cert.icon || 'fa-certificate')}"></i></div>
                    <div class="tl-content">
                        <span class="tl-duration">${escapeHtml(cert.duration)}</span>
                        <h4>${escapeHtml(cert.title)}</h4>
                        <p class="tl-inst">${escapeHtml(cert.issuer)}</p>
                        ${cert.notes ? `<p class="tl-notes">${escapeHtml(cert.notes)}</p>` : ''}
                        ${cert.verifyUrl ? `
                            <a href="${escapeHtml(cert.verifyUrl)}" target="_blank" class="cert-verify-link">
                                <i class="fa-solid fa-arrow-up-right-from-square"></i> Verify on ${escapeHtml(cert.platform || 'Credential')}
                            </a>
                        ` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function hydrateAiTerminalChips(aiList) {
    const chipsContainer = document.querySelector('.terminal-suggestions');
    if (!chipsContainer) return;

    chipsContainer.innerHTML = aiList.map(item => `
        <button class="prompt-chip" data-prompt="${escapeHtml(item.prompt)}">
            ${escapeHtml(item.prompt)}
        </button>
    `).join('');
}

/* ==========================================================================
   1. Navigation & Scrollspy
   ========================================================================== */
function initNavigation() {
    const header = document.querySelector('#header');
    const menuIcon = document.querySelector('#menu-icon');
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.navbar .nav-link');
    const sections = document.querySelectorAll('section.section');

    // Mobile Hamburger Toggle
    if (menuIcon && navbar) {
        menuIcon.addEventListener('click', () => {
            navbar.classList.toggle('active');
            const icon = menuIcon.querySelector('i');
            if (navbar.classList.contains('active')) {
                icon.classList.replace('fa-bars', 'fa-xmark');
            } else {
                icon.classList.replace('fa-xmark', 'fa-bars');
            }
        });

        // Close on nav-link click
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navbar.classList.remove('active');
                const icon = menuIcon.querySelector('i');
                if (icon) icon.classList.replace('fa-xmark', 'fa-bars');
            });
        });
    }

    // Sticky Header & Scrollspy
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        // Sticky header
        if (header) {
            header.classList.toggle('sticky', scrollY > 80);
        }

        // Active section spy
        let currentSectionId = '';
        sections.forEach(sec => {
            const top = sec.offsetTop - 150;
            const height = sec.offsetHeight;
            if (scrollY >= top && scrollY < top + height) {
                currentSectionId = sec.getAttribute('id');
            }
        });

        if (currentSectionId) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

/* ==========================================================================
   2. Theme Toggle (Dark / Light)
   ========================================================================== */
function initTheme() {
    const themeBtn = document.querySelector('#theme-btn');
    if (!themeBtn) return;
    const themeIcon = themeBtn.querySelector('i');

    const savedTheme = localStorage.getItem('theme_preference');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
    }

    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');

        if (isLight) {
            themeIcon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme_preference', 'light');
        } else {
            themeIcon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme_preference', 'dark');
        }
    });
}

/* ==========================================================================
   3. Dynamic Typewriter (Typed.js)
   ========================================================================== */
function initTyped() {
    const el = document.querySelector('.multiple-text');
    if (!el || typeof Typed === 'undefined') return;

    let strings = [
        'AI / ML Engineering',
        'Generative AI & RAG Architectures',
        'Autonomous LLM Agents',
        'Computer Vision & Deep Learning',
        'Scalable FastAPI Backends'
    ];

    if (dynamicData && dynamicData.profile && Array.isArray(dynamicData.profile.typingStrings) && dynamicData.profile.typingStrings.length > 0) {
        strings = dynamicData.profile.typingStrings;
    }

    new Typed('.multiple-text', {
        strings: strings,
        typeSpeed: 60,
        backSpeed: 40,
        backDelay: 1500,
        loop: true,
        showCursor: true,
        cursorChar: '|'
    });
}

/* ==========================================================================
   4. Custom Interactive Cursor
   ========================================================================== */
function initCustomCursor() {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    if (!cursorDot || !cursorOutline || window.innerWidth <= 992) return;

    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 350, fill: 'forwards' });
    });

    // Enlarge outline on clickable elements
    const clickables = document.querySelectorAll('a, button, .project-card, .prompt-chip, .timeline-card');
    clickables.forEach(item => {
        item.addEventListener('mouseenter', () => {
            cursorOutline.style.width = '54px';
            cursorOutline.style.height = '54px';
            cursorOutline.style.borderColor = 'var(--accent-cyan)';
        });
        item.addEventListener('mouseleave', () => {
            cursorOutline.style.width = '36px';
            cursorOutline.style.height = '36px';
            cursorOutline.style.borderColor = 'rgba(0, 245, 212, 0.5)';
        });
    });
}

/* ==========================================================================
   5. Interactive AI Agent Terminal Simulator
   ========================================================================== */
function initAiTerminal() {
    const form = document.getElementById('terminal-form');
    const input = document.getElementById('terminal-input');
    const body = document.getElementById('terminal-body');

    if (!form || !input || !body) return;

    function getActiveKnowledgeBase() {
        if (dynamicData && Array.isArray(dynamicData.aiSimulator) && dynamicData.aiSimulator.length > 0) {
            return dynamicData.aiSimulator;
        }

        return [
            {
                keywords: ['cgpdtm', 'intern', 'experience', 'patent', 'ministry', 'saarthi'],
                response: `<strong>CGPDTM Tech Internship Highlights (Apr 2026 – Sep 2026):</strong><br>
• <strong>IP Saarthi 2.0:</strong> Architected a high-accuracy conversational GenAI assistant using Python, LLMs, and prompt engineering to guide users through Indian Patent, Trademark, and Design queries.<br>
• <strong>Autonomous Text-to-SQL:</strong> Engineered an autonomous agent on SQL Server automating schema discovery, query validation, and generating real-time tabular and chart visualizations.<br>
• <strong>Document Intelligence & OCR:</strong> Built an end-to-end legal document RAG pipeline with custom OCR, semantic chunking, and FAISS vector retrieval.<br>
• <strong>BLOB Automation:</strong> Automated high-volume Trademark binary BLOB data pipelines for seamless preprocessing.`
            },
            {
                keywords: ['sql', 'multi-agent', 'text-to-sql', 'query', 'ollama', 'fastapi'],
                response: `<strong>Multi-Agent SQL AI System Architecture:</strong><br>
• <strong>Vector Schema Retrieval:</strong> Database schemas & sample queries are embedded and indexed into FAISS.<br>
• <strong>RAG & Ollama Inference:</strong> User input (multilingual) is retrieved with the schema context and synthesized into SQL via local Ollama models (privacy-first).<br>
• <strong>Guardrail & Execution:</strong> Queries pass through an AST-level syntax sanitizer to prevent destructive commands (DROP/DELETE) before safe execution on SQLite/Postgres.<br>
• <strong>Output:</strong> Generates both raw tabular datasets and automated dynamic charts.`
            },
            {
                keywords: ['caption', 'image', 'vision', 'yolo', 'vgg16', 'cv', 'object'],
                response: `<strong>Image Captioning with Object Detection (YOLOv8 + VGG16):</strong><br>
• <strong>Dual Feature Extraction:</strong> Combines spatial image embeddings from VGG16 with contextual semantic object labels predicted in real-time by YOLOv8.<br>
• <strong>Tag Injection:</strong> Detected object tags are appended to context tokens, yielding a <strong>~40% precision improvement</strong> in generating accurate descriptive captions.<br>
• <strong>CNN-LSTM & Beam Search:</strong> Decodes coherent sentences using n-best hypothesis beam search over the Flickr8k benchmark.<br>
• <strong>CustomTkinter GUI:</strong> Integrated a clean desktop app for instant image drag-and-drop and caption generation.`
            },
            {
                keywords: ['weather', 'stream', 'regression', 'climate', 'scikit'],
                response: `<strong>Weather Prediction ML Engine:</strong><br>
• Trained and benchmarked regression models on <strong>100,000+ historical climate records</strong>.<br>
• Engineered cyclical time features, handled missing parameters, and tuned Random Forest and Gradient Boosted regressors.<br>
• Deployed an interactive <strong>Streamlit dashboard</strong> with live metric sliders and prediction plots.`
            },
            {
                keywords: ['skills', 'stack', 'education', 'cgpa', 'degree', 'python'],
                response: `<strong>Harsh Mishra's Technical Profile & Education:</strong><br>
• <strong>Education:</strong> MCA (2024–2026) at Guru Ghasidas Vishwavidyalaya (CGPA: <strong>8.00 / 10</strong>).<br>
• <strong>Undergrad:</strong> B.Sc Computer Science Hons (CGPA: <strong>7.78 / 10</strong>).<br>
• <strong>AI & ML:</strong> LLMs, RAG, FAISS, Prompt Engineering, PyTorch, scikit-learn, OpenCV, YOLOv8.<br>
• <strong>Backend & Data:</strong> Python, FastAPI, Flask, Django, SQL Server, MySQL, SQLite, Pandas, NumPy.<br>
• <strong>DevOps & Tools:</strong> Docker, Git, Linux, Jupyter, Streamlit.<br>
• <strong>Certifications:</strong> IBM SkillsBuild (ML), Udemy (Python & Security), Google Cloud Training.`
            },
            {
                keywords: ['contact', 'email', 'hire', 'phone', 'linkedin', 'github'],
                response: `<strong>Get in Touch with Harsh:</strong><br>
• <strong>Email:</strong> <a href="mailto:mharsh181@gmail.com" style="color:var(--accent-cyan);">mharsh181@gmail.com</a><br>
• <strong>Phone:</strong> +91-6266384539<br>
• <strong>LinkedIn:</strong> <a href="https://linkedin.com/in/harshmishra95" target="_blank" style="color:var(--accent-cyan);">linkedin.com/in/harshmishra95</a><br>
• <strong>GitHub:</strong> <a href="https://github.com/mharsh181" target="_blank" style="color:var(--accent-cyan);">github.com/mharsh181</a><br>
• <strong>Status:</strong> Actively interviewing for AI/ML Engineer, GenAI, and Python Backend roles!`
            }
        ];
    }

    function appendMessage(sender, text, isUser = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `terminal-msg ${isUser ? 'user-msg' : 'agent-msg'}`;
        
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        msgDiv.innerHTML = `
            <div class="msg-header">
                <span class="sender-tag">${isUser ? '👤 Visitor' : '🤖 Harsh AI Agent'}</span>
                <span class="msg-time">${timeStr}</span>
            </div>
            <div class="msg-content">${text}</div>
        `;

        body.appendChild(msgDiv);
        body.scrollTop = body.scrollHeight;
    }

    async function processQuery(query) {
        // Simulate realistic typing delay
        const typingDiv = document.createElement('div');
        typingDiv.className = 'terminal-msg agent-msg';
        typingDiv.innerHTML = `
            <div class="msg-header">
                <span class="sender-tag">🤖 Harsh AI Agent</span>
                <span class="msg-time">Thinking...</span>
            </div>
            <div class="msg-content"><i class="fa-solid fa-circle-notch fa-spin"></i> Processing prompt with FastAPI neural backend...</div>
        `;
        body.appendChild(typingDiv);
        body.scrollTop = body.scrollHeight;

        let matched = null;

        // 1. Try server endpoint first
        try {
            const res = await fetch('/api/ai-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: query })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.response) {
                    matched = data.response;
                }
            }
        } catch (e) {
            // Fallback to client knowledgeBase
        }

        // 2. Client-side fallback if server offline
        if (!matched) {
            const cleanQuery = query.toLowerCase();
            const kb = getActiveKnowledgeBase();
            for (const item of kb) {
                const keywords = Array.isArray(item.keywords) ? item.keywords : [];
                if (keywords.some(kw => cleanQuery.includes(kw.toLowerCase()))) {
                    matched = item.response;
                    break;
                }
            }
        }

        if (!matched) {
            matched = `I analyzed your query: "<em>${escapeHtml(query)}</em>". Harsh specializes in <strong>AI/ML Engineering</strong>, specifically <strong>RAG pipelines</strong>, <strong>autonomous Text-to-SQL agents</strong>, and <strong>Computer Vision (YOLOv8/VGG16)</strong>. Feel free to ask about his <strong>CGPDTM internship</strong>, his <strong>projects</strong>, or his <strong>stack</strong>!`;
        }

        setTimeout(() => {
            typingDiv.remove();
            appendMessage('🤖 Harsh AI Agent', matched, false);
        }, 400);
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        appendMessage('Visitor', escapeHtml(text), true);
        input.value = '';
        processQuery(text);
    });

    // Delegate click for dynamically rendered prompt chips
    const suggestionsBox = document.querySelector('.terminal-suggestions');
    if (suggestionsBox) {
        suggestionsBox.addEventListener('click', (e) => {
            const chip = e.target.closest('.prompt-chip');
            if (chip) {
                const prompt = chip.getAttribute('data-prompt');
                if (prompt) {
                    appendMessage('Visitor', prompt, true);
                    processQuery(prompt);
                }
            }
        });
    }

    window.askTerminal = function(promptText) {
        appendMessage('Visitor', promptText, true);
        processQuery(promptText);
        const term = document.getElementById('playground');
        if (term) term.scrollIntoView({ behavior: 'smooth' });
    };
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
   6. Project Category Filtering
   ========================================================================== */
function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.projects-filter .filter-btn');
    const cards = document.querySelectorAll('.projects-grid .project-card');

    if (!filterBtns.length || !cards.length) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            document.querySelectorAll('.projects-grid .project-card').forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.style.display = 'flex';
                    card.style.animation = 'fadeInMsg 0.4s ease';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

/* ==========================================================================
   7. Quick Contact / Dispatch Form
   ========================================================================== */
function initQuickContact() {
    const form = document.getElementById('quick-contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnHTML = submitBtn.innerHTML;
        const name = document.getElementById('contact-name').value.trim();
        const subject = document.getElementById('contact-subject').value.trim();
        const message = document.getElementById('contact-message').value.trim();

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> <span>Sending via Backend...</span>';

        let sentViaApi = false;
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, subject, message })
            });

            if (res.ok) {
                sentViaApi = true;
                const result = await res.json();
                form.reset();
                showContactFeedback('success', `<i class="fa-solid fa-circle-check"></i> ${result.message}`);
            }
        } catch (err) {
            // API not available or offline (e.g. running statically)
        }

        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;

        // Fallback: Launch mail client if backend API is not hosted
        if (!sentViaApi) {
            const targetEmail = (dynamicData && dynamicData.socials && dynamicData.socials.email) ? dynamicData.socials.email : 'mharsh181@gmail.com';
            const mailtoSubject = encodeURIComponent(`[Portfolio Inquiry] ${subject} - from ${name}`);
            const mailtoBody = encodeURIComponent(`Hi Harsh,\n\nName: ${name}\nTopic/Role: ${subject}\n\nMessage:\n${message}\n\nBest regards,\n${name}`);
            window.location.href = `mailto:${targetEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;
        }
    });
}

function showContactFeedback(type, htmlMsg) {
    let box = document.getElementById('contact-feedback-box');
    if (!box) {
        box = document.createElement('div');
        box.id = 'contact-feedback-box';
        box.style.marginTop = '1rem';
        box.style.padding = '0.85rem 1rem';
        box.style.borderRadius = 'var(--radius-sm)';
        box.style.fontSize = '0.9rem';
        box.style.lineHeight = '1.5';
        const form = document.getElementById('quick-contact-form');
        if (form) form.appendChild(box);
    }

    if (type === 'success') {
        box.style.background = 'rgba(16, 185, 129, 0.15)';
        box.style.border = '1px solid rgba(16, 185, 129, 0.35)';
        box.style.color = '#34d399';
    } else {
        box.style.background = 'rgba(239, 68, 68, 0.15)';
        box.style.border = '1px solid rgba(239, 68, 68, 0.35)';
        box.style.color = '#f87171';
    }

    box.innerHTML = htmlMsg;
    setTimeout(() => {
        if (box) box.style.display = 'none';
    }, 6000);
}

/* ==========================================================================
   8. Live GitHub Repositories Fetcher
   ========================================================================== */
const GITHUB_USERNAME = 'mharsh181';

async function fetchGitHubRepos() {
    const container = document.getElementById('github-repos');
    if (!container) return;

    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`);
        if (!response.ok) throw new Error('GitHub API response not ok');

        const repos = await response.json();
        container.innerHTML = '';

        if (!Array.isArray(repos) || repos.length === 0) {
            renderFallbackRepos(container);
            return;
        }

        repos.forEach(repo => {
            const card = document.createElement('div');
            card.className = 'repo-card';
            card.innerHTML = `
                <div class="repo-card-top">
                    <i class="fa-brands fa-github"></i>
                    <span class="repo-stars"><i class="fa-regular fa-star"></i> ${repo.stargazers_count || 0}</span>
                </div>
                <h4 class="repo-name">${escapeHtml(repo.name)}</h4>
                <p class="repo-desc">${repo.description ? escapeHtml(repo.description) : 'AI & machine learning source code repository.'}</p>
                <div class="repo-footer">
                    <div class="repo-lang">
                        <span class="lang-dot"></span>
                        <span>${repo.language || 'Python'}</span>
                    </div>
                    <a href="${repo.html_url}" target="_blank" class="repo-link-external">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    </a>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (err) {
        console.warn('GitHub API unavailable or rate-limited. Rendering featured repos fallback.', err);
        renderFallbackRepos(container);
    }
}

function renderFallbackRepos(container) {
    const featured = [
        {
            name: 'Multi-Agent-SQL-AI-System',
            desc: 'Multilingual Natural Language to SQL RAG agent powered by FastAPI, Ollama, and FAISS.',
            lang: 'Python',
            url: `https://github.com/${GITHUB_USERNAME}`
        },
        {
            name: 'Image-Captioning-YOLOv8-VGG16',
            desc: 'Encoder-decoder image captioning pipeline with YOLOv8 object tag injection and Beam Search.',
            lang: 'Python',
            url: `https://github.com/${GITHUB_USERNAME}`
        },
        {
            name: 'Weather-Prediction-ML',
            desc: 'Climate forecasting regression models trained on 100,000+ records with Streamlit UI.',
            lang: 'Python',
            url: `https://github.com/${GITHUB_USERNAME}`
        }
    ];

    container.innerHTML = '';
    featured.forEach(repo => {
        const card = document.createElement('div');
        card.className = 'repo-card';
        card.innerHTML = `
            <div class="repo-card-top">
                <i class="fa-brands fa-github"></i>
                <span class="repo-stars"><i class="fa-solid fa-code-fork"></i> Source</span>
            </div>
            <h4 class="repo-name">${repo.name}</h4>
            <p class="repo-desc">${repo.desc}</p>
            <div class="repo-footer">
                <div class="repo-lang">
                    <span class="lang-dot"></span>
                    <span>${repo.lang}</span>
                </div>
                <a href="${repo.url}" target="_blank" class="repo-link-external">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                </a>
            </div>
        `;
        container.appendChild(card);
    });
}

/* ==========================================================================
   9. Blog Posts Integration (Blogger RSS)
   ========================================================================== */
const BLOGGER_URL = 'https://computervigyanofficial.blogspot.com';

async function fetchBlogPosts() {
    const container = document.getElementById('blog-posts');
    if (!container) return;

    const blogUrl = (dynamicData && dynamicData.socials && dynamicData.socials.blog) ? dynamicData.socials.blog : BLOGGER_URL;
    const rssUrl = `${blogUrl}/feeds/posts/default?alt=rss`;
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Blogger RSS feed not ok');

        const data = await response.json();
        const items = data.items ? data.items.slice(0, 3) : [];

        if (!items || items.length === 0) {
            renderFallbackBlogs(container);
            return;
        }

        container.innerHTML = '';
        items.forEach(item => {
            const imgMatch = item.content ? item.content.match(/<img[^>]+src="([^">]+)"/) : null;
            const imgSrc = imgMatch ? imgMatch[1] : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop';
            const cleanDesc = item.description ? item.description.replace(/<[^>]+>/g, '').substring(0, 110) + '...' : 'Read the full engineering guide on Computer Vigyan.';

            const card = document.createElement('div');
            card.className = 'blog-card';
            card.innerHTML = `
                <div class="blog-img-box">
                    <img src="${imgSrc}" alt="${escapeHtml(item.title)}">
                </div>
                <div class="blog-card-content">
                    <span class="blog-date"><i class="fa-regular fa-calendar"></i> ${item.pubDate ? item.pubDate.split(' ')[0] : 'Engineering Note'}</span>
                    <h4>${escapeHtml(item.title)}</h4>
                    <p>${escapeHtml(cleanDesc)}</p>
                    <a href="${item.link}" target="_blank" class="blog-read-link">
                        Read Article <i class="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (err) {
        console.warn('Blogger RSS fetch failed, rendering fallback articles.', err);
        renderFallbackBlogs(container);
    }
}

function renderFallbackBlogs(container) {
    const fallbackArticles = [
        {
            title: 'Understanding Retrieval-Augmented Generation (RAG) with Vector Databases',
            date: 'AI Engineering',
            desc: 'How chunking strategies, embeddings, and FAISS vector stores minimize hallucinations in LLMs.',
            url: BLOGGER_URL
        },
        {
            title: 'Building Schema-Aware Text-to-SQL Agents with Local LLMs',
            date: 'GenAI & Databases',
            desc: 'Architecting dynamic database querying agents with strict syntax validation and guardrails.',
            url: BLOGGER_URL
        },
        {
            title: 'Integrating YOLOv8 with Deep Learning Encoders for Vision Tasks',
            date: 'Computer Vision',
            desc: 'Enhancing sequence captioning decoders using real-time spatial object tag injection.',
            url: BLOGGER_URL
        }
    ];

    container.innerHTML = '';
    fallbackArticles.forEach(item => {
        const card = document.createElement('div');
        card.className = 'blog-card';
        card.innerHTML = `
            <div class="blog-card-content">
                <span class="blog-date"><i class="fa-solid fa-microchip"></i> ${item.date}</span>
                <h4>${item.title}</h4>
                <p>${item.desc}</p>
                <a href="${item.url}" target="_blank" class="blog-read-link">
                    Explore on Computer Vigyan <i class="fa-solid fa-arrow-right"></i>
                </a>
            </div>
        `;
        container.appendChild(card);
    });
}
