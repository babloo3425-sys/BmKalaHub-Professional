import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Profile from "@/models/Profile";
import DashboardMediaViewer from "./DashboardMediaViewer";
import Enquiries from "./Enquiries";
import Messages from "./Messages";
import BookingManagement from "./BookingManagement";
import Booking from "@/models/Booking";
import Enquiry from "@/models/Enquiry";
import Notification from "@/models/Notification";
import RealtimeNotifications from "./RealtimeNotifications";
import { verifyAuthToken } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

export default async function DashboardPage() {
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

  if (user.accountType === "customer") {
  redirect("/user");
}

  const profile = await Profile.findOne({ userId }).lean();

  if (!profile) {
    redirect("/profile/create");
  }

  const bookings = await Booking.find({
  artistId: profile._id,
})
  .populate({
    path: "customerId",
    select: "name email",
  })
  .populate({
    path: "enquiryId",
    select: "eventType message",
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


  const portfolioCount = profile.portfolio?.length ?? 0;

  const mediaCount = [
  profile.resume,
  profile.video,
  profile.audio,
].filter(Boolean).length;

const profileStatus = profile.deactivated
  ? "Inactive"
  : "Live";

  const completionItems = [
  Boolean(profile.name?.trim()),
  Boolean(profile.category?.trim()),
  Boolean(profile.location?.trim()),
  Boolean(profile.profilePhoto),
  Boolean(profile.experience?.trim()),
  Boolean(profile.contactDetails?.trim()),
  Boolean(profile.portfolio?.length),
  Boolean(profile.resume),
  Boolean(profile.video),
  Boolean(profile.audio),
];

const completedItems = completionItems.filter(Boolean).length;
const profileCompletion = completedItems * 10;

  return (
    <>
      <style>{`
  .dashboard-page {
    min-height: 100vh;
    padding: 42px 0 70px;
    background: #faf9fc;
  }

  .dashboard-container {
    width: min(100% - 48px, 1400px);
    margin: 0 auto;
  }

  .dashboard-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 26px;
}

.dashboard-brand img {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  object-fit: cover;
}

.dashboard-brand-name {
  color: var(--text-primary);
  font-size: 20px;
  font-weight: 800;
}

  .dashboard-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 34px;
  }

  .dashboard-kicker {
    color: var(--primary);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }

  .dashboard-title {
    margin-top: 8px;
    color: var(--text-primary);
    font-size: clamp(32px, 5vw, 48px);
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -2px;
  }

.profile-completion-card {
  margin-bottom: 24px;
  padding: 22px;
  border: 1px solid var(--border);
  border-radius: 18px;
  background: var(--surface);
  box-shadow: var(--shadow-sm);
}

.profile-completion-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}

.profile-completion-header span {
  display: block;
  color: var(--primary);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
}

.profile-completion-header strong {
  display: block;
  margin-top: 7px;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 800;
}

.profile-completion-header > strong {
  margin-top: 0;
  font-size: 24px;
}

.profile-completion-track {
  width: 100%;
  height: 10px;
  margin-top: 15px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--border);
}

.profile-completion-fill {
  height: 100%;
  border-radius: inherit;
  background: var(--primary);
  transition: width 300ms ease;
}

.profile-completion-card p {
  margin-top: 10px;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.5;
}

  .dashboard-home-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 11px;
  color: var(--primary);
  background: var(--primary-soft);
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;
  white-space: nowrap;
}

.dashboard-home-button:hover {
  color: #fff;
  background: var(--primary);
}

  .admin-panel-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 11px;
  color: var(--primary);
  background: var(--primary-soft);
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;
  white-space: nowrap;
}

.admin-panel-button:hover {
  color: #fff;
  background: var(--primary);
}

  .dashboard-logout .join-button {
    min-height: 44px;
    padding: 0 20px;
    border: 0;
    border-radius: 11px;
    color: #fff;
    background: var(--text-primary);
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
  }

  .dashboard-logout .join-button:hover {
    background: #292631;
  }

  .profile-card {
    width: 100%;
    box-sizing: border-box;
    padding: 30px;
    border: 1px solid var(--border);
    border-radius: 26px;
    background: var(--surface);
    box-shadow: var(--shadow-sm);
  }

  .profile-header {
    display: flex;
    align-items: flex-start;
    gap: 17px;
    padding-bottom: 23px;
    width: 100%;
    box-sizing: border-box;
  }

  .profile-header-info {
    min-width: 0;
    flex: 1 1 auto;
  }

  .profile-photo,
  .profile-placeholder {
    width: 120px;
    height: 120px;
    flex: 0 0 120px;
    border-radius: 50%;
  }

  .profile-photo {
    object-fit: cover;
    border: 4px solid var(--primary-soft);
  }

  .profile-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary);
    background: var(--primary-soft);
    font-size: 34px;
    font-weight: 800;
  }

  .profile-name {
    color: var(--text-primary);
    font-size: clamp(25px, 4vw, 34px);
    font-weight: 800;
    line-height: 1.1;
    overflow-wrap: normal;
    word-break: normal;
  }

  .profile-category {
    margin-top: 8px;
    color: var(--primary);
    font-size: 15px;
    font-weight: 800;
  }

  .profile-location {
    margin-top: 5px;
    color: var(--text-secondary);
    font-size: 14px;
  }

  .profile-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    box-sizing: border-box;
    margin-top: 14px;
  }

  .profile-action-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 1 1 0;
    min-width: 0;
    min-height: 40px;
    padding: 0 14px;
    box-sizing: border-box;
    border-radius: 10px;
    background: var(--primary-soft);
    color: var(--primary);
    font-size: 13px;
    font-weight: 800;
    text-decoration: none;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .profile-action-button:hover {
    background: var(--primary);
    color: #fff;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    margin-top: 26px;
  }

  .info-column {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
  }

  .info-card {
    min-width: 0;
    padding: 18px;
    border: 1px solid var(--border);
    border-radius: 15px;
    background: var(--surface-soft);
  }

  .info-label {
    color: var(--text-muted);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .7px;
    text-transform: uppercase;
  }

  .info-value {
    margin-top: 7px;
    color: var(--text-primary);
    font-size: 14px;
    font-weight: 700;
    line-height: 1.45;
    overflow-wrap: anywhere;
  }

  .media-section {
    margin-top: 32px;
    padding-top: 28px;
    border-top: 1px solid var(--border);
  }

  .media-title {
    margin-bottom: 16px;
    color: var(--text-primary);
    font-size: 21px;
    font-weight: 800;
  }

  .media-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .media-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: 0 17px;
    border-radius: 11px;
    color: var(--primary);
    background: var(--primary-soft);
    font-size: 13px;
    font-weight: 800;
    transition: transform 180ms ease;
  }

  .media-button:hover {
    transform: translateY(-1px);
  }

  .media-button.resume {
    color: #fff;
    background: var(--primary);
  }

    .dashboard-media-viewer {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(0, 0, 0, 0.78);
  }

  .dashboard-media-close {
    position: absolute;
    top: 18px;
    right: 20px;
    z-index: 10001;
    width: 40px;
    height: 40px;
    border: 0;
    border-radius: 50%;
    background: #fff;
    color: #111;
    font-size: 26px;
    line-height: 1;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
  }

  .dashboard-resume-frame {
    position: relative;
    width: min(900px, 94vw);
    height: min(90vh, 900px);
    overflow: hidden;
    border-radius: 18px;
    background: #fff;
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.3);
  }

  .dashboard-resume-frame iframe {
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
  }

  .dashboard-media-nav {
    position: absolute;
    top: 50%;
    z-index: 10001;
    width: 44px;
    height: 44px;
    border: 0;
    border-radius: 50%;
    background: #fff;
    color: #111;
    font-size: 32px;
    line-height: 1;
    cursor: pointer;
    transform: translateY(-50%);
  }

  .dashboard-media-prev {
    left: 20px;
  }

  .dashboard-media-next {
    right: 20px;
  }

  .dashboard-media-count {
    position: absolute;
    bottom: 18px;
    left: 50%;
    z-index: 10001;
    padding: 6px 11px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.65);
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    transform: translateX(-50%);
  }

  .dashboard-portfolio-image {
    display: block;
    max-width: 90vw;
    max-height: 90vh;
    object-fit: contain;
    border-radius: 12px;
  }

  .dashboard-video-player {
    display: block;
    width: auto;
    max-width: 90vw;
    max-height: 90vh;
    border-radius: 12px;
  }

  .dashboard-audio-card {
    width: min(500px, 90vw);
    padding: 28px;
    border-radius: 22px;
    background: #fff;
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.3);
  }

  .dashboard-audio-card h3 {
    margin: 0 0 20px;
    color: var(--text-primary);
    font-size: 18px;
    font-weight: 800;
  }

  .dashboard-audio-card audio {
    width: 100%;
  }

  @media (max-width: 600px) {
    .dashboard-page {
      padding: 24px 16px 50px;
    }

    .dashboard-container {
      width: 100%;
    }

    .dashboard-top {
     flex-direction: column;
     align-items: stretch;
     gap: 16px;
     margin-bottom: 25px;
    }

    .dashboard-title {
      font-size: 34px;
      letter-spacing: -1.5px;
    }

    .dashboard-logout {
     display: flex;
     flex-wrap: wrap;
     gap: 8px;
     width: 100%;
    }

    .dashboard-logout .join-button {
      min-height: 40px;
      padding: 0 14px;
      white-space: nowrap;
    }

    .dashboard-home-button {
     flex: 1 1 auto;
     min-width: 0;
     min-height: 40px;
     padding: 0 14px;
     font-size: 12px;
     text-align: center;
    }

    .admin-panel-button {
    flex: 1 1 auto;
    min-width: 0;
    min-height: 40px;
    padding: 0 14px;
    font-size: 12px;
    text-align: center;
  }

    .profile-card {
      width: 100%;
      padding: 20px;
      border-radius: 21px;
      box-sizing: border-box;
    }

    .profile-header {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding-bottom: 20px;
      width: 100%;
      box-sizing: border-box;
      flex-wrap: nowrap;
    }

    .profile-header-info {
      min-width: 0;
      flex: 1 1 auto;
    }

    .profile-name {
      font-size: 25px;
      line-height: 1.12;
      overflow-wrap: normal;
      word-break: normal;
    }

    .profile-category {
      font-size: 14px;
    }

    .profile-location {
      font-size: 13px;
    }

    .profile-photo,
    .profile-placeholder {
      width: 86px;
      height: 86px;
      flex: 0 0 86px;
    }

    .profile-placeholder {
      font-size: 26px;
    }

    .profile-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      margin-top: 14px;
    }

    .profile-action-button {
     flex: 1 1 0;
     min-width: 0;
     min-height: 42px;
     padding: 0 6px;
     font-size: 12px;
     white-space: normal;
     overflow: visible;
     text-overflow: clip;
     line-height: 1.25;
     text-align: center;
    }

    .info-grid {
      grid-template-columns: 1fr;
      gap: 10px;
      margin-top: 20px;
    }

    .info-card {
      padding: 16px;
    }

    .media-section {
      margin-top: 25px;
      padding-top: 23px;
    }

    .media-title {
      font-size: 20px;
    }

    .media-actions {
      display: grid;
      grid-template-columns: 1fr;
    }

    .media-button {
      width: 100%;
    }

    .dashboard-resume-frame {
     width: 96vw;
     height: 88vh;
     border-radius: 14px;
    }

    .dashboard-media-close {
      top: 10px;
      right: 10px;
      width: 36px;
      height: 36px;
    }

  .dashboard-media-nav {
    width: 38px;
    height: 38px;
    font-size: 28px;
  }

  .dashboard-media-prev {
    left: 8px;
  }

  .dashboard-media-next {
    right: 8px;
  }

  .profile-completion-card {
    margin-bottom: 20px;
    padding: 17px;
  }

  .profile-completion-header {
    align-items: center;
  }

 .profile-completion-header > strong {
  font-size: 21px;
 }
}

  @media (max-width: 380px) {
    .dashboard-page {
      padding: 20px 12px 45px;
    }

    .dashboard-top {
      gap: 10px;
    }

    .dashboard-kicker {
      font-size: 10px;
    }

    .dashboard-title {
      font-size: 29px;
    }

    .dashboard-logout .join-button {
      min-height: 38px;
      padding: 0 11px;
      font-size: 12px;
    }

    .profile-card {
      padding: 16px;
    }

    .profile-header {
      gap: 12px;
    }

    .profile-photo,
    .profile-placeholder {
      width: 76px;
      height: 76px;
      flex: 0 0 76px;
    }

    .profile-name {
      font-size: 22px;
      line-height: 1.15;
      overflow-wrap: normal;
      word-break: normal;
    }

    .profile-actions {
      gap: 8px;
    }

    .profile-action-button {
  min-height: 40px;
  padding: 0 5px;
  font-size: 11px;
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
  line-height: 1.2;
}
  }
`}</style>

      <main className="dashboard-page">
        <div className="dashboard-container">
          <>
  <div className="dashboard-brand">
    <img src="/BmKalaHub.png" alt="BmKalaHub" />
    <span className="dashboard-brand-name">BmKalaHub</span>
  </div>

  <div className="dashboard-top">
    <div>
      <p className="dashboard-kicker">
        DASHBOARD
      </p>

      <h1 className="dashboard-title">
        Welcome, {user.name}
      </h1>
    </div>

    <div className="dashboard-logout">
      <a href="/" className="dashboard-home-button">
        Home
      </a>

      {user.role === "admin" && (
        <a href="/admin" className="admin-panel-button">
          ⚙ Admin Panel
        </a>
      )}

      <LogoutButton />
    </div>
  </div>
</>

      <div className="profile-completion-card">
  <div className="profile-completion-header">
    <div>
      <span>PROFILE COMPLETION</span>
      <strong>{profileCompletion}% Complete</strong>
    </div>

    <strong>{profileCompletion}%</strong>
  </div>

  <div className="profile-completion-track">
    <div
      className="profile-completion-fill"
      style={{ width: `${profileCompletion}%` }}
    />
  </div>

</div>

          <section className="profile-card">
          <div className="profile-header">
          {profile.profilePhoto ? (
      <img
         src={profile.profilePhoto}
         alt={profile.name}
         className="profile-photo"
       />
      ) : (
       <div className="profile-placeholder">
        {profile.name.charAt(0).toUpperCase()}
       </div>
     )}

    <div className="profile-header-info">
      <h2 className="profile-name">
        {profile.name}
      </h2>

      <p className="profile-category">
        {profile.category}
      </p>

      <p className="profile-location">
        {profile.location}
      </p>
    </div>
  </div>

  <div className="profile-actions">
    <a
      href="/profile/edit"
      className="profile-action-button"
    >
      Edit Profile
    </a>

    <a
      href={`/profile/${profile._id}`}
      className="profile-action-button"
    >
      View Public Profile
    </a>
  </div>

              <div className="info-grid">
  <div className="info-column">
    <InfoCard
      title="Name"
      value={profile.name}
    />

    <InfoCard
      title="City / Location"
      value={profile.location}
    />

    <InfoCard
      title="Contact details"
      value={profile.contactDetails || "Not added"}
    />

    <InfoCard
      title="Resume"
      value={profile.resume ? "Uploaded" : "Not added"}
    />

    <InfoCard
      title="Audio"
      value={profile.audio ? "Uploaded" : "Not added"}
    />
  </div>

  <div className="info-column">
    <InfoCard
      title="Category"
      value={profile.category}
    />

    <InfoCard
      title="Experience"
      value={profile.experience || "Not added"}
    />

    <InfoCard
      title="Portfolio"
      value={
        profile.portfolio?.length
          ? `${profile.portfolio.length} item${
              profile.portfolio.length > 1 ? "s" : ""
            }`
          : "Not added"
      }
    />

    <InfoCard
      title="Video"
      value={profile.video ? "Uploaded" : "Not added"}
    />

    <InfoCard
      title="Account email"
      value={user.email}
    />
  </div>
</div>
            {(profile.portfolio?.length ||
              profile.resume ||
              profile.video ||
              profile.audio) && (
            <div className="media-section">
            <h3 className="media-title">
                Your portfolio & media
            </h3>

            <DashboardMediaViewer
              portfolio={profile.portfolio || []}
              resume={profile.resume}
              video={profile.video}
              audio={profile.audio}
            />
            </div>
           )}
          </section>
          <Enquiries />
          <Messages />

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

            <BookingManagement
            bookings={bookings.map((booking) => ({
              _id: booking._id.toString(),
              customerId: booking.customerId
                ? {
                    _id: booking.customerId._id.toString(),
                    name: booking.customerId.name,
                    email: booking.customerId.email,
                  }
                : undefined,
              enquiryId: booking.enquiryId
                ? {
                    _id: booking.enquiryId._id.toString(),
                    eventType: booking.enquiryId.eventType,
                    message: booking.enquiryId.message,
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
        </div>
      </main>
    </>
  );
}

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="info-card">
      <p className="info-label">{title}</p>

      <p className="info-value">{value}</p>
    </div>
  );
}