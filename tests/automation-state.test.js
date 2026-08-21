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

for(const count of [2,3,5,12,60])for(const direction of ['first','last'])test(`Auto spins ${count-1} times and directly completes final ${direction} position`,()=>{
  const timers=new FakeTimers(),unselected=Array.from({length:count},(_,index)=>`Participant ${index+1}`),assignments=new Map();let positionState=positions.create(count,direction),requests=0,finalAssignments=0,countdowns=0;let controller;
  controller=automation.create({scheduler:timers,onCountdown:()=>countdowns++,onSpinRequested:()=>{requests++;const begun=positions.beginSpin(positionState);assert.equal(begun.accepted,true);assignments.set(positions.displayed(begun.state),unselected.shift());positionState=positions.completeSpin(begun.state).state;if(positionState.remaining.length===1){const final=positions.completeFinal(positionState);assert.equal(final.accepted,true);assignments.set(final.position,unselected.shift());positionState=final.state;finalAssignments++;controller.spinCompleted(false)}else controller.spinCompleted(positionState.remaining.length>0)}});
  controller.start(true);while(controller.snapshot().state!=='complete')timers.advance(3000);
  assert.equal(requests,count-1);assert.equal(finalAssignments,1);assert.equal(assignments.size,count);assert.equal(new Set(assignments.values()).size,count);assert.equal(unselected.length,0);assert.equal(countdowns,(count-2)*3);assert.equal(timers.tasks.size,0);assert.equal(new Set(positionState.completed).size,count);assert.ok(positionState.completed.every(position=>position>=1&&position<=count));assert.equal(positions.displayed(positionState),direction==='first'?count:1);assert.equal(controller.snapshot().state,'complete');
});

