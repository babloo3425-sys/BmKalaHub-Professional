"use client";

import { useState } from "react";

type ResumeViewerProps = {
  resumeUrl: string;
};

export default function ResumeViewer({
  resumeUrl,
}: ResumeViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

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
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            background: "rgba(0, 0, 0, 0.78)",
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Resume viewer"
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{
              position: "relative",
              width: "min(900px, 94vw)",
              height: "min(90vh, 900px)",
              background: "#ffffff",
              borderRadius: "18px",
              overflow: "hidden",
              boxShadow:
                "0 24px 70px rgba(0, 0, 0, 0.3)",
            }}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close resume"
              style={{
                position: "absolute",
                top: "12px",
                right: "14px",
                zIndex: 2,
                width: "36px",
                height: "36px",
                border: 0,
                borderRadius: "50%",
                background: "#ffffff",
                color: "#111111",
                fontSize: "24px",
                lineHeight: 1,
                cursor: "pointer",
                boxShadow:
                  "0 4px 14px rgba(0, 0, 0, 0.18)",
              }}
            >
              ×
            </button>

            <iframe
              src={resumeUrl}
              title="Resume"
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                border: 0,
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}