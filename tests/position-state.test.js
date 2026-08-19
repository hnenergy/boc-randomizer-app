'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),positions=require('../position-state.js'),fs=require('node:fs'),path=require('node:path');

for(const count of [2,12,60])for(const direction of ['first','last'])test(`${count} participants, ${direction}: initial through final and reset positions stay synchronized and in range`,()=>{
  let state=positions.create(count,direction),expected=direction==='first'?Array.from({length:count},(_,i)=>i+1):Array.from({length:count},(_,i)=>count-i);
  assert.equal(positions.displayed(state),expected[0]);
  for(const position of expected){
    const started=positions.beginSpin(state);assert.equal(started.accepted,true);state=started.state;
    assert.equal(state.phase,'spinning');assert.equal(positions.displayed(state),position);assert.ok(position>=1&&position<=count);
    const duplicate=positions.beginSpin(state);assert.equal(duplicate.accepted,false);assert.equal(duplicate.state,state);
    const completed=positions.completeSpin(state);assert.equal(completed.accepted,true);state=completed.state;
    assert.equal(completed.position,position);assert.equal(positions.displayed(state),position);assert.ok(positions.displayed(state)>=1&&positions.displayed(state)<=count);
  }
  assert.equal(state.phase,'complete');assert.equal(positions.next(state),null);assert.equal(positions.beginSpin(state).accepted,false);assert.equal(positions.displayed(state),expected.at(-1));
  state=positions.create(count,direction);assert.equal(positions.displayed(state),expected[0]);assert.equal(state.completed.length,0);
});

test('restoration derives the displayed position from the most recently completed result',()=>{
  assert.equal(positions.displayed(positions.restore(12,'last',[12,11,10])),10);
  assert.equal(positions.displayed(positions.restore(12,'first',[1,2,3])),3);
  assert.equal(positions.displayed(positions.restore(60,'last',Array.from({length:60},(_,i)=>60-i))),1);
});

test('runtime uses one renderer for both displays and protects animation, reduced motion, navigation, and cosmetic edits',()=>{
  const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
  assert.match(html,/function renderPosition\(\).*pickNum\.textContent=selectedPosition\.textContent/s);
  assert.match(html,/const started=SpinOrderPositions\.beginSpin\(positionState\);if\(!started\.accepted\)return/);
  assert.match(html,/setStatus\(`Spinning for position \$\{position\}`\)/);
  assert.match(html,/prefersReducedMotion\(\).*matchMedia/s);
  assert.match(html,/function editCurrentSetup\(\).*showView\('setup',true\)/s);
  assert.doesNotMatch(html,/currentRank|positionQueue/);
});
