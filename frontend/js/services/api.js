let cachedData = null;
let prevCachedData = null;
let lastFetchTime = null;
const CACHE_DURATION = 2 * 60 * 1000;
let currentStage = null;

const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000/api/index"
    : "/api/index";

export async function fetchLeaderboardData(stage) {
  if (
    cachedData &&
    currentStage === stage &&
    lastFetchTime &&
    Date.now() - lastFetchTime.getTime() < CACHE_DURATION
  ) {
    return { success: true };
  }

  try {
    const url = `${API_BASE_URL}?stage=${stage}`;
    console.log(`Fetching from API: ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();

    // 이전 데이터 상태 저장 (순위 변동 애니메이션용)
    prevCachedData = cachedData;
    currentStage = stage;
    lastFetchTime = new Date();

    // 본선 대진표 API 처리 (가공 없이 그대로 저장)
    if (stage === "2026-1st-bracket") {
      cachedData = data;
      return { success: true };
    }

    // 일반 리더보드 데이터 가공
    if (data.total || data.courseA) {
      cachedData = processAllPlayersData(data);
      return { success: true };
    } else {
      cachedData = data;
      return { success: true };
    }
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    return { success: false };
  }
}

// 과거 tournament.js 등에서 사용하는 순수 fetch 함수 복구
export async function fetchData(stage) {
  try {
    const url = `${API_BASE_URL}?stage=${stage}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Error in fetchData:", error);
    return null;
  }
}

function processAllPlayersData(data) {
  const playerMap = new Map();

  const processCourse = (courseData) => {
    if (!courseData) return;
    const items = Array.isArray(courseData)
      ? courseData
      : courseData.items || [];
    items.forEach((p) => {
      if (!playerMap.has(p.userId)) {
        playerMap.set(p.userId, {
          ...p,
          score: 0,
          totalScore: 0,
          roundCount: 0,
        });
      }
      const existing = playerMap.get(p.userId);
      existing.score += p.score || 0;
      existing.totalScore +=
        p.totalScore !== undefined ? p.totalScore : p.score || 0;
      existing.roundCount += p.roundCount || 0;
    });
  };

  if (data.total) processCourse(data.total);
  processCourse(data.courseA);
  processCourse(data.courseB);
  processCourse(data.courseC);

  let syntheticTotal = Array.from(playerMap.values());

  syntheticTotal.sort((a, b) => {
    if (a.totalScore !== b.totalScore) return a.totalScore - b.totalScore;
    return b.roundCount - a.roundCount;
  });

  let currentRank = 1;
  let tieCount = 0;

  syntheticTotal.forEach((p, i) => {
    if (i === 0) {
      p.rank = currentRank;
      p.isTieRank = 0;
    } else {
      const prev = syntheticTotal[i - 1];
      if (
        p.totalScore === prev.totalScore &&
        p.roundCount === prev.roundCount
      ) {
        p.rank = currentRank;
        p.isTieRank = 1;
        prev.isTieRank = 1;
        tieCount++;
      } else {
        currentRank += tieCount + 1;
        p.rank = currentRank;
        p.isTieRank = 0;
        tieCount = 0;
      }
    }
  });

  return {
    info: data.info || {},
    total: syntheticTotal,
    courseA: Array.isArray(data.courseA)
      ? data.courseA
      : data.courseA?.items || [],
    courseB: Array.isArray(data.courseB)
      ? data.courseB
      : data.courseB?.items || [],
    courseC: Array.isArray(data.courseC)
      ? data.courseC
      : data.courseC?.items || [],
  };
}

export function getLeaderboardData() {
  return cachedData;
}

export function getPrevLeaderboardData() {
  return prevCachedData || {};
}

export function getLastFetchTime() {
  return lastFetchTime || new Date();
}

export function getAllPlayers() {
  if (!cachedData || !cachedData.total) return [];
  return cachedData.total;
}
