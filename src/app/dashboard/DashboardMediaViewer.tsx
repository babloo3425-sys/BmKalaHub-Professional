"use client";

import { useEffect, useState } from "react";

type DashboardMediaViewerProps = {
  portfolio: string[];
  resume?: string;
  video?: string;
  audio?: string;
};

type MediaType =
  | "portfolio"
  | "resume"
  | "video"
  | "audio"
  | null;

export default function DashboardMediaViewer({
  portfolio,
  resume,
  video,
  audio,
}: DashboardMediaViewerProps) {
  const [mediaType, setMediaType] = useState<MediaType>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const isOpen = mediaType !== null;

  function openPortfolio(index: number) {
    setActiveIndex(index);
    setMediaType("portfolio");
  }

  function closeViewer() {
    setMediaType(null);
  }

  function showPrevious() {
    if (portfolio.length < 2) {
      return;
    }

    setActiveIndex((index) =>
      index === 0 ? portfolio.length - 1 : index - 1
    );
  }

  function showNext() {
    if (portfolio.length < 2) {
      return;
    }

    setActiveIndex((index) =>
      index === portfolio.length - 1 ? 0 : index + 1
    );
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeViewer();
      }

      if (mediaType === "portfolio") {
        if (event.key === "ArrowLeft") {
          showPrevious();
        }

        if (event.key === "ArrowRight") {
          showNext();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
      document.body.style.overflow = "";
    };
  }, [isOpen, mediaType]);

  return (
    <>
      <div className="media-actions">
        {portfolio.map((_, index) => (
          <button
            key={`portfolio-${index}`}
            type="button"
            className="media-button"
            onClick={() => openPortfolio(index)}
          >
            Portfolio {index + 1}
          </button>
        ))}

        {resume && (
          <button
            type="button"
            className="media-button"
            onClick={() => setMediaType("resume")}
          >
            View Resume
          </button>
        )}

        {video && (
          <button
            type="button"
            className="media-button"
            onClick={() => setMediaType("video")}
          >
            View Video
          </button>
        )}

        {audio && (
          <button
            type="button"
            className="media-button"
            onClick={() => setMediaType("audio")}
          >
            Play Audio
          </button>
        )}
      </div>

      {isOpen && (
        <div
          className="dashboard-media-viewer"
          role="dialog"
          aria-modal="true"
          onClick={closeViewer}
        >
          <button
            type="button"
            className="dashboard-media-close"
            onClick={closeViewer}
            aria-label="Close viewer"
          >
            ×
          </button>

          {mediaType === "portfolio" && portfolio.length > 0 && (
            <>
              {portfolio.length > 1 && (
                <button
                  type="button"
                  className="dashboard-media-nav dashboard-media-prev"
                  onClick={(event) => {
                    event.stopPropagation();
                    showPrevious();
                  }}
                  aria-label="Previous portfolio image"
                >
                  ‹
                </button>
              )}

              <img
                src={portfolio[activeIndex]}
                alt={`Portfolio ${activeIndex + 1}`}
                className="dashboard-portfolio-image"
                onClick={(event) =>
                  event.stopPropagation()
                }
              />

              {portfolio.length > 1 && (
                <button
                  type="button"
                  className="dashboard-media-nav dashboard-media-next"
                  onClick={(event) => {
                    event.stopPropagation();
                    showNext();
                  }}
                  aria-label="Next portfolio image"
                >
                  ›
                </button>
              )}

              <span className="dashboard-media-count">
                {activeIndex + 1} / {portfolio.length}
              </span>
            </>
          )}

          {mediaType === "resume" && resume && (
            <div
              className="dashboard-resume-frame"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <iframe
                src={resume}
                title="Resume"
              />
            </div>
          )}

          {mediaType === "video" && video && (
            <video
              src={video}
              className="dashboard-video-player"
              controls
              autoPlay
              playsInline
              onClick={(event) =>
                event.stopPropagation()
              }
            />
          )}

          {mediaType === "audio" && audio && (
            <div
              className="dashboard-audio-card"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <h3>Performance Audio</h3>

              <audio
                src={audio}
                controls
                autoPlay
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}