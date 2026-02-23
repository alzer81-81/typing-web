document.addEventListener("DOMContentLoaded", function () {
  var basePathname = new URL(document.baseURI).pathname.replace(/\/$/, "");
  var rawPathname = window.location.pathname;
  var pathname = rawPathname.indexOf(basePathname) === 0 ? rawPathname.slice(basePathname.length) : rawPathname;
  if (!pathname) pathname = "/";
  if (pathname.charAt(0) !== "/") pathname = "/" + pathname;

  normalizeGlobalNavigation(pathname);
  initMobileNav();
  setActiveHeaderLink(pathname);
  initAudienceSectionNav();
  initAuthModal(pathname);
  ensureFooterLanguageSelector();
});

function normalizeGlobalNavigation(pathname) {
  var navs = document.querySelectorAll("header .nav-links");
  if (!navs.length) return;

  var baseLinks = [
    { href: "education/", label: "Education" },
    { href: "homeschool/", label: "Homeschool" },
    { href: "individuals/", label: "Individuals" },
    { href: "whats-new/", label: "What's New" }
  ];

  navs.forEach(function (nav) {
    if (nav.getAttribute("data-global-nav") === "true") return;

    var html = baseLinks.map(function (item) {
      return "<a href=\"" + item.href + "\">" + item.label + "</a>";
    }).join("");

    html +=
      "<span class=\"nav-separator\">|</span>" +
      "<a href=\"login/\" data-auth-trigger=\"login\">Log In</a>" +
      "<a href=\"signup/\" data-auth-trigger=\"signup\">Sign Up</a>";

    nav.innerHTML = html;
    nav.setAttribute("data-global-nav", "true");
  });

  var homeCards = document.querySelectorAll(".home-persona-card");
  if (homeCards.length === 4) {
    homeCards[0].setAttribute("href", "education/");
    homeCards[0].querySelector("h2").textContent = "Education";
    homeCards[0].querySelector("p").textContent = "For teachers, schools, and district teams.";
    homeCards[0].querySelector("strong").textContent = "Explore Education";

    homeCards[1].setAttribute("href", "homeschool/");
    homeCards[1].querySelector("h2").textContent = "Homeschool";
    homeCards[1].querySelector("p").textContent = "Flexible at-home keyboarding and family progress tracking.";
    homeCards[1].querySelector("strong").textContent = "Explore Homeschool";

    homeCards[2].setAttribute("href", "individuals/");
    homeCards[2].querySelector("h2").textContent = "Individuals";
    homeCards[2].querySelector("p").textContent = "Self-paced typing practice for independent learners.";
    homeCards[2].querySelector("strong").textContent = "Explore Individuals";

    homeCards[3].setAttribute("href", "whats-new/");
    homeCards[3].querySelector("h2").textContent = "What's New";
    homeCards[3].querySelector("p").textContent = "Recent updates, releases, and product improvements.";
    homeCards[3].querySelector("strong").textContent = "See Updates";
  }

  var homeSelect = document.querySelector(".home-select");
  if (homeSelect) homeSelect.textContent = "Choose your audience to continue";
}

