'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),route='golf-group-randomizer',canonical='https://www.spinorder.com/golf-group-randomizer/',html=fs.readFileSync(path.join(root,route,'index.html'),'utf8');
function count(pattern,value=html){return(value.match(pattern)||[]).length}

test('golf page has one exact H1, useful content, and exact preset CTAs',()=>{
  const h1=[...html.matchAll(/<h1\b[^>]*>(.*?)<\/h1>/gis)];assert.equal(h1.length,1);assert.equal(h1[0][1].trim(),'Free Golf Group Randomizer');
  for(const phrase of ['golf outings','league days','casual rounds','foursomes','tee-time groups','three steps','Balanced by headcount only','handicap, ability, gender, age'])assert.match(html,new RegExp(phrase,'i'));
  assert.ok(count(/<a\b[^>]*href="\/\?preset=golf-groups"[^>]*>Create Golf Groups<\/a>/g)>=1);
  assert.equal(count(/href="\/\?preset=golf-groups"/g),count(/>Create Golf Groups<\/a>/g));
  assert.doesNotMatch(html,/testimonial|five-star|\d+[,.]?\d* users/i);
});

test('golf page metadata, analytics, navigation, and reciprocal links are complete',()=>{
  assert.match(html,/<title>Free Golf Group Randomizer \| SpinOrder<\/title>/);assert.match(html,/<meta name="description" content="[^"]+">/);
  assert.match(html,new RegExp(`<link rel="canonical" href="${canonical}">`));assert.match(html,/<meta name="robots" content="index, follow">/);
  assert.match(html,new RegExp(`<meta property="og:url" content="${canonical}">`));assert.match(html,/<meta property="og:image" content="https:\/\/www\.spinorder\.com\/social-preview\.png">/);
  assert.match(html,/<meta name="twitter:image" content="https:\/\/www\.spinorder\.com\/social-preview\.png">/);
  assert.equal(count(/<script defer src="\/_vercel\/insights\/script\.js"><\/script>/g),1);assert.match(html,/<header class="site-header">/);assert.match(html,/<footer class="info-footer">/);
  assert.match(html,/href="\/random-team-generator\/"/);const teamPage=fs.readFileSync(path.join(root,'random-team-generator','index.html'),'utf8');assert.match(teamPage,/href="\/golf-group-randomizer\/"/);
});

test('golf route is indexed and included in the current offline cache',()=>{
  assert.match(fs.readFileSync(path.join(root,'sitemap.xml'),'utf8'),new RegExp(`<loc>${canonical}<\\/loc>`));
  const worker=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');assert.match(worker,/spinorder-draft-v48/);assert.match(worker,/'\.\/golf-group-randomizer\/'/);
});
