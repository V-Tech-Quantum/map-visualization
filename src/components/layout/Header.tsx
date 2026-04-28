import React from 'react';

export default function Header() {
  return (
    <header className="flex justify-between items-center mb-16 lg:mb-24 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-green-500 shadow-sm shadow-green-200 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-white"></div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Brand</h1>
      </div>
      <div className="flex gap-4">
        <button className="bg-slate-900 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
          Dashboard
        </button>
      </div>
    </header>
  );
}
