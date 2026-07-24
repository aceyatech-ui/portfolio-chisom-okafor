```markdown
# Aceya — Chisom Okafor Portfolio

> AI/ML | Automation | FullStack Developer | Security Analyst | Engineer

---

## 🔗 Live Site

[https://chisomokafor.vercel.app/](https://chisomokafor.vercel.app/)

---

## 📦 Tech Stack

| Layer | Tools |
|-------|-------|
| **Frontend** | HTML, CSS, JavaScript (vanilla) |
| **Backend** | Python, Flask, REST API |
| **AI** | Google Gemini (with OpenAI-ready fallback) |
| **Deployment** | Vercel (frontend), Render (backend) |
| **SEO** | Sitemap, robots.txt, Google Search Console |

---

## 🧠 Features

- **Chatbot Assistant** — Qualifies leads, asks 3 questions, sends summary to WhatsApp
- **Review System** — Submit reviews → Admin approval → Display verified reviews
- **Admin Panel** — Hidden, password-protected dashboard to approve/reject reviews
- **Projects & Ventures** — Display your work with status badges (Live, In Progress, Completed)
- **Certifications** — Filterable by AI, Security, Dev categories
- **Dark/Light Mode** — System theme toggle
- **Responsive** — Works on desktop, tablet, and mobile
- **SEO Ready** — Meta tags, sitemap, robots.txt, canonical URL

---

## 🚀 Deployment

### Frontend (Vercel)
1. Push code to GitHub.
2. Import repo to Vercel.
3. Deploy.

### Backend (Render)
1. Push `backend/` folder to GitHub.
2. Connect to Render.
3. Set environment variables (see below).
4. Deploy.

---

## 🔐 Environment Variables (Render)

| Variable | Value |
|----------|-------|
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `ADMIN_USERNAME` | Admin login username |
| `ADMIN_PASSWORD` | Admin login password |
| `ADMIN_URL` | Custom admin panel path (e.g., `/aceya-admin-2026`) |
| `SECRET_KEY` | Flask session secret |
| `ALLOWED_ORIGINS` | Your Vercel URL |
| `FLASK_ENV` | `production` |

---

## 📁 Project Structure

```

portfolio-chisom-okafor/
├── index.html
├── data.json
├── style.css
├── script.js
├── sitemap.xml
├── robots.txt
├── assets/
│   ├── images/
│   └── logos/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── reviews.json
│   ├── pending_reviews.json
│   └── templates/
│       ├── admin_login.html
│       └── admin_dashboard.html
└── README.md

```

---

## 📬 Contact

- Email: aceyathedev@gmail.com
- LinkedIn: [Chisom Okafor](https://www.linkedin.com/in/chisom-okafor-5859b93a8)
- GitHub: [aceyatech-ui](https://github.com/aceyatech-ui)
- Instagram: [@aceyathedeveloper](https://www.instagram.com/aceyathedeveloper/)

---

## 📄 License

MIT © 2026 Chisom Okafor (Aceya / Slime)
```