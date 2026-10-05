"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../../auth.css";

const profileEditStyles = `
  .profile-edit-page {
    align-items: flex-start;
    padding: 42px 24px 70px;
  }

  .profile-edit-card {
  width: min(100% - 48px, 1180px);
  max-width: 1180px;
  padding: 42px;
}

  .profile-edit-card .auth-heading p {
    max-width: 700px;
  }

  .profile-edit-card .auth-form {
    width: 100%;
  }

    .profile-edit-card .auth-form input,
  .profile-edit-card .auth-form select {
    min-height: 50px;
    height: 50px;
    box-sizing: border-box;
  }

  .profile-edit-card .auth-form .experience-textarea {
    width: 100%;
    min-height: 150px;
    height: 150px;
    max-height: 150px;
    box-sizing: border-box;
    padding: 14px 16px;
    border: 1px solid var(--border);
    border-radius: 14px;
    background: #fff;
    color: var(--text-primary);
    font-size: 15px;
    line-height: 1.6;
    resize: none;
    overflow-y: auto;
    font-family: inherit;
  }

  .profile-edit-card .auth-form .experience-textarea:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(99, 62, 255, 0.12);
  }

  @media (max-width: 700px) {
    .profile-edit-page {
      padding: 24px 16px 50px;
    }

    .profile-edit-card {
      width: 100%;
      max-width: none;
      padding: 30px 22px;
      border-radius: 20px;
    }
  }

  @media (max-width: 360px) {
    .profile-edit-card {
      padding: 26px 18px;
    }
  }
`;

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

type UploadField =
  | "profilePhoto"
  | "portfolio"
  | "resume"
  | "video"
  | "audio";

