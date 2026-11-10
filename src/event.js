export const SHOPS=[{id:14859,name:'화전 스크래치'},{id:17623,name:'창릉 스타원2'}];
export const SOURCE_URL='https://www.golfzon.com/tournament/v2/view?tournamentId=3337';
export const ROUNDS=[
 {no:1,id:23099,name:'1차전',start:Date.parse('2026-11-10T00:00:00+09:00'),end:Date.parse('2026-11-30T23:59:00+09:00'),courses:[{id:23100,label:'A',name:'타니 CC - 청룡/백호'},{id:23101,label:'B',name:'블루원 상주 골프리조트'},{id:23102,label:'C',name:'마우나오션 CC - 마우나/블루'}]},
 {no:2,id:23103,name:'2차전',start:Date.parse('2026-12-01T00:00:00+09:00'),end:Date.parse('2026-12-21T23:59:00+09:00'),courses:[{id:23104,label:'A',name:'세븐밸리컨트리클럽&리조트'},{id:23105,label:'B',name:'일라이트 CC'},{id:23106,label:'C',name:'자유로 CC - 통일/대한'}]}
];
export const shortCourse=(name='')=>name.replace(' - 청룡/백호','').replace(' 골프리조트','').replace(' - 마우나/블루','').replace('컨트리클럽&리조트',' CC');
export const scoreText=v=>v==null?'—':v===0?'E':v>0?`+${v}`:String(v);
export const currentRound=()=>Date.now()>=ROUNDS[1].start?'2':'1';
export function kstDate(v,full=false){return new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:full?'numeric':undefined,month:'2-digit',day:'2-digit'}).format(new Date(v)).replace(/\. /g,'.').replace(/\.$/,'');}
export const kstTime=v=>v?new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(v)):'확인 중';
