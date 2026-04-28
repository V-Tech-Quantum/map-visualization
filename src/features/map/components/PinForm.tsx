import React from 'react';

interface PinFormProps {
  mgrs: string;
  setMgrs: (value: string) => void;
  wgs84: string;
  setWgs84: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  handleCreate: () => void;
}

export default function PinForm({
  mgrs, setMgrs, wgs84, setWgs84, description, setDescription, handleCreate
}: PinFormProps) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-2xl shadow-slate-200/40">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-800">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
        Create Pin
      </h3>
      <div className="space-y-5">
        <div>
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1">MGRS</label>
          <input
            type="text"
            value={mgrs}
            onChange={(e) => setMgrs(e.target.value)}
            placeholder="e.g. 48QWJ..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all placeholder:text-slate-300"
          />
        </div>
        <div>
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1">WGS84 (Lat, Lng)</label>
          <input
            type="text"
            value={wgs84}
            onChange={(e) => setWgs84(e.target.value)}
            placeholder="e.g. 10.7626, 106.6601"
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all placeholder:text-slate-300"
          />
        </div>
        <div>
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Target location..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all placeholder:text-slate-300"
          />
        </div>
        <div>
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1">Map File:</label>
          <div className="w-full border-1 border-dashed border-slate-200 rounded-2xl px-5 py-6 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-green-500 transition-all cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2 text-slate-300"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
            <span className="text-sm font-medium">Click to upload map</span>
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="w-full bg-green-600 text-white font-bold py-5 rounded-2xl shadow-xl shadow-green-600/25 hover:bg-green-700 hover:-translate-y-1 active:translate-y-0 transition-all mt-4 flex items-center justify-center gap-3 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform"><circle cx="12" cy="12" r="10" /><path d="M12 8v8" /><path d="M8 12h8" /></svg>
          Create Pin
        </button>
      </div>
    </div>
  );
}
