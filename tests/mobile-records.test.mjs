import test from 'node:test';
import assert from 'node:assert/strict';
import {mobileSearchPlayers} from '../src/mobile-records.mjs';
const official={id:'a',nickname:'Alpha',rank:2,tie:true,score:-7};
const data={total:{status:'ok',entries:[official]},courses:[{label:'A',standings:{entries:[{...official,rank:1,score:-4},{id:'b',nickname:'Beta',rank:3,score:-2}]},nearest:{entries:[{id:'c',nickname:'Charlie',rank:1,distance:1.2}]}}]};
test('search keeps official combined score and tie instead of overwriting from a course',()=>{assert.deepEqual(mobileSearchPlayers(data,' ALP ')[0],{...official,viewLabel:'합산'});});
test('course-only participant is searchable without a fabricated combined rank or score',()=>{const p=mobileSearchPlayers(data,'beta')[0];assert.equal(p.rank,null);assert.equal(p.score,null);assert.equal(p.incomplete,true);});
test('shop score search excludes combined nearest-only records; nearest search can include them',()=>{assert.equal(mobileSearchPlayers(data,'charlie').length,0);assert.equal(mobileSearchPlayers(data,'charlie',{includeNearest:true})[0].nearCourse,'A');});
test('failed combined resource is unavailable rather than claimed incomplete',()=>{const p=mobileSearchPlayers({...data,total:{status:'error',entries:[]}},'beta')[0];assert.equal(p.incomplete,false);assert.equal(p.aggregateUnavailable,true);});
