"use client";

import { useState } from "react";

type PerformanceVideoProps = {
  videoUrl: string;
};

export default function PerformanceVideo({
  videoUrl,
}: PerformanceVideoProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Android WebView background music control
  const notifyAndroid = (action: "pause" | "resume") => {
    if (typeof window === "undefined") return;

    const androidBridge = (
      window as typeof window & {
        Android?: {
          pauseBackgroundMusic?: () => void;
          resumeBackgroundMusic?: () => void;
        };
      }
    ).Android;

    if (!androidBridge) return;

    if (action === "pause") {
      androidBridge.pauseBackgroundMusic?.();
    } else {
      androidBridge.resumeBackgroundMusic?.();
    }
  };

  const openVideo = () => {
    notifyAndroid("pause");
    setIsOpen(true);
  };

  const closeVideo = () => {
    notifyAndroid("resume");
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
            onPlay={() => notifyAndroid("pause")}
            onPause={() => notifyAndroid("resume")}
            onEnded={() => notifyAndroid("resume")}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
