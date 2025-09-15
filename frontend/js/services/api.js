let leaderboardData = {};
let prevLeaderboardData = {};
let allPlayers = [];
let lastFetchTime = null;

/**
 * 서버에서 특정 스테이지의 리더보드 데이터를 가져옵니다.
 * @param {string} stage - 가져올 데이터의 스테이지 (e.g., 'qualifying', '32')
 * @returns {Promise<Object>} 성공 시 리더보드 데이터, 실패 시 에러 객체
 */
export async function fetchLeaderboardData(stage) {
  const API_ENDPOINT = `/api?stage=${stage}`;
  try {
    const response = await fetch(API_ENDPOINT);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    prevLeaderboardData = { ...leaderboardData };
    leaderboardData = await response.json();

    processAllPlayers();
    lastFetchTime = new Date();

    return { success: true, data: leaderboardData };
  } catch (error) {
    console.error("Failed to fetch leaderboard data:", error);
    return { success: false, error: error };
  }
}

/**
 * 모든 데이터를 종합하여 플레이어 목록을 만듭니다.
 */
function processAllPlayers() {
  const playerMap = new Map();
  ["total", "courseA", "courseB", "courseC"].forEach((key) => {
    const data = leaderboardData[key];
    if (data && Array.isArray(data)) {
      data.forEach((player) => {
        if (!playerMap.has(player.userId)) {
          playerMap.set(player.userId, {
            userId: player.userId,
            userNickname: player.userNickname,
            shopName: player.shopName,
            courseRoundCounts: { A: 0, B: 0, C: 0 },
            grades: {},
          });
        }
        const p = playerMap.get(player.userId);
        if (key === "total") {
          Object.assign(p, player);
        } else {
          const courseInitial = key.charAt(6); // courseA -> A
          p.courseRoundCounts[courseInitial] = player.roundCount || 0;
          p.grades[courseInitial] = player.grade;
        }
      });
    }
  });
  allPlayers = Array.from(playerMap.values());
}

// --- Getter 함수들 (변경 없음) ---
export const getLeaderboardData = () => leaderboardData;
export const getPrevLeaderboardData = () => prevLeaderboardData;
export const getAllPlayers = () => allPlayers;
export const getLastFetchTime = () => lastFetchTime;
