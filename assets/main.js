document.addEventListener("DOMContentLoaded", function () {
  var basePathname = new URL(document.baseURI).pathname.replace(/\/$/, "");
  var rawPathname = window.location.pathname;
  var pathname = rawPathname.indexOf(basePathname) === 0 ? rawPathname.slice(basePathname.length) : rawPathname;
  if (!pathname) pathname = "/";
  if (pathname.charAt(0) !== "/") pathname = "/" + pathname;
  var navLinks = document.querySelectorAll("header .nav-links a[href]");
  var headerNavs = document.querySelectorAll("header .header-inner .nav-links");
  var personaRouteMatch = pathname.match(/^\/(admin|teacher|homeschool|students)(?:\/|$)/);
  var roleLabels = {
    admin: "Role: Admin",
    teacher: "Role: Teacher",
    homeschool: "Role: Homeschool",
    students: "Role: Student"
  };
  var roleEmoji = {
    admin: "🏫",
    teacher: "👩‍🏫",
    homeschool: "🏡",
    students: "🎓"
  };
  var roleDescriptions = {
    admin: "District-wide setup and reporting.",
    teacher: "Class assignments and progress tracking.",
    homeschool: "At-home learning plans and routines.",
    students: "Practice lessons, games, and goals."
  };
  var rolePaths = {
    admin: "admin/",
    teacher: "teacher/",
    homeschool: "homeschool/",
    students: "students/"
  };
  var storedRole = null;
  try {
    storedRole = window.localStorage.getItem("selectedRole");
  } catch (err) {}
  var urlRole = new URL(window.location.href).searchParams.get("role");
  var normalizedUrlRole = urlRole && roleLabels[urlRole] ? urlRole : null;
  var contextRole = personaRouteMatch ? personaRouteMatch[1] : (normalizedUrlRole || (storedRole && roleLabels[storedRole] ? storedRole : null));

  if (contextRole) {
    try {
      window.localStorage.setItem("selectedRole", contextRole);
    } catch (err) {}
  }

  if (personaRouteMatch) {
    document.body.classList.add("persona-" + personaRouteMatch[1]);
    document.body.classList.add("persona-landing");
  }

  headerNavs.forEach(function (nav, index) {
    var parent = nav.parentElement;
    if (!parent) return;

    var navId = nav.id || "site-nav-" + index;
    nav.id = navId;

    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "nav-toggle";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", navId);
    toggle.setAttribute("aria-label", "Toggle navigation");
    toggle.innerHTML = "<span aria-hidden=\"true\">☰</span> Menu";

    parent.insertBefore(toggle, nav);

    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  });

  var dropdownToggle = document.querySelector(".dropdown .dropdown-toggle");
  if (dropdownToggle) {
    var roleKey = contextRole;
    if (!roleKey) {
      var roleLink = document.querySelector(".dropdown-menu a[aria-current=\"page\"]");
      if (roleLink) {
        var href = roleLink.getAttribute("href") || "";
        var rolePathname = new URL(href, document.baseURI).pathname;
        rolePathname = rolePathname.indexOf(basePathname) === 0 ? rolePathname.slice(basePathname.length) : rolePathname;
        if (rolePathname.charAt(0) !== "/") rolePathname = "/" + rolePathname;
        var roleMatch = rolePathname.match(/^\/(admin|teacher|homeschool|students)\/?$/);
        if (roleMatch) roleKey = roleMatch[1];
      }
    }
    if (roleKey && roleLabels[roleKey]) {
      dropdownToggle.textContent = roleLabels[roleKey];
      dropdownToggle.setAttribute("href", rolePaths[roleKey]);
    }
  }

  document.querySelectorAll(".dropdown-menu a[href]").forEach(function (link) {
    if (link.getAttribute("data-role-enhanced") === "true") return;
    var href = link.getAttribute("href") || "";
    var localPathname = new URL(href, document.baseURI).pathname;
    localPathname = localPathname.indexOf(basePathname) === 0 ? localPathname.slice(basePathname.length) : localPathname;
    if (localPathname.charAt(0) !== "/") localPathname = "/" + localPathname;
    var match = localPathname.match(/^\/(admin|teacher|homeschool|students)\/?$/);
    if (!match) return;

    var key = match[1];
    if (!roleEmoji[key]) return;
    var roleName = link.textContent.trim();
    var description = roleDescriptions[key] || "";
    link.classList.add("role-item-link");
    link.innerHTML =
      "<span class=\"role-item-title\">" + roleEmoji[key] + " " + roleName + "</span>" +
      "<span class=\"role-item-subtext\">" + description + "</span>";
    link.setAttribute("data-role-enhanced", "true");

    if (contextRole && key === contextRole) {
      link.classList.add("role-item-active");
    }

    link.addEventListener("click", function () {
      try {
        window.localStorage.setItem("selectedRole", key);
      } catch (err) {}
    });
  });

  var bestMatch = null;
  navLinks.forEach(function (link) {
    var href = link.getAttribute("href");
    if (!href || href.indexOf("http") === 0 || href.indexOf("#") === 0) return;

    var linkPathname = new URL(href, document.baseURI).pathname;
    linkPathname = linkPathname.indexOf(basePathname) === 0 ? linkPathname.slice(basePathname.length) : linkPathname;
    if (!linkPathname) linkPathname = "/";
    if (linkPathname.charAt(0) !== "/") linkPathname = "/" + linkPathname;
    if (linkPathname === "/login/" || linkPathname === "/signup/") return;

    var isExactMatch = linkPathname === pathname;
    var isDirectoryMatch = linkPathname !== "/" && pathname.indexOf(linkPathname) === 0;

    if (isExactMatch || isDirectoryMatch) {
      if (!bestMatch || linkPathname.length > bestMatch.href.length) {
        bestMatch = { link: link, href: linkPathname };
      }
    }
  });

  if (bestMatch) {
    bestMatch.link.setAttribute("aria-current", "page");
  }

  var personaMatch = pathname.match(/^\/(admin|teacher|homeschool|students)\/?$/);
  if (personaMatch) {
    hydratePersonaPage(personaMatch[1]);
  }

  var topicMatch = pathname.match(/^\/(curriculum|standards|accessibility|plus)\/?$/);
  if (topicMatch) {
    document.body.classList.add("shared-topic-page");
    document.body.classList.add("topic-" + topicMatch[1]);
    hydrateSharedTopicPage(topicMatch[1]);
  }

  document.querySelectorAll("header .nav-links a[href]").forEach(function (link) {
    var linkPathname = new URL(link.getAttribute("href"), document.baseURI).pathname;
    linkPathname = linkPathname.indexOf(basePathname) === 0 ? linkPathname.slice(basePathname.length) : linkPathname;
    if (!linkPathname) linkPathname = "/";
    if (linkPathname.charAt(0) !== "/") linkPathname = "/" + linkPathname;

    if (linkPathname === "/login/" || linkPathname === "/login/educator/" || linkPathname === "/login/student/") {
      link.setAttribute("data-auth-trigger", "login");
      link.setAttribute("href", "login/");
    }
    if (linkPathname === "/signup/" || linkPathname === "/signup/educator/" || linkPathname === "/signup/student/") {
      link.setAttribute("data-auth-trigger", "signup");
      link.setAttribute("href", "signup/");
    }
  });

  var modal = document.getElementById("auth-modal");
  if (!modal) {
    modal = createAuthModal();
    document.body.appendChild(modal);
  }

  var educatorBtn = modal.querySelector("[data-role=\"educator\"]");
  var studentBtn = modal.querySelector("[data-role=\"student\"]");
  var titleEl = modal.querySelector(".modal-title");
  var descriptionEl = modal.querySelector(".modal-description");

  var targets = {
    login: {
      educator: "login/educator/",
      student: "login/student/",
      title: "Log In",
      description: "Choose whether you're logging in as an educator or a student."
    },
    signup: {
      educator: "signup/educator/",
      student: "signup/student/",
      title: "Sign Up",
      description: "Choose whether you're signing up as an educator or a student."
    }
  };

  function openModal(mode) {
    var cfg = mode === "signup" ? targets.signup : targets.login;

    if (educatorBtn) educatorBtn.setAttribute("href", cfg.educator);
    if (studentBtn) studentBtn.setAttribute("href", cfg.student);
    if (titleEl) titleEl.textContent = cfg.title;
    if (descriptionEl) descriptionEl.textContent = cfg.description;

    modal.classList.add("is-visible");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    modal.classList.remove("is-visible");
    modal.setAttribute("aria-hidden", "true");
  }

  var triggers = document.querySelectorAll("[data-auth-trigger]");
  triggers.forEach(function (el) {
    el.addEventListener("click", function (event) {
      event.preventDefault();
      openModal(el.getAttribute("data-auth-trigger") || "login");
    });
  });

  var closeBtn = modal.querySelector(".modal-close");
  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", function (event) {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeModal();
  });

  var authRouteMatch = pathname.match(/^\/(login|signup)(?:\/(educator|student))?\/?$/);
  if (authRouteMatch) {
    openModal(authRouteMatch[1]);
  }
});

