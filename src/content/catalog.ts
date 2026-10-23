import type { ChainDef, CustomerDef, DecorationDef, ItemDef, OrderDef, RecipeDef, Requirement, ShopDef } from '../domain/types';

export const SCHEMA_VERSION = 1;
export const CONTENT_VERSION = '1.0.0';

const chainData: [string, string, string, number, string[]][] = [
  ['grain', '麦香篮', '#e7b568', 1, ['麦穗', '小麦粉', '柔软面团', '金黄吐司', '牛角面包', '手作面包', '丰收面包篮']],
  ['coffee', '咖啡罐', '#a77b61', 1, ['生咖啡豆', '烘焙豆', '现磨咖啡粉', '浓缩咖啡', '醇香咖啡壶', '精品手冲套组', '咖啡师典藏']],
  ['vegetable', '晨露菜篮', '#91af71', 3, ['嫩菜苗', '脆胡萝卜', '红番茄', '鲜绿菜叶', '有机蔬菜篮', '切配时蔬', '田园沙拉']],
  ['dairy', '牧场冰箱', '#accbc1', 2, ['鲜牛奶', '厚乳', '牧场奶盒', '绵密酸奶', '黄油', '牧场奶酪', '陈年奶酪轮']],
  ['fruit', '果园木箱', '#e6a38f', 3, ['小红莓', '甜橙', '红苹果', '紫葡萄', '果园礼篮', '鲜切果拼', '水果芭菲']],
  ['seafood', '渔港鲜箱', '#78aeb9', 4, ['小鲜虾', '鲜甜大虾', '小河鱼', '鲜鱼', '三文鱼', '渔港鲜蟹', '大龙虾']],
  ['meat', '山野冷柜', '#c9938b', 5, ['鲜火腿', '手作香肠', '培根片', '鲜切肉排', '整只嫩鸡', '烤火腿', '炭烤肉排']],
  ['dessert', '甜蜜糖罐', '#c8aa69', 6, ['细砂糖', '彩色糖果', '小曲奇', '奶油纸杯糕', '可可布朗尼', '庆祝蛋糕', '草莓庆典蛋糕']],
];

export const CHAINS: ChainDef[] = chainData.map(([id, name, color, unlockDay, names]) => ({ id, name, color, unlockDay, items: names.map((_, i) => `${id}-${i + 1}`) }));
export const ITEMS: Record<string, ItemDef> = Object.fromEntries(chainData.flatMap(([id, source, , , names], row) => names.map((name, index) => {
  const level = index + 1;
  const item: ItemDef = { id: `${id}-${level}`, name, chain: id, level, icon: row * 8 + index, source, kind: 'ingredient', sell: 2 ** index, description: level === 7 ? `${source}的七阶珍藏，可用于特别订单。` : `两份${name}可合成为${names[index + 1]}。` };
  return [item.id, item] as const;
})));

export const APPLIANCES: { id: number; name: string; unlockDay: number }[] = [
  { id: 0, name: '小鹅煎炉', unlockDay: 1 }, { id: 1, name: '手冲吧台', unlockDay: 1 },
  { id: 2, name: '竹笼蒸锅', unlockDay: 3 }, { id: 3, name: '炭火烤架', unlockDay: 4 },
];

