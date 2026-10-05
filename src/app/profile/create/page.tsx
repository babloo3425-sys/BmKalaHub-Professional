"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../../auth.css";

const categories = [
  "Musician",
  "Singer",
  "Performer",
  "DJ",
  "Photographer",
  "Dancer",
  "Band",
  "Decorator",
  "Host / Anchor",
  "Choreographer",
  "Music Arranger",
  "Event Group",
];

type UploadField = "profilePhoto" | "portfolio" | "resume" | "video" | "audio";

export default function CreateProfilePage() {
  const router = useRouter();
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

   useEffect(() => {
   async function checkAccess() {
    try {
      const response = await fetch("/api/me", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        router.replace("/login");
        return;
      }

      const data = await response.json();

      const role = data?.user?.role;
      const accountType = data?.user?.accountType;

      if (role === "admin") {
        router.replace("/admin");
        return;
      }

      if (accountType !== "artist") {
      setAccessDenied(true);
      setCheckingAccess(false);
      return;
    }

      setCheckingAccess(false);
    } catch (error) {
      console.error("Profile create access check failed:", error);
      router.replace("/login");
    }
  }

  checkAccess();
}, [router]);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [experience, setExperience] = useState("");
  const [contactDetails, setContactDetails] = useState("");

  const [portfolio, setPortfolio] = useState<string[]>([]);
  const [resume, setResume] = useState("");
  const [video, setVideo] = useState("");
  const [audio, setAudio] = useState("");

  const [uploading, setUploading] = useState<UploadField | "">("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function uploadFile(
  file: File,
  field: UploadField
): Promise<string | null> {
  setError("");
  setUploading(field);

  try {
    const signatureResponse = await fetch("/api/upload/signature", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: field,
      }),
    });

    const signatureData = await signatureResponse.json();

    if (!signatureResponse.ok) {
      throw new Error(
        signatureData.message || "Unable to prepare upload."
      );
    }

    const resourceType =
      field === "profilePhoto" || field === "portfolio"
        ? "image"
        : field === "video" || field === "audio"
        ? "video"
        : "raw";

    const cloudinaryFormData = new FormData();

    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append("api_key", signatureData.apiKey);
    cloudinaryFormData.append("timestamp", String(signatureData.timestamp));
    cloudinaryFormData.append("signature", signatureData.signature);
    cloudinaryFormData.append("folder", signatureData.folder);

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/${resourceType}/upload`,
      {
        method: "POST",
        body: cloudinaryFormData,
      }
    );

    const uploadData = await uploadResponse.json();

    if (!uploadResponse.ok) {
      throw new Error(
        uploadData.error?.message || "Unable to upload file."
      );
    }

    return uploadData.secure_url;
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Unable to upload file."
    );

    return null;
  } finally {
    setUploading("");
  }
}
  async function handleSingleUpload(
    event: React.ChangeEvent<HTMLInputElement>,
    field: Exclude<UploadField, "portfolio">
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const url = await uploadFile(file, field);

    if (!url) {
      return;
    }

    if (field === "profilePhoto") {
      setProfilePhoto(url);
    }

    if (field === "resume") {
      setResume(url);
    }

    if (field === "video") {
      setVideo(url);
    }

    if (field === "audio") {
      setAudio(url);
    }
  }

  async function handlePortfolioUpload(
  event: React.ChangeEvent<HTMLInputElement>
) {
  const files = Array.from(event.target.files || []);

  if (!files.length) {
    return;
  }

  setError("");

  const uploadedUrls: string[] = [];

  try {
    for (const file of files) {
      const url = await uploadFile(file, "portfolio");

      if (!url) {
        return;
      }

      uploadedUrls.push(url);
    }

    setPortfolio((current) => [...current, ...uploadedUrls]);
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Unable to upload portfolio."
    );
  } finally {
    setUploading("");
    event.target.value = "";
  }
}

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          category,
          location,
          profilePhoto,
          experience,
          contactDetails,
          portfolio,
          resume,
          video,
          audio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to create profile."
        );
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create profile."
      );
    } finally {
      setLoading(false);
    }
  }

      if (checkingAccess) {
      return (
      <main className="auth-page">
      <div className="auth-card">
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
          Checking access...
        </p>
      </div>
    </main>
   );
  }
   
    if (accessDenied) {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-brand">
          <img
            src="/BmKalaHub.png"
            alt="BmKalaHub"
            className="auth-brand-logo"
          />
          <span>BmKalaHub</span>
        </Link>

        <div className="auth-heading">
          <span className="auth-kicker">
            Restricted Access
          </span>

          <h1>Artist Account Required</h1>

          <p>
            Create Profile is available only for Artist
            accounts.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gap: "12px",
            marginTop: "24px",
          }}
        >
          <Link
            href="/login"
            className="auth-submit"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
            }}
          >
            Artist Login
          </Link>

          <Link
            href="/"
            className="back-home"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}    
  
  return (
      <main className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-brand">
      <img
          src="/BmKalaHub.png"
          alt="BmKalaHub"
          className="auth-brand-logo"
      />
      <span>BmKalaHub</span>
      </Link>

        <div className="auth-heading">
          <span className="auth-kicker">Your Profile</span>

          <h1>Create your profile</h1>

          <p>
            Add your professional information to get started.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="name">
            Name
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>

          <label htmlFor="category">
            Category
            <select
              id="category"
              name="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              required
            >
              <option value="">Select category</option>

              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="location">
            City / Location
            <input
              id="location"
              name="location"
              type="text"
              placeholder="Your city or location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              required
            />
          </label>

          <label htmlFor="profilePhoto">
            Profile photo
            <input
              id="profilePhoto"
              name="profilePhoto"
              type="file"
              accept="image/*"
              onChange={(event) =>
                handleSingleUpload(event, "profilePhoto")
              }
            />

            {profilePhoto && (
              <span style={{ color: "var(--success)", fontSize: "13px" }}>
                Profile photo uploaded
              </span>
            )}
          </label>

          <label htmlFor="experience">
                 Experience
          <textarea
                 id="experience"
                 name="experience"
                 placeholder="e.g. 5 years of experience in theatre, stage performances and live events"
                 value={experience}
                 onChange={(event) => setExperience(event.target.value)}
                 rows={4}
                />
            </label>

          <label htmlFor="contactDetails">
            Contact details
            <input
              id="contactDetails"
              name="contactDetails"
              type="text"
              placeholder="Phone, WhatsApp or other contact"
              value={contactDetails}
              onChange={(event) =>
                setContactDetails(event.target.value)
              }
            />
          </label>

          <label htmlFor="portfolio">
            Portfolio
            <input
              id="portfolio"
              name="portfolio"
              type="file"
              accept="image/*"
              multiple
              onChange={handlePortfolioUpload}
            />

            {portfolio.length > 0 && (
              <span style={{ color: "var(--success)", fontSize: "13px" }}>
                {portfolio.length} portfolio file
                {portfolio.length > 1 ? "s" : ""} uploaded
              </span>
            )}
          </label>

          <label htmlFor="resume">
            Resume
            <input
              id="resume"
              name="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(event) =>
                handleSingleUpload(event, "resume")
              }
            />

            {resume && (
              <span style={{ color: "var(--success)", fontSize: "13px" }}>
                Resume uploaded
              </span>
            )}
          </label>

          <label htmlFor="video">
            Video
            <input
              id="video"
              name="video"
              type="file"
              accept="video/*"
              onChange={(event) =>
                handleSingleUpload(event, "video")
              }
            />

            {video && (
              <span style={{ color: "var(--success)", fontSize: "13px" }}>
                Video uploaded
              </span>
            )}
          </label>

          <label htmlFor="audio">
            Audio
            <input
              id="audio"
              name="audio"
              type="file"
              accept="audio/*"
              onChange={(event) =>
                handleSingleUpload(event, "audio")
              }
            />

            {audio && (
              <span style={{ color: "var(--success)", fontSize: "13px" }}>
                Audio uploaded
              </span>
            )}
          </label>

          {uploading && (
            <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
              Uploading...
            </p>
          )}

          {error && (
            <p style={{ color: "var(--danger)", fontSize: "14px" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading || Boolean(uploading)}
          >
            {loading ? "Creating profile..." : "Create profile"}
          </button>
        </form>

        <Link href="/dashboard" className="back-home">
          ← Back to dashboard
        </Link>
      </div>
    </main>
  );
}