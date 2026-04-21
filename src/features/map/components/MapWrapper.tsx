"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

export default function MapWrapper(props: any) {
  const Map = useMemo(
    () =>
      dynamic(() => import("./VietnamMap"), {
        loading: () => (
          <div className="w-full h-full flex items-center justify-center bg-white border-2 border-black font-mono text-sm uppercase tracking-widest text-black">
            Loading Map...
          </div>
        ),
        ssr: false,
      }),
    []
  );

  return <Map {...props} />;
}
