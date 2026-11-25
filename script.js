(() => {
  const THEME_STORAGE_KEY = "profile-theme";
  const GOALS_STORAGE_KEY = "profile-goals";

  const root = document.documentElement;
  const themeToggleBtn = document.getElementById("theme-toggle");
  const themeIcon = themeToggleBtn?.querySelector(".theme-icon");
  const themeLabel = themeToggleBtn?.querySelector(".theme-label");

  const goalCheckboxes = Array.from(document.querySelectorAll(".goal-checkbox"));
  const goalsProgress = document.getElementById("goals-progress");
  const interestCards = Array.from(document.querySelectorAll(".cards-grid .card"));
  const typingGreeting = document.getElementById("typing-greeting");

  function safeGetStorage(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function safeSetStorage(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Ignore storage errors in restricted environments
    }
  }

  function applyTheme(theme) {
    const isDark = theme === "dark";
    root.setAttribute("data-theme", isDark ? "dark" : "light");

    if (themeToggleBtn) {
      themeToggleBtn.setAttribute("aria-pressed", String(isDark));
      themeToggleBtn.setAttribute(
        "aria-label",
        isDark ? "라이트 모드로 전환" : "다크 모드로 전환"
      );
    }

    if (themeIcon) {
      themeIcon.textContent = isDark ? "💡" : "🕶️";
    }

    if (themeLabel) {
      themeLabel.textContent = isDark ? "라이트 모드" : "다크 모드";
    }
  }

  function initTheme() {
    const savedTheme = safeGetStorage(THEME_STORAGE_KEY);
    const initialTheme = savedTheme === "dark" ? "dark" : "light";
    applyTheme(initialTheme);

    themeToggleBtn?.addEventListener("click", () => {
      const currentTheme = root.getAttribute("data-theme");
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      safeSetStorage(THEME_STORAGE_KEY, nextTheme);
    });
  }

  function updateGoalsProgress() {
    if (!goalsProgress) return;
    const total = goalCheckboxes.length;
    const completed = goalCheckboxes.filter((checkbox) => checkbox.checked).length;
    goalsProgress.textContent = `${completed} / ${total} 달성`;
  }

  function saveGoalsState() {
    const state = {};
    goalCheckboxes.forEach((checkbox) => {
      const id = checkbox.dataset.goalId;
      if (id) {
        state[id] = checkbox.checked;
      }
    });
    safeSetStorage(GOALS_STORAGE_KEY, JSON.stringify(state));
  }

  function initGoals() {
    const rawSaved = safeGetStorage(GOALS_STORAGE_KEY);
    if (rawSaved) {
      try {
        const savedState = JSON.parse(rawSaved);
        goalCheckboxes.forEach((checkbox) => {
          const id = checkbox.dataset.goalId;
          if (id && typeof savedState[id] === "boolean") {
            checkbox.checked = savedState[id];
          }
        });
      } catch {
        // Ignore malformed saved state
      }
    }

    updateGoalsProgress();

    goalCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        updateGoalsProgress();
        saveGoalsState();
      });
    });
  }

  function initInterestCards() {
    interestCards.forEach((card) => {
      const trigger = card.querySelector(".card-trigger");
      const panel = card.querySelector(".card-panel");
      const hint = card.querySelector(".card-hint");

      if (!trigger || !panel) return;

      trigger.addEventListener("click", () => {
        const isOpen = card.classList.toggle("is-open");
        trigger.setAttribute("aria-expanded", String(isOpen));
        panel.setAttribute("aria-hidden", String(!isOpen));

        if (hint) {
          hint.textContent = isOpen ? "설명 접기" : "설명 펼치기";
        }
      });
    });
  }

  function initTypingGreeting() {
    if (!typingGreeting) return;

    const fullText =
      typingGreeting.dataset.greeting || typingGreeting.textContent.trim();
    if (!fullText) return;

    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      typingGreeting.textContent = fullText;
      return;
    }

    const chars = Array.from(fullText);
    let index = 0;
    typingGreeting.textContent = "";

    function typeNextChar() {
      if (index >= chars.length) return;
      typingGreeting.textContent += chars[index];
      index += 1;
      window.setTimeout(typeNextChar, 55);
    }

    window.setTimeout(typeNextChar, 180);
  }

  initTheme();
  initTypingGreeting();
  initInterestCards();
  initGoals();
})();
