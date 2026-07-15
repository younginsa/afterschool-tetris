#!/usr/bin/env node
/**
 * Daily academies.json refresh — Kakao Local REST API.
 * Runs in GitHub Actions (see .github/workflows/update-academies.yml).
 *
 * Env: KAKAO_REST_KEY  (Kakao developers console → REST API 키; repo secret)
 *
 * Mirrors mockup/tools/update-data.html: same keywords, same deterministic
 * place-id-seeded mock enrichment, so regenerating never churns existing
 * academies' slots/costs/fit.
 */
import {writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const KEY = process.env.KAKAO_REST_KEY;
if (!KEY) {
  console.error('KAKAO_REST_KEY env var missing');
  process.exit(1);
}

const CENTER = {name: '광교초등학교', lng: 127.0457384937563, lat: 37.30389632012045};
const RADIUS = 2500;
const MAX_PAGES = 3;

const KEYWORDS = {
  english: ['영어학원'],
  math: ['수학학원'],
  taekwondo: ['태권도'],
  art: ['미술학원'],
  piano: ['피아노학원'],
  coding: ['코딩학원'],
  boxing: ['복싱', '킥복싱'],
  ballet: ['발레학원'],
  soccer: ['축구교실'],
  jumprope: ['줄넘기']
};
const EMOJI = {english:'🇺🇸',math:'📐',taekwondo:'🥋',art:'🎨',piano:'🎹',coding:'💻',boxing:'🥊',ballet:'🩰',soccer:'⚽',jumprope:'🪢'};
const COST = {english:[240,340],math:[220,320],taekwondo:[130,180],art:[140,200],piano:[150,220],coding:[180,280],boxing:[120,180],ballet:[150,220],soccer:[100,160],jumprope:[80,140]};
const SHUTTLE_P = {english:.55,math:.3,taekwondo:.75,art:.3,piano:.2,coding:.25,boxing:.35,ballet:.3,soccer:.6,jumprope:.3};

/* deterministic PRNG seeded by place id — identical to the browser tool */
function hashCode(s){let h=0;for(let i=0;i<s.length;i++){h=((h<<5)-h+s.charCodeAt(i))|0;}return h>>>0;}
function mulberry32(seed){
  return function(){
    seed|=0;seed=(seed+0x6D2B79F5)|0;
    let t=Math.imul(seed^(seed>>>15),1|seed);
    t=(t+Math.imul(t^(t>>>7),61|t))^t;
    return ((t^(t>>>14))>>>0)/4294967296;
  };
}

const DAY_PATTERNS=[['mon','wed','fri'],['tue','thu'],['mon','wed'],['tue','thu','fri']];
const STARTS=['14:00','15:00','16:00','16:30','17:00','17:30'];
function addMin(hhmm,min){
  const [h,m]=hhmm.split(':').map(Number);
  const t=h*60+m+min;
  return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0');
}
function enrich(place,subjects){
  const rnd=mulberry32(hashCode(place.id));
  const subj=subjects[0];
  const [lo,hi]=COST[subj]||[150,250];
  const slots=[];
  const usedPatterns=new Set();
  const groups=2+(rnd()<0.4?1:0);
  for(let g=0;g<groups;g++){
    let pi=Math.floor(rnd()*DAY_PATTERNS.length);
    if(usedPatterns.has(pi))pi=(pi+1)%DAY_PATTERNS.length;
    usedPatterns.add(pi);
    const start=STARTS[Math.floor(rnd()*STARTS.length)];
    const dur=rnd()<0.5?60:90;
    for(const day of DAY_PATTERNS[pi]){
      slots.push({day,startTime:start,endTime:addMin(start,dur),available:rnd()<0.75});
    }
  }
  return {
    id:'kakao-'+place.id,
    name:place.place_name,
    address:place.road_address_name||place.address_name,
    phone:place.phone||'',
    distanceKm:Math.round((parseInt(place.distance,10)/1000)*100)/100,
    subjects,
    shuttleAvailable:rnd()<(SHUTTLE_P[subj]||.3),
    monthlyCostKRW:(lo+Math.floor(rnd()*((hi-lo)/10+1))*10)*1000,
    fitScore:62+Math.floor(rnd()*37),
    emoji:EMOJI[subj]||'📚',
    lng:parseFloat(place.x),
    lat:parseFloat(place.y),
    slots,
    placeUrl:place.place_url
  };
}

const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function searchKeyword(keyword){
  const all=[];
  for(let page=1;page<=MAX_PAGES;page++){
    const url=new URL('https://dapi.kakao.com/v2/local/search/keyword.json');
    url.searchParams.set('query',keyword);
    url.searchParams.set('x',String(CENTER.lng));
    url.searchParams.set('y',String(CENTER.lat));
    url.searchParams.set('radius',String(RADIUS));
    url.searchParams.set('sort','distance');
    url.searchParams.set('size','15');
    url.searchParams.set('page',String(page));
    const res=await fetch(url,{headers:{Authorization:`KakaoAK ${KEY}`}});
    if(!res.ok){
      console.error(`  ⚠️ ${keyword} p${page}: HTTP ${res.status} ${await res.text()}`);
      break;
    }
    const body=await res.json();
    all.push(...body.documents);
    if(body.meta.is_end)break;
    await sleep(250);
  }
  return all;
}

const byId=new Map();
for(const [subject,words] of Object.entries(KEYWORDS)){
  for(const w of words){
    const places=await searchKeyword(w);
    let added=0;
    for(const p of places){
      if(parseInt(p.distance,10)>RADIUS)continue;
      if(!byId.has(p.id)){byId.set(p.id,{place:p,subjects:new Set()});added++;}
      byId.get(p.id).subjects.add(subject);
    }
    console.log(`${subject} "${w}": ${places.length} received, ${added} new`);
    await sleep(250);
  }
}

const academies=[...byId.values()]
  .map(({place,subjects})=>enrich(place,[...subjects]))
  .sort((a,b)=>a.distanceKm-b.distanceKm);

const out={center:CENTER,generatedAt:new Date().toISOString(),academies};
const path=join(dirname(fileURLToPath(import.meta.url)),'..','mockup','academies.json');
writeFileSync(path,JSON.stringify(out,null,1),'utf-8');
console.log(`✅ wrote ${academies.length} academies → mockup/academies.json`);
