import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getHintById } from '@/data/tutorialHints';

interface TutorialStore {
  /** 已经触发展示过的提示 id（持久化，保证不反复弹出） */
  shownIds: string[];
  /** 已被用户主动关闭的提示 id（持久化） */
  dismissedIds: string[];
  /** 等待展示的提示队列（仅当前会话） */
  queue: string[];
  /** 当前正在屏幕上展示的提示 id（仅当前会话） */
  activeId: string | null;
  /** 底部卡片是否处于展开状态（仅当前会话） */
  expanded: boolean;

  /** 触发引擎调用：把满足条件的提示送入队列，已展示过的会被忽略 */
  enqueue: (id: string) => void;
  expandCard: () => void;
  collapseCard: () => void;
  /** 关闭当前卡片：记入 dismissed 并展示队列中的下一条 */
  dismissActive: () => void;
  /** 跳过当前卡片查看下一条（不计入 dismissed） */
  nextHint: () => void;
  /** 清空教学进度（调试/重新教学用） */
  resetProgress: () => void;
}

export const useTutorialStore = create<TutorialStore>()(
  persist(
    (set, get) => ({
      shownIds: [],
      dismissedIds: [],
      queue: [],
      activeId: null,
      expanded: false,

      enqueue: (id) => {
        const state = get();
        const hint = getHintById(id);
        if (!hint) return;
        // 同一提示已展示 / 已关闭 / 已在队列 / 正在展示 —— 都不再重复弹出
        if (
          state.shownIds.includes(id) ||
          state.dismissedIds.includes(id) ||
          state.queue.includes(id) ||
          state.activeId === id
        ) {
          return;
        }

        set((prev) => {
          const queue = [...prev.queue];
          const shownIds = [...prev.shownIds, id];

          if (prev.activeId) {
            queue.push(id);
            return { queue, shownIds };
          }
          // 没有正在展示的卡片时直接上屏，默认收起滑入
          return { queue, shownIds, activeId: id, expanded: false };
        });
      },

      expandCard: () => set({ expanded: true }),
      collapseCard: () => set({ expanded: false }),

      dismissActive: () => {
        set((prev) => {
          const dismissedIds = prev.activeId
            ? [...prev.dismissedIds, prev.activeId]
            : prev.dismissedIds;
          const [next, ...rest] = prev.queue;
          return {
            dismissedIds,
            queue: rest,
            activeId: next ?? null,
            expanded: false,
          };
        });
      },

      nextHint: () => {
        set((prev) => {
          // 当前提示放回队尾，稍后还能再看到（仅本次会话内）
          const queue =
            prev.activeId != null ? [...prev.queue, prev.activeId] : prev.queue;
          const [next, ...rest] = queue;
          return { queue: rest, activeId: next ?? null, expanded: false };
        });
      },

      resetProgress: () =>
        set({ shownIds: [], dismissedIds: [], queue: [], activeId: null, expanded: false }),
    }),
    {
      name: 'ecosystem-tutorial-v1',
      // 只有「已展示 / 已关闭」需要跨会话持久化；卡片的临时 UI 状态不写入 localStorage
      partialize: (state) => ({
        shownIds: state.shownIds,
        dismissedIds: state.dismissedIds,
      }),
    },
  ),
);
