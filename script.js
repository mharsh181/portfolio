/* Toggle Icon Navbar */
let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
};

/* Scroll Sections Active Link */
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

window.onscroll = () => {
    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if (top >= offset && top < offset + height) {
            navLinks.forEach(links => {
                links.classList.remove('active');
                document.querySelector('header nav a[href*=' + id + ']').classList.add('active');
            });
        };
    });

    /* Sticky Navbar */
    let header = document.querySelector('header');
    header.classList.toggle('sticky', window.scrollY > 100);

    /* Remove toggle icon and navbar when click navbar link (scroll) */
    menuIcon.classList.remove('bx-x');
    navbar.classList.remove('active');
};

/* Scroll Reveal */
ScrollReveal({
    // reset: true,
    distance: '80px',
    duration: 2000,
    delay: 200
});

ScrollReveal().reveal('.home-content, .heading', { origin: 'top' });
ScrollReveal().reveal('.home-img, .skills-container, .portfolio-box, .contact form', { origin: 'bottom' });
ScrollReveal().reveal('.home-content h1, .about-img', { origin: 'left' });
ScrollReveal().reveal('.home-content p, .about-content', { origin: 'right' });

/* Typed JS */
const typed = new Typed('.multiple-text', {
    strings: ['Python Developer', 'Backend Engineer', 'Django Developer', 'Machine Learning Enthusiast'],
    typeSpeed: 100,
    backSpeed: 100,
    backDelay: 1000,
    loop: true
});

/* Custom Cursor Logic */
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

window.addEventListener("mousemove", function (e) {
    const posX = e.clientX;
    const posY = e.clientY;

    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    // animate outline with slight delay
    cursorOutline.animate({
        left: `${posX}px`,
        top: `${posY}px`
    }, { duration: 500, fill: "forwards" });
});

/* =========================================
   INTEGRATIONS SECTION
   ========================================= */

// CONFIGURATION - REPLACE THESE WITH YOUR DETAILS
const GITHUB_USERNAME = 'mharsh181'; // e.g., 'mhars'
const BLOGGER_URL = 'https://computervigyanofficial.blogspot.com/'; // e.g., 'https://yourblog.blogspot.com'

// 1. Fetch GitHub Repos
const getGitHubRepos = async () => {
    const container = document.getElementById('github-repos');
    if (!container || GITHUB_USERNAME === 'your-github-username-here') {
        if (container) container.innerHTML = '<p class="error">Please configure your GitHub Username in script.js</p>';
        return;
    }

    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=3`);
        if (!response.ok) throw new Error('Failed to fetch repos');

        const repos = await response.json();
        container.innerHTML = ''; // Clear loading

        repos.forEach(repo => {
            const html = `
                <div class="portfolio-box repo-box">
                    <div class="repo-header">
                        <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub Logo">
                        <h4>${repo.name}</h4>
                    </div>
                    <div class="repo-content">
                        <p>${repo.description ? repo.description.substring(0, 100) + '...' : 'No description available.'}</p>
                        <a href="${repo.html_url}" target="_blank" class="repo-link"><i class="fa-solid fa-up-right-from-square"></i> View</a>
                    </div>
                </div>
            `;
            container.innerHTML += html;
        });

        // Re-trigger ScrollReveal for new elements if needed, or simple CSS fade-in
    } catch (error) {
        console.error('GitHub Error:', error);
        container.innerHTML = '<p class="error">Failed to load repositories.</p>';
    }
};

// 2. Fetch Blogger Posts (via RSS to JSON)
const getBlogPosts = async () => {
    const container = document.getElementById('blog-posts');
    if (!container || BLOGGER_URL === 'your-blogger-url-here') {
        if (container) container.innerHTML = '<p class="error">Please configure your Blogger URL in script.js</p>';
        return;
    }

    const rssUrl = `${BLOGGER_URL}/feeds/posts/default?alt=rss`;
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Failed to fetch blog posts');

        const data = await response.json();
        const posts = data.items.slice(0, 3); // Get top 3 posts

        container.innerHTML = '';

        posts.forEach(post => {
            // Extract first image from content or use placeholder
            const imgMatch = post.content.match(/<img[^>]+src="([^">]+)"/);
            const imgSrc = imgMatch ? imgMatch[1] : 'https://placehold.co/600x400/1f242d/0ef?text=Blog+Post';

            const html = `
                <div class="portfolio-box blog-box">
                    <div class="blog-img-box">
                        <img src="${imgSrc}" alt="${post.title}">
                    </div>
                    <div class="portfolio-layer">
                        <h4>${post.title}</h4>
                        <p>Published: ${post.pubDate.split(' ')[0]}</p>
                        <a href="${post.link}" target="_blank"><i class="fa-solid fa-up-right-from-square"></i></a>
                    </div>
                </div>
            `;
            container.innerHTML += html;
        });

        initTilt(); // Initialize tilt for new elements

    } catch (error) {
        console.error('Blogger Error:', error);
        container.innerHTML = '<p class="error">Failed to load blog posts.</p>';
    }
};

// Custom Lightweight 3D Tilt Effect
function initTilt(selector) {
    const elements = document.querySelectorAll(selector);

    elements.forEach(element => {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate center
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Calculate tilt values (max 15deg)
            const rotateX = ((y - centerY) / centerY) * -15;
            const rotateY = ((x - centerX) / centerX) * 15;

            element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });

        // Reset on mouse leave
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });
}

// Initialize integrations
document.addEventListener('DOMContentLoaded', () => {
    getGitHubRepos();
    getBlogPosts();

    // Initialize Tilt for static Skills
    initTilt(".skills-content");
});

// Helper to init tilt on dynamically added elements call this function
function refreshTilt() {
    initTilt(".portfolio-box");
    initTilt(".repo-box");
}

/* Call initTilt for our new static sections too */
document.addEventListener('DOMContentLoaded', () => {
    initTilt(".education-box");
    initTilt(".social-card");
});
