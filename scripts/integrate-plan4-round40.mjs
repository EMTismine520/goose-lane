import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const hash=b=>createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(await readFile('output/plan4-food-review/site/round40.json','utf8'));
const registryPath='artwork/plan4-food/runtime-overrides.json';
const registry=JSON.parse(await readFile(registryPath,'utf8'));
const candidates=manifest.samples.filter(r=>r.status==='CANDIDATE'&&r.nameChanged);
if(manifest.round!==40||candidates.length!==2)throw Error('Two current replacement candidates required');
const ids=new Set(candidates.map(r=>r.id)),unrelatedBefore=JSON.stringify(registry.filter(r=>!ids.has(r.id)));
if(registry.filter(r=>!ids.has(r.id)).length!==26)throw Error('Existing runtime source scope differs');
await mkdir('artwork/plan4-food/runtime-sources',{recursive:true});
for(const row of candidates){
 const bytes=await readFile('output/plan4-food-review/site/'+row.proposal.source);
 if(hash(bytes)!==row.proposal.sha256.source)throw Error('Candidate source differs');
 const source='artwork/plan4-food/runtime-sources/'+row.id+'.svg';await writeFile(source,bytes);
 const entry={id:row.id,name:row.name,kind:'recipe',source,sourceSha256:hash(bytes),expectedOccupancy:row.expectedOccupancy,sourceSelection:{reviewId:manifest.reviewId,variant:'candidate',sha256:row.proposal.sha256},approvalStatus:'PENDING_USER_ACCEPTANCE'};
 const i=registry.findIndex(r=>r.id===row.id);if(i<0)registry.push(entry);else registry[i]=entry;
}
if(registry.length!==28||unrelatedBefore!==JSON.stringify(registry.filter(r=>!ids.has(r.id))))throw Error('Unrelated runtime sources changed');
await writeFile(registryPath,JSON.stringify(registry,null,2)+'\n');
console.log(JSON.stringify({reviewId:manifest.reviewId,runtimeSources:registry.length,pendingCandidateSources:candidates.map(r=>({code:r.code,id:r.id,name:r.name})),existingSourcesUnchanged:26},null,2));
