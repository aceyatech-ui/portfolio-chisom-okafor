/* ==========================================================================
   AceyaOS — Portfolio Script
   ========================================================================== */

(function () {
  "use strict";

  let SITE_DATA = null;
  let questionIndex = 0;
  let answers = [];

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

  function renderHero(profile) {
    document.getElementById("heroTitle").textContent = profile.title;
    typeTerminal(profile);
  }

  function renderAbout(profile) {
    document.getElementById("bioText").textContent = profile.bio;
    document.getElementById("philosophyText").textContent = '"' + profile.philosophy + '"';

    const avatar = document.getElementById("avatarPlaceholder");
    if (profile.profileImage) {
      avatar.innerHTML = '';
      const img = document.createElement('img');
      img.src = profile.profileImage;
      img.alt = profile.fullName;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '50%';
      avatar.appendChild(img);
    } else {
      avatar.textContent = profile.fullName.split(" ").map(function (n) { return n[0]; }).join("").slice(0, 2).toUpperCase();
    }
  }

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

  let ALL_CERTS = [];
  let activeTypeFilter = "all";
  let activeTagFilter = null;
  let activeCertCategoryFilter = "all";

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

    document.querySelectorAll("#certFilterRow .filter-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeCertCategoryFilter = btn.dataset.certFilter;
        document.querySelectorAll("#certFilterRow .filter-btn").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        drawPrograms();
      });
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
      const categoryMatch = activeCertCategoryFilter === "all" || c.category === activeCertCategoryFilter;
      return typeMatch && tagMatch && categoryMatch;
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

      // Show certificate image directly (replaces program logo)
      if (c.image) {
        const imgWrap = el("div", "cert-image-wrap");
        const img = el("img", "cert-image");
        img.src = c.image;
        img.alt = c.name + " certificate";
        imgWrap.appendChild(img);
        bodyRow.appendChild(imgWrap);
      }

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

  function renderContact(contact) {
    const grid = document.getElementById("contactGrid");
    const entries = [
      { label: "Email", value: contact.email, href: "mailto:" + contact.email, logo: contact.logos.email },
      { label: "WhatsApp Business", value: "Message me", href: contact.whatsapp, logo: contact.logos.whatsapp },
      { label: "LinkedIn", value: "View profile", href: contact.linkedin, logo: contact.logos.linkedin },
      { label: "GitHub", value: "View profile", href: contact.github, logo: contact.logos.github }
    ];
    entries.forEach(function (entry) {
      const a = el("a", "contact-card");
      a.href = entry.href;
      a.target = "_blank"; a.rel = "noopener";
      if (entry.logo) {
        const img = el("img", "contact-logo");
        img.src = entry.logo;
        img.alt = entry.label;
        a.appendChild(img);
      }
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

  const Chatbot = (function () {
    let config = null;
    let state = { messages: [], userMessageCount: 0, pivoted: false };
    let questionIndex = 0;
    let answers = [];
    const STORAGE_KEY = "aceya-chat-history";

    const headerMessages = [
      "Usually replies within a sec ⚡",
      "Enter 'clear' to erase chat 🧹",
      "Chisom is the best techie around 🏆"
    ];

    let headerIndex = 0;
    let headerInterval = null;

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
      if (lower.length < 2) return false;
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
      questionIndex = 0;
      answers = [];
      saveState();
      document.getElementById("chatMessages").innerHTML = "";
      hideQuickReplies();
      addMessage("bot", config.greeting);
      setTimeout(function () {
        addMessage("bot", config.questions[0]);
      }, 500);
    }

    function showWhatsAppLink(summary) {
      const message = summary || "I'd like to discuss a project with Chisom.";
      const url = "https://api.whatsapp.com/send?phone=" + config.whatsappNumber + "&text=" + encodeURIComponent(message);
      const wrap = document.getElementById("chatMessages");
      const link = el("a", "whatsapp-link", "📱 Send Summary via WhatsApp");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener";
      wrap.appendChild(link);
      wrap.scrollTop = wrap.scrollHeight;
    }

    function generateSummary() {
      const template = config.summaryTemplate;
      return template
        .replace("{project}", answers[0] || "unspecified")
        .replace("{budget}", answers[1] || "unspecified")
        .replace("{timeline}", answers[2] || "unspecified");
    }

    function showContactQuickReplies() {
      const wrap = document.getElementById("chatQuickReplies");
      wrap.innerHTML = "";
      wrap.hidden = false;

      // Updated: No GitHub, added Instagram
      const contactOptions = [
        { label: "📱 WhatsApp", action: "whatsapp" },
        { label: "📧 Email", action: "email" },
        { label: "🔗 LinkedIn", action: "linkedin" },
        { label: "📸 Instagram", action: "instagram" },
        { label: "🔄 Start Over", action: "reset" }
      ];

      contactOptions.forEach(function (opt) {
        const btn = el("button", "", opt.label);
        btn.addEventListener("click", function () {
          hideQuickReplies();
          handleAction(opt.action);
        });
        wrap.appendChild(btn);
      });
    }

    function hideQuickReplies() { document.getElementById("chatQuickReplies").hidden = true; }

    function showGreetingOptions() {
      addMessage("bot", config.questions[0]);
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
          addMessage("bot", "Great! Let me connect you with Chisom directly.");
          setTimeout(showContactQuickReplies, 500);
        }, 350);
      });

      noBtn.addEventListener("click", function () {
        hideQuickReplies();
        addMessage("user", "❌ No");
        setTimeout(function () {
          addMessage("bot", "No problem! Is there anything else I can help with?");
          setTimeout(showContactQuickReplies, 500);
        }, 350);
      });

      wrap.appendChild(yesBtn);
      wrap.appendChild(noBtn);
    }

    function handleAction(action) {
      switch (action) {
        case "whatsapp":
          const waLink = SITE_DATA.profile.contact.whatsapp || "https://wa.me/234XXXXXXXXX";
          addMessage("bot", "📱 Click below to message Chisom on WhatsApp:");
          const waBtn = el("a", "whatsapp-link", "Open WhatsApp →");
          waBtn.href = waLink;
          waBtn.target = "_blank";
          waBtn.rel = "noopener";
          document.getElementById("chatMessages").appendChild(waBtn);
          break;
        case "email":
          const email = SITE_DATA.profile.contact.email || "aceyathedev@gmail.com";
          addMessage("bot", "📧 Email Chisom directly: " + email);
          break;
        case "linkedin":
          const li = SITE_DATA.profile.contact.linkedin || "https://linkedin.com/in/chisom-okafor-5859b93a8";
          addMessage("bot", "🔗 Connect on LinkedIn: " + li);
          break;
        case "instagram":
          const ig = SITE_DATA.profile.contact.instagram || "https://www.instagram.com/aceyathedeveloper/";
          addMessage("bot", "📸 Follow on Instagram: " + ig);
          break;
        case "reset":
          clearChat();
          break;
        default:
          addMessage("bot", config.redirectLine);
          setTimeout(showContactQuickReplies, 500);
      }
    }

    function respond(text) { setTimeout(function () { addMessage("bot", text); }, 350); }

    function respondWithContact() {
      const c = SITE_DATA.profile.contact;
      setTimeout(function () {
        addMessage("bot", "Here's how to reach Aceya: " + c.email + " · LinkedIn and GitHub are linked in the Contact section too.");
      }, 350);
    }

    function fetchGemini(message) {
      fetch("https://portfolio-chisom-okafor.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message })
      })
      .then(res => res.json())
      .then(data => {
        const reply = data.reply || data.error || "Good question! Chisom would love to help. Let me connect you with her directly.";
        addMessage("bot", reply);
        setTimeout(function () {
          addMessage("bot", "I really shouldn't be talking to you this long. Let me connect you with Chisom directly!");
          showContactQuickReplies();
        }, 500);
      })
      .catch(() => {
        addMessage("bot", "Good question! Chisom would love to help. Let me connect you with her directly.");
        setTimeout(showContactQuickReplies, 500);
      });
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
        addMessage("bot", "Hey! 👋 I'm Chisom's assistant. Let me quickly figure out what you need so I can connect you with her directly.");
        setTimeout(function () {
          addMessage("bot", config.questions[0]);
        }, 500);
        return;
      }

      if (/not sure|don't know|unsure/.test(lower)) {
        addMessage("bot", "No problem! That's what Chisom is for. Let me connect you with her directly.");
        setTimeout(showContactQuickReplies, 500);
        return;
      }

      if (questionIndex < config.questions.length) {
        answers.push(trimmed);
        questionIndex++;
        if (questionIndex < config.questions.length) {
          setTimeout(function () {
            addMessage("bot", config.questions[questionIndex]);
          }, 500);
        } else {
          const summary = generateSummary();
          setTimeout(function () {
            addMessage("bot", "📋 Here's a summary of what I gathered:\n\n" + summary);
          }, 500);
          setTimeout(function () {
            showWhatsAppLink(summary);
          }, 1000);
          setTimeout(showContactQuickReplies, 1500);
        }
        return;
      }

      if (/how much|price|cost|budget|slm|llm|ai|model|train|explain|what is/.test(lower)) {
        fetchGemini(trimmed);
        return;
      }

      if (!state.pivoted && state.userMessageCount >= config.pivotAfterMessages) {
        state.pivoted = true;
        saveState();
        addMessage("bot", config.redirectLine);
        setTimeout(showContactQuickReplies, 500);
        return;
      }

      if (!state.pivoted) {
        respond("Ha, fair enough! Tell me more 😄");
        return;
      }

      addMessage("bot", config.redirectLine);
      setTimeout(showContactQuickReplies, 500);
    }

    function restoreMessages() {
      const wrap = document.getElementById("chatMessages");
      wrap.innerHTML = "";
      if (state.messages.length === 0) {
        addMessage("bot", config.greeting);
        setTimeout(function () {
          addMessage("bot", config.questions[0]);
        }, 500);
      } else {
        state.messages.forEach(function (m) { addMessage(m.sender, m.text, true); });
        if (state.pivoted) showContactQuickReplies();
      }
    }

    function init(chatbotConfig) {
      config = chatbotConfig;
      localStorage.removeItem(STORAGE_KEY);
      state = { messages: [], userMessageCount: 0, pivoted: false };
      questionIndex = 0;
      answers = [];

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