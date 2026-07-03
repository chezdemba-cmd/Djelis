import { useState, useEffect } from "react";
import { getAudioCatalog } from "../data/catalog";

export default function DjelisonScreen({ onPlayAudio }) {
  const [activeTab, setActiveTab] = useState("podcasts");
  const [audioCatalog, setAudioCatalog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAudio = async () => {
      setIsLoading(true);
      const data = await getAudioCatalog();
      setAudioCatalog(data);
      setIsLoading(false);
    };
    loadAudio();
  }, []);

  if (isLoading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Chargement de l'audio...</div>;
  }

  return (
    <>
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
          <div className="audio-banner tv-focusable" style={{ backgroundImage: "url('/assets/griot.png')" }}>
            <span className="banner-badge">Podcasts & Contes</span>
            <h2 className="banner-title">Écoutez la sagesse de nos ancêtres contée par les plus grands griots.</h2>
            <button className="listen-btn">ÉCOUTER MAINTENANT</button>
          </div>

          <div className="content-row">
            <div className="row-header">
              <h2>Les Plus Populaires</h2>
            </div>
            <div className="horizontal-scroll">
              {audioCatalog.map((item) => (
                <div key={item.id} className="audio-card tv-focusable" onClick={() => onPlayAudio && onPlayAudio(item)}>
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
           <div className="audio-banner tv-focusable" style={{ backgroundImage: "url('/assets/kora.png')" }}>
            <span className="banner-badge">Festival Acoustique</span>
            <h2 className="banner-title">Célébration des rythmes traditionnels.</h2>
            <button className="listen-btn">ÉCOUTER MAINTENANT</button>
          </div>
          <div className="content-row">
            <div className="row-header">
              <h2>Musique</h2>
            </div>
            <p style={{ color: 'var(--text-dim)', padding: '0 5%' }}>Le catalogue musical sera bientôt disponible.</p>
          </div>
        </div>
      )}
    </>
  );
}
