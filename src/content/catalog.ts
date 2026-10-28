import type { ChainDef, CustomerDef, DecorationDef, ItemDef, OrderDef, RecipeDef, Requirement, ShopDef } from '../domain/types';
import { installExpansion } from './expansion';

export const SCHEMA_VERSION = 3;
export const CONTENT_VERSION = '4.0.0';

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

// Never rename historical IDs: imported saves keep their original item and recipe semantics.
export const LEGACY_ITEMS = { ...ITEMS };
export const LEGACY_CHAINS = [...CHAINS];
export const LEGACY_RECIPES = [...RECIPES];
export const LEGACY_ORDERS = [...ORDERS];
const freshChains = [
  { id: 'fresh-veg', name: '蔬菜推车', color: '#79ad50', names: ['番茄', '黄瓜', '彩椒', '胡萝卜', '西兰花', '南瓜', '田园菜篮'] },
  { id: 'fresh-fruit', name: '鲜果木箱', color: '#f1a842', names: ['草莓', '甜橙', '苹果', '葡萄', '菠萝', '西瓜', '缤纷果篮'] },
];
export const FRESH_CHAINS: ChainDef[] = freshChains.map(chain => ({ id: chain.id, name: chain.name, color: chain.color, unlockDay: 1, items: chain.names.map((_, index) => `${chain.id}-${index + 1}`) }));
CHAINS.push(...FRESH_CHAINS);
freshChains.forEach((chain, row) => chain.names.forEach((name, index) => {
  const id = `${chain.id}-${index + 1}`;
  ITEMS[id] = { id, name, chain: chain.id, level: index + 1, icon: 64 + row * 7 + index, assetId: id, source: chain.name, kind: 'ingredient', sell: 2 ** index, description: index < 6 ? `两份${name}可合成${chain.names[index + 1]}。` : '最高阶食材，留给特别期待它的顾客。' };
}));
const freshRecipes: [string, string, number, number, [string, number][], string][] = [
  ['fresh-tomato-salad', '番茄小沙拉', 0, 12, [['fresh-veg-1', 1]], '红番茄切成小瓣，淋上清新的香草汁。'],
  ['fresh-carrot-salad', '胡萝卜花园', 0, 22, [['fresh-veg-4', 1]], '胡萝卜切成花朵，撒上脆脆的芝麻。'],
  ['fresh-garden-bowl', '田园丰收碗', 0, 30, [['fresh-veg-5', 1], ['fresh-fruit-2', 1]], '西兰花和甜橙，把田园的颜色装满一碗。'],
  ['fresh-berry-cup', '草莓甜心杯', 1, 14, [['fresh-fruit-1', 1]], '鲜切草莓层层堆起，盛进小小玻璃杯。'],
  ['fresh-orange-juice', '阳光鲜橙汁', 1, 18, [['fresh-fruit-2', 1]], '现榨甜橙，杯里是明亮的清晨。'],
  ['fresh-fruit-platter', '缤纷水果盘', 1, 26, [['fresh-fruit-4', 1]], '把紫葡萄排成一圈，分享果园的甜。'],
];
export const FRESH_RECIPES: RecipeDef[] = freshRecipes.map(([id, name, appliance, seconds, input, description], index) => {
  const inputs = input.map(([item, count]) => ({ item, count }));
  const output = `dish-${id}`;
  ITEMS[output] = { id: output, name, chain: ITEMS[inputs[0].item].chain, level: 1, icon: 78 + index, assetId: output, source: appliance === 0 ? '小鹅砧板' : '鲜果料理台', description, kind: 'dish', sell: Math.max(1, Math.floor(inputs.reduce((sum, need) => sum + ITEMS[need.item].sell * need.count, 0) * 0.8)) };
  return { id, name, appliance, duration: seconds * 1000, inputs, output, unlockDay: 1, description };
});
RECIPES.push(...FRESH_RECIPES);
const openingOrders: [string, string, number, string][] = [
  ['fresh-veg-2', '清晨第一口', 12, 'momo'],
  ['dish-fresh-tomato-salad', '一碗新鲜', 16, 'uncle'],
  ['fresh-fruit-2', '捎一份阳光', 12, 'taro'],
  ['dish-fresh-berry-cup', '莓好的约定', 18, 'lin'],
  ['fresh-veg-3', '彩色午餐', 16, 'momo'],
  ['dish-fresh-orange-juice', '清甜一杯', 22, 'uncle'],
  ['fresh-veg-4', '花园来信', 24, 'taro'],
  ['dish-fresh-carrot-salad', '认真做的好味道', 32, 'lin'],
  ['fresh-fruit-3', '给朋友带一份', 16, 'momo'],
  ['dish-fresh-fruit-platter', '果园小聚', 34, 'uncle'],
  ['fresh-fruit-4', '紫色的甜蜜', 24, 'taro'],
  ['dish-fresh-garden-bowl', '今日丰收', 48, 'lin'],
];
export const FRESH_ORDERS: OrderDef[] = openingOrders.map(([item, title, coins, customer], index) => ({
  id: `opening-order-${index + 1}`, day: 1, customer, title,
  message: ['今天也想吃到你做的新鲜味道。', '慢慢来，我就在这里等你。', '一份新鲜，刚刚好。'][index % 3],
  thanks: `${CUSTOMERS.find(person => person.id === customer)!.name}：${['真新鲜，谢谢你！', '吃饱啦，等会儿再来。', '这份心意，我收到啦！'][index % 3]}`,
  needs: [{ item, count: 1 }], coins, reputation: 2,
}));
ORDERS.push(...FRESH_ORDERS);

