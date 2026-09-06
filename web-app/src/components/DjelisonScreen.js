import { useState, useEffect } from "react";
import { getAudioCatalog } from "../data/catalog";
import ContinueWatching from "./ContinueWatching";

export default function DjelisonScreen({ currentProfile, onPlayAudio }) {
  const [activeTab, setActiveTab] = useState("podcasts");
  const [audioCatalog, setAudioCatalog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastWatched, setLastWatched] = useState(null);

  useEffect(() => {
    const loadAudio = async () => {
      setIsLoading(true);
      const data = await getAudioCatalog();
      setAudioCatalog(data);

      setIsLoading(false);
      setIsLoading(false);
    };
    loadAudio();
  }, []);

  if (isLoading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Chargement de l&apos;audio...</div>;
  }

  return (
    <>
      <ContinueWatching currentProfile={currentProfile} type="AUDIO" onResume={onPlayAudio} />

      <div className="djelison-tabs-container">
        <div className="djelison-tabs">
          <button 
            className={`djelison-tab-btn tv-focusable ${activeTab === "podcasts" ? "active" : ""}`}
            onClick={() => setActiveTab("podcasts")}
          >
            <span className="material-icons-round">mic</span>
            <span>Podcasts & Récits</span>
          </button>
          <button 
            className={`djelison-tab-btn tv-focusable ${activeTab === "music" ? "active" : ""}`}
            onClick={() => setActiveTab("music")}
          >
            <span className="material-icons-round">music_note</span>
            <span>Musique</span>
          </button>
        </div>
      </div>

      {activeTab === "podcasts" && (
        <div className="djelison-sub-tab-content active">
          <div className="netflix-hero-banner tv-focusable" style={{ backgroundImage: "url('/assets/griot.png')", minHeight: '400px' }}>
             <div className="netflix-hero-vignette"></div>
             <div className="netflix-hero-content">
              <div className="netflix-hero-badge">Podcasts & Contes</div>
              <h2 className="netflix-hero-title" style={{ fontSize: 'clamp(30px, 4vw, 50px)' }}>Écoutez la sagesse de nos ancêtres contée par les plus grands griots.</h2>
              <div className="netflix-hero-actions">
                <button className="btn-netflix-play tv-focusable">
                  <span className="material-icons-round" style={{ fontSize: '28px', marginRight: '5px' }}>play_arrow</span> ÉCOUTER MAINTENANT
                </button>
              </div>
            </div>
          </div>

          <div className="netflix-content-row">
            <h2 className="netflix-row-title">Les Plus Populaires</h2>
            <div className="netflix-slider">
              {audioCatalog.map((item) => (
                <div key={item.id} className="audio-card tv-focusable" onClick={() => onPlayAudio && onPlayAudio(item)} style={{ flex: '0 0 200px', marginRight: '15px' }}>
                  <div className="audio-card-image" style={{ backgroundImage: `url(${item.image})` }}>
                    <button className="audio-card-download tv-focusable">
                      <span className="material-icons-round icon">download</span>
                    </button>
                  </div>
                  <div className="audio-card-title">{item.title}</div>
                  <div className="audio-card-subtitle">{item.artist}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "music" && (
        <div className="djelison-sub-tab-content active">
           <div className="netflix-hero-banner tv-focusable" style={{ backgroundImage: "url('/assets/kora.png')", minHeight: '400px' }}>
            <div className="netflix-hero-vignette"></div>
            <div className="netflix-hero-content">
              <div className="netflix-hero-badge">Festival Acoustique</div>
              <h2 className="netflix-hero-title" style={{ fontSize: 'clamp(30px, 4vw, 50px)' }}>Célébration des rythmes traditionnels.</h2>
              <div className="netflix-hero-actions">
                <button className="btn-netflix-play tv-focusable">
                  <span className="material-icons-round" style={{ fontSize: '28px', marginRight: '5px' }}>play_arrow</span> ÉCOUTER MAINTENANT
                </button>
              </div>
            </div>
          </div>
          <div className="netflix-content-row">
            <h2 className="netflix-row-title">Musique</h2>
            <p style={{ color: 'var(--text-dim)' }}>Le catalogue musical sera bientôt disponible.</p>
          </div>
        </div>
      )}
    </>
  );
}
