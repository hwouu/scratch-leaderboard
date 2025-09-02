const API_ENDPOINT = "/api";

let leaderboardData = {};
let prevLeaderboardData = {};
let allPlayers = [];
let lastFetchTime = null;

/**
 * 서버에서 리더보드 데이터를 가져옵니다.
 * @returns {Promise<Object>} 성공 시 리더보드 데이터, 실패 시 에러 객체
 */
export async function fetchLeaderboardData() {
  try {
    const response = await fetch(API_ENDPOINT);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // 이전 데이터와 현재 데이터를 업데이트합니다.
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
          const courseInitial = key.charAt(6);
          p.courseRoundCounts[courseInitial] = player.roundCount || 0;
          p.grades[courseInitial] = player.grade;
        }
      });
    }
  });
  allPlayers = Array.from(playerMap.values());
}

/**
 * 캐시된 리더보드 데이터를 반환합니다.
 * @returns {Object} 리더보드 데이터
 */
export const getLeaderboardData = () => leaderboardData;
/**
 * 캐시된 이전 리더보드 데이터를 반환합니다.
 * @returns {Object} 이전 리derboard 데이터
 */
export const getPrevLeaderboardData = () => prevLeaderboardData;
/**
 * 캐시된 모든 플레이어 목록을 반환합니다.
 * @returns {Array} 모든 플레이어 목록
 */
export const getAllPlayers = () => allPlayers;
/**
 * 마지막으로 데이터를 가져온 시간을 반환합니다.
 * @returns {Date} 마지막 fetch 시간
 */
export const getLastFetchTime = () => lastFetchTime;
