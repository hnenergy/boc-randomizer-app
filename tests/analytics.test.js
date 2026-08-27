'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');

test('Vercel Web Analytics static script is included exactly once with defer',()=>{const scripts=[...html.matchAll(/<script\b([^>]*)><\/script>/gi)].map(match=>match[1]),analytics=scripts.filter(attributes=>/\bsrc=["']\/_vercel\/insights\/script\.js["']/.test(attributes));assert.equal(analytics.length,1);assert.match(analytics[0],/(?:^|\s)defer(?:\s|$)/);assert.equal((html.match(/\/_vercel\/insights\/script\.js/g)||[]).length,1)});

test('analytics integration contains no custom event or alternate tracker scripts',()=>{assert.doesNotMatch(html,/<script[^>]+(?:google-analytics|googletagmanager|gtag|plausible|segment|mixpanel)[^>]*>/i);assert.doesNotMatch(html,/\bva\s*\(\s*['"]event['"]/)});
