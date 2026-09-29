import type { TutorialHint } from '@/types/tutorial';

/**
 * 教学提示卡集合（顺序即触发评估顺序）。
 *
 * 触发条件只能来自：
 *   模拟时间(time) / 数量(count) / 营养级(trophic) / 状态变化(state)
 *
 * 每条提示一旦满足条件就会进入展示队列，并被记录为「已展示」，
 * 同一提示在 localStorage 持久化周期内不会再次弹出。
 */
export const TUTORIAL_HINTS: TutorialHint[] = [
  {
    id: 'welcome',
    icon: '👋',
    trigger: { type: 'time', afterTime: 0 },
    title: '欢迎来到 3D 虚拟生态缸',
    summary: '这里是一个会自己运转的微型海洋生态系统。',
    description:
      '缸中的每种生物都会自行游动、进食、繁殖与死亡，种群数量也会因此不断变化。' +
      '从左侧工具栏选择物种，再点击缸内任意位置即可投放。别担心，你可以随时暂停或重置。',
  },
  {
    id: 'empty-tank',
    icon: '🐠',
    trigger: { type: 'count', afterTime: 180, totalAtMost: 0 },
    title: '空缸里什么都不会发生',
    summary: '已经过了一段时间，缸里还是空的，先从生产者开始吧。',
    description:
      '没有生物，自然看不到数量变化。建议先投放几株 🌿海藻 或 🌱水草：' +
      '它们是生产者，能通过光合作用持续积累能量，是整条食物链的基础。',
  },
  {
    id: 'first-producer',
    icon: '🌿',
    trigger: { type: 'trophic', afterTime: 0, trophicLevel: 'producer', trophicCountAtLeast: 1 },
    title: '生产者：生态系统的基石',
    summary: '海藻和水草会进行光合作用，能量会缓慢增长。',
    description:
      '生产者不需要进食，能量会随时间自动回升；当能量充足时还会自动繁殖出新的个体。' +
      '如果发现它们一直不繁殖，可能是数量已达到环境容纳上限（工具栏中 x/max 的 max）。',
  },
  {
    id: 'producer-bloom',
    icon: '🌱',
    trigger: { type: 'trophic', afterTime: 100, trophicLevel: 'producer', trophicCountAtLeast: 5 },
    title: '生产者多了起来',
    summary: '能量充足时，植物会繁殖，这是数量增长的主要原因之一。',
    description:
      '当生产者的能量高于阈值，就有概率分裂出新个体，所以你会看到种群数量自动 +1。' +
      '数量越多，越能支撑上层的草食动物；但每种生物都有最大种群上限，到顶后便不再增长。',
  },
  {
    id: 'first-herbivore',
    icon: '🐟',
    trigger: { type: 'trophic', afterTime: 0, trophicLevel: 'herbivore', trophicCountAtLeast: 1 },
    title: '草食动物以生产者为食',
    summary: '小鱼、田螺、乌龟会吃掉海藻和水草来补充能量。',
    description:
      '草食动物会自动寻找附近的植物进食。它们一边消耗能量一边捕食，' +
      '能量耗尽或寿命到尽头就会死亡消失，能量充足时则可能繁殖——这就是数量时增时减的原因。',
  },
  {
    id: 'first-carnivore',
    icon: '🐠',
    trigger: { type: 'trophic', afterTime: 0, trophicLevel: 'carnivore', trophicCountAtLeast: 1 },
    title: '肉食动物位于食物链上层',
    summary: '大鱼和青蛙会捕食小鱼、田螺等草食动物。',
    description:
      '肉食动物需要通过捕猎获取大量能量。请留意：猎物被吃掉后会直接从缸中消失，' +
      '因此引入捕食者后，草食动物的数量往往会明显下降。',
  },
  {
    id: 'predation',
    icon: '🍽️',
    trigger: { type: 'state', afterTime: 0, changeToState: 'eating' },
    title: '一次捕食正在发生',
    summary: '当生物切换到「进食中」，就说明它刚刚成功捕获了猎物。',
    description:
      '捕猎者靠近猎物时状态变为「捕猎中」，接触到猎物后进入「进食中」，' +
      '同时猎物被移除、捕猎者的能量大幅回升。点击任意生物可以查看它当前的能量、寿命与状态。',
  },
  {
    id: 'fleeing',
    icon: '💨',
    trigger: { type: 'state', afterTime: 0, changeToState: 'fleeing' },
    title: '猎物正在逃跑',
    summary: '天敌靠近时，草食动物会进入「逃跑中」状态。',
    description:
      '当捕食者进入一定范围，猎物会掉头逃离。如果没能逃脱就会被吃掉，' +
      '所以同时观察「逃跑中」的猎物和「捕猎中」的捕食者，就能预判下一次数量下降。',
  },
  {
    id: 'first-decomposer',
    icon: '🦠',
    trigger: { type: 'trophic', afterTime: 0, trophicLevel: 'decomposer', trophicCountAtLeast: 1 },
    title: '分解者负责「善后」',
    summary: '分解菌会游向死亡生物的残骸并将其分解。',
    description:
      '生物因饥饿或寿命死亡后会留下残骸，分解者会主动靠近并进食残骸获得能量。' +
      '完整的生态循环需要生产者、消费者与分解者共同参与，建议四层营养级都投放一些。',
  },
  {
    id: 'population-drop',
    icon: '📉',
    trigger: { type: 'count', afterTime: 150, totalAtLeast: 1, totalDropAtLeast: 2 },
    title: '种群数量为什么突然减少？',
    summary: '一帧内总数减少了 2 个以上，通常来自捕食、饥饿或衰老。',
    description:
      '数量下降只有三种来源：① 被捕食者吃掉；② 能量长期得不到补充而饿死；' +
      '③ 达到寿命自然死亡。可以打开左下角「生态数据」，对照各营养级数量找出是哪一层在减少。',
  },
  {
    id: 'collapse-warning',
    icon: '⚠️',
    trigger: { type: 'count', afterTime: 400, totalAtMost: 2, totalAtLeast: 1 },
    title: '生态系统濒临崩溃',
    summary: '缸中只剩寥寥几个生物，食物链可能已经断裂。',
    description:
      '当高层捕食者缺少猎物、或底层生产者被吃光，整个系统会快速萎缩。' +
      '左下角的生态平衡指数会变红。试着按「生产者 → 草食动物 → 肉食动物 → 分解者」的顺序补投，' +
      '理想比例约为 5:3:1:1。',
  },
  {
    id: 'thriving',
    icon: '🌟',
    trigger: { type: 'count', afterTime: 500, totalAtLeast: 18 },
    title: '生态系统正在繁荣',
    summary: '生物总数已达到 18 以上，四层营养级形成了良性循环。',
    description:
      '出生与死亡、捕食与分解相互制衡，种群数量会在动态中保持相对稳定，' +
      '而不是一成不变。继续观察平衡指数的变化，也可以用顶部的暂停按钮定格某个瞬间仔细研究。',
  },
];

export const TRIGGER_TYPE_LABELS: Record<string, string> = {
  time: '模拟时间',
  count: '种群数量',
  trophic: '营养级',
  state: '状态变化',
};

export function getHintById(id: string): TutorialHint | undefined {
  return TUTORIAL_HINTS.find((h) => h.id === id);
}
