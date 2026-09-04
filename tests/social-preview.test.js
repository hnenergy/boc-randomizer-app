'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const imageUrl='https://www.spinorder.com/social-preview.png';
const imageAlt='SpinOrder randomizer with a colorful twelve-section wheel and the words Free Randomizer for Names, Teams &amp; Draft Orders';
const pages=['index.html','about/index.html','privacy/index.html','contact/index.html','fantasy-football-draft-order-randomizer/index.html','random-team-generator/index.html','golf-group-randomizer/index.html','classroom-name-picker/index.html','random-drawing-order-generator/index.html'];

function attribute(tag,name){
  return tag.match(new RegExp(`${name}=["']([^"']+)["']`,'i'))?.[1];
}

function metaTags(html,attributeName,key){
  return [...html.matchAll(/<meta\s+[^>]*>/gi)]
    .map(match=>match[0])
    .filter(tag=>attribute(tag,attributeName)===key);
}

test('social preview is a valid 1200 x 630 PNG',()=>{
  const filename=path.join(root,'social-preview.png');
  assert.equal(fs.existsSync(filename),true);
  const png=fs.readFileSync(filename);
  assert.deepEqual([...png.subarray(0,8)],[137,80,78,71,13,10,26,10]);
  assert.equal(png.toString('ascii',12,16),'IHDR');
  assert.equal(png.readUInt32BE(16),1200);
  assert.equal(png.readUInt32BE(20),630);
});

test('app and preview use the stable cached trophy artwork',()=>{
  const trophy=path.join(root,'assets','icons','trophy.png');
  assert.equal(fs.existsSync(trophy),true);
  const png=fs.readFileSync(trophy);
  assert.equal(png.readUInt32BE(16),1254);
  assert.equal(png.readUInt32BE(20),1254);
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.match(html,/<div class="hub" id="wheelHub"><img src="assets\/icons\/trophy\.png" alt="" width="116" height="116" loading="lazy" decoding="async"><\/div>/);
  assert.doesNotMatch(html,/<div class="hub" id="wheelHub"><span>🏆<\/span>/);
  const worker=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
  assert.match(worker,/'\.\/assets\/icons\/trophy\.png'/);
  const generator=fs.readFileSync(path.join(root,'scripts','generate-social-preview.ps1'),'utf8');
  assert.match(generator,/assets\/icons\/trophy\.png/);
  assert.doesNotMatch(generator,/trophyBitmap|FillPath\(\$goldBrush|DrawArc\(\$trophy/);
});

test('every indexable page includes each social image property exactly once',()=>{
  const expected=[
    ['property','og:image',imageUrl],
    ['property','og:image:secure_url',imageUrl],
    ['property','og:image:type','image/png'],
    ['property','og:image:width','1200'],
    ['property','og:image:height','630'],
    ['property','og:image:alt',imageAlt],
    ['name','twitter:image',imageUrl],
    ['name','twitter:image:alt',imageAlt]
  ];

  for(const page of pages){
    const html=fs.readFileSync(path.join(root,page),'utf8');
    for(const [attributeName,key,value] of expected){
      const tags=metaTags(html,attributeName,key);
      assert.equal(tags.length,1,`${page} must contain one ${key}`);
      assert.equal(attribute(tags[0],'content'),value,`${page} ${key}`);
    }
  }
});
