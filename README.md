# ⚡ Harsh Mishra | AI/ML Engineer Portfolio & Admin Panel

A state-of-the-art, high-impact **AI/ML & GenAI Engineer Portfolio** and dedicated **Admin Console** built to showcase autonomous LLM agents, RAG pipelines, computer vision systems, and backend microservices.

![Portfolio Preview](hero.jpg)

## ✨ Key Portfolio Features

- **Cyberpunk / AI Aesthetics**: Deep obsidian canvas (`#07090e`), neural cyan (`#00f5d4`), and electric violet (`#8b5cf6`) accents with ambient glowing mesh.
- **CGPDTM Tech Internship Spotlight**: Government-scale AI operations showcase featuring **IP Saarthi 2.0**, autonomous **Text-to-SQL on SQL Server**, **Legal Document OCR & RAG**, and high-volume **Trademark BLOB Automation**.
- **Interactive AI Agent Simulator**: An embedded interactive terminal simulating Harsh's domain knowledge. Visitors can click quick-prompt buttons or ask custom questions with realistic streaming typing responses.
- **Flagship AI/ML Projects Showcase**:
  - **Multi-Agent SQL AI System**: FastAPI, Ollama (local LLMs), FAISS vector store, SQLite, and query guardrails.
  - **Image Captioning with Object Detection**: YOLOv8 object tag injection into a VGG16 + CNN-LSTM decoder with Beam Search.
  - **Weather Prediction ML Engine**: scikit-learn regression models trained on 100,000+ historical climate records with interactive Streamlit UI.
  - Category filtering (`All`, `Generative AI & RAG`, `Computer Vision & DL`, `Machine Learning & Data`).
- **Dynamic Integrations**: Live GitHub API repository sync and Blogger RSS articles.
- **Academic Foundations & Credentials**: Updated MCA CGPA (**8.00 / 10**) and B.Sc CS Hons (**7.78 / 10**) at Guru Ghasidas Vishwavidyalaya, with verified IBM, Udemy, and Google Cloud credentials.
- **Dual Resume Access**: Direct download link to `Harsh_Mishra_resume-8sept.pdf` and an interactive HTML resume `harsh_mishra_resume.html`.

---

## 🛠️ Admin Panel & Maintenance System

Manage, update, and deploy changes to the portfolio without editing raw HTML or JavaScript.

### Accessing the Admin Console
- **URL**: `http://localhost:8000/admin.html` (or click **Admin** in the footer of `index.html`)
- **Default Security Passcode**: `admin123`

### What You Can Manage via the Admin Panel:
1. **Profile & Hero**: Name, status tag ("Open to AI/ML Roles"), dynamic typewriter phrases, hero summary, location, and philosophy.
2. **Key Metrics**: Modify the 4 high-impact highlight stats in the Hero section.
3. **Links & Socials**: Email, phone, LinkedIn, GitHub, blog feed, and resume file paths.
4. **Work History**: Add, edit, or delete work experience entries and individual achievement bullet points with custom tags.
5. **Flagship Projects**: Add, edit, or delete projects with live category selectors, architecture flow tags, and GitHub repo links.
6. **AI Simulator Knowledge Base**: Add or update question scenarios and rich responses that the interactive AI terminal agent gives.
7. **Skills Matrix**: Add, edit, or reorder technical categories and skill badges.
8. **Education & Certifications**: Update degrees, institutions, CGPAs, and verified credential URLs.
9. **Backup & Deploy**:
   - **One-Click Save to Disk**: Automatically writes changes to `portfolio-data.json` with `.bak` safety backup.
   - **Download JSON**: Export `portfolio-data.json` to commit directly to GitHub Pages.
   - **Import Backup**: Upload a JSON backup file to restore settings.
   - **Factory Reset**: Revert back to the 8-Sept resume baseline data anytime.

---

## 🚀 Running Locally

### Option 1: Using the Included Zero-Dependency Python Admin Server (Recommended)
The included `admin_server.py` hosts both your portfolio and provides direct disk saving for the Admin Panel:

```bash
# Start server on port 8000 (or specify another port: python admin_server.py 3000)
python admin_server.py 8000
```

- **Portfolio**: Open `http://localhost:8000` in your browser.
- **Admin Panel**: Open `http://localhost:8000/admin.html`.

### Option 2: Static / VS Code Live Server
You can open `index.html` and `admin.html` with any static server (like VS Code Live Server).
- Changes saved in `admin.html` will instantly persist in your browser (`LocalStorage`) and you can use the **Download JSON** button to save `portfolio-data.json` for deployment.

---

## 📄 GitHub Pages Deployment

To update your live site at `https://mharsh181.github.io/portfolio`:
1. Use the Admin Panel to make your updates.
2. Click **Save Changes** (or **Download JSON**).
3. Commit and push the changes:
   ```bash
   git add .
   git commit -m "Update portfolio content via Admin Panel"
   git push origin main
   ```
GitHub Pages will automatically build and publish your latest updates!

---

<p align="center">Made with ⚡ by Harsh Mishra</p>