const homeChains = [
  { id: 'fresh-beast', name: '兽肉', source: '兽肉推车', color: '#d97d65', names: ['香肠', '培根', '肉丸', '五花肉', '排骨', '猪排', '带骨肘子', '带骨牛排', '羊排', '火腿'] },
  { id: 'fresh-poultry', name: '禽肉', source: '禽肉推车', color: '#e8a7a1', names: ['鸡蛋', '鸡胗', '鸡翅中', '鸡胸肉', '鸡腿', '鸡全翅', '整鸡'] },
  { id: 'fresh-spice', name: '香料调料', source: '香料盒', color: '#98b65d', names: ['红椒', '香葱', '紫洋葱', '香草荚', '大蒜', '罗勒', '肉桂'] },
];
export const HOME_CHAINS: ChainDef[] = homeChains.map(chain => ({ id: chain.id, name: chain.name, color: chain.color, unlockDay: 1, items: chain.names.map((_, i) => `${chain.id}-${i + 1}`) }));
CHAINS.push(...HOME_CHAINS);
homeChains.forEach(chain => chain.names.forEach((name, i) => {
  const id = `${chain.id}-${i + 1}`;
  ITEMS[id] = { id, name, chain: chain.id, level: i + 1, icon: 0, assetId: id, assetPath: `assets/items/${id}.svg`, source: chain.source, kind: 'ingredient', sell: 2 ** i, description: i < chain.names.length - 1 ? `两份${name}可合成${chain.names[i + 1]}。` : '最高阶食材，留给特别期待它的顾客。' };
}));
const homeRecipes: [string, string, number, string[], string][] = [
  ['onion-salad', '凉拌紫洋葱', 18, ['fresh-veg-2', 'fresh-spice-3'], '紫洋葱丝拌上清脆黄瓜，酸甜开胃。'],
  ['tomato-eggs', '番茄炒蛋', 22, ['fresh-veg-1', 'fresh-poultry-1', 'fresh-spice-2'], '嫩黄鸡蛋裹着番茄汁，撒一把葱花。'],
  ['meatball-soup', '肉丸蔬菜汤', 28, ['fresh-beast-3', 'fresh-veg-1', 'fresh-spice-2'], '圆滚滚的肉丸在清汤中咕嘟，热气里满是鲜香。'],
  ['garlic-broccoli', '蒜香西兰花', 32, ['fresh-veg-5', 'fresh-spice-5'], '脆嫩西兰花翻炒蒜末，留住一盘翠绿。'],
  ['vegetable-rice', '彩蔬拌饭', 24, ['fresh-veg-3', 'fresh-veg-4', 'fresh-spice-2'], '彩椒、胡萝卜与葱花，把家常米饭点亮。'],
  ['scallion-egg-rice', '葱香蛋饭', 18, ['fresh-poultry-1', 'fresh-spice-2'], '蓬松米饭盖上嫩蛋，葱香暖暖地散开。'],
  ['seared-pork', '香煎肉片', 28, ['fresh-beast-4', 'fresh-spice-3'], '肉片煎出焦香，配上清甜紫洋葱。'],
  ['garlic-cucumber', '蒜香黄瓜', 22, ['fresh-veg-2', 'fresh-spice-5'], '蒜末爆香，黄瓜清脆，一盘简单的好味道。'],
  ['chicken-roll', '香煎鸡肉卷', 34, ['fresh-poultry-4', 'fresh-poultry-1', 'fresh-spice-2'], '嫩鸡肉裹入蛋皮，煎成一卷金黄。'],
  ['orange-ribs', '橙香小排', 40, ['fresh-beast-5', 'fresh-fruit-2', 'fresh-spice-1'], '甜橙与红椒调成亮亮的酱汁，包住鲜嫩小排。'],
];
export const HOME_RECIPES: RecipeDef[] = homeRecipes.map(([slug, name, seconds, ingredients, description]) => {
  const id = `fresh-home-${slug}`, output = `dish-${id}`;
  const inputs = ingredients.map(item => ({ item, count: 1 }));
  ITEMS[output] = { id: output, name, chain: 'fresh-home', level: 1, icon: 0, assetId: output, assetPath: `assets/items/${output}.svg`, source: '料理锅', description, kind: 'dish', sell: Math.max(1, Math.floor(inputs.reduce((sum, need) => sum + ITEMS[need.item].sell, 0) * 0.8)) };
  return { id, name, inputs, output, appliance: 4, duration: seconds * 1000, unlockDay: 1, description };
});
RECIPES.push(...HOME_RECIPES);
export const MODERN_RECIPES = [...FRESH_RECIPES, ...HOME_RECIPES];
const homeOrderSequence = [5, 1, 0, 2, 8, 6, 4, 7, 9, 3];
export const HOME_ORDERS: OrderDef[] = homeOrderSequence.map((recipeIndex, index) => {
  const recipe = HOME_RECIPES[recipeIndex], customer = CUSTOMERS[index % 4];
  return { id: `home-order-${String(index + 1).padStart(2, '0')}`, day: 1, customer: customer.id, title: ['锅里第一缕香', '番茄遇见嫩蛋', '清爽小菜', '一碗暖汤', '金黄的小心意', '煎出好滋味', '把颜色拌进饭里', '蒜香正好', '橙香满小巷', '家常也认真'][index], message: `${customer.name}想尝尝你做的${recipe.name}。`, thanks: `${customer.name}：${['热乎乎的，心也暖了！', '这就是惦记的家常味。', '下次还想来吃你做的菜！'][index % 3]}`, needs: [{ item: recipe.output, count: 1 }], coins: 12 + 3 * baseUnits(recipe.output), reputation: 2 };
});
ORDERS.push(...HOME_ORDERS);
installExpansion(ITEMS, CHAINS, RECIPES, MODERN_RECIPES, ORDERS, FRESH_RECIPES, HOME_RECIPES);
export const MODERN_ITEMS = Object.values(ITEMS).filter(item => item.id.startsWith('fresh-') || MODERN_RECIPES.some(recipe => recipe.output === item.id));
export const MODERN_ORDERS = [...FRESH_ORDERS, ...HOME_ORDERS, ...ORDERS.filter(order => order.id.startsWith('v3-order-'))];