function createAuthModal() {
  var wrapper = document.createElement("div");
  wrapper.className = "modal-backdrop";
  wrapper.id = "auth-modal";
  wrapper.setAttribute("aria-hidden", "true");
  wrapper.innerHTML =
    "<div class=\"modal\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"auth-modal-title\">" +
      "<div class=\"modal-header\">" +
        "<h2 class=\"modal-title\" id=\"auth-modal-title\">Log In</h2>" +
        "<button class=\"modal-close\" type=\"button\" aria-label=\"Close\">&times;</button>" +
      "</div>" +
      "<div class=\"modal-body\">" +
        "<p class=\"modal-description\">Choose whether you're logging in as an educator or a student.</p>" +
        "<div class=\"modal-actions\">" +
          "<a href=\"login/educator/\" class=\"btn\" data-role=\"educator\">Educator</a>" +
          "<a href=\"login/student/\" class=\"btn btn-secondary\" data-role=\"student\">Student</a>" +
        "</div>" +
      "</div>" +
    "</div>";
  return wrapper;
}

function hydratePersonaPage(personaKey) {
  var personaMap = {
    admin: {
      label: "admins",
      audience: "district and school teams",
      ctaHref: "signup/educator/",
      ctaLabel: "Create admin account",
      heroImage: "assets/ai-hero-admin.svg"
    },
    teacher: {
      label: "teachers",
      audience: "classroom teachers",
      ctaHref: "signup/educator/",
      ctaLabel: "Create teacher account",
      heroImage: "assets/ai-hero-teacher.svg"
    },
    homeschool: {
      label: "homeschool families",
      audience: "parents and learning pods",
      ctaHref: "signup/educator/",
      ctaLabel: "Create homeschool account",
      heroImage: "assets/ai-hero-homeschool.svg"
    },
    students: {
      label: "students",
      audience: "independent learners",
      ctaHref: "signup/student/",
      ctaLabel: "Create student account",
      heroImage: "assets/ai-hero-student.svg"
    }
  };

  var persona = personaMap[personaKey];
  var main = document.querySelector("main.main");
  if (!persona || !main || main.querySelector(".page-section")) return;

  if (!main.querySelector(".hero")) {
    var h1 = main.querySelector("h1");
    var firstParagraph = main.querySelector("p");
    if (h1) {
      var title = h1.textContent;
      var lead = firstParagraph ? firstParagraph.textContent : "";

      main.innerHTML =
        "<section class=\"hero\">" +
          "<div>" +
            "<div class=\"hero-pill\">For " + persona.label + "</div>" +
            "<h1>" + title + "</h1>" +
            "<p class=\"hero-lead\">" + lead + "</p>" +
            "<ul class=\"hero-list\">" +
              "<li>Start with clear lessons and goals.</li>" +
              "<li>Track progress and engagement in one place.</li>" +
              "<li>Scale the same workflow across groups.</li>" +
            "</ul>" +
            "<a href=\"" + persona.ctaHref + "\" class=\"btn btn-large hero-cta\">Sign Up</a>" +
          "</div>" +
          "<div class=\"hero-media\">" +
            "<img src=\"" + persona.heroImage + "\" alt=\"" + title + "\" class=\"hero-image\" />" +
          "</div>" +
        "</section>";
    }
  }

  return;
}

