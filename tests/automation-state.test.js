'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),automation=require('../automation-state.js'),positions=require('../position-state.js'),fs=require('node:fs'),path=require('node:path');

class FakeTimers{
  constructor(){this.now=0;this.nextId=1;this.tasks=new Map()}
  setTimeout(callback,delay){return this.add(callback,delay,0)}setInterval(callback,delay){return this.add(callback,delay,delay)}
  clearTimeout(id){this.tasks.delete(id)}clearInterval(id){this.tasks.delete(id)}
  add(callback,delay,interval){const id=this.nextId++;this.tasks.set(id,{id,time:this.now+delay,callback,interval});return id}
  advance(milliseconds){const end=this.now+milliseconds;while(true){const due=[...this.tasks.values()].filter(task=>task.time<=end).sort((a,b)=>a.time-b.time||a.id-b.id)[0];if(!due)break;this.now=due.time;if(!this.tasks.has(due.id))continue;if(due.interval)due.time+=due.interval;else this.tasks.delete(due.id);due.callback()}this.now=end}
}

test('Auto starts immediately, counts 3 to 1, and continues automatically',()=>{
  const timers=new FakeTimers(),countdowns=[],requests=[];
  const controller=automation.create({scheduler:timers,onCountdown:value=>countdowns.push(value),onSpinRequested:()=>requests.push(timers.now)});
  assert.equal(controller.start(true),true);assert.deepEqual(requests,[0]);assert.equal(controller.snapshot().state,'spinning');
  controller.spinCompleted(true);assert.equal(controller.snapshot().state,'countdown');assert.deepEqual(countdowns,[3]);
  timers.advance(1000);assert.deepEqual(countdowns,[3,2]);timers.advance(1000);assert.deepEqual(countdowns,[3,2,1]);timers.advance(1000);assert.deepEqual(requests,[0,3000]);assert.equal(controller.snapshot().state,'spinning');
});

test('Pause during countdown cancels it and Resume starts a fresh countdown',()=>{
  const timers=new FakeTimers(),countdowns=[],requests=[];const controller=automation.create({scheduler:timers,onCountdown:value=>countdowns.push(value),onSpinRequested:()=>requests.push(timers.now)});
  controller.start();controller.spinCompleted(true);timers.advance(1000);assert.equal(controller.pause(),true);timers.advance(5000);assert.deepEqual(requests,[0]);
  assert.equal(controller.resume(true),true);assert.equal(countdowns.at(-1),3);timers.advance(3000);assert.deepEqual(requests,[0,9000]);
});

test('Pause while spinning allows completion but prevents the next countdown',()=>{
  const timers=new FakeTimers(),requests=[];const controller=automation.create({scheduler:timers,onSpinRequested:()=>requests.push(timers.now)});
  controller.start();assert.equal(controller.pause(),true);controller.spinCompleted(true);timers.advance(10000);assert.equal(controller.snapshot().state,'paused');assert.deepEqual(requests,[0]);
});

test('Stop preserves progress and permits a new immediate start without stale callbacks',()=>{
  const timers=new FakeTimers(),requests=[];const controller=automation.create({scheduler:timers,onSpinRequested:()=>requests.push(timers.now)});
  controller.start();controller.spinCompleted(true);timers.advance(1000);assert.equal(controller.stop(),true);timers.advance(5000);assert.deepEqual(requests,[0]);assert.equal(controller.start(true),true);assert.deepEqual(requests,[0,6000]);
});

test('Reset and navigation-style pause invalidate countdown callbacks',()=>{
  const timers=new FakeTimers(),requests=[];const controller=automation.create({scheduler:timers,onSpinRequested:()=>requests.push(timers.now)});
  controller.start();controller.spinCompleted(true);controller.reset(true);timers.advance(5000);assert.deepEqual(requests,[0]);assert.equal(controller.snapshot().state,'idle');
  controller.start();controller.spinCompleted(true);controller.pause();timers.advance(5000);assert.deepEqual(requests,[0,5000]);assert.equal(controller.snapshot().state,'paused');
});

test('Reset while spinning returns to idle without scheduling continuation',()=>{
  const timers=new FakeTimers(),requests=[];const controller=automation.create({scheduler:timers,onSpinRequested:()=>requests.push(timers.now)});
  controller.start();controller.reset(true);timers.advance(10000);assert.equal(controller.snapshot().state,'idle');assert.deepEqual(requests,[0]);
});

