/**
 * storage.js - Quản lý localStorage
 * Lưu và khôi phục điểm số, lịch sử, và cài đặt người dùng
 */

// Prefix key để tránh xung đột với trang khác
const KEY_PREFIX = 'kbb_';
const KEYS = {
  TOTAL_STATS: KEY_PREFIX + 'totalStats',
  HISTORY: KEY_PREFIX + 'history',
  SETTINGS: KEY_PREFIX + 'settings',
  AI_STATE: KEY_PREFIX + 'aiState',
};

/**
 * Cài đặt mặc định
 */
const DEFAULT_SETTINGS = {
  theme: 'dark',          // 'dark' | 'light'
  language: 'vi',         // 'vi' | 'en'
  difficulty: 'medium',   // 'easy' | 'medium' | 'hard'
  gameMode: 'single',     // 'single' | 'bo3' | 'bo5' | 'firstToN'
  targetN: 3,             // Mục tiêu điểm cho First to N
  soundEnabled: true,     // Bật/tắt âm thanh
  animEnabled: true,      // Bật/tắt hiệu ứng
};

/**
 * Thống kê tổng ban đầu
 */
const DEFAULT_TOTAL_STATS = {
  totalWins: 0,
  totalLoses: 0,
  totalDraws: 0,
  totalGames: 0,
};

/**
 * An toàn đọc từ localStorage (bảo vệ khi bị chặn)
 * @param {string} key - Key
 * @param {*} defaultValue - Giá trị mặc định nếu không đọc được
 * @returns {*} Giá trị đọc được hoặc defaultValue
 */
function safeGet(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

/**
 * An toàn ghi vào localStorage
 * @param {string} key - Key
 * @param {*} value - Giá trị cần lưu
 * @returns {boolean} true nếu lưu thành công
 */
function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * Lấy cài đặt người dùng
 * @returns {Object} Cài đặt hiện tại (merge với DEFAULT_SETTINGS)
 */
export function getSettings() {
  const saved = safeGet(KEYS.SETTINGS, {});
  return { ...DEFAULT_SETTINGS, ...saved };
}

/**
 * Lưu cài đặt người dùng
 * @param {Object} settings - Cài đặt cần lưu (có thể là một phần)
 */
export function saveSettings(settings) {
  const current = getSettings();
  safeSet(KEYS.SETTINGS, { ...current, ...settings });
}

/**
 * Lấy thống kê tổng
 * @returns {Object} Thống kê tổng
 */
export function getTotalStats() {
  return safeGet(KEYS.TOTAL_STATS, { ...DEFAULT_TOTAL_STATS });
}

/**
 * Cập nhật thống kê tổng sau mỗi ván
 * @param {string} result - 'win' | 'lose' | 'draw'
 */
export function updateTotalStats(result) {
  const stats = getTotalStats();
  stats.totalGames++;
  if (result === 'win') stats.totalWins++;
  else if (result === 'lose') stats.totalLoses++;
  else stats.totalDraws++;
  safeSet(KEYS.TOTAL_STATS, stats);
}

/**
 * Lấy lịch sử các lượt gần nhất
 * @returns {Array} Mảng lịch sử (tối đa 20 lượt)
 */
export function getHistory() {
  return safeGet(KEYS.HISTORY, []);
}

/**
 * Thêm một lượt vào lịch sử
 * @param {Object} entry - { playerChoice, aiChoice, result, timestamp }
 */
export function addHistoryEntry(entry) {
  const history = getHistory();
  history.push({ ...entry, timestamp: Date.now() });
  // Giữ tối đa 20 lượt
  if (history.length > 20) history.shift();
  safeSet(KEYS.HISTORY, history);
}

/**
 * Lấy trạng thái AI đã lưu
 * @returns {Object|null} Trạng thái AI hoặc null
 */
export function getAIState() {
  return safeGet(KEYS.AI_STATE, null);
}

/**
 * Lưu trạng thái AI
 * @param {Object} aiState - Trạng thái AI
 */
export function saveAIState(aiState) {
  safeSet(KEYS.AI_STATE, aiState);
}

/**
 * Đặt lại toàn bộ dữ liệu game (điểm, lịch sử, AI state)
 * Giữ lại cài đặt người dùng (theme, ngôn ngữ, v.v.)
 */
export function resetGameData() {
  safeSet(KEYS.TOTAL_STATS, { ...DEFAULT_TOTAL_STATS });
  safeSet(KEYS.HISTORY, []);
  safeSet(KEYS.AI_STATE, null);
}

/**
 * Kiểm tra localStorage có khả dụng không
 * @returns {boolean}
 */
export function isStorageAvailable() {
  try {
    const testKey = KEY_PREFIX + 'test';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}
