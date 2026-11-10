import {ROUNDS,SHOPS} from './event';
// Explicit ?preview=design only. Never fills missing official records.
export function designPreview(roundChoice='1',shopId=14859){
 const round=ROUNDS[roundChoice==='2'?1:0];
 const names=['화전타이거','골목사나이','버디왕김프로','스크린장인','오늘이글','블루원짱','마우나프로','드로우킹','아이언맨','샷감좋다','나이스온','깔끔퍼팅','페어웨이맨','그린헌터','굿샷굿샷'];
 const scores=[-18,-16,-15,-13,-12,-10,-9,-8,-7,-6,-4,-3,-1,0,2];
 const courseNames=[['버디왕김프로','골목사나이','스크린장인','오늘이글','롱펏마스터','샷감좋다','파세이브','그린헌터'],['화전타이거','블루원짱','상주버디','드로우킹','아이언맨','핀공략','깔끔퍼팅','굿샷굿샷'],['마우나프로','오션버디','바람의퍼터','CC헌터','나이스온','원온도전','페어웨이맨','그린키퍼']];
 const fetchedAt='2026-11-10T13:27:00Z';
 const entry=(name,i)=>({id:`preview-${i}`,nickname:name,rank:i+1,tie:false,score:scores[i],rawScore:scores[i]+12,rounds:3+i,shopId,shopName:SHOPS.find(s=>s.id===shopId)?.name??'화전 스크래치',adjustments:{grade:-11,gender:0,rounds:-1,system:0},courseScores:round.courses.map(c=>({courseId:c.id,label:c.label,score:null}))});
 return {preview:true,round,roundChoice,shopId,event:{id:3337,officialName:'엔플 골목대장 나야나',participants:33,roundsPlayed:43,rounds:ROUNDS},shops:SHOPS,total:{status:'ok',fetchedAt,total:15,entries:names.map(entry)},
 courses:round.courses.map((c,j)=>({...c,standings:{status:'ok',fetchedAt,total:8,entries:courseNames[j].map((n,i)=>({...entry(n,Math.max(0,names.indexOf(n))),id:`preview-course-${j}-${i}`,rank:i+1,score:[-6,-5,-5,-4,-4,-3,-3,-2][i]}))},nearest:{status:'ok',fetchedAt,courseName:['청룡','EAST','마우나'][j],hole:[8,7,7][j],unit:'m',entries:courseNames[j].map((n,i)=>({id:`preview-near-${j}-${i}`,nickname:n,rank:i+1,tie:false,distance:[0.98,1.12,1.25,1.36,1.48,1.71,1.85,1.99][i]+j*0.03}))}})),refreshSeconds:60};
}
