"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "../context/SessionContext";

export default function Navbar({ onOpenLogin, onOpenMobileMenu }) {
  const { isAuthenticated, currentProfile, logout, selectProfile } = useSession();
  const pathname = usePathname();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isProfileMenuOpen && !e.target.closest('.navbar-profile-menu')) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isProfileMenuOpen]);

  return (
    <header className="netflix-navbar">
      <div className="navbar-left">
        {onOpenMobileMenu && (
          <button 
            type="button"
            className="mobile-hamburger-btn" 
            onClick={onOpenMobileMenu}
            aria-label="Ouvrir le menu de navigation"
          >
            <span className="material-icons-round">menu</span>
          </button>
        )}

        <Link href={isAuthenticated && currentProfile ? "/browse" : "/"} style={{ textDecoration: 'none' }}>
          <h1 className="netflix-logo" style={{ color: '#E50914', margin: 0, fontSize: 'clamp(20px, 4vw, 24px)', cursor: 'pointer', fontFamily: 'Arial, sans-serif', fontWeight: '900', letterSpacing: '1px' }}>
            DJELI'S
          </h1>
        </Link>
        
        {isAuthenticated && currentProfile !== null && (
          <nav className="navbar-links">
            <Link href="/browse" className={pathname === '/browse' ? 'active' : ''}>Accueil</Link>
            <Link href="/djaasoo" className={pathname.startsWith('/djaasoo') ? 'active' : ''}>DjaaSoo</Link>
            <Link href="/djelison" className={pathname.startsWith('/djelison') ? 'active' : ''}>DjeliSon</Link>
            <Link href="/mylist" className={pathname === '/mylist' ? 'active' : ''}>Ma Liste</Link>
          </nav>
        )}
      </div>

      <div className="navbar-right">
        {isAuthenticated && currentProfile !== null && (
          <>
            <Link href="/search" className="icon-btn tv-focusable" style={{ textDecoration: 'none' }}>
              <span className="material-icons-round">search</span>
            </Link>
            <button className="icon-btn tv-focusable">
              <span className="material-icons-round">notifications</span>
            </button>
            
            <div className="navbar-profile-menu">
              <div className="navbar-profile-trigger" onClick={(e) => { e.stopPropagation(); setIsProfileMenuOpen(!isProfileMenuOpen); }}>
                <div className="mini-avatar" style={{ background: `linear-gradient(to bottom, ${currentProfile.color}dd, ${currentProfile.color})` }}>
                   <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                    <circle cx="30" cy="40" r="4" fill="white" />
                    <circle cx="70" cy="40" r="4" fill="white" />
                    <path d="M 30 65 Q 50 80 70 65" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />
                  </svg>
                </div>
                <span className="material-icons-round drop-icon" style={{ transform: isProfileMenuOpen ? 'rotate(180deg)' : 'none' }}>arrow_drop_down</span>
              </div>
              
              {isProfileMenuOpen && (
                <div className="profile-dropdown-content">
                  <Link href="/profile" className="dropdown-item" onClick={() => setIsProfileMenuOpen(false)} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <span className="material-icons-round">edit</span> Gérer les profils
                  </Link>
                  <div className="dropdown-item" onClick={() => { setIsProfileMenuOpen(false); selectProfile(null); }}>
                    <span className="material-icons-round">people</span> Changer de profil
                  </div>
                  {isAuthenticated && (
                    <Link href="/admin" className="dropdown-item" onClick={() => setIsProfileMenuOpen(false)} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <span className="material-icons-round">admin_panel_settings</span> Espace Admin
                    </Link>
                  )}
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-item" onClick={() => { setIsProfileMenuOpen(false); logout(); }}>
                    Se déconnecter de Djeli'S
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {!isAuthenticated && (
          <Link href="/login" className="btn-signin" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            S'identifier
          </Link>
        )}
      </div>
    </header>
  );
}
