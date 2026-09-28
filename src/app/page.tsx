import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import LogoutButton from "./dashboard/LogoutButton";
import "./home.css";
import MobileMenu from "./MobileMenu";
import Profile from "@/models/Profile";
import User from "@/models/User";
import FeaturedTalent from "./FeaturedTalent";

type FeaturedArtist = {
  _id: string;
  name: string;
  category: string;
  location: string;
  profilePhoto?: string;
  verified?: boolean;
  featured?: boolean;
};

export default async function Home() {
  await connectDB();
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

    let isAuthenticated = false;
    let userAccountType = "";
    let userRole = "";

      if (token) {
      const userId = await verifyAuthToken(token);

      if (userId) {
      const currentUser = await User.findById(userId)
        .select("accountType role")
        .lean();

      if (currentUser) {
        isAuthenticated = true;
        userAccountType = currentUser.accountType || "artist";
        userRole = currentUser.role || "user";
      }
    }
  }

   let featuredArtists: FeaturedArtist[] = [];

try {
  featuredArtists = (
  await Profile.find({
    featured: true,
    blocked: false,
    deactivated: false,
  })
    .select(
      "name category location profilePhoto verified featured"
    )
    .sort({ createdAt: -1 })
    .lean()
).map((artist) => ({
  _id: artist._id.toString(),
  name: artist.name,
  category: artist.category,
  location: artist.location,
  profilePhoto: artist.profilePhoto,
  verified: artist.verified,
  featured: artist.featured,
}));
} catch (error) {
  console.error("Featured artists fetch error:", error);
}

return (
    <main className="home">
      <header className="site-header">
        <div className="brand">
          <img
  src="/BmKalaHub.png"
  alt="BmKalaHub"
  className="brand-mark"
  style={{
    width: "48px",
    height: "48px",
    objectFit: "contain",
    borderRadius: "50%",
    display: "block",
  }}
/>
          <span className="brand-name">BmKalaHub</span>
        </div>

        <nav className="desktop-nav" aria-label="Main navigation">
         <a href="/profile/create">Create Profile</a>
         <a href="/categories">Categories</a>
         <a href="/user-access">User</a>
        </nav>

        <MobileMenu />

        <div className="header-actions">
          {isAuthenticated ? (
            <>
              <a href="/dashboard" className="login-link">
                Dashboard
              </a>

              <LogoutButton />
            </>
          ) : (
            <>
              <a href="/login" className="login-link">
                Login
              </a>

              <a href="/join" className="join-button">
                Join
              </a>
            </>
          )}
        </div>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-content">
          <span className="eyebrow">India&apos;s creative talent network</span>

          <h1 id="hero-title">
           Find the
          <span> perfect talent </span>
              for your event.
          </h1>

          <p className="hero-description">
             Discover talented artists and creative professionals
             for performances, events, productions and collaborations.
          </p>

          <div className="hero-actions">
            <a href="/artists" className="primary-button">
               Explore artists
            </a>

            <a href="#categories" className="secondary-button">
              Browse categories
            </a>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <FeaturedTalent artists={featuredArtists} />

           <a
              href="/artists?featured=true"
             className="visual-card visual-card-small"
             aria-label="Discover all featured artists"
>
            <span className="small-mark">+</span>
            <span>Discover</span>
          </a>
        </div>
      </section>

      <section className="search-section" aria-label="Artist search">
      <div className="search-heading">
      <span>Looking for someone specific?</span>
      <p>Start with a category or location.</p>
    </div>

    <form
        className="search-box"
        action="/artists"
        method="GET"
      >

    <label className="search-field">
    <span className="field-label">
          Artist name
    </span>

    <input
    type="text"
    name="search"
    className="field-input"
    placeholder="Enter artist name"
    />
  </label>

    <label className="search-field">
      <span className="field-label">
        What do you need?
      </span>

      <select
        name="category"
        className="field-select"
        defaultValue=""
      >
        <option value="" disabled>
          Select a category
        </option>

        <option value="musician">Musician</option>
        <option value="singer">Singer</option>
        <option value="performer">Performer</option>
        <option value="dj">DJ</option>
        <option value="photographer">Photographer</option>
        <option value="dancer">Dancer</option>
        <option value="band">Band</option>
        <option value="decorator">Decorator</option>
        <option value="host / anchor">Host / Anchor</option>
        <option value="choreographer">Choreographer</option>
        <option value="music arranger">Music Arranger</option>
        <option value="event group">Event Group</option>
      </select>
    </label>

    <label className="search-field">
      <span className="field-label">
        Where?
      </span>

      <input
        type="text"
        name="location"
        className="field-input"
        placeholder="Enter city"
      />
    </label>

    <button
      type="submit"
      className="search-button"
    >
      Search artists
    </button>
   </form>
  </section>

      <section
        className="categories-section"
        id="categories"
        aria-labelledby="categories-title"
      >
        <div className="section-heading">
          <div>
            <span className="section-kicker">Explore</span>
            <h2 id="categories-title">Find talent by category</h2>
          </div>

          <a href="/categories" className="view-all">
            View all
          </a>
        </div>

        <div className="category-grid">
  <a href="/artists?category=musician" className="category-card">
    <span className="category-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l10-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="16" cy="16" r="3" />
      </svg>
    </span>
    <strong>Musician</strong>
    <span>Music &amp; instrumental talent</span>
  </a>

  <a href="/artists?category=singer" className="category-card">
    <span className="category-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="3" width="8" height="12" rx="4" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" />
      </svg>
    </span>
    <strong>Singer</strong>
    <span>Vocalists for every occasion</span>
  </a>

  <a href="/artists?category=performer" className="category-card">
    <span className="category-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="2.5" />
        <path d="M8 21l2-7-3-3 2-3 3 3 3-3 2 3-3 3 2 7M10 14h4" />
      </svg>
    </span>
    <strong>Performer</strong>
    <span>Stage &amp; live performance</span>
  </a>

  <a href="/artists?category=dj" className="category-card">
    <span className="category-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="2.5" />
        <path d="M12 4v5M12 15v5M4 12h5M15 12h5" />
      </svg>
    </span>
    <strong>DJ</strong>
    <span>DJs for events &amp; celebrations</span>
  </a>

  <a href="/artists?category=photographer" className="category-card">
    <span className="category-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 7h4l1.5-2h5L16 7h4v12H4z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    </span>
    <strong>Photographer</strong>
    <span>Photography &amp; creative talent</span>
  </a>

  <a href="/artists?category=dancer" className="category-card">
    <span className="category-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="14" cy="4" r="2" />
        <path d="M11 8l-2 4 4 2 2-4M9 12l-4 2M13 14l-2 6M15 10l4 2M11 20l-3 1M19 12l1 3" />
      </svg>
    </span>
    <strong>Dancer</strong>
    <span>Dance artists &amp; groups</span>
  </a>

  <a href="/artists?category=band" className="category-card">
    <span className="category-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="3" />
        <circle cx="16" cy="8" r="3" />
        <path d="M2 20a6 6 0 0 1 12 0M10 20a6 6 0 0 1 12 0" />
      </svg>
    </span>
    <strong>Band</strong>
    <span>Live bands &amp; music groups</span>
  </a>

  <a href="/artists?category=decorator" className="category-card">
    <span className="category-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20l10-10" />
        <path d="M13 4l7 7" />
        <path d="M14 3l7 7-3 3-7-7z" />
        <path d="M4 20l4-1-3-3z" />
      </svg>
    </span>
    <strong>Decorator</strong>
    <span>Event &amp; stage decoration</span>
  </a>

     <a href="/artists?category=host%20%2F%20anchor" className="category-card">
    <span className="category-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="7" y="4" width="10" height="14" rx="2" />
        <path d="M9 8h6M9 12h4M9 16h6" />
        <path d="M5 7v10M19 7v10" />
      </svg>
    </span>
    <strong>Host / Anchor</strong>
    <span>Hosts &amp; anchors for events</span>
  </a>

  <a href="/artists?category=choreographer" className="category-card">
    <span className="category-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="4" r="2" />
        <path d="M9 8l3 3 3-3M12 7v6M8 12l-3 4M16 12l3 4M10 13l-2 7M14 13l2 7" />
      </svg>
    </span>
    <strong>Choreographer</strong>
    <span>Dance direction &amp; choreography</span>
  </a>

  <a href="/artists?category=music%20arranger" className="category-card">
    <span className="category-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l10-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="16" cy="16" r="3" />
        <path d="M3 8h4M3 11h4" />
      </svg>
    </span>
    <strong>Music Arranger</strong>
    <span>Music arrangement &amp; production</span>
  </a>

  <a href="/artists?category=event%20group" className="category-card">
    <span className="category-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="7" r="2.5" />
        <circle cx="16" cy="7" r="2.5" />
        <circle cx="12" cy="5" r="2" />
        <path d="M3 20a5 5 0 0 1 10 0M11 20a5 5 0 0 1 10 0M8 13a5 5 0 0 1 8 0" />
      </svg>
    </span>
    <strong>Event Group</strong>
    <span>Professional event teams &amp; groups</span>
  </a>

</div>
      </section>

      <section
      className="trust-strip"
      id="how-it-works"
      aria-label="How it works"
      >
        <div className="trust-item">
          <span className="trust-number">01</span>
          <div>
            <strong>Discover talent</strong>
            <p>Explore creative professionals by category and location.</p>
          </div>
        </div>

        <div className="trust-item">
          <span className="trust-number">02</span>
          <div>
            <strong>Compare profiles</strong>
            <p>Understand an artist&apos;s work, skills and experience.</p>
          </div>
        </div>

        <div className="trust-item">
          <span className="trust-number">03</span>
          <div>
            <strong>Connect directly</strong>
            <p>Start an enquiry when you find the right talent.</p>
          </div>
        </div>
      </section>

      <section className="intro-section" id="artists">
        <div>
          <span className="section-kicker">BmKalaHub</span>
          <h2>One place to discover creative talent.</h2>
        </div>

        <p>
          A professional space where artists can be discovered and people
          looking for talent can find the right fit.
        </p>
      </section>

      <footer className="site-footer">
      <div className="footer-brand">
      <strong>BmKalaHub</strong>
      <span> — India's Creative Talent Network.</span>
   </div>

    <nav className="footer-links" aria-label="Footer navigation">
  <a href="/">Home</a>
  <span>•</span>
  <a href="/artists">Artists</a>
  <span>•</span>
  <a href="/categories">Categories</a>
  <span>•</span>
  <a href="#how-it-works">How it works</a>
  <span>•</span>
  <a href="/about">About Us</a>
  <span>•</span>
  <a href="/privacy">Privacy Policy</a>
  <span>•</span>
  <a href="/terms">Terms &amp; Conditions</a>
  <span>•</span>
  <a href="/contact">Contact Us</a>
</nav>

    <p className="footer-copyright">
       © 2026 BmKalaHub. All Rights Reserved.
    </p>
   </footer>
    </main>
  );
}
