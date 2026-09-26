(() => {
  const languageKey = "ganping-xue-language";
  let language = localStorage.getItem(languageKey) || "zh";

  try {
    const introSeenKey = "ganping-xue-home-intro-seen";
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && !localStorage.getItem(introSeenKey)) {
      document.body.classList.add("first-visit");
      localStorage.setItem(introSeenKey, "true");
    }
  } catch (_) {
    // The page remains fully usable when browser storage is unavailable.
  }

  function setLanguage(next) {
    language = next;
    document.documentElement.lang = next === "zh" ? "zh-CN" : "en";
    document.querySelectorAll("[data-zh]").forEach((node) => { node.hidden = next !== "zh"; });
    document.querySelectorAll("[data-en]").forEach((node) => { node.hidden = next !== "en"; });
    document.querySelectorAll("img[data-alt-zh], img[data-alt-en]").forEach((img) => {
      img.alt = next === "zh" ? img.dataset.altZh : img.dataset.altEn;
    });
    document.querySelectorAll("[data-selected-city][data-zh-text]").forEach((node) => {
      node.textContent = next === "zh" ? node.dataset.zhText : node.dataset.enText;
    });
    document.querySelectorAll("[data-story-note-field][data-zh-text]").forEach((node) => {
      node.textContent = next === "zh" ? node.dataset.zhText : node.dataset.enText;
    });
    document.querySelectorAll("[data-language-toggle]").forEach((button) => {
      button.textContent = next === "zh" ? "EN" : "中文";
      button.setAttribute("aria-label", next === "zh" ? "切换到英文" : "Switch to Chinese");
    });
    document.querySelectorAll("[data-aria-zh][data-aria-en]").forEach((node) => {
      node.setAttribute("aria-label", next === "zh" ? node.dataset.ariaZh : node.dataset.ariaEn);
    });
    updatePhotoAccessibility();
    window.requestAnimationFrame(() => {
      const nav = document.querySelector(".main-nav");
      const active = nav?.querySelector('[aria-current="page"]');
      if (active && window.innerWidth <= 600 && nav.scrollWidth > nav.clientWidth) {
        nav.scrollLeft = active.offsetLeft - nav.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2;
      }
    });
    localStorage.setItem(languageKey, next);
  }

  document.querySelectorAll("[data-language-toggle]").forEach((button) => {
    button.addEventListener("click", () => setLanguage(language === "zh" ? "en" : "zh"));
  });

  function addBilingualText(parent, values, tag = "span", className = "") {
    const zh = document.createElement(tag);
    zh.dataset.zh = "";
    zh.textContent = values.zh;
    const en = document.createElement(tag);
    en.dataset.en = "";
    en.hidden = true;
    en.textContent = values.en;
    if (className) { zh.className = className; en.className = className; }
    parent.append(zh, en);
  }

  function renderHomeContent() {
    const content = window.homeContent;
    if (!content) return;
    const projectList = document.querySelector("[data-project-list]");
    if (projectList && Array.isArray(content.projects)) {
      content.projects.forEach((project, index) => {
        const card = document.createElement("article");
        card.className = `project-card reveal project-card-${index % 3}`;
        card.style.setProperty("--tilt", `${index % 2 ? -2 : 2}deg`);
        const cover = document.createElement("div");
        cover.className = "project-card-cover";
        if (project.cover) {
          const img = document.createElement("img");
          img.src = project.cover;
          img.alt = project.coverAlt || "";
          img.loading = "lazy";
          img.decoding = "async";
          cover.dataset.photoZoom = "";
          cover.dataset.photoNote = project.title?.zh || project.label || "";
          cover.append(img);
        } else {
          const mark = document.createElement("span");
          mark.textContent = project.label || "WORK";
          cover.append(mark);
        }
        const copy = document.createElement("div");
        copy.className = "project-card-copy";
        const label = document.createElement("p");
        label.className = "eyebrow";
        label.textContent = project.label || "PROJECT";
        const title = document.createElement("h3");
        addBilingualText(title, project.title, "span");
        const description = document.createElement("p");
        description.className = "project-card-description";
        addBilingualText(description, project.description, "span");
        const link = document.createElement("a");
        link.className = "text-link";
        link.href = project.href || "career.html";
        addBilingualText(link, { zh: "查看作品详情", en: "View project details" });
        const arrow = document.createElement("span");
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "↗";
        link.append(arrow);
        copy.append(label, title, description, link);
        card.append(cover, copy);
        projectList.append(card);
      });
    }

    const memoryLists = document.querySelectorAll("[data-memory-list]");
    if (memoryLists.length && Array.isArray(content.memories)) {
      const allPhotoMemories = content.memories.filter((memory) => (memory.images || (memory.image ? [{ src: memory.image, alt: memory.imageAlt }] : [])).length);
      const pendingNote = document.querySelector("[data-memory-pending]");
      if (pendingNote) pendingNote.hidden = !content.memories.some((memory) => (memory.images || (memory.image ? [memory.image] : [])).length === 0);
      memoryLists.forEach((memoryList) => {
        const memories = memoryList.dataset.memoryMode === "all" ? allPhotoMemories : allPhotoMemories.filter((memory) => memory.featured);
        memories.forEach((memory, index) => {
        const card = document.createElement("article");
        card.className = `memory-card reveal memory-card-${index % 3}`;
        card.dataset.memoryCity = memory.city.zh;
        card.style.setProperty("--tilt", `${[-1.2, 1.1, -.7][index % 3]}deg`);
        const header = document.createElement("div");
        header.className = "memory-date-row";
        const date = document.createElement("span");
        date.className = "memory-date";
        if (memory.date === "日期待补") addBilingualText(date, { zh: "日期待补", en: "DATE TO COME" });
        else if (memory.date === "地点待补") addBilingualText(date, { zh: "地点待补", en: "PLACE TO COME" });
        else date.textContent = memory.date;
        const city = document.createElement("span");
        city.className = "memory-city";
        addBilingualText(city, memory.city);
        header.append(date, city);
        const photos = memory.images || (memory.image ? [{ src: memory.image, alt: memory.imageAlt }] : []);
        const photoGroup = document.createElement("div");
        photoGroup.className = `memory-photos${photos.length > 1 ? " has-multiple" : ""}`;
        photos.forEach((item, photoIndex) => {
          const photo = document.createElement("figure");
          photo.className = `memory-photo${photos.length > 1 ? ` memory-photo-count-${Math.min(photos.length, 3)}` : ""}`;
          photo.style.setProperty("--tilt", `${[-1.4, 1.2, -.8][photoIndex % 3]}deg`);
          const tape = document.createElement("span");
          tape.className = "paper-tape";
          tape.setAttribute("aria-hidden", "true");
          const img = document.createElement("img");
          img.src = item.src;
          img.loading = "lazy";
          img.decoding = "async";
          img.alt = item.alt?.[language] || item.alt?.zh || `${memory.city.zh} · ${memory.date}`;
          img.dataset.altZh = item.alt?.zh || img.alt;
          img.dataset.altEn = item.alt?.en || img.alt;
          const figcaption = document.createElement("figcaption");
          if (photos.length > 1) addBilingualText(figcaption, {
            zh: `${memory.city.zh} · ${photoIndex + 1}`,
            en: `${memory.city.en} · ${photoIndex + 1}`
          });
          else figcaption.textContent = memory.label || memory.date;
          photo.dataset.photoZoom = "";
          photo.dataset.photoNote = `${memory.city.zh} · ${memory.date}`;
          photo.dataset.photoNoteZh = `${memory.city.zh} · ${memory.date}`;
          photo.dataset.photoNoteEn = `${memory.city.en} · ${memory.date}`;
          photo.dataset.photoCity = memory.city.zh;
          photo.dataset.photoStoryZh = memory.note.zh;
          photo.dataset.photoStoryEn = memory.note.en;
          photoGroup.append(photo);
          photo.append(tape, img, figcaption);
        });
        const copy = document.createElement("div");
        copy.className = "memory-copy";
        const title = document.createElement("h3");
        addBilingualText(title, memory.title, "span");
        const note = document.createElement("p");
        addBilingualText(note, memory.note, "span");
        const link = document.createElement("a");
        const datedEntry = /^\d{4}\.\d{2}$/.test(memory.date)
          ? `#entry-${memory.city.en.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${memory.date.replace(".", "-")}`
          : null;
        link.href = datedEntry ? `life.html${datedEntry}` : "life.html#globe-title";
        link.className = "memory-detail";
        addBilingualText(link, datedEntry ? { zh: "在月记里继续看", en: "Continue in the journal" } : { zh: "回到旅行地图", en: "Back to the travel map" });
        link.setAttribute("aria-label", `${memory.city.zh} · ${memory.date}`);
        link.append(document.createTextNode(" ↗"));
        copy.append(title, note, link);
        card.append(header, photoGroup, copy);
        memoryList.append(card);
      });
      });
    }

    const storyList = document.querySelector("[data-month-story-list]");
    if (storyList && Array.isArray(content.memories)) {
      const datedMemories = content.memories
        .filter((memory) => /^\d{4}\.\d{2}$/.test(memory.date) && (memory.images || (memory.image ? [{ src: memory.image, alt: memory.imageAlt }] : [])).length)
        .sort((a, b) => a.date.localeCompare(b.date) || a.city.zh.localeCompare(b.city.zh, "zh-CN"));
      const monthGroups = new Map();
      datedMemories.forEach((memory) => {
        if (!monthGroups.has(memory.date)) monthGroups.set(memory.date, []);
        monthGroups.get(memory.date).push(memory);
      });

      const noteVariants = ["pinned", "taped", "postcard", "grid", "ripped", "taped", "postcard"];
      [...monthGroups.entries()].forEach(([month, memories], monthIndex) => {
        const [year, monthNumber] = month.split(".");
        const photoCount = memories.reduce((total, memory) => total + (memory.images || (memory.image ? [{ src: memory.image }] : [])).length, 0);
        const card = document.createElement("article");
        const density = memories.length > 1 ? "multiple" : photoCount === 1 ? "single" : photoCount >= 3 ? "gallery" : "compact";
        card.className = `story-month story-month--${density} reveal`;
        if (month === "2025.12" || month === "2026.08") card.classList.add("story-month--multi-spread");
        card.dataset.monthCard = "";
        card.dataset.monthKey = month;
        card.dataset.noteVariant = noteVariants[monthIndex % noteVariants.length];
        card.dataset.storyPlaceZh = memories.map((memory) => memory.city.zh).join(" · ");
        card.dataset.storyPlaceEn = memories.map((memory) => memory.city.en).join(" · ");
        card.dataset.storyTitleZh = memories.map((memory) => memory.title.zh).join(" / ");
        card.dataset.storyTitleEn = memories.map((memory) => memory.title.en).join(" / ");
        card.dataset.storyCopyZh = memories.map((memory) => memory.note.zh).join(" ");
        card.dataset.storyCopyEn = memories.map((memory) => memory.note.en).join(" ");
        if (month === "2025.12" && memories.length > 2) {
          card.dataset.storyTitleZh = "海边的十二月";
          card.dataset.storyTitleEn = "December by the sea";
          card.dataset.storyCopyZh = "三亚的朋友、陵水的合照与秋千、万宁的椰树和海上日落。";
          card.dataset.storyCopyEn = "Friends in Sanya, group photos and swings in Lingshui, palms and sunset in Wanning.";
        }
        if (month === "2026.08" && memories.length > 1) {
          card.dataset.storyTitleZh = "大理与芒市的八月";
          card.dataset.storyTitleEn = "August in Dali and Mangshi";
          card.dataset.storyCopyZh = "大理的湖面与云，芒市的白塔、夜景和同行合照。";
          card.dataset.storyCopyEn = "Dali's lake and clouds, Mangshi's pagodas at night, and a photo together.";
        }
        card.style.setProperty("--story-enter-delay", `${Math.min(monthIndex * 45, 270)}ms`);
        card.setAttribute("aria-label", `${year}.${monthNumber}`);

        const monthHeader = document.createElement("header");
        monthHeader.className = "story-month-header";
        const date = document.createElement("p");
        date.className = "story-month-date";
        const yearLabel = document.createElement("span");
        yearLabel.textContent = year;
        const monthLabel = document.createElement("b");
        monthLabel.textContent = monthNumber;
        const doodle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        doodle.classList.add("month-doodle");
        doodle.setAttribute("viewBox", "0 0 76 24");
        doodle.setAttribute("aria-hidden", "true");
        const doodlePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        doodlePath.setAttribute("d", "M3 16 C15 8 23 20 36 13 S57 7 72 13");
        doodle.append(doodlePath);
        date.append(yearLabel, monthLabel, doodle);
        const index = document.createElement("span");
        index.className = "story-month-index";
        index.textContent = `${String(monthIndex + 1).padStart(2, "0")} / ${String(monthGroups.size).padStart(2, "0")}`;
        monthHeader.append(date, index);

        const entries = document.createElement("div");
        entries.className = `story-month-entries${memories.length > 1 ? " has-multiple-stories" : ""}`;
        memories.forEach((memory, memoryIndex) => {
          const story = document.createElement("article");
          story.className = "story-memory";
          story.id = `entry-${memory.city.en.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${year}-${monthNumber}`;
          story.dataset.storyCity = memory.city.zh;
          story.dataset.memoryCity = memory.city.zh;
          story.dataset.storySide = (monthIndex + memoryIndex) % 2 ? "right" : "left";

          const copy = document.createElement("div");
          copy.className = "story-memory-copy";
          const city = document.createElement("p");
          city.className = "eyebrow story-city-label";
          addBilingualText(city, memory.city);
          const title = document.createElement("h3");
          addBilingualText(title, memory.title, "span");
          const note = document.createElement("p");
          note.className = "story-memory-note";
          addBilingualText(note, memory.note, "span");
          copy.append(city, title, note);

          const photos = memory.images || (memory.image ? [{ src: memory.image, alt: memory.imageAlt }] : []);
          if ((memories.length === 1 || card.classList.contains("story-month--multi-spread")) && photos.length > 1) story.classList.add("story-memory--spread");
          const photoCity = document.createElement("p");
          photoCity.className = "story-photo-city";
          addBilingualText(photoCity, memory.city);
          const dateStamp = document.createElement("small");
          dateStamp.textContent = memory.date;
          photoCity.append(dateStamp);
          const photoGroup = document.createElement("div");
          photoGroup.className = `story-photos${photos.length > 1 ? " has-multiple" : ""}`;
          photos.forEach((item, photoIndex) => {
            const photo = document.createElement("figure");
            photo.className = `story-photo${photos.length > 1 ? ` story-photo-count-${Math.min(photos.length, 3)}` : ""}`;
            photo.dataset.photoZoom = "";
            photo.dataset.photoCity = memory.city.zh;
            photo.dataset.photoNote = `${memory.city.zh} · ${memory.date}`;
            photo.dataset.photoNoteZh = `${memory.city.zh} · ${memory.date}`;
            photo.dataset.photoNoteEn = `${memory.city.en} · ${memory.date}`;
            photo.dataset.photoStoryZh = memory.note.zh;
            photo.dataset.photoStoryEn = memory.note.en;
            photo.style.setProperty("--tilt", `${[-.8, .6, -.3][(memoryIndex + photoIndex) % 3]}deg`);
            const tape = document.createElement("span");
            tape.className = "paper-tape";
            tape.setAttribute("aria-hidden", "true");
            const doodle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            doodle.classList.add("story-photo-doodle");
            doodle.setAttribute("viewBox", "0 0 60 48");
            doodle.setAttribute("aria-hidden", "true");
            const doodleLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
            doodleLine.setAttribute("d", [
              "M9 35C2 22 13 8 30 8c16 0 23 12 18 24-5 12-25 13-34 2m0 0-5-8m5 8-8 3",
              "M5 39C16 19 31 13 53 16m0 0-10-7m10 7-9 8",
              "M25 5l3 13 10-8-5 12 13 2-13 5 6 11-12-7-8 10 2-14-13-4 14-2z"
            ][(monthIndex + memoryIndex + photoIndex) % 3]);
            doodle.append(doodleLine);
            const image = document.createElement("img");
            image.src = item.src;
            if (item.width && item.height) {
              const naturalRatio = item.width / item.height;
              photo.style.setProperty("--story-photo-width", `${Math.round(Math.min(520, Math.max(240, naturalRatio * 420)))}px`);
              image.width = item.width;
              image.height = item.height;
            }
            image.loading = "lazy";
            image.decoding = "async";
            image.alt = item.alt?.[language] || item.alt?.zh || `${memory.city.zh} · ${memory.date}`;
            image.dataset.altZh = item.alt?.zh || image.alt;
            image.dataset.altEn = item.alt?.en || image.alt;
            const caption = document.createElement("figcaption");
            if (photos.length > 1) addBilingualText(caption, {
              zh: `${memory.city.zh} · ${photoIndex + 1}`,
              en: `${memory.city.en} · ${photoIndex + 1}`
            });
            else caption.textContent = `${memory.date} · ${memory.city.en.toUpperCase()}`;
            photo.append(tape, image, caption, doodle);
            photoGroup.append(photo);
          });
          story.append(copy, photoCity, photoGroup);
          entries.append(story);
        });
        if (card.classList.contains("story-month--multi-spread")) {
          const cityIndex = document.createElement("nav");
          cityIndex.className = "story-month-city-index";
          cityIndex.dataset.ariaZh = `${year} 年 ${Number(monthNumber)} 月的地点`;
          cityIndex.dataset.ariaEn = `Places from ${year}.${monthNumber}`;
          cityIndex.setAttribute("aria-label", language === "zh" ? cityIndex.dataset.ariaZh : cityIndex.dataset.ariaEn);
          memories.forEach((memory) => {
            const link = document.createElement("a");
            const citySlug = memory.city.en.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            link.href = `#entry-${citySlug}-${year}-${monthNumber}`;
            addBilingualText(link, memory.city);
            const count = document.createElement("small");
            count.textContent = String(memory.images?.length || 1).padStart(2, "0");
            link.append(count);
            cityIndex.append(link);
          });
          card.append(monthHeader, cityIndex, entries);
        } else {
          card.append(monthHeader, entries);
        }
        storyList.append(card);
      });

    }
  }

  function updatePhotoAccessibility() {
    document.querySelectorAll("[data-photo-zoom]").forEach((photo) => {
      const img = photo.querySelector("img");
      if (!img) return;
      const note = photo.dataset.photoNote || photo.querySelector("figcaption")?.textContent.trim() || "";
      const description = img.alt || note;
      const gallery = photo.closest(".story-photos, .memory-photos");
      const gallerySize = gallery?.querySelectorAll("[data-photo-zoom]").length || 1;
      photo.setAttribute("aria-label", language === "zh"
        ? `查看照片：${description}。${gallerySize > 1 ? `此组共 ${gallerySize} 张，可在大图中切换。` : "按 Enter 或空格打开大图。"}`
        : `View photo: ${description}.${gallerySize > 1 ? ` ${gallerySize} photos in this group; use the viewer to browse.` : " Press Enter or Space to enlarge it."}`);
      photo.tabIndex = 0;
      photo.setAttribute("role", "button");
      if (!photo.dataset.photoKeyboardBound) {
        photo.dataset.photoKeyboardBound = "true";
        photo.addEventListener("keydown", (event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          openPhoto(photo);
        });
      }
    });
  }


  renderHomeContent();
  setLanguage(language);
  if (window.location.hash.startsWith("#entry-") && !new URLSearchParams(window.location.search).has("city")) {
    const entryId = decodeURIComponent(window.location.hash.slice(1));
    window.addEventListener("pageshow", () => {
      document.getElementById(entryId)?.scrollIntoView({ behavior: "instant", block: "start" });
    }, { once: true });
  }

  const storyExperience = document.querySelector("[data-month-story-experience]");
  const storyNote = document.querySelector("[data-story-sticky-note]");
  const monthCards = [...document.querySelectorAll("[data-month-card]")];
  if (storyExperience && storyNote && monthCards.length) {
    const noteIndex = storyNote.querySelector("[data-story-note-index]");
    const noteDate = storyNote.querySelector("[data-story-note-date]");
    const notePlace = storyNote.querySelector("[data-story-note-place]");
    const noteTitle = storyNote.querySelector("[data-story-note-title]");
    const noteCopy = storyNote.querySelector("[data-story-note-copy]");
    const noteFirework = storyNote.querySelector("[data-story-note-firework]");
    const notePin = storyNote.querySelector(".story-note-pin");
    const noteScribble = storyNote.querySelector(".story-note-scribble path");
    let activeMonth = -1;
    let storyFrame = 0;
    let fireworkAnimation;
    let pinAnimation;
    let scribbleAnimation;
    let paperAnimation;

    function updateStoryNote(index) {
      if (index === activeMonth) return;
      const firstRender = activeMonth === -1;
      activeMonth = index;
      const card = monthCards[index];
      storyNote.dataset.noteVariant = card.dataset.noteVariant || "pinned";
      monthCards.forEach((monthCard, monthIndex) => {
        monthCard.classList.toggle("is-active", monthIndex === index);
      });
      noteIndex.textContent = `${String(index + 1).padStart(2, "0")} / ${String(monthCards.length).padStart(2, "0")}`;
      noteDate.textContent = card.dataset.monthKey;
      [
        [notePlace, "storyPlace"],
        [noteTitle, "storyTitle"],
        [noteCopy, "storyCopy"]
      ].forEach(([field, key]) => {
        field.dataset.zhText = card.dataset[`${key}Zh`];
        field.dataset.enText = card.dataset[`${key}En`];
        field.textContent = language === "zh" ? field.dataset.zhText : field.dataset.enText;
        if (!firstRender) {
          const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          field.animate(reduceMotion
            ? [{ opacity: .7 }, { opacity: 1 }]
            : [{ opacity: .48, transform: "translateY(5px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration: reduceMotion ? 150 : 340, easing: "cubic-bezier(.2,.7,.2,1)" });
        }
      });
      if (!firstRender && noteFirework && notePin && noteScribble && window.innerWidth > 1000 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        fireworkAnimation?.cancel();
        fireworkAnimation = noteFirework.animate([
          { opacity: 0, transform: "scale(.22) rotate(-16deg)" },
          { opacity: 1, transform: "scale(.96) rotate(0deg)", offset: .35 },
          { opacity: .9, transform: "scale(1.06) rotate(4deg)", offset: .62 },
          { opacity: 0, transform: "scale(1.24) rotate(10deg)" }
        ], { duration: 760, easing: "cubic-bezier(.16,.7,.2,1)" });
        pinAnimation?.cancel();
        pinAnimation = notePin.animate([
          { boxShadow: "0 0 0 0 rgba(223,158,112,0)" },
          { boxShadow: "0 0 0 8px rgba(223,158,112,.23)", offset: .35 },
          { boxShadow: "0 0 0 13px rgba(223,158,112,0)" }
        ], { duration: 700, easing: "ease-out" });
        scribbleAnimation?.cancel();
        scribbleAnimation = noteScribble.animate([
          { strokeDashoffset: 140 },
          { strokeDashoffset: 0 }
        ], { duration: 540, delay: 90, easing: "cubic-bezier(.2,.7,.2,1)" });
        paperAnimation?.cancel();
        paperAnimation = storyNote.animate([
          { opacity: .82 },
          { opacity: 1 }
        ], { duration: 420, easing: "ease-out" });
      }
    }

    function syncStoryMonth() {
      storyFrame = 0;
      const readingLine = window.innerHeight * .52;
      let closestIndex = 0;
      let closestDistance = Infinity;
      monthCards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const distance = readingLine < rect.top ? rect.top - readingLine
          : readingLine > rect.bottom ? readingLine - rect.bottom : 0;
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      updateStoryNote(closestIndex);
    }

    function queueStorySync() {
      if (!storyFrame) storyFrame = window.requestAnimationFrame(syncStoryMonth);
    }
    syncStoryMonth();
    window.addEventListener("scroll", queueStorySync, { passive: true });
    window.addEventListener("resize", queueStorySync);
  }

  const revealNodes = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px 80px 0px" });
    revealNodes.forEach((node) => observer.observe(node));
  } else {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const paperGather = document.querySelector("[data-paper-gather]");
  const gatherPieces = [...(paperGather?.querySelectorAll(".paper-gather-piece") || [])];
  let gatherFrame = 0;
  function updatePaperGather() {
    gatherFrame = 0;
    if (!paperGather || reducedMotion.matches || !gatherPieces.length) return;
    const rect = paperGather.getBoundingClientRect();
    const start = window.innerHeight * .82;
    const end = -rect.height * .35;
    const progress = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
    gatherPieces.forEach((piece) => {
      const x = Number(piece.dataset.startX || 0);
      const y = Number(piece.dataset.startY || 0);
      piece.style.setProperty("--gather-x", `${(x * (1 - progress)).toFixed(1)}px`);
      piece.style.setProperty("--gather-y", `${(y * (1 - progress)).toFixed(1)}px`);
      piece.style.setProperty("--gather-turn", `${(Number(piece.dataset.turn || 0) * (1 - progress)).toFixed(1)}deg`);
      piece.style.setProperty("--gather-opacity", (0.42 * (1 - progress)).toFixed(2));
    });
  }
  function requestPaperGather() {
    if (!gatherFrame) gatherFrame = window.requestAnimationFrame(updatePaperGather);
  }
  window.addEventListener("scroll", requestPaperGather, { passive: true });
  window.addEventListener("resize", requestPaperGather, { passive: true });
  reducedMotion.addEventListener?.("change", requestPaperGather);
  requestPaperGather();

  const photoLightbox = document.querySelector("[data-photo-lightbox]");
  const photoLightboxImage = photoLightbox?.querySelector("[data-photo-lightbox-image]");
  const photoLightboxCaption = photoLightbox?.querySelector("[data-photo-lightbox-caption]");
  const photoLightboxNote = photoLightbox?.querySelector("[data-photo-lightbox-note]");
  const photoLightboxLocation = photoLightbox?.querySelector("[data-photo-lightbox-location]");
  const photoLightboxCount = photoLightbox?.querySelector("[data-photo-lightbox-count]");
  let lightboxPhotos = [];
  let lightboxIndex = 0;
  function showLightboxPhoto(photo) {
    if (!photoLightbox || !photoLightboxImage || !photoLightboxCaption) return;
    const image = photo.querySelector("img");
    if (!image) return;
    photoLightboxImage.src = image.currentSrc || image.src;
    photoLightboxImage.alt = image.alt;
    const note = language === "zh"
      ? (photo.dataset.photoNoteZh || photo.dataset.photoNote)
      : (photo.dataset.photoNoteEn || photo.dataset.photoNote);
    photoLightboxCaption.textContent = note || photo.querySelector("figcaption")?.textContent.trim() || image.alt;
    if (photoLightboxNote) {
      const story = language === "zh" ? photo.dataset.photoStoryZh : photo.dataset.photoStoryEn;
      photoLightboxNote.textContent = story || "";
      photoLightboxNote.hidden = !story;
    }
    if (photoLightboxLocation) {
      const city = photo.dataset.photoCity;
      photoLightboxLocation.hidden = !city;
      if (city) photoLightboxLocation.href = `?city=${encodeURIComponent(city)}#archive-title`;
    }
    if (photoLightboxCount) {
      photoLightboxCount.textContent = lightboxPhotos.length > 1 ? `${lightboxIndex + 1} / ${lightboxPhotos.length}` : "";
      photoLightboxCount.hidden = lightboxPhotos.length < 2;
    }
    photoLightbox?.querySelectorAll("[data-photo-lightbox-prev], [data-photo-lightbox-next]").forEach((button) => {
      button.hidden = lightboxPhotos.length < 2;
    });
  }
  function openPhoto(photo) {
    const gallery = photo.closest(".story-photos, .memory-photos");
    lightboxPhotos = gallery
      ? [...gallery.querySelectorAll("[data-photo-zoom]")].filter((item) => item.querySelector("img"))
      : [photo];
    lightboxIndex = Math.max(0, lightboxPhotos.indexOf(photo));
    showLightboxPhoto(lightboxPhotos[lightboxIndex] || photo);
    photoLightbox?.showModal();
  }
  function stepLightbox(direction) {
    if (lightboxPhotos.length < 2) return;
    lightboxIndex = (lightboxIndex + direction + lightboxPhotos.length) % lightboxPhotos.length;
    showLightboxPhoto(lightboxPhotos[lightboxIndex]);
  }
  document.querySelectorAll("[data-photo-zoom]").forEach((photo) => {
    photo.addEventListener("click", (event) => {
      event.preventDefault();
      openPhoto(photo);
    });
    photo.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openPhoto(photo);
    });
  });
  photoLightbox?.querySelector("[data-photo-lightbox-close]")?.addEventListener("click", () => photoLightbox.close());
  photoLightbox?.querySelector("[data-photo-lightbox-prev]")?.addEventListener("click", () => stepLightbox(-1));
  photoLightbox?.querySelector("[data-photo-lightbox-next]")?.addEventListener("click", () => stepLightbox(1));
  photoLightbox?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") { event.preventDefault(); stepLightbox(-1); }
    if (event.key === "ArrowRight") { event.preventDefault(); stepLightbox(1); }
  });
  photoLightbox?.addEventListener("click", (event) => {
    if (event.target === photoLightbox) photoLightbox.close();
  });

  const mailLink = document.querySelector("[data-mail-link]");
  const contactChecklist = document.querySelector("[data-contact-checklist]");
  contactChecklist?.addEventListener("change", () => {
    const topics = [...contactChecklist.querySelectorAll("input:checked")].map((input) => input.value);
    const subject = topics.length ? `想和你聊聊：${topics.join("、")}` : "来主页打个招呼";
    mailLink.href = `mailto:ganpingxue37@gmail.com?subject=${encodeURIComponent(subject)}`;
  });

  const heatmap = document.querySelector("[data-heatmap-placeholder]");
  if (heatmap) {
    const grid = heatmap.querySelector(".heatmap-grid");
    for (let index = 0; index < 140; index += 1) grid.append(document.createElement("i"));
  }

  const cities = [
    { zh: "成都", en: "Chengdu", lon: 104.07, lat: 30.57 },
    { zh: "北京", en: "Beijing", lon: 116.40, lat: 39.90 },
    { zh: "青岛", en: "Qingdao", lon: 120.38, lat: 36.07 },
    { zh: "西安", en: "Xi’an", lon: 108.94, lat: 34.34 },
    { zh: "广州", en: "Guangzhou", lon: 113.26, lat: 23.13 },
    { zh: "深圳", en: "Shenzhen", lon: 114.06, lat: 22.54 },
    { zh: "万宁", en: "Wanning", lon: 110.39, lat: 18.80 },
    { zh: "陵水", en: "Lingshui", lon: 110.04, lat: 18.51 },
    { zh: "三亚", en: "Sanya", lon: 109.51, lat: 18.25 },
    { zh: "自贡", en: "Zigong", lon: 104.78, lat: 29.34 },
    { zh: "内江", en: "Neijiang", lon: 105.05, lat: 29.58 },
    { zh: "珠海", en: "Zhuhai", lon: 113.57, lat: 22.27 },
    { zh: "芒市", en: "Mangshi", lon: 98.58, lat: 24.43 },
    { zh: "大理", en: "Dali", lon: 100.23, lat: 25.59 },
    { zh: "北海", en: "Beihai", lon: 109.12, lat: 21.48 },
    { zh: "重庆", en: "Chongqing", lon: 106.55, lat: 29.56 },
  ];
  const entriesByCity = new Map();
  document.querySelectorAll("[data-story-city]").forEach((entry) => {
    const city = entry.dataset.storyCity;
    if (!entriesByCity.has(city)) entriesByCity.set(city, []);
    entriesByCity.get(city).push(entry);
  });

  const requestedCity = new URLSearchParams(window.location.search).get("city");
  let selectedCity = cities.some((city) => city.zh === requestedCity) ? requestedCity : "";
  let projectPoint = null;
  let cityScreenPoints = [];

  function selectCity(cityName, shouldScroll = true) {
    selectedCity = cityName;
    document.querySelectorAll("[data-city-select]").forEach((button) => {
      const selected = button.dataset.citySelect === cityName;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    const city = cities.find((item) => item.zh === cityName);
    const note = document.querySelector("[data-selected-city]");
    const matchingEntries = entriesByCity.get(cityName) || [];
    if (note && city) {
      const hasEntry = matchingEntries.length > 0;
      const message = hasEntry
        ? (language === "zh" ? `${city.zh} · 已定位照片或时间线记录` : `${city.en} · photo or journal location selected`)
        : (language === "zh" ? `${city.zh} · 记录待补充` : `${city.en} · memories to be added`);
      note.dataset.zhText = hasEntry ? `${city.zh} · 已定位照片或时间线记录` : `${city.zh} · 记录待补充`;
      note.dataset.enText = hasEntry ? `${city.en} · photo or journal location selected` : `${city.en} · memories to be added`;
      note.textContent = message;
    }
    if (shouldScroll && matchingEntries.length) {
      matchingEntries[matchingEntries.length - 1].scrollIntoView({ behavior: reducedMotion.matches ? "instant" : "smooth", block: "start", inline: "nearest" });
      matchingEntries.forEach((entry) => {
        entry.classList.add("highlight");
        window.setTimeout(() => entry.classList.remove("highlight"), 1800);
      });
    } else if (shouldScroll && city) {
      document.querySelector("#timeline")?.scrollIntoView({ behavior: reducedMotion.matches ? "instant" : "smooth", block: "start" });
    }
  }

  document.querySelectorAll("[data-city-select]").forEach((button) => {
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => selectCity(button.dataset.citySelect));
  });
  if (requestedCity && cities.some((city) => city.zh === requestedCity)) {
    window.requestAnimationFrame(() => {
      selectCity(requestedCity, false);
      document.querySelector("#globe-title")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const canvas = document.querySelector("[data-globe]");
  if (canvas) {
    const context = canvas.getContext("2d");
    const stage = canvas.closest("[data-globe-stage]");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let radius = 0;
    let yaw = 1.96; // Initial view faces China.
    let pitch = 0.48;
    let dragging = false;
    let pointerMoved = false;
    let pointerStart = null;
    let previousPointer = null;
    let activePointerId = null;
    let globeFrame = 0;
    let land = null;
    const globeProjection = window.d3?.geoOrthographic()
      .clipAngle(90)
      .precision(.6);
    const landPath = globeProjection && window.d3.geoPath(globeProjection, context);

    if (globeProjection) {
      fetch("data/ne_110m_land.geojson")
        .then((response) => {
          if (!response.ok) throw new Error(`Map data: ${response.status}`);
          return response.json();
        })
        .then((data) => {
          land = data;
          requestGlobeDraw();
        })
        .catch((error) => console.error("Could not load globe land data", error));
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      radius = Math.min(width * .39, height * .39, 226);
      globeProjection?.translate([width / 2, height / 2]).scale(radius);
      draw();
    }

    projectPoint = (longitude, latitude) => {
      const lat = latitude * Math.PI / 180;
      const lon = longitude * Math.PI / 180 - yaw;
      const x = Math.cos(lat) * Math.sin(lon);
      const z = Math.cos(lat) * Math.cos(lon);
      const y = Math.sin(lat);
      const y2 = y * Math.cos(pitch) - z * Math.sin(pitch);
      const z2 = y * Math.sin(pitch) + z * Math.cos(pitch);
      return { x: width / 2 + radius * x, y: height / 2 - radius * y2, z: z2 };
    };

    function drawGraticule() {
      context.lineWidth = .65;
      context.strokeStyle = "rgba(50, 97, 91, .22)";
      for (let latitude = -60; latitude <= 60; latitude += 30) {
        context.beginPath();
        let drawing = false;
        for (let longitude = -180; longitude <= 180; longitude += 3) {
          const point = projectPoint(longitude, latitude);
          if (point.z > 0) {
            if (!drawing) context.moveTo(point.x, point.y);
            else context.lineTo(point.x, point.y);
            drawing = true;
          } else drawing = false;
        }
        context.stroke();
      }
      for (let longitude = -180; longitude < 180; longitude += 30) {
        context.beginPath();
        let drawing = false;
        for (let latitude = -88; latitude <= 88; latitude += 3) {
          const point = projectPoint(longitude, latitude);
          if (point.z > 0) {
            if (!drawing) context.moveTo(point.x, point.y);
            else context.lineTo(point.x, point.y);
            drawing = true;
          } else drawing = false;
        }
        context.stroke();
      }
    }

    function drawContinents() {
      if (!land || !landPath) return;
      globeProjection.rotate([-yaw * 180 / Math.PI, -pitch * 180 / Math.PI]);
      context.beginPath();
      landPath(land);
      context.fillStyle = "#8fb49a";
      context.fill();
      context.lineWidth = 1.1;
      context.strokeStyle = "rgba(43, 81, 67, .9)";
      context.stroke();
    }

    function drawCities() {
      cityScreenPoints = [];
      cities.forEach((city) => {
        const point = projectPoint(city.lon, city.lat);
        if (point.z <= .02) return;
        cityScreenPoints.push({ ...point, city });
        const selected = city.zh === selectedCity;
        if (selected) {
          context.beginPath();
          context.arc(point.x, point.y, 9, 0, Math.PI * 2);
          context.strokeStyle = "rgba(229, 171, 99, .9)";
          context.lineWidth = 1.5;
          context.stroke();
        }
        context.beginPath();
        context.arc(point.x, point.y, selected ? 3.8 : 2.8, 0, Math.PI * 2);
        context.fillStyle = selected ? "#d79751" : "#f7f2df";
        context.fill();
        context.lineWidth = 1.7;
        context.strokeStyle = "#426c60";
        context.stroke();
      });
    }

    function draw() {
      if (!context || !width || !height) return;
      context.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;
      context.save();
      context.beginPath();
      context.arc(cx, cy, radius + 2, 0, Math.PI * 2);
      context.shadowColor = "rgba(45, 85, 79, .22)";
      context.shadowBlur = 24;
      context.shadowOffsetY = 13;
      context.fillStyle = "#d8e4da";
      context.fill();
      context.shadowColor = "transparent";
      context.clip();
      const ocean = context.createRadialGradient(cx - radius * .34, cy - radius * .4, 6, cx, cy, radius * 1.2);
      ocean.addColorStop(0, "#d9e9df");
      ocean.addColorStop(.57, "#8cb8ae");
      ocean.addColorStop(1, "#4c7b7b");
      context.fillStyle = ocean;
      context.fillRect(cx - radius - 3, cy - radius - 3, radius * 2 + 6, radius * 2 + 6);
      drawGraticule();
      drawContinents();
      drawCities();
      context.restore();
      context.beginPath();
      context.arc(cx, cy, radius, 0, Math.PI * 2);
      context.lineWidth = 1;
      context.strokeStyle = "rgba(47, 91, 83, .5)";
      context.stroke();
      const shade = context.createRadialGradient(cx - radius * .6, cy - radius * .5, radius * .2, cx, cy, radius * 1.2);
      shade.addColorStop(0, "rgba(255,255,255,.15)");
      shade.addColorStop(.7, "rgba(19,50,51,0)");
      shade.addColorStop(1, "rgba(19,50,51,.19)");
      context.fillStyle = shade;
      context.beginPath();
      context.arc(cx, cy, radius, 0, Math.PI * 2);
      context.fill();
    }

    function requestGlobeDraw() {
      if (globeFrame) return;
      globeFrame = window.requestAnimationFrame(() => {
        globeFrame = 0;
        draw();
      });
    }

    function findCityAt(x, y) {
      let closest = null;
      let closestDistance = 15;
      cityScreenPoints.forEach((point) => {
        const distance = Math.hypot(point.x - x, point.y - y);
        if (distance < closestDistance) {
          closest = point.city;
          closestDistance = distance;
        }
      });
      return closest;
    }

    canvas.addEventListener("pointerdown", (event) => {
      dragging = true;
      pointerMoved = false;
      pointerStart = { x: event.clientX, y: event.clientY };
      previousPointer = pointerStart;
      activePointerId = event.pointerId;
      canvas.setPointerCapture(event.pointerId);
      stage.classList.add("dragging");
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!dragging || event.pointerId !== activePointerId) return;
      const dx = event.clientX - previousPointer.x;
      const dy = event.clientY - previousPointer.y;
      if (Math.abs(event.clientX - pointerStart.x) + Math.abs(event.clientY - pointerStart.y) > 4) pointerMoved = true;
      yaw -= dx * .008;
      pitch = Math.max(-1.15, Math.min(1.15, pitch + dy * .006));
      previousPointer = { x: event.clientX, y: event.clientY };
      requestGlobeDraw();
    });
    function finishPointer(event) {
      if (!dragging || event.pointerId !== activePointerId) return;
      dragging = false;
      stage.classList.remove("dragging");
      if (!pointerMoved) {
        const rect = canvas.getBoundingClientRect();
        const city = findCityAt(event.clientX - rect.left, event.clientY - rect.top);
        if (city) selectCity(city.zh);
      }
      activePointerId = null;
    }
    canvas.addEventListener("pointerup", finishPointer);
    canvas.addEventListener("pointercancel", finishPointer);
    canvas.addEventListener("lostpointercapture", (event) => {
      if (activePointerId === event.pointerId) {
        dragging = false;
        stage.classList.remove("dragging");
        activePointerId = null;
      }
    });
    canvas.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") yaw -= .12;
      else if (event.key === "ArrowRight") yaw += .12;
      else if (event.key === "ArrowUp") pitch = Math.max(-1.15, pitch - .1);
      else if (event.key === "ArrowDown") pitch = Math.min(1.15, pitch + .1);
      else return;
      event.preventDefault();
      requestGlobeDraw();
    });
    canvas.tabIndex = 0;
    canvas.setAttribute("role", "application");
    canvas.setAttribute("aria-roledescription", "interactive 3D globe");
    canvas.setAttribute("aria-describedby", "globe-title");
    if (!reduceMotion.matches) canvas.classList.add("globe-ready");
    new ResizeObserver(resize).observe(canvas);
    resize();
  }
})();
