"use client";

import React, { useRef, useEffect, useState } from 'react';
import ndamapgl from 'ndamap-gl';
import 'ndamap-gl/dist/ndamap-gl.css';

interface VietnamMapProps {
  pinnedPoint?: { lat: number; lng: number } | null;
}

export default function VietnamMap({ pinnedPoint }: VietnamMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<ndamapgl.Map | null>(null);
  const [showBorder, setShowBorder] = useState(true);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const markerRef = useRef<ndamapgl.Marker | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const styleUrl = "https://nda-tiles.openmap.vn/styles/ndamap/style.json";

    const initMap = () => {
      if (!mapContainer.current) return;

      map.current = new ndamapgl.Map({
        container: mapContainer.current,
        style: styleUrl,
        center: [105.85237, 21.03024], // Fixed to [lng, lat]
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

      map.current.on('load', async () => {
        setIsMapLoaded(true);
        if (!map.current) return;

        try {
          const response = await fetch('/data/vn_geo.json');
          const data = await response.json();

          if (!map.current.getSource('vietnam')) {
            map.current.addSource('vietnam', {
              type: 'geojson',
              data: data
            });
          }

          if (!map.current.getLayer('vietnam-border')) {
            map.current.addLayer({
              id: 'vietnam-border',
              type: 'line',
              source: 'vietnam',
              layout: {
                'visibility': showBorder ? 'visible' : 'none'
              },
              paint: {
                'line-color': '#16a34a',
                'line-width': 2
              }
            });
          }
        } catch (err) {
          console.error("Error loading GeoJSON data:", err);
        }
      });

      map.current.on('click', (e: any) => {
        if (!map.current) return;
        if (markerRef.current) markerRef.current.remove();

        const { lng, lat } = e.lngLat;

        // Reuse custom marker logic for clicks too
        const el = document.createElement('div');
        el.className = 'scenery-pin';
        
        const img = document.createElement('img');
        img.src = 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=300&auto=format&fit=crop';
        img.alt = 'Scenery';
        el.appendChild(img);

        const popupContent = document.createElement('div');
        popupContent.className = 'popup-article';
        popupContent.innerHTML = `
          <h3>New Discovery</h3>
          <p>This location has been pinned. Hover to explore more about the local geography and culture.</p>
        `;

        const popup = new ndamapgl.Popup({
          offset: 35,
          className: 'nda-popup',
          closeButton: false,
          closeOnClick: false
        }).setDOMContent(popupContent);

        markerRef.current = new ndamapgl.Marker({
          element: el,
          anchor: 'bottom'
        })
          .setLngLat([lng, lat])
          .addTo(map.current);

        el.addEventListener('mouseenter', () => {
          if (map.current) popup.setLngLat([lng, lat]).addTo(map.current);
        });
        el.addEventListener('mouseleave', () => popup.remove());
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

      // Create popup content
      const popupContent = document.createElement('div');
      popupContent.className = 'popup-article';
      popupContent.innerHTML = `
        <h3>Ha Long Bay</h3>
        <p>A stunning UNESCO World Heritage site known for its emerald waters and thousands of towering limestone islands topped by rainforests.</p>
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
    const m = map.current;
    if (m && m.isStyleLoaded()) {
      try {
        if (m.getLayer('vietnam-border')) {
          m.setLayoutProperty('vietnam-border', 'visibility', showBorder ? 'visible' : 'none');
        }
      } catch (e) { }
    }
  }, [showBorder]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="w-full h-full" />

      <div className="absolute bottom-6 left-6 z-[10] flex flex-col gap-2">
        <button
          onClick={() => setShowBorder(!showBorder)}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg transition-all border border-slate-200/60 backdrop-blur-sm ${showBorder
            ? 'bg-green-600 text-white shadow-green-600/20 border-green-500'
            : 'bg-white/80 text-slate-700 shadow-slate-200/50'
            }`}
        >
          {showBorder ? 'Hide Border' : 'Show Border'}
        </button>
      </div>
    </div>
  );
}
