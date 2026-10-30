import sharp from 'sharp';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const manifest=JSON.parse(await readFile('public/assets/v3-manifest.json','utf8'));
const output='output/v4-art-upgrade/review';
await mkdir(output,{recursive:true});
const named=names=>names.map(name=>{const x=manifest.find(x=>x.name===name&&x.kind==='material');if(!x)throw new Error('Missing review subject '+name);return x;});
const groups=[
 {id:'equipment',title:'26类器材 · 一级轮廓',entries:manifest.filter(x=>x.kind==='device'&&x.level===1)},
 {id:'growth',title:'26类器材 · 三级成长',entries:manifest.filter(x=>x.kind==='device')},
 {id:'produce',title:'果蔬与香料 · 外形识别',entries:named(['番茄','彩椒','红椒','黄瓜','四季豆','香葱','葡萄','蓝莓','桑葚','田园菜篮','缤纷果篮','混合香叶'])},
 {id:'meat',title:'肉类与海鲜 · 切面和结构',entries:named(['培根','五花肉','猪排','鸡胸肉','带骨牛排','羊排','火鸡腿','卤鹅肉','扇贝','鲷鱼','金枪鱼','三文鱼'])},
 {id:'pantry',title:'乳品谷物 · 容器和内容物',entries:named(['纯牛奶','酸奶','炼乳','米粉浆','大米','燕麦','面粉','砂糖','冰糖','冰块'])},
 {id:'finished-drinks',title:'果饮奶茶 · 杯型与层次',entries:manifest.filter(x=>x.kind==='recipe'&&['葡萄果肉饮','热带芒果汁','鹅鹅手打柠檬茶','冰镇水蜜桃露','珍珠奶茶','清新奶绿','香草慕斯奶绿','厚顶鸳鸯奶茶','优酪乳','益生菌饮品'].includes(x.name))},
 {id:'drinks',title:'咖啡、茶与基底 · 容器和轮廓',entries:manifest.filter(x=>x.kind==='material'&&/^fresh-(coffee|tea|mixer)-/.test(x.id))}
];
for(const group of groups){
 for(const size of [32,40,48,96]){
  for(const mode of ['color','gray','silhouette']){
   const cols=group.id==='growth'?6:6,w=Math.max(size+24,86),h=size+34,rows=Math.ceil(group.entries.length/cols),layers=[];
   for(let i=0;i<group.entries.length;i++){
    const entry=group.entries[i];let im=sharp(await readFile('public/'+entry.path)).resize(size,size);
    if(mode==='gray')im=im.grayscale();
    if(mode==='silhouette'){
     const {data,info}=await im.ensureAlpha().raw().toBuffer({resolveWithObject:true});
     for(let n=0;n<data.length;n+=4){data[n]=88;data[n+1]=69;data[n+2]=52;}
     im=sharp(data,{raw:info});
    }
    layers.push({input:await im.png().toBuffer(),left:i%cols*w+Math.floor((w-size)/2),top:Math.floor(i/cols)*h+30});
    const label=entry.name+(entry.kind==='device'?' L'+entry.level:'');
    const caption='<svg width="'+w+'" height="24"><text x="'+w/2+'" y="12" text-anchor="middle" font-size="9" font-family="Microsoft YaHei, sans-serif" fill="#624737">'+label+'</text></svg>';
    layers.push({input:Buffer.from(caption),left:i%cols*w,top:Math.floor(i/cols)*h+size+34});
   }
   layers.push({input:Buffer.from('<svg width="'+cols*w+'" height="26"><text x="12" y="18" font-size="12" font-family="Microsoft YaHei, sans-serif" fill="#624737">'+group.title+' / '+size+'px / '+mode+'</text></svg>'),left:0,top:0});
   await sharp({create:{width:cols*w,height:rows*h+30,channels:4,background:'#fff5df'}}).composite(layers).png().toFile(output+'/'+group.id+'-'+size+'-'+mode+'.png');
  }
 }
}
const sheet=['reviewer,item_id,expected_name,level,recognized_name,correct,response_ms'];
for(const entry of groups[1].entries)sheet.push(','+entry.id+','+entry.name+','+entry.level+',,,');
await writeFile(output+'/recognition-test.csv','\uFEFF'+sheet.join('\r\n')+'\r\n');
await writeFile(output+'/review-index.json',JSON.stringify({artworkVersion:'4.0.0',sizes:[32,40,48,96],modes:['color','gray','silhouette'],groups:groups.map(g=>({id:g.id,title:g.title,items:g.entries.map(x=>x.id)})),humanRecognition:{status:'PENDING',reviewersRequired:3,targetCorrectPercent:90,criticalPairs:['兽肉推车/禽肉推车','咖啡豆磨机/茶叶罐'],results:[]},physicalDevices:{status:'PENDING',required:['Android WeChat','iPhone WeChat'],results:[]}},null,2)+'\n');
console.log(JSON.stringify({reviewBoards:groups.length*4*3,humanRecognition:'PENDING',physicalDevices:'PENDING',output}));
