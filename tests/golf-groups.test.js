'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const teams=require('../team-assignment.js'),setup=require('../setup-state.js'),exportsApi=require('../results-export.js');
const root=path.join(__dirname,'..'),app=fs.readFileSync(path.join(root,'index.html'),'utf8');
function sequence(values){let index=0;return()=>values[index++%values.length]}
function assign(names,count){const remaining=[...names],assignments=[];while(remaining.length){const index=teams.randomIndex(remaining.length,sequence([assignments.length])),name=remaining.splice(index,1)[0];assignments.push({name,team:teams.teamForCompleted(assignments.length,count)})}return assignments}

test('Golf derives group terminology while other activities retain team terminology',()=>{
  assert.deepEqual(teams.terminology('Golf'),{modeLabel:'Group Assignment',countLabel:'Number of groups',singular:'Group',plural:'groups',resultsTitle:'Golf Group Results',completion:'Groups Set',reset:'Reset Groups'});
  for(const activity of ['Generic','Football','Baseball','Basketball'])assert.equal(teams.terminology(activity).modeLabel,'Team Assignment');
  assert.equal(setup.displayLabel({...setup.DEFAULT_VALUES,activity:'Golf',activityLabel:'Team Assignment'}),'Group Assignment');
  assert.equal(setup.displayLabel({...setup.DEFAULT_VALUES,activity:'Generic',activityLabel:'Team Assignment'}),'Team Assignment');
  assert.match(teams.validateTeamCount(1,10,'Golf').error,/2 groups/);
  assert.match(teams.validateTeamCount(1,10,'Football').error,/2 teams/);
});

test('Golf groups reuse round-robin destinations for odd and even golfer counts',()=>{
  const ten=assign(Array.from({length:10},(_,index)=>`Golfer ${index+1}`),3);
  assert.deepEqual(ten.map(item=>item.team),[1,2,3,1,2,3,1,2,3,1]);
  assert.deepEqual(teams.grouped(ten,3).map(group=>group.members.length),[4,3,3]);
  assert.equal(new Set(ten.map(item=>item.name)).size,10);
  const eight=assign(Array.from({length:8},(_,index)=>`Golfer ${index+1}`),4);
  assert.deepEqual(teams.grouped(eight,4).map(group=>group.members.length),[2,2,2,2]);
  assert.equal(new Set(eight.map(item=>item.name)).size,8);
});

test('golf-groups preset applies safely and cleanup preserves subsequent edits',()=>{
  assert.deepEqual(setup.valuesForPreset('golf-groups'),{...setup.DEFAULT_VALUES,activity:'Golf',activityLabel:'Team Assignment',teamCount:2});
  assert.equal(setup.presetFromSearch('?preset=golf-groups'),'golf-groups');
  assert.equal(setup.presetFromSearch('?preset=unknown'),null);
  const data=new Map(),storage={setItem:(key,value)=>data.set(key,value),getItem:key=>data.get(key)||null};
  const applied=setup.applyPreset(storage,'?preset=golf-groups');assert.equal(applied.key,'golf-groups');assert.deepEqual(setup.load(storage),applied.values);
  const edited={...applied.values,eventName:'Tuesday League',teamCount:3};assert.equal(setup.save(storage,edited),true);assert.deepEqual(setup.load(storage),edited);assert.equal(setup.presetFromSearch(''),null);
  assert.match(app,/if\(presetApplication\)history\.replaceState\(\{spinorderView:'setup'\},'',location\.pathname\+'#setup'\)/);
  assert.doesNotMatch(app,/participant.*URLSearchParams|URLSearchParams.*participant/is);
});

test('setup, live announcements, results, sharing, and image export derive golf wording',()=>{
  assert.match(app,/assignmentModeLabel\.textContent=words\.modeLabel/);assert.match(app,/teamCountLabel\.textContent=words\.countLabel/);
  assert.match(app,/Current destination: \$\{words\.singular\}/);assert.match(app,/assigned to \$\{words\.singular\}/);assert.match(app,/resultsTitle\.textContent=isTeamMode\(\)\?`\$\{icon\} \$\{words\.resultsTitle\}`/);
  assert.match(app,/data\.assignmentPlural/);assert.match(app,/data\.assignmentSingular/);
  const model=exportsApi.model({eventName:'Tuesday League',activity:'Golf',orderType:'Group Assignment',completedAt:'2026-09-01T12:00:00Z',picks:{1:{name:'A',team:1},2:{name:'B',team:2},3:{name:'C',team:1}},total:3,teamCount:2});
  assert.equal(model.assignmentSingular,'Group');assert.equal(model.assignmentPlural,'groups');
  assert.match(exportsApi.text(model),/Group Assignment[\s\S]*2 groups[\s\S]*Group 1\n- A\n- C[\s\S]*Group 2\n- B/);
  assert.match(exportsApi.csv(model),/^\uFEFF"Group","Name"/);assert.match(decodeURIComponent(exportsApi.mailUrl('gmail',model).url),/Group 1\n- A/);
  const generic=exportsApi.model({...model,activity:'Generic',orderType:'Team Assignment'});assert.equal(generic.assignmentSingular,'Team');assert.match(exportsApi.text(generic),/Team 1/);
});