export default function EditProfilePage() {
  const router = useRouter();

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

  const [pageLoading, setPageLoading] = useState(true);
  const [uploading, setUploading] = useState<UploadField | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

    useEffect(() => {
    async function loadProfile() {
      try {

    const meResponse = await fetch("/api/me", {
          method: "GET",
          cache: "no-store",
      });

     if (!meResponse.ok) {
        router.replace("/login");
       return;
     }

    const meData = await meResponse.json();

    const role = meData?.user?.role;
    const accountType = meData?.user?.accountType;

    if (role === "admin") {
       router.replace("/admin");
      return;
    }

    if (accountType !== "artist") {
        router.replace("/user");
       return;
     }
        const response = await fetch("/api/profile", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            router.replace("/login");
            return;
          }

          if (response.status === 404) {
            router.replace("/profile/create");
            return;
          }

          throw new Error(
            data.message || "Unable to load profile."
          );
        }

        const profile = data.profile;

        setName(profile.name || "");
        setCategory(profile.category || "");
        setLocation(profile.location || "");
        setProfilePhoto(profile.profilePhoto || "");
        setExperience(profile.experience || "");
        setContactDetails(profile.contactDetails || "");
        setPortfolio(
          Array.isArray(profile.portfolio)
            ? profile.portfolio
            : []
        );
        setResume(profile.resume || "");
        setVideo(profile.video || "");
        setAudio(profile.audio || "");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load profile."
        );
      } finally {
        setPageLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  async function uploadFile(
  file: File,
  field: UploadField
): Promise<string | null> {
  setError("");
  setMessage("");
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
    cloudinaryFormData.append(
      "timestamp",
      String(signatureData.timestamp)
    );
    cloudinaryFormData.append(
      "signature",
      signatureData.signature
    );
    cloudinaryFormData.append(
      "folder",
      signatureData.folder
    );

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
    event: ChangeEvent<HTMLInputElement>,
    field: Exclude<UploadField, "portfolio">
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (field === "video") {
      const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

      if (file.type !== "video/mp4") {
        setError("Performance video must be an MP4 file.");
        event.target.value = "";
        return;
      }

      if (file.size > MAX_VIDEO_SIZE) {
        setError("Performance video must be 50 MB or smaller.");
        event.target.value = "";
        return;
      }
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

    event.target.value = "";
  }

  async function handlePortfolioUpload(
  event: ChangeEvent<HTMLInputElement>
) {
  const files = Array.from(event.target.files || []);

  if (!files.length) {
    return;
  }

  if (portfolio.length + files.length > 3) {
    setError("You can upload a maximum of 3 portfolio images.");
    event.target.value = "";
    return;
  }

  setError("");
  setMessage("");
  setUploading("portfolio");

  try {
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const url = await uploadFile(file, "portfolio");

      if (!url) {
        return;
      }

      uploadedUrls.push(url);
    }

    setPortfolio((current) => [
      ...current,
      ...uploadedUrls,
    ]);
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
  function removePortfolioItem(index: number) {
    setPortfolio((current) =>
      current.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
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
          data.message || "Unable to update profile."
        );
      }

      setMessage("Profile updated successfully.");

      router.refresh();

      setTimeout(() => {
        router.replace("/dashboard");
      }, 700);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update profile."
      );
    } finally {
      setLoading(false);
    }
  }

   if (pageLoading) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <div className="auth-brand">
            <img
               src="/BmKalaHub.png"
               alt="BmKalaHub"
               className="auth-brand-mark"
              />
            <span>BmKalaHub</span>
          </div>

          <div className="auth-heading">
            <span className="auth-kicker">
              Your Profile
            </span>

            <h1>Loading profile...</h1>

            <p>Please wait.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page profile-edit-page">
      <style>{profileEditStyles}</style>

      <div className="auth-card profile-edit-card">
        <Link href="/" className="auth-brand">
          <img
            src="/BmKalaHub.png"
            alt="BmKalaHub"
            className="auth-brand-mark"
          />
          <span>BmKalaHub</span>
        </Link>

        <div className="auth-heading">
          <span className="auth-kicker">
            Your Profile
          </span>

          <h1>Edit your profile</h1>

          <p>
            Update your professional information and media.
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <label htmlFor="name">
            Name
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              required
            />
          </label>

          <label htmlFor="category">
            Category
            <select
              id="category"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              required
            >
              <option value="">
                Select category
              </option>

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
              type="text"
              value={location}
              onChange={(event) =>
                setLocation(event.target.value)
              }
              required
            />
          </label>

          <label htmlFor="profilePhoto">
            Profile photo
            <input
              id="profilePhoto"
              type="file"
              accept="image/*"
              onChange={(event) =>
                handleSingleUpload(
                  event,
                  "profilePhoto"
                )
              }
            />

            {profilePhoto && (
              <span
                style={{
                  color: "var(--success)",
                  fontSize: "13px",
                }}
              >
                Profile photo uploaded
              </span>
            )}
          </label>

          <label htmlFor="experience">
           Experience

          <textarea
           id="experience"
           placeholder="Tell people about your theatre, music, dance or acting experience..."
           value={experience}
           onChange={(event) =>
          setExperience(event.target.value)
         }
          rows={6}
          className="experience-textarea"
        />
        </label>

          <label htmlFor="contactDetails">
            Contact details
            <input
              id="contactDetails"
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

          <span
          style={{
          display: "block",
          marginTop: "4px",
          marginBottom: "8px",
          color: "var(--text-secondary)",
          fontSize: "13px",
          lineHeight: "1.6",
        }}
      >
          Add your work photos/images
      <br />
        JPG, PNG, WEBP - Maximum 3 images - 1 MB each
      </span>

          <input
            id="portfolio"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
           onChange={handlePortfolioUpload}
          />

            {portfolio.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gap: "8px",
                  marginTop: "8px",
                }}
              >
                {portfolio.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                      padding: "9px 12px",
                      borderRadius: "10px",
                      background:
                        "var(--primary-soft)",
                      fontSize: "13px",
                    }}
                  >
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Portfolio {index + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        removePortfolioItem(index)
                      }
                      style={{
                        padding: "4px 8px",
                        borderRadius: "7px",
                        background:
                          "var(--danger)",
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: "11px",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </label>

          <label htmlFor="resume">
            Resume
            <input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(event) =>
                handleSingleUpload(event, "resume")
              }
            />

            {resume && (
              <span
                style={{
                  color: "var(--success)",
                  fontSize: "13px",
                }}
              >
                Resume uploaded
              </span>
            )}
          </label>

          <label htmlFor="video">
           Performance Video

          <span
            style={{
            display: "block",
            marginTop: "4px",
            marginBottom: "8px",
            color: "var(--text-secondary)",
            fontSize: "13px",
            lineHeight: "1.6",
         }}
        >
            Upload your performance video
        <br />
            MP4 - Maximum 50 MB
        </span>

        <input
         id="video"
         name="video"
         type="file"
         accept="video/mp4"
         onChange={(event) =>
        handleSingleUpload(event, "video")
       }
      />

       {video && (
      <span
        style={{
        display: "block",
        marginTop: "8px",
        color: "var(--success)",
        fontSize: "13px",
      }}
     >
      [OK] Performance video uploaded
     </span>
    )}
   </label>
          <label htmlFor="audio">
            Audio
            <input
              id="audio"
              type="file"
              accept="audio/*"
              onChange={(event) =>
                handleSingleUpload(event, "audio")
              }
            />

            {audio && (
              <span
                style={{
                  color: "var(--success)",
                  fontSize: "13px",
                }}
              >
                Audio uploaded
              </span>
            )}
          </label>

          {uploading && (
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "13px",
              }}
            >
              Uploading...
            </p>
          )}

          {message && (
            <p
              style={{
                color: "var(--success)",
                fontSize: "14px",
              }}
            >
              {message}
            </p>
          )}

          {error && (
            <p
              style={{
                color: "var(--danger)",
                fontSize: "14px",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={
              loading || Boolean(uploading)
            }
          >
            {loading
              ? "Saving changes..."
              : "Save changes"}
          </button>
        </form>

        <Link
          href="/dashboard"
          className="back-home"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}


