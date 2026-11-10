// The upstream rank and totalScore are authoritative. Never re-apply adjustments.
export const SOURCE_BASE = 'https://fairway.golfzon.com/v2/tournament/';
export const SHOPS = [{ id: 14859, name: '화전 스크래치' }, { id: 17623, name: '창릉 스타원2' }];
const cache = new Map();
const inflight = new Map();
const TTL = 60_000;
export function numeric(value) { return typeof value === 'number' && Number.isFinite(value) ? value : null; }
export function normalizeEntry(p, courses = []) {
  return {
    id: String(p.userNo ?? p.userId ?? p.userNickname), nickname: String(p.userNickname || '참가자'),
    rank: numeric(p.rank), tie: Boolean(p.isTieRank), rawScore: numeric(p.score), score: numeric(p.totalScore),
    rounds: numeric(p.roundCount), shopId: numeric(p.shopNo), shopName: p.shopName || '', excluded: Boolean(p.isExclusion),
    complete: p.isComplete == null ? null : Boolean(p.isComplete),
    adjustments: { grade: numeric(p.revisionGrade), gender: numeric(p.revisionGender), rounds: numeric(p.revisionRoundCount), system: numeric(p.revisionSoftware) },
    courseScores: courses.map((c, index) => ({ courseId: c.id, label: c.label, score: numeric(p.scores?.[index]?.score) })),
  };
}
async function requestJSON(path, fetcher) {
  const response = await fetcher(SOURCE_BASE + path, { headers: { Accept: 'application/json', 'User-Agent': 'Golmok-Leaderboard/1.0' }, signal: AbortSignal.timeout(12_000) });
  if (!response.ok) throw new Error(`골프존 응답 ${response.status}`);
  const body = await response.json();
  const countValue = response.headers.get('x-total-count') ?? response.headers.get('x-total_count');
  const count = countValue == null ? null : Number(countValue);
  return { data: body?.data ?? body, count: Number.isFinite(count) ? count : null };
}
export async function fetchPages(path, fetcher = fetch) {
  const entries = []; let total = null; const size = 100;
  for (let page = 1; page <= 50; page++) {
    const { data, count } = await requestJSON(`${path}${path.includes('?') ? '&' : '?'}page=${page}&size=${size}`, fetcher);
    const items = Array.isArray(data) ? data : data?.items;
    if (!Array.isArray(items)) throw new Error('순위 응답 형식이 변경되었습니다.');
    if (count !== null) total = count;
    entries.push(...items);
    if (items.length < size || (total !== null && entries.length >= total)) return { entries, total: total ?? entries.length };
  }
  throw new Error('전체 순위 조회 범위를 초과했습니다.');
}
async function cached(key, loader, ttl = TTL) {
  const previous = cache.get(key);
  if (previous && Date.now() - previous.savedAt < ttl) return previous.resource;
  if (inflight.has(key)) return inflight.get(key);
  const task = (async () => {
    try {
      const data = await loader();
      const resource = { status: 'ok', fetchedAt: new Date().toISOString(), ...data };
      cache.set(key, { savedAt: Date.now(), resource }); return resource;
    } catch (error) {
      return { ...(previous?.resource ?? {}), status: previous ? 'stale' : 'error', error: error.message, fetchedAt: previous?.resource.fetchedAt ?? null };
    } finally { inflight.delete(key); }
  })();
  inflight.set(key, task); return task;
}
export async function getLeaderboard(searchParams, fetcher = fetch) {
  const roundChoice = searchParams.get('round') ?? '1';
  const shop = Number(searchParams.get('shop') ?? 14859);
  if (!['1', '2', 'season'].includes(roundChoice) || ![0, ...SHOPS.map(s => s.id)].includes(shop)) return { status: 400, body: { error: '올바르지 않은 차전 또는 매장입니다.' } };
  const detail = await cached('metadata:3337', async () => {
    const { data } = await requestJSON('managements/3337', fetcher);
    if (!Array.isArray(data.rounds) || !data.rounds.length) throw new Error('대회 설정을 확인할 수 없습니다.');
    return { event: { id: 3337, officialName: data.tournamentName, participants: data.joinCount, roundsPlayed: data.roundCount,
      rounds: data.rounds.map(r => ({ id: r.roundId, no: r.roundNo, name: r.roundName, start: r.startTime, end: r.endTime,
        gradeAdjustments: r.revisionGrade, roundAdjustments: r.revisionRounds, genderAdjustments: r.revisionGender,
        courses: r.subs.map((s, i) => ({ id: s.subId, label: 'ABC'[i], name: s.subName, nearHole: s.subConfig?.nearestCourse })) })) } };
  }, 300_000);
  if (!detail.event) return { status: 502, body: { error: '골프존 대회 정보를 가져오지 못했습니다.', detail: detail.error } };
  const round = detail.event.rounds.find(r => r.no === Number(roundChoice)) ?? detail.event.rounds[0];
  const shopQuery = shop ? `&shopNo=${shop}` : '';
  const totalPath = roundChoice === 'season' ? 'ranks/season/total/3337/stroke' : `ranks/rounds/total/${round.id}/stroke`;
  const requests = [cached(`${totalPath}:${shop}`, async () => {
    const { entries, total } = await fetchPages(`${totalPath}?gender=0${shopQuery}`, fetcher);
    return { entries: entries.map(p => normalizeEntry(p, roundChoice === 'season' ? [] : round.courses)), total };
  })];
  for (const course of round.courses) requests.push(cached(`course:${course.id}:${shop}`, async () => {
    const { entries, total } = await fetchPages(`ranks/courses/${course.id}/stroke?gender=0${shopQuery}`, fetcher);
    return { entries: entries.map(p => normalizeEntry(p)), total };
  }));
  for (const course of round.courses) requests.push(cached(`nearest:${course.id}`, async () => {
    const { data } = await requestJSON(`ranks/courses/${course.id}/distance?distanceType=2&gender=0`, fetcher);
    if (!Array.isArray(data?.ranks)) throw new Error('니어 응답 형식이 변경되었습니다.');
    return { courseName: data.courseName, hole: data.holeNo, unit: 'm', entries: data.ranks.map(p => ({ id: String(p.userNo), nickname: p.userNickname || '참가자', rank: numeric(p.rank), tie: Boolean(p.isTieRank), distance: numeric(p.score) })) };
  }));
  const resources = await Promise.all(requests);
  return { status: 200, body: { event: detail.event, metadataStatus: detail.status, round, roundChoice, shopId: shop, shops: SHOPS,
    policy: { source: 'golfzon-official', adjustments: 'upstream', provisional: true },
    total: resources[0], courses: round.courses.map((course, i) => ({ ...course, standings: resources[i + 1], nearest: resources[i + 1 + round.courses.length] })), servedAt: new Date().toISOString(), refreshSeconds: 60 } };
}
export function resetCacheForTests() { cache.clear(); inflight.clear(); }
