"use client";

import { useState, useEffect } from "react";
import DjaasooScreen from "../components/DjaasooScreen";
import DjelisonScreen from "../components/DjelisonScreen";
import SearchScreen from "../components/SearchScreen";
import MyListScreen from "../components/MyListScreen";
import ProfileScreen from "../components/ProfileScreen";
import PlansModal from "../components/PlansModal";
import MiniPlayer from "../components/MiniPlayer";
import AdminScreen from "../components/AdminScreen";

export default function Home() {
  const [activePage, setActivePage] = useState("home");
  const [activeTab, setActiveTab] = useState(null); // null = selection screen
  const [isPlansOpen, setIsPlansOpen] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem('accessToken');
    }
    return false;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="app-root">
      {/* Desktop Sidebar (Hidden on mobile via CSS) */}
      <aside className="desktop-sidebar">
        <div className="sidebar-logo">
          <img src="/assets/logo.png" alt="Djeli&apos;S Logo" className="sidebar-logo-img" />
          <span className="sidebar-logo-text">Djeli&apos;S</span>
        </div>
        <nav className="sidebar-nav">
          <button className={`sidebar-nav-item tv-focusable ${activePage === 'home' ? 'active' : ''}`} onClick={() => setActivePage('home')}>
            <span className="material-icons-round">home</span> Accueil
          </button>
          <button className={`sidebar-nav-item tv-focusable ${activePage === 'search' ? 'active' : ''}`} onClick={() => setActivePage('search')}>
            <span className="material-icons-round">search</span> Recherche
          </button>
          <button className={`sidebar-nav-item tv-focusable ${activePage === 'mylist' ? 'active' : ''}`} onClick={() => setActivePage('mylist')}>
            <span className="material-icons-round">favorite_border</span> Ma Liste
          </button>
          <button className={`sidebar-nav-item tv-focusable ${activePage === 'profile' ? 'active' : ''}`} onClick={() => setActivePage('profile')}>
            <span className="material-icons-round">person_outline</span> Mon Profil
          </button>
          {!isAuthenticated && (
            <button className="sidebar-nav-item side-plans-btn tv-focusable" onClick={() => setIsPlansOpen(true)}>
              <span className="material-icons-round">stars</span> Abonnements
            </button>
          )}
        </nav>
      </aside>

      {/* Main App Container */}
      <div className="app-container">
        <header className="app-header">
          <button className="icon-btn mobile-menu-btn tv-focusable" onClick={() => setIsMobileMenuOpen(true)}>
            <span className="material-icons-round">menu</span>
          </button>
          
          {!isAuthenticated ? (
            <button className="header-auth-trigger-btn tv-focusable" onClick={() => setIsPlansOpen(true)}>
              <span className="material-icons-round">vpn_key</span> S&apos;abonner
            </button>
          ) : (
            <button className="icon-btn header-avatar tv-focusable" onClick={() => setActivePage('profile')} style={{ border: 'none', background: 'transparent' }}>
              <span className="material-icons-round">account_circle</span>
            </button>
          )}
          
          {activePage === "home" && activeTab !== null && (
            <div className="header-app-indicator" onClick={() => setActiveTab(null)} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '20px', transition: '0.2s' }}>
              <span className="material-icons-round" style={{ fontSize: '18px', marginRight: '5px' }}>arrow_back</span>
              <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                {activeTab === 'djaasoo' ? '🎬 DjaaSoo' : '🎵 DjeliSon'}
              </span>
            </div>
          )}

          <div className="header-actions">
            <button className="icon-btn tv-focusable" onClick={() => setActivePage('search')}>
              <span className="material-icons-round">search</span>
            </button>
          </div>
        </header>

        {isMobileMenuOpen && (
          <div className="mobile-drawer-overlay" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="mobile-drawer" onClick={e => e.stopPropagation()}>
              <div className="drawer-header">
                <img src="/assets/logo.png" alt="Djeli'S Logo" className="drawer-logo" />
                <button className="icon-btn" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="material-icons-round">close</span>
                </button>
              </div>
              <nav className="drawer-nav">
                <button className={`drawer-nav-item ${activePage === 'home' ? 'active' : ''}`} onClick={() => { setActivePage('home'); setIsMobileMenuOpen(false); }}>
                  <span className="material-icons-round">home</span> Accueil
                </button>
                <button className={`drawer-nav-item ${activePage === 'search' ? 'active' : ''}`} onClick={() => { setActivePage('search'); setIsMobileMenuOpen(false); }}>
                  <span className="material-icons-round">search</span> Recherche
                </button>
                <button className={`drawer-nav-item ${activePage === 'mylist' ? 'active' : ''}`} onClick={() => { setActivePage('mylist'); setIsMobileMenuOpen(false); }}>
                  <span className="material-icons-round">favorite_border</span> Ma Liste
                </button>
                <button className={`drawer-nav-item ${activePage === 'profile' ? 'active' : ''}`} onClick={() => { setActivePage('profile'); setIsMobileMenuOpen(false); }}>
                  <span className="material-icons-round">person_outline</span> Mon Profil
                </button>
                {isAuthenticated && (
                  <button className={`drawer-nav-item ${activePage === 'admin' ? 'active' : ''}`} style={{ color: '#ffb300' }} onClick={() => { setActivePage('admin'); setIsMobileMenuOpen(false); }}>
                    <span className="material-icons-round">admin_panel_settings</span> Espace Administrateur
                  </button>
                )}
                {!isAuthenticated ? (
                  <button className="drawer-nav-item" style={{ color: 'white' }} onClick={() => { setIsPlansOpen(true); setIsMobileMenuOpen(false); }}>
                    <span className="material-icons-round">vpn_key</span> S&apos;abonner
                  </button>
                ) : (
                  <button className="drawer-nav-item" style={{ color: "var(--accent-crimson)" }} onClick={() => { localStorage.removeItem('accessToken'); setIsAuthenticated(false); setIsMobileMenuOpen(false); }}>
                    <span className="material-icons-round">logout</span> Déconnexion
                  </button>
                )}
              </nav>
            </div>
          </div>
        )}

        <main className="app-content">
          {activePage === "home" && (
            <div id="page-home" className="app-page active">
              {activeTab === null && (
                <div className="app-selection-screen" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '60vh', gap: '40px', padding: '20px' }}>
                  <h2 style={{ fontSize: 'clamp(20px, 4vw, 32px)', textAlign: 'center' }}>Que souhaitez-vous explorer ?</h2>
                  <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <div className="app-select-card tv-focusable" onClick={() => setActiveTab('djaasoo')} style={{ cursor: 'pointer', background: 'linear-gradient(145deg, #2a2a2d, #1b1b1d)', padding: '40px', borderRadius: '20px', textAlign: 'center', width: '260px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', transition: 'transform 0.3s' }}>
                      <span style={{ fontSize: '60px' }}>🎬</span>
                      <h3 style={{ marginTop: '20px', color: '#fff', fontSize: '24px' }}>DjaaSoo</h3>
                      <p style={{ color: '#aaa', fontSize: '15px', marginTop: '10px' }}>Cinéma, Séries & Documentaires</p>
                    </div>
                    <div className="app-select-card tv-focusable" onClick={() => setActiveTab('djelison')} style={{ cursor: 'pointer', background: 'linear-gradient(145deg, #2a2a2d, #1b1b1d)', padding: '40px', borderRadius: '20px', textAlign: 'center', width: '260px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', transition: 'transform 0.3s' }}>
                      <span style={{ fontSize: '60px' }}>🎵</span>
                      <h3 style={{ marginTop: '20px', color: '#ffb300', fontSize: '24px' }}>DjeliSon</h3>
                      <p style={{ color: '#aaa', fontSize: '15px', marginTop: '10px' }}>Musique, Contes & Podcasts</p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === "djaasoo" && (
                <section id="screen-djaasoo" className="screen-tab active">
                  <DjaasooScreen />
                </section>
              )}
              
              {activeTab === "djelison" && (
                <section id="screen-djelison" className="screen-tab active">
                  <DjelisonScreen onPlayAudio={setCurrentAudio} />
                </section>
              )}
            </div>
          )}

          {activePage === "search" && <SearchScreen />}
          {activePage === "mylist" && <MyListScreen isAuthenticated={isAuthenticated} openAuthModal={() => setIsPlansOpen(true)} />}
          {activePage === "profile" && <ProfileScreen isAuthenticated={isAuthenticated} onLogout={() => { localStorage.removeItem('accessToken'); setIsAuthenticated(false); }} openAuthModal={() => setIsPlansOpen(true)} onOpenAdmin={() => setActivePage("admin")} />}
          {activePage === "admin" && <AdminScreen onBack={() => setActivePage("profile")} />}
        </main>

        {/* Mobile Bottom Nav (Hidden on desktop via CSS) */}
        <div className="bottom-nav">
          <button className={`nav-item tv-focusable ${activePage === 'home' ? 'active' : ''}`} onClick={() => setActivePage('home')}>
            <span className="material-icons-round">home</span>
            <span>Accueil</span>
          </button>
          <button className={`nav-item tv-focusable ${activePage === 'search' ? 'active' : ''}`} onClick={() => setActivePage('search')}>
            <span className="material-icons-round">search</span>
            <span>Recherche</span>
          </button>
          <button className={`nav-item tv-focusable ${activePage === 'mylist' ? 'active' : ''}`} onClick={() => setActivePage('mylist')}>
            <span className="material-icons-round">favorite_border</span>
            <span>Ma Liste</span>
          </button>
          <button className={`nav-item tv-focusable ${activePage === 'profile' ? 'active' : ''}`} onClick={() => setActivePage('profile')}>
            <span className="material-icons-round">person_outline</span>
            <span>Profil</span>
          </button>
        </div>
        
        <PlansModal 
          isOpen={isPlansOpen} 
          onClose={() => setIsPlansOpen(false)} 
          onComplete={() => {
            localStorage.setItem('accessToken', 'simulated_test_jwt_token_for_tracking');
            setIsAuthenticated(true);
            setActivePage('profile');
          }}
        />
        <MiniPlayer key={currentAudio?.id} audioItem={currentAudio} onClose={() => setCurrentAudio(null)} />
      </div>
    </div>
  );
}
