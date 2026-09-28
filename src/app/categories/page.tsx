import Link from "next/link";

const categories = [
  {
    name: "Musician",
    description: "Music & instrumental talent",
  },
  {
    name: "Singer",
    description: "Vocalists for every occasion",
  },
  {
    name: "Performer",
    description: "Stage & live performance",
  },
  {
    name: "DJ",
    description: "DJs for events & celebrations",
  },
  {
    name: "Photographer",
    description: "Photography & creative talent",
  },
  {
    name: "Dancer",
    description: "Dance artists & groups",
  },
  {
    name: "Band",
    description: "Live bands & music groups",
  },
  {
    name: "Decorator",
    description: "Event & stage decoration",
  },
  {
    name: "Host / Anchor",
    description: "Hosts & anchors for events",
  },
  {
    name: "Choreographer",
    description: "Dance direction & choreography",
  },
  {
    name: "Music Arranger",
    description: "Music arrangement & production",
  },
  {
    name: "Event Group",
    description: "Professional event teams & groups",
  },
];

export default function CategoriesPage() {
  return (
    <main className="categories-page">
      <style>{`
        .categories-page {
          min-height: 100vh;
          padding: 42px 0 70px;
          background: #faf9fc;
        }

        .categories-container {
          width: min(100% - 48px, 1400px);
          margin: 0 auto;
        }

        .categories-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 42px;
        }

        .categories-kicker {
          color: var(--primary);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .categories-title {
          margin-top: 8px;
          color: var(--text-primary);
          font-size: clamp(34px, 5vw, 52px);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -2px;
        }

        .categories-description {
          max-width: 650px;
          margin-top: 14px;
          color: var(--text-secondary);
          font-size: 15px;
          line-height: 1.7;
        }

        .back-home {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          padding: 0 16px;
          border-radius: 10px;
          background: var(--primary-soft);
          color: var(--primary);
          font-size: 13px;
          font-weight: 800;
          text-decoration: none;
          white-space: nowrap;
        }

        .back-home:hover {
          background: var(--primary);
          color: #fff;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(180px, 1fr));
          gap: 16px;
        }

        .category-card {
          display: flex;
          flex-direction: column;
          min-width: 0;
          width: 100%;
          min-height: 190px;
          padding: 24px;
          box-sizing: border-box;
          border: 1px solid var(--border);
          border-radius: 20px;
          background: var(--surface);
          box-shadow: var(--shadow-sm);
          text-decoration: none;
          overflow: hidden;
          transition:
          transform 180ms ease,
          border-color 180ms ease,
          box-shadow 180ms ease;
        }

        .category-card:hover {
          transform: translateY(-3px);
          border-color: var(--primary);
          box-shadow: var(--shadow-md);
        }

        .category-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          margin-bottom: 22px;
          border-radius: 14px;
          background: var(--category-soft);
          color: var(--category-color);
          flex-shrink: 0;
        }

        .category-icon svg {
          width: 23px;
          height: 23px;
          display: block;
        }

        .category-card:nth-child(1) {
          --category-color: #6d45f5;
          --category-soft: #f0ebff;
        }

        .category-card:nth-child(2) {
          --category-color: #d9467a;
          --category-soft: #fff0f5;
        }

        .category-card:nth-child(3) {
          --category-color: #e08a00;
          --category-soft: #fff5df;
        }

        .category-card:nth-child(4) {
          --category-color: #3b82c4;
          --category-soft: #eaf5ff;
        }

        .category-card:nth-child(5) {
          --category-color: #0f9b8e;
          --category-soft: #e7f8f5;
        }

        .category-card:nth-child(6) {
          --category-color: #e05a8a;
          --category-soft: #fff0f5;
        }

        .category-card:nth-child(7) {
          --category-color: #5b55d9;
          --category-soft: #eeedff;
        }

        .category-card:nth-child(8) {
          --category-color: #c58a16;
          --category-soft: #fff6df;
        }

        .category-card:nth-child(9) {
          --category-color: #7c4dff;
          --category-soft: #f1ebff;
       }

        .category-card:nth-child(10) {
          --category-color: #e0529c;
          --category-soft: #fff0f7;
       }

        .category-card:nth-child(11) {
          --category-color: #1687a7;
          --category-soft: #e8f8fc;
        }

        .category-card:nth-child(12) {
          --category-color: #4f7cac;
          --category-soft: #edf4fb;
        }

        .category-card:hover {
          border-color: var(--category-color);
        }

        .category-name {
          display: block;
          width: 100%;
          min-width: 0;
          max-width: 100%;
          box-sizing: border-box;
          color: var(--text-primary);
          font-size: 20px;
          font-weight: 800;
          line-height: 1.25;
          white-space: normal;
          overflow: hidden;
          word-break: break-all;
        }
        .category-description {
          margin-top: 8px;
          color: var(--text-secondary);
          font-size: 13px;
          line-height: 1.5;
        }

        .category-link {
          margin-top: auto;
          padding-top: 18px;
          color: var(--primary);
          font-size: 12px;
          font-weight: 800;
        }

        @media (max-width: 900px) {
        .category-grid {
          grid-template-columns: repeat(2, minmax(180px, 1fr));
        }
      }

        @media (max-width: 600px) {
        .categories-page {
        padding: 24px 16px 50px;
        }

       .categories-container {
        width: 100%;
       }

       .categories-top {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 20px;
        margin-bottom: 30px;
       }

       .categories-title {
        font-size: 36px;
       }

       .categories-description {
        font-size: 14px;
       }

       .back-home {
        width: 100%;
        min-height: 42px;
        padding: 0 12px;
        font-size: 13px;
        white-space: nowrap;
        box-sizing: border-box;
       }

       .category-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }

       .category-name {
  font-size: 19px;
}

@media (max-width: 380px) {
       .categories-page {
        padding: 20px 12px 45px;
      }

      .categories-top {
       gap: 16px;
      }

      .categories-title {
       font-size: 32px;
      }

      .back-home {
       width: 100%;
       min-height: 40px;
       padding: 0 10px;
       font-size: 12px;
       box-sizing: border-box;
     }

      .category-card {
       padding: 18px;
      } 
    }
      `}</style>

      <div className="categories-container">
        <div className="categories-top">
          <div>
            <p className="categories-kicker">
              Explore BmKalaHub
            </p>

            <h1 className="categories-title">
              Categories
            </h1>

            <p className="categories-description">
              Find the right creative professional for
              performances, productions, events and
              collaborations.
            </p>
          </div>

          <Link href="/" className="back-home">
            Back to Home
          </Link>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/artists?category=${encodeURIComponent(
                category.name.toLowerCase()
              )}`}
              className="category-card"
            >
              <span className="category-icon" aria-hidden="true">
  {category.name === "Musician" && (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l10-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="16" cy="16" r="3" />
    </svg>
  )}

  {category.name === "Singer" && (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="3" width="8" height="12" rx="4" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" />
    </svg>
  )}

  {category.name === "Performer" && (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="2.5" />
      <path d="M8 21l2-7-3-3 2-3 3 3 3-3 2 3-3 3 2 7M10 14h4" />
    </svg>
  )}

  {category.name === "DJ" && (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 4v5M12 15v5M4 12h5M15 12h5" />
    </svg>
  )}

  {category.name === "Photographer" && (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h4l1.5-2h5L16 7h4v12H4z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )}

  {category.name === "Dancer" && (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="14" cy="4" r="2" />
      <path d="M11 8l-2 4 4 2 2-4M9 12l-4 2M13 14l-2 6M15 10l4 2M11 20l-3 1M19 12l1 3" />
    </svg>
  )}

  {category.name === "Band" && (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="3" />
      <circle cx="16" cy="8" r="3" />
      <path d="M2 20a6 6 0 0 1 12 0M10 20a6 6 0 0 1 12 0" />
    </svg>
  )}

  {category.name === "Decorator" && (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20l10-10" />
      <path d="M13 4l7 7" />
      <path d="M14 3l7 7-3 3-7-7z" />
      <path d="M4 20l4-1-3-3z" />
    </svg>
  )}

     {category.name === "Host / Anchor" && (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="4" width="10" height="14" rx="2" />
      <path d="M9 8h6M9 12h4M9 16h6" />
      <path d="M5 7v10M19 7v10" />
    </svg>
  )}

  {category.name === "Choreographer" && (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4" r="2" />
      <path d="M9 8l3 3 3-3M12 7v6M8 12l-3 4M16 12l3 4M10 13l-2 7M14 13l2 7" />
    </svg>
  )}

  {category.name === "Music Arranger" && (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l10-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="16" cy="16" r="3" />
      <path d="M3 8h4M3 11h4" />
    </svg>
  )}

  {category.name === "Event Group" && (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="7" r="2.5" />
      <circle cx="16" cy="7" r="2.5" />
      <circle cx="12" cy="5" r="2" />
      <path d="M3 20a5 5 0 0 1 10 0M11 20a5 5 0 0 1 10 0M8 13a5 5 0 0 1 8 0" />
    </svg>
  )}
  </span>

              <strong className="category-name">
                {category.name}
              </strong>

              <span className="category-description">
                {category.description}
              </span>

              <span className="category-link">
                Explore artists →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}