for(const count of [2,3,12,60])for(const direction of ['first','last'])test(`Auto spins ${count-1} times and directly completes final ${direction} position`,()=>{
  const timers=new FakeTimers(),unselected=Array.from({length:count},(_,index)=>`Participant ${index+1}`),assignments=new Map();let positionState=positions.create(count,direction),requests=0,finalAssignments=0,countdowns=0;let controller;
  controller=automation.create({scheduler:timers,onCountdown:()=>countdowns++,onSpinRequested:()=>{requests++;const begun=positions.beginSpin(positionState);assert.equal(begun.accepted,true);assignments.set(positions.displayed(begun.state),unselected.shift());positionState=positions.completeSpin(begun.state).state;if(positionState.remaining.length===1){const final=positions.completeFinal(positionState);assert.equal(final.accepted,true);assignments.set(final.position,unselected.shift());positionState=final.state;finalAssignments++;controller.spinCompleted(false)}else controller.spinCompleted(positionState.remaining.length>0)}});
  controller.start(true);while(controller.snapshot().state!=='complete')timers.advance(3000);
  assert.equal(requests,count-1);assert.equal(finalAssignments,1);assert.equal(assignments.size,count);assert.equal(new Set(assignments.values()).size,count);assert.equal(unselected.length,0);assert.equal(countdowns,(count-2)*3);assert.equal(timers.tasks.size,0);assert.equal(new Set(positionState.completed).size,count);assert.ok(positionState.completed.every(position=>position>=1&&position<=count));assert.equal(positions.displayed(positionState),direction==='first'?count:1);assert.equal(controller.snapshot().state,'complete');
});

test('rapid starts, refresh-safe initialization, completion, and reduced-motion-independent countdown are safe',()=>{
  const timers=new FakeTimers(),requests=[];const controller=automation.create({scheduler:timers,onSpinRequested:()=>requests.push(timers.now)});
  assert.equal(controller.snapshot().state,'idle');controller.restore(true,true);assert.equal(controller.snapshot().state,'stopped');assert.deepEqual(requests,[]);assert.equal(controller.start(),true);assert.equal(controller.start(),false);assert.deepEqual(requests,[0]);controller.spinCompleted(false);assert.equal(controller.snapshot().state,'complete');assert.equal(controller.start(false),false);
});

test('runtime shares one spin path and wires timer cancellation, navigation, visibility, reset, and synchronized displays',()=>{
  const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
  assert.match(html,/onSpinRequested:\(\)=>\{if\(!executeSpin\(true\)\)autoController\.stop\(\)\}/);
  assert.match(html,/else executeSpin\(false\)/);
  assert.equal((html.match(/function executeSpin\(/g)||[]).length,1);
  assert.match(html,/function assignFinalAutoParticipant\(\).*remaining\.length!==1.*positionState\.remaining\.length!==1.*SpinOrderPositions\.completeFinal\(positionState\).*autoController\.spinCompleted\(false\)/s);
  const finalAssignmentBody=html.match(/function assignFinalAutoParticipant\(\)\{([\s\S]*?)\n\}/)?.[1]||'';
  assert.doesNotMatch(finalAssignmentBody,/executeSpin|startTicker|wheel\.style\.transform|spinDuration/);
  assert.match(html,/spinCompletionTimeoutId=null,spinSettleTimeoutId=null,resultPopTimeoutId=null,runtimeGeneration=0/);
  assert.match(html,/function cancelAllPendingActions\(\).*runtimeGeneration\+=1;clearSpinTimers\(\);autoController\.clearCountdownTimers\(\)/s);
  assert.match(html,/function initializeRandomizer\(names\)\{cancelAllPendingActions\(\)/);
  assert.match(html,/if\(view!=='randomizer'\)pauseAutoSafely\(\)/);
  assert.match(html,/visibilitychange'.*document\.hidden.*pauseAutoSafely\(\)/);
  assert.match(html,/autoController\.restore\(positionState\.remaining\.length>0,hasCompletedSpin\)/);
  assert.match(html,/spinDuration=reducedMotion\?0:4300/);
  assert.match(html,/function editCurrentSetup\(\).*pauseAutoSafely\(\);autoController\.clearCountdownTimers\(\).*if\(locked\|\|positionState\.phase==='spinning'\).*pendingSetupNavigation=true/s);
  assert.match(html,/if\(pendingSetupNavigation\).*editCurrentSetup\(\)/s);
  assert.match(html,/if\(view==='setup'\)autoController\.clearCountdownTimers\(\)/);
  assert.match(html,/locked=true;syncEditingAvailability\(\);renderPosition\(\)/);
  assert.match(html,/pickNum\.textContent=selectedPosition\.textContent/);
  assert.match(html,/aria-live="polite"/);
});
