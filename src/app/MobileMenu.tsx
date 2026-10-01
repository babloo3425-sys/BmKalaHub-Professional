"use client";

import { useState } from "react";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="mobile-menu-button"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        {open ? "×" : "☰"}
      </button>

      {open && (
        <div className="mobile-menu">
          <a href="/profile/create" onClick={() => setOpen(false)}>
            Create Profile
          </a>

          <a href="/categories" onClick={() => setOpen(false)}>
            Categories
          </a>

          <a href="/user-access" onClick={() => setOpen(false)}>
             User
          </a>

          <a href="/dashboard" onClick={() => setOpen(false)}>
            Dashboard
          </a>

          <a href="/login" onClick={() => setOpen(false)}>
            Login
          </a>

        </div>
      )}
    </>
  );
}