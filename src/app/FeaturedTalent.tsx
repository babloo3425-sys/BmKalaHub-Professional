"use client";

import { useState } from "react";

type FeaturedArtist = {
  _id: string;
  name: string;
  category: string;
  location: string;
  profilePhoto?: string;
  verified?: boolean;
  featured?: boolean;
};

type FeaturedTalentProps = {
  artists: FeaturedArtist[];
};

export default function FeaturedTalent({
  artists,
}: FeaturedTalentProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!artists.length) {
    return (
      <div className="visual-card visual-card-main">
        <span className="visual-label">Featured talent</span>

        <div className="visual-placeholder" />

        <div className="visual-lines">
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  const artist = artists[currentIndex];

  function showNextArtist() {
    setCurrentIndex((index) =>
      index === artists.length - 1 ? 0 : index + 1
    );
  }

  return (
    <div className="visual-card visual-card-main">
      <span className="visual-label">Featured talent</span>

      <button
        type="button"
        className="featured-image-button"
        onClick={showNextArtist}
        aria-label={`View next featured artist. Current artist: ${artist.name}`}
      >
        {artist.profilePhoto ? (
          <img
            src={artist.profilePhoto}
            alt={artist.name}
            className="featured-artist-photo"
          />
        ) : (
          <div className="visual-placeholder">
            {artist.name.charAt(0).toUpperCase()}
          </div>
        )}
      </button>

      <div className="featured-artist-info">
        <strong>{artist.name}</strong>

        <span>
          {artist.category}
          {artist.location
            ? ` • ${artist.location}`
            : ""}
        </span>

        <div className="featured-artist-badges">
          {artist.verified && (
            <span>✅ VERIFIED</span>
          )}

          <span>⭐ FEATURED</span>
        </div>
      </div>

      <a
        href={`/profile/${artist._id}`}
        className="featured-artist-link"
      >
        View Profile
      </a>

      {artists.length > 1 && (
        <span className="featured-artist-count">
          {currentIndex + 1} / {artists.length}
        </span>
      )}
    </div>
  );
}