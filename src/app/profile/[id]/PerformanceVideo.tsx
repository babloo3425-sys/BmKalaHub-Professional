"use client";

import { useState } from "react";

type PerformanceVideoProps = {
  videoUrl: string;
};

declare global {
  interface Window {
    BmKalaHubMusic?: {
      pauseBackgroundMusic?: () => void;
      resumeBackgroundMusic?: () => void;
    };
  }
}

export default function PerformanceVideo({
  videoUrl,
}: PerformanceVideoProps) {
  const [isOpen, setIsOpen] = useState(false);

  const pauseBackgroundMusic = () => {
    if (typeof window !== "undefined") {
      window.BmKalaHubMusic?.pauseBackgroundMusic?.();
    }
  };

  const resumeBackgroundMusic = () => {
    if (typeof window !== "undefined") {
      window.BmKalaHubMusic?.resumeBackgroundMusic?.();
    }
  };

  const openVideo = () => {
    pauseBackgroundMusic();
    setIsOpen(true);
  };

  const closeVideo = () => {
    resumeBackgroundMusic();
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="public-action"
        onClick={openVideo}
      >
        ▶ View Video
      </button>

      {isOpen && (
        <div
          className="performance-video-viewer"
          role="dialog"
          aria-modal="true"
          aria-label="Performance video"
          onClick={closeVideo}
        >
          <button
            type="button"
            className="performance-video-close"
            onClick={closeVideo}
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
            onPlay={pauseBackgroundMusic}
            onPause={resumeBackgroundMusic}
            onEnded={resumeBackgroundMusic}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
