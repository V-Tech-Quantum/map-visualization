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
        <p>${pinnedPoint.description || 'Mockup picture and description.'}</p>
      `;

      const popup = new ndamapgl.Popup({
        offset: 35,
        className: 'nda-popup',
        closeButton: false,
        closeOnClick: false
      }).setDOMContent(popupContent);

      // Add marker to map
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

      <div className="absolute bottom-6 left-6 z-[10] flex gap-2 p-2 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-xl">
        {LAYERS.map(layer => (
          <button
            key={layer.name}
            onClick={() => setActiveLayer(layer)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeLayer.name === layer.name
                ? 'bg-green-600 text-white shadow-md shadow-green-600/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {layer.name}
          </button>
        ))}
      </div>
    </div>
  );
}
