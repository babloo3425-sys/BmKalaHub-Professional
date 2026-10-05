"use client";

import { useEffect, useRef, useState } from "react";

type AudioPlayerProps = {
  audioUrl: string;
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Android WebView bridge.
 *
 * MainActivity exposes these methods:
 * pauseBackgroundMusic()
 * resumeBackgroundMusic()
 */
function pauseAppBackgroundMusic() {
  try {
    const androidBridge = (
      window as typeof window & {
        AndroidMusic?: {
          pauseBackgroundMusic?: () => void;
        };
      }
    ).AndroidMusic;

    androidBridge?.pauseBackgroundMusic?.();
  } catch {
    // Normal browser: no Android bridge available.
  }
}

function resumeAppBackgroundMusic() {
  try {
    const androidBridge = (
      window as typeof window & {
        AndroidMusic?: {
          resumeBackgroundMusic?: () => void;
        };
      }
    ).AndroidMusic;

    androidBridge?.resumeBackgroundMusic?.();
  } catch {
    // Normal browser: no Android bridge available.
  }
}

export default function AudioPlayer({
  audioUrl,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!isOpen || !audioRef.current) {
      return;
    }

    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);

      // Artist audio finished → resume app background music.
      resumeAppBackgroundMusic();
    };

    audio.addEventListener(
      "loadedmetadata",
      handleLoadedMetadata
    );

    audio.addEventListener(
      "timeupdate",
      handleTimeUpdate
    );

    audio.addEventListener(
      "ended",
      handleEnded
    );

    return () => {
      audio.removeEventListener(
        "loadedmetadata",
        handleLoadedMetadata
      );

      audio.removeEventListener(
        "timeupdate",
        handleTimeUpdate
      );

      audio.removeEventListener(
        "ended",
        handleEnded
      );
    };
  }, [isOpen]);

  async function togglePlay() {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (audio.paused) {
      // Artist audio starts → pause app background music.
      pauseAppBackgroundMusic();

      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        // If playback fails, restore background music.
        resumeAppBackgroundMusic();
        setIsPlaying(false);
      }
    } else {
      audio.pause();
      setIsPlaying(false);

      // Artist audio paused → resume app background music.
      resumeAppBackgroundMusic();
    }
  }

  function handleSeek(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const newTime = Number(event.target.value);

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }

  function closePlayer() {
    const audio = audioRef.current;

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    setIsPlaying(false);
    setCurrentTime(0);
    setIsOpen(false);

    // Artist audio closed → resume app background music.
    resumeAppBackgroundMusic();
  }

  const progress =
    duration > 0
      ? (currentTime / duration) * 100
      : 0;

  return (
    <>
      <button
        type="button"
        className="public-action"
        onClick={() => setIsOpen(true)}
      >
        ▶ View Audio
      </button>

      {isOpen && (
        <div
          className="performance-video-viewer"
          role="dialog"
          aria-modal="true"
          aria-label="Audio player"
          onClick={closePlayer}
        >
          <button
            type="button"
            className="performance-video-close"
            onClick={closePlayer}
            aria-label="Close audio"
          >
            ×
          </button>

          <div
            style={{
              width: "min(500px, 90vw)",
              padding: "28px",
              borderRadius: "22px",
              background: "#ffffff",
              boxSizing: "border-box",
              boxShadow:
                "0 24px 70px rgba(0, 0, 0, 0.3)",
            }}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div
              style={{
                marginBottom: "22px",
                color: "var(--text-primary)",
                fontSize: "18px",
                fontWeight: 800,
              }}
            >
              Performance Audio
            </div>

            <audio
              ref={audioRef}
              src={audioUrl}
              preload="metadata"
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
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
                  flex: "0 0 52px",
                  width: "52px",
                  height: "52px",
                  border: 0,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--primary)",
                  color: "#ffffff",
                  fontSize: "20px",
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
                    accentColor: "var(--primary)",
                    cursor: "pointer",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    marginTop: "5px",
                    color: "var(--text-secondary)",
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
        </div>
      )}
    </>
  );
}