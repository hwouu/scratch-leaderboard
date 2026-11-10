import { getLeaderboard } from '../server/golfzon.mjs';
export default async function handler(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); res.statusCode = 405; res.end(); return; }
  try {
    const { status, body } = await getLeaderboard(new URL(req.url, 'http://local').searchParams);
    res.statusCode = status; res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(body));
  } catch { res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: '일시적으로 순위를 가져올 수 없습니다.' })); }
}
