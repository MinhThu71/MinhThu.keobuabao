/**
 * game/ai.js
 * Mục đích: AI thích nghi đơn giản – phân tích tần suất lựa chọn của người chơi
 *           và dự đoán nước đi có xác suất cao để khắc chế.
 * Input: lịch sử lựa chọn của người chơi, độ khó, tỉ lệ thắng gần đây
 * Output: lựa chọn của AI (CHOICES.*)
 */

import { CHOICES } from './engine.js';

// Độ khó AI
export const DIFFICULTIES = {
  EASY: 'easy',     // Dễ
  MEDIUM: 'medium', // Vừa
  HARD: 'hard',     // Khó
};

// Xác suất theo dự đoán cho từng độ khó
const PREDICT_WEIGHT = {
  [DIFFICULTIES.EASY]: 0.50,
  [DIFFICULTIES.MEDIUM]: 0.70,
  [DIFFICULTIES.HARD]: 0.85,
};

// Nước khắc chế: khắc chế[X] sẽ thắng X
const COUNTER = {
  [CHOICES.SCISSORS]: CHOICES.ROCK,    // Búa khắc Kéo
  [CHOICES.ROCK]: CHOICES.PAPER,       // Bao khắc Búa
  [CHOICES.PAPER]: CHOICES.SCISSORS,   // Kéo khắc Bao
};

const ALL_CHOICES = [CHOICES.SCISSORS, CHOICES.ROCK, CHOICES.PAPER];

/**
 * Lấy lựa chọn ngẫu nhiên từ mảng.
 * @param {string[]} arr
 * @returns {string}
 */
function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Tính tần suất lựa chọn từ lịch sử (cửa sổ trượt).
 * @param {string[]} history - Lịch sử lựa chọn của người chơi
 * @param {number} windowSize - Kích thước cửa sổ (mặc định 8)
 * @returns {{ scissors: number, rock: number, paper: number }} Tần suất (0–1)
 */
function calcFrequency(history, windowSize = 8) {
  const window = history.slice(-windowSize);
  if (window.length === 0) {
    return { scissors: 1 / 3, rock: 1 / 3, paper: 1 / 3 };
  }

  const counts = { scissors: 0, rock: 0, paper: 0 };
  for (const choice of window) {
    if (counts[choice] !== undefined) counts[choice]++;
  }

  const total = window.length;
  return {
    scissors: counts.scissors / total,
    rock: counts.rock / total,
    paper: counts.paper / total,
  };
}

/**
 * Dự đoán nước đi có xác suất cao nhất của người chơi.
 * @param {{ scissors: number, rock: number, paper: number }} freq
 * @returns {string} Lựa chọn dự đoán
 */
function predictPlayerMove(freq) {
  return ALL_CHOICES.reduce((best, c) => (freq[c] > freq[best] ? c : best), ALL_CHOICES[0]);
}

/**
 * Tính tỉ lệ thắng của AI trong N lượt gần nhất.
 * @param {Array<{result: string}>} rounds - Các lượt gần nhất
 * @param {number} n - Số lượt xét
 * @returns {number} Tỉ lệ (0–1)
 */
function recentAiWinRate(rounds, n = 10) {
  const recent = rounds.slice(-n);
  if (recent.length === 0) return 0;
  const wins = recent.filter(r => r.result === 'lose').length; // result là của người chơi
  return wins / recent.length;
}

/**
 * AI chọn nước đi thích nghi.
 * @param {string[]} playerHistory - Lịch sử lựa chọn của người chơi
 * @param {Array<{result: string}>} rounds - Các lượt đầy đủ (để tính win rate)
 * @param {string} difficulty - DIFFICULTIES.*
 * @returns {string} Lựa chọn của AI
 */
export function aiChoose(playerHistory, rounds = [], difficulty = DIFFICULTIES.MEDIUM) {
  // Tính tần suất lựa chọn gần đây của người chơi
  const freq = calcFrequency(playerHistory);

  // Dự đoán nước đi người chơi sắp chọn
  const predicted = predictPlayerMove(freq);

  // Nước khắc chế dự đoán
  const counterMove = COUNTER[predicted];

  // Xác suất theo dự đoán (có thể giảm nếu AI thắng quá nhiều)
  let predictWeight = PREDICT_WEIGHT[difficulty] ?? 0.7;

  // Yếu tố công bằng: nếu AI thắng >70% trong 10 lượt gần nhất, giảm 10%
  const aiWinRate = recentAiWinRate(rounds, 10);
  if (aiWinRate > 0.70) {
    predictWeight = Math.max(0, predictWeight - 0.10);
  }

  // Quyết định theo trọng số: theo dự đoán hoặc ngẫu nhiên
  if (Math.random() < predictWeight) {
    return counterMove;
  }

  return randomFrom(ALL_CHOICES);
}

/**
 * Lấy danh sách lựa chọn lịch sử chỉ của người chơi từ mảng rounds.
 * @param {Array<{playerChoice: string}>} rounds
 * @returns {string[]}
 */
export function extractPlayerHistory(rounds) {
  return rounds.map(r => r.playerChoice);
}
