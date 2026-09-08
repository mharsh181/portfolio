/**
 * Harsh Mishra | AI/ML Engineer Portfolio
 * Interactive Architecture, Dynamic Integrations & AI Agent Simulator
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initTheme();
    initTyped();
    initCustomCursor();
    initAiTerminal();
    initProjectFilters();
    initQuickContact();
    fetchGitHubRepos();
    fetchBlogPosts();
});

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

    new Typed('.multiple-text', {
        strings: [
            'AI / ML Engineering',
            'Generative AI & RAG Architectures',
            'Autonomous LLM Agents',
            'Computer Vision & Deep Learning',
            'Scalable FastAPI Backends'
        ],
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
    const chips = document.querySelectorAll('.prompt-chip');

    if (!form || !input || !body) return;

    // Knowledge base for Harsh's AI portfolio agent
    const knowledgeBase = [
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

    function processQuery(query) {
        const cleanQuery = query.toLowerCase();

        // Match against knowledgeBase
        let matched = null;
        for (const item of knowledgeBase) {
            if (item.keywords.some(kw => cleanQuery.includes(kw))) {
                matched = item.response;
                break;
            }
        }

        if (!matched) {
            matched = `I analyzed your query: "<em>${escapeHtml(query)}</em>". Harsh specializes in <strong>AI/ML Engineering</strong>, specifically <strong>RAG pipelines</strong>, <strong>autonomous Text-to-SQL agents</strong>, and <strong>Computer Vision (YOLOv8/VGG16)</strong>. Feel free to ask about his <strong>CGPDTM internship</strong>, his <strong>projects</strong>, or his <strong>stack</strong>!`;
        }

        // Simulate realistic typing delay
        const typingDiv = document.createElement('div');
        typingDiv.className = 'terminal-msg agent-msg';
        typingDiv.innerHTML = `
            <div class="msg-header">
                <span class="sender-tag">🤖 Harsh AI Agent</span>
                <span class="msg-time">Thinking...</span>
            </div>
            <div class="msg-content"><i class="fa-solid fa-circle-notch fa-spin"></i> Processing prompt and retrieving context...</div>
        `;
        body.appendChild(typingDiv);
        body.scrollTop = body.scrollHeight;

        setTimeout(() => {
            typingDiv.remove();
            appendMessage('🤖 Harsh AI Agent', matched, false);
        }, 500);
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        appendMessage('Visitor', escapeHtml(text), true);
        input.value = '';
        processQuery(text);
    });

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            const prompt = chip.getAttribute('data-prompt');
            if (prompt) {
                appendMessage('Visitor', prompt, true);
                processQuery(prompt);
            }
        });
    });
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;')
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

            cards.forEach(card => {
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

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('contact-name').value.trim();
        const subject = document.getElementById('contact-subject').value.trim();
        const message = document.getElementById('contact-message').value.trim();

        const mailtoSubject = encodeURIComponent(`[Portfolio Inquiry] ${subject} - from ${name}`);
        const mailtoBody = encodeURIComponent(`Hi Harsh,\n\nName: ${name}\nTopic/Role: ${subject}\n\nMessage:\n${message}\n\nBest regards,\n${name}`);

        window.location.href = `mailto:mharsh181@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;
    });
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

    const rssUrl = `${BLOGGER_URL}/feeds/posts/default?alt=rss`;
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