function initMobileNav() {
  var headerNavs = document.querySelectorAll("header .header-inner .nav-links");
  headerNavs.forEach(function (nav, index) {
    var parent = nav.parentElement;
    if (!parent || parent.querySelector(".nav-toggle")) return;

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
}

function setActiveHeaderLink(pathname) {
  var navLinks = document.querySelectorAll("header .nav-links a[href]");
  var bestMatch = null;

  navLinks.forEach(function (link) {
    var href = link.getAttribute("href");
    if (!href || href.indexOf("http") === 0 || href.indexOf("#") === 0) return;
    var linkPathname = new URL(href, document.baseURI).pathname;
    var basePath = new URL(document.baseURI).pathname.replace(/\/$/, "");
    linkPathname = linkPathname.indexOf(basePath) === 0 ? linkPathname.slice(basePath.length) : linkPathname;
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

  if (bestMatch) bestMatch.link.setAttribute("aria-current", "page");
}

function initAudienceSectionNav() {
  var navs = document.querySelectorAll("[data-section-nav]");
  if (!navs.length) return;

  navs.forEach(function (nav) {
    var links = nav.querySelectorAll("a[href^='#']");
    if (!links.length) return;

    var sections = Array.prototype.slice.call(links)
      .map(function (link) {
        return document.getElementById((link.getAttribute("href") || "").slice(1));
      })
      .filter(Boolean);

    if (!sections.length) return;

    links.forEach(function (link) {
      link.addEventListener("click", function (event) {
        var id = (link.getAttribute("href") || "").slice(1);
        var target = id ? document.getElementById(id) : null;
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    function setActive(id) {
      links.forEach(function (link) {
        var isActive = link.getAttribute("href") === "#" + id;
        link.classList.toggle("is-active", isActive);
        if (isActive) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    }

    function onScroll() {
      var selected = sections[0].id;
      var scrollPos = window.scrollY + 200;
      sections.forEach(function (section) {
        if (section.offsetTop <= scrollPos) selected = section.id;
      });
      setActive(selected);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  });
}

function initAuthModal(pathname) {
  var modal = document.getElementById("auth-modal");
  if (!modal) {
    modal = createAuthModal();
    document.body.appendChild(modal);
  }

  document.querySelectorAll("header .nav-links a[href]").forEach(function (link) {
    var linkPathname = new URL(link.getAttribute("href"), document.baseURI).pathname;
    var basePath = new URL(document.baseURI).pathname.replace(/\/$/, "");
    linkPathname = linkPathname.indexOf(basePath) === 0 ? linkPathname.slice(basePath.length) : linkPathname;
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

  var titleEl = modal.querySelector(".modal-title");
  var descriptionEl = modal.querySelector(".modal-description");
  var actionsEl = modal.querySelector(".modal-actions");

  var targets = {
    login: {
      educator: "login/educator/",
      individual: "login/student/",
      title: "Log In",
      description: "Choose whether you're logging in as an educator or an individual."
    },
    signup: {
      educator: "signup/educator/",
      individual: "signup/student/",
      title: "Sign Up",
      description: "Choose whether you're signing up as an educator or an individual."
    }
  };

  function openModal(mode) {
    var cfg = mode === "signup" ? targets.signup : targets.login;
    if (titleEl) titleEl.textContent = cfg.title;
    if (descriptionEl) descriptionEl.textContent = cfg.description;
    if (actionsEl) {
      actionsEl.classList.remove("single-option");
      actionsEl.classList.remove("modal-actions-role-grid");
      actionsEl.innerHTML =
        "<a href=\"" + cfg.educator + "\" class=\"btn\">Educator</a>" +
        "<a href=\"" + cfg.individual + "\" class=\"btn btn-secondary\">Individual</a>";
    }

    modal.classList.add("is-visible");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    modal.classList.remove("is-visible");
    modal.setAttribute("aria-hidden", "true");
  }

  document.querySelectorAll("[data-auth-trigger]").forEach(function (el) {
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
}

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
        "<p class=\"modal-description\">Choose whether you're logging in as an educator or an individual.</p>" +
        "<div class=\"modal-actions\">" +
          "<a href=\"login/educator/\" class=\"btn\">Educator</a>" +
          "<a href=\"login/student/\" class=\"btn btn-secondary\">Individual</a>" +
        "</div>" +
      "</div>" +
    "</div>";
  return wrapper;
}

function ensureFooterLanguageSelector() {
  var footerInners = document.querySelectorAll("footer .footer-inner");
  if (!footerInners.length) return;

  footerInners.forEach(function (footerInner, index) {
    if (footerInner.querySelector(".footer-language")) return;

    var wrapper = document.createElement("div");
    wrapper.className = "footer-language";

    var id = "footer-language-select-" + index;
    var label = document.createElement("label");
    label.className = "footer-language-label";
    label.setAttribute("for", id);
    label.textContent = "Language";

    var select = document.createElement("select");
    select.id = id;
    select.className = "footer-language-select";
    select.setAttribute("aria-label", "Language selector");
    select.innerHTML =
      "<option value=\"en\" selected>English</option>" +
      "<option value=\"es\">Spanish</option>" +
      "<option value=\"fr\">French</option>" +
      "<option value=\"de\">German</option>";

    wrapper.appendChild(label);
    wrapper.appendChild(select);
    footerInner.appendChild(wrapper);
  });
}
