import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir} from 'node:fs/promises';

const hash=b=>createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(await readFile('output/plan4-food-review/site/round46.json','utf8'));
const registryPath='artwork/plan4-food/runtime-overrides.json';
const registry=JSON.parse(await readFile(registryPath,'utf8'));
const candidates=manifest.samples.filter(row=>row.status==='CANDIDATE'&&row.nameChanged);
const id='dish-fresh-ico-0118';
if(manifest.round!==46||!manifest.reviewId||candidates.length!==1)throw Error('One round46 replacement candidate required');
const row=candidates[0];
if(row.id!==id||row.code!=='DS117'||row.name!=='桑葚龙舌兰特调'||row.expectedOccupancy!==.84)throw Error('DS117 replacement identity or size differs');
const unrelated=registry.filter(entry=>entry.id!==id),unrelatedBefore=JSON.stringify(unrelated);
if(unrelated.length!==30||registry.length!==30||registry.some(entry=>entry.id===id))throw Error('Expected thirty existing sources and one new DS117 source');

const bytes=await readFile('output/plan4-food-review/site/'+row.proposal.source);
if(hash(bytes)!==row.proposal.sha256.source)throw Error('DS117 candidate source differs');
const source='artwork/plan4-food/runtime-sources/'+id+'.svg';
await mkdir('artwork/plan4-food/runtime-sources',{recursive:true});
await writeFile(source,bytes);
registry.push({id,name:row.name,kind:'recipe',source,sourceSha256:hash(bytes),expectedOccupancy:.84,sourceSelection:{reviewId:manifest.reviewId,variant:'candidate',sha256:row.proposal.sha256},approvalStatus:'PENDING_USER_ACCEPTANCE'});
if(registry.length!==31||unrelatedBefore!==JSON.stringify(registry.filter(entry=>entry.id!==id)))throw Error('Unrelated runtime sources changed');
await writeFile(registryPath,JSON.stringify(registry,null,2)+'\n');
console.log(JSON.stringify({reviewId:manifest.reviewId,runtimeSources:registry.length,pendingCandidateSources:[{code:row.code,id,name:row.name}],existingSourcesUnchanged:30},null,2));
