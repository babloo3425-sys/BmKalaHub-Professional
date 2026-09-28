"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

type EnquiryStatus = "new" | "read" | "replied" | "closed";

type Enquiry = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  eventType?: string;
  message: string;
  status: EnquiryStatus;
  unreadCount?: number;
  createdAt: string;
};

type Message = {
  _id: string;
  enquiryId: string;
  senderId: string;
  receiverId: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function Messages() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [selectedEnquiry, setSelectedEnquiry] =
    useState<Enquiry | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");

  const [loadingEnquiries, setLoadingEnquiries] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");
  const [messageError, setMessageError] = useState("");

  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
  const socket = io("http://localhost:3002", {
    transports: ["websocket"],
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("BmKalaHub Socket connected:", socket.id);
  });

  socket.on("connect_error", (error) => {
    console.error(
      "BmKalaHub Socket connection error:",
      error.message
    );
  });

  socket.on("message:new", (incomingMessage: Message) => {
    if (
      !selectedEnquiry ||
      incomingMessage.enquiryId !== selectedEnquiry._id
    ) {
      return;
    }

     

    setMessages((currentMessages) => {
      if (
        currentMessages.some(
          (item) => item._id === incomingMessage._id
        )
      ) {
        return currentMessages;
      }

      return [...currentMessages, incomingMessage];
    });

    if (
      String(incomingMessage.receiverId) === currentUserId
    ) {
      fetch(`/api/messages/${incomingMessage._id}`, {
        method: "PATCH",
      }).catch((error) => {
        console.error(
          "Mark realtime message as read error:",
          error
        );
      });
    }
  });

    socket.on("enquiry:new", (incomingEnquiry: Enquiry) => {
    setEnquiries((currentEnquiries) => {
      const existingIndex = currentEnquiries.findIndex(
        (item) => item._id === incomingEnquiry._id
      );

      if (existingIndex === -1) {
        return [incomingEnquiry, ...currentEnquiries];
      }

      const updated = [...currentEnquiries];

      updated[existingIndex] = {
        ...updated[existingIndex],
        ...incomingEnquiry,
      };

      return updated;
    });
  });

  return () => {
    socket.disconnect();
  };
}, [selectedEnquiry, currentUserId]);

  useEffect(() => {
    loadEnquiries();
  }, []);

  async function loadEnquiries() {
    try {
      setLoadingEnquiries(true);
      setError("");

      const response = await fetch(
        "/api/enquiries/received",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to load enquiries."
        );
        return;
      }

      setEnquiries(data.enquiries || []);
    } catch {
      setError(
        "Something went wrong while loading enquiries."
      );
    } finally {
      setLoadingEnquiries(false);
    }
  }

  async function selectEnquiry(enquiry: Enquiry) {
    setSelectedEnquiry(enquiry);
    setMessages([]);
    setMessageError("");
    setMessageText("");

    try {
      setLoadingMessages(true);

      const response = await fetch(
        `/api/messages?enquiryId=${encodeURIComponent(
          enquiry._id
        )}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessageError(
          data.message || "Failed to load messages."
        );
        return;
      }

      const loadedMessages: Message[] = data.messages || [];

      const currentId = String(data.currentUserId || "");

     setMessages(loadedMessages);
     setCurrentUserId(currentId);

      const unreadMessages = loadedMessages.filter(
      (item) =>
    !item.read &&
    String(item.receiverId) === currentId
   );

     await Promise.all(
     unreadMessages.map((item) =>
     fetch(`/api/messages/${item._id}`, {
      method: "PATCH",
    })
   )
  );
    } catch {
      setMessageError(
        "Something went wrong while loading messages."
      );
    } finally {
      setLoadingMessages(false);
    }
  }

  async function sendMessage() {
    const text = messageText.trim();

    if (!selectedEnquiry || !text || sending) {
      return;
    }

    if (text.length > 3000) {
      setMessageError(
        "Message cannot exceed 3000 characters."
      );
      return;
    }

    try {
      setSending(true);
      setMessageError("");

      const response = await fetch(
        "/api/messages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            enquiryId: selectedEnquiry._id,
            message: text,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessageError(
          data.message || "Failed to send message."
        );
        return;
      }

      if (data.data) {
        setMessages((current) => [
          ...current,
          data.data,
        ]);
      }

      setMessageText("");
    } catch {
      setMessageError(
        "Something went wrong while sending the message."
      );
    } finally {
      setSending(false);
    }
  }

  function handleMessageKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString();
  }

  return (
    <section className="messages-section">
      <div className="messages-header">
        <div>
          <span className="messages-kicker">
            COMMUNICATION
          </span>

          <h2>Messages</h2>

          <p>
            Continue conversations with people who
            contacted you.
          </p>
        </div>
      </div>

      {error && (
        <div className="messages-alert messages-alert-error">
          {error}
        </div>
      )}

      <div className="messages-layout">
        <aside className="conversation-list">
          <div className="conversation-list-header">
            <strong>Enquiries</strong>
            <span>{enquiries.length}</span>
          </div>

          {loadingEnquiries ? (
            <div className="messages-empty">
              Loading enquiries...
            </div>
          ) : enquiries.length === 0 ? (
            <div className="messages-empty">
              No enquiries available yet.
            </div>
          ) : (
            <div className="conversation-items">
              {enquiries.map((enquiry) => (
                <button
                  key={enquiry._id}
                  type="button"
                  className={`conversation-item ${
                    selectedEnquiry?._id === enquiry._id
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    selectEnquiry(enquiry)
                  }
                >
                  <div className="conversation-item-top">
                    <strong>{enquiry.name}</strong>

                    <span
                      className={`conversation-status status-${enquiry.status}`}
                    >
                      {enquiry.status}
                    </span>
                  </div>

                  <span className="conversation-event">
                    {enquiry.eventType ||
                      "General enquiry"}
                  </span>

                  <span className="conversation-preview">
                    {enquiry.message}
                  </span>

                  <span className="conversation-date">
                    {formatDate(enquiry.createdAt)}
                  </span>

                  {(enquiry.unreadCount ?? 0) > 0 && (
                  <span className="conversation-unread">
                  {enquiry.unreadCount} unread
                </span>
                )}
                </button>
              ))}
            </div>
          )}
        </aside>

        <div className="conversation-panel">
          {!selectedEnquiry ? (
            <div className="conversation-placeholder">
              <div className="placeholder-icon">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5v-8Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h3>Select an enquiry</h3>

              <p>
                Choose an enquiry from the left to view
                and continue the conversation.
              </p>
            </div>
          ) : (
            <>
              <div className="conversation-panel-header">
                <div>
                  <strong>
                    {selectedEnquiry.name}
                  </strong>

                  <span>
                    {selectedEnquiry.email}
                  </span>
                </div>

                <span
                  className={`conversation-status status-${selectedEnquiry.status}`}
                >
                  {selectedEnquiry.status}
                </span>
              </div>

              <div className="original-enquiry">
                <span>Original enquiry</span>
                <p>{selectedEnquiry.message}</p>
              </div>

              <div className="message-list">
                {loadingMessages ? (
                  <div className="messages-empty">
                    Loading messages...
                  </div>
                ) : messageError && messages.length === 0 ? (
                  <div className="messages-alert messages-alert-error">
                    {messageError}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="messages-empty">
                    No messages yet. Start the
                    conversation below.
                  </div>
                ) : (
                  messages.map((item) => (
                    <div
                       key={item._id}
                       className={`message-row ${
                       item.senderId === currentUserId
                      ? "message-row-own"
                      : "message-row-other"
                  }`}
                 >
                       <div className="message-bubble">
                        <p>{item.message}</p>

                        <span>
                          {formatDate(
                            item.createdAt
                          )}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {messageError && (
                <div className="messages-alert messages-alert-error">
                  {messageError}
                </div>
              )}

              <div className="message-composer">
                <textarea
                  value={messageText}
                  onChange={(event) =>
                    setMessageText(
                      event.target.value
                    )
                  }
                  onKeyDown={handleMessageKeyDown}
                  placeholder="Write your message..."
                  maxLength={3000}
                  rows={3}
                  disabled={sending}
                  aria-label="Message"
                />

                <div className="composer-bottom">
                  <span>
                    {messageText.length} / 3000
                  </span>

                  <button
                    type="button"
                    onClick={sendMessage}
                    disabled={
                      sending ||
                      !messageText.trim()
                    }
                  >
                    {sending
                      ? "Sending..."
                      : "Send Message"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .messages-section {
          margin-top: 28px;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          background: #ffffff;
          overflow: hidden;
        }

        .messages-header {
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .messages-kicker {
          display: inline-block;
          margin-bottom: 7px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: #6b7280;
        }

        .messages-header h2 {
          margin: 0;
          font-size: 24px;
          line-height: 1.2;
          color: #111827;
        }

        .messages-header p {
          margin: 7px 0 0;
          color: #6b7280;
          font-size: 14px;
        }

        .messages-layout {
          display: grid;
          grid-template-columns: 340px minmax(0, 1fr);
          min-height: 620px;
        }

        .conversation-list {
          border-right: 1px solid #e5e7eb;
          min-width: 0;
        }

        .conversation-list-header {
          height: 58px;
          padding: 0 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e5e7eb;
        }

        .conversation-list-header strong {
          font-size: 14px;
          color: #111827;
        }

        .conversation-list-header span {
          min-width: 28px;
          height: 28px;
          padding: 0 7px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: #f3f4f6;
          color: #374151;
          font-size: 12px;
          font-weight: 700;
        }

        .conversation-items {
          display: flex;
          flex-direction: column;
        }

        .conversation-item {
          width: 100%;
          padding: 16px 18px;
          border: 0;
          border-bottom: 1px solid #f0f1f3;
          background: #ffffff;
          text-align: left;
          cursor: pointer;
          transition: background 0.18s ease;
        }

        .conversation-item:hover,
        .conversation-item.active {
          background: #f8fafc;
        }

        .conversation-item.active {
          box-shadow: inset 3px 0 0 #111827;
        }

        .conversation-item-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .conversation-item-top strong {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #111827;
          font-size: 14px;
        }

        .conversation-status {
          flex-shrink: 0;
          padding: 4px 8px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .status-new {
          background: #fef3c7;
          color: #92400e;
        }

        .status-read {
          background: #e0f2fe;
          color: #075985;
        }

        .status-replied {
          background: #dcfce7;
          color: #166534;
        }

        .status-closed {
          background: #f3f4f6;
          color: #4b5563;
        }

        .conversation-event {
          display: block;
          margin-top: 7px;
          color: #374151;
          font-size: 12px;
          font-weight: 600;
        }

        .conversation-preview {
          display: -webkit-box;
          margin-top: 5px;
          overflow: hidden;
          color: #6b7280;
          font-size: 12px;
          line-height: 1.5;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .conversation-date {
          display: block;
          margin-top: 8px;
          color: #9ca3af;
          font-size: 10px;
        }

        .conversation-unread {
          display: inline-block;
          margin-top: 7px;
          padding: 3px 7px;
          border-radius: 999px;
          background: #111827;
          color: #ffffff;
          font-size: 9px;
          font-weight: 700;
        }

        .conversation-panel {
          min-width: 0;
          display: flex;
          flex-direction: column;
          background: #ffffff;
        }

        .conversation-panel-header {
          min-height: 68px;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          border-bottom: 1px solid #e5e7eb;
        }

        .conversation-panel-header div {
          min-width: 0;
        }

        .conversation-panel-header strong {
          display: block;
          color: #111827;
          font-size: 15px;
        }

        .conversation-panel-header span:not(.conversation-status) {
          display: block;
          margin-top: 3px;
          overflow: hidden;
          color: #6b7280;
          font-size: 12px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .original-enquiry {
          margin: 18px 20px 0;
          padding: 14px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #f9fafb;
        }

        .original-enquiry > span {
          display: block;
          margin-bottom: 6px;
          color: #6b7280;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .original-enquiry p {
          margin: 0;
          color: #374151;
          font-size: 13px;
          line-height: 1.6;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .message-list {
          flex: 1;
          min-height: 260px;
          max-height: 380px;
          overflow-y: auto;
          padding: 20px;
        }

        .message-row {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 12px;
        }

        .message-row-other {
          justify-content: flex-start;
        }

        .message-row-own {
          justify-content: flex-end;
        }

        .message-bubble {
          max-width: min(75%, 600px);
          padding: 11px 14px;
          border-radius: 14px 14px 4px 14px;
          background: #111827;
          color: #ffffff;
        }

        .message-bubble p {
          margin: 0;
          font-size: 13px;
          line-height: 1.6;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .message-bubble span {
          display: block;
          margin-top: 6px;
          font-size: 9px;
          opacity: 0.65;
          text-align: right;
        }

        .message-composer {
          padding: 15px 20px 18px;
          border-top: 1px solid #e5e7eb;
        }

        .message-composer textarea {
          width: 100%;
          min-height: 80px;
          resize: vertical;
          padding: 12px 14px;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          outline: none;
          background: #ffffff;
          color: #111827;
          font: inherit;
          font-size: 13px;
          box-sizing: border-box;
        }

        .message-composer textarea:focus {
          border-color: #111827;
        }

        .composer-bottom {
          margin-top: 9px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .composer-bottom span {
          color: #9ca3af;
          font-size: 11px;
        }

        .composer-bottom button {
          min-height: 40px;
          padding: 0 18px;
          border: 0;
          border-radius: 9px;
          background: #111827;
          color: #ffffff;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .composer-bottom button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .messages-empty {
          padding: 35px 20px;
          color: #9ca3af;
          font-size: 12px;
          text-align: center;
        }

        .conversation-placeholder {
          flex: 1;
          min-height: 500px;
          padding: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .placeholder-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: #f3f4f6;
          color: #374151;
        }

        .placeholder-icon svg {
          width: 24px;
          height: 24px;
        }

        .conversation-placeholder h3 {
          margin: 16px 0 6px;
          color: #111827;
          font-size: 16px;
        }

        .conversation-placeholder p {
          max-width: 380px;
          margin: 0;
          color: #6b7280;
          font-size: 13px;
          line-height: 1.6;
        }

        .messages-alert {
          margin: 12px 20px 0;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 12px;
        }

        .messages-alert-error {
          background: #fef2f2;
          color: #b91c1c;
        }

        @media (max-width: 900px) {
          .messages-layout {
            grid-template-columns: 280px minmax(0, 1fr);
          }

          .message-bubble {
            max-width: 85%;
          }
        }

        @media (max-width: 700px) {
          .messages-header {
            padding: 20px 16px;
          }

          .messages-layout {
            display: flex;
            flex-direction: column;
            min-height: 0;
          }

          .conversation-list {
            border-right: 0;
            border-bottom: 1px solid #e5e7eb;
          }

          .conversation-items {
            max-height: 280px;
            overflow-y: auto;
          }

          .conversation-panel {
            min-height: 500px;
          }

          .conversation-panel-header {
            padding: 14px 16px;
          }

          .original-enquiry {
            margin-left: 16px;
            margin-right: 16px;
          }

          .message-list {
            padding: 16px;
            max-height: 360px;
          }

          .message-composer {
            padding-left: 16px;
            padding-right: 16px;
          }

          .message-bubble {
            max-width: 90%;
          }

          .conversation-placeholder {
            min-height: 380px;
            padding: 30px 20px;
          }
        }

        @media (max-width: 480px) {
          .conversation-item-top {
            align-items: flex-start;
          }

          .conversation-status {
            font-size: 9px;
          }

          .conversation-panel-header {
            align-items: flex-start;
          }

          .conversation-panel-header .conversation-status {
            margin-top: 2px;
          }

          .composer-bottom {
            align-items: flex-end;
          }

          .composer-bottom button {
            min-height: 38px;
            padding: 0 14px;
          }
        }
      `}</style>
    </section>
  );
}