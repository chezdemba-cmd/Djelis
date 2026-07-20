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
import ProfileSelector from "../components/ProfileSelector";

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
  const [currentProfile, setCurrentProfile] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [plansModalMode, setPlansModalMode] = useState("register");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Close profile menu when clicking outside
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
    <div className="app-root">


      {/* Main App Container */}
      <div className="app-container">
        <header className="netflix-navbar">
          <div className="navbar-left">
            <h1 className="netflix-logo" style={{ color: '#E50914', margin: 0, fontSize: '24px', cursor: 'pointer', fontFamily: 'Arial, sans-serif', fontWeight: '900', letterSpacing: '1px' }} onClick={() => setActivePage('home')}>
              DJELI'S
            </h1>
            
            {isAuthenticated && currentProfile !== null && (
              <nav className="navbar-links">
                <a href="#" className={activePage === 'home' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActivePage('home'); }}>Accueil</a>
                <a href="#" onClick={(e) => { e.preventDefault(); alert("Séries: Fonctionnalité à venir !"); }}>Séries</a>
                <a href="#" onClick={(e) => { e.preventDefault(); alert("Films: Fonctionnalité à venir !"); }}>Films</a>
                <a href="#" onClick={(e) => { e.preventDefault(); alert("Jeux: Fonctionnalité à venir !"); }}>Jeux</a>
                <a href="#" onClick={(e) => { e.preventDefault(); alert("Nouveautés: Fonctionnalité à venir !"); }}>Nouveautés les plus regardées</a>
                <a href="#" className={activePage === 'mylist' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActivePage('mylist'); }}>Ma Liste</a>
                <a href="#" onClick={(e) => { e.preventDefault(); alert("Explorer: Fonctionnalité à venir !"); }}>Explorer par langue</a>
              </nav>
            )}
          </div>

          <div className="navbar-right">
            {isAuthenticated && currentProfile !== null && (
              <>
                <button className="icon-btn tv-focusable" onClick={() => setActivePage('search')}>
                  <span className="material-icons-round">search</span>
                </button>
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
                      <div className="dropdown-item" onClick={() => { setIsProfileMenuOpen(false); setActivePage('profile'); }}>
                        <span className="material-icons-round">edit</span> Gérer les profils
                      </div>
                      <div className="dropdown-item" onClick={() => { setIsProfileMenuOpen(false); setCurrentProfile(null); setActiveTab(null); }}>
                        <span className="material-icons-round">people</span> Changer de profil
                      </div>
                      {isAuthenticated && (
                        <div className="dropdown-item" onClick={() => { setIsProfileMenuOpen(false); setActivePage('admin'); }}>
                          <span className="material-icons-round">admin_panel_settings</span> Espace Admin
                        </div>
                      )}
                      <div className="dropdown-divider"></div>
                      <div className="dropdown-item" onClick={() => { 
                        setIsProfileMenuOpen(false); 
                        localStorage.removeItem('accessToken'); 
                        setIsAuthenticated(false); 
                        setCurrentProfile(null); 
                        setActivePage('home'); 
                        setActiveTab(null); 
                      }}>
                        Se déconnecter de Djeli'S
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {!isAuthenticated && (
              <button className="btn-signin" onClick={() => { setPlansModalMode("login"); setIsPlansOpen(true); }}>S'identifier</button>
            )}
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
                  <button className="drawer-nav-item" style={{ color: "var(--accent-crimson)" }} onClick={() => { localStorage.removeItem('accessToken'); setIsAuthenticated(false); setCurrentProfile(null); setActivePage('home'); setActiveTab(null); setIsMobileMenuOpen(false); }}>
                    <span className="material-icons-round">logout</span> Déconnexion
                  </button>
                )}
              </nav>
            </div>
          </div>
        )}

        <main className="app-content">
          {!isAuthenticated ? (
            <div className="landing-screen" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', textAlign: 'center', padding: '20px', gap: '30px', animation: 'fadeIn 0.5s ease-out' }}>
              <div className="landing-bg-animation"></div>
              <div className="landing-overlay"></div>
              <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
                <h1 style={{ fontSize: 'clamp(26px, 5vw, 44px)', fontWeight: '900', color: 'white', maxWidth: '800px', lineHeight: '1.2', margin: '0 0 10px 0', textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>
                  Films, Séries & Contes <br />
                  <span style={{ color: '#ffb300' }}>Illimités</span>{" "}en Afrique de l&apos;Ouest
                </h1>
                <p style={{ fontSize: 'clamp(15px, 1.8vw, 18px)', color: '#eee', maxWidth: '600px', margin: '0', textShadow: '0 2px 10px rgba(0,0,0,0.8)', fontWeight: '500' }}>
                  Découvrez le meilleur du cinéma avec DjaaSoo et de la musique traditionnelle avec DjeliSon. Regardez et écoutez vos artistes préférés.
                </p>
                <button className="tv-focusable" onClick={() => { setPlansModalMode("register"); setIsPlansOpen(true); }} style={{ background: 'linear-gradient(135deg, #ffb300, #ff4081)', color: 'white', border: 'none', padding: '16px 40px', borderRadius: '30px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 8px 30px rgba(255, 64, 129, 0.6)', transition: 'transform 0.3s, box-shadow 0.3s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                  Commencer l&apos;aventure
                </button>
              </div>
            </div>
          ) : currentProfile === null ? (
            <ProfileSelector onSelectProfile={setCurrentProfile} />
          ) : (
            <>
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
                      <DjaasooScreen currentProfile={currentProfile} />
                    </section>
                  )}
                  
                  {activeTab === "djelison" && (
                    <section id="screen-djelison" className="screen-tab active">
                      <DjelisonScreen currentProfile={currentProfile} onPlayAudio={setCurrentAudio} />
                    </section>
                  )}
                </div>
              )}

              {activePage === "search" && <SearchScreen />}
              {activePage === "mylist" && <MyListScreen isAuthenticated={isAuthenticated} openAuthModal={() => setIsPlansOpen(true)} />}
              {activePage === "profile" && <ProfileScreen isAuthenticated={isAuthenticated} currentProfile={currentProfile} onLogout={() => { localStorage.removeItem('accessToken'); setIsAuthenticated(false); setCurrentProfile(null); setActivePage('home'); setActiveTab(null); }} openAuthModal={() => setIsPlansOpen(true)} onOpenAdmin={() => setActivePage("admin")} />}
              {activePage === "admin" && <AdminScreen onBack={() => setActivePage("profile")} />}
            </>
          )}
        </main>


        
        <PlansModal 
          isOpen={isPlansOpen} 
          initialMode={plansModalMode}
          onClose={() => setIsPlansOpen(false)} 
          onComplete={() => {
            setIsAuthenticated(true);
            setActivePage('home');
            setActiveTab(null); // Return to profile/universe selection
          }}
        />
        <MiniPlayer key={currentAudio?.id} audioItem={currentAudio} onClose={() => setCurrentAudio(null)} />
      </div>
    </div>
  );
}
