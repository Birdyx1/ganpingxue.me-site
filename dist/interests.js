(() => {
  const sections = [...document.querySelectorAll(".interests-page .collection-section")];
  const links = [...document.querySelectorAll("[data-interest-nav]")];
  const cards = [...document.querySelectorAll(".interests-page .collection-item")];
  const randomButton = document.querySelector("[data-interest-random]");
  const feedback = document.querySelector("[data-interest-feedback]");
  if (!sections.length) return;

  function markCurrent(section) {
    const id = section?.getAttribute("aria-labelledby");
    links.forEach((link) => {
      const current = !!id && link.hash === `#${id}`;
      link.classList.toggle("is-active", current);
      if (current) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  let scrollPending = false;
  function updateCurrent() {
    scrollPending = false;
    const readingLine = window.innerHeight * .38;
    let current = null;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= readingLine) current = section;
    }
    markCurrent(current);
  }

  window.addEventListener("scroll", () => {
    if (scrollPending) return;
    scrollPending = true;
    window.requestAnimationFrame(updateCurrent);
  }, { passive: true });
  window.addEventListener("resize", updateCurrent);
  links.forEach((link) => link.addEventListener("click", () => {
    markCurrent(sections.find((section) => section.getAttribute("aria-labelledby") === link.hash.slice(1)));
  }));
  updateCurrent();

  let lastPick = -1;
  randomButton?.addEventListener("click", () => {
    if (!cards.length) return;
    const offset = cards.length > 1 ? 1 + Math.floor(Math.random() * (cards.length - 1)) : 0;
    const index = (lastPick + offset + cards.length) % cards.length;
    lastPick = index;
    const card = cards[index];
    cards.forEach((item) => item.classList.toggle("is-picked", item === card));
    const title = card.querySelector("h3");
    const visibleTitle = title?.querySelector(":not([hidden])")?.textContent || title?.textContent || "";
    const english = document.documentElement.lang.startsWith("en");
    if (feedback) feedback.textContent = english ? `Picked: ${visibleTitle}` : `翻到了：${visibleTitle}`;
    card.setAttribute("tabindex", "-1");
    card.focus({ preventScroll: true });
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    card.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    markCurrent(card.closest(".collection-section"));
  });
})();
