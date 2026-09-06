"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "../context/SessionContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated, currentProfile } = useSession();

  // Masquer sur le lecteur vidéo en plein écran ou si on est sur la page de connexion
  if (pathname === "/login") return null;

  const homeHref = isAuthenticated && currentProfile ? "/browse" : "/";
  const profileHref = isAuthenticated ? "/profile" : "/login";

  const navItems = [
    {
      label: "Accueil",
      href: homeHref,
      icon: "home",
      isActive: pathname === "/" || pathname === "/browse",
    },
    {
      label: "DjaaSoo",
      href: "/djaasoo",
      icon: "movie",
      badge: "VOD",
      isActive: pathname.startsWith("/djaasoo"),
    },
    {
      label: "DjeliSon",
      href: "/djelison",
      icon: "headphones",
      badge: "AUDIO",
      isActive: pathname.startsWith("/djelison"),
    },
    {
      label: "Recherche",
      href: "/search",
      icon: "search",
      isActive: pathname === "/search",
    },
    {
      label: isAuthenticated ? "Profil" : "Connexion",
      href: profileHref,
      icon: isAuthenticated ? "person" : "login",
      isActive: pathname === "/profile" || pathname === "/mylist",
    },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Navigation principale mobile">
      <div className="mobile-bottom-nav-inner">
        {navItems.map((item) => {
          const active = item.isActive;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`bottom-nav-tab ${active ? "active" : ""}`}
              style={{ textDecoration: "none" }}
            >
              <div className="bottom-nav-icon-container">
                <span className="material-icons-round bottom-nav-icon">
                  {item.icon}
                </span>
                {item.badge && (
                  <span className={`bottom-nav-mini-badge ${item.badge.toLowerCase()}`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="bottom-nav-label">{item.label}</span>
              {active && <span className="bottom-nav-active-pill" />}
            </Link>
          );
        })}
      </div>

      <style jsx>{`
        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 95;
          background: rgba(14, 14, 18, 0.94);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: env(safe-area-inset-bottom, 0px);
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.6);
        }

        .mobile-bottom-nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-around;
          height: 62px;
          max-width: 600px;
          margin: 0 auto;
          padding: 0 4px;
        }

        .bottom-nav-tab {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #8e8e99;
          position: relative;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          -webkit-tap-highlight-color: transparent;
        }

        .bottom-nav-tab:active {
          transform: scale(0.92);
        }

        .bottom-nav-tab.active {
          color: #ffffff;
        }

        .bottom-nav-icon-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 3px;
        }

        .bottom-nav-icon {
          font-size: 23px;
          transition: transform 0.2s ease, color 0.2s ease;
        }

        .bottom-nav-tab.active .bottom-nav-icon {
          color: #ffb300;
          transform: translateY(-1px);
        }

        .bottom-nav-mini-badge {
          position: absolute;
          top: -3px;
          right: -10px;
          font-size: 8px;
          font-weight: 800;
          padding: 1px 3px;
          border-radius: 4px;
          letter-spacing: 0.3px;
          line-height: 1;
        }

        .bottom-nav-mini-badge.vod {
          background: #e50914;
          color: #ffffff;
        }

        .bottom-nav-mini-badge.audio {
          background: #ffb300;
          color: #0d0d11;
        }

        .bottom-nav-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1px;
          transition: color 0.2s ease;
        }

        .bottom-nav-tab.active .bottom-nav-label {
          color: #ffffff;
          font-weight: 700;
        }

        .bottom-nav-active-pill {
          position: absolute;
          bottom: 4px;
          width: 18px;
          height: 3px;
          background: #ffb300;
          border-radius: 2px;
          box-shadow: 0 0 8px rgba(255, 179, 0, 0.8);
          animation: pillPop 0.25s ease-out;
        }

        @keyframes pillPop {
          from {
            transform: scaleX(0);
            opacity: 0;
          }
          to {
            transform: scaleX(1);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .mobile-bottom-nav {
            display: block;
          }
        }
      `}</style>
    </nav>
  );
}
