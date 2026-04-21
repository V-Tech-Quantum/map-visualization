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

        markerRef.current = new ndamapgl.Marker({
          color: "#16a34a",
          draggable: false
        })
          .setLngLat([e.lngLat.lng, e.lngLat.lat])
          .addTo(map.current);
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
      markerRef.current = new ndamapgl.Marker({
        color: "#ef4444",
        draggable: false
      })
        .setLngLat([lng, lat])
        .addTo(map.current);

      const offset = 0.02;
      const squareData: any = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [lng - offset, lat - offset],
              [lng + offset, lat - offset],
              [lng + offset, lat + offset],
              [lng - offset, lat + offset],
              [lng - offset, lat - offset]
            ]
          ]
        }
      };

      if (!map.current.getSource('pinned-square')) {
        map.current.addSource('pinned-square', {
          type: 'geojson',
          data: squareData
        });
        map.current.addLayer({
          id: 'pinned-square-layer',
          type: 'fill',
          source: 'pinned-square',
          paint: {
            'fill-color': '#ef4444',
            'fill-opacity': 0.3,
            'fill-outline-color': '#ef4444'
          }
        });
        map.current.addLayer({
          id: 'pinned-square-border',
          type: 'line',
          source: 'pinned-square',
          paint: {
            'line-color': '#ef4444',
            'line-width': 2
          }
        });
      } else {
        const source = map.current.getSource('pinned-square') as ndamapgl.GeoJSONSource;
        if (source && source.setData) {
          source.setData(squareData);
        }
      }

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
