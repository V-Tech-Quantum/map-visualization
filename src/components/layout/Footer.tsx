import React from 'react';

export default function Footer() {
  return (
    <footer className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 font-bold uppercase tracking-widest gap-6">
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]"></div>
        <span>All systems operational</span>
      </div>
      <div className="flex gap-8">
        <span>&copy; 2026 BrandName</span>
        <span className="text-slate-200">|</span>
        <span>Vietnam Geo-Engine V4.0</span>
      </div>
    </footer>
  );
}