type RecipeSeed = [string, string, number, number, number, [string, number][], string];
const recipeData: RecipeSeed[] = [
  ['toast', '晨光小吐司', 1, 0, 4, [['grain-2', 1]], '热乎的第一片吐司，是老街醒来的味道。'],
  ['pour-over', '巷口手冲', 1, 1, 5, [['coffee-2', 1]], '细细注水，把豆香留在杯中。'],
  ['pancake', '云朵松饼', 1, 0, 7, [['grain-3', 1]], '轻轻翻面，烙出像云朵一样的早餐。'],
  ['breakfast', '早安双拼', 1, 0, 9, [['grain-2', 1], ['coffee-2', 1]], '面包和咖啡的约定，从今天开始。'],
  ['latte', '牧场拿铁', 2, 1, 8, [['coffee-2', 1], ['dairy-2', 1]], '厚乳缓缓融进咖啡，画一片小叶子。'],
  ['cream-bun', '奶油小餐包', 2, 0, 10, [['grain-3', 1], ['dairy-2', 1]], '烤到微金黄，再挤上柔软奶油。'],
  ['cloud-latte', '云顶奶咖', 2, 1, 12, [['coffee-3', 1], ['dairy-3', 1]], '绵密奶盖上，撒一撮现磨咖啡。'],
  ['butter-cookie', '黄油曲奇', 2, 0, 12, [['grain-4', 1], ['dairy-1', 1]], '沿着贝壳纹，一口咬开酥香。'],
  ['green-bun', '翡翠蒸包', 3, 2, 14, [['grain-3', 1], ['vegetable-3', 1]], '把菜园的清新，包进白白的面皮。'],
  ['berry-milk', '莓莓鲜奶', 3, 1, 10, [['fruit-3', 1], ['dairy-2', 1]], '一杯粉红色的午后。'],
  ['garden-toast', '田园厚吐司', 3, 0, 16, [['grain-4', 1], ['vegetable-3', 1]], '面包上盛满早市的好颜色。'],
  ['fruit-cup', '果园奶香杯', 3, 1, 14, [['fruit-4', 1], ['dairy-3', 1]], '应季果香与奶油，一层又一层。'],
  ['shrimp-bun', '水晶鲜虾包', 4, 2, 18, [['seafood-3', 1], ['grain-3', 1]], '竹笼揭开时，鲜香也跟着醒了。'],
  ['grilled-fish', '河岸炭烤鱼', 4, 3, 22, [['seafood-4', 1], ['vegetable-2', 1]], '把河岸的风，烤进这条鲜鱼。'],
  ['seafood-bowl', '渔港暖暖锅', 4, 2, 24, [['seafood-4', 1], ['vegetable-3', 1]], '咕嘟咕嘟，装下渔港的热闹。'],
  ['shrimp-toast', '金脆鲜虾吐司', 4, 0, 18, [['seafood-3', 1], ['grain-4', 1]], '酥脆吐司托住满满鲜虾。'],
  ['beef-skewer', '山野烤肉串', 5, 3, 24, [['meat-3', 1], ['vegetable-3', 1]], '炭火把黄昏染成了好吃的颜色。'],
  ['meat-bun', '暖心鲜肉包', 5, 2, 22, [['meat-3', 1], ['grain-4', 1]], '馅料饱满，适合分给并肩的朋友。'],
  ['berry-cake', '莓果庆祝蛋糕', 5, 0, 28, [['grain-4', 1], ['fruit-4', 1], ['dairy-3', 1]], '给每个小小的进步，留一块蛋糕。'],
  ['steak', '香煎主厨肉排', 5, 3, 30, [['meat-5', 1], ['dairy-3', 1]], '黄油滋响，晚餐值得认真等待。'],
  ['night-sundae', '星光曲奇圣代', 6, 1, 30, [['dessert-3', 1], ['dairy-4', 1]], '把星星装进杯里，送给晚归的朋友。'],
  ['night-bowl', '夜市团圆锅', 6, 2, 34, [['meat-4', 1], ['vegetable-4', 1], ['seafood-3', 1]], '有热汤，有朋友，今晚就很圆满。'],
  ['house-cake', '鹅巷招牌蛋糕', 6, 0, 36, [['dessert-4', 1], ['fruit-4', 1], ['dairy-3', 1]], '老街的甜蜜味道，今天由你接棒。'],
  ['feast', '灯火庆祝甜宴', 6, 0, 40, [['dessert-5', 1], ['dairy-5', 1], ['fruit-4', 1]], '这一桌灯火，是大家一起修好的日子。'],
];

export const RECIPES: RecipeDef[] = recipeData.map(([id, name, unlockDay, appliance, seconds, input, description]) => {
  const inputs = input.map(([item, count]) => ({ item, count }));
  const output = `dish-${id}`;
  const source = ITEMS[inputs[0].item];
  ITEMS[output] = { id: output, name, chain: source.chain, level: 1, icon: Math.floor(source.icon / 8) * 8 + 7, source: APPLIANCES[appliance].name, description, kind: 'dish', sell: Math.max(1, Math.floor(inputs.reduce((n, r) => n + ITEMS[r.item].sell * r.count, 0) * 0.8)) };
  return { id, name, inputs, output, appliance, duration: seconds * 1000, unlockDay, description };
});

