
import React, { useState } from 'react';
import { FortuneResult } from '../types';
import { getAudioBlessing } from '../services/geminiService';

interface ResultDisplayProps {
  result: FortuneResult;
  onReset: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onReset }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const categories = [
    { label: '财富', value: result.categories.wealth, color: 'text-yellow-400' },
    { label: '事业', value: result.categories.career, color: 'text-blue-400' },
    { label: '感情', value: result.categories.love, color: 'text-red-400' },
    { label: '健康', value: result.categories.health, color: 'text-green-400' },
  ];

  const handleCopy = () => {
    const text = `【灵境运势 · 今日签文】\n\n主诉：${result.vibeTag}\n判词：${result.poem}\n仙人指路：${result.advice}\n吉祥色：${result.luckyColor}\n吉祥数：${result.luckyNumber}\n吉位：${result.luckyDirection}\n\n—— 命由心造，境随心转。`;
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  };

  const playBlessing = async () => {
    setIsPlaying(true);
    const textToSpeak = `${result.vibeTag}。${result.poem}。仙人指路：${result.advice}`;
    const base64 = await getAudioBlessing(textToSpeak);
    if (base64) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
        
        const dataInt16 = new Int16Array(bytes.buffer);
        const buffer = audioCtx.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;

        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.onended = () => setIsPlaying(false);
        source.start();
      } catch (e) {
        console.error("Audio playback error", e);
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div 
        className="fixed inset-0 pointer-events-none opacity-20 transition-colors duration-1000 blur-[100px]"
        style={{ backgroundColor: result.auraColor || '#f59e0b' }}
      />

      <div className="glass-panel p-6 rounded-3xl border-amber-500/30 relative z-10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 right-0 bg-amber-600 text-white px-6 py-1 rotate-45 translate-x-6 translate-y-2 shadow-lg font-bold text-[10px] tracking-widest uppercase">
          {result.vibeTag}
        </div>

        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-amber-500 font-cursive">今日法批</h2>
            <p className="text-slate-500 text-[8px] tracking-tighter">ZENFORTUNE MANIFESTATION</p>
          </div>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`text-2xl ${i < result.overallScore ? 'text-amber-400' : 'text-slate-600'}`}>★</span>
            ))}
          </div>
        </div>

        {result.alignmentFigure && (
          <div className="mb-6 flex items-center justify-between bg-gradient-to-r from-purple-900/40 to-transparent p-4 rounded-2xl border border-purple-500/20">
            <div>
              <div className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">契合名士</div>
              <div className="text-lg font-cursive text-purple-100">{result.alignmentFigure}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">共鸣强度</div>
              <div className="text-2xl font-bold text-purple-400">{result.alignmentScore}%</div>
            </div>
          </div>
        )}

        {result.poem && (
          <div className="text-center mb-8 py-8 border-y border-amber-500/10 relative bg-slate-900/20 rounded-sm">
             <button 
              onClick={playBlessing}
              disabled={isPlaying}
              title="聆听仙音"
              className={`absolute right-2 top-2 w-10 h-10 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-amber-500 animate-pulse text-white' : 'bg-slate-800/80 hover:bg-amber-900/40 text-amber-500 border border-amber-500/20'}`}
            >
              {isPlaying ? '🔊' : '🔔'}
            </button>
            <p className="font-cursive text-2xl md:text-4xl text-amber-100/90 whitespace-pre-line leading-relaxed tracking-[0.2em] [text-shadow:0_0_20px_rgba(251,191,36,0.3)]">
              {result.poem}
            </p>
          </div>
        )}

        <p className="text-slate-300 leading-relaxed text-sm mb-8 italic text-center px-4 font-serif">
          “{result.summary}”
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {categories.map((cat) => (
            <div key={cat.label} className="bg-slate-950/60 p-4 rounded-2xl text-center border border-white/5 group hover:border-amber-500/30 transition-colors">
              <div className="text-slate-500 text-[10px] mb-1 font-bold tracking-widest">{cat.label}</div>
              <div className={`text-xl font-bold ${cat.color}`}>{cat.value}</div>
              <div className="w-full bg-slate-800 h-1 mt-2 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-1000 ${cat.color.replace('text', 'bg')}`} style={{ width: `${cat.value}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-amber-950/30 p-5 rounded-2xl border border-amber-500/20 mb-8 relative">
          <div className="absolute -top-3 left-6 bg-slate-900 px-4 py-0.5 text-amber-500 text-[10px] font-bold border border-amber-500/30 rounded-full shadow-lg">
            仙人指路
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">{result.advice}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center p-3 glass-panel rounded-xl border-t border-white/5">
            <div className="text-slate-500 text-[8px] mb-1 uppercase tracking-tighter">吉祥色</div>
            <div className="font-bold text-amber-200 text-xs">{result.luckyColor}</div>
          </div>
          <div className="text-center p-3 glass-panel rounded-xl border-t border-white/5">
            <div className="text-slate-500 text-[8px] mb-1 uppercase tracking-tighter">契合数</div>
            <div className="font-bold text-amber-200 text-xs">{result.luckyNumber}</div>
          </div>
          <div className="text-center p-3 glass-panel rounded-xl border-t border-white/5">
            <div className="text-slate-500 text-[8px] mb-1 uppercase tracking-tighter">吉位</div>
            <div className="font-bold text-amber-200 text-xs">{result.luckyDirection}</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handleCopy}
            className={`flex-1 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 border ${copyFeedback ? 'bg-green-600/20 border-green-500 text-green-400' : 'bg-slate-800/50 border-white/10 text-slate-300 hover:bg-slate-700'}`}
          >
            {copyFeedback ? '✓ 已复制签文' : '📝 复制签文'}
          </button>
        </div>
      </div>

      <button
        onClick={onReset}
        className="w-full py-4 text-slate-400 hover:text-amber-500 transition-colors border border-slate-800 rounded-2xl bg-slate-900/40 font-cursive text-xl"
      >
        合十谢礼 · 返回大殿
      </button>
    </div>
  );
};
