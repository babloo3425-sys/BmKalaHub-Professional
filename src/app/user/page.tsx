import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";
import User from "@/models/User";
import Enquiry from "@/models/Enquiry";
import Message from "@/models/Message";
import Booking from "@/models/Booking";
import Notification from "@/models/Notification";
import LogoutButton from "../dashboard/LogoutButton";
import CustomerMessages from "./CustomerMessages";
import CustomerEnquiries from "./CustomerEnquiries";
import CustomerBookings from "./CustomerBookings";
import RealtimeNotifications from "./RealtimeNotifications";

export const dynamic = "force-dynamic";

export default async function UserPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    redirect("/login");
  }

  const userId = await verifyAuthToken(token);

  if (!userId) {
    redirect("/login");
  }

  await connectDB();

  const user = await User.findById(userId)
  .select("name email role accountType")
  .lean();

  if (!user) {
  redirect("/login");
}

if (user.role === "admin") {
  redirect("/admin");
}

if (user.accountType !== "customer") {
  redirect("/dashboard");
}

const enquiries = await Enquiry.find({
    senderId: userId,
  })
    .populate({
      path: "artistId",
      select: "name category location profilePhoto",
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const messages = await Message.find({
    $or: [
      { senderId: userId },
      { receiverId: userId },
    ],
  })
    .populate({
      path: "enquiryId",
      populate: {
        path: "artistId",
        select: "name category location profilePhoto",
      },
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const unreadMessages = await Message.countDocuments({
    receiverId: userId,
    read: false,
  });

  const newEnquiries = await Enquiry.countDocuments({
    senderId: userId,
    status: "new",
  });

  const repliedEnquiries = await Enquiry.countDocuments({
    senderId: userId,
    status: "replied",
  });

  const totalEnquiries = await Enquiry.countDocuments({
    senderId: userId,
  });

   const bookings = await Booking.find({
  customerId: userId,
})
  .populate({
    path: "artistId",
    select: "name category location profilePhoto",
  })
  .sort({ createdAt: -1 })
  .lean();

  const notifications = await Notification.find({
  userId,
})
  .select(
    "_id type title message enquiryId messageId read createdAt"
  )
  .sort({ createdAt: -1 })
  .limit(5)
  .lean();

const unreadNotifications = await Notification.countDocuments({
  userId,
  read: false,
});

  return (
    <main className="user-page">
      <style>{`
        .user-page {
          min-height: 100vh;
          background: #f7f8fa;
          color: #111827;
          font-family: Arial, sans-serif;
        }

        .user-header {
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          padding: 14px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .user-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: inherit;
        }

        .user-logo {
          width: 44px;
          height: 44px;
          object-fit: contain;
          border-radius: 50%;
        }

        .user-brand-name {
          font-size: 22px;
          font-weight: 700;
        }

        .user-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .header-button {
          border: 1px solid #d1d5db;
          background: #ffffff;
          color: #111827;
          text-decoration: none;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
        }

        .header-button:hover {
          background: #f9fafb;
        }

        .user-content {
          max-width: 1180px;
          margin: 0 auto;
          padding: 40px 20px 70px;
        }

        .user-kicker {
          margin: 0 0 8px;
          color: #6b7280;
          font-size: 14px;
          font-weight: 600;
        }

        .user-title {
          margin: 0;
          font-size: 34px;
          line-height: 1.2;
        }

        .user-subtitle {
          margin: 10px 0 0;
          color: #6b7280;
          font-size: 16px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-top: 30px;
        }

        .stat-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 20px;
        }

        .stat-label {
          margin: 0;
          color: #6b7280;
          font-size: 13px;
        }

        .stat-value {
          margin: 8px 0 0;
          font-size: 28px;
          font-weight: 700;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 24px;
        }

        .dashboard-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 24px;
        }

        .dashboard-card h2 {
          margin: 0;
          font-size: 20px;
        }

        .dashboard-card-description {
          margin: 7px 0 20px;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.6;
        }

        .account-details {
          display: grid;
          gap: 12px;
        }

        .account-row {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f0f1f3;
          font-size: 14px;
        }

        .account-row:last-child {
          padding-bottom: 0;
          border-bottom: none;
        }

        .account-label {
          color: #6b7280;
        }

        .account-value {
          font-weight: 600;
          text-align: right;
          overflow-wrap: anywhere;
        }

        .section-link {
          display: inline-block;
          margin-top: 18px;
          color: #5b21b6;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .section-link:hover {
          color: #7c3aed;
          text-decoration: underline;
      }

        .enquiry-list,
        .message-list {
          display: grid;
          gap: 12px;
        }

        .enquiry-item,
        .message-item {
          border: 1px solid #eef0f2;
          border-radius: 10px;
          padding: 14px;
        }

        .item-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
        }

        .item-title {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
        }

        .item-meta {
          margin: 5px 0 0;
          color: #6b7280;
          font-size: 12px;
        }

        .item-message {
          margin: 10px 0 0;
          color: #4b5563;
          font-size: 13px;
          line-height: 1.55;
        }

        .status {
          display: inline-flex;
          align-items: center;
          padding: 5px 8px;
          border-radius: 999px;
          background: #f3f4f6;
          color: #374151;
          font-size: 11px;
          font-weight: 700;
          text-transform: capitalize;
          white-space: nowrap;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 52px;
          height: 22px;
          padding: 0 8px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 600;
          line-height: 1;
          text-transform: uppercase;
          white-space: nowrap;
          box-sizing: border-box;
       }

        .status-badge.status-new {
          background: #fff7df;
          color: #a16207;
        }

        .status-badge.status-read {
          background: #eef6ff;
          color: #2563a8;
        }

        .status-badge.status-replied {
          background: #eaf8f0;
          color: #047857;
        }

        .status-badge.status-closed {
          background: #fff0f0;
          color: #b91c1c;
        }

        .message-unread {
          border-left: 3px solid #111827;
        }

        .empty-state {
          padding: 18px 0 4px;
          color: #6b7280;
          font-size: 14px;
        }

        .quick-actions {
          margin-top: 24px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .action-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          padding: 0 18px;
          border-radius: 8px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
          box-sizing: border-box;
        }

        .action-primary {
          background: #111827;
          color: #ffffff;
        }

        .action-secondary {
          background: #ffffff;
          color: #111827;
          border: 1px solid #d1d5db;
        }

        .logout-area {
          margin-top: 24px;
        }

        .logout-area .join-button {
          min-width: 120px;
          min-height: 44px;
          padding: 0 20px;
          border: 1px solid #d1d5db;
          border-radius: 9px;
          background: #ffffff;
          color: #111827;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition:
          background 0.2s ease,
          border-color 0.2s ease,
          color 0.2s ease,
          box-shadow 0.2s ease;
        }

        .logout-area .join-button:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #9ca3af;
          box-shadow: 0 3px 10px rgba(17, 24, 39, 0.08);
        
        }

        .logout-area .join-button:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }
        @media (max-width: 850px) {
          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .user-header {
           padding: 10px 10px;
           gap: 6px;
          }

          .user-logo {
            width: 36px;
            height: 36px;
          }

          .user-brand {
            display: flex;
            align-items: center;
            gap: 6px;
            flex: 0 0 auto;
            min-width: 0;
          }

          .user-brand-name {
            font-size: 15px;
            white-space: nowrap;
            overflow: visible;
            text-overflow: clip;
            flex: 0 0 auto;
          } 

          .user-header-actions {
            gap: 6px;
          }

          .user-header-actions {
            flex: 0 0 auto;
            margin-left: auto;
         }

          .header-button {
            padding: 7px 7px;
            font-size: 11px;
            white-space: nowrap;
         }

          .user-content {
            padding: 28px 14px 45px;
          }

          .user-title {
            font-size: 28px;
          }

          .user-subtitle {
            font-size: 14px;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .stat-card {
            padding: 16px;
          }

          .stat-value {
            font-size: 24px;
          }

          .dashboard-card {
            padding: 18px;
          }

          .account-row {
            display: grid;
            gap: 4px;
          }

          .account-value {
            text-align: left;
          }

          .item-top {
            gap: 8px;
          }

          .quick-actions {
            display: grid;
          }

          .logout-area {
            margin-top: 22px;
          }

         .logout-area .join-button {
           width: 120px;
          }

          .action-button {
            width: 100%;
          }
        }
      `}</style>

      <header className="user-header">
        <a href="/" className="user-brand">
          <img
            src="/BmKalaHub.png"
            alt="BmKalaHub"
            className="user-logo"
          />
          <span className="user-brand-name">BmKalaHub</span>
        </a>

        <div className="user-header-actions">
        <a href="/artists" className="header-button">
             Discover Artists
        </a>
       </div>
      </header>

      <section className="user-content">
        <p className="user-kicker">User Dashboard</p>

        <h1 className="user-title">
          Welcome{user.name ? `, ${user.name}` : ""}
        </h1>

        <p className="user-subtitle">
          Manage your account, enquiries and conversations with artists.
        </p>

        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-label">My Enquiries</p>
            <p className="stat-value">{totalEnquiries}</p>
          </div>

          <div className="stat-card">
            <p className="stat-label">New Enquiries</p>
            <p className="stat-value">{newEnquiries}</p>
          </div>

          <div className="stat-card">
            <p className="stat-label">Replied</p>
            <p className="stat-value">{repliedEnquiries}</p>
          </div>

          <div className="stat-card">
            <p className="stat-label">Unread Messages</p>
            <p className="stat-value">{unreadMessages}</p>
          </div>
        </div>

            <CustomerMessages />

        <div className="dashboard-grid">
          <section className="dashboard-card">
            <h2>My Account</h2>

            <p className="dashboard-card-description">
              Your BmKalaHub account information.
            </p>

            <div className="account-details">
              <div className="account-row">
                <span className="account-label">Name</span>
                <span className="account-value">
                  {user.name || "—"}
                </span>
              </div>

              <div className="account-row">
                <span className="account-label">Email</span>
                <span className="account-value">
                  {user.email || "—"}
                </span>
              </div>
            </div>
          </section>

          <section className="dashboard-card">
         <h2>My Enquiries</h2>

         <p className="dashboard-card-description">
            Track enquiries you have sent to artists.
         </p>

         <CustomerEnquiries
           initialEnquiries={enquiries.map((enquiry) => {
          const artist = enquiry.artistId as {
           _id?: unknown;
          name?: string;
          category?: string;
        } | null;

        return {
         _id: String(enquiry._id),
         artistId: artist
          ? {
              _id: String(artist._id),
              name: artist.name || "Artist",
              category: artist.category,
            }
          : null,
        eventType: enquiry.eventType,
        message: enquiry.message,
        status: enquiry.status,
        createdAt: enquiry.createdAt.toISOString(),
       };
      })}
     />

        <a href="/artists" className="section-link">
        Find an Artist →
        </a>
        </section>

          <section className="dashboard-card">
            <h2>Messages</h2>

            <p className="dashboard-card-description">
              Send and receive messages with artists.
            </p>

            {messages.length === 0 ? (
              <p className="empty-state">
                No messages yet.
              </p>
            ) : (
              <div className="message-list">
                {messages.map((message) => {
                  const isReceived =
                    String(message.receiverId) === String(userId);

                  return (
                    <div
                      className={`message-item ${
                        isReceived && !message.read
                          ? "message-unread"
                          : ""
                      }`}
                      key={String(message._id)}
                    >
                      <div className="item-top">
                        <div>
                          <p className="item-title">
                            {isReceived ? "Received" : "Sent"}
                          </p>

                          <p className="item-meta">
                            {message.createdAt
                              ? new Date(
                                  message.createdAt
                                ).toLocaleString()
                              : ""}
                          </p>
                        </div>

                        {isReceived && !message.read && (
                          <span className="status">
                            Unread
                          </span>
                        )}
                      </div>

                      <p className="item-message">
                        {message.message}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="dashboard-card">
          <RealtimeNotifications
           initialNotifications={notifications.map((notification) => ({
           _id: String(notification._id),
           type: notification.type,
           title: notification.title,
           message: notification.message,
           enquiryId: notification.enquiryId
        ? String(notification.enquiryId)
        : null,
          messageId: notification.messageId
        ? String(notification.messageId)
        : null,
         read: notification.read,
         createdAt: notification.createdAt.toISOString(),
      }))}
         initialUnreadCount={unreadNotifications}
      />
      </section>
        </div>

        <section className="dashboard-card">
        <h2>My Bookings</h2>

      <p className="dashboard-card-description">
         View your booking requests and respond to artist quotes.
      </p>

      <CustomerBookings
      bookings={bookings.map((booking) => ({
      _id: booking._id.toString(),
      artistId: booking.artistId
        ? {
            _id: booking.artistId._id.toString(),
            name: booking.artistId.name,
            category: booking.artistId.category,
            location: booking.artistId.location,
            profilePhoto: booking.artistId.profilePhoto,
          }
        : undefined,
      service: booking.service,
      bookingDate:
        booking.bookingDate.toISOString(),
      quoteAmount: booking.quoteAmount,
      quoteNote: booking.quoteNote,
      status: booking.status,
      createdAt:
        booking.createdAt.toISOString(),
    }))}
    />
    </section>

        <div className="quick-actions">
          <a
            href="/artists"
            className="action-button action-primary"
          >
            Discover Artists
          </a>

          <a
            href="/"
            className="action-button action-secondary"
          >
            Back to Home
          </a>
        </div>

        <div className="logout-area">
          <LogoutButton />
        </div>
      </section>
    </main>
  );
}