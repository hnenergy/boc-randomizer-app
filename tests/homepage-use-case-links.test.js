'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const card=html.slice(html.indexOf('<section class="landing-card"'),html.indexOf('</section>',html.indexOf('<section class="landing-card"'))+10);
const expected=new Map([
  ['Fantasy football','/fantasy-football-draft-order-randomizer/'],
  ['Golf groups','/golf-group-randomizer/'],
  ['Team assignments','/random-team-generator/'],
  ['Classroom order','/classroom-name-picker/'],
  ['Generic drawings','/random-drawing-order-generator/']
]);

test('every homepage use-case chip is one semantic link to its landing page',()=>{
  const list=card.match(/<ul class="example-list"[\s\S]*?<\/ul>/)?.[0]||'';
  const items=[...list.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(match=>match[1]);
  const links=[...list.matchAll(/<a href="([^"]+)">([^<]+)<\/a>/g)].map(match=>({href:match[1],name:match[2]}));
  assert.equal(items.length,expected.size);assert.equal(links.length,expected.size);
  for(const item of items){assert.match(item,/^<a href="[^"]+">[^<]+<\/a>$/);assert.doesNotMatch(item,/<button\b/i)}
  assert.deepEqual(new Map(links.map(link=>[link.name,link.href])),expected);
  assert.equal(new Set(links.map(link=>link.name)).size,expected.size);assert.equal(new Set(links.map(link=>link.href)).size,expected.size);
});

test('use-case links preserve chip wrapping and explicit interaction states',()=>{
  assert.match(html,/\.example-list\{[^}]*display:flex[^}]*flex-wrap:wrap/);
  for(const state of ['hover','focus-visible','active'])assert.match(html,new RegExp(`\\.example-list a:${state}\\{`));
});

test('use-case links do not invoke setup and the main CTA retains the normal setup flow',()=>{
  assert.match(card,/<button class="create-button" id="createRandomizer" type="button">Create Randomizer<\/button>/);
  assert.match(html,/createRandomizer\.addEventListener\('click',openSetup\)/);
  assert.doesNotMatch(html,/example-list[^\n]*(?:addEventListener|openSetup)|querySelectorAll\([^)]*example-list/is);
});
