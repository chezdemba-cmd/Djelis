import { useState } from "react";

export default function MyListScreen({ isAuthenticated, openAuthModal }) {
  const [activeTab, setActiveTab] = useState("fav");
  
  return (
    <div id="page-mylist" className="app-page active" style={{ width: "100%", height: "100%" }}>
      <div className="mylist-container">
        
        <div className="mylist-tabs-container">
          <button 
            className={`mylist-tab-btn tv-focusable ${activeTab === 'fav' ? 'active' : ''}`} 
            onClick={() => setActiveTab('fav')}
          >
            <span className="material-icons-round">favorite_border</span> Favoris
          </button>
          <button 
            className={`mylist-tab-btn tv-focusable ${activeTab === 'dl' ? 'active' : ''}`} 
            onClick={() => setActiveTab('dl')}
          >
            <span className="material-icons-round">download</span> Hors-ligne
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="mylist-unauth-view" id="mylist-unauth">
            <span className="material-icons-round mylist-empty-icon">favorite_border</span>
            <p>Connectez-vous pour ajouter et retrouver vos favoris.</p>
            <button className="modal-action-btn tv-focusable" style={{ marginTop: "14px" }} onClick={openAuthModal}>
              S&apos;abonner / Se connecter
            </button>
          </div>
        ) : (
          <div className="mylist-auth-view" id="mylist-auth">
            {activeTab === 'fav' && (
              <div id="mylist-fav-content">
                <p className="mylist-subtitle">Retrouvez tous vos contenus préférés sauvegardés.</p>
                <div className="mylist-grid" id="mylist-items-grid">
                  <div className="media-card tv-focusable">
                    <div className="card-image" style={{ backgroundImage: "url('/assets/baobab.png')" }}>
                      <div className="card-play-overlay">
                        <span className="material-icons-round">play_circle_filled</span>
                      </div>
                    </div>
                    <div className="card-title">Les Secrets du Baobab</div>
                  </div>
                  <div className="media-card tv-focusable">
                    <div className="card-image" style={{ backgroundImage: "url('/assets/king.png')" }}>
                      <div className="card-play-overlay">
                        <span className="material-icons-round">play_circle_filled</span>
                      </div>
                    </div>
                    <div className="card-title">L&apos;Or de Ségou</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'dl' && (
              <div id="mylist-dl-content">
                <div className="downloads-storage-card">
                  <h4>Limite de stockage hors-ligne</h4>
                  
                  <div className="storage-item">
                    <div className="storage-info">
                      <span>Vidéos (Max 3)</span>
                      <strong id="dl-video-count">0 / 3</strong>
                    </div>
                    <div className="storage-bar-bg">
                      <div className="storage-bar-fill" id="dl-video-bar" style={{ width: "0%" }}></div>
                    </div>
                  </div>

                  <div className="storage-item" style={{ marginTop: "12px" }}>
                    <div className="storage-info">
                      <span>Musique & Podcasts (Max 15)</span>
                      <strong id="dl-audio-count">0 / 15</strong>
                    </div>
                    <div className="storage-bar-bg">
                      <div className="storage-bar-fill" id="dl-audio-bar" style={{ width: "0%" }}></div>
                    </div>
                  </div>
                </div>

                <div className="mylist-empty-downloads" id="mylist-dl-empty" style={{ display: "flex" }}>
                  <span className="material-icons-round">cloud_download</span>
                  <p>Aucun téléchargement disponible.<br/>Téléchargez des vidéos, des musiques ou des podcasts pour les écouter hors-ligne.</p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
