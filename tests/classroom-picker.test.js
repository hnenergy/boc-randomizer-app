'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const setup=require('../setup-state.js'),teams=require('../team-assignment.js'),exportsApi=require('../results-export.js'),participants=require('../participant-state.js');
const root=path.join(__dirname,'..'),app=fs.readFileSync(path.join(root,'index.html'),'utf8');
function sequence(values){let index=0;return()=>values[index++%values.length]}
function selectAll(names,nextUint32){const remaining=[...names],selected=[];while(remaining.length){const index=teams.randomIndex(remaining.length,nextUint32);selected.push(remaining.splice(index,1)[0])}return selected}

test('Classroom activity derives Name Picker and always uses first-selection order',()=>{
  assert.equal(setup.ACTIVITIES.Classroom,'🎓');
  const classroom=setup.normalize({...setup.DEFAULT_VALUES,activity:'Classroom',activityLabel:'Random Order',revealOrder:'last'});
  assert.equal(classroom.activityLabel,'Random Order');assert.equal(classroom.revealOrder,'first');assert.equal(setup.displayLabel(classroom),'Name Picker');
  for(const activity of ['Football','Baseball','Golf','Basketball','Generic'])assert.equal(setup.displayLabel({...setup.DEFAULT_VALUES,activity,activityLabel:'Random Order'}),'Random Order');
  assert.deepEqual(participants.revealPositions(4,classroom.revealOrder),[1,2,3,4]);
});

test('existing unbiased selection/removal path selects every student once and reset restores the list',()=>{
  const names=['Ava','Ben','Cam','Drew','Eli'],selected=selectAll(names,sequence([4,1,2,0,0]));
  assert.equal(selected.length,names.length);assert.equal(new Set(selected).size,names.length);assert.deepEqual([...selected].sort(),[...names].sort());
  const reset=[...names];assert.deepEqual(reset,names);
  assert.match(app,/const destinationTeam=currentDestinationTeam\(\),idx=rand\(remaining\.length\),selected=remaining\[idx\]/);
  assert.match(app,/remaining\.splice\(idx,1\)/);assert.match(app,/function resetDraft\(\)\{initializeRandomizer\(eventParticipants\)\}/);
  assert.doesNotMatch(app,/classroomShuffle|studentPickerAlgorithm|preassignStudents/);
});

test('Classroom terminology covers setup, entry, status, results, reset, accessibility, and image export',()=>{
  assert.match(app,/randomOrderModeLabel\.textContent=setupForm\.elements\.activity\.value==='Classroom'\?'Name Picker':'Random Order'/);
  assert.match(app,/Student name/);assert.match(app,/Add student/);assert.match(app,/Import \$\{copy\.namePlural\.toLowerCase\(\)\}/);
  assert.match(app,/student\$\{remaining\.length===1\?'':'s'\} remaining/);assert.match(app,/Selected student/);assert.match(app,/Selected Students/);assert.match(app,/All students selected/);assert.match(app,/Reset Picker/);
  assert.match(app,/currentPositionLabel\.textContent=classroom\?'CURRENT SELECTION':'CURRENT POSITION'/);assert.match(app,/selectedPositionLabel\.textContent=classroom\?'SELECTED STUDENT':'SELECTED POSITION'/);
  assert.match(app,/data\.classroomPicker\?`Selected \$\{item\.position\}/);
  assert.match(app,/onSpinRequested:\(\)=>\{if\(!executeSpin\(true\)\)autoController\.stop\(\)\}/);assert.match(app,/else executeSpin\(false\)/);
});

test('classroom-picker preset applies, cleans safely, and refresh preserves edits',()=>{
  const expected={...setup.DEFAULT_VALUES,activity:'Classroom',activityLabel:'Random Order',revealOrder:'first'};
  assert.deepEqual(setup.valuesForPreset('classroom-picker'),expected);assert.equal(setup.presetFromSearch('?preset=classroom-picker'),'classroom-picker');assert.equal(setup.presetFromSearch('?preset=unknown'),null);
  const data=new Map(),storage={setItem:(key,value)=>data.set(key,value),getItem:key=>data.get(key)||null};const applied=setup.applyPreset(storage,'?preset=classroom-picker');assert.deepEqual(applied.values,expected);assert.deepEqual(setup.load(storage),expected);
  const edited={...expected,eventName:'Morning Participation'};assert.equal(setup.save(storage,edited),true);assert.deepEqual(setup.load(storage),edited);assert.equal(setup.presetFromSearch(''),null);
  assert.match(app,/if\(presetApplication\)history\.replaceState\(\{spinorderView:'setup'\},'',location\.pathname\+'#setup'\)/);assert.doesNotMatch(app,/student.*URLSearchParams|URLSearchParams.*student/is);
});

test('Classroom results and every text-sharing flow use selection wording without ranking',async()=>{
  const data=exportsApi.model({eventName:'Reading',activity:'Classroom',orderType:'Name Picker',revealOrder:'first',completedAt:'2026-09-01T12:00:00Z',picks:{1:{name:'Ava'},2:{name:'Ben'},3:{name:'Cam'}},total:3});
  assert.equal(data.classroomPicker,true);assert.equal(data.revealDirection,'Selection order');
  const text=exportsApi.text(data);assert.match(text,/Name Picker[\s\S]*Selection order[\s\S]*Selected 1: Ava\nSelected 2: Ben\nSelected 3: Cam/);assert.doesNotMatch(text,/winner|loser|rank/i);
  assert.match(exportsApi.csv(data),/^\uFEFF"Selection","Student Name"/);assert.match(decodeURIComponent(exportsApi.mailUrl('gmail',data).url),/Selected 1: Ava/);assert.equal(await exportsApi.prepareYahoo(data,async value=>assert.match(value,/Selected 2: Ben/)),true);
  const generic=exportsApi.model({eventName:'Reading',activity:'Generic',orderType:'Random Order',revealOrder:'first',completedAt:'2026-09-01T12:00:00Z',picks:{1:{name:'Ava'}},total:1});assert.equal(generic.classroomPicker,false);assert.match(exportsApi.text(generic),/1\. Ava/);
});
