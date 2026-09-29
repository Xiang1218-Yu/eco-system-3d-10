import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, X, Lightbulb, BellRing } from 'lucide-react';
import { GlassCard } from '@/components/common/GlassCard';
import { useTutorialStore } from '@/store/useTutorialStore';
import { TRIGGER_TYPE_LABELS, getHintById } from '@/data/tutorialHints';

const EXIT_DURATION = 250; // 与 tutorial-slide-out 时长保持一致

export function TutorialCard() {
  const activeId = useTutorialStore((s) => s.activeId);
  const queue = useTutorialStore((s) => s.queue);
  const expanded = useTutorialStore((s) => s.expanded);
  const expandCard = useTutorialStore((s) => s.expandCard);
  const collapseCard = useTutorialStore((s) => s.collapseCard);
  const dismissActive = useTutorialStore((s) => s.dismissActive);
  const nextHint = useTutorialStore((s) => s.nextHint);

  // 关闭/切走前先播放滑出动画
  const [leaving, setLeaving] = useState(false);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // 切换到新提示时重置离场状态，并重新播放入场动画
    setLeaving(false);
  }, [activeId]);

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, []);

  if (!activeId) return null;

  const hint = getHintById(activeId);
  if (!hint) return null;

  const runWithExit = (action: () => void) => {
    setLeaving(true);
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    leaveTimerRef.current = setTimeout(() => {
      setLeaving(false);
      action();
    }, EXIT_DURATION);
  };

  const handleClose = () => runWithExit(dismissActive);
  const handleNext = () => runWithExit(nextHint);
  const hasMore = queue.length > 0;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 w-[min(92vw,28rem)] pointer-events-none">
      <div
        key={activeId}
        className={leaving ? 'tutorial-card-exit' : 'tutorial-card-enter'}
      >
        <GlassCard className="pointer-events-auto p-4 border-cyan-400/30 bg-[#0d1f3d]/80">
          {/* 顶部：图标 + 来源标签 + 标题 + 操作按钮 */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-cyan-400/15">
              {hint.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300">
                  <Lightbulb size={10} />
                  教学提示
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                  触发：{TRIGGER_TYPE_LABELS[hint.trigger.type]}
                </span>
                {hasMore && (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300">
                    <BellRing size={10} />
                    还有 {queue.length} 条
                  </span>
                )}
              </div>

              <h4 className="text-white font-bold text-base leading-snug">{hint.title}</h4>
            </div>

            <div className="flex items-center gap-0.5 shrink-0">
              <button
                onClick={() => (expanded ? collapseCard() : expandCard())}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                title={expanded ? '收起' : '展开详情'}
                aria-expanded={expanded}
              >
                {expanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg text-white/60 hover:text-red-300 hover:bg-white/10 transition-colors"
                title="关闭提示（不再显示）"
                aria-label="关闭提示"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* 收起态：一句话摘要；点击卡片空白处也可以展开 */}
          {!expanded && (
            <button
              onClick={expandCard}
              className="mt-2 w-full text-left text-white/70 text-sm leading-relaxed truncate hover:text-white transition-colors"
              title="点击展开详情"
            >
              {hint.summary}
            </button>
          )}

          {/* 展开态：完整说明，高度平滑展开 */}
          <div className={`tutorial-expand ${expanded ? 'open' : ''}`}>
            <div>
              <p className="text-white/80 text-sm leading-relaxed">{hint.description}</p>

              <div className="flex items-center justify-between gap-2 mt-3">
                <span className="text-[11px] text-white/40">
                  已关闭的提示不会再次弹出
                </span>
                <div className="flex items-center gap-2">
                  {hasMore && (
                    <button
                      onClick={handleNext}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
                    >
                      下一条
                    </button>
                  )}
                  <button
                    onClick={handleClose}
                    className="text-xs px-3 py-1.5 rounded-lg bg-cyan-500/25 text-cyan-200 hover:bg-cyan-500/40 transition-colors font-medium"
                  >
                    我知道了
                  </button>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