for(const mode of ['Manual','Auto'])for(const count of [2,3,5,12,60])for(const direction of ['first','last'])test(`${mode} holds ${count} ${direction} finalization for 2000ms after ${count-1} animations`,()=>{
  const timers=new FakeTimers(),participants=Array.from({length:count},(_,index)=>({name:`Participant ${index+1}`})),eligible=[...participants],assignments=new Map();let displayed=[...participants],pendingVisualRemoval=null,positionState=positions.create(count,direction),animations=0,finalizationState='idle';
  while(eligible.length>1){if(pendingVisualRemoval){displayed=displayed.filter(participant=>participant!==pendingVisualRemoval);pendingVisualRemoval=null}const begun=positions.beginSpin(positionState);assert.equal(begun.accepted,true);animations++;const selected=eligible.shift();assignments.set(positions.displayed(begun.state),selected);pendingVisualRemoval=selected;positionState=positions.completeSpin(begun.state).state;if(eligible.length===1&&positionState.remaining.length===1){finalizationState='finalizing';timers.setTimeout(()=>{const final=positions.completeFinal(positionState);assert.equal(final.accepted,true);assignments.set(final.position,eligible[0]);displayed=[eligible[0]];eligible.length=0;pendingVisualRemoval=null;positionState=final.state;finalizationState='complete'},2000)}}
  assert.equal(animations,count-1);assert.equal(assignments.size,count-1);assert.equal(displayed.length,2);assert.notEqual(pendingVisualRemoval,null);assert.equal(finalizationState,'finalizing');timers.advance(1999);assert.equal(assignments.size,count-1);assert.equal(displayed.length,2);assert.equal(positionState.phase,'idle');timers.advance(1);
  assert.equal(assignments.size,count);assert.equal([...assignments.values()].some(value=>!value),false);assert.equal(displayed.length,1);const finalPosition=direction==='first'?count:1;assert.equal(displayed[0],assignments.get(finalPosition));assert.equal(pendingVisualRemoval,null);assert.equal(positionState.phase,'complete');assert.equal(positions.displayed(positionState),finalPosition);assert.equal(finalizationState,'complete');assert.equal(timers.tasks.size,0);
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
  assert.match(html,/function finalizeDeterministicParticipant\(\).*remaining\.length!==1.*positionState\.remaining\.length!==1.*SpinOrderPositions\.completeFinal\(positionState\).*autoController\.spinCompleted\(false\)/s);
  const finalAssignmentBody=html.match(/function finalizeDeterministicParticipant\(\)\{([\s\S]*?)\n\}/)?.[1]||'';
  assert.doesNotMatch(finalAssignmentBody,/executeSpin|startTicker|wheel\.style\.transform|spinDuration/);
  assert.match(finalAssignmentBody,/wheelParticipants=\[participant\];pendingVisualRemoval=null/);
  assert.match(finalAssignmentBody,/drawWheel\(\).*ticker\.textContent=`🎯 \$\{participant\.name\}`.*drawResults\(\);renderPosition\(\)/s);
  assert.match(html,/spinCompletionTimeoutId=null,spinSettleTimeoutId=null,resultPopTimeoutId=null,finalizationTimeoutId=null,finalizationState='idle',runtimeGeneration=0/);
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

test('runtime separates eligible participants from the landed visual wedge',()=>{
  const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
  assert.match(html,/remaining=SpinOrderParticipants\.wheelEntries\(eventParticipants,colors\),wheelParticipants=\[\.\.\.remaining\],pendingVisualRemoval=null/);
  assert.match(html,/function drawWheel\(\).*n=wheelParticipants\.length.*wheelParticipants\[index\]\.color.*participant=wheelParticipants\[index\]/s);
  assert.match(html,/const idx=rand\(remaining\.length\),selected=remaining\[idx\],visualIndex=wheelParticipants\.findIndex/);
  assert.match(html,/remaining\.splice\(idx,1\);pendingVisualRemoval=selected/);
  assert.match(html,/function removePendingVisualParticipant\(\).*wheelParticipants=wheelParticipants\.filter\(participant=>participant\.name!==name\);pendingVisualRemoval=null;drawWheel\(\)/s);
  assert.match(html,/beginSpin\(positionState\);if\(!started\.accepted\)return false;removePendingVisualParticipant\(\);positionState=started\.state/);
  const settle=html.match(/spinSettleTimeoutId=setTimeout\(\(\)=>\{([\s\S]*?)\},settleDuration\)/)?.[1]||'';
  assert.doesNotMatch(settle,/removePendingVisualParticipant|drawWheel/);
  assert.match(html,/function initializeRandomizer\(names\).*wheelParticipants=\[\.\.\.remaining\];pendingVisualRemoval=null/s);
});

test('runtime shared deterministic assignment and Home teardown avoid extra work and stale event state',()=>{
  const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
  const finalBody=html.match(/function finalizeDeterministicParticipant\(\)\{([\s\S]*?)\n\}/)?.[1]||'';
  assert.match(finalBody,/remaining\.length!==1\|\|positionState\.remaining\.length!==1/);
  assert.match(finalBody,/SpinOrderPositions\.completeFinal\(positionState\)/);
  assert.match(finalBody,/remaining=\[\];wheelParticipants=\[participant\];pendingVisualRemoval=null/);
  assert.match(finalBody,/clearSpinTimers\(\).*autoController\.spinCompleted\(false\)/s);
  assert.match(finalBody,/ticker\.textContent=`🎯 \$\{participant\.name\}`/);
  assert.doesNotMatch(finalBody,/executeSpin|startTicker|wheel\.style\.transform|play/);
  assert.match(html,/function scheduleDeterministicFinalization\(\).*finalizationState='finalizing'.*setTimeout\(\(\)=>.*finalizeDeterministicParticipant\(\).*},2000\)/s);
  assert.match(html,/if\(scheduleDeterministicFinalization\(\)\)/);
  assert.doesNotMatch(html,/automated&&!finalizeDeterministicParticipant/);
  const homeBody=html.match(/function returnHome\(\)\{([\s\S]*?)\n\}/)?.[1]||'';
  assert.match(homeBody,/window\.confirm\('Return home and clear this randomizer\? This cannot be undone\.'\)/);
  assert.match(homeBody,/cancelAllPendingActions\(\);autoController\.reset\(false\)/);
  assert.match(homeBody,/setupValues=\{\.\.\.SpinOrderSetup\.DEFAULT_VALUES\}/);
  assert.match(homeBody,/participantNames=\[\].*importedFilename=''.*pendingVisualRemoval=null.*picks=\{\}.*wheelRotation=0/s);
  assert.match(homeBody,/SpinOrderFavicons\.update\(document,'Football'\).*showView\('landing',true\)/s);
  assert.doesNotMatch(homeBody,/sessionStorage\.clear|localStorage\.clear/);
  assert.match(html,/homeButton\.addEventListener\('click',returnHome\)/);
});

test('finalization timeout is cancellable and stale callbacks cannot complete cleared state',()=>{
  const timers=new FakeTimers();let generation=0,state='idle',assignments=1,timeoutId=null;
  function schedule(){state='finalizing';const token=generation;timeoutId=timers.setTimeout(()=>{if(token!==generation||state!=='finalizing')return;assignments++;state='complete';timeoutId=null},2000)}
  function cancel(){generation++;if(timeoutId!==null)timers.clearTimeout(timeoutId);timeoutId=null;state='idle'}
  schedule();timers.advance(1999);assert.equal(assignments,1);assert.equal(state,'finalizing');cancel();timers.advance(1);assert.equal(assignments,1);assert.equal(state,'idle');schedule();cancel();timers.advance(5000);assert.equal(assignments,1);assert.equal(timers.tasks.size,0);
  const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');assert.match(html,/function clearSpinTimers\(\).*finalizationTimeoutId!==null.*clearTimeout\(finalizationTimeoutId\).*finalizationState='idle'/s);assert.match(html,/function cancelAllPendingActions\(\).*runtimeGeneration\+=1;clearSpinTimers\(\)/s);assert.match(html,/function showView\(view,moveFocus=false\).*view!=='randomizer'&&finalizationState==='finalizing'.*cancelAllPendingActions\(\)/s);assert.match(html,/function editCurrentSetup\(\).*finalizationState==='finalizing'.*cancelAllPendingActions\(\)/s);assert.match(html,/function resetDraft\(\)\{initializeRandomizer\(eventParticipants\)\}/);assert.match(html,/function returnHome\(\).*cancelAllPendingActions\(\)/s);
});

test('header actions use aligned responsive grids and the visible reset label is fixed',()=>{
  const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');assert.match(html,/<div class="topbar-actions">[\s\S]*id="homeButton"[\s\S]*id="editSetup"[\s\S]*id="editNames"[\s\S]*id="reset"[^>]*>↻ Reset Order<\/button>[\s\S]*<\/div>/);assert.match(html,/\.topbar-actions\{display:grid;grid-auto-flow:column;grid-auto-columns:max-content;align-items:stretch;gap:10px/);assert.match(html,/\.topbar-actions button\{display:inline-flex;align-items:center;justify-content:center;min-height:46px;.*white-space:nowrap/);assert.match(html,/@media\(max-width:1040px\).*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/s);assert.match(html,/@media\(max-width:600px\).*\.topbar-actions\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\);gap:8px\}/s);assert.match(html,/reset\.textContent='↻ Reset Order';reset\.setAttribute\('aria-label',`Reset \$\{label\}`\)/);
});
