import test from 'node:test';
import assert from 'node:assert/strict';
import {fetchPages,getLeaderboard,normalizeEntry,resetCacheForTests} from '../server/golfzon.mjs';
const response=(body,count)=>new Response(JSON.stringify(body),{headers:count==null?{}:{'x-total-count':String(count)}});
const round={roundId:23099,roundNo:1,roundName:'1차전',startTime:1,endTime:2,subs:[23100,23101,23102].map((id,i)=>({subId:id,subName:'ABC'[i],subConfig:{nearestCourse:{holeNo:8}}}))};
const source={userNo:10,userNickname:'테스트 참가자',rank:3,isTieRank:1,totalScore:-3,score:13,roundCount:3,revisionGrade:-15,revisionRoundCount:-1,shopNo:14859,scores:[{score:9},{score:5},{score:-1}]};
test('official total and rank survive normalization without reapplying course or grade adjustments',()=>{
 const result=normalizeEntry(source,[{id:1,label:'A'},{id:2,label:'B'},{id:3,label:'C'}]);
 assert.equal(result.score,-3);assert.equal(result.rank,3);assert.equal(result.tie,true);assert.equal(result.rounds,3);
 assert.deepEqual(result.courseScores.map(c=>c.score),[9,5,-1]);assert.equal(result.adjustments.grade,-15);
});
test('missing score is null rather than zero; genuine even-par zero survives',()=>{
 assert.equal(normalizeEntry({userNo:1}).score,null);assert.equal(normalizeEntry({userNo:1,totalScore:0}).score,0);
 assert.equal(normalizeEntry({userNo:1,scores:[]},[{id:1,label:'A'}]).courseScores[0].score,null);
});
test('pagination follows the count header beyond the first hundred rows',async()=>{
 const urls=[];const result=await fetchPages('ranks/test?gender=0',async url=>{urls.push(url);return response(Array.from({length:urls.length===1?100:3},(_,i)=>({rank:i+1})),103);});
 assert.equal(result.entries.length,103);assert.equal(result.total,103);assert.equal(urls.length,2);assert.match(urls[1],/page=2/);
});
test('invalid shop and phase are rejected before upstream work',async()=>{
 let calls=0;const fetcher=async()=>{calls++;throw Error('must not fetch');};
 assert.equal((await getLeaderboard(new URLSearchParams('shop=999'),fetcher)).status,400);
 assert.equal((await getLeaderboard(new URLSearchParams('round=final'),fetcher)).status,400);assert.equal(calls,0);
});
test('shop-filtered official standings and combined nearest remain separate; creator IDs not exposed',async()=>{
 resetCacheForTests();const urls=[];
 const fetcher=async url=>{urls.push(url);if(url.includes('managements/'))return response({tournamentName:'대회',creatorUserId:'not-for-output',rounds:[round],joinCount:33});if(url.includes('/distance'))return response({courseName:'청룡',holeNo:8,ranks:[{...source,score:3.47}]});return response([source],1);};
 const {body,status}=await getLeaderboard(new URLSearchParams('round=1&shop=14859'),fetcher);
 assert.equal(status,200);assert.equal(body.policy.provisional,false);assert.equal(body.policy.confirmedBy,'client');assert.equal(body.total.entries[0].score,-3);assert.equal(body.total.entries.length,1);assert.equal(body.courses[0].nearest.entries[0].distance,3.47);
 assert.equal(body.event.creatorUserId,undefined);assert.equal(body.total.entries[0].userId,undefined);
 assert.ok(urls.filter(u=>u.includes('/stroke')).every(u=>u.includes('shopNo=14859')));
 assert.ok(urls.filter(u=>u.includes('/distance')).every(u=>!u.includes('shopNo')));
 const before=urls.length;await getLeaderboard(new URLSearchParams('round=1&shop=14859'),fetcher);assert.equal(urls.length,before);
});
test('one failed course is explicit error; a successful empty course remains ok; totals do not change',async()=>{
 resetCacheForTests();const fetcher=async url=>{if(url.includes('managements/'))return response({tournamentName:'대회',rounds:[round]});if(url.includes('courses/23101/stroke'))throw Error('temporary');if(url.includes('/distance'))return response({courseName:'청룡',holeNo:8,ranks:[]});return response(url.includes('/rounds/')?[source]:[],url.includes('/rounds/')?1:0);};
 const {body}=await getLeaderboard(new URLSearchParams('round=1&shop=14859'),fetcher);
 assert.equal(body.total.entries[0].score,-3);assert.equal(body.courses[0].standings.status,'ok');assert.deepEqual(body.courses[0].standings.entries,[]);
 assert.equal(body.courses[1].standings.status,'error');assert.equal(body.courses[1].standings.fetchedAt,null);
});
test('refresh failure keeps last successful records and timestamp, marked stale',async()=>{
 resetCacheForTests();const actualNow=Date.now;let now=actualNow(),fail=false;
 Date.now=()=>now;
 try{
  const fetcher=async url=>{if(url.includes('managements/'))return response({tournamentName:'대회',rounds:[round]});if(fail)throw Error('offline');if(url.includes('/distance'))return response({courseName:'청룡',holeNo:8,ranks:[]});return response([source],1);};
  const params=new URLSearchParams('round=1&shop=14859');const first=(await getLeaderboard(params,fetcher)).body;
  now+=61000;fail=true;const second=(await getLeaderboard(params,fetcher)).body;
  assert.equal(second.total.status,'stale');assert.equal(second.total.fetchedAt,first.total.fetchedAt);
  assert.equal(second.total.entries[0].score,-3);assert.equal(second.total.entries[0].rank,3);
 }finally{Date.now=actualNow;resetCacheForTests();}
});
