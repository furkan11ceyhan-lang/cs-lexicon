(() => {
  const STORAGE_KEYS = {
    learned: "cs_lexicon_learned_v1",
    saved: "cs_lexicon_saved_v1",
    seen: "cs_lexicon_seen_v1",
    lastId: "cs_lexicon_last_id_v1",
    custom: "cs_lexicon_custom_v1",
    theme: "cs_lexicon_theme_v1"
  };

  // State
  const state = {
    filter: "all",       // all | unlearned | saved
    category: "all",
    selfTestMode: false, // false => Türkçe her zaman doğrudan görünür
    cardRevealed: true,
    history: [],
    historyIndex: -1,
    learned: new Set(loadJson(STORAGE_KEYS.learned, [])),
    saved: new Set(loadJson(STORAGE_KEYS.saved, [])),
    seen: new Set(loadJson(STORAGE_KEYS.seen, [])),
    customWords: loadJson(STORAGE_KEYS.custom, [])
  };

  // DOM Elements
  const el = {
    progressText: document.getElementById("progressText"),
    themeToggleBtn: document.getElementById("themeToggleBtn"),
    themeIconSun: document.getElementById("themeIconSun"),
    themeIconMoon: document.getElementById("themeIconMoon"),
    tabBtns: Array.from(document.querySelectorAll(".tab-btn")),
    categorySelect: document.getElementById("categorySelect"),
    vocabCard: document.getElementById("vocabCard"),
    emptyState: document.getElementById("emptyState"),
    emptyMessage: document.getElementById("emptyMessage"),
    resetFilterBtn: document.getElementById("resetFilterBtn"),
    wordCategory: document.getElementById("wordCategory"),
    wordPos: document.getElementById("wordPos"),
    customBadge: document.getElementById("customBadge"),
    bookmarkBtn: document.getElementById("bookmarkBtn"),
    learnedBtn: document.getElementById("learnedBtn"),
    deleteCustomBtn: document.getElementById("deleteCustomBtn"),
    wordTitle: document.getElementById("wordTitle"),
    wordPhonetic: document.getElementById("wordPhonetic"),
    speakWordBtn: document.getElementById("speakWordBtn"),
    speakSentenceBtn: document.getElementById("speakSentenceBtn"),
    enSentence: document.getElementById("enSentence"),
    turkishBlock: document.getElementById("turkishBlock"),
    trMeaning: document.getElementById("trMeaning"),
    trSentence: document.getElementById("trSentence"),
    toggleBlurBtn: document.getElementById("toggleBlurBtn"),
    blurBtnText: document.getElementById("blurBtnText"),
    blurOverlay: document.getElementById("blurOverlay"),
    prevBtn: document.getElementById("prevBtn"),
    nextBtn: document.getElementById("nextBtn"),
    deckCounter: document.getElementById("deckCounter"),
    openAddModalBtn: document.getElementById("openAddModalBtn"),
    addModalBackdrop: document.getElementById("addModalBackdrop"),
    closeModalBtn: document.getElementById("closeModalBtn"),
    cancelModalBtn: document.getElementById("cancelModalBtn"),
    addWordForm: document.getElementById("addWordForm"),
    inputWord: document.getElementById("inputWord"),
    inputPos: document.getElementById("inputPos"),
    inputCategory: document.getElementById("inputCategory"),
    inputPhonetic: document.getElementById("inputPhonetic"),
    inputTrMeaning: document.getElementById("inputTrMeaning"),
    inputSentence: document.getElementById("inputSentence"),
    inputTrSentence: document.getElementById("inputTrSentence")
  };

  function loadItem(key, fallback = null) {
    try {
      const val = localStorage.getItem(key);
      return val !== null ? val : fallback;
    } catch {
      return fallback;
    }
  }

  function saveItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Depolama erişilemiyorsa sessizce geç
    }
  }

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Depolama doluysa veya kısıtlıysa sessizce geç
    }
  }

  function getAllWords() {
    const base = Array.isArray(window.CS_VOCAB_DATA) ? window.CS_VOCAB_DATA : [];
    return [...state.customWords, ...base];
  }

  function getFilteredWords() {
    return getAllWords().filter((item) => {
      if (state.filter === "unlearned" && state.learned.has(item.id)) return false;
      if (state.filter === "saved" && !state.saved.has(item.id)) return false;
      if (state.category !== "all" && item.category !== state.category) return false;
      return true;
    });
  }

  function getCurrentWord() {
    if (state.historyIndex < 0 || state.historyIndex >= state.history.length) return null;
    const id = state.history[state.historyIndex];
    return getAllWords().find((w) => w.id === id) || null;
  }

  // Her açılışta veya "Yeni Kelime" istendiğinde tekrar etmeyen akıllı seçim
  function pickNextWord(pool, avoidId) {
    if (!pool.length) return null;
    if (pool.length === 1) return pool[0];

    // Önce mevcut döngüde görülmemiş olanları seç
    let candidates = pool.filter((w) => !state.seen.has(w.id) && w.id !== avoidId);

    // Eğer tümü görüldüyse bu havuz için görülenleri sıfırla
    if (!candidates.length) {
      pool.forEach((w) => state.seen.delete(w.id));
      candidates = pool.filter((w) => w.id !== avoidId);
    }

    // "Tümü" filtresinde öğrenilmemiş kelimelere öncelik ver
    if (state.filter === "all") {
      const unlearnedCandidates = candidates.filter((w) => !state.learned.has(w.id));
      if (unlearnedCandidates.length) {
        candidates = unlearnedCandidates;
      }
    }

    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    state.seen.add(picked.id);
    saveJson(STORAGE_KEYS.seen, Array.from(state.seen));
    saveItem(STORAGE_KEYS.lastId, picked.id);
    return picked;
  }

  function showWordById(id, pushHistory = true) {
    if (pushHistory) {
      // İleri geçmiş varsa kesip yeni dal aç
      state.history = state.history.slice(0, state.historyIndex + 1);
      state.history.push(id);
      state.historyIndex = state.history.length - 1;
    }
    state.cardRevealed = !state.selfTestMode;
    render();
  }

  function nextWord() {
    const pool = getFilteredWords();
    if (!pool.length) {
      render();
      return;
    }

    // Eğer geçmişte geriye gidilmişse ve ileri kayıt mevcut havuzdaysa ona geç
    if (state.historyIndex < state.history.length - 1) {
      const nextId = state.history[state.historyIndex + 1];
      if (pool.some((w) => w.id === nextId)) {
        state.historyIndex += 1;
        state.cardRevealed = !state.selfTestMode;
        render();
        return;
      }
    }

    const current = getCurrentWord();
    const avoidId = current ? current.id : loadItem(STORAGE_KEYS.lastId);
    const picked = pickNextWord(pool, avoidId);
    if (picked) {
      showWordById(picked.id, true);
    }
  }

  function prevWord() {
    if (state.historyIndex > 0) {
      state.historyIndex -= 1;
      state.cardRevealed = !state.selfTestMode;
      render();
    }
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function formatHighlightedSentence(sentence, highlightTerm, fallbackWord) {
    const safeSentence = escapeHtml(sentence);
    const term = (highlightTerm || fallbackWord || "").trim();
    if (!term) return safeSentence;

    const pattern = new RegExp(`(${escapeRegex(escapeHtml(term))})`, "gi");
    return safeSentence.replace(pattern, '<mark class="word-highlight">$1</mark>');
  }

  function populateCategories() {
    const currentVal = state.category;
    const categories = Array.from(new Set(getAllWords().map((w) => w.category))).sort((a, b) =>
      a.localeCompare(b, "tr")
    );

    el.categorySelect.innerHTML = '<option value="all">Tüm Alanlar</option>';
    categories.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      el.categorySelect.appendChild(opt);
    });

    if (categories.includes(currentVal)) {
      el.categorySelect.value = currentVal;
    } else {
      state.category = "all";
      el.categorySelect.value = "all";
    }
  }

  function updateProgress() {
    const all = getAllWords();
    const validIds = new Set(all.map((w) => w.id));
    let learnedCount = 0;
    state.learned.forEach((id) => {
      if (validIds.has(id)) learnedCount += 1;
    });
    el.progressText.textContent = `${learnedCount} / ${all.length} öğrenildi`;
  }

  function updateTurkishVisibility() {
    const shouldBlur = state.selfTestMode && !state.cardRevealed;
    el.turkishBlock.classList.toggle("is-blurred", shouldBlur);
    el.blurBtnText.textContent = state.selfTestMode
      ? shouldBlur
        ? "Türkçeyi Göster"
        : "Test Modu Açık"
      : "Kendini Test Et (Gizle)";
  }

  function render() {
    updateProgress();
    const pool = getFilteredWords();
    let current = getCurrentWord();

    // Mevcut kelime filtre dışında kaldıysa havuzdan yeni seç
    if (pool.length && (!current || !pool.some((w) => w.id === current.id))) {
      const avoidId = current ? current.id : loadItem(STORAGE_KEYS.lastId);
      const picked = pickNextWord(pool, avoidId);
      if (picked) {
        state.history = state.history.slice(0, state.historyIndex + 1);
        state.history.push(picked.id);
        state.historyIndex = state.history.length - 1;
        current = picked;
      }
    }

    if (!pool.length || !current) {
      el.vocabCard.style.display = "none";
      el.emptyState.style.display = "flex";
      el.emptyMessage.textContent =
        state.filter === "saved"
          ? "Henüz kaydettiğin bir kelime yok. Karttaki 'Kaydet' düğmesiyle favori listen oluşturabilirsin."
          : state.filter === "unlearned"
            ? "Harika! Bu alandaki tüm kelimeleri öğrendin."
            : "Bu filtrede gösterilecek kelime bulunamadı.";
      el.deckCounter.textContent = "0 / 0";
      el.prevBtn.disabled = true;
      el.nextBtn.disabled = true;
      return;
    }

    el.vocabCard.style.display = "flex";
    el.emptyState.style.display = "none";

    // Kart geçiş animasyonunu tetikle
    el.vocabCard.style.animation = "none";
    void el.vocabCard.offsetWidth;
    el.vocabCard.style.animation = "";

    el.wordCategory.textContent = current.category || "Genel";
    el.wordPos.textContent = current.pos || "term";
    el.wordPos.style.display = current.pos ? "inline-flex" : "none";
    el.customBadge.style.display = current.isCustom ? "inline-flex" : "none";
    el.deleteCustomBtn.style.display = current.isCustom ? "inline-flex" : "none";

    el.wordTitle.textContent = current.word;
    el.wordPhonetic.textContent = current.phonetic || "";
    el.wordPhonetic.style.display = current.phonetic ? "block" : "none";

    el.enSentence.innerHTML = formatHighlightedSentence(
      current.sentence,
      current.highlight,
      current.word
    );

    el.trMeaning.textContent = current.trMeaning;
    el.trSentence.textContent = current.trSentence;

    const isSaved = state.saved.has(current.id);
    const isLearned = state.learned.has(current.id);
    el.bookmarkBtn.classList.toggle("is-saved", isSaved);
    el.bookmarkBtn.querySelector("span").textContent = isSaved ? "Kaydedildi" : "Kaydet";
    el.learnedBtn.classList.toggle("is-learned", isLearned);
    el.learnedBtn.querySelector("span").textContent = isLearned ? "Öğrenildi" : "Öğrendim";

    const indexInPool = pool.findIndex((w) => w.id === current.id) + 1;
    el.deckCounter.textContent = `Kart ${indexInPool} / ${pool.length}`;
    el.prevBtn.disabled = state.historyIndex <= 0;
    el.nextBtn.disabled = pool.length <= 1;

    updateTurkishVisibility();
  }

  // Sesli Okuma (Web Speech API)
  function speakText(text, rate = 0.94) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = rate;

    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => v.lang === "en-US" && /Samantha|Alex|Google US English|Natural/i.test(v.name)) ||
      voices.find((v) => v.lang.startsWith("en-US")) ||
      voices.find((v) => v.lang.startsWith("en"));
    if (preferred) utterance.voice = preferred;

    window.speechSynthesis.speak(utterance);
  }

  // Tema Yönetimi
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const isDark = theme === "dark";
    el.themeIconSun.style.display = isDark ? "block" : "none";
    el.themeIconMoon.style.display = isDark ? "none" : "block";
    saveItem(STORAGE_KEYS.theme, theme);
  }

  function initTheme() {
    const saved = loadItem(STORAGE_KEYS.theme);
    if (saved === "dark" || saved === "light") {
      applyTheme(saved);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      applyTheme(prefersDark ? "dark" : "light");
    }
  }

  // Modal İşlemleri
  function openModal() {
    el.addModalBackdrop.hidden = false;
    el.inputWord.focus();
  }

  function closeModal() {
    el.addModalBackdrop.hidden = true;
    el.addWordForm.reset();
  }

  // Olay Dinleyicileri
  el.nextBtn.addEventListener("click", nextWord);
  el.prevBtn.addEventListener("click", prevWord);

  el.speakWordBtn.addEventListener("click", () => {
    const current = getCurrentWord();
    if (current) speakText(current.word, 0.9);
  });

  el.speakSentenceBtn.addEventListener("click", () => {
    const current = getCurrentWord();
    if (current) speakText(current.sentence, 0.95);
  });

  el.bookmarkBtn.addEventListener("click", () => {
    const current = getCurrentWord();
    if (!current) return;
    if (state.saved.has(current.id)) {
      state.saved.delete(current.id);
    } else {
      state.saved.add(current.id);
    }
    saveJson(STORAGE_KEYS.saved, Array.from(state.saved));
    render();
  });

  el.learnedBtn.addEventListener("click", () => {
    const current = getCurrentWord();
    if (!current) return;
    if (state.learned.has(current.id)) {
      state.learned.delete(current.id);
    } else {
      state.learned.add(current.id);
    }
    saveJson(STORAGE_KEYS.learned, Array.from(state.learned));
    render();
  });

  el.deleteCustomBtn.addEventListener("click", () => {
    const current = getCurrentWord();
    if (!current || !current.isCustom) return;
    state.customWords = state.customWords.filter((w) => w.id !== current.id);
    state.saved.delete(current.id);
    state.learned.delete(current.id);
    state.seen.delete(current.id);
    saveJson(STORAGE_KEYS.custom, state.customWords);
    saveJson(STORAGE_KEYS.saved, Array.from(state.saved));
    saveJson(STORAGE_KEYS.learned, Array.from(state.learned));
    saveJson(STORAGE_KEYS.seen, Array.from(state.seen));
    populateCategories();
    nextWord();
  });

  el.toggleBlurBtn.addEventListener("click", () => {
    if (!state.selfTestMode) {
      state.selfTestMode = true;
      state.cardRevealed = false;
    } else if (!state.cardRevealed) {
      state.cardRevealed = true;
    } else {
      state.selfTestMode = false;
      state.cardRevealed = true;
    }
    updateTurkishVisibility();
  });

  el.blurOverlay.addEventListener("click", () => {
    state.cardRevealed = true;
    updateTurkishVisibility();
  });

  el.tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.filter = btn.dataset.filter;
      el.tabBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("active", active);
        b.setAttribute("aria-selected", String(active));
      });
      render();
    });
  });

  el.categorySelect.addEventListener("change", () => {
    state.category = el.categorySelect.value;
    render();
  });

  el.resetFilterBtn.addEventListener("click", () => {
    state.filter = "all";
    state.category = "all";
    el.categorySelect.value = "all";
    el.tabBtns.forEach((b) => {
      const active = b.dataset.filter === "all";
      b.classList.toggle("active", active);
      b.setAttribute("aria-selected", String(active));
    });
    render();
  });

  el.themeToggleBtn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
  });

  el.openAddModalBtn.addEventListener("click", openModal);
  el.closeModalBtn.addEventListener("click", closeModal);
  el.cancelModalBtn.addEventListener("click", closeModal);
  el.addModalBackdrop.addEventListener("click", (e) => {
    if (e.target === el.addModalBackdrop) closeModal();
  });

  el.addWordForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const word = el.inputWord.value.trim();
    const trMeaning = el.inputTrMeaning.value.trim();
    const sentence = el.inputSentence.value.trim();
    const trSentence = el.inputTrSentence.value.trim();
    if (!word || !trMeaning || !sentence || !trSentence) return;

    const newItem = {
      id: "custom_" + Date.now(),
      word,
      phonetic: el.inputPhonetic.value.trim(),
      pos: el.inputPos.value.trim() || "term",
      category: el.inputCategory.value.trim() || "Kişisel Liste",
      trMeaning,
      sentence,
      highlight: word,
      trSentence,
      isCustom: true
    };

    state.customWords.unshift(newItem);
    saveJson(STORAGE_KEYS.custom, state.customWords);
    populateCategories();

    // Yeni eklenen kelimeyi hemen görünür kılmak için filtre uygunsa direkt göster
    state.filter = "all";
    state.category = "all";
    el.categorySelect.value = "all";
    el.tabBtns.forEach((b) => {
      const active = b.dataset.filter === "all";
      b.classList.toggle("active", active);
      b.setAttribute("aria-selected", String(active));
    });

    closeModal();
    showWordById(newItem.id, true);
  });

  // Klavye Kısayolları
  document.addEventListener("keydown", (e) => {
    if (!el.addModalBackdrop.hidden) {
      if (e.key === "Escape") closeModal();
      return;
    }

    const tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

    if (e.code === "Space" || e.key === "ArrowRight") {
      e.preventDefault();
      nextWord();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevWord();
    } else if (e.key.toLowerCase() === "s") {
      const current = getCurrentWord();
      if (current) speakText(current.word, 0.9);
    } else if (e.key.toLowerCase() === "h") {
      el.toggleBlurBtn.click();
    } else if (e.key.toLowerCase() === "l") {
      el.learnedBtn.click();
    } else if (e.key.toLowerCase() === "b") {
      el.bookmarkBtn.click();
    }
  });

  // Başlangıç
  initTheme();
  populateCategories();
  const initialPool = getFilteredWords();
  const lastId = loadItem(STORAGE_KEYS.lastId);
  const firstWord = pickNextWord(initialPool, lastId);
  if (firstWord) {
    showWordById(firstWord.id, true);
  } else {
    render();
  }

  // PWA Service Worker ve Tek Tıkla Yükleme (sadece http/https üzerinde)
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.protocol === "http:")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }

  let deferredInstallPrompt = null;
  const installPwaBtn = document.getElementById("installPwaBtn");

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (installPwaBtn) installPwaBtn.style.display = "inline-flex";
  });

  if (installPwaBtn) {
    installPwaBtn.addEventListener("click", async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      installPwaBtn.style.display = "none";
    });
  }

  window.addEventListener("appinstalled", () => {
    if (installPwaBtn) installPwaBtn.style.display = "none";
    deferredInstallPrompt = null;
  });
})();
