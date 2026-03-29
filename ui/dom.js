/**
 * ui/dom.js
 * Mục đích: Các helper query DOM và hàm render giao diện.
 * Tập trung cập nhật DOM để tránh layout thrashing.
 */

import { CHOICES, RESULTS, getChoiceLabel } from '../game/engine.js';

// ─── Query Helpers ───────────────────────────────────────────────────────────

/** Lấy một phần tử theo selector */
export const $ = (sel, root = document) => root.querySelector(sel);

/** Lấy nhiều phần tử theo selector */
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// ─── SVG Icon Helper ─────────────────────────────────────────────────────────

/**
 * Tạo thẻ SVG <use> để dùng icon từ sprite.
 * @param {string} id - ID của symbol (ví dụ: 'icon-rock')
 * @param {string} cls - Class CSS bổ sung
 * @returns {string} HTML string
 */
export function svgIcon(id, cls = '') {
  return `<svg class="icon ${cls}" aria-hidden="true" focusable="false">
    <use href="assets/icons.svg#${id}"></use>
  </svg>`;
}

// ─── Render Màn Hình Chơi ────────────────────────────────────────────────────

/**
 * Hiển thị lựa chọn của người chơi và AI trên thẻ kết quả.
 * @param {Object} params
 * @param {string} params.playerChoice
 * @param {string} params.aiChoice
 * @param {string} params.result - RESULTS.*
 * @param {string} params.lang - Ngôn ngữ hiện tại
 */
export function renderChoices({ playerChoice, aiChoice, result, lang = 'vi' }) {
  const playerCard = $('#player-card');
  const aiCard = $('#ai-card');
  const resultBanner = $('#result-banner');

  if (!playerCard || !aiCard) return;

  // Render icon lựa chọn
  playerCard.innerHTML = `
    <div class="choice-display">
      ${svgIcon(`icon-${playerChoice}`, 'choice-icon')}
      <span class="choice-label">${getChoiceLabel(playerChoice, lang)}</span>
    </div>
  `;

  aiCard.innerHTML = `
    <div class="choice-display">
      ${svgIcon(`icon-${aiChoice}`, 'choice-icon')}
      <span class="choice-label">${getChoiceLabel(aiChoice, lang)}</span>
    </div>
  `;

  // Xóa class cũ và thêm class kết quả
  playerCard.classList.remove('win', 'lose', 'draw');
  aiCard.classList.remove('win', 'lose', 'draw');

  if (result === RESULTS.WIN) {
    playerCard.classList.add('win');
    aiCard.classList.add('lose');
  } else if (result === RESULTS.LOSE) {
    playerCard.classList.add('lose');
    aiCard.classList.add('win');
  } else {
    playerCard.classList.add('draw');
    aiCard.classList.add('draw');
  }

  // Hiển thị banner kết quả (được cập nhật từ i18n bên ngoài)
  if (resultBanner) {
    resultBanner.classList.remove('hidden');
    resultBanner.classList.remove('result-win', 'result-lose', 'result-draw');
    resultBanner.classList.add(`result-${result}`);
  }
}

/**
 * Ẩn thẻ kết quả và banner.
 */
export function hideChoices() {
  const playerCard = $('#player-card');
  const aiCard = $('#ai-card');
  const resultBanner = $('#result-banner');

  if (playerCard) {
    playerCard.innerHTML = '';
    playerCard.classList.remove('win', 'lose', 'draw');
  }
  if (aiCard) {
    aiCard.innerHTML = '';
    aiCard.classList.remove('win', 'lose', 'draw');
  }
  if (resultBanner) {
    resultBanner.classList.add('hidden');
  }
}

// ─── Render Điểm Số ──────────────────────────────────────────────────────────

/**
 * Cập nhật bảng điểm.
 * @param {{ player: number, ai: number }} score
 * @param {Object} state - Trạng thái game đầy đủ
 * @param {number} target - Điểm mục tiêu
 */
export function renderScore(score, state, target) {
  const elPlayer = $('#score-player');
  const elAi = $('#score-ai');
  const elTotal = $('#total-games');
  const elWins = $('#total-wins');
  const elLosses = $('#total-losses');
  const elDraws = $('#total-draws');

  if (elPlayer) elPlayer.textContent = score.player;
  if (elAi) elAi.textContent = score.ai;
  if (elTotal) elTotal.textContent = state.totalGames ?? 0;
  if (elWins) elWins.textContent = state.totalWins ?? 0;
  if (elLosses) elLosses.textContent = state.totalLosses ?? 0;
  if (elDraws) elDraws.textContent = state.totalDraws ?? 0;

  // Cập nhật thanh tiến trình
  renderProgressBar(score, target);
}

/**
 * Render thanh tiến trình theo điểm hiện tại / mục tiêu.
 * @param {{ player: number, ai: number }} score
 * @param {number} target
 */
