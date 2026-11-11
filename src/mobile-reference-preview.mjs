import {designPreview} from './design-preview';
// Explicit design reference state only. It is never used as an API-error fallback.
export function mobileReferencePreview(round,shop) {
  const data=designPreview(round,shop);
  const source=[['방문순',1.86],['개똥이네골프',2.94],['헐!!잘하네',3.27],['[BRO]투혼',3.47],['페퍼민트j',3.67]];
  data.courses[0].nearest={...data.courses[0].nearest,fetchedAt:'2026-11-11T05:20:00Z',entries:source.map(([nickname,distance],i)=>({id:`mobile-reference-${i}`,rank:i+1,nickname,distance,tie:false}))};
  return data;
}
