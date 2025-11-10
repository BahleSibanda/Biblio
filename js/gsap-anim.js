// js/gsap-anim.js
// Global GSAP animations — consistent site-wide transitions, hover effects, and ScrollTriggers.

(function () {
  const palette = {
    orange: "#F08E37",
    lightOrange: "#FFE8C5",
    greyGreen: "#74925D",
    darkGreyBrown: "#312021",
    darkAzure: "#143035",
  };

  // --- Navigation + Side Menu Animation ---
  function animateNavAndSide() {
    if (!window.gsap) return;
    const gs = window.gsap;

    const top = document.querySelector(".top-nav");
    const side = document.querySelector(".side-menu");
    const badge = document.querySelector(".notification-badge");

    if (top) {
      gs.from(top, {
        y: -28,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      });
    }

    if (side) {
      gs.from(side, {
        x: -24,
        opacity: 0,
        duration: 0.6,
        delay: 0.1,
        ease: "power2.out",
      });
    }

    if (badge) {
      gs.to(badge, {
        scale: 1.1,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        duration: 1.6,
        delay: 0.5,
      });
    }
  }

  // --- Home Section Animations ---
  function animateHomeSections() {
    if (!window.gsap || !window.ScrollTrigger) return;
    const gs = window.gsap;

    gs.utils.toArray(".content-box").forEach((el, i) => {
      gs.from(el, {
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none none",
        },
        opacity: 0,
        y: 30,
        duration: 0.6,
        delay: i * 0.05,
        ease: "power2.out",
      });
    });

    // Book cards stagger
    gs.utils.toArray(".book-card").forEach((card) => {
      gs.from(card, {
        scrollTrigger: {
          trigger: card,
          start: "top 90%",
          toggleActions: "play none none none",
        },
        opacity: 0,
        y: 25,
        duration: 0.5,
        ease: "back.out(1.4)",
      });
    });

    // CTA hover pulse
    document.querySelectorAll(".cta").forEach((btn) => {
      btn.addEventListener("mouseenter", () => {
        gs.to(btn, {
          scale: 1.04,
          backgroundColor: palette.lightOrange,
          duration: 0.15,
          ease: "power1.out",
        });
      });
      btn.addEventListener("mouseleave", () => {
        gs.to(btn, {
          scale: 1,
          backgroundColor: "",
          duration: 0.15,
          ease: "power1.in",
        });
      });
    });
  }

  // --- Bookclubs Animations ---
  function animateBookclubs() {
    if (!window.gsap || !window.ScrollTrigger) return;
    const gs = window.gsap;

    gs.utils.toArray(".bookclub-card").forEach((card, i) => {
      gs.from(card, {
        scrollTrigger: {
          trigger: card,
          start: "top 95%",
          toggleActions: "play none none none",
        },
        opacity: 0,
        y: 20,
        delay: (i % 6) * 0.04,
        duration: 0.5,
        ease: "power2.out",
      });
    });

    document
      .querySelectorAll(".btn-join, .btn-join:enabled, .btn-join:not([disabled])")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          gs.fromTo(
            btn,
            { scale: 1 },
            { scale: 0.92, duration: 0.08, yoyo: true, repeat: 1, ease: "power1.inOut" }
          );
        });
      });
  }

  // --- Profile Page Animations ---
  function animateProfile() {
    if (!window.gsap || !window.ScrollTrigger) return;
    const gs = window.gsap;

    const header = document.querySelector(".profile-header");
    if (header) {
      gs.from(header, { opacity: 0, y: 20, duration: 0.6, ease: "power2.out" });
    }

    gs.utils.toArray(".bookshelf-grid .book-card").forEach((b, i) => {
      gs.from(b, {
        scrollTrigger: {
          trigger: b,
          start: "top 95%",
          toggleActions: "play none none none",
        },
        opacity: 0,
        y: 15,
        duration: 0.45,
        delay: i * 0.04,
        ease: "power2.out",
      });
    });

    gs.utils.toArray(".profile-tab").forEach((tab, i) => {
      gs.from(tab, {
        opacity: 0,
        y: 10,
        delay: i * 0.05,
        duration: 0.3,
      });
    });
  }

  // --- Page Transitions (Fade between sections) ---
  function animatePageTransitions() {
    if (!window.gsap) return;
    const gs = window.gsap;
    const pages = document.querySelectorAll(".page");
    pages.forEach((p) => {
      p.addEventListener("transitionstart", () => {
        gs.to(p, { opacity: 0, duration: 0.25, ease: "power1.in" });
      });
      p.addEventListener("transitionend", () => {
        gs.fromTo(p, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
      });
    });
  }

  // --- Refresh All (Useful for dynamic content loads) ---
  function refreshAll() {
    if (window.ScrollTrigger) {
      setTimeout(() => window.ScrollTrigger.refresh(true), 300);
    }
  }

  // --- Run on DOM Ready ---
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      animateNavAndSide();
      animateHomeSections();
      animateBookclubs();
      animateProfile();
      animatePageTransitions();
      refreshAll();
    }, 200);
  });

  // --- Expose Global API ---
  window.gsapUI = {
    animateNavAndSide,
    animateHomeSections,
    animateBookclubs,
    animateProfile,
    animatePageTransitions,
    refreshAll,
  };

  // Delay all GSAP page animations until everything is ready
document.addEventListener("DOMContentLoaded", () => {
  // Wait until images and Firebase content are painted
  window.addEventListener("load", () => {
    setTimeout(() => {
      try {
        window.gsapUI.animateNavAndSide?.();
        window.gsapUI.animateHomeSections?.();
        window.gsapUI.animateBookclubs?.();
        window.gsapUI.animateProfile?.();
      } catch (err) {
        console.warn("GSAP animations skipped:", err);
      }
      // Just to be sure all visible elements are shown
      document.querySelectorAll(".content-box, .page, .book-card")
        .forEach(el => {
          el.style.opacity = "1";
          el.style.visibility = "visible";
        });
    }, 600); // extra delay for Firebase load + image paint
  });
});




})();

