// A participant lookup never fabricates a combined rank from course records.
export function mobileSearchPlayers(data, query = '', {includeNearest=false} = {}) {
  const players = new Map((data?.total?.entries ?? []).map(p => [p.id, {...p, viewLabel:'합산'}]));
  for (const course of data?.courses ?? []) {
    for (const p of course.standings?.entries ?? []) {
      if (!players.has(p.id)) players.set(p.id, {...p, rank:null, score:null, rawScore:null, adjustments:null, incomplete:data?.total?.status==='ok', aggregateUnavailable:data?.total?.status!=='ok', viewLabel:'합산'});
    }
    for (const p of includeNearest ? course.nearest?.entries ?? [] : []) {
      if (!players.has(p.id)) players.set(p.id, {...p, nearCourse:course.label, viewLabel:`니어 ${course.label}코스`});
    }
  }
  const needle=query.trim().toLocaleLowerCase();
  return [...players.values()].filter(p => !needle || p.nickname.toLocaleLowerCase().includes(needle));
}
