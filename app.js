/**
 * app.js – Điểm vào chính của game Kéo–Búa–Bao
 * Mục đích: Khởi tạo game, gắn sự kiện UI, điều phối các module.
 * Không chứa logic game; chỉ đóng vai trò "controller".
 */

import { CHOICES, RESULTS, MODES, playRound, createInitialState, resetSeries, getTargetScore, getChoiceLabel } from './game/engine.js';
import { aiChoose, extractPlayerHistory } from './game/ai.js';
import { saveState, loadState, saveConfig, loadConfig, loadHistory, appendHistory, clearAllData } from './game/storage.js';
import { $, $$, renderChoices, hideChoices, renderScore, renderHistory, renderRoundInfo, showSeriesModal, hideSeriesModal, announceResult, setChoiceButtonsDisabled } from './ui/dom.js';
import { triggerResultAnimation, setFxEnabled, isFxEnabled, applyButtonRipple, celebrateSeries } from './ui/animations.js';
import { setSoundEnabled, isSoundEnabled, playClick, playResult, playCountdown, playSeriesWin } from './ui/sounds.js';

// ─── i18n (Quốc tế hóa) ───────────────────────────────────────────────────────

/** Chuỗi dịch UI */
const I18N = {
  vi: {
    // Nhãn lựa chọn
    scissors: 'Kéo', rock: 'Búa', paper: 'Bao',
    // Kết quả
    win: 'Thắng', lose: 'Thua', draw: 'Hòa',
    // Banner kết quả đầy đủ
    youWin: '🎉 Bạn thắng!', youLose: '😢 Bạn thua!', itsDraw: '🤝 Hòa!',
    // Thông báo loạt
    seriesWin: 'Bạn thắng loạt này! 🏆', seriesLose: 'Máy thắng loạt! 🤖',
    // Controls
    modeQuick: 'Chơi nhanh', modeBo3: 'Best of 3', modeBo5: 'Best of 5',
    modeFirstN: 'First to N',
    diffEasy: 'Dễ', diffMedium: 'Vừa', diffHard: 'Khó',
    labelMode: 'Chế độ chơi', labelDiff: 'Độ khó AI', labelTarget: 'Số điểm mục tiêu (N)',
    btnReset: 'Chơi lại vòng', btnClear: 'Đặt lại tất cả',
    btnSound: 'Âm thanh', btnFx: 'Hiệu ứng',
    confirmClear: 'Xác nhận xóa toàn bộ điểm và lịch sử?',
    // Header
    themeToggle: 'Đổi giao diện', langToggle: 'Switch language', helpBtn: 'Trợ giúp',
    // Sidebar
    scoreTitle: 'Điểm số', historyTitle: 'Lịch sử gần nhất', settingsTitle: 'Cài đặt',
    player: 'Bạn', ai: 'Máy',
    totalGames: 'Tổng ván', wins: 'Thắng', losses: 'Thua', draws: 'Hòa',
    noHistory: 'Chưa có lượt nào',
    // Progress
    progressLabel: 'Tiến trình (mục tiêu:',
    // Phím tắt
    shortcutsTitle: 'Phím tắt',
    // Modal
    playAgain: 'Chơi lại', cancel: 'Hủy',
    // Footer
    footerText: '© 2025 Kéo–Búa–Bao · v1.0',
    shortcutHint: 'Phím tắt: 1/2/3=Chọn · R=Lại · M=Âm · T=Giao diện',
    // Round info
    round: 'Vòng',
  },
  en: {
    scissors: 'Scissors', rock: 'Rock', paper: 'Paper',
    win: 'Win', lose: 'Lose', draw: 'Draw',
    youWin: '🎉 You win!', youLose: '😢 You lose!', itsDraw: '🤝 Draw!',
    seriesWin: 'You won the series! 🏆', seriesLose: 'AI won the series! 🤖',
    modeQuick: 'Quick Play', modeBo3: 'Best of 3', modeBo5: 'Best of 5',
    modeFirstN: 'First to N',
    diffEasy: 'Easy', diffMedium: 'Medium', diffHard: 'Hard',
    labelMode: 'Game Mode', labelDiff: 'AI Difficulty', labelTarget: 'Target Score (N)',
    btnReset: 'Replay Round', btnClear: 'Reset All',
    btnSound: 'Sound', btnFx: 'Effects',
    confirmClear: 'Confirm reset all scores and history?',
    themeToggle: 'Toggle theme', langToggle: 'Đổi ngôn ngữ', helpBtn: 'Help',
    scoreTitle: 'Score', historyTitle: 'Recent History', settingsTitle: 'Settings',
    player: 'You', ai: 'AI',
    totalGames: 'Total', wins: 'Wins', losses: 'Losses', draws: 'Draws',
    noHistory: 'No rounds yet',
    progressLabel: 'Progress (target:',
    shortcutsTitle: 'Keyboard Shortcuts',
    playAgain: 'Play Again', cancel: 'Cancel',
    footerText: '© 2025 Rock–Paper–Scissors · v1.0',
    shortcutHint: 'Keys: 1/2/3=Choose · R=Replay · M=Sound · T=Theme',
    round: 'Round',
  },
};

