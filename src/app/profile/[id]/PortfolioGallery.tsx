"use client";

import { useEffect, useState } from "react";

type PortfolioGalleryProps = {
  images: string[];
};

export default function PortfolioGallery({
  images,
}: PortfolioGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const isOpen = activeIndex !== null;

  function closeViewer() {
    setActiveIndex(null);
  }

  function showPrevious() {
    if (activeIndex === null || images.length < 2) {
      return;
    }

    setActiveIndex(
      activeIndex === 0 ? images.length - 1 : activeIndex - 1
    );
  }

  function showNext() {
    if (activeIndex === null || images.length < 2) {
      return;
    }

    setActiveIndex(
      activeIndex === images.length - 1 ? 0 : activeIndex + 1
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

      if (event.key === "ArrowLeft") {
        showPrevious();
      }

      if (event.key === "ArrowRight") {
        showNext();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, activeIndex]);

  return (
    <>
      <div className="portfolio-grid">
        {images.map((url, index) => (
          <button
            key={`${url}-${index}`}
            type="button"
            className="portfolio-item"
            onClick={() => setActiveIndex(index)}
            aria-label={`Open portfolio image ${index + 1}`}
          >
            <img
              src={url}
              alt={`Portfolio ${index + 1}`}
            />
          </button>
        ))}
      </div>

      {isOpen && activeIndex !== null && (
        <div
          className="portfolio-viewer"
          role="dialog"
          aria-modal="true"
          aria-label="Portfolio image viewer"
          onClick={closeViewer}
        >
          <button
            type="button"
            className="portfolio-viewer-close"
            onClick={closeViewer}
            aria-label="Close image viewer"
          >
            ×
          </button>

          {images.length > 1 && (
            <button
              type="button"
              className="portfolio-viewer-nav portfolio-viewer-prev"
              onClick={(event) => {
                event.stopPropagation();
                showPrevious();
              }}
              aria-label="Previous image"
            >
              ‹
            </button>
          )}

          <img
            src={images[activeIndex]}
            alt={`Portfolio ${activeIndex + 1}`}
            className="portfolio-viewer-image"
            onClick={(event) => event.stopPropagation()}
          />

          {images.length > 1 && (
            <button
              type="button"
              className="portfolio-viewer-nav portfolio-viewer-next"
              onClick={(event) => {
                event.stopPropagation();
                showNext();
              }}
              aria-label="Next image"
            >
              ›
            </button>
          )}

          <span className="portfolio-viewer-count">
            {activeIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </>
  );
}