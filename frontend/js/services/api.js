let leaderboardData = null;
let prevLeaderboardData = null;
let allPlayers = [];
let lastFetchTime = null;

const CACHE_DURATION = 2 * 60 * 1000; // 2분

/**
 * 서버에서 리더보드 데이터를 가져와 전역 상태를 업데이트합니다.
 * @param {string} stage - 가져올 데이터의 스테이지
 * @param {boolean} forceRefresh - 캐시를 무시하고 새로고침할지 여부
 * @returns {Promise<{success: boolean}>} 데이터 fetch 성공 여부를 반환합니다.
 */
export async function fetchLeaderboardData(stage, forceRefresh = false) {
  const now = new Date();
  if (!forceRefresh && lastFetchTime && now - lastFetchTime < CACHE_DURATION) {
    console.log("Using cached data.");
    return { success: true }; // 수정: 캐시 사용 시 성공 객체 반환
  }

  const API_ENDPOINT = `/api?stage=${stage}`;
  try {
    const response = await fetch(API_ENDPOINT);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    prevLeaderboardData = leaderboardData;
    leaderboardData = data;
    lastFetchTime = new Date();

    processAllPlayersData(data);
    return { success: true }; // 수정: 성공 시 성공 객체 반환
  } catch (error) {
    console.error("Failed to fetch leaderboard data:", error);
    leaderboardData = null;
    return { success: false }; // 수정: 실패 시 실패 객체 반환
  }
}

/**
 * API 응답 데이터를 기반으로 모든 플레이어 정보를 통합 처리합니다.
 * @param {object} data - API에서 받은 데이터 객체
 */
function processAllPlayersData(data) {
  const playerMap = new Map();

  const processRankData = (rankData, courseKey) => {
    if (!rankData || !Array.isArray(rankData)) return;
    rankData.forEach((player) => {
      if (!playerMap.has(player.userId)) {
        playerMap.set(player.userId, {
          ...player,
          courseScores: {},
          courseRanks: {},
          courseRoundCounts: {},
        });
      }
      const p = playerMap.get(player.userId);
      p.courseScores[courseKey] = player.score;
      p.courseRanks[courseKey] = player.rank;
      p.courseRoundCounts[courseKey] = player.roundCount;

      if (courseKey === "total") {
        p.totalScore = player.totalScore;
        p.rank = player.rank;
        p.isTieRank = player.isTieRank;
        p.roundCount = player.roundCount;
        p.revisionGrade = player.revisionGrade;
      }
    });
  };

  processRankData(data.total, "total");
  processRankData(data.courseA, "courseA");
  processRankData(data.courseB, "courseB");
  if (data.courseC) {
    processRankData(data.courseC, "courseC");
  }

  allPlayers = Array.from(playerMap.values());
}

export const getLeaderboardData = () => leaderboardData;
export const getPrevLeaderboardData = () => prevLeaderboardData;
export const getAllPlayers = () => allPlayers;
export const getLastFetchTime = () => lastFetchTime;

/**
 * 특정 스테이지의 데이터를 서버에서 직접 가져와 반환합니다. (전역 상태를 변경하지 않음)
 * @param {string} stage - 가져올 데이터의 스테이지
 * @returns {Promise<Object|null>} 성공 시 해당 스테이지의 데이터, 실패 시 null
 */
export async function fetchStageData(stage) {
  const API_ENDPOINT = `/api?stage=${stage}`;
  try {
    const response = await fetch(API_ENDPOINT);
    if (!response.ok) {
      console.error(
        `HTTP error! status: ${response.status} for stage: ${stage}`
      );
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch data for stage ${stage}:`, error);
    return null;
  }
}
