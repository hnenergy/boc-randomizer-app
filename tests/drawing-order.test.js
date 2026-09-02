'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const setup=require('../setup-state.js'),teams=require('../team-assignment.js'),participants=require('../participant-state.js'),exportsApi=require('../results-export.js');
const root=path.join(__dirname,'..'),app=fs.readFileSync(path.join(root,'index.html'),'utf8');
function sequence(values){let index=0;return()=>values[index++%values.length]}
function drawAll(names,nextUint32){const remaining=[...names],drawn=[];while(remaining.length){const index=teams.randomIndex(remaining.length,nextUint32);drawn.push(remaining.splice(index,1)[0])}return drawn}

test('drawing-order preset applies Generic Drawing Order, position 1 first, and manual mode',()=>{
  const expected={...setup.DEFAULT_VALUES,activity:'Generic',activityLabel:'Drawing Order',revealOrder:'first'};
  assert.deepEqual(setup.valuesForPreset('drawing-order'),expected);assert.equal(setup.displayLabel(expected),'Drawing Order');assert.equal(expected.eventName,'');assert.equal(expected.spinMode,'manual');
  assert.equal(setup.presetFromSearch('?preset=drawing-order'),'drawing-order');assert.equal(setup.presetFromSearch('?preset=drawing-order-other'),null);assert.equal(setup.presetFromSearch('?preset=unknown'),null);
  assert.deepEqual(participants.revealPositions(5,expected.revealOrder),[1,2,3,4,5]);
});

test('preset persists before safe URL cleanup and refresh preserves user edits',()=>{
  const data=new Map(),storage={setItem:(key,value)=>data.set(key,value),getItem:key=>data.get(key)||null};const applied=setup.applyPreset(storage,'?preset=drawing-order');assert.equal(applied.key,'drawing-order');assert.deepEqual(setup.load(storage),applied.values);
  const edited={...applied.values,eventName:'Presentation Sequence'};assert.equal(setup.save(storage,edited),true);assert.deepEqual(setup.load(storage),edited);assert.equal(setup.presetFromSearch(''),null);
  assert.match(app,/if\(presetApplication\)history\.replaceState\(\{spinorderView:'setup'\},'',location\.pathname\+'#setup'\)/);assert.doesNotMatch(app,/participant.*URLSearchParams|URLSearchParams.*participant/is);
});

test('Drawing Order reuses random selection/removal, selects each participant once, and reset restores names',()=>{
  const names=['A','B','C','D','E','F'],drawn=drawAll(names,sequence([5,1,3,0,1,0]));assert.equal(drawn.length,names.length);assert.equal(new Set(drawn).size,names.length);assert.deepEqual([...drawn].sort(),[...names].sort());
  assert.match(app,/function rand\(max\)\{return SpinOrderTeams\.randomIndex\(max\)\}/);assert.match(app,/const destinationTeam=currentDestinationTeam\(\),idx=rand\(remaining\.length\),selected=remaining\[idx\]/);assert.match(app,/remaining\.splice\(idx,1\)/);
  assert.match(app,/function resetDraft\(\)\{initializeRandomizer\(eventParticipants\)\}/);assert.doesNotMatch(app,/drawingOrderAlgorithm|drawingShuffle|preassignDrawing/);
});

test('manual and automatic Drawing Order use the shared spin path without skip controls',()=>{
  assert.equal((app.match(/function executeSpin\(/g)||[]).length,1);assert.match(app,/onSpinRequested:\(\)=>\{if\(!executeSpin\(true\)\)autoController\.stop\(\)\}/);assert.match(app,/else executeSpin\(false\)/);
  for(const action of ['pauseAuto','resumeAuto','stopAuto']){const handler=app.match(new RegExp(`${action}\\.addEventListener\\('click',([^;]+)`))?.[1]||'';assert.ok(handler);assert.doesNotMatch(handler,/remaining\.splice|completeSpin|randomIndex/)}
});

test('existing Drawing Order sharing and exports retain complete position-first output',()=>{
  const data=exportsApi.model({eventName:'Drawing',activity:'Generic',orderType:'Drawing Order',revealOrder:'first',completedAt:'2026-09-02T12:00:00Z',picks:{1:{name:'A'},2:{name:'B'},3:{name:'C'}},total:3});
  assert.equal(data.classroomPicker,false);assert.equal(data.revealDirection,'Position 1 first');assert.match(exportsApi.text(data),/Drawing Order[\s\S]*Position 1 first[\s\S]*1\. A\n2\. B\n3\. C/);assert.match(exportsApi.csv(data),/^\uFEFF"Position","Name"/);assert.match(decodeURIComponent(exportsApi.mailUrl('gmail',data).url),/1\. A\n2\. B\n3\. C/);
});
