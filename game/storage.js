/**
 * game/storage.js
 * Mục đích: Quản lý localStorage – lưu điểm, lịch sử, cấu hình game.
 * Fallback graceful khi localStorage bị chặn (private browsing một số browser).
 */

// Khóa chính trong localStorage
const KEY_STATE = 'kbb_state';
const KEY_CONFIG = 'kbb_config';
const KEY_HISTORY = 'kbb_history';

// Số lượt lịch sử tối đa lưu trữ
const MAX_HISTORY = 20;

/**
 * Kiểm tra localStorage có khả dụng không.
 * @returns {boolean}
 */
function isStorageAvailable() {
  try {
    const test = '__kbb_test__';
    localStorage.setItem(test, '1');
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// Bộ nhớ dự phòng trong RAM khi localStorage bị chặn
const memoryFallback = {};

/**
 * Lấy giá trị từ storage.
 * @param {string} key
 * @returns {any|null}
 */
function storageGet(key) {
  try {
    if (isStorageAvailable()) {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    }
    return memoryFallback[key] ?? null;
  } catch {
    return null;
  }
}

/**
 * Lưu giá trị vào storage.
 * @param {string} key
 * @param {any} value
 */
function storageSet(key, value) {
  try {
    const serialized = JSON.stringify(value);
    if (isStorageAvailable()) {
      localStorage.setItem(key, serialized);
    } else {
      memoryFallback[key] = value;
    }
  } catch {
    // Bỏ qua lỗi (ví dụ: storage đầy)
  }
}

/**
 * Xóa giá trị khỏi storage.
 * @param {string} key
 */
function storageRemove(key) {
  try {
    if (isStorageAvailable()) {
      localStorage.removeItem(key);
    } else {
      delete memoryFallback[key];
    }
  } catch {
    // Bỏ qua
  }
}

// ─── API Công khai ──────────────────────────────────────────────────────────

/**
 * Lưu trạng thái game (điểm số, loạt đấu hiện tại).
 * @param {Object} state - Trạng thái game từ engine.js
 */
export function saveState(state) {
  storageSet(KEY_STATE, {
    score: state.score,
    mode: state.mode,
    firstToN: state.firstToN,
    totalGames: state.totalGames,
    totalWins: state.totalWins,
    totalLosses: state.totalLosses,
    totalDraws: state.totalDraws,
    seriesOver: state.seriesOver,
    seriesWinner: state.seriesWinner,
    // Không lưu toàn bộ rounds (quá lớn) – chỉ lưu qua KEY_HISTORY
  });
}

/**
 * Tải trạng thái game đã lưu.
 * @returns {Object|null}
 */
export function loadState() {
  return storageGet(KEY_STATE);
}

/**
 * Lưu lịch sử lượt chơi (tối đa MAX_HISTORY lượt gần nhất).
 * @param {Array} history - Mảng lượt chơi [{playerChoice, aiChoice, result, timestamp}]
 */
export function saveHistory(history) {
  storageSet(KEY_HISTORY, history.slice(-MAX_HISTORY));
}

/**
 * Tải lịch sử lượt chơi.
 * @returns {Array}
 */
export function loadHistory() {
  return storageGet(KEY_HISTORY) ?? [];
}

/**
 * Thêm một lượt vào lịch sử và lưu.
 * @param {Object} round - { playerChoice, aiChoice, result, timestamp }
 * @returns {Array} Lịch sử mới
 */
export function appendHistory(round) {
  const history = loadHistory();
  history.push(round);
  saveHistory(history);
  return history.slice(-MAX_HISTORY);
}

/**
 * Lưu cấu hình người dùng (theme, âm thanh, ngôn ngữ, độ khó, chế độ, hiệu ứng).
 * @param {Object} config
 */
export function saveConfig(config) {
  storageSet(KEY_CONFIG, config);
}

/**
 * Tải cấu hình người dùng.
 * @returns {Object} Cấu hình (có giá trị mặc định nếu chưa lưu)
 */
export function loadConfig() {
  const saved = storageGet(KEY_CONFIG);
  return {
    theme: 'dark',
    sound: true,
    fx: true,
    lang: 'vi',
    difficulty: 'medium',
    mode: 'quick',
    firstToN: 3,
    ...saved,
  };
}

/**
 * Xóa toàn bộ dữ liệu game (điểm, lịch sử, cấu hình).
 * Giữ lại cấu hình người dùng trừ khi resetAll = true.
 * @param {boolean} resetAll - Nếu true, xóa cả cấu hình
 */
export function clearAllData(resetAll = false) {
  storageRemove(KEY_STATE);
  storageRemove(KEY_HISTORY);
  if (resetAll) {
    storageRemove(KEY_CONFIG);
  }
}
