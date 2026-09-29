import type { Organism, TrophicLevel } from '@/types/ecosystem';
import { getSpeciesById } from '@/data/species';
import { TUTORIAL_HINTS } from '@/data/tutorialHints';
import type { TutorialContext, TutorialTrigger } from '@/types/tutorial';

const EMPTY_LEVEL_COUNTS: Record<TrophicLevel, number> = {
  producer: 0,
  herbivore: 0,
  carnivore: 0,
  decomposer: 0,
};

/** 根据当前生物列表统计四个营养级的数量 */
export function countTrophicLevels(organisms: Organism[]): Record<TrophicLevel, number> {
  const counts: Record<TrophicLevel, number> = { ...EMPTY_LEVEL_COUNTS };
  for (const o of organisms) {
    const sp = getSpeciesById(o.speciesId);
    if (sp) counts[sp.trophicLevel] += 1;
  }
  return counts;
}

/** 对比前后两帧，收集发生了状态变化的生物（按营养级归类） */
export function collectStateChanges(
  prev: Organism[],
  next: Organism[],
): TutorialContext['stateChanges'] {
  const changes: TutorialContext['stateChanges'] = [];
  const prevMap = new Map(prev.map((o) => [o.id, o]));

  for (const n of next) {
    const p = prevMap.get(n.id);
    if (!p || p.state === n.state) continue;
    const sp = getSpeciesById(n.speciesId);
    if (!sp) continue;
    changes.push({ toState: n.state, trophicLevel: sp.trophicLevel });
  }
  return changes;
}

/** 单条触发条件与上下文做「与」匹配 */
function matchTrigger(trigger: TutorialTrigger, ctx: TutorialContext): boolean {
  if (trigger.afterTime != null && ctx.time < trigger.afterTime) return false;

  if (trigger.totalAtLeast != null && ctx.total < trigger.totalAtLeast) return false;
  if (trigger.totalAtMost != null && ctx.total > trigger.totalAtMost) return false;
  if (
    trigger.totalDropAtLeast != null &&
    ctx.totalDelta > -trigger.totalDropAtLeast
  ) {
    return false;
  }

  if (trigger.trophicLevel) {
    const count = ctx.levelCounts[trigger.trophicLevel] ?? 0;
    if (trigger.trophicCountAtLeast != null && count < trigger.trophicCountAtLeast) {
      return false;
    }
  }

  if (trigger.changeToState) {
    const hit = ctx.stateChanges.some(
      (c) =>
        c.toState === trigger.changeToState &&
        (trigger.changeTrophicLevel == null ||
          c.trophicLevel === trigger.changeTrophicLevel),
    );
    if (!hit) return false;
  }

  return true;
}

/**
 * 评估全部提示，返回本帧满足条件且尚未展示的提示 id 列表。
 */
export function evaluateTriggers(
  ctx: TutorialContext,
  alreadyShown: ReadonlySet<string>,
): string[] {
  const fired: string[] = [];
  for (const hint of TUTORIAL_HINTS) {
    if (alreadyShown.has(hint.id)) continue;
    if (matchTrigger(hint.trigger, ctx)) fired.push(hint.id);
  }
  return fired;
}
