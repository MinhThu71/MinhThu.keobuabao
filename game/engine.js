/**
 * engine.js - Luật chơi, vòng/loạt trận, tính điểm
 * Quản lý toàn bộ logic cốt lõi của game Kéo–Búa–Bao
 */

// Hằng số các lựa chọn
export const CHOICES = {
  SCISSORS: 'scissors', // Kéo
  ROCK: 'rock',         // Búa/Đá
  PAPER: 'paper',       // Bao/Giấy
};

// Hằng số kết quả
export const RESULTS = {
  WIN: 'win',
  LOSE: 'lose',
  DRAW: 'draw',
};

// Chế độ chơi
export const GAME_MODES = {
  SINGLE: 'single',     // Chơi nhanh (1 ván)
  BO3: 'bo3',           // Bo3
  BO5: 'bo5',           // Bo5
  FIRST_TO_N: 'firstToN', // First to N
};

/**
 * Quy tắc thắng thua:
 * Kéo thắng Bao, Bao thắng Búa, Búa thắng Kéo
 * @type {Object} key = lựa chọn của người thắng, value = lựa chọn bị thắng
 */
const WIN_RULES = {
  [CHOICES.SCISSORS]: CHOICES.PAPER,  // Kéo thắng Bao
  [CHOICES.ROCK]: CHOICES.SCISSORS,   // Búa thắng Kéo
  [CHOICES.PAPER]: CHOICES.ROCK,      // Bao thắng Búa
};

/**
 * Tính kết quả một lượt đấu
 * @param {string} playerChoice - Lựa chọn của người chơi (CHOICES.*)
 * @param {string} aiChoice - Lựa chọn của AI (CHOICES.*)
 * @returns {string} RESULTS.WIN / RESULTS.LOSE / RESULTS.DRAW
 */
export function determineResult(playerChoice, aiChoice) {
  if (playerChoice === aiChoice) return RESULTS.DRAW;
  if (WIN_RULES[playerChoice] === aiChoice) return RESULTS.WIN;
  return RESULTS.LOSE;
}

/**
 * Tạo trạng thái game ban đầu
 * @param {string} mode - Chế độ chơi (GAME_MODES.*)
 * @param {number} targetN - Mục tiêu điểm cho chế độ First to N
 * @returns {Object} Trạng thái game
 */
export function createGameState(mode = GAME_MODES.SINGLE, targetN = 3) {
  return {
    mode,
    targetN,
    playerScore: 0,
    aiScore: 0,
    draws: 0,
    roundsPlayed: 0,
    isOver: false,
    winner: null, // 'player' | 'ai' | 'draw'
    history: [],  // Lịch sử các lượt [{playerChoice, aiChoice, result}]
  };
}

/**
 * Số ván cần thắng tùy theo chế độ
 * @param {Object} state - Trạng thái game
 * @returns {number} Số ván cần thắng (hoặc Infinity nếu chế độ không giới hạn)
 */
export function getTargetScore(state) {
  switch (state.mode) {
    case GAME_MODES.BO3: return 2;         // Best of 3: cần 2 điểm
    case GAME_MODES.BO5: return 3;         // Best of 5: cần 3 điểm
    case GAME_MODES.FIRST_TO_N: return state.targetN;
    case GAME_MODES.SINGLE:
    default: return 1;
  }
}

/**
 * Tổng số ván tối đa trong một loạt (Bo3/Bo5)
 * @param {Object} state - Trạng thái game
 * @returns {number} Số ván tối đa (Infinity nếu không giới hạn)
 */
export function getMaxRounds(state) {
  switch (state.mode) {
    case GAME_MODES.BO3: return 3;
    case GAME_MODES.BO5: return 5;
    case GAME_MODES.SINGLE: return 1;
    case GAME_MODES.FIRST_TO_N: return Infinity;
    default: return Infinity;
  }
}

/**
 * Xử lý một lượt đấu và cập nhật trạng thái game
 * @param {Object} state - Trạng thái hiện tại (sẽ bị mutate)
 * @param {string} playerChoice - Lựa chọn của người chơi
 * @param {string} aiChoice - Lựa chọn của AI
 * @returns {Object} { result, state, roundOver, gameOver }
 */
export function playRound(state, playerChoice, aiChoice) {
  const result = determineResult(playerChoice, aiChoice);

  // Cập nhật điểm
  if (result === RESULTS.WIN) state.playerScore++;
  else if (result === RESULTS.LOSE) state.aiScore++;
  else state.draws++;

  state.roundsPlayed++;

  // Thêm vào lịch sử
  state.history.push({
    playerChoice,
    aiChoice,
    result,
    roundNumber: state.roundsPlayed,
  });

  // Giữ lịch sử tối đa 20 lượt
  if (state.history.length > 20) {
    state.history.shift();
  }

  // Kiểm tra kết thúc game
  const target = getTargetScore(state);
  const maxRounds = getMaxRounds(state);
  let gameOver = false;
  let winner = null;

  if (state.playerScore >= target) {
    gameOver = true;
    winner = 'player';
  } else if (state.aiScore >= target) {
    gameOver = true;
    winner = 'ai';
  } else if (state.roundsPlayed >= maxRounds) {
    // Hết ván, tính thắng theo điểm
    gameOver = true;
    if (state.playerScore > state.aiScore) winner = 'player';
    else if (state.aiScore > state.playerScore) winner = 'ai';
    else winner = 'draw';
  }

  if (gameOver) {
    state.isOver = true;
    state.winner = winner;
  }

  return { result, gameOver, winner };
}

/**
 * Tính số ván còn lại trong loạt
 * @param {Object} state - Trạng thái game
 * @returns {number} Số ván còn lại (Infinity nếu không giới hạn)
 */
export function getRoundsRemaining(state) {
  const maxRounds = getMaxRounds(state);
  if (maxRounds === Infinity) return Infinity;
  return Math.max(0, maxRounds - state.roundsPlayed);
}

/**
 * Lấy nhãn hiển thị cho từng lựa chọn
 * @param {string} choice - CHOICES.*
 * @param {string} lang - Ngôn ngữ ('vi' | 'en')
 * @returns {string} Nhãn hiển thị
 */
export function getChoiceLabel(choice, lang = 'vi') {
  const labels = {
    vi: {
      [CHOICES.SCISSORS]: 'Kéo',
      [CHOICES.ROCK]: 'Búa',
      [CHOICES.PAPER]: 'Bao',
    },
    en: {
      [CHOICES.SCISSORS]: 'Scissors',
      [CHOICES.ROCK]: 'Rock',
      [CHOICES.PAPER]: 'Paper',
    },
  };
  return (labels[lang] || labels.vi)[choice] || choice;
}

/**
 * Lấy ID icon SVG cho từng lựa chọn
 * @param {string} choice - CHOICES.*
 * @returns {string} ID của symbol SVG
 */
export function getChoiceIcon(choice) {
  const icons = {
    [CHOICES.SCISSORS]: 'icon-scissors',
    [CHOICES.ROCK]: 'icon-rock',
    [CHOICES.PAPER]: 'icon-paper',
  };
  return icons[choice] || 'icon-rock';
}
