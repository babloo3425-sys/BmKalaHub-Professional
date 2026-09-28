"use client";

import { useState } from "react";

type PerformanceVideoProps = {
  videoUrl: string;
};

export default function PerformanceVideo({
  videoUrl,
}: PerformanceVideoProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="public-action"
        onClick={() => setIsOpen(true)}
      >
        ▶ View Video
      </button>

      {isOpen && (
        <div
          className="performance-video-viewer"
          role="dialog"
          aria-modal="true"
          aria-label="Performance video"
          onClick={() => setIsOpen(false)}
        >
          <button
            type="button"
            className="performance-video-close"
            onClick={() => setIsOpen(false)}
            aria-label="Close video"
          >
            ×
          </button>

          <video
            className="performance-video-player"
            src={videoUrl}
            controls
            autoPlay
            playsInline
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}