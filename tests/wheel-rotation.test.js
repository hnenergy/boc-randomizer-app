'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),wheel=require('../wheel-rotation.js'),fs=require('node:fs'),path=require('node:path');

function landsAtPointer(result,section){
  const localCenterDegrees=wheel.degrees(section.centerAngle-section.baseAngle),landed=wheel.normalize(result.rotation+localCenterDegrees);
  assert.ok(landed<1e-9||Math.abs(landed-360)<1e-9,`segment center landed at ${landed} degrees`);
}

test('every label center angle is the exact midpoint of its wedge',()=>{
  for(const count of [1,4,5,6,10,11,12,59,60])for(const section of wheel.sections(count)){assert.ok(Math.abs(section.centerAngle-(section.startAngle+section.endAngle)/2)<1e-12);assert.ok(Math.abs((section.endAngle-section.startAngle)-Math.PI*2/count)<1e-12)}
});

test('one participant uses one full-circle wedge with a safe label anchor',()=>{
  const layout=wheel.layout(1,500,58,5),section=layout.sections[0];assert.equal(layout.sections.length,1);assert.ok(Math.abs(section.sliceAngle-Math.PI*2)<1e-12);assert.ok(Math.abs(section.endAngle-section.startAngle-Math.PI*2)<1e-12);const radius=Math.hypot(section.x-layout.centerX,section.y-layout.centerY);assert.ok(radius>layout.hubRadius&&radius<layout.wheelRadius);assert.equal(radius,layout.labelRadius);
});

test('redraw geometry is recalculated for 12 to 10, 6 to 4, and 60 to 59 participants',()=>{
  for(const sequence of [[12,11,10],[6,5,4],[60,59]])for(const count of sequence){const layout=wheel.layout(count,500,58,5),sections=layout.sections;assert.equal(sections.length,count);assert.equal(sections[0].sliceAngle,Math.PI*2/count);assert.ok(Math.abs(sections.at(-1).endAngle-(wheel.BASE_ANGLE+Math.PI*2))<1e-12);for(const section of sections){const radius=Math.hypot(section.x-layout.centerX,section.y-layout.centerY),angle=Math.atan2(section.y-layout.centerY,section.x-layout.centerX);assert.ok(radius>layout.hubRadius&&radius<layout.wheelRadius);assert.ok(Math.abs(radius-layout.labelRadius)<1e-9);assert.ok(Math.abs(angle-section.centerAngle)<1e-9||Math.abs(angle-section.centerAngle+Math.PI*2)<1e-9)}}
});

test('local coordinates are deterministic and independent of cumulative rotation',()=>{
  for(const count of [5,6,12,60]){const first=wheel.layout(count,420,46,5),second=wheel.layout(count,420,46,5);assert.deepEqual(second,first);let cumulative=9876.5;const spun=wheel.next(cumulative,first.sections[Math.min(3,count-1)],7);cumulative=spun.rotation;assert.ok(cumulative>9876.5);assert.deepEqual(wheel.layout(count,420,46,5),first)}
});

test('consecutive Manual and Auto style spins preserve cumulative rotation and alignment',()=>{
  let current=137.5;for(const [index,count,turns] of [[3,12,7],[5,11,6],[2,10,8],[4,6,6],[1,5,9]]){const section=wheel.sections(count)[index],result=wheel.next(current,section,turns);assert.equal(result.rotation,current+result.delta);assert.ok(result.delta>=turns*360);landsAtPointer(result,section);current=result.rotation}assert.ok(current>137.5);
});

test('selected wedges align for both reveal directions and all supported counts',()=>{
  for(const direction of ['first','last'])for(const count of [2,3,12,20,60]){const sections=wheel.sections(count),indexes=direction==='first'?[...sections.keys()]:[...sections.keys()].reverse();for(const index of indexes)landsAtPointer(wheel.next(12345.25,sections[index],6),sections[index])}assert.equal(wheel.next(0,null,6),null);assert.equal(wheel.normalize(-30),330);
});

test('long visual labels shrink and truncate without losing the accessible full name',()=>{
  const measure=(text,size)=>text.length*size,short=wheel.fitLabel('Team A',100,14,8,measure),long=wheel.fitLabel('A participant name that is much too long',36,14,6,measure);assert.equal(short.text,'Team A');assert.equal(short.truncated,false);assert.equal(long.truncated,true);assert.ok(long.text.endsWith('…'));assert.equal(long.fullName,'A participant name that is much too long');assert.ok(measure(long.text,long.fontSize)<=36);
});

test('runtime uses shared local geometry and preserves container rotation until reset',()=>{
  const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');assert.match(html,/<div class="wheel" id="wheel"><canvas[^>]+id="wheelCanvas"[^>]*><\/canvas><\/div>\s*<div class="hub" id="wheelHub">/);assert.doesNotMatch(html,/class="labels"|class="team-label"/);assert.match(html,/wheelContext\.setTransform\(dpr,0,0,dpr,0,0\);wheelContext\.clearRect\(0,0,size,size\)/);assert.match(html,/SpinOrderWheelRotation\.layout\(n,size,hubRadius,5\);wheelSections=layout\.sections/);assert.match(html,/wheelContext\.arc\(layout\.centerX,layout\.centerY,layout\.wheelRadius,section\.startAngle,section\.endAngle\)/);assert.match(html,/wheelContext\.translate\(section\.x,section\.y\).*textAlign='center'.*textBaseline='middle'.*fillText\(fitted\.text,0,0,section\.maxTextWidth\).*wheelContext\.restore\(\)/s);assert.match(html,/SpinOrderWheelRotation\.next\(wheelRotation,wheelSections\[visualIndex\],6\+rand\(4\)\);wheelRotation=rotation\.rotation/);assert.match(html,/team\.textContent=participant\?participant\.name/);
  const drawBody=html.match(/function drawWheel\(\)\{([\s\S]*?)\n\}/)?.[1]||'';assert.equal((drawBody.match(/wheelContext\.save\(\)/g)||[]).length,(drawBody.match(/wheelContext\.restore\(\)/g)||[]).length);assert.doesNotMatch(drawBody,/wheelRotation/);assert.match(drawBody,/for\(const \[index,section\] of wheelSections\.entries\(\)\).*fillText/s);
  const settle=html.match(/spinSettleTimeoutId=setTimeout\(\(\)=>\{([\s\S]*?)\},settleDuration\)/)?.[1]||'';assert.doesNotMatch(settle,/rotate\(0deg\)|wheelRotation=0/);const finalAssignment=html.match(/function finalizeDeterministicParticipant\(\)\{([\s\S]*?)\n\}/)?.[1]||'';assert.doesNotMatch(finalAssignment,/SpinOrderWheelRotation\.next|wheel\.style\.transform/);assert.match(finalAssignment,/wheelParticipants=\[participant\];pendingVisualRemoval=null.*drawWheel\(\)/s);assert.match(html,/function initializeRandomizer\(names\).*wheelRotation=0.*rotate\(\$\{wheelRotation\}deg\)/s);
});
