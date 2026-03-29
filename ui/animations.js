/**
 * ui/animations.js
 * Mục đích: Quản lý hiệu ứng CSS/JS – thắng (glow + confetti), thua (shake), hòa (pulse).
 * Input: kết quả lượt chơi, tham chiếu phần tử DOM
 * Output: hiệu ứng trực quan ngắn (~300ms–2s)
 */

import { RESULTS } from '../game/engine.js';

// ─── Toggle Hiệu ứng ─────────────────────────────────────────────────────────

/** Biến toàn cục module: có bật hiệu ứng không */
let fxEnabled = true;

export function setFxEnabled(enabled) {
  fxEnabled = enabled;
}
export function isFxEnabled() {
  return fxEnabled;
}

// ─── Trigger Animation ────────────────────────────────────────────────────────

/**
 * Kích hoạt hiệu ứng phù hợp với kết quả lượt chơi.
 * @param {string} result - RESULTS.*
 * @param {HTMLElement} playerCard - Thẻ người chơi
 * @param {HTMLElement} aiCard - Thẻ AI
 */
export function triggerResultAnimation(result, playerCard, aiCard) {
  if (!fxEnabled) return;

  if (result === RESULTS.WIN) {
    applyGlow(playerCard);
    applyShake(aiCard);
    launchConfetti();
  } else if (result === RESULTS.LOSE) {
    applyShake(playerCard);
    applyGlow(aiCard);
  } else {
    applyPulse(playerCard);
    applyPulse(aiCard);
  }
}

// ─── Hiệu ứng từng Card ──────────────────────────────────────────────────────

/**
 * Hiệu ứng "glow" – viền sáng khi thắng.
 * @param {HTMLElement} el
 */
export function applyGlow(el) {
  if (!el || !fxEnabled) return;
  el.classList.remove('anim-glow', 'anim-shake', 'anim-pulse');
  // Force reflow để restart animation
  void el.offsetWidth;
  el.classList.add('anim-glow');
  el.addEventListener('animationend', () => el.classList.remove('anim-glow'), { once: true });
}

/**
 * Hiệu ứng "shake" – rung nhẹ khi thua.
 * @param {HTMLElement} el
 */
export function applyShake(el) {
  if (!el || !fxEnabled) return;
  el.classList.remove('anim-glow', 'anim-shake', 'anim-pulse');
  void el.offsetWidth;
  el.classList.add('anim-shake');
  el.addEventListener('animationend', () => el.classList.remove('anim-shake'), { once: true });
}

/**
 * Hiệu ứng "pulse" – nhịp đập khi hòa.
 * @param {HTMLElement} el
 */
export function applyPulse(el) {
  if (!el || !fxEnabled) return;
  el.classList.remove('anim-glow', 'anim-shake', 'anim-pulse');
  void el.offsetWidth;
  el.classList.add('anim-pulse');
  el.addEventListener('animationend', () => el.classList.remove('anim-pulse'), { once: true });
}

// ─── Confetti ─────────────────────────────────────────────────────────────────

/** Số mảnh confetti */
const CONFETTI_COUNT = 35;

/** Màu confetti */
const CONFETTI_COLORS = [
  '#22d3ee', '#34d399', '#fbbf24', '#fb7185',
  '#a78bfa', '#f472b6', '#60a5fa',
];

/**
 * Tạo hiệu ứng confetti nhẹ bằng CSS animation.
 * Tạo các phần tử <div> tạm thời rồi tự xóa sau khi animation xong.
 */
export function launchConfetti() {
  if (!fxEnabled) return;

  const container = document.getElementById('confetti-container');
  if (!container) return;

  // Xóa confetti cũ
  container.innerHTML = '';

  for (let i = 0; i < CONFETTI_COUNT; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';

    // Vị trí ngang ngẫu nhiên
    const x = Math.random() * 100;
    // Màu ngẫu nhiên
    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    // Kích thước ngẫu nhiên
    const size = 6 + Math.random() * 8;
    // Thời gian rơi
    const duration = 1000 + Math.random() * 1000;
    // Delay nhỏ để phân tán
    const delay = Math.random() * 400;
    // Xoay
    const rotation = Math.random() * 360;
    // Hình dạng (vuông hoặc tròn)
    const isCircle = Math.random() > 0.5;

    Object.assign(piece.style, {
      left: `${x}%`,
      backgroundColor: color,
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: isCircle ? '50%' : '2px',
      animationDuration: `${duration}ms`,
      animationDelay: `${delay}ms`,
      transform: `rotate(${rotation}deg)`,
    });

    container.appendChild(piece);
  }

  // Tự động dọn dẹp sau 2.5 giây
  setTimeout(() => {
    container.innerHTML = '';
  }, 2500);
}

// ─── Button Click Ripple ──────────────────────────────────────────────────────

/**
 * Hiệu ứng ripple khi nhấn nút chọn.
 * @param {HTMLElement} btn
 * @param {MouseEvent|TouchEvent} event
 */
export function applyButtonRipple(btn, event) {
  if (!btn || !fxEnabled) return;

  const ripple = document.createElement('span');
  ripple.className = 'btn-ripple';

  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = (event.clientX || rect.left + rect.width / 2) - rect.left - size / 2;
  const y = (event.clientY || rect.top + rect.height / 2) - rect.top - size / 2;

  Object.assign(ripple.style, {
    width: `${size}px`,
    height: `${size}px`,
    left: `${x}px`,
    top: `${y}px`,
  });

  btn.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
}

// ─── Series Win Celebration ────────────────────────────────────────────────────

/**
 * Hiệu ứng mừng khi kết thúc loạt (mạnh hơn confetti thường).
 */
export function celebrateSeries() {
  if (!fxEnabled) return;
  // Bắn nhiều confetti hơn và lặp 2 lần
  launchConfetti();
  setTimeout(launchConfetti, 600);
}
