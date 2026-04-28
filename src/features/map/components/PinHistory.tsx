import React from 'react';
import { HistoryItem } from '@/types/map';

interface PinHistoryProps {
  history: HistoryItem[];
  handleHistoryClick: (item: HistoryItem) => void;
  handleCopyLink: (item: HistoryItem, e: React.MouseEvent) => void;
  handleDelete: (id: string, e: React.MouseEvent) => void;
  copyFeedback: string | null;
}

export default function PinHistory({
  history, handleHistoryClick, handleCopyLink, handleDelete, copyFeedback
}: PinHistoryProps) {
  if (history.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/30">
      <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-slate-600 uppercase tracking-widest">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></svg>
        Recent Pins
      </h3>
      <div className="space-y-3">
        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => handleHistoryClick(item)}
            className="group flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-green-50 border border-transparent hover:border-green-100 transition-all cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Coordinates</span>
              <span className="text-xs font-bold text-slate-700">
                {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
              </span>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => handleCopyLink(item, e)}
                className={`p-2 rounded-lg transition-all ${copyFeedback === item.id ? 'bg-green-500 text-white' : 'bg-white text-slate-400 hover:text-green-600 border border-slate-100 shadow-sm'}`}
                title="Copy share link"
              >
                {copyFeedback === item.id ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                )}
              </button>
              <button
                onClick={(e) => handleDelete(item.id, e)}
                className="p-2 rounded-lg bg-white text-slate-400 hover:text-red-500 border border-slate-100 shadow-sm transition-all"
                title="Delete"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
