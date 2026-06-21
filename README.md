# Niyatrix Nexora — Startup Marketing Website (Django)

## What this project is
This repository contains a Django-based website for **Niyatrix Nexora**, an AI-native software company. The UI is delivered via Django templates and static assets (CSS/JS/images) and is styled with **Tailwind CSS** (via CDN) plus a custom stylesheet in `website/static/css/styles.css`.

The site currently exposes (via Django routes):
- ` / ` (home / landing)
- ` /blog/ ` (blog index)
- ` /careers/ ` (careers page)

The landing page template (`demo2.html`) includes multiple sections (hero, services, case studies, stats, about/mission/vision, testimonials, insights preview, contact, footer) and uses heavy front-end visuals (Three.js + GSAP) and modal content.

---

## Tech stack
### Backend
- **Python 3**
- **Django** (project in `core/`, app in `website/`)
- SQLite database (`db.sqlite3`)

### Frontend
- **HTML + Django templates**
- **Tailwind CSS CDN**
- Custom CSS: `website/static/css/styles.css`
- **JavaScript**: `website/static/js/script.js`
- **3D / Motion**:
  - `website/static/js/three.min.js`
  - `website/static/js/gsap.min.js`

---

## Repository structure
- `manage.py` — Django entrypoint
- `core/` — Django project settings and URL configuration
  - `core/settings.py`
  - `core/urls.py`
- `website/` — Django app
  - `views.py` — route handlers
  - `urls.py` — app routes
  - `templates/` — page templates
    - `demo2.html` (home/landing)
    - `blog.html` (blog index)
    - `careers.html` (careers)
    - `404.html`
  - `static/`
    - `css/styles.css`
    - `js/script.js`, `js/three.min.js`, `js/gsap.min.js`
    - `images/` (logo + founder image)

---

## Important files (what to edit)
### Backend (routes)
- `website/urls.py`
  - `'' -> views.home`
  - `'blog/' -> views.blog`
  - `'careers/' -> views.careers`
- `website/views.py`
  - Renders templates:
    - `demo2.html`, `blog.html`, `careers.html`

### Frontend (content + structure)
- `website/templates/demo2.html` — main landing template (includes modals and sections)
- `website/templates/blog.html` — blog index template with client-side modal article content
- `website/templates/careers.html` — careers page with accordion + application modal

### Frontend (behavior)
- `website/static/js/script.js`
  - Cursor/trail visuals
  - Navbar behavior (hide/show on scroll)
  - Scroll reveal using `IntersectionObserver`
  - Hero background rendering using Three.js (in `#bg`)
  - Case study modal content injection
  - Blog insight modal content injection
  - Contact form submission (fetch POST to `/contact/`)
  - Newsletter submission mock behavior
  - Careers accordion + application modal (client-side)
  - Hover animations (including additional WebGL scenes on service cards)

---

## PRD
This repo also includes a PRD document:
- `niyatrix-nexora-prd.md`

It describes product/marketing requirements such as sitemap, page requirements, design goals, technical requirements, and success metrics.

---

## How to run locally
### 1) Activate venv
If you already have the included virtual environment folder `destiny/`, you can activate it. Otherwise create a new one.

### 2) Install dependencies
From the repo root:

```bash
pip install -r requirements.txt
```

> Note: A `requirements.txt` file is not visible in the current workspace listing. If your environment already has Django installed, you can proceed; otherwise create/provide a requirements file based on your setup.

### 3) Run migrations (if needed)
```bash
python manage.py migrate
```

### 4) Start the server
```bash
python manage.py runserver
```

Then open:
- http://127.0.0.1:8000/
- http://127.0.0.1:8000/blog/
- http://127.0.0.1:8000/careers/

---

## Forms / submissions
### Contact form
The landing template contains a form that submits via JavaScript:
- `website/static/js/script.js` calls `fetch('/contact/', { method: 'POST', ... })`

However, the current Django routes in `website/urls.py` only include `home`, `blog`, and `careers`. If you need working server-side handling for `/contact/`, you should add:
- a Django view for `/contact/`
- CSRF handling (it already sends `X-CSRFToken`)
- persistence/processing logic (or an integration)

### Newsletter
Newsletter submission is currently handled on the client side (button text changes, no backend call).

### Careers application
Careers application modal includes a `fetch('/apply/', ...)` with CSRF token. A backend endpoint for `/apply/` is not currently present in the visible `website/urls.py`.

---

## Offline/template preview note
The templates contain logic to load static JS/CSS differently when:
- running from `file:` (local HTML preview), or
- when the template path includes `/website/templates/`.

`website/static/js/script.js` also includes a helper (`fixPreviewTemplateLinks`) to map Django template `{% url %}` links to local template filenames for preview.

---

## Branding assets
Static images currently include:
- `website/static/images/logo.jpeg`
- `website/static/images/founder.png`

---

## License
No license file is present in the current workspace listing. Add a license file if you intend to publish this repository.

