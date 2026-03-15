/**
 * sounds.js - Quản lý âm thanh game
 * Tạo âm thanh ngắn bằng Web Audio API (không cần file .mp3)
 * Có toggle bật/tắt âm thanh
 */

// Trạng thái âm thanh
let soundEnabled = true;
let audioCtx = null;

/**
 * Lấy hoặc tạo AudioContext (lazy init để tránh lỗi autoplay policy)
 * @returns {AudioContext|null}
 */
function getAudioCtx() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

/**
 * Resume AudioContext nếu bị suspended (do browser policy)
 */
async function resumeCtx() {
  const ctx = getAudioCtx();
  if (ctx && ctx.state === 'suspended') {
    await ctx.resume();
  }
  return ctx;
}

/**
 * Bật/tắt âm thanh
 * @param {boolean} enabled
 */
export function setSoundEnabled(enabled) {
  soundEnabled = enabled;
}

/**
 * Lấy trạng thái âm thanh
 * @returns {boolean}
 */
export function isSoundEnabled() {
  return soundEnabled;
}

/**
 * Phát âm thanh tổng hợp đơn giản (oscillator)
 * @param {Object} options - Tùy chọn âm thanh
 * @param {string} options.type - Dạng sóng: 'sine' | 'square' | 'sawtooth' | 'triangle'
 * @param {number} options.frequency - Tần số Hz
 * @param {number} options.duration - Thời gian (giây)
 * @param {number} options.gainStart - Biên độ ban đầu [0..1]
 * @param {number} options.gainEnd - Biên độ kết thúc [0..1]
 * @param {number[]} options.freqSeq - Chuỗi tần số (để tạo melody)
 */
async function playTone(options) {
  if (!soundEnabled) return;
  const ctx = await resumeCtx();
  if (!ctx) return;

  const {
    type = 'sine',
    frequency = 440,
    duration = 0.15,
    gainStart = 0.3,
    gainEnd = 0,
    freqSeq = null,
  } = options;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = type;

  const now = ctx.currentTime;

  if (freqSeq && freqSeq.length > 0) {
    // Phát chuỗi note
    const noteDuration = duration / freqSeq.length;
    oscillator.frequency.setValueAtTime(freqSeq[0], now);
    freqSeq.forEach((freq, i) => {
      oscillator.frequency.setValueAtTime(freq, now + i * noteDuration);
    });
  } else {
    oscillator.frequency.setValueAtTime(frequency, now);
  }

  gainNode.gain.setValueAtTime(gainStart, now);
  gainNode.gain.exponentialRampToValueAtTime(
    Math.max(gainEnd, 0.001),
    now + duration
  );

  oscillator.start(now);
  oscillator.stop(now + duration);
}

/**
 * Âm click khi nhấn nút chọn
 */
export function playClickSound() {
  playTone({
    type: 'sine',
    frequency: 880,
    duration: 0.08,
    gainStart: 0.2,
    gainEnd: 0,
  });
}

/**
 * Âm thắng: giai điệu vui
 */
export function playWinSound() {
  playTone({
    type: 'triangle',
    freqSeq: [523, 659, 784, 1047],
    duration: 0.5,
    gainStart: 0.35,
    gainEnd: 0,
  });
}

/**
 * Âm thua: giai điệu buồn
 */
export function playLoseSound() {
  playTone({
    type: 'sawtooth',
    freqSeq: [400, 300, 220],
    duration: 0.45,
    gainStart: 0.25,
    gainEnd: 0,
  });
}

/**
 * Âm hòa: trung tính
 */
export function playDrawSound() {
  playTone({
    type: 'sine',
    freqSeq: [440, 440],
    duration: 0.3,
    gainStart: 0.2,
    gainEnd: 0,
  });
}

/**
 * Âm khi game kết thúc (toàn loạt)
 * @param {string} winner - 'player' | 'ai'
 */
export function playGameOverSound(winner) {
  if (winner === 'player') {
    playTone({
      type: 'triangle',
      freqSeq: [523, 659, 784, 1047, 1319],
      duration: 0.8,
      gainStart: 0.4,
      gainEnd: 0,
    });
  } else {
    playTone({
      type: 'sawtooth',
      freqSeq: [440, 330, 220, 165],
      duration: 0.7,
      gainStart: 0.3,
      gainEnd: 0,
    });
  }
}

/**
 * Âm đếm ngược
 */
export function playCountdownSound() {
  playTone({
    type: 'sine',
    frequency: 660,
    duration: 0.12,
    gainStart: 0.15,
    gainEnd: 0,
  });
}
