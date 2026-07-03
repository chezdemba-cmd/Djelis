"use client";

import { useState } from "react";
import DjaasooScreen from "../components/DjaasooScreen";
import DjelisonScreen from "../components/DjelisonScreen";
import SearchScreen from "../components/SearchScreen";
import MyListScreen from "../components/MyListScreen";
import ProfileScreen from "../components/ProfileScreen";
import PlansModal from "../components/PlansModal";
import MiniPlayer from "../components/MiniPlayer";

export default function Home() {
  const [deviceMode, setDeviceMode] = useState("mobile");
  const [activePage, setActivePage] = useState("home");
  const [activeTab, setActiveTab] = useState("djaasoo");
  const [isPlansOpen, setIsPlansOpen] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);

  return (
    <div className={`mode-${deviceMode}`}>
      {/* Viewport Devices Switcher Header */}
      <div className="viewport-selector">
        <button
          className={`selector-btn ${deviceMode === "mobile" ? "active" : ""}`}
          onClick={() => setDeviceMode("mobile")}
        >
          <span className="material-icons-round">phone_iphone</span> Mobile
        </button>
        <button
          className={`selector-btn ${deviceMode === "desktop" ? "active" : ""}`}
          onClick={() => setDeviceMode("desktop")}
        >
          <span className="material-icons-round">desktop_mac</span> Ordinateur
        </button>
        <button
          className={`selector-btn ${deviceMode === "tv" ? "active" : ""}`}
          onClick={() => setDeviceMode("tv")}
        >
          <span className="material-icons-round">tv</span> Télévision
        </button>
        <div className="selector-divider"></div>
        <button className="selector-btn network-btn" id="network-toggle-btn">
          <span className="material-icons-round" id="network-status-icon">wifi</span>
          <span id="network-status-text">En ligne</span>
        </button>
      </div>

      {/* Simulator Workspace Wrapper */}
      <div className="simulator-wrapper">
        <div className="device-frame">
          <div className="dynamic-island"></div>
          
          <div className="status-bar">
            <span className="time" id="status-time">16:20</span>
            <div className="status-icons">
              <span className="material-icons-round">signal_cellular_4_bar</span>
              <span className="material-icons-round" id="status-wifi-icon">wifi</span>
              <span className="material-icons-round">battery_full</span>
            </div>
          </div>

          <aside className="desktop-sidebar">
            <div className="sidebar-logo">
              <img src="/assets/logo.png" alt="Djeli'S Logo" className="sidebar-logo-img" />
              <span className="sidebar-logo-text">Djeli'S</span>
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
              <button className="sidebar-nav-item side-plans-btn tv-focusable" onClick={() => setIsPlansOpen(true)}>
                <span className="material-icons-round">stars</span> Abonnements
              </button>
            </nav>
          </aside>

          <div className="app-container">
            <header className="app-header">
              <button className="header-auth-trigger-btn tv-focusable" onClick={() => setIsPlansOpen(true)}>
                <span className="material-icons-round">vpn_key</span> S'abonner
              </button>
              
              {activePage === "home" && (
                <div className="header-tabs">
                  <span 
                    className={`header-tab-item ${activeTab === "djaasoo" ? "active" : ""}`}
                    onClick={() => setActiveTab("djaasoo")}
                  >
                    DjaaSoo
                  </span>
                  <span 
                    className={`header-tab-item ${activeTab === "djelison" ? "active" : ""}`}
                    onClick={() => setActiveTab("djelison")}
                  >
                    DjeliSon
                  </span>
                </div>
              )}

              <div className="header-actions">
                <button className="icon-btn tv-focusable" onClick={() => setActivePage('search')}>
                  <span className="material-icons-round">search</span>
                </button>
              </div>
            </header>

            <main className="app-content">
              {activePage === "home" && (
                <div id="page-home" className="app-page active">
                  <div className="main-tabs-container">
                    <button 
                      className={`main-tab-btn tv-focusable ${activeTab === 'djaasoo' ? 'active' : ''}`} 
                      onClick={() => setActiveTab("djaasoo")}
                    >
                      🎬 DjaaSoo
                    </button>
                    <button 
                      className={`main-tab-btn tv-focusable ${activeTab === 'djelison' ? 'active' : ''}`} 
                      onClick={() => setActiveTab("djelison")}
                    >
                      🎵 DjeliSon
                    </button>
                  </div>
                  
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
              {activePage === "mylist" && <MyListScreen openAuthModal={() => setIsPlansOpen(true)} />}
              {activePage === "profile" && <ProfileScreen openAuthModal={() => setIsPlansOpen(true)} />}
            </main>

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
            
            <PlansModal isOpen={isPlansOpen} onClose={() => setIsPlansOpen(false)} />
            <MiniPlayer audioItem={currentAudio} onClose={() => setCurrentAudio(null)} />
          </div>
        </div>
      </div>
    </div>
  );
}
