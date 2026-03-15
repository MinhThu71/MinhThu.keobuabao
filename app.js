/**
 * app.js - Điểm vào chính của game Kéo–Búa–Bao
 * Khởi tạo game, gắn sự kiện UI, điều phối các module
 */

// ── Import các module ────────────────────────────────────────
import {
  CHOICES, GAME_MODES, RESULTS,
  createGameState, playRound, getTargetScore,
  getMaxRounds, getRoundsRemaining, getChoiceLabel, getChoiceIcon,
} from './game/engine.js';

import { createAIState, getAIChoice, updateAIState } from './game/ai.js';

import {
  getSettings, saveSettings, getTotalStats, updateTotalStats,
  getHistory, addHistoryEntry, getAIState, saveAIState,
  resetGameData, isStorageAvailable,
} from './game/storage.js';

import {
  $, $$, setText, setHTML, toggleClass,
  updateProgressBar, addTempClass, setVisible,
  announceToScreenReader, renderChoiceCard, renderHistoryRow,
  svgIcon, clearDOMCache,
} from './ui/dom.js';

import {
  setAnimEnabled, isAnimEnabled, animateWin, animateLose,
  animateDraw, launchConfetti, showCountdown, animateReveal,
} from './ui/animations.js';

import {
  setSoundEnabled, isSoundEnabled,
  playClickSound, playWinSound, playLoseSound, playDrawSound,
  playGameOverSound, playCountdownSound,
} from './ui/sounds.js';

// ── i18n: Các chuỗi ngôn ngữ ────────────────────────────────
const I18N = {
  vi: {
    title: 'Kéo–Búa–Bao',
    scissors: 'Kéo', rock: 'Búa', paper: 'Bao',
    player: 'Người chơi', computer: 'Máy',
    win: 'Bạn thắng! 🎉', lose: 'Bạn thua! 😔', draw: 'Hòa! 🤝',
    roundLabel: 'Vòng', roundOf: 'Lượt',
    played: 'Đã chơi', remaining: 'Còn lại', draws: 'Hòa',
    history: 'Lịch sử', noHistory: 'Chưa có lượt nào',
    settings: 'Cài đặt', difficulty: 'Độ khó',
    easy: 'Dễ', medium: 'Vừa', hard: 'Khó',
    gameMode: 'Chế độ chơi',
    single: 'Nhanh', bo3: 'Bo3', bo5: 'Bo5', firstToN: 'First-to',
    targetN: 'Mục tiêu N:',
    replayRound: '↺ Chơi lại', resetAll: '🗑 Đặt lại',
    soundOn: 'Âm thanh', effectOn: 'Hiệu ứng',
    shortcutsHint: 'Phím tắt: 1=Kéo 2=Búa 3=Bao R=Chơi lại M=Âm T=Theme',
    confirmReset: 'Bạn có chắc muốn đặt lại toàn bộ điểm và lịch sử không?',
    gameOver: 'Kết thúc loạt!',
    youWin: 'Bạn thắng loạt! 🏆',
    youLose: 'Máy thắng loạt! 😞',
    gameDraw: 'Hòa loạt! 🤝',
    playAgain: 'Chơi loạt mới',
    scoreTarget: 'Mục tiêu',
    progress: 'Tiến độ',
    help: 'Trợ giúp',
    helpTitle: 'Hướng dẫn & Phím tắt',
    helpKeys: [
      ['1', 'Chọn Kéo'],
      ['2', 'Chọn Búa'],
      ['3', 'Chọn Bao'],
      ['R', 'Chơi lại / Vòng mới'],
      ['M', 'Bật/Tắt âm thanh'],
      ['T', 'Đổi giao diện sáng/tối'],
      ['?', 'Mở hướng dẫn'],
      ['Esc', 'Đóng cửa sổ'],
    ],
    helpRules: 'Kéo thắng Bao · Bao thắng Búa · Búa thắng Kéo',
    closeHelp: 'Đóng',
    storageWarning: '⚠ localStorage không khả dụng — dữ liệu sẽ không được lưu',
    themeToggle: 'Đổi theme',
    langToggle: 'EN',
    version: 'v1.0.0',
    author: 'Kéo–Búa–Bao Game',
    toastReset: 'Đã đặt lại dữ liệu',
  },
  en: {
    title: 'Rock–Paper–Scissors',
    scissors: 'Scissors', rock: 'Rock', paper: 'Paper',
    player: 'Player', computer: 'Computer',
    win: 'You win! 🎉', lose: 'You lose! 😔', draw: 'Draw! 🤝',
    roundLabel: 'Round', roundOf: 'of',
    played: 'Played', remaining: 'Left', draws: 'Draws',
    history: 'History', noHistory: 'No rounds yet',
    settings: 'Settings', difficulty: 'Difficulty',
    easy: 'Easy', medium: 'Medium', hard: 'Hard',
    gameMode: 'Game Mode',
    single: 'Quick', bo3: 'Bo3', bo5: 'Bo5', firstToN: 'First-to',
    targetN: 'Target N:',
    replayRound: '↺ Replay', resetAll: '🗑 Reset',
    soundOn: 'Sound', effectOn: 'Effects',
    shortcutsHint: 'Shortcuts: 1=Scissors 2=Rock 3=Paper R=Replay M=Sound T=Theme',
    confirmReset: 'Are you sure you want to reset all scores and history?',
    gameOver: 'Series Over!',
    youWin: 'You win the series! 🏆',
    youLose: 'Computer wins the series! 😞',
    gameDraw: 'Series draw! 🤝',
    playAgain: 'New Series',
    scoreTarget: 'Target',
    progress: 'Progress',
    help: 'Help',
    helpTitle: 'Guide & Shortcuts',
    helpKeys: [
      ['1', 'Choose Scissors'],
      ['2', 'Choose Rock'],
      ['3', 'Choose Paper'],
      ['R', 'Replay / New Round'],
      ['M', 'Toggle Sound'],
      ['T', 'Toggle Theme'],
      ['?', 'Open Help'],
      ['Esc', 'Close dialog'],
    ],
    helpRules: 'Scissors beats Paper · Paper beats Rock · Rock beats Scissors',
    closeHelp: 'Close',
    storageWarning: '⚠ localStorage not available — data will not be saved',
    themeToggle: 'Toggle theme',
    langToggle: 'VI',
    version: 'v1.0.0',
    author: 'Rock-Paper-Scissors Game',
    toastReset: 'Data reset',
  },
};

