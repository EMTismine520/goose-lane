import { mkdirSync, writeFileSync } from 'node:fs';
import { CHAINS, MODERN_ITEMS, MODERN_ORDERS, MODERN_RECIPES } from '../src/content/catalog';
import { DEVICE_FAMILIES, EXPANSION, THEME_NAMES } from '../src/content/expansion';
import { deviceAssetPath, itemAssetPath } from '../src/content/assets';

const items=MODERN_ITEMS.map(i=>({...i,assetPath:itemAssetPath(i.id)}));
const equipment=DEVICE_FAMILIES.flatMap(f=>[1,2,3].map(level=>({...f,id:`${f.id}-l${level}`,familyId:f.id,level,assetPath:deviceAssetPath(`${f.id}-l${level}`)})));
const catalog={version:'3.0.0',schema:3,counts:{items:245,recipes:123,finished:139,equipment:66,total:311,orders:145},themes:THEME_NAMES,chains:CHAINS.filter(c=>c.id.startsWith('fresh-')),items,recipes:MODERN_RECIPES,equipment,orders:MODERN_ORDERS,references:EXPANSION.references};
if(items.length!==245||equipment.length!==66||MODERN_RECIPES.length!==123||MODERN_ORDERS.length!==145)throw new Error('Catalog is incomplete');
mkdirSync('public/content',{recursive:true});writeFileSync('public/content/v3-catalog.json',JSON.stringify(catalog,null,2)+'\n');
const kind=(value:string)=>({ingredient:'食材',dish:'料理',drink:'饮品'}[value]??value);
let doc='# 完整料理图鉴 · 内容 3.0.0\n\n245个食物材料、66个设备形态，共311个唯一收藏。139种成品通过123道配方或16个合成饮品节点获得。配方、阶数和成长为本项目设计。表中配方秒数为基础耗时，实际按厨具等级与已拥有的速度加成缩短。\n\n';
for(const group of ['dish','drink','ingredient']){
 doc+=`## ${kind(group)}\n\n| ID | 名称 | 获取方法与材料 | 主题 | 资产 |\n|---|---|---|---|---|\n`;
 for(const item of items.filter(i=>i.kind===group)){const r=MODERN_RECIPES.find(r=>r.output===item.id);const chain=CHAINS.find(c=>c.items.includes(item.id));doc+=`| ${item.id} | ${item.name} | ${r?`${DEVICE_FAMILIES.find(f=>f.id===r.deviceFamilyId)!.name}${r.minDeviceLevel}级；${r.inputs.map(n=>items.find(i=>i.id===n.item)!.name+'×'+n.count).join('＋')}；${r.duration/1000}秒`:`${chain!.name} ${item.level}阶，${item.source}生产与二合`} | ${THEME_NAMES[(item.stage??1)-1]} | ${item.assetPath} |\n`;}
 doc+='\n';
}
doc+='## 设备\n\n| 家族 | 类型 | 主题 | 三级形态 | 副本 |\n|---|---|---|---|---|\n';
for(const f of DEVICE_FAMILIES)doc+=`| ${f.name} | ${f.kind==='generator'?'生产器':'厨具'} | ${THEME_NAMES[f.stage-1]} | ${[1,2,3].map(l=>`${f.id}-l${l}`).join(' → ')} | ${f.price}金币 |\n`;
doc+='\n## 固定订单\n\n| ID | 主题 | 需要 | 金币 |\n|---|---|---|---|\n';
for(const o of MODERN_ORDERS)doc+=`| ${o.id} | ${THEME_NAMES[(o.stage??(o.id.startsWith('home-')?2:1))-1]} | ${o.needs.map(n=>items.find(i=>i.id===n.item)!.name+'×'+n.count).join('、')} | ${o.coins} |\n`;
writeFileSync('docs/V3_CATALOG.md',doc);
const status:Record<string,string>={adopted:'名称采用',alias:'别名并入', 'appearance-reference':'设备外观参考；项目功能另行设计','stage-reference':'阶段外观参考；名称或配方采用本项目设计','project-stage-name':'原阶段外观保留，名称采用项目命名'};
writeFileSync('docs/V3_REFERENCE_MAP.md','# 174项参考外观映射\n\n研究裁切不进入正式运行时。所有正式图片独立制作或复用本项目已有源稿。参考并不代表原作的完整总量，配方和成长规则为本项目设计。\n\n| 参考ID | 原始名称/描述 | 采用方式 | 项目ID | 公开来源 |\n|---|---|---|---|---|\n'+EXPANSION.references.map(r=>`| ${r.id} | ${r.name} | ${status[r.status]} | ${r.target??'见本项目对应系列或三级设备设计'} | [原帖](${r.sourceUrl}) |`).join('\n')+'\n');
console.log(catalog.counts);
