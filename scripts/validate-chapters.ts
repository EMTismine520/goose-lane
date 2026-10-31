import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { CHAPTERS, resolveDependencies } from '../src/content/chapters';
import { chapterPlayer, simulateChapters } from '../src/diagnostics/chapter-simulation';

const output=path.resolve(process.argv[2]??'../output/planv7-20261031');
await mkdir(output,{recursive:true});
const save=(name:string,value:unknown)=>writeFile(path.join(output,name),JSON.stringify(value,null,2)+'\n');
await save('chapter-dependencies.json',CHAPTERS.map(c=>({id:c.id,name:c.name,orders:c.orders.length,recipes:c.dependencies.recipes.filter(r=>r.stage===c.id).length,dependencies:c.dependencies.families,starter:c.starter.families.map(f=>({family:f,level:c.starter.levels[f]??1,band:c.starter.bands[f]??0})),items:c.dependencies.items,recipesRequired:c.dependencies.recipes.map(r=>r.id)})));
const economy=[];
for(const c of CHAPTERS){
  const samples=[];
  for(let seed=1;seed<=200;seed++){
    const p=chapterPlayer(seed);p.enter(c.id);p.resetPeak();const before=p.report;p.regular();
    const after=p.report;
    samples.push({seed,generated:after.generated-before.generated,energySpent:after.energySpent-before.energySpent,merges:after.merges-before.merges,commands:after.commands-before.commands,waitMs:after.waitMs-before.waitMs,income:after.coins-before.coins,peakOccupancy:after.peakOccupancy});
  }
  const sorted=samples.map(s=>s.generated).sort((a,b)=>a-b),p90=sorted[Math.ceil(sorted.length*.9)-1];
  const target=[5,6,7].includes(c.id)?30:20;
  if(p90>target||samples.some(s=>s.income<=0))throw new Error('Startup economy target failed: '+c.name);
  economy.push({chapter:c.id,name:c.name,seeds:200,productionP50:sorted[99],productionP90:p90,target,passed:true,samples});
}
await save('startup-economy.json',{prices:{first:60,later:120},inventoryOrGoldInjected:false,simulatedNotHumanPlaytime:true,chapters:economy});
const candidates=[];
for(const [kind,prices] of [['first',[40,60,80]],['later',[100,120,160]]] as const){
  for(const price of prices){
    const samples=[];
    for(let seed=1;seed<=200;seed++){
      const p=chapterPlayer(seed);if(kind==='later')p.enter(7);p.resetPeak();const before=p.report;p.farm(price);const after=p.report;
      samples.push({seed,startingCoins:before.coins,endingCoins:after.coins,generated:after.generated-before.generated,energySpent:after.energySpent-before.energySpent,regularOrders:after.regularOrders-before.regularOrders,merges:after.merges-before.merges,waitMs:after.waitMs-before.waitMs,peakOccupancy:after.peakOccupancy});
    }
    const p90=(key:'generated'|'energySpent'|'regularOrders'|'waitMs')=>samples.map(s=>s[key]).sort((a,b)=>a-b)[179];
    candidates.push({kind,price,seeds:200,sourceChapter:kind==='first'?1:7,productionP90:p90('generated'),energyP90:p90('energySpent'),ordersP90:p90('regularOrders'),waitP90Ms:p90('waitMs'),samples});
  }
}
await save('price-comparison.json',{selected:{first:60,later:120,total:780},scope:'Actual regular-order commands to earn candidate balances, not human session duration or a claim of optimal pricing.',inventoryOrGoldInjected:false,candidates});
const reports=[];
for(const [seed,order] of [[42,[6,2,8,1,4,7,3,5]],[1868919585,[7,8,3,5,1,4,6,2]],[123456789,[8,4,2,6,7,5,3,1]]] as const){
  const result=simulateChapters(seed,[...order]);
  if(result.report.storyOrders!==145||!result.report.allStoriesComplete)throw new Error('Story simulation incomplete');
  reports.push(result.report);
}
await save('complete-simulations.json',reports);
console.log(JSON.stringify({output,startupCases:1600,productionP90:economy.map(c=>({chapter:c.chapter,value:c.productionP90})),fullStoryRuns:reports.map(r=>({seed:r.seed,orders:r.storyOrders,commands:r.commands,peak:r.peakOccupancy})),passed:true}));
