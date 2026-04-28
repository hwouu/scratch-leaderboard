let cachedData = null;
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
    Date.now() - lastFetchTime < CACHE_DURATION
  ) {
    return cachedData;
  }

  try {
    const url = `${API_BASE_URL}?stage=${stage}`;
    console.log(`Fetching from API: ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();
    console.log(`Raw API Response for ${stage}:`, data);

    // [중요] 대진표 API 호출인 경우 가공 로직을 타지 않고 그대로 캐싱 및 반환
    if (stage === "2026-1st-bracket") {
      cachedData = data;
      currentStage = stage;
      lastFetchTime = Date.now();
      return cachedData;
    }

    // 그 외 일반 리더보드 API 처리
    if (data.total) {
      const processedData = processAllPlayersData(data);
      cachedData = processedData;
      currentStage = stage;
      lastFetchTime = Date.now();
      return cachedData;
    } else {
      console.warn("API response does not contain 'total' data:", data);
      cachedData = data;
      currentStage = stage;
      lastFetchTime = Date.now();
      return cachedData;
    }
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
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

  processCourse(data.courseA);
  processCourse(data.courseB);
  processCourse(data.courseC);

  let syntheticTotal = Array.from(playerMap.values());

  // 성적순 정렬 -> 동점일 경우 라운드 수 순 정렬
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
    courseA: data.courseA || [],
    courseB: data.courseB || [],
    courseC: data.courseC || [],
  };
}

export function getLeaderboardData() {
  return cachedData;
}
