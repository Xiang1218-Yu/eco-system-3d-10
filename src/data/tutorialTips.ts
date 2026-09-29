import type { TrophicLevel } from '@/types/ecosystem';

/**
 * 教学提示触发条件。
 * 所有条件都必须来自模拟时间、种群数量、营养级或状态变化。
 */
export type TutorialTrigger =
  | { type: 'time'; minTime: number }
  | { type: 'population'; minTotal: number }
  | { type: 'trophic'; level: TrophicLevel; minCount: number }
  | { type: 'trophic-all' }
  | { type: 'state'; event: 'first-death'; minPeak: number; drop: number }
  | { type: 'balance'; minTime: number; minBalance: number };

export interface TutorialTip {
  id: string;
  /** 图标 emoji */
  icon: string;
  title: string;
  description: string;
  trigger: TutorialTrigger;
}

export const TUTORIAL_TIPS: TutorialTip[] = [
  {
    id: 'welcome',
    icon: '👋',
    title: '欢迎来到 3D 虚拟生态缸',
    description:
      '从左侧工具栏选择物种，点击缸内任意位置即可投放。每个生物都会游动、觅食、繁殖和死亡，种群数量会随时间自然变化。先投放几条小鱼和水草试试吧！',
    trigger: { type: 'time', minTime: 30 },
  },
  {
    id: 'first-population',
    icon: '🐟',
    title: '种群正在形成',
    description:
      '生物需要能量维持生命：草食动物吃植物，肉食动物捕猎，生产者通过光合作用积累能量。能量不足或寿命耗尽都会导致死亡，数量就这样起起落落。',
    trigger: { type: 'population', minTotal: 4 },
  },
  {
    id: 'first-death',
    icon: '💀',
    title: '生命周期与死亡',
    description:
      '种群数量下降了——生物会因衰老或饥饿而死亡。死亡的个体会被分解者分解，重新化为养分回到水中。这是生态系统的正常循环，不用慌张。',
    trigger: { type: 'state', event: 'first-death', minPeak: 4, drop: 2 },
  },
  {
    id: 'first-carnivore',
    icon: '🐠',
    title: '捕食者登场',
    description:
      '大鱼和青蛙是捕食者，会追捕小鱼和田螺。能量沿着食物链从猎物流向捕食者。捕食者过多会导致猎物锐减，反过来又会限制捕食者的数量。',
    trigger: { type: 'trophic', level: 'carnivore', minCount: 1 },
  },
  {
    id: 'decomposer',
    icon: '🦠',
    title: '看不见的清洁工',
    description:
      '分解菌会分解死亡的生物，把有机物归还水体。它们个头小、不起眼，但没有分解者，死亡生物会堆积如山，生态循环也会随之断裂。',
    trigger: { type: 'trophic', level: 'decomposer', minCount: 1 },
  },
  {
    id: 'food-chain-complete',
    icon: '🔗',
    title: '完整的食物链',
    description:
      '生产者 → 草食动物 → 肉食动物 → 分解者，四个营养级都出现了！营养级越齐全，生态系统越稳定。试着维持它们之间的数量平衡。',
    trigger: { type: 'trophic-all' },
  },
  {
    id: 'overpopulation',
    icon: '📈',
    title: '环境容纳量',
    description:
      '生物数量已经接近缸内容纳上限。空间和食物都是有限的，种群不会无限增长——竞争、饥饿和疾病会让数量回落，这就是环境的容纳量。',
    trigger: { type: 'population', minTotal: 15 },
  },
  {
    id: 'balance',
    icon: '⚖️',
    title: '动态平衡',
    description:
      '你的生态缸达到了较好的平衡！健康的生态系统中生产者最多、顶级捕食者最少，数量比例会在波动中自动调节。继续观察它们的动态变化吧。',
    trigger: { type: 'balance', minTime: 300, minBalance: 60 },
  },
];
