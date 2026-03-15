/**
 * animations.js - Quản lý hiệu ứng giao diện
 * Hiệu ứng thắng (glow + confetti), thua (shake), hòa (pulse)
 */

// Trạng thái: có bật hiệu ứng không
let animEnabled = true;

/**
 * Bật/tắt hiệu ứng animation
 * @param {boolean} enabled
 */
export function setAnimEnabled(enabled) {
  animEnabled = enabled;
}

/**
 * Lấy trạng thái hiệu ứng
 * @returns {boolean}
 */
export function isAnimEnabled() {
  return animEnabled;
}

/**
 * Áp dụng hiệu ứng thắng lên card
 * @param {Element} el - Phần tử thẻ người thắng
 */
export function animateWin(el) {
  if (!animEnabled || !el) return;
  el.classList.remove('anim-shake', 'anim-pulse');
  el.classList.add('anim-glow');
  setTimeout(() => el.classList.remove('anim-glow'), 1500);
}

/**
 * Áp dụng hiệu ứng thua lên card
 * @param {Element} el - Phần tử thẻ người thua
 */
export function animateLose(el) {
  if (!animEnabled || !el) return;
  el.classList.remove('anim-glow', 'anim-pulse');
  el.classList.add('anim-shake');
  setTimeout(() => el.classList.remove('anim-shake'), 600);
}

/**
 * Áp dụng hiệu ứng hòa lên cả hai card
 * @param {Element} el1 - Phần tử thứ nhất
 * @param {Element} el2 - Phần tử thứ hai
 */
export function animateDraw(el1, el2) {
  if (!animEnabled) return;
  [el1, el2].forEach(el => {
    if (!el) return;
    el.classList.remove('anim-glow', 'anim-shake');
    el.classList.add('anim-pulse');
    setTimeout(() => el.classList.remove('anim-pulse'), 900);
  });
}

// ─────────────────────────────────────────────
// Confetti đơn giản bằng Canvas
// ─────────────────────────────────────────────

/** Số mảnh confetti */
const CONFETTI_COUNT = 60;

/**
 * Tạo mảnh confetti
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @returns {Object} Mảnh confetti
 */
function createParticle(canvasWidth, canvasHeight) {
  const colors = ['#22d3ee', '#34d399', '#fbbf24', '#fb7185', '#a78bfa', '#fff'];
  return {
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight - canvasHeight,
    w: Math.random() * 10 + 5,
    h: Math.random() * 6 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 6,
    speedY: Math.random() * 3 + 2,
    speedX: (Math.random() - 0.5) * 3,
    opacity: 1,
  };
}

/**
 * Hiệu ứng confetti (1–2 giây) khi thắng
 * Tạo canvas overlay tạm thời
 */
export function launchConfetti() {
  if (!animEnabled) return;

  // Tạo canvas overlay
  const canvas = document.createElement('canvas');
  canvas.style.cssText = `
    position: fixed; top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none; z-index: 9999;
  `;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const particles = Array.from({ length: CONFETTI_COUNT }, () =>
    createParticle(canvas.width, canvas.height)
  );

  let startTime = null;
  const DURATION = 1800; // ms

  /**
   * Vẽ một frame confetti
   * @param {number} timestamp
   */
  function draw(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fade out dần cuối animation
    const fadeRatio = elapsed > DURATION * 0.7
      ? 1 - (elapsed - DURATION * 0.7) / (DURATION * 0.3)
      : 1;

    particles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotationSpeed;
      p.opacity = Math.max(0, fadeRatio);

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    if (elapsed < DURATION) {
      requestAnimationFrame(draw);
    } else {
      // Xóa canvas sau khi xong
      canvas.remove();
    }
  }

  requestAnimationFrame(draw);
}

// ─────────────────────────────────────────────
// Đếm ngược 3-2-1
// ─────────────────────────────────────────────

/**
 * Hiển thị đếm ngược 3-2-1 trước khi chơi
 * @param {Element} overlayEl - Phần tử hiển thị đếm ngược
 * @param {Function} onDone - Callback khi đếm xong
 */
export function showCountdown(overlayEl, onDone) {
  if (!animEnabled || !overlayEl) {
    if (onDone) onDone();
    return;
  }

  const counts = ['3', '2', '1'];
  let i = 0;

  overlayEl.hidden = false;
  overlayEl.classList.add('countdown-active');

  function tick() {
    if (i >= counts.length) {
      overlayEl.hidden = true;
      overlayEl.classList.remove('countdown-active');
      if (onDone) onDone();
      return;
    }
    overlayEl.textContent = counts[i];
    overlayEl.classList.remove('countdown-tick');
    // Trigger reflow để restart animation
    void overlayEl.offsetWidth;
    overlayEl.classList.add('countdown-tick');
    i++;
    setTimeout(tick, 700);
  }

  tick();
}

/**
 * Hiệu ứng xuất hiện (fade-in + scale) cho card kết quả
 * @param {Element} el - Phần tử cần animate
 */
export function animateReveal(el) {
  if (!animEnabled || !el) return;
  el.classList.remove('anim-reveal');
  void el.offsetWidth; // Trigger reflow
  el.classList.add('anim-reveal');
}
