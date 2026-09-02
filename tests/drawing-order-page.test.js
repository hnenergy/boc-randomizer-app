'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),route='random-drawing-order-generator',canonical='https://www.spinorder.com/random-drawing-order-generator/',html=fs.readFileSync(path.join(root,route,'index.html'),'utf8');
function count(pattern,value=html){return(value.match(pattern)||[]).length}

test('drawing page has exact H1 and CTA plus useful sequencing content',()=>{
  const headings=[...html.matchAll(/<h1\b[^>]*>(.*?)<\/h1>/gis)];assert.equal(headings.length,1);assert.equal(headings[0][1].trim(),'Free Random Drawing Order Generator');
  const targets=[...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>Create a Drawing Order<\/a>/g)].map(match=>match[1]);assert.ok(targets.length);assert.deepEqual([...new Set(targets)],['/?preset=drawing-order']);
  for(const phrase of ['list of names','drawings','presentation order','turn order','lotteries','event sequencing','three steps','Each entered name appears once'])assert.match(html,new RegExp(phrase,'i'));
});

test('drawing page states limitations without unsupported claims',()=>{
  for(const phrase of ['does not manage entrants','validate eligibility','administer prizes','weighted or multiple entries','Position 1 is simply the first position','not a guaranteed legal winner'])assert.match(html,new RegExp(phrase,'i'));
  assert.doesNotMatch(html,/certified sweepstakes|audited randomness|cryptographic security|is a guaranteed legal winner|testimonial|five-star|\d+[,.]?\d* users/i);
});

test('drawing page metadata, analytics, navigation, and internal links are complete',()=>{
  assert.match(html,/<title>Free Random Drawing Order Generator \| SpinOrder<\/title>/);assert.match(html,/<meta name="description" content="[^"]+">/);assert.match(html,new RegExp(`<link rel="canonical" href="${canonical}">`));assert.match(html,/<meta name="robots" content="index, follow">/);
  assert.match(html,new RegExp(`<meta property="og:url" content="${canonical}">`));assert.match(html,/<meta property="og:image" content="https:\/\/www\.spinorder\.com\/social-preview\.png">/);assert.match(html,/<meta name="twitter:image" content="https:\/\/www\.spinorder\.com\/social-preview\.png">/);
  assert.equal(count(/<script defer src="\/_vercel\/insights\/script\.js"><\/script>/g),1);assert.match(html,/<header class="site-header">/);assert.match(html,/<footer class="info-footer">/);assert.match(html,/href="\/"/);assert.match(html,/href="\/classroom-name-picker\/"/);
  assert.match(fs.readFileSync(path.join(root,'classroom-name-picker','index.html'),'utf8'),/href="\/random-drawing-order-generator\/"/);
});

test('drawing route is in sitemap and v47 offline cache',()=>{
  assert.match(fs.readFileSync(path.join(root,'sitemap.xml'),'utf8'),new RegExp(`<loc>${canonical}<\\/loc>`));const worker=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');assert.match(worker,/spinorder-draft-v47/);assert.match(worker,/'\.\/random-drawing-order-generator\/'/);
});
