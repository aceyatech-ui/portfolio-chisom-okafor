"""
Aceya Portfolio — Backend
=========================
Handles review submissions and a hidden, password-protected admin panel
for approving/rejecting them.

Endpoints
---------
POST /submit-review          -> stores a new review in pending_reviews.json
GET  <ADMIN_URL>              -> admin login page
POST <ADMIN_URL>              -> verifies password, starts admin session
GET  <ADMIN_URL>/dashboard    -> admin dashboard (session required)
POST /approve-review/<id>    -> moves a review from pending -> approved
POST /reject-review/<id>     -> deletes a review from pending
GET  /api/reviews             -> public: returns all approved reviews (JSON)
POST /admin-logout            -> clears the admin session

Run locally
-----------
  cd backend
  python -m venv venv && source venv/bin/activate   (Windows: venv\\Scripts\\activate)
  pip install -r requirements.txt
  cp .env.example .env      # then edit .env with your own password
  python app.py

The server starts on http://localhost:5000 by default.
See README.md for deploying this to Render.
"""

import json
import os
import uuid
from datetime import date
from functools import wraps

from dotenv import load_dotenv
from flask import Flask, jsonify, redirect, render_template, request, session, url_for
from flask_cors import CORS

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
REVIEWS_FILE = os.path.join(BASE_DIR, "reviews.json")
PENDING_FILE = os.path.join(BASE_DIR, "pending_reviews.json")

ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "change-me")
# Custom, unguessable admin path. Never link this anywhere on the public site.
ADMIN_URL = os.environ.get("ADMIN_URL", "/aceya-admin-2026").rstrip("/")
SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-me")

# Comma-separated list of allowed frontend origins (your GitHub Pages URL, etc.)
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "*")

app = Flask(__name__)
app.secret_key = SECRET_KEY
CORS(app, resources={
    r"/api/*": {"origins": ALLOWED_ORIGINS},
    r"/submit-review": {"origins": ALLOWED_ORIGINS},
})


# --------------------------------------------------------------------------
# Small JSON "database" helpers
# --------------------------------------------------------------------------
def _read_json(path):
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []


def _write_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def get_pending():
    return _read_json(PENDING_FILE)


def get_approved():
    return _read_json(REVIEWS_FILE)


# --------------------------------------------------------------------------
# Admin auth
# --------------------------------------------------------------------------
def admin_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not session.get("is_admin"):
            return redirect(ADMIN_URL)
        return view(*args, **kwargs)
    return wrapped


# --------------------------------------------------------------------------
# Public API — used by the frontend
# --------------------------------------------------------------------------
@app.route("/api/reviews", methods=["GET"])
def api_reviews():
    """Returns all approved reviews. The frontend falls back to the reviews
    baked into data.json if this endpoint is unreachable."""
    return jsonify(get_approved())


@app.route("/submit-review", methods=["POST"])
def submit_review():
    payload = request.get_json(silent=True) or {}
    name = (payload.get("name") or "").strip()
    review_text = (payload.get("review") or "").strip()
    linkedin_url = (payload.get("linkedin_url") or "").strip()

    if not name or not review_text:
        return jsonify({"error": "name and review are required"}), 400

    new_review = {
        "id": "rev-" + uuid.uuid4().hex[:8],
        "type": "review",
        "name": name,
        "linkedin_url": linkedin_url,
        "review": review_text,
        "date": date.today().isoformat(),
        "approved": False,
    }

    pending = get_pending()
    pending.append(new_review)
    _write_json(PENDING_FILE, pending)

    return jsonify({"status": "pending", "id": new_review["id"]}), 201


# --------------------------------------------------------------------------
# Admin panel — hidden URL, password protected
# --------------------------------------------------------------------------
@app.route(ADMIN_URL, methods=["GET", "POST"])
def admin_login():
    error = None
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "").strip()
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session["is_admin"] = True
            return redirect(ADMIN_URL + "/dashboard")
        error = "Incorrect username or password."
    return render_template("admin_login.html", error=error)


@app.route(ADMIN_URL + "/dashboard", methods=["GET"])
@admin_required
def admin_dashboard():
    return render_template(
        "admin_dashboard.html",
        pending=get_pending(),
        approved=get_approved(),
        admin_url=ADMIN_URL,
    )


@app.route("/approve-review/<review_id>", methods=["POST"])
@admin_required
def approve_review(review_id):
    pending = get_pending()
    target = next((r for r in pending if r["id"] == review_id), None)
    if target:
        target["approved"] = True
        pending = [r for r in pending if r["id"] != review_id]
        _write_json(PENDING_FILE, pending)

        approved = get_approved()
        approved.append(target)
        _write_json(REVIEWS_FILE, approved)

    return redirect(ADMIN_URL + "/dashboard")


@app.route("/reject-review/<review_id>", methods=["POST"])
@admin_required
def reject_review(review_id):
    pending = get_pending()
    pending = [r for r in pending if r["id"] != review_id]
    _write_json(PENDING_FILE, pending)
    return redirect(ADMIN_URL + "/dashboard")


@app.route("/admin-logout", methods=["POST"])
def admin_logout():
    session.pop("is_admin", None)
    return redirect(ADMIN_URL)


# --------------------------------------------------------------------------
# Health check (handy for Render)
# --------------------------------------------------------------------------
@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "aceya-portfolio-backend"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("FLASK_ENV") != "production")