// ── Trạng thái toàn cục ──────────────────────────────────────
let settings = getSettings();
let gameState = createGameState(settings.gameMode, settings.targetN);
let aiState = getAIState() || createAIState();
let isPlaying = false; // Đang trong lượt (đếm ngược)

// ── Khởi tạo ────────────────────────────────────────────────

/**
 * Điểm khởi chạy chính
 */
function init() {
  // Áp dụng cài đặt đã lưu
  applyTheme(settings.theme, true);
  setSoundEnabled(settings.soundEnabled);
  setAnimEnabled(settings.animEnabled);

  // Cảnh báo nếu storage bị chặn
  if (!isStorageAvailable()) {
    showToast(t('storageWarning'), 5000);
  }

  // Render UI lần đầu
  renderAll();

  // Gắn sự kiện
  bindEvents();

  // Áp dụng prefers-color-scheme nếu chưa có theme lưu
  if (!localStorage.getItem('kbb_settings')) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light', true);
  }
}

// ── Lấy chuỗi dịch ──────────────────────────────────────────

/**
 * Lấy chuỗi i18n theo key
 * @param {string} key - Key trong I18N
 * @returns {string|any}
 */
function t(key) {
  const lang = settings.language || 'vi';
  return (I18N[lang] || I18N.vi)[key] || key;
}

// ── Render ───────────────────────────────────────────────────

