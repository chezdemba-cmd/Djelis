"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "../context/SessionContext";

export default function MobileDrawer({ isOpen, onClose, onOpenLogin }) {
  const { isAuthenticated, currentProfile, logout } = useSession();
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="mobile-drawer-overlay" onClick={onClose}>
      <div className="mobile-drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <img src="/assets/logo.png" alt="Djeli'S Logo" className="drawer-logo" />
          <button className="icon-btn" onClick={onClose}>
            <span className="material-icons-round">close</span>
          </button>
        </div>
        <nav className="drawer-nav">
          <Link href="/browse" className={`drawer-nav-item ${pathname === '/browse' ? 'active' : ''}`} onClick={onClose} style={{ textDecoration: 'none' }}>
            <span className="material-icons-round">home</span> Accueil
          </Link>
          <Link href="/search" className={`drawer-nav-item ${pathname === '/search' ? 'active' : ''}`} onClick={onClose} style={{ textDecoration: 'none' }}>
            <span className="material-icons-round">search</span> Recherche
          </Link>
          <Link href="/mylist" className={`drawer-nav-item ${pathname === '/mylist' ? 'active' : ''}`} onClick={onClose} style={{ textDecoration: 'none' }}>
            <span className="material-icons-round">favorite_border</span> Ma Liste
          </Link>
          <Link href="/profile" className={`drawer-nav-item ${pathname === '/profile' ? 'active' : ''}`} onClick={onClose} style={{ textDecoration: 'none' }}>
            <span className="material-icons-round">person_outline</span> Mon Profil
          </Link>
          {isAuthenticated && (
            <Link href="/admin" className={`drawer-nav-item ${pathname === '/admin' ? 'active' : ''}`} style={{ color: '#ffb300', textDecoration: 'none' }} onClick={onClose}>
              <span className="material-icons-round">admin_panel_settings</span> Espace Administrateur
            </Link>
          )}
          {!isAuthenticated ? (
            <>
              <Link href="/login" className="drawer-nav-item" style={{ color: '#ffb300', textDecoration: 'none' }} onClick={onClose}>
                <span className="material-icons-round">login</span> Connexion
              </Link>
              <button className="drawer-nav-item" style={{ color: 'white' }} onClick={onOpenLogin}>
                <span className="material-icons-round">card_membership</span> S'abonner
              </button>
            </>
          ) : (
            <button className="drawer-nav-item" style={{ color: "var(--accent-crimson)" }} onClick={() => { logout(); onClose(); }}>
              <span className="material-icons-round">logout</span> Déconnexion
            </button>
          )}
        </nav>
      </div>
    </div>
  );
}