// ─── Trạng thái ứng dụng ─────────────────────────────────────────────────────

let config = loadConfig();
let gameState = null;
let globalHistory = [];  // Lịch sử toàn cục (nhiều loạt)
let isRoundInProgress = false;

// ─── Khởi tạo game ──────────────────────────────────────────────────────────

function init() {
  // Áp dụng theme & ngôn ngữ đã lưu
  applyTheme(config.theme);
  setSoundEnabled(config.sound);
  setFxEnabled(config.fx);

  // Khôi phục trạng thái từ localStorage
  const savedState = loadState();
  globalHistory = loadHistory();

  if (savedState && !savedState.seriesOver) {
    gameState = {
      ...createInitialState(savedState.mode, savedState.firstToN),
      ...savedState,
      rounds: globalHistory.filter(r => r.seriesId === savedState.seriesId) ?? [],
    };
  } else {
    gameState = createInitialState(config.mode, config.firstToN);
  }

  // Gắn sự kiện
  bindChoiceButtons();
  bindControls();
  bindKeyboard();
  bindHeaderControls();

  // Render ban đầu
  renderAll();
  updateI18n();
}

// ─── Gắn sự kiện nút chọn ────────────────────────────────────────────────────

function bindChoiceButtons() {
  $$('.choice-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (isRoundInProgress) return;
      const choice = btn.dataset.choice;
      if (choice) {
        playClick();
        applyButtonRipple(btn, e);
        startRound(choice);
      }
    });
  });
}

// ─── Bắt đầu một lượt chơi ───────────────────────────────────────────────────

function startRound(playerChoice) {
  if (isRoundInProgress || gameState.seriesOver) return;
  isRoundInProgress = true;
  setChoiceButtonsDisabled(true);
  hideChoices();

  const countdownEl = $('#countdown');
  const fxEnabled = isFxEnabled();

  // Đếm ngược nếu hiệu ứng bật
  let count = 3;
  if (fxEnabled && countdownEl) {
    countdownEl.classList.remove('hidden');
    countdownEl.textContent = count;
    countdownEl.classList.add('counting');
    playCountdown(count);

    const interval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(interval);
        countdownEl.classList.remove('counting');
        countdownEl.classList.add('hidden');
        countdownEl.textContent = '';
        executeRound(playerChoice);
      } else {
        countdownEl.textContent = count;
        countdownEl.classList.remove('counting');
        void countdownEl.offsetWidth; // reflow
        countdownEl.classList.add('counting');
        playCountdown(count);
      }
    }, 800);
  } else {
    if (countdownEl) countdownEl.classList.add('hidden');
    executeRound(playerChoice);
  }
}

// ─── Thực thi lượt chơi ──────────────────────────────────────────────────────

