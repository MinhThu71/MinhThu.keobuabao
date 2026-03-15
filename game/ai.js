/**
 * ai.js - AI đối thủ thích nghi
 * Phân tích tần suất lựa chọn của người chơi để dự đoán và khắc chế
 */

import { CHOICES, RESULTS } from './engine.js';

// Kích thước cửa sổ quan sát lịch sử người chơi
const HISTORY_WINDOW = 10;

/**
 * Nước đi khắc chế từng lựa chọn
 * Nếu dự đoán người chơi sẽ chọn X, AI chọn Y để thắng
 */
const COUNTER_MOVE = {
  [CHOICES.SCISSORS]: CHOICES.ROCK,    // Búa thắng Kéo
  [CHOICES.ROCK]: CHOICES.PAPER,       // Bao thắng Búa
  [CHOICES.PAPER]: CHOICES.SCISSORS,   // Kéo thắng Bao
};

// Tỷ lệ theo dự đoán theo từng độ khó
const DIFFICULTY_WEIGHTS = {
  easy: 0.50,   // Dễ: 50% theo dự đoán
  medium: 0.70, // Vừa: 70% theo dự đoán
  hard: 0.85,   // Khó: 85% theo dự đoán
};

/**
 * Tạo trạng thái AI ban đầu
 * @returns {Object} Trạng thái AI với lịch sử người chơi
 */
export function createAIState() {
  return {
    playerHistory: [], // Lịch sử lựa chọn của người chơi (tối đa HISTORY_WINDOW)
    recentResults: [], // Kết quả gần đây (để áp dụng "yếu tố công bằng")
  };
}

/**
 * Cập nhật trạng thái AI sau mỗi lượt
 * @param {Object} aiState - Trạng thái AI (sẽ bị mutate)
 * @param {string} playerChoice - Lựa chọn của người chơi
 * @param {string} result - Kết quả lượt đó (RESULTS.*)
 */
export function updateAIState(aiState, playerChoice, result) {
  // Cập nhật lịch sử lựa chọn người chơi
  aiState.playerHistory.push(playerChoice);
  if (aiState.playerHistory.length > HISTORY_WINDOW) {
    aiState.playerHistory.shift();
  }

  // Cập nhật kết quả gần đây (xem AI thắng bao nhiêu trong 10 lượt)
  aiState.recentResults.push(result);
  if (aiState.recentResults.length > HISTORY_WINDOW) {
    aiState.recentResults.shift();
  }
}

/**
 * Đếm tần suất các lựa chọn trong mảng
 * @param {string[]} history - Mảng lịch sử lựa chọn
 * @returns {Object} { scissors: n, rock: n, paper: n }
 */
function countFrequency(history) {
  const freq = {
    [CHOICES.SCISSORS]: 0,
    [CHOICES.ROCK]: 0,
    [CHOICES.PAPER]: 0,
  };
  for (const choice of history) {
    if (freq[choice] !== undefined) freq[choice]++;
  }
  return freq;
}

/**
 * Dự đoán lựa chọn tiếp theo của người chơi dựa trên tần suất
 * @param {Object} freq - Tần suất các lựa chọn
 * @returns {string} Lựa chọn được dự đoán có xác suất cao nhất
 */
function predictPlayerChoice(freq) {
  let maxCount = -1;
  let predicted = CHOICES.ROCK;
  for (const [choice, count] of Object.entries(freq)) {
    if (count > maxCount) {
      maxCount = count;
      predicted = choice;
    }
  }
  return predicted;
}

/**
 * Tính tỷ lệ AI thắng trong các lượt gần đây
 * @param {string[]} recentResults - Mảng kết quả (từ góc nhìn người chơi: WIN = người chơi thắng)
 * @returns {number} Tỷ lệ AI thắng [0, 1]
 */
function calcAIWinRate(recentResults) {
  if (recentResults.length === 0) return 0;
  const aiWins = recentResults.filter(r => r === RESULTS.LOSE).length;
  return aiWins / recentResults.length;
}

/**
 * Lựa chọn ngẫu nhiên hoàn toàn từ ba lựa chọn
 * @returns {string} Lựa chọn ngẫu nhiên
 */
function randomChoice() {
  const choices = Object.values(CHOICES);
  return choices[Math.floor(Math.random() * choices.length)];
}

/**
 * AI chọn nước đi dựa trên phân tích và độ khó
 * @param {Object} aiState - Trạng thái AI
 * @param {string} difficulty - Độ khó ('easy' | 'medium' | 'hard')
 * @returns {string} Lựa chọn của AI (CHOICES.*)
 */
export function getAIChoice(aiState, difficulty = 'medium') {
  // Nếu chưa có lịch sử đủ, chọn ngẫu nhiên
  if (aiState.playerHistory.length < 3) {
    return randomChoice();
  }

  // Tính tần suất trong cửa sổ quan sát gần nhất
  const windowHistory = aiState.playerHistory.slice(-HISTORY_WINDOW);
  const freq = countFrequency(windowHistory);

  // Dự đoán nước đi người chơi sẽ chơi
  const predictedPlayerChoice = predictPlayerChoice(freq);

  // Nước khắc chế dự đoán
  const counterMove = COUNTER_MOVE[predictedPlayerChoice];

  // Tỷ lệ theo dự đoán
  let weight = DIFFICULTY_WEIGHTS[difficulty] || DIFFICULTY_WEIGHTS.medium;

  // "Yếu tố công bằng": nếu AI thắng >70% trong 10 lượt gần đây, giảm 10% trọng số
  const aiWinRate = calcAIWinRate(aiState.recentResults);
  if (aiWinRate > 0.7 && aiState.recentResults.length >= 5) {
    weight = Math.max(0, weight - 0.10);
  }

  // Quyết định: theo dự đoán hay ngẫu nhiên
  if (Math.random() < weight) {
    return counterMove;
  }
  return randomChoice();
}