/** Render toàn bộ giao diện */
function renderAll() {
  renderHeader();
  renderStaticLabels(); // Cập nhật nhãn tĩnh (i18n)
  renderScoreboard();
  renderProgressBars();
  renderChoiceArea();
  renderHistory();
  renderControls();
  renderFooter();
}

/**
 * Cập nhật tất cả nhãn văn bản tĩnh theo ngôn ngữ hiện tại
 * (Các phần tử không được render động theo trạng thái)
 */
function renderStaticLabels() {
  // Scoreboard labels
  setText('.player-score .score-who', t('player'));
  setText('.ai-score .score-who', t('computer'));

  // Stat labels
  setText('#lbl-played', t('played'));
  setText('#lbl-remaining', t('remaining'));
  setText('#lbl-draws', t('draws'));

  // Progress labels
  setText('#lbl-player-pct', t('player'));
  setText('#lbl-ai-pct', t('computer'));

  // Round label
  setText('.round-label', t('roundLabel'));

  // Toggle labels
  const soundLbl = $('#lbl-sound');
  if (soundLbl) soundLbl.textContent = `🔊 ${t('soundOn')}`;
  const animLbl = $('#lbl-anim');
  if (animLbl) animLbl.textContent = `✨ ${t('effectOn')}`;

  // Nút Dễ/Vừa/Khó
  const diffBtns = $$('.btn-option[data-diff]');
  const diffLabels = [t('easy'), t('medium'), t('hard')];
  diffBtns.forEach((btn, i) => { if (diffLabels[i] !== undefined) btn.textContent = diffLabels[i]; });

  // Nút Quick/Bo3/Bo5/First-to
  const modeBtns = $$('.btn-option[data-mode]');
  const modeLabels = [t('single'), 'Bo3', 'Bo5', t('firstToN')];
  modeBtns.forEach((btn, i) => { if (modeLabels[i] !== undefined) btn.textContent = modeLabels[i]; });

  // Reset button
  const resetBtn = $('#reset-btn');
  if (resetBtn) resetBtn.textContent = t('resetAll');

  // Help button label
  const helpBtn = $('#help-btn');
  if (helpBtn) helpBtn.setAttribute('aria-label', t('help'));
}

/** Render header */
function renderHeader() {
  const logoTitle = $('#logo-title');
  if (logoTitle) logoTitle.textContent = t('title');

  const themeBtn = $('#theme-btn');
  if (themeBtn) {
    themeBtn.setAttribute('aria-label', t('themeToggle'));
    themeBtn.innerHTML = settings.theme === 'dark'
      ? svgIcon('icon-sun')
      : svgIcon('icon-moon');
  }

  const langBtn = $('#lang-btn');
  if (langBtn) langBtn.textContent = t('langToggle');
}

/** Render khu vực lựa chọn (các nút) */
function renderChoiceArea() {
  // Cập nhật nhãn các nút
  const btnLabels = {
    [CHOICES.SCISSORS]: t('scissors'),
    [CHOICES.ROCK]: t('rock'),
    [CHOICES.PAPER]: t('paper'),
  };
  Object.entries(btnLabels).forEach(([choice, label]) => {
    const btn = $(`[data-choice="${choice}"]`);
    if (btn) {
      const labelEl = btn.querySelector('.btn-label');
      if (labelEl) labelEl.textContent = label;
      btn.setAttribute('aria-label', label);
    }
  });

  // Reset card lựa chọn
  renderResultCards(null, null, null);
}

