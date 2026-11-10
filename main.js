(() => {
  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("nav");
  const navLinks = [...document.querySelectorAll(".nav__list a[href^='#']")];

  const navSections = navLinks.map((link) => ({
    link,
    section: document.getElementById(link.hash.slice(1)),
  })).filter(({ section }) => section);

  let returningToTop = false;
  let topScrollTimer;

  const updateCurrentNav = () => {
    if (returningToTop) return;
    const headerBottom = document.querySelector(".header")?.getBoundingClientRect().bottom || 0;
    const sectionLine = headerBottom + 13;
    const current = navSections.find(({ section }) => {
      const bounds = section.getBoundingClientRect();
      return bounds.top <= sectionLine && bounds.bottom > sectionLine;
    });

    navLinks.forEach((link) => {
      if (link === current?.link) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  let navUpdatePending = false;
  const scheduleNavUpdate = () => {
    if (navUpdatePending) return;
    navUpdatePending = true;
    window.requestAnimationFrame(() => {
      navUpdatePending = false;
      updateCurrentNav();
    });
  };

  const finishTopScroll = () => {
    if (!returningToTop) return;
    clearTimeout(topScrollTimer);
    returningToTop = false;
    scheduleNavUpdate();
  };

  document.querySelector(".page-top")?.addEventListener("click", () => {
    returningToTop = true;
    navLinks.forEach((link) => link.removeAttribute("aria-current"));
    clearTimeout(topScrollTimer);
    topScrollTimer = setTimeout(finishTopScroll, 180);
  });

  window.addEventListener("scroll", () => {
    if (returningToTop) {
      clearTimeout(topScrollTimer);
      topScrollTimer = setTimeout(finishTopScroll, 180);
      return;
    }
    scheduleNavUpdate();
  }, { passive: true });
  window.addEventListener("scrollend", finishTopScroll);
  window.addEventListener("resize", scheduleNavUpdate);
  window.addEventListener("load", scheduleNavUpdate);
  window.addEventListener("pageshow", scheduleNavUpdate);
  updateCurrentNav();

  if (hamburger && nav) {
    let transitionTimer;

    const setOpen = (open, animate = false) => {
      clearTimeout(transitionTimer);

      if (animate) {
        nav.classList.add("is-transitioning");
        void nav.offsetHeight;
      } else {
        nav.classList.remove("is-transitioning");
      }

      hamburger.classList.toggle("is-open", open);
      nav.classList.toggle("is-open", open);
      hamburger.setAttribute("aria-expanded", String(open));
      hamburger.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");

      if (animate) {
        transitionTimer = setTimeout(() => {
          nav.classList.remove("is-transitioning");
        }, 300);
      }
    };

    hamburger.addEventListener("click", () => {
      setOpen(!nav.classList.contains("is-open"), true);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false, true));
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false, true);
        hamburger.focus();
      }
    });

    const desktopView = window.matchMedia("(min-width: 769px)");
    const closeOnDesktop = (event) => {
      if (event.matches) setOpen(false);
    };

    if (desktopView.addEventListener) {
      desktopView.addEventListener("change", closeOnDesktop);
    } else {
      desktopView.addListener(closeOnDesktop);
    }
  }

  const form = document.querySelector(".form");
  const priceCards = [...document.querySelectorAll(".price-card[role='radio']")];
  const pricePlanStatus = document.querySelector(".price-plan-status strong");
  const selectedPlanInput = form?.querySelector("input[name='plan']");

  if (priceCards.length) {
    const defaultCard = priceCards.find((card) => card.getAttribute("aria-checked") === "true") || priceCards[0];

    const selectPriceCard = (selectedCard, focus = false) => {
      priceCards.forEach((card) => {
        const isSelected = card === selectedCard;
        const selectLabel = card.querySelector(".price-card__select");

        card.classList.toggle("is-selected", isSelected);
        card.setAttribute("aria-checked", String(isSelected));
        card.tabIndex = isSelected ? 0 : -1;

        if (selectLabel) {
          selectLabel.textContent = isSelected ? "選択中" : "このプランを選ぶ";
        }
      });

      const planName = selectedCard.dataset.plan || "";
      if (pricePlanStatus) pricePlanStatus.textContent = planName;
      if (selectedPlanInput) selectedPlanInput.value = planName;
      if (focus) selectedCard.focus();
    };

    priceCards.forEach((card, index) => {
      card.addEventListener("click", () => selectPriceCard(card, true));

      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectPriceCard(card, true);
          return;
        }

        const previousKeys = ["ArrowLeft", "ArrowUp"];
        const nextKeys = ["ArrowRight", "ArrowDown"];
        let targetIndex = index;

        if (previousKeys.includes(event.key)) {
          targetIndex = (index - 1 + priceCards.length) % priceCards.length;
        } else if (nextKeys.includes(event.key)) {
          targetIndex = (index + 1) % priceCards.length;
        } else if (event.key === "Home") {
          targetIndex = 0;
        } else if (event.key === "End") {
          targetIndex = priceCards.length - 1;
        } else {
          return;
        }

        event.preventDefault();
        selectPriceCard(priceCards[targetIndex], true);
      });
    });

    selectPriceCard(defaultCard);

    form?.addEventListener("reset", () => {
      window.setTimeout(() => selectPriceCard(defaultCard), 0);
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("これは架空サイトのデモです。実際の予約は行われません。");
      form.reset();
    });
  }
  const hero = document.querySelector(".hero");
  const pageTop = document.querySelector(".page-top");

  if (hero && pageTop) {
    const togglePageTop = (show) => {
      pageTop.classList.toggle("is-visible", show);
    };

    if ("IntersectionObserver" in window) {
      const heroObserver = new IntersectionObserver(([entry]) => {
        togglePageTop(!entry.isIntersecting);
      });

      heroObserver.observe(hero);
    } else {
      const updatePageTop = () => {
        togglePageTop(window.scrollY >= hero.offsetHeight);
      };

      window.addEventListener("scroll", updatePageTop, { passive: true });
      updatePageTop();
    }
  }
})();
