// Ticker records come from the displayed official resource; never invent movement.
export function buildTickerItems(data, nearest) {
  const result = [];
  const add = (scope, entries = [], distance = false) => {
    for (const player of entries.slice(0, 3)) {
      const value = distance ? player.distance : player.score;
      if (value == null || player.rank == null) continue;
      result.push({
        id: `${scope}:${player.id}`, scope, nickname: player.nickname,
        rank: `${player.tie ? 'T' : ''}${player.rank}`,
        value: distance ? `${value.toFixed(2)} m` : value === 0 ? 'E' : value > 0 ? `+${value}` : String(value),
      });
    }
  };
  if (!nearest) add('합산', data?.total?.entries);
  for (const course of data?.courses ?? []) add(`${course.label}코스`, nearest ? course.nearest?.entries : course.standings?.entries, nearest);
  return result;
}
