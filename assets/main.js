document.addEventListener("DOMContentLoaded", function () {
  var basePathname = new URL(document.baseURI).pathname.replace(/\/$/, "");
  var rawPathname = window.location.pathname;
  var pathname = rawPathname.indexOf(basePathname) === 0 ? rawPathname.slice(basePathname.length) : rawPathname;
  if (!pathname) pathname = "/";
  if (pathname.charAt(0) !== "/") pathname = "/" + pathname;

  initMobileNav();
  initPersonaAnchorNav();
  initFeatureTabs();
  initAccessibilitySections();
  initAuthModal(pathname);
  ensureFooterLanguageSelector();
});

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

function initPersonaAnchorNav() {
  var nav = document.querySelector("[data-persona-anchor-nav]");
  if (!nav) return;

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
      var target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // Keep smooth in-page navigation, but do not set active styles on top nav links.
}

function initFeatureTabs() {
  var roots = document.querySelectorAll("[data-feature-tabs]");
  if (!roots.length) return;

  roots.forEach(function (root) {
    var tabs = root.querySelectorAll("[data-feature-tab]");
    var panels = root.querySelectorAll("[data-feature-panel]");
    if (!tabs.length || !panels.length) return;

    function activate(key) {
      tabs.forEach(function (tab) {
        var active = tab.getAttribute("data-feature-tab") === key;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", active ? "true" : "false");
      });

      panels.forEach(function (panel) {
        var active = panel.getAttribute("data-feature-panel") === key;
        panel.hidden = !active;
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        activate(tab.getAttribute("data-feature-tab"));
      });
    });

    var initial = root.querySelector("[data-feature-tab].is-active");
    activate(initial ? initial.getAttribute("data-feature-tab") : tabs[0].getAttribute("data-feature-tab"));
  });
}

function initAccessibilitySections() {
  var sections = document.querySelectorAll("[data-minimal-accessibility]");
  if (!sections.length) return;

  var markup =
    "<div class=\"accessibility-minimal-copy\">" +
      "<p class=\"accessibility-minimal-eyebrow\">Accessibility</p>" +
      "<h2>Built for Every Learner</h2>" +
      "<p class=\"accessibility-minimal-subtext\">Inclusive design that supports diverse learning needs and assistive technologies.</p>" +
    "</div>" +
    "<div class=\"accessibility-minimal-list-wrap\">" +
      "<ul class=\"accessibility-minimal-list\">" +
        "<li>Screen reader compatible</li>" +
        "<li>Full keyboard navigation</li>" +
        "<li>High-contrast &amp; zoom support</li>" +
        "<li>WCAG 2.2 AA aligned</li>" +
      "</ul>" +
    "</div>" +
    "<div class=\"accessibility-minimal-actions\">" +
      "<a class=\"btn\" href=\"accessibility/\" aria-label=\"View Accessibility Details\">View Accessibility Details</a>" +
    "</div>";

  sections.forEach(function (section) {
    section.setAttribute("data-section", "accessibility");
    section.innerHTML = markup;
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