function executeRound(playerChoice) {
  const t = I18N[config.lang];

  // AI chọn nước đi
  const playerHistory = extractPlayerHistory(gameState.rounds);
  const aiChoice = aiChoose(playerHistory, gameState.rounds, config.difficulty);

  // Cập nhật trạng thái game
  gameState = playRound(gameState, playerChoice, aiChoice);

  // Lưu lịch sử
  const lastRound = gameState.rounds[gameState.rounds.length - 1];
  globalHistory = appendHistory(lastRound);

  // Hiển thị kết quả
  const result = lastRound.result;
  renderChoices({ playerChoice, aiChoice, result, lang: config.lang });

  // Cập nhật banner kết quả
  const bannerEl = $('#result-banner');
  if (bannerEl) {
    bannerEl.textContent = result === RESULTS.WIN ? t.youWin
      : result === RESULTS.LOSE ? t.youLose : t.itsDraw;
  }

  // Kích hoạt animation
  triggerResultAnimation(result, $('#player-card'), $('#ai-card'));

  // Phát âm thanh
  playResult(result);

  // Thông báo screen reader
  announceResult(result === RESULTS.WIN ? t.youWin
    : result === RESULTS.LOSE ? t.youLose : t.itsDraw);

  // Cập nhật điểm và lịch sử
  renderAll();
  saveState(gameState);

  // Kiểm tra kết thúc loạt
  if (gameState.seriesOver) {
    setTimeout(() => {
      if (gameState.seriesWinner === 'player') {
        celebrateSeries();
        playSeriesWin();
        showSeriesModal(t.seriesWin, startNewSeries);
      } else {
        showSeriesModal(t.seriesLose, startNewSeries);
      }
    }, 700);
  }

  isRoundInProgress = false;
  setChoiceButtonsDisabled(false);
}

// ─── Bắt đầu loạt mới ────────────────────────────────────────────────────────

function startNewSeries() {
  gameState = {
    ...resetSeries(gameState),
    mode: config.mode,
    firstToN: config.firstToN,
  };
  hideChoices();
  renderAll();
  saveState(gameState);
}

// ─── Render toàn bộ UI ────────────────────────────────────────────────────────

function renderAll() {
  const target = getTargetScore(gameState.mode, gameState.firstToN);
  const t = I18N[config.lang];

  // Điểm số
  renderScore(gameState.score, gameState, target);

  // Thông tin vòng
  const totalRounds = gameState.rounds.length;
  renderRoundInfo(totalRounds, target, t.round);

  // Lịch sử
  renderHistory(globalHistory, config.lang, t);

  // Nút âm thanh & hiệu ứng
  updateToggleButtons();
}

// ─── Cập nhật trạng thái nút toggle ─────────────────────────────────────────

function updateToggleButtons() {
  const soundBtn = $('#btn-sound');
  const fxBtn = $('#btn-fx');
  const t = I18N[config.lang];

  if (soundBtn) {
    soundBtn.title = t.btnSound;
    soundBtn.setAttribute('aria-label', t.btnSound);
    soundBtn.classList.toggle('active', isSoundEnabled());
    soundBtn.textContent = isSoundEnabled() ? '🔊' : '🔇';
  }

  if (fxBtn) {
    fxBtn.title = t.btnFx;
    fxBtn.setAttribute('aria-label', t.btnFx);
    fxBtn.classList.toggle('active', isFxEnabled());
    fxBtn.textContent = isFxEnabled() ? '✨' : '○';
  }
}

// ─── Gắn sự kiện điều khiển ──────────────────────────────────────────────────

