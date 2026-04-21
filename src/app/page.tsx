"use client";

import { useState, useEffect, useCallback } from "react";
import MapWrapper from "@/features/map/components/MapWrapper";

interface HistoryItem {
  id: string;
  lat: number;
  lng: number;
  timestamp: number;
}

export default function Home() {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [pinnedPoint, setPinnedPoint] = useState<{ lat: number, lng: number } | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("lancer-map-history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }

    // Check for URL parameters
    const params = new URLSearchParams(window.location.search);
    const urlLat = params.get("lat");
    const urlLng = params.get("lng");
    if (urlLat && urlLng) {
      const latNum = parseFloat(urlLat);
      const lngNum = parseFloat(urlLng);
      if (!isNaN(latNum) && !isNaN(lngNum)) {
        setPinnedPoint({ lat: latNum, lng: lngNum });
        setLat(urlLat);
        setLng(urlLng);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("lancer-map-history", JSON.stringify(history));
  }, [history]);

  const handleCreate = () => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (!isNaN(latNum) && !isNaN(lngNum)) {
      const newPoint = { lat: latNum, lng: lngNum };
      setPinnedPoint(newPoint);

      // Add to history if not already there (based on coords)
      const exists = history.find(item => item.lat === latNum && item.lng === lngNum);
      if (!exists) {
        const newItem: HistoryItem = {
          id: Math.random().toString(36).substr(2, 9),
          lat: latNum,
          lng: lngNum,
          timestamp: Date.now()
        };
        setHistory(prev => [newItem, ...prev].slice(0, 10)); // Keep last 10
      }
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleCopyLink = (item: HistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}?lat=${item.lat}&lng=${item.lng}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopyFeedback(item.id);
      setTimeout(() => setCopyFeedback(null), 2000);
    });
  };

  const handleHistoryClick = (item: HistoryItem) => {
    setPinnedPoint({ lat: item.lat, lng: item.lng });
    setLat(item.lat.toString());
    setLng(item.lng.toString());
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-green-200 scroll-smooth">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col pt-6 pb-24">

        {/* Header */}
        <header className="flex justify-between items-center mb-16 lg:mb-24 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500 shadow-sm shadow-green-200 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-white"></div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Brand</h1>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-green-600 transition-colors">Products</a>
            <a href="#" className="hover:text-green-600 transition-colors">Solutions</a>
            <a href="#" className="hover:text-green-600 transition-colors">Documentation</a>
          </nav>
          <div className="flex gap-4">
            <button className="bg-slate-900 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
              Dashboard
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="text-center max-w-5xl mx-auto mb-32 lg:mb-48 py-12">
          <h2 className="text-6xl md:text-8xl font-extrabold tracking-tight text-slate-900 mb-10 leading-[1.05]">
            Lorem ipsum dolor <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-700">Gradient</span> aliqua
          </h2>
          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              onClick={() => document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-green-600 text-white px-10 py-5 rounded-full font-bold text-lg shadow-xl shadow-green-600/30 hover:bg-green-700 hover:-translate-y-1 transition-all w-full sm:w-auto"
            >
              Mapper
            </button>
            <button className="bg-white text-slate-700 px-10 py-5 rounded-full font-bold text-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all w-full sm:w-auto">
              Learn more
            </button>
          </div>
        </section>

        {/* Interactive Workspace Section */}
        <div id="workspace" className="scroll-mt-12 pt-12">
          <div className="flex flex-col lg:flex-row gap-8 min-h-[750px] mb-12">

            {/* Sidebar: Controls */}
            <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-2xl shadow-slate-200/40 sticky top-12">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                  Create Pin
                </h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1">Latitude</label>
                    <input
                      type="text"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      placeholder="e.g. 10.7626"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1">Longitude</label>
                    <input
                      type="text"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      placeholder="e.g. 106.6601"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <button
                    onClick={handleCreate}
                    className="w-full bg-green-600 text-white font-bold py-5 rounded-2xl shadow-xl shadow-green-600/25 hover:bg-green-700 hover:-translate-y-1 active:translate-y-0 transition-all mt-4 flex items-center justify-center gap-3 group"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform"><circle cx="12" cy="12" r="10" /><path d="M12 8v8" /><path d="M8 12h8" /></svg>
                    Create Pin
                  </button>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-100">
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    The map will automatically zoom and center on your pinned coordinates with sub-meter precision.
                  </p>
                </div>
              </div>

              {/* Pin History */}
              {history.length > 0 && (
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
              )}
            </div>

            {/* Map Container */}
            <div className="flex-grow rounded-[2.5rem] overflow-hidden bg-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-200/60 relative ring-1 ring-slate-900/5 min-h-[600px] lg:min-h-0 transition-all">
              <MapWrapper pinnedPoint={pinnedPoint} />
            </div>

          </div>
        </div>

        {/* Footer */}
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

      </div>
    </main>
  );
}
