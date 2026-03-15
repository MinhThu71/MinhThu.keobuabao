/**
 * dom.js - Helpers DOM và render utilities
 * Quản lý query selector, tạo phần tử, và cập nhật giao diện
 */

import { getChoiceIcon, getChoiceLabel, CHOICES } from '../game/engine.js';

// Cache các phần tử DOM thường dùng
let _cache = {};

/**
 * Lấy phần tử DOM theo selector, có cache
 * @param {string} selector - CSS selector
 * @param {boolean} fresh - Bỏ qua cache và query lại
 * @returns {Element|null}
 */
export function $(selector, fresh = false) {
  if (!fresh && _cache[selector]) return _cache[selector];
  const el = document.querySelector(selector);
  if (el) _cache[selector] = el;
  return el;
}

/**
 * Lấy tất cả phần tử DOM theo selector
 * @param {string} selector - CSS selector
 * @param {Element} root - Phần tử gốc (mặc định document)
 * @returns {NodeList}
 */
export function $$(selector, root = document) {
  return root.querySelectorAll(selector);
}

/**
 * Xóa cache DOM (gọi khi cần refresh)
 */
export function clearDOMCache() {
  _cache = {};
}

/**
 * Tạo SVG use element để hiển thị icon từ sprite
 * @param {string} iconId - ID của symbol SVG (ví dụ: 'icon-rock')
 * @param {string} className - CSS class
 * @returns {string} HTML string
 */
export function svgIcon(iconId, className = '') {
  return `<svg class="icon ${className}" aria-hidden="true" focusable="false">
    <use href="assets/icons.svg#${iconId}"></use>
  </svg>`;
}

/**
 * Render nội dung bên trong thẻ lựa chọn (không bao gồm wrapper div)
 * @param {string|null} choice - CHOICES.* hoặc null (chưa chọn)
 * @param {string} lang - Ngôn ngữ
 * @param {boolean} isPlayer - true = người chơi, false = AI
 * @returns {string} HTML string (nội dung bên trong card)
 */
export function renderChoiceCard(choice, lang = 'vi', isPlayer = true) {
  const iconId = choice ? getChoiceIcon(choice) : null;
  const label = choice ? getChoiceLabel(choice, lang) : '–';
  const role = isPlayer
    ? (lang === 'vi' ? 'Người chơi' : 'Player')
    : (lang === 'vi' ? 'Máy' : 'Computer');

  return `
    <div class="choice-icon-wrap">
      ${iconId
        ? `<svg class="icon icon-xl choice-icon" aria-hidden="true" focusable="false">
             <use href="assets/icons.svg#${iconId}"></use>
           </svg>`
        : '<div class="choice-placeholder" aria-hidden="true">?</div>'}
    </div>
    <div class="choice-meta">
      <span class="choice-role">${role}</span>
      <span class="choice-label">${label}</span>
    </div>
  `;
}

/**
 * Render một dòng lịch sử
 * @param {Object} entry - { playerChoice, aiChoice, result, roundNumber }
 * @param {string} lang - Ngôn ngữ
 * @returns {string} HTML string
 */
export function renderHistoryRow(entry, lang = 'vi') {
  const { playerChoice, aiChoice, result } = entry;
  const resultLabels = {
    vi: { win: 'Thắng', lose: 'Thua', draw: 'Hòa' },
    en: { win: 'Win', lose: 'Lose', draw: 'Draw' },
  };
  const resultClass = { win: 'result-win', lose: 'result-lose', draw: 'result-draw' };
  const labels = resultLabels[lang] || resultLabels.vi;

  return `
    <div class="history-row" role="listitem">
      <svg class="icon icon-sm" aria-label="${getChoiceLabel(playerChoice, lang)}">
        <use href="assets/icons.svg#${getChoiceIcon(playerChoice)}"></use>
      </svg>
      <span class="history-vs">vs</span>
      <svg class="icon icon-sm" aria-label="${getChoiceLabel(aiChoice, lang)}">
        <use href="assets/icons.svg#${getChoiceIcon(aiChoice)}"></use>
      </svg>
      <span class="history-result ${resultClass[result]}">${labels[result]}</span>
    </div>
  `;
}

/**
 * Cập nhật nội dung text của phần tử
 * @param {string} selector - CSS selector
 * @param {string} text - Nội dung mới
 */
export function setText(selector, text) {
  const el = $(selector);
  if (el) el.textContent = text;
}

/**
 * Cập nhật innerHTML của phần tử
 * @param {string} selector - CSS selector
 * @param {string} html - HTML mới
 */
export function setHTML(selector, html) {
  const el = $(selector);
  if (el) el.innerHTML = html;
}

/**
 * Toggle class trên phần tử
 * @param {Element|string} elOrSelector - Phần tử hoặc selector
 * @param {string} className - Tên class
 * @param {boolean} force - Bắt buộc thêm/bỏ
 */
export function toggleClass(elOrSelector, className, force) {
  const el = typeof elOrSelector === 'string' ? $(elOrSelector) : elOrSelector;
  if (el) el.classList.toggle(className, force);
}

/**
 * Render thanh tiến trình (progress bar)
 * @param {number} current - Điểm hiện tại
 * @param {number} target - Mục tiêu
 * @returns {{ percent: number, clamped: number }}
 */
export function calcProgress(current, target) {
  if (!target || target <= 0) return { percent: 0, clamped: 0 };
  const percent = Math.min(100, Math.round((current / target) * 100));
  return { percent, clamped: Math.min(current, target) };
}

/**
 * Cập nhật thanh tiến trình trong DOM
 * @param {string} barSelector - Selector của fill element
 * @param {number} current - Điểm hiện tại
 * @param {number} target - Mục tiêu
 */
export function updateProgressBar(barSelector, current, target) {
  const bar = $(barSelector);
  if (!bar) return;
  const { percent } = calcProgress(current, target);
  bar.style.width = `${percent}%`;
  bar.setAttribute('aria-valuenow', current);
  bar.setAttribute('aria-valuemax', target);
}

/**
 * Thêm lớp tạm thời vào phần tử (rồi tự xóa)
 * @param {Element} el - Phần tử
 * @param {string} className - Tên class
 * @param {number} duration - Thời gian (ms)
 */
export function addTempClass(el, className, duration = 1000) {
  if (!el) return;
  el.classList.add(className);
  setTimeout(() => el.classList.remove(className), duration);
}

/**
 * Hiển thị/ẩn phần tử
 * @param {string} selector - CSS selector
 * @param {boolean} visible - true = hiển thị
 */
export function setVisible(selector, visible) {
  const el = $(selector);
  if (!el) return;
  if (visible) {
    el.removeAttribute('hidden');
    el.style.display = '';
  } else {
    el.setAttribute('hidden', '');
  }
}

/**
 * Tạo thông báo live region cho screen reader
 * @param {string} message - Thông báo
 */
export function announceToScreenReader(message) {
  const liveRegion = $('#live-region');
  if (!liveRegion) return;
  liveRegion.textContent = '';
  // Dùng setTimeout để đảm bảo screen reader đọc lại
  setTimeout(() => {
    liveRegion.textContent = message;
  }, 50);
}