export function renderProgressBar(score, target) {
  const barPlayer = $('#progress-player');
  const barAi = $('#progress-ai');
  const targetEl = $('.target-score');

  if (target <= 0) return;

  const pPct = Math.min(100, (score.player / target) * 100);
  const aPct = Math.min(100, (score.ai / target) * 100);

  if (barPlayer) barPlayer.style.width = `${pPct}%`;
  if (barAi) barAi.style.width = `${aPct}%`;
  if (targetEl) targetEl.textContent = target;
}

// ─── Render Lịch Sử ──────────────────────────────────────────────────────────

/**
 * Render danh sách lịch sử các lượt gần nhất.
 * @param {Array} history - Mảng lượt [{playerChoice, aiChoice, result}]
 * @param {string} lang - Ngôn ngữ
 * @param {Object} i18n - Đối tượng chuỗi dịch
 */
export function renderHistory(history, lang = 'vi', i18n = {}) {
  const list = $('#history-list');
  if (!list) return;

  const recent = history.slice(-10).reverse();

  if (recent.length === 0) {
    list.innerHTML = `<li class="history-empty">${i18n.noHistory ?? 'Chưa có lượt nào'}</li>`;
    return;
  }

  list.innerHTML = recent.map((round, idx) => {
    const resultClass = round.result === RESULTS.WIN ? 'win'
      : round.result === RESULTS.LOSE ? 'lose' : 'draw';
    const resultLabel = round.result === RESULTS.WIN
      ? (i18n.win ?? 'Thắng')
      : round.result === RESULTS.LOSE ? (i18n.lose ?? 'Thua') : (i18n.draw ?? 'Hòa');

    return `
      <li class="history-item history-${resultClass}" aria-label="${resultLabel}">
        <span class="h-num">${recent.length - idx}</span>
        <span class="h-icons">
          ${svgIcon(`icon-${round.playerChoice}`, 'h-icon')}
          <span class="h-vs">vs</span>
          ${svgIcon(`icon-${round.aiChoice}`, 'h-icon')}
        </span>
        <span class="h-result badge-${resultClass}">${resultLabel}</span>
      </li>
    `;
  }).join('');
}

// ─── Vòng đếm ngược ──────────────────────────────────────────────────────────

/**
 * Hiển thị đếm ngược 3-2-1 rồi gọi callback.
 * @param {HTMLElement} container - Phần tử chứa đếm ngược
 * @param {Function} onDone - Callback sau khi đếm xong
 * @param {boolean} enabled - Có hiệu ứng đếm ngược không
 */
export function countdown(container, onDone, enabled = true) {
  if (!enabled || !container) {
    onDone();
    return;
  }

  let count = 3;
  container.textContent = count;
  container.classList.remove('hidden');
  container.classList.add('counting');

  const interval = setInterval(() => {
    count--;
    if (count <= 0) {
      clearInterval(interval);
      container.classList.remove('counting');
      container.classList.add('hidden');
      container.textContent = '';
      onDone();
    } else {
      container.textContent = count;
    }
  }, 800);
}

// ─── Modal & Thông Báo ────────────────────────────────────────────────────────

/**
 * Hiển thị modal thông báo kết thúc loạt.
 * @param {string} winnerText - Văn bản thông báo
 * @param {Function} onPlayAgain - Callback khi nhấn "Chơi lại"
 */
export function showSeriesModal(winnerText, onPlayAgain) {
  const modal = $('#series-modal');
  const msg = $('#series-modal-msg');
  const btn = $('#series-modal-btn');

  if (!modal) return;
  if (msg) msg.textContent = winnerText;
  if (btn) {
    btn.onclick = () => {
      modal.classList.add('hidden');
      onPlayAgain();
    };
  }
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  btn?.focus();
}

/**
 * Ẩn modal kết thúc loạt.
 */
export function hideSeriesModal() {
  const modal = $('#series-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }
}

/**
 * Cập nhật live region để screen reader đọc kết quả.
 * @param {string} text
 */
export function announceResult(text) {
  const region = $('#live-region');
  if (region) {
    region.textContent = '';
    // Delay nhỏ để đảm bảo screen reader nhận sự thay đổi
    requestAnimationFrame(() => {
      region.textContent = text;
    });
  }
}

/**
 * Cập nhật số vòng hiện tại.
 * @param {number} current
 * @param {number} target
 */
export function renderRoundInfo(current, target, modeLabel = '') {
  const el = $('#round-info');
  if (el) {
    el.textContent = modeLabel ? `${modeLabel} · ${current}/${target}` : `${current}/${target}`;
  }
}

/**
 * Vô hiệu hóa / kích hoạt các nút lựa chọn.
 * @param {boolean} disabled
 */
export function setChoiceButtonsDisabled(disabled) {
  $$('.choice-btn').forEach(btn => {
    btn.disabled = disabled;
    btn.setAttribute('aria-disabled', String(disabled));
  });
}