export const SHOPS: ShopDef[] = [
  { id: 'breakfast', name: '早安鹅铺', subtitle: '一口热乎 · 开始今天', day: 1, color: '#e6b96d', costs: [60, 120, 260], description: '擦亮旧招牌，给经过老街的人一份热早餐。' },
  { id: 'cafe', name: '河岸咖啡', subtitle: '一杯醇香 · 慢慢相逢', day: 2, color: '#88aaa0', costs: [160, 260, 420], description: '让窗边座位重新有香气，也有可以慢慢说的话。' },
  { id: 'steam', name: '竹笼小馆', subtitle: '蒸汽袅袅 · 心也暖了', day: 3, color: '#cbb77b', costs: [240, 360, 540], description: '一层层竹笼，装着邻里最惦记的老味道。' },
  { id: 'grill', name: '晚风烧烤', subtitle: '炭火微红 · 河风正好', day: 4, color: '#cc8e70', costs: [320, 440, 640], description: '沿河摆好小板凳，晚风会带来新的客人。' },
  { id: 'dessert', name: '莓好甜屋', subtitle: '甜一点点 · 快乐多一点', day: 5, color: '#cf9c9c', costs: [400, 520, 720], description: '把季节做进蛋糕，让平凡的今天也值得庆祝。' },
  { id: 'night', name: '灯火食堂', subtitle: '一巷灯火 · 一桌团圆', day: 6, color: '#8796ab', costs: [480, 600, 800], description: '灯笼点亮的地方，永远有一桌留给远归的朋友。' },
];

const people: [string, string, string, string, string, string[]][] = [
  ['momo', '阿沫', '花店店主', '#d6a8b3', '花朵围巾', ['这条巷子，好久没闻见烤面包香了。', '等你的咖啡馆开张，我送第一束花。', '我想把河边空花坛也种满。', '你看，连晚风都带着花香了。']],
  ['uncle', '鹅伯', '老街邮差', '#9bacbe', '蓝色邮帽', ['我送了三十年信，也记得这块旧招牌。', '从前排队买早饭的孩子，如今都长大了。', '这里有封写给整条街的信。', '信上说：下次回来，请给我留个座位。']],
  ['taro', '小芋', '见习厨师', '#d7b87d', '格子围裙', ['翻面的时候，我总会有一点紧张。', '今天的奶泡，好像终于像一片叶子了！', '原来好吃，是愿意多认真一点。', '我也想开一家，让人愿意回来的小店。']],
  ['lin', '林奶奶', '故事收藏家', '#b4b891', '翡翠披肩', ['老街的故事，都是从饭桌旁开始的。', '这杯咖啡，让我想起年轻时那趟远行。', '年轻人的新味道，也能成为老街记忆。', '今天的故事，我想叫它“一巷灯火”。']],
  ['cloud', '云云', '插画师', '#b8accb', '贝雷帽', ['我在画这条巷子的早晨。', '想借你的窗边坐一会儿。', '画里多了好多新的颜色。', '画好了，送给我们的小街。']],
  ['river', '小舟', '摆渡人', '#82b0b6', '水手领', ['第一班船靠岸了，来份热的吧。', '河面今天很平，像一面镜子。', '客人们都在问这条巷子怎么走。', '今晚最后一班船，载着满满的香气。']],
  ['dou', '豆豆', '学生', '#c7b478', '黄色背包', ['上课前，先给肚子加一点油。', '今天考得不错，想奖励自己。', '我带同学一起来啦。', '放假第一天，当然来老地方！']],
  ['pepper', '椒椒', '夜市乐手', '#ba9299', '小吉他', ['先吃饱，才有力气唱歌。', '今天想为咖啡馆写一首小曲。', '烤架的声音，也很有节奏。', '这首歌，送给每一盏亮起的灯。']],
  ['pine', '松松', '木匠', '#b39678', '工装背带', ['桌脚我修好了，饭也该吃了。', '旧木头磨一磨，还能陪我们很多年。', '给甜品屋做了一个小展示架。', '最后一把椅子，也找到主人了。']],
  ['tide', '潮潮', '渔港摊主', '#8eafb1', '条纹头巾', ['今早的鲜货，第一份给老街。', '我从小就认得这段河岸。', '你烤的鱼，让我想多留一会儿。', '明天的好收成，也一起分享吧。']],
  ['apricot', '杏杏', '果园园丁', '#d8aa84', '草帽', ['第一筐熟果，甜得正好。', '果园的风，有一点青草味。', '你把水果做成了庆祝的样子。', '明年花开，再给老街送一筐春天。']],
  ['star', '星星', '远归旅人', '#8f9bb6', '旅行箱', ['地图上的小巷，比想象中更暖。', '我想把这杯的味道记下来。', '走了很远，还是想念热腾腾的饭。', '这一次回来，我想多住几天。']],
];
export const CUSTOMERS: CustomerDef[] = people.map(([id, name, role, color, accessory, story]) => ({ id, name, role, color, accessory, story }));

