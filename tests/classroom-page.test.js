'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),route='classroom-name-picker',canonical='https://www.spinorder.com/classroom-name-picker/',html=fs.readFileSync(path.join(root,route,'index.html'),'utf8');
function count(pattern,value=html){return(value.match(pattern)||[]).length}

test('classroom page has one exact H1, useful no-repeat content, and exact CTAs',()=>{
  const h1=[...html.matchAll(/<h1\b[^>]*>(.*?)<\/h1>/gis)];assert.equal(h1.length,1);assert.equal(h1[0][1].trim(),'Free Classroom Name Picker');
  for(const phrase of ['classroom participation','presentations','reading order','activities','classroom games','three steps','removed from the available wheel','reset the picker'])assert.match(html,new RegExp(phrase,'i'));
  assert.ok(count(/<a\b[^>]*href="\/\?preset=classroom-picker"[^>]*>Pick Student Names<\/a>/g)>=1);assert.equal(count(/href="\/\?preset=classroom-picker"/g),count(/>Pick Student Names<\/a>/g));
  assert.doesNotMatch(html,/testimonial|educational outcome|COPPA|FERPA|five-star|\d+[,.]?\d* teachers/i);
});

test('classroom metadata, analytics, navigation, and reciprocal internal links are complete',()=>{
  assert.match(html,/<title>Free Classroom Name Picker \| SpinOrder<\/title>/);assert.match(html,/<meta name="description" content="[^"]+">/);assert.match(html,new RegExp(`<link rel="canonical" href="${canonical}">`));assert.match(html,/<meta name="robots" content="index, follow">/);
  assert.match(html,new RegExp(`<meta property="og:url" content="${canonical}">`));assert.match(html,/<meta property="og:image" content="https:\/\/www\.spinorder\.com\/social-preview\.png">/);assert.match(html,/<meta name="twitter:image" content="https:\/\/www\.spinorder\.com\/social-preview\.png">/);
  assert.equal(count(/<script defer src="\/_vercel\/insights\/script\.js"><\/script>/g),1);assert.match(html,/<header class="site-header">/);assert.match(html,/<footer class="info-footer">/);assert.match(html,/href="\/random-team-generator\/"/);
  assert.match(fs.readFileSync(path.join(root,'random-team-generator','index.html'),'utf8'),/href="\/classroom-name-picker\/"/);
});

test('classroom route and icon are indexed and cached',()=>{
  assert.match(fs.readFileSync(path.join(root,'sitemap.xml'),'utf8'),new RegExp(`<loc>${canonical}<\\/loc>`));const worker=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');assert.match(worker,/spinorder-draft-v47/);assert.match(worker,/'\.\/classroom-name-picker\/'/);assert.match(worker,/'\.\/assets\/icons\/classroom\.svg'/);
});
