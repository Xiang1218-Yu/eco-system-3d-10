import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEcosystemStore } from '@/store/useEcosystemStore';
import { TUTORIAL_TIPS, type TutorialTip, type TutorialTrigger } from '@/data/tutorialTips';
import type { TrophicLevel, EcosystemStats } from '@/types/ecosystem';
import { SPECIES } from '@/data/species';

interface TutorialPersistedState {
  /** 已展示过的提示（弹出过即记录，保证不会反复弹出） */
  shownTips: Record<string, boolean>;
  /** 已手动关闭的提示 */
  dismissedTips: Record<string, boolean>;
}

interface TutorialState extends TutorialPersistedState {
  /** 当前正在展示的提示 id（瞬时状态，不持久化） */
  activeTipId: string | null;
  /** 等待依次展示的提示队列（瞬时状态） */
  queue: string[];
  /** 历史最高种群总数，用于检测数量骤降等状态变化 */
  peakPopulation: number;

  dismissTip: (id: string) => void;
  /** 关闭当前提示并展示队列中的下一条 */
  closeActiveTip: () => void;
  resetTutorial: () => void;
  /** 根据当前生态状态评估并触发满足条件的提示 */
  evaluate: () => void;
}

function getLevelCounts(populationBySpecies: Record<string, number>): Record<TrophicLevel, number> {
  const counts: Record<TrophicLevel, number> = {
    producer: 0,
    herbivore: 0,
    carnivore: 0,
    decomposer: 0,
  };
  SPECIES.forEach((s) => {
    counts[s.trophicLevel] += populationBySpecies[s.id] || 0;
  });
  return counts;
}

function checkTrigger(
  trigger: TutorialTrigger,
  stats: EcosystemStats,
  levelCounts: Record<TrophicLevel, number>,
  peakPopulation: number,
): boolean {
  switch (trigger.type) {
    case 'time':
      return stats.time >= trigger.minTime;
    case 'population':
      return stats.totalOrganisms >= trigger.minTotal;
    case 'trophic':
      return levelCounts[trigger.level] >= trigger.minCount;
    case 'trophic-all':
      return (Object.keys(levelCounts) as TrophicLevel[]).every((level) => levelCounts[level] > 0);
    case 'state':
      if (trigger.event === 'first-death') {
        return peakPopulation >= trigger.minPeak && stats.totalOrganisms <= peakPopulation - trigger.drop;
      }
      return false;
    case 'balance':
      return stats.time >= trigger.minTime && stats.balanceIndex >= trigger.minBalance;
    default:
      return false;
  }
}

export const useTutorialStore = create<TutorialState>()(
  persist(
    (set, get) => ({
      shownTips: {},
      dismissedTips: {},
      activeTipId: null,
      queue: [],
      peakPopulation: 0,

      dismissTip: (id) => {
        set((state) => ({
          dismissedTips: { ...state.dismissedTips, [id]: true },
        }));
      },

      closeActiveTip: () => {
        const { activeTipId, queue } = get();
        if (activeTipId) {
          set((state) => ({
            dismissedTips: { ...state.dismissedTips, [activeTipId]: true },
            activeTipId: queue.length > 0 ? queue[0] : null,
            queue: queue.slice(1),
          }));
        }
      },

      resetTutorial: () => {
        set({
          shownTips: {},
          dismissedTips: {},
          activeTipId: null,
          queue: [],
          peakPopulation: 0,
        });
      },

      evaluate: () => {
        const state = get();
        const ecoState = useEcosystemStore.getState();
        const stats = ecoState.getStats();
        const levelCounts = getLevelCounts(stats.populationBySpecies);

        const newlyTriggered: TutorialTip[] = [];
        for (const tip of TUTORIAL_TIPS) {
          if (state.shownTips[tip.id] || state.dismissedTips[tip.id]) continue;
          if (checkTrigger(tip.trigger, stats, levelCounts, state.peakPopulation)) {
            newlyTriggered.push(tip);
          }
        }

        if (newlyTriggered.length > 0) {
          set((prev) => {
            const nextQueue = [...prev.queue, ...newlyTriggered.map((t) => t.id)];
            return {
              shownTips: {
                ...prev.shownTips,
                ...Object.fromEntries(newlyTriggered.map((t) => [t.id, true])),
              },
              activeTipId: prev.activeTipId ?? nextQueue[0],
              queue: prev.activeTipId ? nextQueue : nextQueue.slice(1),
            };
          });
        }

        // 更新种群峰值（在触发判断之后，保证骤降检测使用的是旧峰值）
        set((prev) => ({
          peakPopulation: Math.max(prev.peakPopulation, stats.totalOrganisms),
        }));
      },
    }),
    {
      name: 'ecosim-tutorial-progress',
      // 只持久化已展示 / 已关闭状态，当前卡片与队列仅保存在内存中
      partialize: (state) => ({
        shownTips: state.shownTips,
        dismissedTips: state.dismissedTips,
      }),
    },
  ),
);

// 生态缸每次状态变化后评估教学提示（时间推进、数量变化、营养级变化、状态变化）
useEcosystemStore.subscribe(() => {
  useTutorialStore.getState().evaluate();
});

export { TUTORIAL_TIPS };
