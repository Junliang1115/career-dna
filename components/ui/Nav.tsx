"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { useApp } from "@/lib/context";

const ACCENT = "#2D6A4F";

// Nav links shown after sign-up (when user is logged in)
const authLinks: { href: string; label: string }[] = [];

export default function Nav() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { profile } = useApp();

  const isEmployer = mounted && profile?.role === "employer";
  const baseLinks = [
    { href: "/", label: "Home" },
    isEmployer
      ? { href: "/talent", label: "Talent" }
      : { href: "/map", label: "Career" },
  ];

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "var(--nav-bg)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "0 24px",
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
          }}
        >
          <img
            src="/logo.png"
            alt="Career DNA"
            width={24}
            height={24}
            style={{ flexShrink: 0 }}
          />
          <span
            style={{
              fontWeight: 600,
              fontSize: 15,
              color: "var(--text)",
              letterSpacing: "-0.01em",
            }}
          >
            Career DNA
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Base nav links — always shown */}
          {baseLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: "5px 10px",
                borderRadius: 4,
                fontSize: 13,
                fontWeight: pathname === link.href ? 600 : 400,
                color:
                  pathname === link.href
                    ? "var(--text)"
                    : "var(--text-secondary)",
                textDecoration: "none",
                transition: "all 0.12s",
              }}
            >
              {link.label}
            </Link>
          ))}

          {/* Auth-required links — shown when logged in */}
          {!loading &&
            mounted &&
            user &&
            authLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "5px 10px",
                  borderRadius: 4,
                  fontSize: 13,
                  fontWeight: pathname === link.href ? 600 : 400,
                  color:
                    pathname === link.href
                      ? "var(--text)"
                      : "var(--text-secondary)",
                  textDecoration: "none",
                  transition: "all 0.12s",
                }}
              >
                {link.label}
              </Link>
            ))}

          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "var(--surface)",
                cursor: "pointer",
                marginLeft: 4,
                transition: "all 0.15s",
                flexShrink: 0,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "var(--surface-hover)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "var(--surface)";
              }}
            >
              {theme === "light" ? (
                // Moon icon
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--text-secondary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                // Sun icon
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--text-secondary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </button>
          )}

          {/* Auth section */}
          {!loading && mounted && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginLeft: 8,
                paddingLeft: 8,
                borderLeft: "1px solid var(--border)",
              }}
            >
              {user ? (
                <Link
                  href="/profile"
                  style={{
                    padding: "5px 10px",
                    borderRadius: 4,
                    fontSize: 13,
                    fontWeight: pathname === "/profile" ? 600 : 400,
                    color:
                      pathname === "/profile"
                        ? "var(--text)"
                        : "var(--text-secondary)",
                    textDecoration: "none",
                    transition: "all 0.12s",
                  }}
                >
                  {user.email}
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    style={{
                      padding: "5px 10px",
                      borderRadius: 4,
                      fontSize: 13,
                      fontWeight: pathname === "/login" ? 600 : 400,
                      color:
                        pathname === "/login"
                          ? "var(--text)"
                          : "var(--text-secondary)",
                      textDecoration: "none",
                      transition: "all 0.12s",
                    }}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    style={{
                      padding: "5px 10px",
                      borderRadius: 4,
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#FFFFFF",
                      background: "var(--accent-green)",
                      textDecoration: "none",
                      transition: "all 0.12s",
                    }}
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
