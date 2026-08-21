'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const favicons=require('../favicon-state.js'),setup=require('../setup-state.js');
const root=path.join(__dirname,'..');

function fakeDocument(withLink=true){
  const links=[];
  if(withLink)links.push({id:'browserFavicon',rel:'icon',href:'icon.svg'});
  return {
    links,
    getElementById(id){return links.find(link=>link.id===id)||null},
    createElement(tag){assert.equal(tag,'link');return {}},
    head:{appendChild(link){links.push(link)}}
  };
}

test('every activity maps to an existing accessible SVG favicon',()=>{
  assert.deepEqual(favicons.ACTIVITY_FAVICONS,{
    Football:'assets/icons/football.svg',Baseball:'assets/icons/baseball.svg',Golf:'assets/icons/golf.svg',Basketball:'assets/icons/basketball.svg',Generic:'assets/icons/generic.svg'
  });
  for(const [activity,relativePath] of Object.entries(favicons.ACTIVITY_FAVICONS)){
    const svg=fs.readFileSync(path.join(root,relativePath),'utf8');
    assert.match(svg,/<title(?:\s[^>]*)?>[^<]+<\/title>/,`${activity} favicon needs a title`);
    assert.match(svg,/viewBox=/,`${activity} favicon needs a viewBox`);
  }
});

test('activity changes update immediately without duplicating the favicon link',()=>{
  const documentObject=fakeDocument();
  for(const activity of Object.keys(favicons.ACTIVITY_FAVICONS)){
    assert.equal(favicons.update(documentObject,activity),activity);
    assert.equal(documentObject.links[0].href,favicons.ACTIVITY_FAVICONS[activity]);
    assert.equal(documentObject.links[0].type,'image/svg+xml');
  }
  assert.equal(documentObject.links.length,1);
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.match(html,/setupForm\.addEventListener\('change'.*saveSetupProgress\(\);SpinOrderFavicons\.update\(document,SpinOrderSetup\.normalize\(formValues\(\)\)\.activity\)/);
  assert.equal((html.match(/id="browserFavicon"/g)||[]).length,1);
});

test('session-restored activity selects its favicon and invalid activity falls back to Football',()=>{
  const values={...setup.DEFAULT_VALUES,eventName:'League Night',activity:'Golf'},data=new Map(),storage={setItem:(key,value)=>data.set(key,value),getItem:key=>data.get(key)??null};
  setup.save(storage,values);const restored=setup.load(storage),documentObject=fakeDocument(false);
  favicons.update(documentObject,restored.activity);
  assert.equal(documentObject.links[0].href,'assets/icons/golf.svg');
  assert.equal(favicons.update(documentObject,'Not a sport'),'Football');
  assert.equal(documentObject.links[0].href,'assets/icons/football.svg');
  assert.equal(documentObject.links.length,1);
});

test('PWA icons stay football while the footer uses the light-blue elephant',()=>{
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'),),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.deepEqual(manifest.icons.map(icon=>icon.src),['icon-192.png','icon-512.png']);
  assert.match(html,/<link rel="apple-touch-icon" href="icon-192\.png">/);
  assert.match(fs.readFileSync(path.join(root,'icon.svg'),'utf8'),/<title|<path d="M104 256c40-115\.2/);
  assert.match(html,/<img src="assets\/brand\/lfn-legacy-apps-elephant-light-blue\.png" alt="LFN Legacy Apps elephant publisher logo">/);
});