/** Render hai card kết quả */
function renderResultCards(playerChoice, aiChoice, result) {
  const playerCard = $('#player-card');
  const aiCard = $('#ai-card');
  const resultMsg = $('#result-message');

  if (playerCard) {
    playerCard.innerHTML = renderChoiceCard(playerChoice, settings.language, true);
    // Xóa class cũ
    playerCard.className = 'choice-card' + (playerChoice ? ' has-choice' : '');
    if (result) {
      if (result === RESULTS.WIN) playerCard.classList.add('result-win');
      if (result === RESULTS.LOSE) playerCard.classList.add('result-lose');
      if (result === RESULTS.DRAW) playerCard.classList.add('result-draw');
    }
  }

  if (aiCard) {
    aiCard.innerHTML = renderChoiceCard(aiChoice, settings.language, false);
    aiCard.className = 'choice-card' + (aiChoice ? ' has-choice' : '');
    if (result) {
      if (result === RESULTS.WIN) aiCard.classList.add('result-lose');
      else if (result === RESULTS.LOSE) aiCard.classList.add('result-win');
      else if (result === RESULTS.DRAW) aiCard.classList.add('result-draw');
    }
  }

  if (resultMsg) {
    if (result) {
      resultMsg.textContent = t(result);
      resultMsg.className = `result-message ${result}`;
    } else {
      resultMsg.textContent = '';
      resultMsg.className = 'result-message';
    }
  }
}

/** Render bảng điểm */
function renderScoreboard() {
  setText('#player-score', gameState.playerScore);
  setText('#ai-score', gameState.aiScore);

  const stats = getTotalStats();
  setText('#stat-played', gameState.roundsPlayed);
  setText('#stat-draws', gameState.draws);

  const maxRounds = getMaxRounds(gameState);
  const remaining = maxRounds === Infinity ? '∞' : getRoundsRemaining(gameState);
  setText('#stat-remaining', remaining);

  // Vòng hiện tại (hiển thị vòng đang chơi; khi game kết thúc hiện vòng cuối)
  const roundNum = gameState.isOver
    ? gameState.roundsPlayed
    : gameState.roundsPlayed + 1;
  const maxR = maxRounds === Infinity ? '' : `/${maxRounds}`;
  setText('#round-number', `${roundNum}${maxR}`);
}

/** Render thanh tiến trình */
function renderProgressBars() {
  const target = getTargetScore(gameState);
  updateProgressBar('#player-progress-fill', gameState.playerScore, target);
  updateProgressBar('#ai-progress-fill', gameState.aiScore, target);

  setText('#progress-target', `${t('scoreTarget')}: ${target}`);

  // Label phần trăm
  const pPct = target > 0 ? Math.round((gameState.playerScore / target) * 100) : 0;
  const aPct = target > 0 ? Math.round((gameState.aiScore / target) * 100) : 0;
  setText('#player-progress-pct', `${pPct}%`);
  setText('#ai-progress-pct', `${aPct}%`);
}

/** Render lịch sử */
function renderHistory() {
  const container = $('#history-list');
  if (!container) return;

  const history = gameState.history;
  if (history.length === 0) {
    container.innerHTML = `<div class="history-empty">${t('noHistory')}</div>`;
    return;
  }

  // Hiển thị 10 lượt gần nhất (mới nhất trên đầu)
  const rows = [...history].reverse().slice(0, 10)
    .map(entry => renderHistoryRow(entry, settings.language))
    .join('');
  container.innerHTML = rows;
}

/** Render controls */
function renderControls() {
  // Cập nhật nhãn
  setText('#lbl-difficulty', t('difficulty'));
  setText('#lbl-game-mode', t('gameMode'));
  setText('#lbl-target-n', t('targetN'));

  // Cập nhật trạng thái active của chế độ
  $$('.btn-option[data-mode]').forEach(btn => {
    toggleClass(btn, 'active', btn.dataset.mode === gameState.mode);
  });

  // Cập nhật trạng thái độ khó
  $$('.btn-option[data-diff]').forEach(btn => {
    toggleClass(btn, 'active', btn.dataset.diff === settings.difficulty);
  });

  // Input N
  const nInput = $('#target-n-input');
  if (nInput) nInput.value = settings.targetN;

  // Hiển thị/ẩn input N
  const nRow = $('#first-to-n-row');
  if (nRow) nRow.hidden = gameState.mode !== GAME_MODES.FIRST_TO_N;

  // Toggle âm thanh
  const soundToggle = $('#sound-toggle');
  if (soundToggle) soundToggle.checked = settings.soundEnabled;

  // Toggle hiệu ứng
  const animToggle = $('#anim-toggle');
  if (animToggle) animToggle.checked = settings.animEnabled;

  // Label nút replay
  const replayBtn = $('#replay-btn');
  if (replayBtn) {
    const span = replayBtn.querySelector('span');
    if (span) span.textContent = t('replayRound');
  }
}

