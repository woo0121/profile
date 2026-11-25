(() => {
  const THEME_STORAGE_KEY = "profile-theme";
  const GOALS_STORAGE_KEY = "profile-goals";

  const root = document.documentElement;
  const themeToggleBtn = document.getElementById("theme-toggle");
  const themeIcon = themeToggleBtn?.querySelector(".theme-icon");
  const themeLabel = themeToggleBtn?.querySelector(".theme-label");

  const goalCheckboxes = Array.from(document.querySelectorAll(".goal-checkbox"));
  const goalsProgress = document.getElementById("goals-progress");

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
      themeIcon.textContent = isDark ? "☀️" : "🌙";
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

  initTheme();
  initGoals();
})();
