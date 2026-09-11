# Aceya Portfolio

Personal portfolio for Chisom Okafor, an AI Automation and Business Systems Engineer.

Live site: [aceyathedeveloper.vercel.app](https://aceyathedeveloper.vercel.app/)

## Overview

This is a vanilla HTML, CSS, and JavaScript portfolio with data-driven sections for:

- Hero profile and terminal-style introduction
- About, skills, projects, ventures, and work experience
- Filterable programs and certifications
- FlyRank internship verification badges
- Calendly booking CTA
- Formspree contact form
- Theme switching and responsive layouts
- Portfolio chatbot backed by the optional Flask API
- Review submission and approval workflow backed by Flask
- SEO metadata, sitemap, robots.txt, and Google Search Console verification

## Stack

- Frontend: HTML5, CSS3, vanilla JavaScript
- Data: `data.json`
- Backend: Python, Flask, Flask-CORS
- Contact delivery: Formspree
- Scheduling: Calendly
- Deployment: Vercel for the frontend, Render-compatible Flask backend

## Authorship and AI Assistance

This is a mixed-authorship project. I own the project direction, content, design
decisions, credentials, and final review. I used AI as a coding assistant for
selected changes, not as the author of the entire portfolio.

### AI-assisted coding in this session

The following features were added or modified with AI assistance during the recent
development sessions:

| Feature | Files changed | What was assisted |
| --- | --- | --- |
| CV viewing | `index.html` | Added the View CV links in the hero and footer. |
| Booking CTA | `index.html` | Connected the Book a Call button to Calendly. |
| Contact form | `index.html`, `script.js`, `data.json`, `style.css` | Added the form layout, Formspree submission flow, validation feedback, and compact contact-card styling. |
| FlyRank credentials | `data.json`, `script.js`, `style.css` | Added verification URLs, the circular FlyRank badge, role labels, and the Verify Certification link. |
| FlyRank descriptions | `data.json` | Reworked the two descriptions using publicly available FlyRank track information. |
| Documentation | `README.md` | Documented setup, services, AI boundaries, and authorship. |

These are AI-assisted edits, not a claim that every line in those files was written
by AI. I remain responsible for checking, accepting, editing, and publishing the
final code and content.

### Pre-existing project code

The following areas were already part of the project before the recent AI-assisted
edits and are my existing project work:

- Portfolio structure, personal profile, projects, ventures, skills, and hobbies
- The original vanilla HTML, CSS, and JavaScript architecture
- Flask backend, review workflow, admin dashboard, and JSON storage
- Chatbot design, prompts, fallback behavior, and Hugging Face integration
- Existing assets, logos, certificates, SEO files, and deployment configuration

## Runtime AI Usage

This project also contains AI-powered functionality at runtime, separate from who
wrote the code.

### Where AI is used

| Area | Location | How AI is used |
| --- | --- | --- |
| Portfolio chatbot | `backend/app.py` (`POST /chat`) | Sends user messages to the Hugging Face Inference API using the Mistral 7B Instruct model and returns a short generated reply. |
| Chatbot fallback | `backend/app.py` | Returns a predefined response when no Hugging Face API key is configured or the AI request fails. |
| AI-related portfolio work | `data.json` | Describes work and learning involving AI automation, small language models, AI agents, and AI marketing. These are portfolio content entries, not AI execution inside the portfolio UI. |

### Where AI is not used

| Area | Location | Implementation |
| --- | --- | --- |
| Portfolio rendering | `script.js` | Regular vanilla JavaScript creates sections, cards, filters, animations, and interactive controls from `data.json`. |
| Theme and navigation | `script.js`, `style.css` | Local browser interactions, CSS variables, responsive CSS, and `localStorage`; no AI model is involved. |
| Contact form | `index.html`, `script.js` | Sends the submitted form to Formspree with a normal `POST` request; it does not use AI. |
| Scheduling | `index.html` | Opens the Calendly booking page; it does not use AI. |
| FlyRank verification badges | `data.json`, `script.js` | Uses a stored verification URL and locally rendered SVG badge; it does not generate or verify credentials with AI. |
| Reviews and admin workflow | `backend/app.py` | Uses Flask routes, JSON files, sessions, and password checks; it does not use AI. |

The frontend remains usable without the AI backend. If the Flask server or Hugging Face API is unavailable, the rest of the portfolio still works; only chatbot responses and backend-powered review features are affected.

## Run Locally

The frontend is static, but it should be served over HTTP because it loads `data.json` with `fetch`.

### Frontend

From the project root, use any static server. For example, with Python:

```bash
python -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000).

### Backend

The backend is optional for the static portfolio. It supports reviews, the admin dashboard, and chatbot requests.

On Windows PowerShell:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

The Flask server runs at `http://localhost:5000` by default.

To connect the frontend to a local backend, update `backend.apiBaseUrl` in `data.json`:

```json
{
	"backend": {
		"apiBaseUrl": "http://localhost:5000"
	}
}
```

## Contact and Scheduling

The contact form submits directly to Formspree using the endpoint configured in `data.json` and does not require a custom backend. The form fields are sent with `POST` and handled asynchronously in `script.js`.

The **Book a Call** button opens the public Calendly page:

`https://calendly.com/aceyathedev/30min`

To use your own Formspree form, update both the form action in `index.html` and `profile.contact.formspreeEndpoint` in `data.json`.

## Backend Configuration

Create a `.env` file inside `backend/` for local or Render deployment. Do not commit secrets.

| Variable | Purpose |
| --- | --- |
| `HUGGINGFACE_API_KEY` | API key used by the chatbot backend |
| `ADMIN_USERNAME` | Admin dashboard username |
| `ADMIN_PASSWORD` | Admin dashboard password |
| `ADMIN_URL` | Non-default admin route |
| `SECRET_KEY` | Flask session signing key |
| `ALLOWED_ORIGINS` | Allowed frontend origin(s) |

The backend exposes routes for:

- `GET /ping`
- `GET /api/reviews`
- `POST /submit-review`
- `POST /chat`
- Admin login, dashboard, approval, rejection, deletion, and logout routes

## Project Structure

```text
portfolio-chisom-okafor/
├── index.html                 # Portfolio markup and contact form
├── data.json                  # Portfolio content and service URLs
├── script.js                  # Rendering, interactions, chatbot, and form logic
├── style.css                  # Site theme and responsive layout
├── assets/
│   ├── CV/
│   ├── images/
│   └── logos/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── reviews.json
│   ├── pending_reviews.json
│   └── templates/
├── sitemap.xml
├── robots.txt
└── README.md
```

## Editing Content

Most portfolio content can be changed in `data.json`, including:

- Profile name, title, bio, and hobbies
- Contact links and logos
- Projects, ventures, experience, certifications, and badges
- Chatbot copy and questions
- Backend API URL
- Formspree endpoint

Keep URLs and asset paths relative to the project root when possible.

## Deployment

### Frontend

1. Push the repository to GitHub.
2. Import the repository into Vercel or another static host.
3. Deploy from the project root.
4. Confirm that `data.json`, `assets/`, `robots.txt`, and `sitemap.xml` are publicly accessible.

### Backend

1. Deploy the `backend/` directory to Render or another Python host.
2. Install dependencies from `backend/requirements.txt`.
3. Add the backend environment variables.
4. Set `backend.apiBaseUrl` in `data.json` to the deployed API URL.
5. Set `ALLOWED_ORIGINS` to the deployed frontend origin.

## Contact

- Email: [aceyathedev@gmail.com](mailto:aceyathedev@gmail.com)
- LinkedIn: [Chisom Okafor](https://www.linkedin.com/in/chisom-okafor-5859b93a8)
- GitHub: [aceyatech-ui](https://github.com/aceyatech-ui)
- Instagram: [@aceyathedeveloper](https://www.instagram.com/aceyathedeveloper/)
- Book a call: [Calendly](https://calendly.com/aceyathedev/30min)

## License

MIT © 2026 Chisom Okafor