/** Render footer */
function renderFooter() {
  const hint = $('#shortcuts-hint');
  if (hint) hint.textContent = t('shortcutsHint');
  const authorEl = $('#footer-author');
  if (authorEl) authorEl.textContent = t('author');
}

// ── Sự kiện ─────────────────────────────────────────────────

/** Gắn tất cả sự kiện UI */
function bindEvents() {
  // Nút chọn (Kéo/Búa/Bao)
  $$('.choice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const choice = btn.dataset.choice;
      if (choice && !isPlaying && !gameState.isOver) {
        handlePlayerChoice(choice);
      }
    });
  });

  // Đổi theme
  $('#theme-btn')?.addEventListener('click', toggleTheme);

  // Đổi ngôn ngữ
  $('#lang-btn')?.addEventListener('click', toggleLang);

  // Chế độ chơi
  $$('.btn-option[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      setGameMode(btn.dataset.mode);
    });
  });

  // Độ khó
  $$('.btn-option[data-diff]').forEach(btn => {
    btn.addEventListener('click', () => {
      setDifficulty(btn.dataset.diff);
    });
  });

  // Input N
  $('#target-n-input')?.addEventListener('change', e => {
    const n = Math.max(3, Math.min(10, parseInt(e.target.value, 10) || 3));
    e.target.value = n;
    settings.targetN = n;
    saveSettings({ targetN: n });
    newGame();
  });

  // Replay
  $('#replay-btn')?.addEventListener('click', replayRound);

  // Reset
  $('#reset-btn')?.addEventListener('click', handleReset);

  // Toggle âm thanh
  $('#sound-toggle')?.addEventListener('change', e => {
    setSoundEnabled(e.target.checked);
    saveSettings({ soundEnabled: e.target.checked });
    settings.soundEnabled = e.target.checked;
    if (e.target.checked) playClickSound();
  });

  // Toggle hiệu ứng
  $('#anim-toggle')?.addEventListener('change', e => {
    setAnimEnabled(e.target.checked);
    saveSettings({ animEnabled: e.target.checked });
    settings.animEnabled = e.target.checked;
  });

  // Nút chơi lại sau game over
  $('#play-again-btn')?.addEventListener('click', () => {
    hideGameOver();
    newGame();
  });

  // Nút Help
  $('#help-btn')?.addEventListener('click', showHelp);
  $('#help-close-btn')?.addEventListener('click', hideHelp);
  $('#help-backdrop')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) hideHelp();
  });

  // Phím tắt
  document.addEventListener('keydown', handleKeydown);
}

// ── Luồng game ───────────────────────────────────────────────

/**
 * Người chơi chọn một lựa chọn
 * @param {string} choice - CHOICES.*
 */
function handlePlayerChoice(choice) {
  if (isPlaying || gameState.isOver) return;

  isPlaying = true;
  playClickSound();
  disableChoiceBtns(true);

  const countdown = $('#countdown');

  // Đếm ngược 3-2-1 nếu bật hiệu ứng
  showCountdown(countdown, () => {
    const aiChoice = getAIChoice(aiState, settings.difficulty);
    const { result, gameOver, winner } = playRound(gameState, choice, aiChoice);

    // Cập nhật AI state
    updateAIState(aiState, choice, result);
    saveAIState(aiState);

    // Lưu lịch sử vào storage
    addHistoryEntry({ playerChoice: choice, aiChoice, result });
    updateTotalStats(result);

    // Render kết quả
    renderResultCards(choice, aiChoice, result);
    renderScoreboard();
    renderProgressBars();
    renderHistory();

    // Thông báo cho screen reader
    announceToScreenReader(t(result));

    // Animate
    applyResultAnimation(result);

    // Âm thanh
    if (result === RESULTS.WIN) playWinSound();
    else if (result === RESULTS.LOSE) playLoseSound();
    else playDrawSound();

    isPlaying = false;
    disableChoiceBtns(false);

    // Kiểm tra game over
    if (gameOver) {
      setTimeout(() => showGameOver(winner), 900);
    }
  });
}

