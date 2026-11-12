import test from 'node:test';
import assert from 'node:assert/strict';
import {shouldDismissSheet,motionDuration} from '../src/mobile-motion.mjs';
test('a deliberate downward drag closes a sheet even when slow',()=>assert.equal(shouldDismissSheet({dy:120,dx:8,elapsed:600,height:420}),true));
test('a fast short flick closes, but a tap or horizontal gesture never does',()=>{
 assert.equal(shouldDismissSheet({dy:40,dx:2,elapsed:40,height:420}),true);
 assert.equal(shouldDismissSheet({dy:8,dx:0,elapsed:8,height:420}),false);
 assert.equal(shouldDismissSheet({dy:110,dx:140,elapsed:100,height:420}),false);
 assert.equal(shouldDismissSheet({dy:-120,elapsed:100}),false);
});
test('small drags and invalid measurements snap back',()=>{
 assert.equal(shouldDismissSheet({dy:40,elapsed:300}),false);
 assert.equal(shouldDismissSheet({dy:NaN,elapsed:300}),false);
});
test('reduced motion and desktop skip animations; mobile exit is shorter than entry',()=>{
 assert.equal(motionDuration(true),0);assert.equal(motionDuration(false,true),0);
 assert.ok(motionDuration(false,false,true)<motionDuration(false));
});
