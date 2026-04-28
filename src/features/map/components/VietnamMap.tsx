"use client";

import React, { useRef, useEffect, useState } from 'react';
import ndamapgl from 'ndamap-gl';
import 'ndamap-gl/dist/ndamap-gl.css';

interface VietnamMapProps {
  pinnedPoint?: { lat: number; lng: number; description?: string } | null;
  onMapClick?: (lat: number, lng: number) => void;
}

const MAP_API_KEY = process.env.NEXT_PUBLIC_MAP_API_KEY || 'YOUR_API_KEY';

const LAYERS = [
  { name: 'Day', url: `https://maptiles.ndamaps.vn/styles/day-v1/style.json?apikey=${MAP_API_KEY}` },
  { name: 'Night', url: `https://maptiles.ndamaps.vn/styles/night-v1/style.json?apikey=${MAP_API_KEY}` },
  { name: 'Satellite', url: `https://maptiles.ndamaps.vn/styles/satellite-v1/style.json?apikey=${MAP_API_KEY}` }
];

export default function VietnamMap({ pinnedPoint, onMapClick }: VietnamMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<ndamapgl.Map | null>(null);
  const [activeLayer, setActiveLayer] = useState(LAYERS[0]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const markerRef = useRef<ndamapgl.Marker | null>(null);
  const clickMarkerRef = useRef<ndamapgl.Marker | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const styleUrl = "https://nda-tiles.openmap.vn/styles/ndamap/style.json";

    const initMap = () => {
      if (!mapContainer.current) return;

      map.current = new ndamapgl.Map({
        container: mapContainer.current,
        style: activeLayer.url,
        center: [105.85237, 21.03024],
        zoom: 15,
        maplibreLogo: true,
      });

      // Handle missing images in the style
      map.current.on('styleimagemissing', (e: any) => {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = 'rgba(0,0,0,0)';
          ctx.fillRect(0, 0, 1, 1);
          const data = ctx.getImageData(0, 0, 1, 1).data;
          map.current?.addImage(e.id, { width: 1, height: 1, data: data });
        }
      });

      map.current.on('load', () => {
        setIsMapLoaded(true);
      });

      map.current.on('click', (e: any) => {
        if (!map.current) return;
        if (clickMarkerRef.current) clickMarkerRef.current.remove();

        const { lng, lat } = e.lngLat;
        
        clickMarkerRef.current = new ndamapgl.Marker()
          .setLngLat([lng, lat])
          .addTo(map.current);
          
        if (onMapClick) onMapClick(lat, lng);
      });
    };

    initMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Handle pinnedPoint updates
  useEffect(() => {
    if (map.current && pinnedPoint && isMapLoaded) {
      const { lat, lng } = pinnedPoint;

      if (markerRef.current) markerRef.current.remove();

      // Create custom element for marker
      const el = document.createElement('div');
      el.className = 'scenery-pin';
      
      const img = document.createElement('img');
      img.src = 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=300&auto=format&fit=crop';
      img.alt = 'Scenery';
      el.appendChild(img);

      const popupContent = document.createElement('div');
      popupContent.className = 'popup-article';
      popupContent.innerHTML = `
        <h3>Pin Details</h3>
        <p>${pinnedPoint.description || 'Pinned location.'}</p>
      `;

      const popup = new ndamapgl.Popup({
        offset: 35,
        className: 'nda-popup',
        closeButton: false,
        closeOnClick: false
      }).setDOMContent(popupContent);

      // Add custom marker to map
      markerRef.current = new ndamapgl.Marker({
        element: el,
        anchor: 'bottom'
      })
        .setLngLat([lng, lat])
        .addTo(map.current);

      // Show popup on hover
      el.addEventListener('mouseenter', () => {
        if (map.current) {
          popup.setLngLat([lng, lat]).addTo(map.current);
        }
      });

      el.addEventListener('mouseleave', () => {
        popup.remove();
      });

      map.current.flyTo({
        center: [lng, lat],
        zoom: 12,
        essential: true
      });
    }
  }, [pinnedPoint, isMapLoaded]);

  useEffect(() => {
    if (map.current && map.current.isStyleLoaded()) {
      map.current.setStyle(activeLayer.url);
    }
  }, [activeLayer]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="w-full h-full" />

      <div className="absolute bottom-6 left-6 z-[10] group">
        <button 
          className="w-14 h-14 rounded-2xl bg-white/90 backdrop-blur border-2 border-transparent shadow-lg flex flex-col items-center justify-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-600 transition-all group-hover:shadow-xl group-hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 12 2 21 6 12 10 3 6"/><polygon points="3 11 12 15 21 11"/><polygon points="3 16 12 20 21 16"/></svg>
          <span className="mt-0.5">Layers</span>
        </button>

        <div className="absolute bottom-0 left-0 w-48 bg-white rounded-3xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 p-3 opacity-0 invisible scale-95 origin-bottom-left transition-all duration-200 group-hover:opacity-100 group-hover:visible group-hover:scale-100 flex flex-col gap-2">
          <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 mb-1">
            Map Type
          </div>
          {LAYERS.map(layer => (
            <button
              key={layer.name}
              onClick={() => setActiveLayer(layer)}
              className={`flex items-center gap-3 w-full p-3 rounded-2xl transition-all font-bold text-sm ${
                activeLayer.name === layer.name
                  ? 'bg-green-50 text-green-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className={`p-2 rounded-xl ${activeLayer.name === layer.name ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                {layer.name === 'Satellite' && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12a8 8 0 0 1 16 0"/><path d="M4 20a16 16 0 0 1 16 0"/><path d="M12 4v8"/></svg>
                )}
                {layer.name === 'Day' && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                )}
                {layer.name === 'Night' && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                )}
              </div>
              {layer.name}
              
              {activeLayer.name === layer.name && (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-auto text-green-500"><polyline points="20 6 9 17 4 12"/></svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