/**
 * Áp dụng animation theo kết quả
 * @param {string} result - RESULTS.*
 */
function applyResultAnimation(result) {
  const playerCardEl = $('#player-card');
  const aiCardEl = $('#ai-card');

  if (!playerCardEl || !aiCardEl) return;

  // Reveal cả hai
  animateReveal(playerCardEl);
  animateReveal(aiCardEl);

  if (result === RESULTS.WIN) {
    animateWin(playerCardEl);
    animateLose(aiCardEl);
    launchConfetti();
  } else if (result === RESULTS.LOSE) {
    animateLose(playerCardEl);
    animateWin(aiCardEl);
  } else {
    animateDraw(playerCardEl, aiCardEl);
  }
}

/** Bật/tắt các nút lựa chọn */
function disableChoiceBtns(disabled) {
  $$('.choice-btn').forEach(btn => {
    btn.disabled = disabled;
  });
}

/** Chơi lại (reset ván hiện tại, giữ điểm tổng loạt) */
function replayRound() {
  if (isPlaying) return;
  renderResultCards(null, null, null);
  if (gameState.isOver) {
    hideGameOver();
    newGame();
  }
  playClickSound();
}

/** Bắt đầu game / loạt mới */
function newGame() {
  gameState = createGameState(settings.gameMode, settings.targetN);
  renderAll();
  hideGameOver();
}

/** Xử lý reset tất cả */
function handleReset() {
  if (!confirm(t('confirmReset'))) return;
  resetGameData();
  aiState = createAIState();
  newGame();
  showToast(t('toastReset'));
}

// ── Game Over ─────────────────────────────────────────────────

/**
 * Hiển thị màn hình kết thúc loạt
 * @param {string} winner - 'player' | 'ai' | 'draw'
 */
function showGameOver(winner) {
  const overlay = $('#game-over-overlay');
  if (!overlay) return;

  let emoji = '🤝';
  let titleText = t('gameDraw');
  let titleClass = 'draw';

  if (winner === 'player') {
    emoji = '🏆';
    titleText = t('youWin');
    titleClass = 'win';
    playGameOverSound('player');
    launchConfetti();
  } else if (winner === 'ai') {
    emoji = '😞';
    titleText = t('youLose');
    titleClass = 'lose';
    playGameOverSound('ai');
  }

  setText('#game-over-emoji', emoji);
  const titleEl = $('#game-over-title');
  if (titleEl) {
    titleEl.textContent = titleText;
    titleEl.className = `game-over-title ${titleClass}`;
  }
  setText('#game-over-sub', `${gameState.playerScore} – ${gameState.aiScore}`);
  setText('#play-again-btn', t('playAgain'));

  overlay.hidden = false;
  announceToScreenReader(titleText);
}

/** Ẩn màn hình game over */
function hideGameOver() {
  const overlay = $('#game-over-overlay');
  if (overlay) overlay.hidden = true;
}

// ── Theme & Ngôn ngữ ─────────────────────────────────────────

/** Toggle theme sáng/tối */
function toggleTheme() {
  const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  playClickSound();
}

/**
 * Áp dụng theme
 * @param {string} theme - 'dark' | 'light'
 * @param {boolean} noTransition - Tắt transition khi áp dụng lần đầu
 */
function applyTheme(theme, noTransition = false) {
  settings.theme = theme;
  saveSettings({ theme });

  if (noTransition) {
    document.body.classList.add('no-transition');
  }

  document.documentElement.setAttribute('data-theme', theme);

  if (noTransition) {
    requestAnimationFrame(() => {
      document.body.classList.remove('no-transition');
    });
  }

  // Cập nhật icon nút theme
  const themeBtn = $('#theme-btn');
  if (themeBtn) {
    themeBtn.innerHTML = theme === 'dark' ? svgIcon('icon-sun') : svgIcon('icon-moon');
    themeBtn.setAttribute('aria-label', t('themeToggle'));
  }
}