function bindControls() {
  // Chế độ chơi
  const modeSelect = $('#mode-select');
  if (modeSelect) {
    modeSelect.value = config.mode;
    modeSelect.addEventListener('change', () => {
      config.mode = modeSelect.value;
      saveConfig(config);
      gameState = { ...gameState, mode: config.mode };

      // Hiển thị/ẩn trường N
      const nWrap = $('#first-to-n-wrap');
      if (nWrap) {
        nWrap.classList.toggle('hidden', config.mode !== MODES.FIRST_TO_N);
      }

      startNewSeries();
    });
  }

  // First-to-N
  const firstToNInput = $('#first-to-n-input');
  if (firstToNInput) {
    firstToNInput.value = config.firstToN;
    firstToNInput.addEventListener('change', () => {
      const n = Math.min(10, Math.max(2, parseInt(firstToNInput.value, 10) || 3));
      firstToNInput.value = n;
      config.firstToN = n;
      saveConfig(config);
      gameState = { ...gameState, firstToN: n };
      startNewSeries();
    });

    // Ẩn/hiện ban đầu
    const nWrap = $('#first-to-n-wrap');
    if (nWrap) nWrap.classList.toggle('hidden', config.mode !== MODES.FIRST_TO_N);
  }

  // Độ khó
  const diffSelect = $('#difficulty-select');
  if (diffSelect) {
    diffSelect.value = config.difficulty;
    diffSelect.addEventListener('change', () => {
      config.difficulty = diffSelect.value;
      saveConfig(config);
    });
  }

  // Chơi lại vòng
  const resetBtn = $('#btn-reset-series');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      playClick();
      startNewSeries();
    });
  }

  // Đặt lại tất cả
  const clearBtn = $('#btn-clear-all');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      const t = I18N[config.lang];
      showConfirmModal(t.confirmClear, () => {
        clearAllData(false);
        globalHistory = [];
        gameState = createInitialState(config.mode, config.firstToN);
        hideChoices();
        renderAll();
      });
    });
  }

  // Âm thanh
  const soundBtn = $('#btn-sound');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      config.sound = !config.sound;
      setSoundEnabled(config.sound);
      saveConfig(config);
      updateToggleButtons();
    });
  }

  // Hiệu ứng
  const fxBtn = $('#btn-fx');
  if (fxBtn) {
    fxBtn.addEventListener('click', () => {
      config.fx = !config.fx;
      setFxEnabled(config.fx);
      saveConfig(config);
      updateToggleButtons();
    });
  }
}

// ─── Phím tắt bàn phím ───────────────────────────────────────────────────────

function bindKeyboard() {
  document.addEventListener('keydown', (e) => {
    // Bỏ qua khi đang nhập trong input
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

    switch (e.key.toUpperCase()) {
      case '1': playClick(); startRound(CHOICES.SCISSORS); break;  // Kéo
      case '2': playClick(); startRound(CHOICES.ROCK);     break;  // Búa
      case '3': playClick(); startRound(CHOICES.PAPER);    break;  // Bao
      case 'R': playClick(); startNewSeries();              break;  // Chơi lại
      case 'M':                                                     // Tắt/bật âm
        config.sound = !config.sound;
        setSoundEnabled(config.sound);
        saveConfig(config);
        updateToggleButtons();
        break;
      case 'T':                                                     // Đổi theme
        toggleTheme();
        break;
      case 'ESCAPE':
        hideConfirmModal();
        hideSeriesModal();
        break;
    }
  });
}

// ─── Điều khiển Header ────────────────────────────────────────────────────────

function bindHeaderControls() {
  // Đổi theme
  const themeBtn = $('#btn-theme');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }

  // Đổi ngôn ngữ
  const langBtn = $('#btn-lang');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      config.lang = config.lang === 'vi' ? 'en' : 'vi';
      saveConfig(config);
      updateI18n();
      renderAll();
    });
  }

  // Trợ giúp
  const helpBtn = $('#btn-help');
  const helpModal = $('#help-modal');
  const helpCloseBtn = $('#help-modal-close');

  if (helpBtn && helpModal) {
    helpBtn.addEventListener('click', () => {
      helpModal.classList.remove('hidden');
      helpModal.setAttribute('aria-hidden', 'false');
      helpCloseBtn?.focus();
    });
  }

  if (helpCloseBtn && helpModal) {
    helpCloseBtn.addEventListener('click', () => {
      helpModal.classList.add('hidden');
      helpModal.setAttribute('aria-hidden', 'true');
      helpBtn?.focus();
    });
  }

  // Đóng modal khi click overlay
  helpModal?.addEventListener('click', (e) => {
    if (e.target === helpModal) {
      helpModal.classList.add('hidden');
    }
  });
}

