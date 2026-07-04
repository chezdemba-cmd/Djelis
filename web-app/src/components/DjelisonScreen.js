import { useState, useEffect } from "react";
import { getAudioCatalog } from "../data/catalog";

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

      const saved = localStorage.getItem('djelis_last_watched');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.type === 'Audio') {
          setLastWatched(parsed);
        }
      }
      setIsLoading(false);
    };
    loadAudio();
  }, []);

  if (isLoading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Chargement de l&apos;audio...</div>;
  }

  return (
    <>
      {lastWatched && (
        <div className="content-row last-watched-row" style={{ padding: '0 20px', marginBottom: '20px', marginTop: '20px' }}>
          <div className="row-header">
            <h2>Reprendre l&apos;écoute</h2>
          </div>
          <div 
            className="media-card tv-focusable last-watched-card" 
            onClick={() => {
              const matchedItem = audioCatalog.find(i => i.id === lastWatched.id) || lastWatched;
              if (onPlayAudio) onPlayAudio(matchedItem);
            }}
            style={{ width: '280px', display: 'flex', gap: '15px', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}
          >
            <div className="card-image" style={{ width: '80px', height: '80px', borderRadius: '8px', backgroundImage: `url(${lastWatched.image})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }}>
              <div className="card-play-overlay" style={{ opacity: 1, background: 'rgba(0,0,0,0.3)' }}>
                <span className="material-icons-round" style={{ fontSize: '24px' }}>play_circle_filled</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden', flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lastWatched.title}</div>
              <div style={{ fontSize: '12px', color: '#ffb300', marginTop: '4px', fontWeight: 'bold' }}>Audio - {Math.round(lastWatched.progress)}%</div>
              <div className="progress-bar-mini" style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${lastWatched.progress}%`, height: '100%', background: '#ffb300' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

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
