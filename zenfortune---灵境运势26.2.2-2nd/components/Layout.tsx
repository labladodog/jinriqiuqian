
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 max-w-2xl mx-auto w-full">
      <header className="mb-8 text-center animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-cursive text-amber-500 mb-2">灵境运势</h1>
        <p className="text-slate-400 text-sm tracking-widest uppercase">ZenFortune • Ancient Wisdom & AI</p>
      </header>
      <main className="w-full flex-1">
        {children}
      </main>
      <footer className="mt-12 text-slate-600 text-xs">
        &copy; 2024 灵境阁 · 仅供娱乐
      </footer>
    </div>
  );
};