const ornamentNames = [ ['门口花箱', '手写小黑板', '暖光壁灯', '河边双人桌'], ['窗边绿植', '手冲器具架', '软垫小沙发', '留声小唱机'], ['竹编挂饰', '花纹蒸笼架', '木格屏风', '团圆圆桌'], ['晚风风铃', '炭火招牌', '河岸长板凳', '小舞台灯串'], ['莓果花环', '甜点展示架', '格纹遮阳棚', '庆祝蛋糕台'], ['团圆红灯笼', '老街留言板', '星光纸灯', '长桌团圆席'] ];
export const DECORATIONS: DecorationDef[] = SHOPS.flatMap((shop, shopIndex) => ornamentNames[shopIndex].map((name, index) => ({ id: `${shop.id}-decor-${index + 1}`, name, shop: shop.id, cost: 80 + shopIndex * 35 + index * 45, bonus: index % 2 === 0 ? 'tips' : 'speed', description: index % 2 === 0 ? '订单小费增加 2%，全街最高 20%。' : '料理加工缩短 3%，全街最高 30%。' })));

function baseUnits(item: string): number {
  const recipe = RECIPES.find(r => r.output === item);
  return recipe ? recipe.inputs.reduce((n, input) => n + baseUnits(input.item) * input.count, 0) : 2 ** (ITEMS[item].level - 1);
}
export { baseUnits };
const titles = ['第一声早安', '给朋友带一份', '窗边的位置', '今日第一道料理', '熟悉的老味道', '忙里偷闲', '分享的好滋味', '主厨的手艺', '午后小聚', '河岸来客', '再来一份吧', '新朋友的邀约', '今日特别推荐', '收工前的约定'];
const chapterChains = [['grain', 'coffee'], ['coffee', 'dairy', 'grain'], ['vegetable', 'fruit', 'grain'], ['seafood', 'vegetable', 'coffee'], ['meat', 'fruit', 'dairy'], ['dessert', 'meat', 'seafood']];
export const ORDERS: OrderDef[] = Array.from({ length: 6 }, (_, chapter) => {
  const day = chapter + 1;
  const chains = chapterChains[chapter];
  const dishes = RECIPES.filter(r => r.unlockDay === day);
  return Array.from({ length: 14 }, (_, index) => {
    const customer = CUSTOMERS[(chapter * 2 + index) % CUSTOMERS.length];
    let needs: Requirement[];
    if ([3, 5, 7, 9, 11, 13].includes(index)) {
      const dishIndex = [3, 5, 7, 9, 11, 13].indexOf(index) % 4;
      needs = [{ item: dishes[dishIndex].output, count: 1 }];
      if (index === 13 && day > 1) needs.push({ item: `${chains[1]}-${Math.min(4, day + 1)}`, count: 1 });
    } else {
      const level = index === 0 ? 2 : Math.min(day === 1 ? 4 : day === 6 ? 7 : 5, 2 + Math.floor(index / 4) + Math.floor(chapter / 3));
      needs = [{ item: `${chains[index % chains.length]}-${level}`, count: 1 }];
      if (index === 12 && day >= 3) needs.push({ item: `${chains[(index + 1) % chains.length]}-${Math.min(4, day)}`, count: 1 });
      if (index === 12 && day === 6) needs[0].item = 'dessert-7';
    }
    const units = needs.reduce((n, need) => n + baseUnits(need.item) * need.count, 0);
    return { id: `day-${day}-order-${index + 1}`, day, customer: customer.id, title: day === 1 && index === 0 ? '老街的第一份早餐' : titles[index], message: customer.story[Math.min(3, Math.floor(chapter / 2) + (index > 9 ? 1 : 0))], thanks: `${customer.name}：${['正是我惦记的味道，谢谢你！', '吃饱啦，今天也会是好日子。', '下次我带朋友一起来！', '老街有你，真好。'][index % 4]}`, needs, coins: 36 + day * 14 + units * 8, reputation: 5 + day * 2 + Math.ceil(units / 8) };
  });
}).flat();

export const CHAPTER_NAMES = ['晨光开张', '河岸醇香', '竹笼蒸汽', '晚风炭火', '莓好时光', '一巷灯火'];
