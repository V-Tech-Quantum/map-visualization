"use client";

import { useState, useEffect, useCallback } from "react";
import MapWrapper from "@/features/map/components/MapWrapper";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PinForm from "@/features/map/components/PinForm";
import PinHistory from "@/features/map/components/PinHistory";
import { HistoryItem } from "@/types/map";

export default function Home() {
  const [mgrs, setMgrs] = useState("");
  const [wgs84, setWgs84] = useState("");
  const [description, setDescription] = useState("");
  const [pinnedPoint, setPinnedPoint] = useState<{ lat: number, lng: number, description?: string } | null>(null);
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

    const params = new URLSearchParams(window.location.search);
    const urlLat = params.get("lat");
    const urlLng = params.get("lng");
    if (urlLat && urlLng) {
      const latNum = parseFloat(urlLat);
      const lngNum = parseFloat(urlLng);
      if (!isNaN(latNum) && !isNaN(lngNum)) {
        setPinnedPoint({ lat: latNum, lng: lngNum });
        setWgs84(`${latNum}, ${lngNum}`);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("lancer-map-history", JSON.stringify(history));
  }, [history]);

  const handleCreate = () => {
    // Basic WGS84 parsing "lat, lng"
    const parts = wgs84.split(',').map(s => parseFloat(s.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      const newPoint = { lat: parts[0], lng: parts[1], description };
      setPinnedPoint(newPoint);

      const exists = history.find(item => item.lat === parts[0] && item.lng === parts[1]);
      if (!exists) {
        const newItem: HistoryItem = {
          id: Math.random().toString(36).substr(2, 9),
          lat: parts[0],
          lng: parts[1],
          wgs84,
          mgrs,
          description,
          timestamp: Date.now()
        };
        setHistory(prev => [newItem, ...prev].slice(0, 10));
      }
    } else {
      alert("Please provide valid WGS84 coordinates as 'lat, lng' (e.g. 10.7626, 106.6601)");
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
    setPinnedPoint({ lat: item.lat, lng: item.lng, description: item.description });
    setWgs84(item.wgs84 || `${item.lat}, ${item.lng}`);
    setMgrs(item.mgrs || "");
    setDescription(item.description || "");
  };

  const onMapClick = useCallback((clickLat: number, clickLng: number) => {
    setWgs84(`${clickLat.toFixed(5)}, ${clickLng.toFixed(5)}`);
  }, []);

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-green-200 scroll-smooth">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col pt-6 pb-24">

        <Header />

        {/* Interactive Workspace Section */}
        <div id="workspace" className="scroll-mt-12 pt-12">
          <div className="flex flex-col lg:flex-row gap-8 min-h-[750px] mb-12">

            {/* Sidebar: Controls */}
            <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6 sticky top-12 self-start h-fit">
              <PinForm
                mgrs={mgrs} setMgrs={setMgrs}
                wgs84={wgs84} setWgs84={setWgs84}
                description={description} setDescription={setDescription}
                handleCreate={handleCreate}
              />

              {/* Pin History */}
              <PinHistory
                history={history}
                handleHistoryClick={handleHistoryClick}
                handleCopyLink={handleCopyLink}
                handleDelete={handleDelete}
                copyFeedback={copyFeedback}
              />
            </div>

            {/* Map Container */}
            <div className="flex-grow rounded-[2.5rem] overflow-hidden bg-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-200/60 relative ring-1 ring-slate-900/5 min-h-[600px] lg:min-h-0 transition-all">
              <MapWrapper pinnedPoint={pinnedPoint} onMapClick={onMapClick} />
            </div>

          </div>
        </div>

        <Footer />

      </div>
    </main>
  );
}
