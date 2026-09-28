"use client";

import { FormEvent, useState } from "react";

type EnquiryFormProps = {
  artistId: string;
};

export default function EnquiryForm({
  artistId,
}: EnquiryFormProps) {
  const [phone, setPhone] = useState("");
  const [eventType, setEventType] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!message.trim()) {
      setResult({
        type: "error",
        message: "Please enter your message.",
      });
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          artistId,
          phone: phone.trim(),
          eventType: eventType.trim(),
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResult({
          type: "error",
          message: data.message || "Failed to send enquiry.",
        });
        return;
      }

      setPhone("");
      setEventType("");
      setMessage("");

      setResult({
        type: "success",
        message: "Your enquiry has been sent successfully.",
      });
    } catch {
      setResult({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <section
      aria-labelledby="enquiry-title"
      style={{
        marginTop: "32px",
        padding: "28px",
        border: "1px solid #e5e7eb",
        borderRadius: "18px",
        background: "#ffffff",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <h2
          id="enquiry-title"
          style={{
            margin: 0,
            fontSize: "24px",
            lineHeight: 1.2,
          }}
        >
          Send an Enquiry
        </h2>

        <p
          style={{
            margin: "8px 0 0",
            color: "#6b7280",
            fontSize: "14px",
            lineHeight: 1.6,
          }}
        >
          Contact this artist directly about your project or event.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "16px",
          }}
        >
          <div>
            <label
              htmlFor="enquiry-event-type"
              style={{
                display: "block",
                marginBottom: "7px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Event Type
            </label>

            <input
              id="enquiry-event-type"
              type="text"
              value={eventType}
              onChange={(event) => setEventType(event.target.value)}
              placeholder="Example: Theatre show"
              maxLength={100}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 14px",
                border: "1px solid #d1d5db",
                borderRadius: "10px",
                fontSize: "14px",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="enquiry-phone"
              style={{
                display: "block",
                marginBottom: "7px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Phone
            </label>

            <input
              id="enquiry-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Your phone number"
              maxLength={30}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 14px",
                border: "1px solid #d1d5db",
                borderRadius: "10px",
                fontSize: "14px",
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: "16px" }}>
          <label
            htmlFor="enquiry-message"
            style={{
              display: "block",
              marginBottom: "7px",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Message
          </label>

          <textarea
            id="enquiry-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Tell the artist about your project, event, dates, requirements, etc."
            maxLength={3000}
            required
            rows={6}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px 14px",
              border: "1px solid #d1d5db",
              borderRadius: "10px",
              fontSize: "14px",
              lineHeight: 1.6,
              resize: "vertical",
            }}
          />

          <div
            style={{
              marginTop: "5px",
              textAlign: "right",
              fontSize: "12px",
              color: "#6b7280",
            }}
          >
            {message.length}/3000
          </div>
        </div>

        {result && (
          <div
            role="status"
            style={{
              marginTop: "14px",
              padding: "11px 13px",
              borderRadius: "9px",
              fontSize: "14px",
              background:
                result.type === "success" ? "#ecfdf5" : "#fef2f2",
              color:
                result.type === "success" ? "#047857" : "#b91c1c",
            }}
          >
            {result.message}
          </div>
        )}

        <button
          type="submit"
          disabled={sending}
          style={{
            marginTop: "18px",
            width: "100%",
            padding: "13px 18px",
            border: 0,
            borderRadius: "10px",
            background: "#111827",
            color: "#ffffff",
            fontSize: "15px",
            fontWeight: 600,
            cursor: sending ? "not-allowed" : "pointer",
            opacity: sending ? 0.7 : 1,
          }}
        >
          {sending ? "Sending..." : "Send Enquiry"}
        </button>
      </form>

      <style jsx>{`
        @media (max-width: 600px) {
          section {
            padding: 20px !important;
            border-radius: 14px !important;
          }

          section > div:first-child h2 {
            font-size: 21px !important;
          }

          form > div:first-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}