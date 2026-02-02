
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { AppState, UserProfile, FortuneResult } from './types';
import { StickShaker } from './components/StickShaker';
import { ResultDisplay } from './components/ResultDisplay';
import { ImageCapture } from './components/ImageCapture';
import { CharacterAlignment } from './components/CharacterAlignment';
import { getFortune } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.ONBOARDING);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FortuneResult | null>(null);
  const [thought, setThought] = useState('');

  const getTodayKey = () => {
    const d = new Date();
    return `fortune_${d.getFullYear()}_${d.getMonth() + 1}_${d.getDate()}`;
  };

  const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
  };

  useEffect(() => {
    const savedProfile = localStorage.getItem('zenfortune_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
      const today = getTodayKey();
      const savedFortune = localStorage.getItem(today);
      if (savedFortune) {
        setResult(JSON.parse(savedFortune));
      }
      setState(AppState.DASHBOARD);
    }
  }, []);

  const handleOnboarding = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newProfile: UserProfile = {
      name: formData.get('name') as string,
      birthDate: formData.get('birthDate') as string,
      birthTime: formData.get('birthTime') as string,
      gender: formData.get('gender') as any,
    };
    setProfile(newProfile);
    localStorage.setItem('zenfortune_profile', JSON.stringify(newProfile));
    setState(AppState.DASHBOARD);
  };

  const handleGenerateFortune = async (method: 'stick' | 'thought' | 'image' | 'alignment', input: string, image?: string) => {
    if (!profile) return;
    setLoading(true);
    try {
      const fortune = await getFortune(profile, method, input, image);
      setResult(fortune);
      const today = getTodayKey();
      localStorage.setItem(today, JSON.stringify(fortune));
      setState(AppState.RESULT);
    } catch (err) {
      alert('天机暂不可泄露，请稍后再试。');
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    if (confirm("确定要重修命理吗？这会清除所有当前记录。")) {
      localStorage.clear();
      setProfile(null);
      setResult(null);
      setState(AppState.ONBOARDING);
    }
  };

  const hasDrawnToday = !!result;

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 border-[6px] border-amber-500/10 rounded-full" />
            <div className="absolute inset-0 border-[6px] border-t-amber-500 rounded-full animate-spin" />
            <div className="absolute inset-4 border-[2px] border-b-amber-300 rounded-full animate-[spin_2s_linear_infinite_reverse]" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-amber-500 font-cursive text-3xl animate-pulse">正在推演乾坤...</p>
            <p className="text-slate-500 text-sm tracking-widest italic">凡所有相，皆是虚妄。若见诸相非相，即见如来。</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {state === AppState.ONBOARDING && (
        <div className="glass-panel p-8 rounded-3xl animate-fade-in shadow-2xl border-amber-500/20">
          <h2 className="text-2xl font-bold mb-8 text-amber-500 flex items-center justify-between">
             <span className="font-cursive text-3xl">命理初设</span>
             <span className="text-[10px] bg-amber-500/20 px-2 py-1 rounded text-amber-500 border border-amber-500/30">SECURE & PRIVATE</span>
          </h2>
          <form onSubmit={handleOnboarding} className="space-y-5">
            <div>
              <label className="block text-slate-500 text-xs mb-2 uppercase tracking-widest">缘主称呼</label>
              <input name="name" required placeholder="如：归海一刀" className="w-full bg-slate-950/50 border border-slate-800 p-4 rounded-2xl focus:ring-2 focus:ring-amber-500/50 outline-none transition-all text-slate-200" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 text-xs mb-2 uppercase tracking-widest">生辰日期</label>
                <input 
                  name="birthDate" 
                  type="date" 
                  required 
                  defaultValue="1995-01-01"
                  max={getTodayDateString()}
                  className="w-full bg-slate-950/50 border border-slate-800 p-4 rounded-2xl focus:ring-2 focus:ring-amber-500/50 outline-none transition-all text-slate-200 color-scheme-dark" 
                />
              </div>
              <div>
                <label className="block text-slate-500 text-xs mb-2 uppercase tracking-widest">具体时辰</label>
                <input name="birthTime" type="time" required className="w-full bg-slate-950/50 border border-slate-800 p-4 rounded-2xl focus:ring-2 focus:ring-amber-500/50 outline-none transition-all text-slate-200 color-scheme-dark" />
              </div>
            </div>
            <div>
              <label className="block text-slate-500 text-xs mb-2 uppercase tracking-widest">乾坤性别</label>
              <select name="gender" className="w-full bg-slate-950/50 border border-slate-800 p-4 rounded-2xl focus:ring-2 focus:ring-amber-500/50 outline-none transition-all text-slate-200">
                <option value="male">乾（男）</option>
                <option value="female">坤（女）</option>
                <option value="other">非二元</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-amber-700 to-amber-600 py-5 rounded-2xl font-bold text-white hover:from-amber-600 hover:to-amber-500 transition-all mt-4 shadow-xl active:scale-95 text-lg">
              开启灵境门户
            </button>
          </form>
          <p className="mt-8 text-slate-600 text-[10px] text-center leading-relaxed italic">
            * 本应用仅供娱乐，命由心造，境随心转。<br/>
            所有数据仅存储于您的浏览器本地。
          </p>
        </div>
      )}

      {state === AppState.DASHBOARD && profile && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-panel p-6 rounded-3xl border-l-4 border-amber-500 flex justify-between items-center shadow-lg bg-slate-900/40">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center text-2xl border border-amber-500/20">
                {profile.gender === 'female' ? '坤' : '乾'}
              </div>
              <div>
                <h3 className="text-slate-500 text-[10px] uppercase tracking-[0.2em]">当前缘主</h3>
                <p className="text-xl font-bold text-amber-100 font-cursive">{profile.name}</p>
              </div>
            </div>
            {hasDrawnToday && (
              <div onClick={() => setState(AppState.RESULT)} className="cursor-pointer flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full text-amber-500 text-[10px] font-bold animate-pulse uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                今日法缘已续
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => setState(AppState.SHAKING_STICK)}
              className="group glass-panel p-6 rounded-3xl text-left border border-white/5 hover:border-red-500/30 transition-all flex items-center gap-4 relative overflow-hidden bg-gradient-to-br from-slate-900 to-red-950/20"
            >
              <div className="text-3xl group-hover:scale-110 transition-transform">🎋</div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-red-400 font-cursive">灵签占卜</h4>
                <p className="text-slate-500 text-[10px]">传统随机感应理法</p>
              </div>
            </button>

            <button 
              onClick={() => setState(AppState.IMAGE_ANALYSIS)}
              className="group glass-panel p-6 rounded-3xl text-left border border-white/5 hover:border-amber-500/30 transition-all flex items-center gap-4 relative overflow-hidden bg-gradient-to-br from-slate-900 to-amber-950/20"
            >
              <div className="text-3xl group-hover:scale-110 transition-transform">👁️</div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-amber-500 font-cursive">灵境相法</h4>
                <p className="text-slate-500 text-[10px]">捕捉当下气色神韵</p>
              </div>
            </button>

            <button 
              onClick={() => setState(AppState.ALIGNMENT)}
              className="group glass-panel p-6 rounded-3xl text-left border border-white/5 hover:border-purple-500/30 transition-all flex items-center gap-4 relative overflow-hidden bg-gradient-to-br from-slate-900 to-purple-950/20"
            >
              <div className="text-3xl group-hover:scale-110 transition-transform">🎭</div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-purple-400 font-cursive">名士契合</h4>
                <p className="text-slate-500 text-[10px]">模仿先贤同调共振</p>
              </div>
            </button>

            <button 
              onClick={() => setState(AppState.DAILY_THOUGHT)}
              className="group glass-panel p-6 rounded-3xl text-left border border-white/5 hover:border-blue-500/30 transition-all flex items-center gap-4 relative overflow-hidden bg-gradient-to-br from-slate-900 to-blue-950/20"
            >
              <div className="text-3xl group-hover:scale-110 transition-transform">✍️</div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-blue-400 font-cursive">随笔化吉</h4>
                <p className="text-slate-500 text-[10px]">文字意念磁场感知</p>
              </div>
            </button>
          </div>
          
          <div className="flex justify-center pt-4">
            <button 
              onClick={resetAll}
              className="text-slate-600 text-[10px] hover:text-slate-400 transition-colors tracking-widest uppercase flex items-center gap-2"
            >
              <span className="w-1 h-1 bg-slate-700 rounded-full" />
              重修命理生辰
              <span className="w-1 h-1 bg-slate-700 rounded-full" />
            </button>
          </div>
        </div>
      )}

      {state === AppState.SHAKING_STICK && (
        <div className="animate-fade-in w-full">
          <button onClick={() => setState(AppState.DASHBOARD)} className="text-slate-500 hover:text-white mb-6 flex items-center gap-2 text-sm">
            ← 返回大殿
          </button>
          <StickShaker 
            hasDrawnToday={hasDrawnToday} 
            onViewPrevious={() => setState(AppState.RESULT)}
            onComplete={(id) => handleGenerateFortune('stick', `第 ${id} 签`)} 
          />
        </div>
      )}

      {state === AppState.IMAGE_ANALYSIS && (
        <div className="animate-fade-in w-full">
          <button onClick={() => setState(AppState.DASHBOARD)} className="text-slate-500 hover:text-white mb-6 flex items-center gap-2 text-sm">
            ← 返回大殿
          </button>
          <ImageCapture 
            onCancel={() => setState(AppState.DASHBOARD)}
            onCapture={(img) => handleGenerateFortune('image', '面相解析', img)}
          />
        </div>
      )}

      {state === AppState.ALIGNMENT && (
        <div className="animate-fade-in w-full">
          <CharacterAlignment 
            onCancel={() => setState(AppState.DASHBOARD)}
            onSelect={(name) => handleGenerateFortune('alignment', name)}
          />
        </div>
      )}

      {state === AppState.DAILY_THOUGHT && (
        <div className="glass-panel p-8 rounded-3xl animate-fade-in shadow-xl border-blue-500/20">
          <button onClick={() => setState(AppState.DASHBOARD)} className="text-slate-500 hover:text-white mb-6 text-sm flex items-center gap-2">
            ← 返回大殿
          </button>
          <h2 className="text-3xl font-cursive mb-6 text-blue-400">心有所感</h2>
          <textarea 
            className="w-full h-48 bg-slate-950/80 border border-slate-800 p-5 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-200 transition-all resize-none text-lg"
            placeholder="闭目三秒，写下此时最想问的事，或此时的心境..."
            value={thought}
            onChange={(e) => setThought(e.target.value)}
          />
          <button 
            onClick={() => handleGenerateFortune('thought', thought)}
            disabled={!thought.trim()}
            className="w-full bg-gradient-to-r from-blue-700 to-blue-600 py-5 rounded-2xl font-bold text-white hover:from-blue-600 hover:to-blue-500 transition-all mt-8 disabled:opacity-30 shadow-lg text-lg active:scale-95"
          >
            呈禀仙师
          </button>
          <p className="mt-6 text-slate-600 text-xs text-center italic">
            文字即意念，意念即磁场。
          </p>
        </div>
      )}

      {state === AppState.RESULT && result && (
        <ResultDisplay result={result} onReset={() => setState(AppState.DASHBOARD)} />
      )}
    </Layout>
  );
};

export default App;
