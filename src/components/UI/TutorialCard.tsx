import { useEffect, useState } from 'react';
import { Lightbulb, X, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { GlassCard } from '@/components/common/GlassCard';
import { useTutorialStore, TUTORIAL_TIPS } from '@/store/useTutorialStore';

export function TutorialCard() {
  const activeTipId = useTutorialStore((s) => s.activeTipId);
  const queue = useTutorialStore((s) => s.queue);
  const closeActiveTip = useTutorialStore((s) => s.closeActiveTip);
  const resetTutorial = useTutorialStore((s) => s.resetTutorial);

  const [expanded, setExpanded] = useState(true);
  const [visible, setVisible] = useState(false);

  const activeTip = TUTORIAL_TIPS.find((t) => t.id === activeTipId) ?? null;
  const currentIndex = activeTip ? TUTORIAL_TIPS.findIndex((t) => t.id === activeTip.id) : -1;

  // 切换提示时重新播放入场动画，并默认展开
  useEffect(() => {
    if (activeTipId) {
      setExpanded(true);
      setVisible(false);
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
  }, [activeTipId]);

  if (!activeTip) return null;

  const handleClose = () => {
    setVisible(false);
    // 等待滑出动画结束后再从队列中移除
    window.setTimeout(() => {
      closeActiveTip();
    }, 300);
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 w-[min(92vw,440px)]">
      <GlassCard
        className={`overflow-hidden transition-all duration-300 ease-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* 标题栏：点击可展开 / 收起 */}
        <div
          className="flex items-center gap-3 px-4 py-3 cursor-pointer"
          onClick={() => setExpanded((v) => !v)}
        >
          <span className="text-2xl shrink-0 animate-float">{activeTip.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Lightbulb size={14} className="text-eco-orange shrink-0" />
              <h3 className="text-white font-bold text-base truncate">{activeTip.title}</h3>
            </div>
            {!expanded && (
              <p className="text-white/60 text-xs truncate mt-0.5">{activeTip.description}</p>
            )}
          </div>

          <span className="text-white/40 text-xs shrink-0">
            {currentIndex + 1}/{TUTORIAL_TIPS.length}
          </span>

          <button
            className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors shrink-0"
            title={expanded ? '收起' : '展开'}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          <button
            className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors shrink-0"
            title="关闭提示"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 展开的正文区域 */}
        <div
          className={`grid transition-all duration-300 ease-out ${
            expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="px-4 pb-4 pt-1">
              <p className="text-white/80 text-sm leading-relaxed">{activeTip.description}</p>

              {queue.length > 0 && (
                <p className="text-eco-orange/80 text-xs mt-3">
                  还有 {queue.length} 条提示稍后展示…
                </p>
              )}

              <div className="flex items-center justify-between mt-3">
                <button
                  onClick={resetTutorial}
                  className="flex items-center gap-1 text-white/40 hover:text-white/80 text-xs transition-colors"
                  title="清空学习记录，重新体验全部提示"
                >
                  <RotateCcw size={12} />
                  重置提示进度
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 py-1.5 rounded-xl bg-eco-cyan/20 hover:bg-eco-cyan/30 text-eco-cyan text-sm font-medium transition-colors"
                >
                  知道了
                </button>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
