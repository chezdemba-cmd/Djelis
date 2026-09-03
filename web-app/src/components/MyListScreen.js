import { useState, useEffect } from "react";
import { getFavorites, removeFavorite } from "../data/catalog";
import { useSession } from "../context/SessionContext";

export default function MyListScreen({ isAuthenticated, openAuthModal }) {
  const { currentProfile } = useSession();
  const [activeTab, setActiveTab] = useState("fav");
  const [favorites, setFavorites] = useState([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    const loadFavorites = async () => {
      setIsLoadingFavorites(true);
      setFavorites(await getFavorites(currentProfile?.id));
      setIsLoadingFavorites(false);
    };
    loadFavorites();
  }, [isAuthenticated, currentProfile?.id]);

  const handleRemove = async (e, contentId) => {
    e.stopPropagation();
    setFavorites(prev => prev.filter(item => item.id !== contentId));
    await removeFavorite(contentId, currentProfile?.id);
  };

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
                {isLoadingFavorites ? (
                  <p style={{ textAlign: "center", marginTop: "40px", color: "var(--text-secondary)" }}>Chargement...</p>
                ) : favorites.length === 0 ? (
                  <div className="mylist-unauth-view">
                    <span className="material-icons-round mylist-empty-icon">favorite_border</span>
                    <p>Aucun favori pour l&apos;instant. Ajoutez des contenus depuis DjaaSoo.</p>
                  </div>
                ) : (
                  <div className="mylist-grid" id="mylist-items-grid">
                    {favorites.map(item => (
                      <div key={item.id} className="media-card tv-focusable">
                        <div className="card-image" style={{ backgroundImage: `url(${item.image})` }}>
                          <div className="card-play-overlay">
                            <span className="material-icons-round">play_circle_filled</span>
                          </div>
                          <button
                            className="control-icon-btn"
                            style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.5)" }}
                            onClick={(e) => handleRemove(e, item.id)}
                            title="Retirer des favoris"
                          >
                            <span className="material-icons-round" style={{ color: "#fff", fontSize: "18px" }}>close</span>
                          </button>
                        </div>
                        <div className="card-title">{item.title}</div>
                      </div>
                    ))}
                  </div>
                )}
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
