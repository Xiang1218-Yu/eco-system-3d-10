import type { OrganismState, TrophicLevel } from '@/types/ecosystem';

/**
 * 触发条件来源（仅允许这四类）：
 * - time:    模拟时间
 * - count:   种群数量
 * - trophic: 营养级构成
 * - state:   生物状态变化
 */
export type TutorialTriggerType = 'time' | 'count' | 'trophic' | 'state';

/**
 * 单条教学提示的触发条件。
 * 所有被设置的字段之间是「与」关系，全部满足才触发。
 */
export interface TutorialTrigger {
  type: TutorialTriggerType;
  /** 模拟时间下限（simulationTime >= afterTime 时才参与判断） */
  afterTime?: number;
  /** 生物总数下限 */
  totalAtLeast?: number;
  /** 生物总数上限 */
  totalAtMost?: number;
  /** 与上一帧相比，总数减少幅度 >= 该值 */
  totalDropAtLeast?: number;
  /** 某营养级现存数量下限，例如 { level: 'producer', atLeast: 2 } */
  trophicLevel?: TrophicLevel;
  trophicCountAtLeast?: number;
  /** 发生变化的状态（例如 'eating' / 'fleeing'） */
  changeToState?: OrganismState;
  /** 该状态变化发生在哪个营养级（不填则任意营养级） */
  changeTrophicLevel?: TrophicLevel;
}

export interface TutorialHint {
  id: string;
  /** 触发条件 */
  trigger: TutorialTrigger;
  /** 卡片标题 */
  title: string;
  /** 收起态显示的一句话摘要 */
  summary: string;
  /** 展开后显示的完整教学说明 */
  description: string;
  /** 卡片图标（emoji，与项目现有风格一致） */
  icon: string;
}

/** 触发引擎每帧计算后传入的上下文快照 */
export interface TutorialContext {
  time: number;
  total: number;
  /** 与上一帧相比的总数变化（负 = 减少） */
  totalDelta: number;
  levelCounts: Record<TrophicLevel, number>;
  /** 本帧发生的状态变化列表（旧状态 -> 新状态） */
  stateChanges: Array<{
    toState: OrganismState;
    trophicLevel: TrophicLevel;
  }>;
}
