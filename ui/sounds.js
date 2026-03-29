/**
 * ui/sounds.js
 * Mục đích: Quản lý âm thanh game – click, thắng, thua, hòa.
 * Sử dụng Web Audio API để tạo âm thanh tổng hợp (không cần file .mp3).
 * Fallback: nếu không hỗ trợ AudioContext, im lặng hoàn toàn.
 */

// ─── Trạng thái module ────────────────────────────────────────────────────────

let soundEnabled = true;
let audioCtx = null;

// ─── Khởi tạo AudioContext ────────────────────────────────────────────────────

/**
 * Lấy (hoặc tạo mới) AudioContext.
 * Cần gọi sau user gesture để tuân thủ autoplay policy.
 * @returns {AudioContext|null}
 */
function getAudioCtx() {
  if (audioCtx) return audioCtx;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  } catch {
    return null;
  }
}

// ─── Toggle âm thanh ─────────────────────────────────────────────────────────

export function setSoundEnabled(enabled) {
  soundEnabled = Boolean(enabled);
}

export function isSoundEnabled() {
  return soundEnabled;
}

// ─── Hàm tạo âm thanh tổng hợp ───────────────────────────────────────────────

/**
 * Phát một tone ngắn bằng Web Audio API.
 * @param {number} frequency - Tần số (Hz)
 * @param {number} duration - Thời lượng (giây)
 * @param {'sine'|'square'|'triangle'|'sawtooth'} type - Dạng sóng
 * @param {number} volume - Âm lượng (0–1)
 * @param {number[]} [freqs] - Dãy tần số (cho âm thanh phức hợp)
 */
function playTone(frequency, duration, type = 'sine', volume = 0.3, freqs = null) {
  if (!soundEnabled) return;
  const ctx = getAudioCtx();
  if (!ctx) return;

  // Resume context nếu đang suspended (autoplay policy)
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;
  const gainNode = ctx.createGain();
  gainNode.connect(ctx.destination);
  gainNode.gain.setValueAtTime(volume, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

  // Nếu có nhiều tần số, tạo nhiều oscillator
  const toneList = freqs ?? [frequency];
  toneList.forEach(f => {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(f, now);
    osc.connect(gainNode);
    osc.start(now);
    osc.stop(now + duration);
  });
}

// ─── Âm thanh game cụ thể ────────────────────────────────────────────────────

/**
 * Âm thanh click nút – tiếng "tích" ngắn.
 */
export function playClick() {
  playTone(800, 0.08, 'square', 0.15);
}

/**
 * Âm thanh đếm ngược – tiếng "bíp" nhẹ.
 * @param {number} count - Số đếm (3, 2, 1)
 */
export function playCountdown(count) {
  const freqs = { 3: 440, 2: 520, 1: 660 };
  playTone(freqs[count] ?? 440, 0.12, 'sine', 0.2);
}

/**
 * Âm thanh thắng – giai điệu vui ngắn (3 nốt lên).
 */
export function playWin() {
  if (!soundEnabled) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});

  const now = ctx.currentTime;
  const notes = [523, 659, 784]; // C5, E5, G5
  notes.forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = f;
    const start = now + i * 0.12;
    gain.gain.setValueAtTime(0.3, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
    osc.start(start);
    osc.stop(start + 0.2);
  });
}

/**
 * Âm thanh thua – giai điệu buồn ngắn (3 nốt xuống).
 */
export function playLose() {
  if (!soundEnabled) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});

  const now = ctx.currentTime;
  const notes = [392, 330, 262]; // G4, E4, C4 (đi xuống)
  notes.forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.value = f;
    const start = now + i * 0.13;
    gain.gain.setValueAtTime(0.2, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
    osc.start(start);
    osc.stop(start + 0.18);
  });
}

/**
 * Âm thanh hòa – hai nốt giống nhau nối tiếp.
 */
export function playDraw() {
  if (!soundEnabled) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});

  const now = ctx.currentTime;
  [0, 0.15].forEach(delay => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.value = 440;
    const start = now + delay;
    gain.gain.setValueAtTime(0.2, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
    osc.start(start);
    osc.stop(start + 0.15);
  });
}

/**
 * Âm thanh mừng thắng loạt – fanfare ngắn.
 */
export function playSeriesWin() {
  if (!soundEnabled) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});

  const now = ctx.currentTime;
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  notes.forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = f;
    const start = now + i * 0.1;
    gain.gain.setValueAtTime(0.35, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
    osc.start(start);
    osc.stop(start + 0.25);
  });
}

/**
 * Phát âm thanh tương ứng kết quả.
 * @param {string} result - 'win' | 'lose' | 'draw'
 */
export function playResult(result) {
  if (result === 'win') playWin();
  else if (result === 'lose') playLose();
  else playDraw();
}
