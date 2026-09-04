'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const setup=require('../setup-state.js');

const root=path.join(__dirname,'..');
const route='fantasy-football-draft-order-randomizer';
const canonical=`https://www.spinorder.com/${route}/`;
const filename=path.join(root,route,'index.html');
const html=fs.readFileSync(filename,'utf8');

function content(pattern){return html.match(pattern)?.[1]||''}
function count(pattern){return [...html.matchAll(pattern)].length}

test('fantasy football use-case route exists with one exact H1 and useful content',()=>{
  assert.equal(fs.existsSync(filename),true);
  const headings=[...html.matchAll(/<h1\b[^>]*>(.*?)<\/h1>/gis)];
  assert.equal(headings.length,1);
  assert.equal(headings[0][1],'Free Fantasy Football Draft Order Randomizer');
  for(const value of ['Redraft leagues','Keeper leagues','Dynasty leagues','Live draft events','How it works','A clear way to set the order','Fantasy football draft-order FAQ'])assert.ok(html.includes(value),`missing ${value}`);
  assert.equal(count(/<ol class="steps-list">[\s\S]*?<li>/g),1);
  assert.equal(count(/<li>/g)>=7,true);
});

test('fantasy football page has complete unique SEO and analytics metadata',()=>{
  assert.equal(content(/<title>([^<]+)<\/title>/i),'Fantasy Football Draft Order Randomizer | SpinOrder');
  const description=content(/<meta name="description" content="([^"]+)">/i);
  assert.ok(description.length>=120&&description.length<=160,`description length was ${description.length}`);
  assert.equal(content(/<link rel="canonical" href="([^"]+)">/i),canonical);
  assert.match(html,/<meta name="robots" content="index, follow">/);
  assert.equal(content(/<meta property="og:title" content="([^"]+)">/i),'Fantasy Football Draft Order Randomizer | SpinOrder');
  assert.equal(content(/<meta property="og:url" content="([^"]+)">/i),canonical);
  assert.equal(content(/<meta property="og:image" content="([^"]+)">/i),'https://www.spinorder.com/social-preview.png');
  assert.equal(content(/<meta name="twitter:image" content="([^"]+)">/i),'https://www.spinorder.com/social-preview.png');
  assert.equal(count(/<script defer src="\/_vercel\/insights\/script\.js"><\/script>/g),1);
});

test('CTA targets the allowlisted football draft setup preset',()=>{
  const targets=[...html.matchAll(/<a class="primary-cta" href="([^"]+)">Create Your Draft Order<\/a>/g)].map(match=>match[1]);
  assert.ok(targets.length>=1);
  assert.deepEqual([...new Set(targets)],['/?preset=football-draft#setup']);
});

test('football-draft preset supplies only fixed setup values',()=>{
  assert.equal(setup.presetFromSearch('?preset=football-draft'),'football-draft');
  assert.equal(setup.presetFromSearch('?names=Alex&preset=football-draft&eventName=Injected'),'football-draft');
  assert.deepEqual(setup.valuesForPreset('football-draft'),{eventName:'',activity:'Football',activityLabel:'Draft Order',customLabel:'',teamCount:2,spinMode:'manual',revealOrder:'last'});
  assert.equal(Object.hasOwn(setup.valuesForPreset('football-draft'),'names'),false);
});

test('unknown and absent presets are ignored safely',()=>{
  for(const search of ['', '?preset=', '?preset=unknown', '?preset=football-draft-other', '?activity=Football&activityLabel=Draft%20Order'])assert.equal(setup.presetFromSearch(search),null);
  assert.equal(setup.valuesForPreset('unknown'),null);
});

test('app consumes recognized presets without accepting participant query data',()=>{
  const app=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.match(app,/const presetApplication=SpinOrderSetup\.applyPreset\(window\.sessionStorage,window\.location\.search\),activePreset=presetApplication\?\.key\|\|null/);
  assert.match(app,/if\(activePreset\)return \{names:\[\],mode:'manual',filename:''\}/);
  assert.match(app,/if\(presetApplication\)return presetApplication\.values/);
  assert.match(app,/if\(presetApplication\)history\.replaceState\(\{spinorderView:'setup'\},'',location\.pathname\+'#setup'\)/);
  assert.doesNotMatch(app,/URLSearchParams[^;]*(?:name|participant)/i);
});

test('sitemap and offline cache include the use-case route',()=>{
  const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
  assert.equal((sitemap.match(new RegExp(`<loc>${canonical.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}<\\/loc>`,'g'))||[]).length,1);
  const worker=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
  assert.match(worker,/spinorder-draft-v48/);
  assert.match(worker,/'\.\/fantasy-football-draft-order-randomizer\/'/);
});