function hydrateSharedTopicPage(topicKey) {
  var topicMap = {
    curriculum: {
      label: "Curriculum",
      title: "One teaching sequence for every persona",
      copy: "Use the same lesson flow across admin, teacher, and homeschool contexts."
    },
    standards: {
      label: "Standards",
      title: "Shared standards alignment and reporting",
      copy: "Track measurable outcomes with one standards workflow for all teams."
    },
    accessibility: {
      label: "Accessibility",
      title: "Inclusive practice model for all learners",
      copy: "Apply one accessibility approach across school, classroom, and home settings."
    },
    plus: {
      label: "PLUS Edition",
      title: "Advanced controls with one shared upgrade path",
      copy: "Enable premium tools once and apply them across every persona workflow."
    }
  };

  var topic = topicMap[topicKey];
  var main = document.querySelector("main.main");
  if (!topic || !main) return;

  main.innerHTML =
    "<section class=\"shared-topic-hero\">" +
      "<p class=\"section-label\">" + topic.label + "</p>" +
      "<h1>" + topic.title + "</h1>" +
      "<p class=\"shared-topic-lead\">" + topic.copy + "</p>" +
    "</section>";
}

function renderSections(main, config) {
  var featureCards = config.pillars
    .map(function (card) {
      return "<article class=\"feature-card\"><h3>" + card.title + "</h3><p>" + card.body + "</p></article>";
    })
    .join("");

  var setupItems = config.setup.map(function (item) { return "<li>" + item + "</li>"; }).join("");
  var outcomeItems = config.outcomes.map(function (item) { return "<li>" + item + "</li>"; }).join("");

  main.insertAdjacentHTML(
    "beforeend",
    "<section class=\"page-section\">" +
      "<p class=\"section-label\">" + config.sectionLabel + "</p>" +
      "<h2>" + config.sectionTitle + "</h2>" +
      "<p class=\"section-copy\">" + config.sectionCopy + "</p>" +
      "<div class=\"feature-grid\">" + featureCards + "</div>" +
    "</section>" +
    "<section class=\"page-section split-panel\">" +
      "<article class=\"panel\"><h3>How to set it up</h3><ul>" + setupItems + "</ul></article>" +
      "<article class=\"panel\"><h3>What success looks like</h3><ul>" + outcomeItems + "</ul></article>" +
    "</section>" +
    "<section class=\"cta-banner\">" +
      "<h2>Ready to put this page into action?</h2>" +
      "<p>Use the same navigation and structure throughout your site.</p>" +
      "<a href=\"" + config.ctaHref + "\" class=\"btn\">" + config.ctaLabel + "</a>" +
    "</section>"
  );
}
