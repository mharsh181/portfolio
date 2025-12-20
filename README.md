# 🎨 Personal Creative Portfolio

A premium, fast, and fully responsive personal portfolio website designed to showcase projects, skills, and professional journey. Built with specialized CSS animations and real-time data integrations.

![Portfolio Preview](hero.jpg)

## ✨ key Features

-   **Creative Design**: Dark-themed UI with neon accents, glassmorphism, and smooth section transitions.
-   **Theme Personalization**: 🌗 Toggle between premium Dark Mode and polished Light Mode with persistent preference saving.
-   **Interactive Elements**:
    -   **3D Tilt Effect**: Hover over project and skill cards to see a dynamic 3D perspective effect.
    -   **Typing Animation**: Dynamic text in the standard Hero section.
    -   **Custom Cursor**: A unique glowing cursor that follows your movement.
-   **Live Integrations**:
    -   **GitHub API**: Automatically fetches and displays your top repositories (sorted by update).
    -   **Blogger Feed**: Pulls your latest blog posts directly from Blogger.
-   **Visual Timeline**: A "My Journey" section featuring your education history with university logos.
-   **Social Hub**: Interactive social cards (LinkedIn, GitHub, Instagram, Email) replacing the traditional contact form.
-   **Fully Responsive**: Optimized for all devices, from large desktops to mobile phones.

## 🛠️ Tech Stack

-   **Frontend**: HTML5, CSS3 (Custom Properties & Animations), JavaScript (ES6+)
-   **Libraries**:
    -   `ScrollReveal.js` (Scroll Animations)
    -   `Typed.js` (Text Typing Effect)
    -   `FontAwesome` (Icons)
-   **APIs**: GitHub REST API, RSS2JSON (for Blogger)

## 🚀 Setup & Deployment

### Run Locally

1.  Clone the repository:
    ```bash
    git clone https://github.com/mharsh181/portfolio.git
    ```
2.  Open `index.html` in your browser.
    *   *Note: For API calls to work correctly without CORS issues during development, it is recommended to use a local server (e.g., Live Server in VS Code).*

### Customization

1.  **Personal Details**: Edit `index.html` to update your name, summary, and links.
2.  **API Configuration**: Open `script.js` and update the constants at the top:
    ```javascript
    const GITHUB_USERNAME = 'your-username';
    const BLOGGER_URL = 'https://your-blog.blogspot.com/';
    ```

## 📄 License

This project is open-source.

---
<p align="center">Made with ❤️ by Harsh Mishra</p>
