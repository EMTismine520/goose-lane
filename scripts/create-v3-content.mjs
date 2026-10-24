import { readFile, writeFile } from 'node:fs/promises';
const plan = await readFile('../docs/v2plan.md', 'utf8');
const references = JSON.parse(await readFile('../output/food-reference-20261024/artpt/metadata/ASSET-MANIFEST-v2.json', 'utf8'));
const uniqueRefs = [...new Map(references.map(r => [r.canonical_icon_id, r])).values()];
const rows = [...plan.matchAll(/^\| ([^|]+) · (\d+)阶 \| ([^|]+) \|$/gm)];
const ids = ['fresh-veg','fresh-fruit','fresh-beast','fresh-poultry','fresh-spice','fresh-seasonal','fresh-exotic','fresh-sea','fresh-milk','fresh-grain','fresh-sweet','fresh-coffee','fresh-tea','fresh-mixer'];
const stages = [1,1,2,2,2,3,3,6,3,3,3,3,3,8];
const producers = ['vegetable-cart','fruit-cart','beast-meat-cart','poultry-cart','spice-box','vegetable-cart','fruit-cart','seafood-fridge','dairy-fridge','grain-box','sweet-cabinet','drink-fridge','drink-fridge','drink-fridge'];
const chains = rows.map((r,i)=>({id:ids[i], name:r[1], stage:stages[i], producer:producers[i], names:r[3].trim().split(' → ')}));
const directNames = new Set([...chains[11].names.slice(1),...chains[12].names.slice(1),'姜汁水','汤力水','威士忌']);
const stageNames={'浓缩咖啡':'ico-0167','原味咖啡':'ico-0168'};
const refFor = name => uniqueRefs.find(r=>r.name===name || (name==='熟烤肥蟹'&&r.name==='酥烤肥蟹')||stageNames[name]===r.canonical_icon_id);
const provenance = name => { const ref=refFor(name); return {referenceId:ref?.canonical_icon_id??null, referenceName:ref?.name??null, naming:stageNames[name]?'project':ref?'reference':'project', design:'本项目配方与成长规则', sourceUrl:ref?.source_url??null}; };
const items = chains.flatMap(c=>c.names.map((name,i)=>({id:`${c.id}-${i+1}`, name, chain:c.id, level:i+1, stage:c.stage, kind:directNames.has(name)?'drink':'ingredient', ...provenance(name)})));
const existing = [ ['番茄小沙拉','fresh-tomato-salad'],['胡萝卜花园','fresh-carrot-salad'],['田园丰收碗','fresh-garden-bowl'],['草莓甜心杯','fresh-berry-cup'],['阳光鲜橙汁','fresh-orange-juice'],['缤纷水果盘','fresh-fruit-platter'],['凉拌紫洋葱','fresh-home-onion-salad'],['番茄炒蛋','fresh-home-tomato-eggs'],['肉丸蔬菜汤','fresh-home-meatball-soup'],['蒜香西兰花','fresh-home-garlic-broccoli'],['彩蔬拌饭','fresh-home-vegetable-rice'],['葱香蛋饭','fresh-home-scallion-egg-rice'],['香煎肉片','fresh-home-seared-pork'],['蒜香黄瓜','fresh-home-garlic-cucumber'],['香煎鸡肉卷','fresh-home-chicken-roll'],['橙香小排','fresh-home-orange-ribs'] ];
const familyNames = ['小鹅砧板','鲜果料理台','料理锅','煎台','炭烤炉','烤箱','蒸笼','炒锅','微波炉','搅拌机','冰淇淋机','调饮台'];
const familyIds = ['chopping-board','fruit-press','home-cooking-pot','frying-station','charcoal-grill','oven','steamer','wok','microwave','blender','ice-cream-machine','bar'];
const familyStages = [1,1,2,4,5,4,6,5,4,7,7,8];
const bases = [6,10,20,22,32,40,30,20,10,16,35,14];
const devices = [...new Set(producers)].map(id=>({id,name:({'vegetable-cart':'蔬菜推车','fruit-cart':'鲜果木箱','beast-meat-cart':'兽肉推车','poultry-cart':'禽肉推车','spice-box':'香料盒','seafood-fridge':'海鲜冰箱','dairy-fridge':'乳品冷柜','grain-box':'谷物面点箱','sweet-cabinet':'甜料柜','drink-fridge':'饮品冰柜'})[id],kind:'generator',stage:Math.min(...chains.filter(c=>c.producer===id).map(c=>c.stage)),chains:chains.filter(c=>c.producer===id).map(c=>c.id),price:40}));
devices.push(...familyIds.map((id,i)=>({id,name:familyNames[i],kind:'appliance',stage:familyStages[i],chains:[],price:30,slot:[0,1,4,5,6,7,8,9,10,11,12,13][i],baseSeconds:bases[i]})));
const recipes=[];
for(let i=0;i<familyNames.length;i++) {
  const start=plan.indexOf(`**${familyNames[i]}：`), end=plan.indexOf('\n**',start+2);
  const section=plan.slice(start,end<0?plan.indexOf('两条跨厨具',start):end);
  for(const m of section.matchAll(/([^\n＝；。]+)＝([^；。\n]+)/g)) {
    const name=m[1].replace(/^- /,'').trim(), inputs=m[2].split('＋').map(s=>s.trim());
    const ref=refFor(name); if(!ref) throw new Error(`No reference for ${name}`);
    const id=`fresh-${ref.canonical_icon_id}`;
    const recipe={id,name,output:`dish-${id}`,family:familyIds[i],inputNames:inputs,kind:ref.category==='drink'?'drink':'dish',...provenance(name)};
    recipes.push(recipe);
  }
}
const lookup=new Map([...items.map(i=>[i.name,i.id]),...existing.map(([n,id])=>[n,`dish-${id}`]),...recipes.map(r=>[r.name,r.output])]);
const byId=new Map(items.map(i=>[i.id,i]));
const recipeByOutput=new Map(recipes.map(r=>[r.output,r]));
const rank = id => byId.get(id)?.level ?? Math.max(...recipeByOutput.get(id).inputs.map(n=>rank(n.item)));
const stage = id => byId.get(id)?.stage ?? recipeByOutput.get(id).stage;
const effort = id => {const it=byId.get(id);if(it){const band=Math.floor((it.level-1)/3); return [1,2,4,8,16][band]*2**((it.level-1)%3)/1.44;}const r=recipeByOutput.get(id);return r.inputs.reduce((s,n)=>s+effort(n.item),0)+r.duration/15000;};
for(const r of recipes) r.inputs=r.inputNames.map(name=>{if(!lookup.has(name))throw new Error(`Unknown ${name}`);return {item:lookup.get(name),count:1};});
const solve=r=>{
  if(r.stage)return;
  for(const n of r.inputs)if(recipeByOutput.has(n.item))solve(recipeByOutput.get(n.item));
  r.ancestorRank=Math.max(...r.inputs.map(n=>rank(n.item)));
  r.minDeviceLevel=r.inputs.some(n=>recipeByOutput.has(n.item))?3:r.ancestorRank<=3?1:r.ancestorRank<=7?2:3;
  r.stage=Math.max(3,devices.find(d=>d.id===r.family).stage,...r.inputs.map(n=>stage(n.item)));
  r.duration=(devices.find(d=>d.id===r.family).baseSeconds+2*r.inputs.length+2*Math.min(r.ancestorRank,8))*1000;
  r.effort=effort(r.output);
};recipes.forEach(solve);
const orders=[...recipes.map((r,i)=>({output:r.output,stage:r.stage,minDeviceLevel:r.minDeviceLevel,effort:r.effort,index:i})),...items.filter(i=>i.kind==='drink').map((i,index)=>({output:i.id,stage:8,minDeviceLevel:Math.min(3,Math.floor((i.level-1)/3)+1),effort:effort(i.id),index:107+index}))].sort((a,b)=>a.stage-b.stage||a.minDeviceLevel-b.minDeviceLevel||a.effort-b.effort||a.index-b.index).map((o,i)=>({...o,id:`v3-order-${String(i+1).padStart(3,'0')}`,coins:Math.max(24,Math.ceil(24+o.effort*6))}));
const result={version:'3.0.0',chains,items,devices,recipes,orders,references:uniqueRefs.map(r=>({id:r.canonical_icon_id,name:r.name,category:r.category,sourceUrl:r.source_url,status:lookup.has(r.name)?'adopted':r.name==='鲜榨橙汁'?'alias':Object.values(stageNames).includes(r.canonical_icon_id)?'project-stage-name':r.category==='equipment'?'appearance-reference':'stage-reference',target:lookup.get(r.name)??(r.name==='鲜榨橙汁'?'dish-fresh-orange-juice':r.canonical_icon_id==='ico-0167'?'fresh-coffee-2':r.canonical_icon_id==='ico-0168'?'fresh-coffee-3':null)}))};
if(chains.length!==14||items.length!==122||recipes.length!==107||orders.length!==123||devices.length!==22)throw new Error('Content counts mismatch');
await writeFile('src/content/expansion-data.json',JSON.stringify(result,null,2)+'\n');
console.log({chains:chains.length,nodes:items.length,recipes:recipes.length,orders:orders.length,devices:devices.length,references:uniqueRefs.length,drinks:recipes.filter(r=>r.kind==='drink').length+items.filter(i=>i.kind==='drink').length+1});
