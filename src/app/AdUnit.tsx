
"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

export default function AdUnit() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, []);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        minHeight: "100px",
        margin: "24px auto",
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          width: "100%",
        }}
        data-ad-client="ca-pub-8891619668960059"
        data-ad-slot="7426303028"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