/** Toggle ngôn ngữ vi/en */
function toggleLang() {
  const newLang = settings.language === 'vi' ? 'en' : 'vi';
  settings.language = newLang;
  saveSettings({ language: newLang });
  renderAll();
  playClickSound();
}

// ── Chế độ & Độ khó ─────────────────────────────────────────

/**
 * Đặt chế độ chơi
 * @param {string} mode - GAME_MODES.*
 */
function setGameMode(mode) {
  if (!Object.values(GAME_MODES).includes(mode)) return;
  settings.gameMode = mode;
  saveSettings({ gameMode: mode });
  newGame();
  playClickSound();
}

/**
 * Đặt độ khó
 * @param {string} diff - 'easy' | 'medium' | 'hard'
 */
function setDifficulty(diff) {
  settings.difficulty = diff;
  saveSettings({ difficulty: diff });
  renderControls();
  playClickSound();
}

// ── Phím tắt ─────────────────────────────────────────────────

/**
 * Xử lý phím tắt
 * @param {KeyboardEvent} e
 */
function handleKeydown(e) {
  // Bỏ qua khi đang focus vào input
  if (e.target.tagName === 'INPUT') return;

  switch (e.key) {
    case '1': handlePlayerChoice(CHOICES.SCISSORS); break;
    case '2': handlePlayerChoice(CHOICES.ROCK); break;
    case '3': handlePlayerChoice(CHOICES.PAPER); break;
    case 'r': case 'R': replayRound(); break;
    case 'm': case 'M': {
      const soundToggle = $('#sound-toggle');
      if (soundToggle) {
        soundToggle.checked = !soundToggle.checked;
        soundToggle.dispatchEvent(new Event('change'));
      }
      break;
    }
    case 't': case 'T': toggleTheme(); break;
    case '?': showHelp(); break;
    case 'Escape': {
      const helpBackdrop = $('#help-backdrop');
      if (helpBackdrop && !helpBackdrop.hidden) hideHelp();
      const gameOverOverlay = $('#game-over-overlay');
      if (gameOverOverlay && !gameOverOverlay.hidden) {
        hideGameOver();
        newGame();
      }
      break;
    }
  }
}

// ── Help ─────────────────────────────────────────────────────

/** Hiển thị popover trợ giúp */
function showHelp() {
  const backdrop = $('#help-backdrop');
  if (!backdrop) return;

  // Render nội dung
  const popover = backdrop.querySelector('.help-popover');
  if (popover) {
    const keys = t('helpKeys');
    const shortcutsHtml = keys.map(([key, desc]) =>
      `<span class="shortcut-key">${key}</span><span>${desc}</span>`
    ).join('');

    popover.innerHTML = `
      <h2>${svgIcon('icon-help')} ${t('helpTitle')}</h2>
      <p style="font-size:0.85rem;color:var(--muted);margin-bottom:0.75rem;">${t('helpRules')}</p>
      <div class="shortcut-grid">${shortcutsHtml}</div>
      <button class="help-close-btn" id="help-close-btn">${t('closeHelp')}</button>
    `;
    popover.querySelector('#help-close-btn')?.addEventListener('click', hideHelp);
  }

  backdrop.hidden = false;
  playClickSound();
}

/** Ẩn popover trợ giúp */
function hideHelp() {
  const backdrop = $('#help-backdrop');
  if (backdrop) backdrop.hidden = true;
}

// ── Toast notification ───────────────────────────────────────

/**
 * Hiển thị thông báo toast ngắn
 * @param {string} message - Nội dung
 * @param {number} duration - Thời gian hiển thị (ms)
 */
function showToast(message, duration = 2500) {
  let toast = $('#toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ── Khởi chạy ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
