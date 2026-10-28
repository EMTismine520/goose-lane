export const TUTORIAL_STEPS = [
  { id: 'produce', event: 'generate', text: '轻点蔬菜推车，收下一份新鲜食材', target: 'vegetable-cart' },
  { id: 'merge', event: 'merge', text: '把两颗相同番茄拖在一起，试试二合', target: 'item' },
  { id: 'first-order', event: 'deliver', text: '食材备齐后，轻点顾客卡片交付', target: 'order' },
  { id: 'load', event: 'stageInput', text: '把一颗番茄拖到砧板，准备第一道菜', target: 'chopping-board' },
  { id: 'start', event: 'cook', text: '材料已放好，轻点开火正式开工', target: 'chopping-board' },
  { id: 'wait', event: 'generate', text: '料理制作时，也能继续产出和合成', target: 'vegetable-cart' },
  { id: 'collect', event: 'collect', text: '料理做好啦，轻点砧板取出成品', target: 'chopping-board' },
  { id: 'dish-order', event: 'deliver-dish', text: '把这道新鲜料理送给期待的顾客', target: 'order' },
  { id: 'visit-street', event: 'visit-street', text: '金币攒好啦，点左下角去建设', target: 'page-switch' },
  { id: 'build', event: 'build', text: '清理门前纸箱，让小店有新变化', target: 'construction' },
] as const;
