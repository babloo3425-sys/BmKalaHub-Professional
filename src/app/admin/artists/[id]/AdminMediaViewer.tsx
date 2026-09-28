"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

type AdminMediaViewerProps = {
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

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(
    seconds % 60
  );

  return `${minutes}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

export default function AdminMediaViewer({
  portfolio,
  resume,
  video,
  audio,
}: AdminMediaViewerProps) {
  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  const [mediaType, setMediaType] =
    useState<MediaType>(null);

  const [activeIndex, setActiveIndex] =
    useState(0);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [currentTime, setCurrentTime] =
    useState(0);

  const [duration, setDuration] =
    useState(0);

  const isOpen = mediaType !== null;

  function openPortfolio(index: number) {
    setActiveIndex(index);
    setMediaType("portfolio");
  }

  function closeViewer() {
    const audioElement = audioRef.current;

    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }

    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setMediaType(null);
  }

  function showPrevious() {
    if (portfolio.length < 2) {
      return;
    }

    setActiveIndex((index) =>
      index === 0
        ? portfolio.length - 1
        : index - 1
    );
  }

  function showNext() {
    if (portfolio.length < 2) {
      return;
    }

    setActiveIndex((index) =>
      index === portfolio.length - 1
        ? 0
        : index + 1
    );
  }

  async function togglePlay() {
    const audioElement = audioRef.current;

    if (!audioElement) {
      return;
    }

    if (audioElement.paused) {
      try {
        await audioElement.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    } else {
      audioElement.pause();
      setIsPlaying(false);
    }
  }

  function handleSeek(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const audioElement = audioRef.current;

    if (!audioElement) {
      return;
    }

    const newTime = Number(event.target.value);

    audioElement.currentTime = newTime;
    setCurrentTime(newTime);
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

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow = "";
    };
  }, [isOpen, mediaType]);

  useEffect(() => {
    if (
      !isOpen ||
      mediaType !== "audio" ||
      !audioRef.current
    ) {
      return;
    }

    const audioElement = audioRef.current;

    function handleLoadedMetadata() {
      setDuration(audioElement.duration);
    }

    function handleTimeUpdate() {
      setCurrentTime(audioElement.currentTime);
    }

    function handleEnded() {
      setIsPlaying(false);
      setCurrentTime(0);
    }

    audioElement.addEventListener(
      "loadedmetadata",
      handleLoadedMetadata
    );

    audioElement.addEventListener(
      "timeupdate",
      handleTimeUpdate
    );

    audioElement.addEventListener(
      "ended",
      handleEnded
    );

    return () => {
      audioElement.removeEventListener(
        "loadedmetadata",
        handleLoadedMetadata
      );

      audioElement.removeEventListener(
        "timeupdate",
        handleTimeUpdate
      );

      audioElement.removeEventListener(
        "ended",
        handleEnded
      );
    };
  }, [isOpen, mediaType]);


  return (
    <>
      <div className="admin-media-actions">
        {portfolio.map((_, index) => (
          <button
            key={`portfolio-${index}`}
            type="button"
            className="admin-media-button"
            onClick={() => openPortfolio(index)}
          >
            Portfolio {index + 1}
          </button>
        ))}

        {resume && (
          <button
            type="button"
            className="admin-media-button primary"
            onClick={() =>
              setMediaType("resume")
            }
          >
            View Resume
          </button>
        )}

        {video && (
          <button
            type="button"
            className="admin-media-button"
            onClick={() =>
              setMediaType("video")
            }
          >
            View Video
          </button>
        )}

        {audio && (
          <button
            type="button"
            className="admin-media-button"
            onClick={() =>
              setMediaType("audio")
            }
          >
            Play Audio
          </button>
        )}
      </div>

      {isOpen && (
        <div
          className="admin-media-viewer"
          role="dialog"
          aria-modal="true"
          aria-label="Media viewer"
          onClick={closeViewer}
        >
          <button
            type="button"
            className="admin-media-close"
            onClick={closeViewer}
            aria-label="Close viewer"
          >
            ×
          </button>

          {mediaType === "portfolio" &&
            portfolio.length > 0 && (
              <>
                {portfolio.length > 1 && (
                  <button
                    type="button"
                    className="admin-media-nav admin-media-prev"
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
                  alt={`Portfolio ${
                    activeIndex + 1
                  }`}
                  className="admin-media-image"
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                />

                {portfolio.length > 1 && (
                  <button
                    type="button"
                    className="admin-media-nav admin-media-next"
                    onClick={(event) => {
                      event.stopPropagation();
                      showNext();
                    }}
                    aria-label="Next portfolio image"
                  >
                    ›
                  </button>
                )}

                <span className="admin-media-count">
                  {activeIndex + 1} /{" "}
                  {portfolio.length}
                </span>
              </>
            )}

          {mediaType === "resume" && resume && (
            <div
              className="admin-resume-frame"
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
              className="admin-video-player"
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
              className="admin-audio-card"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <h3>Performance Audio</h3>

              <audio
                ref={audioRef}
                src={audio}
                preload="metadata"
              />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                }}
              >
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={
                    isPlaying
                      ? "Pause audio"
                      : "Play audio"
                  }
                  style={{
                    flex: "0 0 50px",
                    width: "50px",
                    height: "50px",
                    border: 0,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--primary)",
                    color: "#ffffff",
                    fontSize: "19px",
                    cursor: "pointer",
                  }}
                >
                  {isPlaying ? "Ⅱ" : "▶"}
                </button>

                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    step="0.1"
                    value={currentTime}
                    onChange={handleSeek}
                    aria-label="Audio progress"
                    style={{
                      width: "100%",
                      height: "6px",
                      accentColor:
                        "var(--primary)",
                      cursor: "pointer",
                      touchAction: "none",
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      marginTop: "6px",
                      color:
                        "var(--text-secondary)",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    <span>
                      {formatTime(currentTime)}
                    </span>

                    <span>
                      {formatTime(duration)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}