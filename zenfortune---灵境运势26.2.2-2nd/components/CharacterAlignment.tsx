
import React, { useState } from 'react';

const FIGURES = [
  { name: '苏东坡', title: '乐天名士', icon: '🍷', desc: '洒脱不羁，随遇而安' },
  { name: '武则天', title: '大周女皇', icon: '👑', desc: '唯我独尊，掌控乾坤' },
  { name: '诸葛亮', title: '卧龙先生', icon: '📜', desc: '运筹帷幄，算无遗策' },
  { name: '李白', title: '诗中谪仙', icon: '🌙', desc: '浪漫狂放，志气凌云' },
  { name: '上官婉儿', title: '巾帼才媛', icon: '✍️', desc: '心思缜密，文采斐然' },
  { name: '老子', title: '太上道祖', icon: '🐂', desc: '清静无为，顺应自然' },
];

interface CharacterAlignmentProps {
  onSelect: (name: string) => void;
  onCancel: () => void;
}

export const CharacterAlignment: React.FC<CharacterAlignmentProps> = ({ onSelect, onCancel }) => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-8 animate-fade-in w-full">
      <div className="text-center">
        <h2 className="text-3xl font-cursive text-amber-500 mb-2">名士契合</h2>
        <p className="text-slate-500 text-xs tracking-widest italic">“千载之下，谁与卿同呼吸？”</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {FIGURES.map((fig) => (
          <button
            key={fig.name}
            onClick={() => setSelected(fig.name)}
            className={`p-4 rounded-3xl border transition-all text-left relative overflow-hidden group ${
              selected === fig.name 
                ? 'bg-amber-500/20 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
                : 'bg-slate-900/40 border-white/5 hover:border-amber-500/30'
            }`}
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{fig.icon}</div>
            <div className="font-bold text-amber-100">{fig.name}</div>
            <div className="text-[10px] text-amber-500 font-bold mb-1">{fig.title}</div>
            <div className="text-[10px] text-slate-500 leading-tight">{fig.desc}</div>
            {selected === fig.name && (
              <div className="absolute top-2 right-2 text-amber-500 animate-pulse">●</div>
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <button 
          onClick={onCancel}
          className="flex-1 py-4 bg-slate-800 text-slate-300 rounded-2xl"
        >
          返回大殿
        </button>
        <button 
          onClick={() => selected && onSelect(selected)}
          disabled={!selected}
          className="flex-[2] py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold rounded-2xl shadow-lg disabled:opacity-30 active:scale-95 transition-all"
        >
          开启同步
        </button>
      </div>
    </div>
  );
};
