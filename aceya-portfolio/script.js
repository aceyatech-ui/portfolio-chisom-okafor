/* ==========================================================================
   AceyaOS — Portfolio Script
   Loads all content from data.json and wires up:
   - light/dark theme toggle (persisted in localStorage)
   - scroll reveal animations
   - mobile nav
   - projects / programs & certifications filtering (type + tags)
   - reviews & testimonials filtering + submission (to the Flask backend)
   - floating chatbot (persisted in localStorage)
   To update site content, edit data.json — you should not need to touch this file.
   ========================================================================== */

(function () {
  "use strict";

  let SITE_DATA = null;

  /* ------------------------------------------------------------------ */
  /* Utilities                                                           */
  /* ------------------------------------------------------------------ */
  function el(tag, className, html) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function statusBadge(status, label) {
    return '<span class="status-badge status-' + status + '">' + label + '</span>';
  }

  function timelineText(startDate, endDate) {
    return startDate + " – " + endDate;
  }

  /* ------------------------------------------------------------------ */
  /* Theme (light / dark)                                                */
  /* ------------------------------------------------------------------ */
  function initTheme() {
    const saved = localStorage.getItem("aceya-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved || (prefersDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
    updateToggleIcon(theme);

    document.getElementById("themeToggle").addEventListener("click", function () {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("aceya-theme", next);
      updateToggleIcon(next);
    });
  }

  function updateToggleIcon(theme) {
    const icon = document.querySelector("#themeToggle .toggle-icon");
    icon.textContent = theme === "dark" ? "◑" : "◐";
  }

  /* ------------------------------------------------------------------ */
  /* Mobile nav                                                          */
  /* ------------------------------------------------------------------ */
  function initNav() {
    const burger = document.getElementById("navBurger");
    const links = document.getElementById("navLinks");
    burger.addEventListener("click", function () {
      const open = links.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Scroll reveal                                                       */
  /* ------------------------------------------------------------------ */
  function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (i) { i.classList.add("is-visible"); });
      return;
    }
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    items.forEach(function (i) { observer.observe(i); });
  }

  /* ------------------------------------------------------------------ */
  /* Hero terminal typing effect                                         */
  /* ------------------------------------------------------------------ */
  function typeTerminal(profile) {
    const body = document.getElementById("terminalBody");
    const lines = [
      { cmd: "whoami", out: profile.fullName + " (" + profile.nicknames.join(" / ") + ")" },
      { cmd: "cat role.txt", out: profile.title },
      { cmd: "./ship.sh --status", out: "building, shipping, repeating…" }
    ];
    body.innerHTML = "";
    let lineIndex = 0;

    function typeLine() {
      if (lineIndex >= lines.length) {
        const cursorLine = el("p", "", '<span class="prompt">$</span><span class="cursor"></span>');
        body.appendChild(cursorLine);
        return;
      }
      const line = lines[lineIndex];
      const p = el("p", "", '<span class="prompt">$</span><span class="typed"></span>');
      body.appendChild(p);
      const typedSpan = p.querySelector(".typed");
      let charIndex = 0;

      function typeChar() {
        if (charIndex <= line.cmd.length) {
          typedSpan.textContent = line.cmd.slice(0, charIndex);
          charIndex++;
          setTimeout(typeChar, 35);
        } else {
          const outP = el("p", "out", line.out);
          body.appendChild(outP);
          lineIndex++;
          setTimeout(typeLine, 350);
        }
      }
      typeChar();
    }
    typeLine();
  }

  /* ------------------------------------------------------------------ */
  /* Hero / About / Skills                                              */
  /* ------------------------------------------------------------------ */
  function renderHero(profile) {
    document.getElementById("heroTitle").textContent = profile.title;
    typeTerminal(profile);
  }

  function renderAbout(profile) {
    document.getElementById("bioText").textContent = profile.bio;
    document.getElementById("philosophyText").textContent = '"' + profile.philosophy + '"';
    document.getElementById("avatarPlaceholder").textContent =
      profile.fullName.split(" ").map(function (n) { return n[0]; }).join("").slice(0, 2).toUpperCase();
  }

  /* ---- Hobbies Section (bottom of page) ---- */
  function renderHobbies(hobbies) {
    const container = document.getElementById("hobbiesContainer");
    if (!container) return;
    container.innerHTML = "";

    if (!hobbies || hobbies.length === 0) {
      container.style.display = "none";
      return;
    }

    const wrapper = el("div", "hobbies-wrapper");
    const label = el("p", "hobbies-label", "When I'm not building, I'm…");
    wrapper.appendChild(label);

    const row = el("div", "hobbies-row");
    hobbies.forEach(function (hobby) {
      const item = el("div", "hobby-item");
      if (hobby.image) {
        const img = el("img", "hobby-image");
        img.src = hobby.image;
        img.alt = hobby.name || "Hobby";
        item.appendChild(img);
      } else {
        const placeholder = el("div", "hobby-placeholder");
        placeholder.textContent = hobby.name || hobby;
        item.appendChild(placeholder);
      }
      const caption = el("p", "hobby-caption", hobby.name || hobby);
      item.appendChild(caption);
      row.appendChild(item);
    });

    wrapper.appendChild(row);
    container.appendChild(wrapper);
  }

  function renderSkills(skills) {
    const grid = document.getElementById("skillsGrid");
    skills.forEach(function (group) {
      const card = el("div", "skill-card");
      card.appendChild(el("h3", "", group.category));
      const ul = el("ul");
      group.items.forEach(function (item) { ul.appendChild(el("li", "", item)); });
      card.appendChild(ul);
      grid.appendChild(card);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Projects                                                            */
  /* ------------------------------------------------------------------ */
  function renderProjects(projects) {
    const grid = document.getElementById("projectsGrid");
    projects.forEach(function (p) {
      const card = el("div", "project-card");

      const topRow = el("div", "card-top-row");
      topRow.appendChild(el("h3", "", p.name));
      topRow.appendChild(el("span", "", statusBadge(p.status, p.statusLabel)));
      card.appendChild(topRow);

      card.appendChild(el("p", "timeline", timelineText(p.startDate, p.endDate)));
      card.appendChild(el("p", "project-desc", p.description));

      const tagList = el("div", "tag-list");
      p.techStack.forEach(function (t) { tagList.appendChild(el("span", "tag-pill", t)); });
      card.appendChild(tagList);

      const linkRow = el("div", "card-link-row");
      if (p.links && p.links.live) {
        const a = el("a", "", "Live →"); a.href = p.links.live; a.target = "_blank"; a.rel = "noopener";
        linkRow.appendChild(a);
      }
      if (p.links && p.links.github) {
        const a = el("a", "", "GitHub →"); a.href = p.links.github; a.target = "_blank"; a.rel = "noopener";
        linkRow.appendChild(a);
      }
      card.appendChild(linkRow);

      grid.appendChild(card);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Ventures — with role badge and contributions                       */
  /* ------------------------------------------------------------------ */
  function renderVentures(ventures) {
    const grid = document.getElementById("venturesGrid");
    ventures.forEach(function (v) {
      const card = el("div", "venture-card");

      const head = el("div", "venture-head");
      head.appendChild(el("div", "venture-logo", v.name.slice(0, 2).toUpperCase()));

      const headText = el("div", "");
      headText.appendChild(el("h3", "", v.name));
      if (v.role) {
        const roleBadge = el("span", "role-badge", v.role);
        headText.appendChild(roleBadge);
      }

      head.appendChild(headText);
      head.appendChild(el("span", "", statusBadge(v.status, v.statusLabel)));
      head.style.justifyContent = "space-between";
      card.appendChild(head);

      card.appendChild(el("p", "timeline", timelineText(v.startDate, v.endDate)));
      card.appendChild(el("p", "venture-desc", v.description));

      if (v.contributions && v.contributions.length > 0) {
        const contribWrap = el("ul", "venture-contributions");
        v.contributions.forEach(function (item) {
          const li = el("li", "", item);
          contribWrap.appendChild(li);
        });
        card.appendChild(contribWrap);
      }

      const footer = el("div", "venture-footer");
      const socials = el("div", "venture-socials");
      Object.keys(v.socials || {}).forEach(function (key) {
        const url = v.socials[key];
        if (url && url !== "" && url !== "https://instagram.com/placeholder" && url !== "https://linkedin.com/company/placeholder" && url !== "https://twitter.com/placeholder") {
          const a = el("a", "", key[0].toUpperCase() + key.slice(1));
          a.href = url;
          a.target = "_blank";
          a.rel = "noopener";
          socials.appendChild(a);
        }
      });
      footer.appendChild(socials);

      if (v.website) {
        const websiteLink = el("a", "venture-website", "View Website →");
        websiteLink.href = v.website;
        websiteLink.target = "_blank";
        websiteLink.rel = "noopener";
        footer.appendChild(websiteLink);
      }

      card.appendChild(footer);
      grid.appendChild(card);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Work Experience                                                     */
  /* ------------------------------------------------------------------ */
  function renderExperience(jobs) {
    const list = document.getElementById("experienceList");
    jobs.forEach(function (job) {
      const card = el("div", "experience-card");
      card.appendChild(el("div", "exp-logo", job.company.slice(0, 2).toUpperCase()));

      const mid = el("div");
      mid.appendChild(el("p", "exp-role", job.role));
      mid.appendChild(el("p", "exp-company", job.company));
      mid.appendChild(el("p", "exp-desc", job.description));
      card.appendChild(mid);

      card.appendChild(el("span", "exp-duration", timelineText(job.startDate, job.endDate)));
      list.appendChild(card);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Programs & Certifications                                          */
  /* ------------------------------------------------------------------ */
  let ALL_CERTS = [];
  let activeTypeFilter = "all";
  let activeTagFilter = null;

  function renderPrograms(certifications) {
    ALL_CERTS = certifications;
    const tagSet = new Set();
    certifications.forEach(function (c) { c.tags.forEach(function (t) { tagSet.add(t); }); });

    const tagRow = document.getElementById("tagRow");
    tagRow.innerHTML = "";
    tagSet.forEach(function (tag) {
      const btn = el("button", "tag-btn", "#" + tag);
      btn.dataset.tag = tag;
      btn.addEventListener("click", function () {
        activeTagFilter = activeTagFilter === tag ? null : tag;
        tagRow.querySelectorAll(".tag-btn").forEach(function (b) {
          b.classList.toggle("active", b.dataset.tag === activeTagFilter);
        });
        drawPrograms();
      });
      tagRow.appendChild(btn);
    });

    document.querySelectorAll("#filterRow .filter-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeTypeFilter = btn.dataset.filter;
        document.querySelectorAll("#filterRow .filter-btn").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        drawPrograms();
      });
    });

    drawPrograms();
  }

  function drawPrograms() {
    const grid = document.getElementById("programsGrid");
    grid.innerHTML = "";
    const filtered = ALL_CERTS.filter(function (c) {
      const typeMatch = activeTypeFilter === "all" || c.type === activeTypeFilter;
      const tagMatch = !activeTagFilter || c.tags.indexOf(activeTagFilter) !== -1;
      return typeMatch && tagMatch;
    });

    filtered.forEach(function (c) {
      const card = el("div", "program-card");

      const topRow = el("div", "card-top-row");
      const titleWrap = el("div");
      titleWrap.appendChild(el("h3", "", c.name));
      titleWrap.appendChild(el("p", "program-org", c.organisation));
      topRow.appendChild(titleWrap);
      topRow.appendChild(el("span", "", statusBadge(c.status, c.statusLabel)));
      card.appendChild(topRow);

      card.appendChild(el("p", "timeline", timelineText(c.startDate, c.endDate)));

      const bodyRow = el("div", "program-body-row");
      bodyRow.appendChild(el("div", "program-logo", c.organisation.slice(0, 2).toUpperCase()));
      bodyRow.appendChild(el("p", "program-desc", c.description));
      card.appendChild(bodyRow);

      const tagList = el("div", "tag-list");
      c.tags.forEach(function (t) { tagList.appendChild(el("span", "tag-pill", "#" + t)); });
      card.appendChild(tagList);

      const links = el("div", "program-links");
      const programLink = el("a", c.programUrl ? "" : "disabled", "View Program →");
      programLink.href = c.programUrl || "#";
      if (c.programUrl) { programLink.target = "_blank"; programLink.rel = "noopener"; }
      links.appendChild(programLink);

      const certLink = el("a", c.certificateUrl ? "" : "disabled", "View Certificate →");
      certLink.href = c.certificateUrl || "#";
      if (c.certificateUrl) { certLink.target = "_blank"; certLink.rel = "noopener"; }
      links.appendChild(certLink);

      card.appendChild(links);
      grid.appendChild(card);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Reviews & Testimonials                                             */
  /* ------------------------------------------------------------------ */
  let ALL_REVIEW_ITEMS = [];
  let activeReviewFilter = "all";

  function reviewCardNode(item) {
    const card = el("div", "review-card");
    const top = el("div", "review-top");
    top.appendChild(el("div", "review-avatar", item.name.slice(0, 2).toUpperCase()));

    const nameWrap = el("div");
    const nameRow = el("div", "review-name-row");
    const nameLink = el("a", "review-name", item.name);
    nameLink.href = item.linkedin_url; nameLink.target = "_blank"; nameLink.rel = "noopener";
    nameRow.appendChild(nameLink);
    nameRow.appendChild(el("span", "review-type-pill", item.type));
    nameWrap.appendChild(nameRow);

    if (item.role) nameWrap.appendChild(el("p", "review-role", item.role));
    if (item.approved || item.type === "testimonial") {
      nameWrap.appendChild(el("div", "verified-badge", "✔ Verified"));
    }
    top.appendChild(nameWrap);
    card.appendChild(top);

    card.appendChild(el("div", "review-bubble", '"' + item.review + '"'));
    if (item.date) card.appendChild(el("p", "review-date", item.date));

    return card;
  }

  function drawReviews() {
    const grid = document.getElementById("reviewsGrid");
    grid.innerHTML = "";
    const filtered = ALL_REVIEW_ITEMS.filter(function (item) {
      return activeReviewFilter === "all" || item.type === activeReviewFilter;
    });
    if (filtered.length === 0) {
      grid.appendChild(el("p", "reviews-status", "Nothing here yet."));
      return;
    }
    filtered.forEach(function (item) { grid.appendChild(reviewCardNode(item)); });
  }

  function initReviewFilters() {
    document.querySelectorAll("#reviewFilterRow .filter-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeReviewFilter = btn.dataset.reviewFilter;
        document.querySelectorAll("#reviewFilterRow .filter-btn").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        drawReviews();
      });
    });
  }

  function backendUrl(path) {
    const base = (SITE_DATA.backend && SITE_DATA.backend.apiBaseUrl) || "";
    if (!base || base.indexOf("your-render-app") !== -1) return null;
    return base.replace(/\/$/, "") + path;
  }

  function renderReviews(reviews, testimonials) {
    const approvedReviews = (reviews || []).filter(function (r) { return r.approved; });
    ALL_REVIEW_ITEMS = approvedReviews.concat(testimonials || []);
    initReviewFilters();
    drawReviews();

    const statusEl = document.getElementById("reviewsStatus");
    const apiUrl = backendUrl("/api/reviews");
    if (apiUrl) {
      fetch(apiUrl)
        .then(function (res) { if (!res.ok) throw new Error("bad response"); return res.json(); })
        .then(function (liveReviews) {
          ALL_REVIEW_ITEMS = liveReviews.concat(testimonials || []);
          drawReviews();
        })
        .catch(function () {
          statusEl.textContent = "Showing saved reviews — live backend is unreachable right now.";
        });
    }
  }

  function initReviewForm() {
    const form = document.getElementById("reviewForm");
    const feedback = document.getElementById("reviewFormFeedback");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = document.getElementById("reviewName").value.trim();
      const linkedin = document.getElementById("reviewLinkedin").value.trim();
      const text = document.getElementById("reviewText").value.trim();
      if (!name || !text) return;

      const payload = { name: name, linkedin_url: linkedin, review: text };
      const submitUrl = backendUrl("/submit-review");

      if (!submitUrl) {
        feedback.textContent = "Thanks! (Note: no backend connected yet — set backend.apiBaseUrl in data.json to actually collect submissions.)";
        form.reset();
        return;
      }

      fetch(submitUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          if (!res.ok) throw new Error("submit failed");
          feedback.textContent = "Thanks! Your review is pending approval.";
          form.reset();
        })
        .catch(function () {
          feedback.textContent = "Couldn't reach the server. Please try again later.";
        });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Contact                                                            */
  /* ------------------------------------------------------------------ */
  function renderContact(contact) {
    const grid = document.getElementById("contactGrid");
    const entries = [
      { label: "Email", value: contact.email, href: "mailto:" + contact.email },
      { label: "WhatsApp Business", value: "Message me", href: contact.whatsapp },
      { label: "LinkedIn", value: "View profile", href: contact.linkedin },
      { label: "GitHub", value: "View profile", href: contact.github }
    ];
    entries.forEach(function (entry) {
      const a = el("a", "contact-card");
      a.href = entry.href;
      a.target = "_blank"; a.rel = "noopener";
      a.appendChild(el("span", "contact-label", entry.label));
      a.appendChild(el("span", "contact-value", entry.value));
      grid.appendChild(a);
    });

    const footerLinks = document.getElementById("footerLinks");
    const li = el("a", "", "LinkedIn"); li.href = contact.linkedin; li.target = "_blank"; li.rel = "noopener";
    const gh = el("a", "", "GitHub"); gh.href = contact.github; gh.target = "_blank"; gh.rel = "noopener";
    footerLinks.appendChild(li);
    footerLinks.appendChild(gh);
  }

  /* ------------------------------------------------------------------ */
  /* Chatbot                                                            */
  /* ------------------------------------------------------------------ */
  const Chatbot = (function () {
    let config = null;
    let state = { messages: [], userMessageCount: 0, pivoted: false, jokeCount: 0 };
    const STORAGE_KEY = "aceya-chat-history";

    const jokes = [
      "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
      "Why did the developer go broke? Because they used up all their cache! 💸",
      "What's a computer's favorite snack? Microchips! 🍟",
      "Why do Java developers wear glasses? Because they can't C#! 👓",
      "I told my computer I needed a break. Now it keeps sending me Kit-Kat ads. 🍫",
      "Why was the JavaScript developer sad? Because they didn't know how to 'null' their feelings. 😢",
      "What do you call a fake noodle? An impasta! 🍝",
      "Why did the AI break up with the human? Because it felt they were on different wavelengths. 📡",
      "How many programmers does it take to change a light bulb? None — that's a hardware problem. 💡",
      "Why do Python developers have low self-esteem? Because they're constantly trying to find their true self. 🐍",
      "What did the router say to the doctor? 'I need a bandwidth-aid!' 🩹",
      "Why don't robots play hide and seek? Because good luck hiding from thermal vision! 🤖",
      "What's a developer's favorite hangout place? The Foo Bar. 🍻"
    ];

    const headerMessages = [
      "Usually replies within a sec ⚡",
      "Enter 'clear' to erase chat 🧹",
      "Chisom is the best techie around 🏆"
    ];

    let headerIndex = 0;
    let headerInterval = null;

    function pickJoke() { return jokes[Math.floor(Math.random() * jokes.length)]; }

    function startHeaderRotation() {
      const subtitle = document.querySelector(".chat-subtitle");
      if (!subtitle) return;
      if (headerInterval) clearInterval(headerInterval);
      headerInterval = setInterval(function () {
        headerIndex = (headerIndex + 1) % headerMessages.length;
        subtitle.textContent = headerMessages[headerIndex];
      }, 5000);
    }

    function stopHeaderRotation() {
      if (headerInterval) { clearInterval(headerInterval); headerInterval = null; }
    }

    function loadState() {
      try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) state = JSON.parse(raw); } catch (e) {}
    }

    function saveState() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
    }

    function addMessage(sender, text, renderOnly) {
      if (!renderOnly) { state.messages.push({ sender: sender, text: text }); saveState(); }
      const wrap = document.getElementById("chatMessages");
      const bubble = el("div", "chat-bubble " + sender, text);
      wrap.appendChild(bubble);
      wrap.scrollTop = wrap.scrollHeight;
    }

    function containsBlockedKeyword(text) {
      const lower = text.toLowerCase();
      return config.blockedKeywords.some(function (word) { return lower.indexOf(word) !== -1; });
    }

    function isGreeting(text) {
      const lower = text.toLowerCase().trim();
      const greetings = [
        "hi", "hello", "hey", "sup", "yo", "howdy",
        "greetings", "hola", "what's up", "good morning",
        "good evening", "helo", "hlo", "hay", "hii", "heyy"
      ];
      return greetings.some(function (g) {
        return lower === g || lower.startsWith(g) || lower.indexOf(g) !== -1;
      });
    }

    function clearChat() {
      state.messages = [];
      state.userMessageCount = 0;
      state.pivoted = false;
      state.jokeCount = 0;
      saveState();
      document.getElementById("chatMessages").innerHTML = "";
      hideQuickReplies();
      addMessage("bot", config.greeting);
    }

    function showQuickReplies() {
      const wrap = document.getElementById("chatQuickReplies");
      wrap.innerHTML = "";
      wrap.hidden = false;
      config.quickReplies.forEach(function (qr) {
        const btn = el("button", "", qr.label);
        btn.addEventListener("click", function () { hideQuickReplies(); handleAction(qr.action); });
        wrap.appendChild(btn);
      });
    }

    function hideQuickReplies() { document.getElementById("chatQuickReplies").hidden = true; }

    function showGreetingOptions() {
      const wrap = document.getElementById("chatQuickReplies");
      wrap.innerHTML = "";
      wrap.hidden = false;

      if (state.jokeCount >= 3) {
        addMessage("bot", "I've told you enough jokes for now. Let's get down to business! 😄");
        setTimeout(showQuickReplies, 500);
        return;
      }

      const straightBtn = el("button", "", "💼 Get straight into it");
      const jokeBtn = el("button", "", "😂 Tell me a joke");

      straightBtn.addEventListener("click", function () {
        hideQuickReplies();
        addMessage("user", "💼 Get straight into it");
        state.pivoted = true;
        state.jokeCount = 0;
        saveState();
        setTimeout(function () {
          addMessage("bot", "Alright, let's get down to business! What would you like to know?");
          showQuickReplies();
        }, 350);
      });

      jokeBtn.addEventListener("click", function () {
        hideQuickReplies();
        addMessage("user", "😂 Tell me a joke");
        state.jokeCount++;
        saveState();
        setTimeout(function () {
          addMessage("bot", pickJoke());
          setTimeout(function () {
            if (state.jokeCount >= 3) {
              addMessage("bot", "I'm enjoying this, but we gotta get serious. Let's talk business! 😄");
              state.pivoted = true;
              saveState();
              setTimeout(showQuickReplies, 500);
            } else {
              addMessage("bot", "Want another joke, or shall we get down to business?");
              showGreetingOptions();
            }
          }, 500);
        }, 350);
      });

      wrap.appendChild(straightBtn);
      wrap.appendChild(jokeBtn);
    }

    function showYesNoButtons() {
      const wrap = document.getElementById("chatQuickReplies");
      wrap.innerHTML = "";
      wrap.hidden = false;

      const yesBtn = el("button", "", "✅ Yes");
      const noBtn = el("button", "", "❌ No");

      yesBtn.addEventListener("click", function () {
        hideQuickReplies();
        addMessage("user", "✅ Yes");
        setTimeout(function () {
          addMessage("bot", "You can reach Aceya at " + SITE_DATA.profile.contact.email + " or on WhatsApp. Sundays are offline — expect a response on Monday.");
          setTimeout(showQuickReplies, 500);
        }, 350);
      });

      noBtn.addEventListener("click", function () {
        hideQuickReplies();
        addMessage("user", "❌ No");
        setTimeout(function () {
          addMessage("bot", "Uhhh... why are you here exactly? 😅");
          setTimeout(showQuickReplies, 500);
        }, 350);
      });

      wrap.appendChild(yesBtn);
      wrap.appendChild(noBtn);
    }

    function handleAction(action) {
      addMessage("user", config.quickReplies.find(function (q) { return q.action === action; }).label);
      switch (action) {
        case "skills":
          respond(SITE_DATA.skills.map(function (s) { return s.category; }).join(", ") + " — check the Skills section for the full breakdown!");
          break;
        case "projects":
          respond("A few highlights: " + SITE_DATA.projects.slice(0, 3).map(function (p) { return p.name; }).join(", ") + ". Full list is in the Projects section!");
          break;
        case "programs":
          respond("Currently in TRI AI (Google DeepMind), the FlyRank ML Internship, and the ATF AI Challenge — details in the Programs & Certifications section.");
          break;
        case "contact":
          respondWithContact();
          break;
        case "availability":
          respond(config.availability.days + " " + config.availability.responseTime);
          break;
        default:
          addMessage("bot", "Sorry, I can't help you any further. You'd have to contact my maker. Want me to show you how?");
          showYesNoButtons();
      }
    }

    function respond(text) { setTimeout(function () { addMessage("bot", text); }, 350); }

    function respondWithContact() {
      const c = SITE_DATA.profile.contact;
      setTimeout(function () {
        addMessage("bot", "Here's how to reach Aceya: " + c.email + " · LinkedIn and GitHub are linked in the Contact section too.");
      }, 350);
    }

    function handleUserText(text) {
      const trimmed = text.trim();
      if (trimmed.toLowerCase() === "clear") { clearChat(); return; }

      addMessage("user", trimmed);
      state.userMessageCount++;
      saveState();

      const lower = trimmed.toLowerCase();

      if (containsBlockedKeyword(trimmed)) {
        addMessage("bot", "I can't help with that. " + config.fallback);
        showYesNoButtons();
        return;
      }

      if (isGreeting(lower)) {
        addMessage("bot", "Hey there! 😄 Want to get straight into it, or do you want a joke first?");
        showGreetingOptions();
        return;
      }

      if (/joke/.test(lower)) {
        if (state.jokeCount >= 3) {
          addMessage("bot", "I've told you enough jokes for now. Let's get down to business! 😄");
          setTimeout(showQuickReplies, 500);
          return;
        } else {
          state.jokeCount++;
          saveState();
          respond(pickJoke());
          setTimeout(function () {
            if (state.jokeCount >= 3) {
              addMessage("bot", "I'm enjoying this, but we gotta get serious. Let's talk business! 😄");
              state.pivoted = true;
              saveState();
              setTimeout(showQuickReplies, 500);
            } else {
              addMessage("bot", "Want another joke, or shall we get down to business?");
              showGreetingOptions();
            }
          }, 500);
          return;
        }
      }

      if (/skill/.test(lower)) { handleAction("skills"); return; }
      if (/project/.test(lower)) { handleAction("projects"); return; }
      if (/program|cert/.test(lower)) { handleAction("programs"); return; }
      if (/contact|email|reach/.test(lower)) { handleAction("contact"); return; }
      if (/available|availability|hire|schedule/.test(lower)) { handleAction("availability"); return; }

      if (!state.pivoted && state.userMessageCount >= config.pivotAfterMessages) {
        state.pivoted = true;
        saveState();
        respond(config.pivotMessage);
        setTimeout(showQuickReplies, 500);
        return;
      }

      if (!state.pivoted) {
        respond("Ha, fair enough! Tell me more 😄");
        return;
      }

      addMessage("bot", "Sorry, I can't help you any further. You'd have to contact my maker. Want me to show you how?");
      showYesNoButtons();
    }

    function restoreMessages() {
      const wrap = document.getElementById("chatMessages");
      wrap.innerHTML = "";
      if (state.messages.length === 0) {
        addMessage("bot", config.greeting);
      } else {
        state.messages.forEach(function (m) { addMessage(m.sender, m.text, true); });
        if (state.pivoted) showQuickReplies();
      }
    }

    function init(chatbotConfig) {
      config = chatbotConfig;
      loadState();

      const toggle = document.getElementById("chatToggle");
      const windowEl = document.getElementById("chatWindow");
      const closeBtn = document.getElementById("chatClose");
      const form = document.getElementById("chatForm");
      const input = document.getElementById("chatInput");
      const subtitle = document.querySelector(".chat-subtitle");

      if (subtitle) {
        subtitle.textContent = headerMessages[0];
        setTimeout(startHeaderRotation, 2000);
      }

      toggle.addEventListener("click", function () {
        const isHidden = windowEl.hasAttribute("hidden");
        if (isHidden) {
          windowEl.removeAttribute("hidden");
          restoreMessages();
          input.focus();
          if (!headerInterval) setTimeout(startHeaderRotation, 1000);
        } else {
          windowEl.setAttribute("hidden", "");
          stopHeaderRotation();
        }
      });

      closeBtn.addEventListener("click", function () {
        windowEl.setAttribute("hidden", "");
        stopHeaderRotation();
      });

      document.addEventListener("click", function (e) {
        if (!windowEl.hasAttribute("hidden") && !windowEl.contains(e.target) && !toggle.contains(e.target)) {
          windowEl.setAttribute("hidden", "");
          stopHeaderRotation();
        }
      });

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        hideQuickReplies();
        handleUserText(text);
        input.value = "";
      });
    }

    return { init: init };
  })();

  /* ------------------------------------------------------------------ */
  /* Boot                                                               */
  /* ------------------------------------------------------------------ */
  function render(data) {
    SITE_DATA = data;
    renderHero(data.profile);
    renderAbout(data.profile);
    renderSkills(data.skills);
    renderProjects(data.projects);
    renderVentures(data.ventures);
    renderExperience(data.workExperience);
    renderPrograms(data.certifications);
    renderReviews(data.reviews, data.testimonials);
    initReviewForm();
    renderContact(data.profile.contact);
    renderHobbies(data.profile.hobbies);
    document.getElementById("footerYear").textContent = new Date().getFullYear();
    Chatbot.init(data.chatbot);
    initReveal();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initNav();

    fetch("data.json")
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load data.json");
        return res.json();
      })
      .then(render)
      .catch(function (err) {
        console.error(err);
        const main = document.querySelector("main");
        main.innerHTML = '<p style="padding:6rem 1.5rem;font-family:monospace;">' +
          'Could not load data.json. If you opened this file directly in the browser, ' +
          'run a local server instead (see README.md) — browsers block fetch() on file:// URLs.</p>';
      });
  });
})();