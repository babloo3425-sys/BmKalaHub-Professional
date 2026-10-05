"use client";

import { useEffect, useState } from "react";

type ResumeViewerProps = {
  resumeUrl: string;
};

function getFileType(url: string): "pdf" | "image" | "unknown" {
  const cleanUrl = url.split("?")[0].toLowerCase();

  if (cleanUrl.includes(".pdf")) {
    return "pdf";
  }

  if (
    cleanUrl.includes(".jpg") ||
    cleanUrl.includes(".jpeg") ||
    cleanUrl.includes(".png") ||
    cleanUrl.includes(".webp")
  ) {
    return "image";
  }

  return "unknown";
}

export default function ResumeViewer({
  resumeUrl,
}: ResumeViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const fileType = getFileType(resumeUrl);

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

  function closeViewer() {
    setIsOpen(false);
  }

  return (
    <>
      <button
        type="button"
        className="public-action primary"
        onClick={() => setIsOpen(true)}
      >
        View Resume
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Resume viewer"
          onClick={closeViewer}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(0, 0, 0, 0.88)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px",
            boxSizing: "border-box",
          }}
        >
          <button
            type="button"
            onClick={closeViewer}
            aria-label="Close resume"
            style={{
              position: "fixed",
              top: "14px",
              right: "14px",
              zIndex: 100001,
              width: "42px",
              height: "42px",
              border: 0,
              borderRadius: "50%",
              background: "#ffffff",
              color: "#111111",
              fontSize: "28px",
              lineHeight: 1,
              cursor: "pointer",
              boxShadow:
                "0 4px 18px rgba(0, 0, 0, 0.35)",
            }}
          >
            ×
          </button>

          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "1100px",
              height: "calc(100vh - 24px)",
              background: "#ffffff",
              borderRadius: "14px",
              overflow: "hidden",
              boxShadow:
                "0 24px 80px rgba(0, 0, 0, 0.45)",
            }}
          >
            {fileType === "pdf" && (
              <iframe
                src={`${resumeUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                title="Resume PDF"
                style={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                  border: 0,
                  background: "#ffffff",
                }}
              />
            )}

            {fileType === "image" && (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  overflow: "auto",
                  WebkitOverflowScrolling: "touch",
                  touchAction: "pan-x pan-y pinch-zoom",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#111111",
                }}
              >
                <img
                  src={resumeUrl}
                  alt="Resume"
                  draggable={false}
                  style={{
                    display: "block",
                    maxWidth: "none",
                    width: "auto",
                    height: "auto",
                    minWidth: "100%",
                    minHeight: "100%",
                    objectFit: "contain",
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    touchAction:
                      "pan-x pan-y pinch-zoom",
                  }}
                />
              </div>
            )}

            {fileType === "unknown" && (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "24px",
                  boxSizing: "border-box",
                  textAlign: "center",
                  color: "#222222",
                  background: "#ffffff",
                  fontSize: "16px",
                  fontWeight: 700,
                }}
              >
                This resume format is not supported.
                Please upload a PDF or image resume.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}