/**
 * game/engine.js
 * Mục đích: Xử lý luật chơi, vòng/loạt trận, tính điểm.
 * Input: lựa chọn của người chơi và AI
 * Output: kết quả trận (thắng/thua/hòa), trạng thái loạt
 */

// Hằng số đại diện cho các lựa chọn
export const CHOICES = {
  SCISSORS: 'scissors', // Kéo
  ROCK: 'rock',         // Búa
  PAPER: 'paper',       // Bao
};

// Hằng số kết quả
export const RESULTS = {
  WIN: 'win',
  LOSE: 'lose',
  DRAW: 'draw',
};

// Chế độ chơi
export const MODES = {
  QUICK: 'quick',       // Chơi nhanh (1 ván)
  BO3: 'bo3',           // Best of 3
  BO5: 'bo5',           // Best of 5
  FIRST_TO_N: 'firstToN', // First to N
};

/**
 * Xác định người thắng một lượt chơi.
 * @param {string} playerChoice - Lựa chọn của người chơi (CHOICES.*)
 * @param {string} aiChoice - Lựa chọn của AI (CHOICES.*)
 * @returns {string} Kết quả: RESULTS.WIN | RESULTS.LOSE | RESULTS.DRAW
 */
export function determineWinner(playerChoice, aiChoice) {
  if (playerChoice === aiChoice) return RESULTS.DRAW;

  // Bảng luật: nước thắng → nước thua
  const beats = {
    [CHOICES.SCISSORS]: CHOICES.PAPER,   // Kéo thắng Bao
    [CHOICES.ROCK]: CHOICES.SCISSORS,    // Búa thắng Kéo
    [CHOICES.PAPER]: CHOICES.ROCK,       // Bao thắng Búa
  };

  return beats[playerChoice] === aiChoice ? RESULTS.WIN : RESULTS.LOSE;
}

/**
 * Tính tổng số lượt tối đa cho chế độ Bo3/Bo5.
 * @param {string} mode - Chế độ chơi
 * @param {number} firstToN - Số điểm mục tiêu khi mode = FIRST_TO_N
 * @returns {number} Số điểm cần thiết để thắng loạt
 */
export function getTargetScore(mode, firstToN = 3) {
  const map = {
    [MODES.QUICK]: 1,
    [MODES.BO3]: 2,     // Thắng 2/3
    [MODES.BO5]: 3,     // Thắng 3/5
    [MODES.FIRST_TO_N]: firstToN,
  };
  return map[mode] ?? 1;
}

/**
 * Kiểm tra xem loạt đấu đã kết thúc chưa.
 * @param {Object} score - { player: number, ai: number }
 * @param {string} mode - Chế độ chơi
 * @param {number} firstToN - Số điểm mục tiêu
 * @returns {{ over: boolean, winner: 'player'|'ai'|null }}
 */
export function checkSeriesOver(score, mode, firstToN = 3) {
  const target = getTargetScore(mode, firstToN);
  if (score.player >= target) return { over: true, winner: 'player' };
  if (score.ai >= target) return { over: true, winner: 'ai' };
  return { over: false, winner: null };
}

/**
 * Tạo trạng thái game ban đầu cho một loạt mới.
 * @param {string} mode - Chế độ chơi
 * @param {number} firstToN - Số điểm mục tiêu (cho FIRST_TO_N)
 * @returns {Object} Trạng thái game khởi tạo
 */
export function createInitialState(mode = MODES.QUICK, firstToN = 3) {
  return {
    mode,
    firstToN,
    score: { player: 0, ai: 0 },
    rounds: [],           // Lịch sử lượt trong loạt hiện tại
    seriesOver: false,
    seriesWinner: null,
    totalGames: 0,        // Tổng số ván đã chơi (tính cả nhiều loạt)
    totalWins: 0,
    totalLosses: 0,
    totalDraws: 0,
  };
}

/**
 * Xử lý một lượt chơi và cập nhật trạng thái.
 * @param {Object} state - Trạng thái hiện tại
 * @param {string} playerChoice - Lựa chọn của người chơi
 * @param {string} aiChoice - Lựa chọn của AI
 * @returns {Object} Trạng thái mới sau lượt chơi
 */
export function playRound(state, playerChoice, aiChoice) {
  const result = determineWinner(playerChoice, aiChoice);

  // Tạo bản sao state để tránh mutation
  const newState = {
    ...state,
    score: { ...state.score },
    rounds: [...state.rounds],
  };

  // Cập nhật điểm
  if (result === RESULTS.WIN) {
    newState.score.player++;
    newState.totalWins++;
  } else if (result === RESULTS.LOSE) {
    newState.score.ai++;
    newState.totalLosses++;
  } else {
    newState.totalDraws++;
  }

  newState.totalGames++;

  // Ghi lại lượt chơi
  newState.rounds.push({
    playerChoice,
    aiChoice,
    result,
    timestamp: Date.now(),
  });

  // Kiểm tra kết thúc loạt
  const { over, winner } = checkSeriesOver(newState.score, newState.mode, newState.firstToN);
  newState.seriesOver = over;
  newState.seriesWinner = winner;

  return newState;
}

/**
 * Đặt lại điểm loạt hiện tại (giữ lại thống kê tổng).
 * @param {Object} state - Trạng thái hiện tại
 * @returns {Object} Trạng thái sau khi đặt lại loạt
 */
export function resetSeries(state) {
  return {
    ...state,
    score: { player: 0, ai: 0 },
    rounds: [],
    seriesOver: false,
    seriesWinner: null,
  };
}

/**
 * Lấy tên hiển thị (tiếng Việt) cho lựa chọn.
 * @param {string} choice - CHOICES.*
 * @param {string} lang - 'vi' hoặc 'en'
 * @returns {string}
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
  return (labels[lang] ?? labels.vi)[choice] ?? choice;
}
