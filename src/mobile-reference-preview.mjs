import {designPreview} from './design-preview';
// Explicit design reference state only. It is never used as an API-error fallback.
export function mobileReferencePreview(round,shop) {
  const data=designPreview(round,shop);
  const source=[['방문순',1.86],['개똥이네골프',2.94],['헐!!잘하네',3.27],['[BRO]투혼',3.47],['페퍼민트j',3.67]];
  data.courses[0].nearest={...data.courses[0].nearest,fetchedAt:'2026-11-11T05:20:00Z',entries:source.map(([nickname,distance],i)=>({id:`mobile-reference-${i}`,rank:i+1,nickname,distance,tie:false}))};
  return data;
}

// Paired list/player source matching. Opt-in only, never a live-data fallback.
export function professionalReferencePreview(round,shop) {
  const data=designPreview(round,shop),fetchedAt='2026-11-12T02:46:00Z';
  const samples=[['도킴플릿우드',1,-22],['[BRO]퉁펑',2,-12],['폴마',2,-12],['[BRO]투혼',4,-7],['[BRO]물개',5,37]];
  const entries=samples.map(([nickname,rank,score],i)=>({id:`professional-${i}`,nickname,rank,score,tie:rank===2,shopName:'화전 스크래치',shopId:14859,rounds:i===0?4:3,rawScore:null,adjustments:{grade:i===0?-15:0,gender:0,rounds:i===0?-1:0,system:0}}));
  data.total={status:'ok',fetchedAt,total:5,entries};
  data.courses=data.courses.map((c,i)=>({...c,standings:{status:'ok',fetchedAt,total:5,entries:entries.map((e,j)=>({...e,score:j===0?[-3,-5,-13][i]:e.score,rank:j+1,tie:false}))},nearest:{...c.nearest,fetchedAt,entries:i===2?[{id:'professional-0',nickname:entries[0].nickname,rank:1,distance:5.02,tie:false}]:[]}}));
  return data;
}
