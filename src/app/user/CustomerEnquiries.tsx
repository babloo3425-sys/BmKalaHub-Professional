"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

type EnquiryStatus = "new" | "read" | "replied" | "closed";

type Enquiry = {
  _id: string;
  artistId: {
    _id: string;
    name: string;
    category?: string;
  } | null;
  eventType?: string;
  message: string;
  status: EnquiryStatus;
  createdAt: string;
};

type Props = {
  initialEnquiries: Enquiry[];
};

export default function CustomerEnquiries({
  initialEnquiries,
}: Props) {
  const [enquiries, setEnquiries] =
    useState<Enquiry[]>(initialEnquiries);

  useEffect(() => {
    const socket = io("http://localhost:3002", {
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log(
        "BmKalaHub Customer Enquiry Socket connected:",
        socket.id
      );
    });

    socket.on("connect_error", (error) => {
      console.error(
        "BmKalaHub Customer Enquiry Socket connection error:",
        error.message
      );
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
                  createdAt: enquiry.createdAt,
                }
              : enquiry
          )
        );
      }
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  if (enquiries.length === 0) {
    return (
      <p className="empty-state">
        You have not sent any enquiries yet.
      </p>
    );
  }

  return (
    <div className="enquiry-list">
      {enquiries.map((enquiry) => {
        const artist = enquiry.artistId;

        return (
          <div
            className="enquiry-item"
            key={String(enquiry._id)}
          >
            <div className="item-top">
              <div>
                <p className="item-title">
                  {artist?.name || "Artist"}
                </p>

                <p className="item-meta">
                  {artist?.category || "Artist"}
                </p>
              </div>

              <span
                className={`status-badge status-${enquiry.status}`}
              >
                {enquiry.status}
              </span>
            </div>

            <p className="item-event">
              {enquiry.eventType || "General enquiry"}
            </p>

            <p className="item-message">
              {enquiry.message}
            </p>

            <p className="item-date">
              {new Date(
                enquiry.createdAt
              ).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
          </div>
        );
      })}
    </div>
  );
}