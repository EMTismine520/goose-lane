import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { createInitialState, execute } from '../src/domain/engine';
import { CHAPTERS } from '../src/content/chapters';
import { SaveRepository, resumeManualSlot, serializeSave, validateSave } from '../src/persistence/save';
import { cloneGameState } from '../src/domain/workspaces';
import { historicalState } from './chapter-fixtures';

const now=1_800_000_000_000;
describe('chapter migration and complete manual checkpoints',()=>{
  it('retains untouched schema-three bytes after current and previous both rotate',async()=>{
    const name='chapter-original-v3',repo=new SaveRepository(name);await repo.open();repo.close();
    const source=JSON.stringify(historicalState(now,2));
    const db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open(name,1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
    await new Promise<void>((resolve,reject)=>{const tx=db.transaction('snapshots','readwrite');tx.objectStore('snapshots').put({format:1,token:'original-schema-three',savedAt:now,data:source},'current');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});db.close();
    try{let state=(await repo.open()).state!;expect(state.activeWorkspaceId).toBe('original');
      for(let i=0;i<3;i++){state=execute(state,{type:'recover'},now+i).state;await repo.save(state);}
      const raw=JSON.parse(await repo.exportRaw());expect(raw.migrationV3.data).toBe(source);expect(JSON.parse(raw.current.data).schemaVersion).toBe(5);expect(JSON.parse(raw.previous.data).schemaVersion).toBe(5);
    }finally{repo.close();}
  });
  it('freezes every background job in a manual slot and restores wallet and entitlements as one snapshot',()=>{
    let s=createInitialState(now);s.coins=10000;
    for(const chapter of [2,6])s=execute(s,{type:'unlockAndEnterChapter',chapter},now).state;
    for(const chapter of [2,6]){const w=s.workspaces![`chapter-${chapter}`],a=w.appliances.find(a=>a.index>=0)!,d=w.devices.find(d=>d.id===a.id)!;
      const recipe=CHAPTERS[chapter-1].dependencies.recipes.find(r=>r.deviceFamilyId===d.familyId&&(r.minDeviceLevel??1)<=d.level)!;
      a.job={id:`g${s.nextId++}`,recipe:recipe.id,startedAt:now-5000,endsAt:now+13000,output:recipe.output};
    }
    s=validateSave(s);const current=cloneGameState(s);current.coins=1;current.chapterAccess!.unlocked.push(8);
    const restored=resumeManualSlot({id:1,status:'ready',state:s,capturedAt:now,savedAt:now},now+86400000,current);
    for(const chapter of [2,6])expect(restored.workspaces![`chapter-${chapter}`].appliances.find(a=>a.job)!.job!.endsAt-restored.lastSeen).toBe(13000);
    expect(restored.coins).toBe(s.coins);expect(restored.chapterAccess!.unlocked).toEqual([1,2,6]);expect(serializeSave(restored)).not.toContain('undefined');
  });
});
