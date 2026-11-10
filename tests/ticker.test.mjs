import test from 'node:test';
import assert from 'node:assert/strict';
import {buildTickerItems} from '../src/ticker.mjs';
const player={id:'one',nickname:'참가자',rank:1,tie:true,score:-3,distance:1.86};
const data={total:{entries:[player]},courses:[{label:'A',standings:{entries:[{...player,score:0}]},nearest:{entries:[player]}}]};
test('score ticker preserves official ties and final scores without inventing movement',()=>{
 const result=buildTickerItems(data,false);
 assert.equal(result[0].rank,'T1');assert.equal(result[0].value,'-3');assert.equal(result[1].value,'E');
 assert.deepEqual(result.map(r=>r.scope),['합산','A코스']);
 assert.ok(result.every(r=>!('change' in r)));
});
test('nearest ticker only uses combined nearest records and metres',()=>{
 const result=buildTickerItems(data,true);
 assert.equal(result.length,1);assert.equal(result[0].value,'1.86 m');assert.equal(result[0].scope,'A코스');
});
test('missing and unranked records never become fabricated ticker values',()=>{
 assert.deepEqual(buildTickerItems(undefined,false),[]);assert.deepEqual(buildTickerItems({},false),[]);
 const result=buildTickerItems({total:{entries:[{...player,score:null},{...player,rank:null}]}},false);
 assert.deepEqual(result,[]);
});