// ─── Theme ───────────────────────────────────────────────────────────────────

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = $('#btn-theme');
  if (btn) {
    btn.title = I18N[config.lang]?.themeToggle ?? 'Toggle theme';
    btn.setAttribute('aria-label', btn.title);
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

function toggleTheme() {
  config.theme = config.theme === 'dark' ? 'light' : 'dark';
  applyTheme(config.theme);
  saveConfig(config);
}

// ─── Cập nhật i18n ────────────────────────────────────────────────────────────

function updateI18n() {
  const t = I18N[config.lang];
  if (!t) return;

  // Nhãn header
  const themeBtn = $('#btn-theme');
  if (themeBtn) themeBtn.title = t.themeToggle;

  const langBtn = $('#btn-lang');
  if (langBtn) {
    langBtn.title = t.langToggle;
    langBtn.setAttribute('aria-label', t.langToggle);
    langBtn.textContent = config.lang === 'vi' ? 'EN' : 'VI';
  }

  const helpBtn = $('#btn-help');
  if (helpBtn) helpBtn.title = t.helpBtn;

  // Nhãn nút chọn
  $$('.choice-btn').forEach(btn => {
    const choice = btn.dataset.choice;
    if (choice) {
      const labelEl = btn.querySelector('.btn-label');
      if (labelEl) labelEl.textContent = t[choice] ?? choice;
      btn.setAttribute('aria-label', t[choice] ?? choice);
    }
  });

  // Nhãn section
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key]) el.textContent = t[key];
  });

  // Select options
  const modeSelect = $('#mode-select');
  if (modeSelect) {
    modeSelect.querySelectorAll('option').forEach(opt => {
      const key = opt.dataset.i18n;
      if (key && t[key]) opt.textContent = t[key];
    });
  }

  const diffSelect = $('#difficulty-select');
  if (diffSelect) {
    diffSelect.querySelectorAll('option').forEach(opt => {
      const key = opt.dataset.i18n;
      if (key && t[key]) opt.textContent = t[key];
    });
  }

  // Footer
  const footer = $('#footer-text');
  if (footer) footer.textContent = t.footerText;

  const shortcutHint = $('#shortcut-hint');
  if (shortcutHint) shortcutHint.textContent = t.shortcutHint;

  // Điểm sidebar
  const playerLabel = $('#label-player');
  if (playerLabel) playerLabel.textContent = t.player;
  const aiLabel = $('#label-ai');
  if (aiLabel) aiLabel.textContent = t.ai;

  applyTheme(config.theme);
  updateToggleButtons();
}

// ─── Modal xác nhận ──────────────────────────────────────────────────────────

function showConfirmModal(message, onConfirm) {
  const t = I18N[config.lang];
  const modal = $('#confirm-modal');
  const msg = $('#confirm-modal-msg');
  const confirmBtn = $('#confirm-ok');
  const cancelBtn = $('#confirm-cancel');

  if (!modal) return;
  if (msg) msg.textContent = message;

  const cleanup = () => {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  };

  if (confirmBtn) {
    confirmBtn.textContent = t.btnClear;
    confirmBtn.onclick = () => { cleanup(); onConfirm(); };
  }
  if (cancelBtn) {
    cancelBtn.textContent = t.cancel;
    cancelBtn.onclick = cleanup;
  }

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  confirmBtn?.focus();

  // Đóng khi click overlay
  modal.addEventListener('click', (e) => { if (e.target === modal) cleanup(); }, { once: true });
}

function hideConfirmModal() {
  const modal = $('#confirm-modal');
  if (modal && !modal.classList.contains('hidden')) {
    modal.classList.add('hidden');
  }
}

// ─── Khởi động ───────────────────────────────────────────────────────────────

// Tự động theo prefers-color-scheme nếu chưa có cấu hình
if (!loadConfig().theme || loadConfig().theme === undefined) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  config.theme = prefersDark ? 'dark' : 'light';
}

document.addEventListener('DOMContentLoaded', init);
