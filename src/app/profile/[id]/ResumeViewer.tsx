"use client";

import { useEffect, useMemo, useState } from "react";

type ResumeViewerProps = {
  resumeUrl: string;
};

type ResumeType =
  | "pdf"
  | "image"
  | "document"
  | "unknown";

function getResumeType(url: string): ResumeType {
  const cleanUrl = url.split("?")[0].toLowerCase();

  if (cleanUrl.endsWith(".pdf")) {
    return "pdf";
  }

  if (
    cleanUrl.endsWith(".jpg") ||
    cleanUrl.endsWith(".jpeg") ||
    cleanUrl.endsWith(".png") ||
    cleanUrl.endsWith(".webp") ||
    cleanUrl.endsWith(".gif")
  ) {
    return "image";
  }

  if (
    cleanUrl.endsWith(".doc") ||
    cleanUrl.endsWith(".docx")
  ) {
    return "document";
  }

  /*
   * Cloudinary URLs may not always expose the original
   * extension clearly. In that case PDF is the safest
   * viewer attempt because the current application
   * historically stores resumes as PDF.
   */
  if (cleanUrl.includes("/raw/upload/")) {
    return "document";
  }

  return "pdf";
}

export default function ResumeViewer({
  resumeUrl,
}: ResumeViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const resumeType = useMemo(
    () => getResumeType(resumeUrl),
    [resumeUrl]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [isOpen]);

  function openViewer() {
    setZoom(1);
    setIsOpen(true);
  }

  function closeViewer() {
    setZoom(1);
    setIsOpen(false);
  }

  function zoomIn() {
    setZoom((current) =>
      Math.min(
        Number((current + 0.25).toFixed(2)),
        3
      )
    );
  }

  function zoomOut() {
    setZoom((current) =>
      Math.max(
        Number((current - 0.25).toFixed(2)),
        0.5
      )
    );
  }

  function resetZoom() {
    setZoom(1);
  }

  function openDocument() {
    window.open(
      resumeUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <>
      <button
        type="button"
        className="public-action primary"
        onClick={openViewer}
      >
        View Resume
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px",
            background: "rgba(0, 0, 0, 0.82)",
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Resume viewer"
          onClick={closeViewer}
        >
          <div
            style={{
              position: "relative",
              width: "min(1000px, 96vw)",
              height: "min(92vh, 1000px)",
              background: "#ffffff",
              borderRadius: "18px",
              overflow: "hidden",
              boxShadow:
                "0 24px 70px rgba(0, 0, 0, 0.35)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* Header */}
            <div
              style={{
                flex: "0 0 auto",
                minHeight: "58px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                padding: "10px 14px",
                background: "#ffffff",
                borderBottom:
                  "1px solid rgba(0, 0, 0, 0.08)",
                zIndex: 5,
              }}
            >
              <strong
                style={{
                  color: "#111111",
                  fontSize: "16px",
                  fontWeight: 800,
                }}
              >
                Resume
              </strong>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {(resumeType === "pdf" ||
                  resumeType === "image") && (
                  <>
                    <button
                      type="button"
                      onClick={zoomOut}
                      aria-label="Zoom out"
                      style={{
                        width: "36px",
                        height: "36px",
                        border: 0,
                        borderRadius: "9px",
                        background: "#f1f1f1",
                        color: "#111111",
                        fontSize: "20px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      −
                    </button>

                    <button
                      type="button"
                      onClick={resetZoom}
                      aria-label="Reset zoom"
                      style={{
                        minWidth: "52px",
                        height: "36px",
                        border: 0,
                        borderRadius: "9px",
                        background: "#f1f1f1",
                        color: "#111111",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {Math.round(zoom * 100)}%
                    </button>

                    <button
                      type="button"
                      onClick={zoomIn}
                      aria-label="Zoom in"
                      style={{
                        width: "36px",
                        height: "36px",
                        border: 0,
                        borderRadius: "9px",
                        background: "#f1f1f1",
                        color: "#111111",
                        fontSize: "20px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      +
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={closeViewer}
                  aria-label="Close resume"
                  style={{
                    width: "36px",
                    height: "36px",
                    marginLeft: "4px",
                    border: 0,
                    borderRadius: "50%",
                    background: "#111111",
                    color: "#ffffff",
                    fontSize: "22px",
                    lineHeight: 1,
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* PDF */}
            {resumeType === "pdf" && (
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflow: "auto",
                  WebkitOverflowScrolling: "touch",
                  background: "#e9e9e9",
                  touchAction: "pan-x pan-y pinch-zoom",
                }}
              >
                <div
                  style={{
                    width:
                      zoom === 1
                        ? "100%"
                        : `${zoom * 100}%`,
                    height: "100%",
                    minHeight: "100%",
                    transition:
                      "width 0.15s ease",
                  }}
                >
                  <iframe
                    src={resumeUrl}
                    title="Resume PDF"
                    style={{
                      display: "block",
                      width: "100%",
                      height: "100%",
                      minHeight: "100%",
                      border: 0,
                      background: "#ffffff",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Image */}
            {resumeType === "image" && (
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflow: "auto",
                  display: "flex",
                  alignItems:
                    zoom <= 1
                      ? "center"
                      : "flex-start",
                  justifyContent:
                    zoom <= 1
                      ? "center"
                      : "flex-start",
                  padding: "18px",
                  background: "#eeeeee",
                  WebkitOverflowScrolling:
                    "touch",
                  touchAction:
                    "pan-x pan-y pinch-zoom",
                }}
              >
                <img
                  src={resumeUrl}
                  alt="Resume"
                  draggable={false}
                  style={{
                    display: "block",
                    width:
                      zoom === 1
                        ? "auto"
                        : `${zoom * 100}%`,
                    maxWidth:
                      zoom <= 1 ? "100%" : "none",
                    maxHeight:
                      zoom <= 1 ? "100%" : "none",
                    height: "auto",
                    objectFit: "contain",
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    touchAction:
                      "pan-x pan-y pinch-zoom",
                  }}
                />
              </div>
            )}

            {/* DOC / DOCX */}
            {resumeType === "document" && (
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "30px",
                  background: "#f5f5f5",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "min(460px, 100%)",
                    padding: "30px 24px",
                    borderRadius: "18px",
                    background: "#ffffff",
                    boxShadow:
                      "0 12px 35px rgba(0, 0, 0, 0.10)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "42px",
                      marginBottom: "14px",
                    }}
                  >
                    📄
                  </div>

                  <h3
                    style={{
                      margin: "0 0 10px",
                      color: "#111111",
                      fontSize: "20px",
                    }}
                  >
                    Document Resume
                  </h3>

                  <p
                    style={{
                      margin: "0 0 22px",
                      color: "#666666",
                      fontSize: "14px",
                      lineHeight: 1.6,
                    }}
                  >
                    DOC/DOCX files cannot be
                    reliably rendered inside
                    Android WebView. Open the
                    document with a compatible
                    document viewer.
                  </p>

                  <button
                    type="button"
                    onClick={openDocument}
                    style={{
                      border: 0,
                      borderRadius: "10px",
                      padding:
                        "12px 20px",
                      background:
                        "var(--primary)",
                      color: "#ffffff",
                      fontSize: "14px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Open Document
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}