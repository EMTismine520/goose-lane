import DATA from './expansion-data.json';
import type { ChainDef, DeviceFamilyDef, ItemDef, OrderDef, RecipeDef } from '../domain/types';

export const EXPANSION = DATA;
export const DEVICE_FAMILIES: DeviceFamilyDef[] = DATA.devices as DeviceFamilyDef[];
export const THEME_NAMES = ['果蔬开张','家常烟火','晨间茶饮','街角烘焙','炭火夜市','海港蒸鲜','缤纷甜点','晚风特调'];
export const BAND_COSTS = [1,2,4,8,16];
export const BAND_LEVELS = [1,2,3,3,3];

/** Install into the original registries after their historical snapshots have been made. */
export function installExpansion(items: Record<string,ItemDef>, chains: ChainDef[], recipes: RecipeDef[], modern: RecipeDef[], orders: OrderDef[], opening: RecipeDef[], home: RecipeDef[]) {
  for (const chain of DATA.chains) {
    let target=chains.find(c=>c.id===chain.id);
    if(!target) { target={id:chain.id,name:chain.name,color:['#80a55a','#eda354','#bc746a','#7aaabb'][chains.length%4],unlockDay:1,items:[]};chains.push(target); }
    Object.assign(target,{name:chain.name,stage:chain.stage,producer:chain.producer,items:chain.names.map((_,i)=>`${chain.id}-${i+1}`)});
  }
  for(const item of DATA.items) {
    const old=items[item.id], family=DEVICE_FAMILIES.find(d=>d.chains.includes(item.chain))!;
    items[item.id]={...old,...item,kind:item.kind as ItemDef['kind'],icon:old?.icon??0,assetId:item.id,assetPath:old?.assetPath??(old?undefined:`assets/v3-b/${item.id}.webp`),source:family.name,sell:old?.sell??Math.max(1,Math.ceil(BAND_COSTS[Math.floor((item.level-1)/3)]*2**((item.level-1)%3))),description:`${item.level}阶${DATA.chains.find(c=>c.id===item.chain)!.name}。${item.level<chains.find(c=>c.id===item.chain)!.items.length?'两份同阶物品可以合成下一阶。':'本系列最高阶，可收集图鉴。'}`};
  }
  for(const r of [...opening,...home]) {
    r.deviceFamilyId=opening.includes(r)?r.appliance===0?'chopping-board':'fruit-press':'home-cooking-pot';
    r.minDeviceLevel=1;r.stage=opening.includes(r)?1:2;
    items[r.output].stage=r.stage;
  }
  items['dish-fresh-orange-juice'].kind='drink';items['dish-fresh-orange-juice'].aliases=['鲜榨橙汁'];
  for(const r of DATA.recipes) {
    const family=DEVICE_FAMILIES.find(d=>d.id===r.family)!;
    const description=`${r.inputNames.join('、')}，交给${family.name}制作，留住一份街巷风味。`;
    items[r.output]={id:r.output,name:r.name,chain:'fresh-menu',level:1,icon:0,assetId:r.output,assetPath:`assets/v3-b/${r.output}.webp`,kind:r.kind as ItemDef['kind'],source:family.name,description,sell:Math.max(3,Math.floor(r.effort*2)),stage:r.stage,referenceId:r.referenceId,naming:r.naming};
    const recipe:RecipeDef={id:r.id,name:r.name,output:r.output,inputs:r.inputs,appliance:family.slot!,deviceFamilyId:r.family,minDeviceLevel:r.minDeviceLevel,stage:r.stage,duration:r.duration,unlockDay:1,description};
    recipes.push(recipe);modern.push(recipe);
  }
  for(const [i,o] of DATA.orders.entries()) orders.push({id:o.id,day:1,stage:o.stage,customer:['momo','uncle','taro','lin'][i%4],title:`${THEME_NAMES[o.stage-1]} · ${items[o.output].name}`,message:`今天想尝尝${items[o.output].name}，慢慢来，我就在这里等你。`,thanks:'这份滋味，值得专程来一趟！',needs:[{item:o.output,count:1}],coins:o.coins,reputation:2});
}
