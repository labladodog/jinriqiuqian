
import React, { useState, useEffect, useRef } from 'react';

interface StickShakerProps {
  onComplete: (stickId: number) => void;
  hasDrawnToday: boolean;
  onViewPrevious: () => void;
}

enum RitualStep {
  INCENSE,
  WASH,
  PRAY,
  SHAKE
}

export const StickShaker: React.FC<StickShakerProps> = ({ onComplete, hasDrawnToday, onViewPrevious }) => {
  const [step, setStep] = useState<RitualStep>(RitualStep.INCENSE);
  const [intensity, setIntensity] = useState(0); 
  const [luckCycle, setLuckCycle] = useState(0); 
  const [isFlying, setIsFlying] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  
  const requestRef = useRef<number>(null);
  const intensityRef = useRef(0);
  const luckPhaseRef = useRef(0);
  const lastUpdateRef = useRef(performance.now());

  useEffect(() => {
    if (step !== RitualStep.SHAKE || isFlying) return;

    const animate = (time: number) => {
      const deltaTime = time - lastUpdateRef.current;
      lastUpdateRef.current = time;

      // 1. 灵力逻辑
      if (isInteracting) {
        // 增加速度：约3秒填满
        intensityRef.current = Math.min(100, intensityRef.current + deltaTime * 0.04);
      } else {
        // 衰减速度：大幅调低，给用户留出反应时间
        intensityRef.current = Math.max(0, intensityRef.current - deltaTime * 0.01);
      }
      setIntensity(intensityRef.current);

      // 2. 气运环逻辑：仅在互动时或灵力残余时运行
      if (intensityRef.current > 0.1) {
        const speed = 0.002 + (intensityRef.current / 12000);
        luckPhaseRef.current += deltaTime * speed;
        const cycleValue = (Math.sin(luckPhaseRef.current) + 1) / 2 * 100;
        setLuckCycle(cycleValue);
      } else {
        setLuckCycle(0);
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [step, isFlying, isInteracting]);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    // 允许在移动端正常触发，不阻止默认行为以防按钮点击失效
    if (isFlying) return;
    setIsInteracting(true);
  };

  const handleEnd = () => {
    if (isFlying) return;
    setIsInteracting(false);
    
    // 如果松手时灵力足够，则视为“掷出”
    if (intensityRef.current >= 35) {
      triggerDraw();
    }
  };

  const triggerDraw = () => {
    setIsFlying(true);
    // 模拟签条飞出动画后完成
    setTimeout(() => {
      onComplete(Math.floor(Math.random() * 64) + 1);
    }, 1000);
  };

  if (hasDrawnToday) {
    return (
      <div className="glass-panel p-8 rounded-3xl text-center space-y-6 animate-fade-in shadow-2xl border-amber-500/20">
        <div className="text-6xl mb-4">📜</div>
        <h2 className="text-2xl font-bold text-amber-500 font-cursive">今日法缘已定</h2>
        <div className="h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent my-4" />
        <p className="text-slate-400 italic">“初筮告，再三渎，渎则不告。”</p>
        <button 
          onClick={onViewPrevious}
          className="w-full py-4 bg-gradient-to-r from-amber-700 to-amber-600 rounded-2xl font-bold hover:from-amber-600 hover:to-amber-500 transition-all shadow-lg shadow-amber-900/40 text-white"
        >
          查看今日签文
        </button>
      </div>
    );
  }

  const renderRitual = () => {
    switch (step) {
      case RitualStep.INCENSE:
        return (
          <div className="text-center space-y-8 animate-fade-in">
            <div className="text-7xl mb-4 grayscale opacity-60">🏮</div>
            <div>
              <h3 className="text-3xl font-cursive text-amber-200 mb-2">第一步：焚香定心</h3>
              <p className="text-slate-500 text-sm mb-8 tracking-widest">诚意由心起，烟袅通神明</p>
              <button onClick={() => setStep(RitualStep.WASH)} className="px-12 py-4 bg-amber-900/40 border-2 border-amber-600/30 text-amber-200 rounded-full hover:bg-amber-800/60 transition-all font-bold">
                点击焚香
              </button>
            </div>
          </div>
        );
      case RitualStep.WASH:
        return (
          <div className="text-center space-y-8 animate-fade-in">
            <div className="text-7xl mb-4 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">💧</div>
            <div>
              <h3 className="text-3xl font-cursive text-blue-200 mb-2">第二步：净手去尘</h3>
              <button onClick={() => setStep(RitualStep.PRAY)} className="px-12 py-4 bg-blue-900/40 border-2 border-blue-600/30 text-blue-200 rounded-full hover:bg-blue-800/60 transition-all font-bold">
                掬水洗涤
              </button>
            </div>
          </div>
        );
      case RitualStep.PRAY:
        return (
          <div className="text-center space-y-8 animate-fade-in">
            <div className="text-7xl mb-4 animate-bounce">🙏</div>
            <div>
              <h3 className="text-3xl font-cursive text-red-200 mb-2">第三步：诚心默祷</h3>
              <button onClick={() => setStep(RitualStep.SHAKE)} className="px-12 py-4 bg-red-900/40 border-2 border-red-600/30 text-red-200 rounded-full hover:bg-red-800/60 transition-all font-bold">
                我已准备好
              </button>
            </div>
          </div>
        );
      case RitualStep.SHAKE:
        const shakeX = isInteracting ? (Math.random() - 0.5) * (intensity / 4) : 0;
        const shakeY = isInteracting ? (Math.random() - 0.5) * (intensity / 4) : 0;
        const rotation = isInteracting ? (Math.random() - 0.5) * (intensity / 2) : 0;

        return (
          <div className="flex flex-col items-center space-y-6 animate-fade-in select-none w-full">
            <div className="relative w-48 h-60">
              {/* 签筒主体 */}
              <div 
                className={`absolute inset-0 bg-gradient-to-b from-red-800 to-red-950 rounded-b-[40px] border-x-4 border-b-4 border-amber-600 shadow-2xl transition-transform duration-75`}
                style={{ transform: `translate(${shakeX}px, ${shakeY}px) rotate(${rotation}deg)`, zIndex: 10 }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 flex gap-1 items-end h-full pt-8 px-4 w-full justify-around">
                  {[...Array(8)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-2 bg-gradient-to-t from-amber-400 to-amber-100 rounded-t-sm"
                      style={{ 
                        height: `${60 + Math.random() * 30}%`, 
                        // 灵力越高，签条升起越高
                        transform: `translateY(${intensity > 10 ? - (intensity / 100) * 40 : 0}px)`,
                        opacity: isFlying ? 0.2 : 1,
                        transition: 'transform 0.1s ease-out'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* 飞出的那根签 */}
              <div 
                className={`absolute left-1/2 -translate-x-1/2 bg-gradient-to-b from-amber-100 to-amber-500 w-4 rounded-sm shadow-[0_0_20px_rgba(251,191,36,0.6)] transition-all duration-1000 ease-out`}
                style={{ 
                  top: isFlying ? '-240px' : '-20px',
                  opacity: isFlying ? 1 : 0,
                  height: '120px',
                  zIndex: 5
                }}
              >
                <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-red-900 writing-vertical-lr tracking-tighter">
                   天命已定
                </div>
              </div>
            </div>

            <div className="w-full max-w-sm space-y-6 bg-slate-900/60 p-6 rounded-[2rem] border border-white/5">
              
              {/* 状态指示器 */}
              <div className="flex justify-between items-center px-2">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">当前状态</span>
                  <span className={`text-sm font-bold transition-colors ${intensity >= 35 ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`}>
                    {intensity >= 35 ? '感应已足：可松手出签' : intensity > 5 ? '正在感应...' : '静心待发'}
                  </span>
                </div>
                <div className="text-right">
                   <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">气运强度</span>
                   <div className="text-lg font-cursive text-amber-500">{Math.floor(luckCycle)}%</div>
                </div>
              </div>

              {/* 气运环：用户需要观察的视觉节奏 */}
              <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
                <div 
                  className={`h-full bg-gradient-to-r from-amber-900 via-amber-400 to-amber-900 transition-all duration-200`}
                  style={{ width: `${luckCycle}%`, boxShadow: luckCycle > 80 ? '0 0 15px #f59e0b' : 'none' }} 
                />
              </div>

              {/* 唯一的大按钮：长按摇动 */}
              <button
                onMouseDown={handleStart}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchEnd={handleEnd}
                className={`w-full py-8 rounded-2xl font-bold transition-all text-xl flex flex-col items-center justify-center border-b-4 ${
                  isInteracting 
                    ? 'bg-amber-600 border-amber-800 text-white translate-y-1 shadow-inner' 
                    : 'bg-gradient-to-r from-slate-800 to-slate-700 border-slate-900 text-slate-200 hover:brightness-110'
                } ${isFlying ? 'opacity-0 pointer-events-none' : ''}`}
              >
                <span className="font-cursive text-3xl mb-2">
                  {isInteracting ? '稳住，感受气运...' : '长按此地摇签'}
                </span>
                <div className="flex gap-1">
                   {[...Array(5)].map((_, i) => (
                     <div key={i} className={`w-1.5 h-1.5 rounded-full ${intensity > (i+1)*15 ? 'bg-amber-300 animate-bounce' : 'bg-slate-600'}`} style={{ animationDelay: `${i*0.1}s` }} />
                   ))}
                </div>
              </button>

              <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/10 text-center">
                <p className="text-slate-500 text-[10px] leading-relaxed">
                  <span className="text-amber-500 font-bold">操作指南：</span><br/>
                  1. <span className="text-white font-bold">长按</span>上方大按钮，签筒将随之摇动。<br/>
                  2. 观察<span className="text-white font-bold">气运环</span>波动，当能量满格且气运最强时<br/>
                  3. <span className="text-amber-400 font-bold text-xs uppercase">松开手指</span>，灵签即会破筒而出！
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full flex flex-col items-center py-4">
      {renderRitual()}
    </div>
  );
};
