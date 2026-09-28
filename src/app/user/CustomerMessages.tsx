"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import BookingRequest from "./BookingRequest";

type EnquiryStatus = "new" | "read" | "replied" | "closed";

type Enquiry = {
  _id: string;
  artistId: {
  _id: string;
  name: string;
  category?: string;
  location?: string;
  profilePhoto?: string;
};
  name: string;
  email: string;
  phone?: string;
  eventType?: string;
  message: string;
  status: EnquiryStatus;
  unreadCount?: number;
  createdAt: string;
  updatedAt?: string;
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

export default function CustomerMessages() {
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
  loadEnquiries();
 }, []);

  useEffect(() => {
  const socket = io("http://localhost:3002", {
    transports: ["websocket"],
    withCredentials: true,
  });

    socket.on("connect", () => {
    console.log(
      "BmKalaHub Customer Socket connected:",
      socket.id
    );
  });

    socket.on("connect_error", (error) => {
    console.error(
      "BmKalaHub Customer Socket connection error:",
      error.message
    );
  });

    socket.on("message:new", (incomingMessage: Message) => {
    setMessages((currentMessages) => {
      if (
        currentMessages.some(
          (item) => item._id === incomingMessage._id
        )
      ) {
        return currentMessages;
      }

      if (
        !selectedEnquiry ||
        incomingMessage.enquiryId !== selectedEnquiry._id
      ) {
        return currentMessages;
      }

      return [...currentMessages, incomingMessage];
    });

    if (
      selectedEnquiry &&
      incomingMessage.enquiryId === selectedEnquiry._id &&
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

        socket.on(
      "enquiry:new",
      (incomingEnquiry: {
        _id: string;
        status: EnquiryStatus;
        updatedAt?: string;
      }) => {
        setEnquiries((currentEnquiries) =>
          currentEnquiries.map((enquiry) =>
            enquiry._id === incomingEnquiry._id
              ? {
                  ...enquiry,
                  status: incomingEnquiry.status,
                  updatedAt:
                    incomingEnquiry.updatedAt ??
                    enquiry.updatedAt,
                }
              : enquiry
          )
        );

        setSelectedEnquiry((currentEnquiry) =>
          currentEnquiry &&
          currentEnquiry._id === incomingEnquiry._id
            ? {
                ...currentEnquiry,
                status: incomingEnquiry.status,
                updatedAt:
                  incomingEnquiry.updatedAt ??
                  currentEnquiry.updatedAt,
              }
            : currentEnquiry
        );
      }
    );

    return () => {
    socket.disconnect();
  };
 }, [selectedEnquiry, currentUserId]);

  async function loadEnquiries() {
    try {
      setLoadingEnquiries(true);
      setError("");

      const response = await fetch("/api/enquiries/sent", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load enquiries.");
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

      const loadedMessages: Message[] =
        data.messages || [];

      const currentId = String(
        data.currentUserId || ""
      );

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

      if (unreadMessages.length > 0) {
        setEnquiries((current) =>
          current.map((item) =>
            item._id === enquiry._id
              ? { ...item, unreadCount: 0 }
              : item
          )
        );
        setSelectedEnquiry((current) =>
          current
            ? { ...current, unreadCount: 0 }
            : current
        );
      }
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

    const response = await fetch("/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        enquiryId: selectedEnquiry._id,
        message: text,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessageError(
        data.message || "Failed to send message."
      );
      return;
    }

    setMessageText("");

    // Reload the selected conversation immediately
    // so the newly sent message appears without refresh.
    await selectEnquiry(selectedEnquiry);

    // Refresh enquiry unread/status data.
    await loadEnquiries();
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
    <section className="customer-messages-section">
      <style>{`
        .customer-messages-section {
          margin-top: 28px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 10px 30px rgba(17, 24, 39, 0.05);
        }

        .customer-messages-header {
          margin-bottom: 22px;
        }

        .customer-messages-kicker {
          display: block;
          color: #7c3aed;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 7px;
        }

        .customer-messages-header h2 {
          margin: 0;
          color: #111827;
          font-size: 28px;
          line-height: 1.2;
        }

        .customer-messages-header p {
          margin: 8px 0 0;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.6;
        }

        .customer-messages-alert {
          padding: 12px 14px;
          border-radius: 10px;
          margin-bottom: 16px;
          font-size: 13px;
        }

        .customer-messages-alert-error {
          background: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        }

        .customer-messages-layout {
          display: grid;
          grid-template-columns: 340px minmax(0, 1fr);
          gap: 18px;
          min-width: 0;
        }

        .customer-conversation-list {
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          overflow: hidden;
          background: #fafafa;
          min-width: 0;
        }

        .customer-conversation-list-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 15px 16px;
          border-bottom: 1px solid #e5e7eb;
          background: #ffffff;
        }

        .customer-conversation-list-header strong {
          color: #111827;
          font-size: 14px;
        }

        .customer-conversation-list-header span {
          min-width: 25px;
          height: 25px;
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

        .customer-conversation-items {
          max-height: 520px;
          overflow-y: auto;
        }

        .customer-conversation-item {
          width: 100%;
          display: block;
          text-align: left;
          border: 0;
          border-bottom: 1px solid #eeeeee;
          background: #ffffff;
          padding: 15px;
          cursor: pointer;
          transition: background 0.18s ease;
        }

        .customer-conversation-item:hover {
          background: #f9fafb;
        }

        .customer-conversation-item.active {
          background: #f5f3ff;
        }

        .customer-conversation-item:last-child {
          border-bottom: 0;
        }

        .customer-conversation-item-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }

        .customer-conversation-item-top strong {
          color: #111827;
          font-size: 14px;
          line-height: 1.4;
        }

        .customer-conversation-status {
          flex: 0 0 auto;
          padding: 4px 7px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .customer-status-new {
          background: #eff6ff;
          color: #1d4ed8;
        }

        .customer-status-read {
          background: #f3f4f6;
          color: #4b5563;
        }

        .customer-status-replied {
          background: #ecfdf5;
          color: #047857;
        }

        .customer-status-closed {
          background: #fef2f2;
          color: #b91c1c;
        }

        .customer-conversation-event {
          display: block;
          margin-top: 6px;
          color: #7c3aed;
          font-size: 12px;
          font-weight: 700;
        }

        .customer-artist-category {
          display: block;
          margin-top: 3px;
          color: #6b7280;
          font-size: 11px;
          font-weight: 600;
        }

        .customer-conversation-preview {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-top: 7px;
          color: #6b7280;
          font-size: 12px;
          line-height: 1.5;
        }

        .customer-conversation-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: 9px;
        }

        .customer-conversation-date {
          color: #9ca3af;
          font-size: 10px;
        }

        .customer-unread {
          min-width: 21px;
          height: 21px;
          padding: 0 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: #7c3aed;
          color: #ffffff;
          font-size: 10px;
          font-weight: 800;
        }

        .customer-messages-empty {
          padding: 25px 16px;
          color: #9ca3af;
          font-size: 13px;
          line-height: 1.6;
          text-align: center;
        }

        .customer-conversation-panel {
          min-width: 0;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          overflow: hidden;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          min-height: 520px;
        }

        .customer-panel-header {
          padding: 16px 18px;
          border-bottom: 1px solid #e5e7eb;
          background: #fafafa;
        }

        .customer-panel-header strong {
          display: block;
          color: #111827;
          font-size: 15px;
        }

        .customer-panel-header span {
          display: block;
          margin-top: 4px;
          color: #6b7280;
          font-size: 12px;
        }

        .customer-original-enquiry {
          margin: 15px 18px 0;
          padding: 13px 14px;
          border-radius: 10px;
          background: #f9fafb;
          border: 1px solid #eef0f2;
        }

        .customer-original-label {
          color: #6b7280;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        .customer-original-text {
          margin: 6px 0 0;
          color: #374151;
          font-size: 13px;
          line-height: 1.6;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .customer-message-list {
          flex: 1;
          min-height: 230px;
          max-height: 390px;
          overflow-y: auto;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .customer-message {
          max-width: 78%;
          padding: 10px 13px;
          border-radius: 13px;
          font-size: 13px;
          line-height: 1.55;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .customer-message.mine {
          align-self: flex-end;
          background: #7c3aed;
          color: #ffffff;
          border-bottom-right-radius: 4px;
        }

        .customer-message.theirs {
          align-self: flex-start;
          background: #f3f4f6;
          color: #1f2937;
          border-bottom-left-radius: 4px;
        }

        .customer-message-time {
          display: block;
          margin-top: 5px;
          font-size: 9px;
          opacity: 0.65;
        }

        .customer-message-error {
          margin: 0 18px 10px;
          color: #b91c1c;
          font-size: 12px;
        }

        .customer-composer {
          border-top: 1px solid #e5e7eb;
          padding: 13px;
          display: flex;
          gap: 10px;
          align-items: flex-end;
        }

        .customer-composer textarea {
          flex: 1;
          min-width: 0;
          min-height: 45px;
          max-height: 130px;
          resize: vertical;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          padding: 11px 12px;
          font: inherit;
          font-size: 13px;
          line-height: 1.45;
          outline: none;
        }

        .customer-composer textarea:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
        }

        .customer-send-button {
          flex: 0 0 auto;
          min-height: 45px;
          padding: 0 18px;
          border: 0;
          border-radius: 10px;
          background: #111827;
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .customer-send-button:hover {
          background: #1f2937;
        }

        .customer-send-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        @media (max-width: 800px) {
          .customer-messages-section {
            padding: 20px;
          }

          .customer-messages-layout {
            grid-template-columns: 1fr;
          }

          .customer-conversation-items {
            max-height: 330px;
          }

          .customer-conversation-panel {
            min-height: 500px;
          }
        }

        @media (max-width: 520px) {
          .customer-messages-section {
            margin-top: 20px;
            padding: 15px;
            border-radius: 15px;
          }

          .customer-messages-header h2 {
            font-size: 23px;
          }

          .customer-messages-layout {
            gap: 12px;
          }

          .customer-conversation-panel {
            min-height: 460px;
          }

          .customer-message {
            max-width: 88%;
          }

          .customer-composer {
            padding: 10px;
          }

          .customer-send-button {
            padding: 0 13px;
          }
        }
      `}</style>

      <div className="customer-messages-header">
        <span className="customer-messages-kicker">
          COMMUNICATION
        </span>

        <h2>Messages</h2>

        <p>
          Continue your conversations with artists
          about your enquiries.
        </p>
      </div>

      {error && (
        <div className="customer-messages-alert customer-messages-alert-error">
          {error}
        </div>
      )}

      <div className="customer-messages-layout">
        <aside className="customer-conversation-list">
          <div className="customer-conversation-list-header">
            <strong>My Enquiries</strong>
            <span>{enquiries.length}</span>
          </div>

          {loadingEnquiries ? (
            <div className="customer-messages-empty">
              Loading enquiries...
            </div>
          ) : enquiries.length === 0 ? (
            <div className="customer-messages-empty">
              No enquiries available yet.
              <br />
              Discover an artist to start a conversation.
            </div>
          ) : (
            <div className="customer-conversation-items">
              {enquiries.map((enquiry) => (
                <button
                  key={enquiry._id}
                  type="button"
                  className={`customer-conversation-item ${
                    selectedEnquiry?._id === enquiry._id
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    selectEnquiry(enquiry)
                  }
                >
                  <div className="customer-conversation-item-top">
                  <strong>
                    {enquiry.artistId?.name || "Artist"}
                  </strong>

                    <span
                      className={`customer-conversation-status customer-status-${enquiry.status}`}
                    >
                      {enquiry.status}
                    </span>
                  </div>

                  <span className="customer-conversation-event">
                    {enquiry.eventType ||
                      "General enquiry"}
                  </span>

                  {enquiry.artistId?.category && (
                  <span className="customer-artist-category">
                  {enquiry.artistId.category}
                  </span>
                )}

                  <span className="customer-conversation-preview">
                    {enquiry.message}
                  </span>

                  <div className="customer-conversation-meta">
                    <span className="customer-conversation-date">
                      {formatDate(enquiry.createdAt)}
                    </span>

                    {(enquiry.unreadCount ?? 0) > 0 && (
                      <span className="customer-unread">
                        {enquiry.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </aside>

        <div className="customer-conversation-panel">
          {!selectedEnquiry ? (
            <div className="customer-messages-empty">
              Select an enquiry to view the conversation.
            </div>
          ) : (
            <>
              <div className="customer-panel-header">
              <strong>
               {selectedEnquiry.artistId?.name || "Artist"}
              </strong>

            <span>
               {selectedEnquiry.artistId?.category || "Artist"}{" "}
              ·{" "}
               {selectedEnquiry.status}
            </span>
              </div>

              <div className="customer-original-enquiry">
                <span className="customer-original-label">
                  Original Enquiry
                </span>

                <p className="customer-original-text">
                  {selectedEnquiry.message}
                </p>
              </div>

               <BookingRequest
               enquiryId={selectedEnquiry._id}
               eventType={selectedEnquiry.eventType}
              />  

              <div className="customer-message-list">
                {loadingMessages ? (
                  <div className="customer-messages-empty">
                    Loading conversation...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="customer-messages-empty">
                    No messages yet.
                  </div>
                ) : (
                  messages.map((item) => {
                    const mine =
                      String(item.senderId) ===
                      currentUserId;

                    return (
                      <div
                        key={item._id}
                        className={`customer-message ${
                          mine ? "mine" : "theirs"
                        }`}
                      >
                        {item.message}

                        <span className="customer-message-time">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {messageError && (
                <div className="customer-message-error">
                  {messageError}
                </div>
              )}

              <div className="customer-composer">
                <textarea
                  value={messageText}
                  onChange={(event) =>
                    setMessageText(event.target.value)
                  }
                  onKeyDown={handleMessageKeyDown}
                  placeholder="Write a message..."
                  maxLength={3000}
                  disabled={sending}
                />

                <button
                  type="button"
                  className="customer-send-button"
                  onClick={sendMessage}
                  disabled={
                    sending ||
                    !messageText.trim()
                  }
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}