import { useEffect, useRef } from 'react';
import { useEcosystemStore } from '@/store/useEcosystemStore';
import { useTutorialStore } from '@/store/useTutorialStore';
import {
  collectStateChanges,
  countTrophicLevels,
  evaluateTriggers,
} from '@/utils/tutorialEngine';
import type { Organism } from '@/types/ecosystem';

/**
 * 教学触发引擎的 React 入口：
 * - 监听 simulationTime（每一个模拟 tick 评估一次）
 * - 对比前后帧的 organism 列表，得到数量变化与状态变化
 * - 满足条件的提示交给 tutorial store 入队（store 内部保证不重复）
 */
export function useTutorialTriggers() {
  const time = useEcosystemStore((s) => s.simulationTime);
  const organisms = useEcosystemStore((s) => s.organisms);

  // 保存上一帧的快照，用于计算数量 / 状态变化
  const prevTimeRef = useRef<number>(time);
  const prevOrganismsRef = useRef<Organism[]>(organisms);
  const mountedRef = useRef(false);

  useEffect(() => {
    // 首次挂载也评估一次，使「欢迎」等 afterTime:0 的提示能立即触发
    const isFirstRun = !mountedRef.current;
    mountedRef.current = true;

    const prevOrganisms = prevOrganismsRef.current;
    const prevTime = prevTimeRef.current;

    // 只有时间推进（或首次挂载）才评估，避免暂停期间频繁触发
    if (!isFirstRun && time === prevTime) return;

    const stateChanges = isFirstRun
      ? []
      : collectStateChanges(prevOrganisms, organisms);

    const ctx = {
      time,
      total: organisms.length,
      totalDelta: isFirstRun ? 0 : organisms.length - prevOrganisms.length,
      levelCounts: countTrophicLevels(organisms),
      stateChanges,
    };

    const { shownIds, enqueue } = useTutorialStore.getState();
    const fired = evaluateTriggers(ctx, new Set(shownIds));
    fired.forEach((id) => enqueue(id));

    prevTimeRef.current = time;
    prevOrganismsRef.current = organisms;
  }, [time, organisms]);
}
