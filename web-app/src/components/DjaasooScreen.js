import { useState, useEffect } from "react";
import { getCatalog } from "../data/catalog";
import DetailsModal from "./DetailsModal";
import VideoPlayerScreen from "./VideoPlayerScreen";

export default function DjaasooScreen({ currentProfile }) {
  const [activeTab, setActiveTab] = useState("cinema");
  const [catalog, setCatalog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastWatched, setLastWatched] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  useEffect(() => {
    const loadCatalog = async () => {
      setIsLoading(true);
      const data = await getCatalog();
      setCatalog(data);
      
      const saved = localStorage.getItem('djelis_last_watched');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.type === 'Video') {
          setLastWatched(parsed);
        }
      }
      setIsLoading(false);
    };
    loadCatalog();
  }, []);

  const filterByCategory = (category) => {
    return catalog.filter((item) => {
      const matchCat = item.category === category;
      if (currentProfile?.isKids) {
        return matchCat && item.age !== "12+" && item.age !== "16+";
      }
      return matchCat;
    });
  };

  const cinemaItems = filterByCategory("cinema");
  const theatreItems = filterByCategory("theatre");
  const docsItems = filterByCategory("docs");

  const openDetails = (item) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };
  const closeDetails = () => {
    setSelectedItem(null);
    setIsDetailsOpen(false);
  };
  
  const playVideo = (item) => {
    setIsDetailsOpen(false);
    setPlayingVideo(item);
    setIsVideoOpen(true);
  };
  const closeVideo = () => {
    setIsVideoOpen(false);
    setPlayingVideo(null);
  };

  if (isLoading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Chargement du catalogue...</div>;
  }

  return (
    <>
      <DetailsModal 
        isOpen={isDetailsOpen} 
        item={selectedItem} 
        onClose={closeDetails} 
        onPlay={() => playVideo(selectedItem)} 
      />
      
      <VideoPlayerScreen 
        isOpen={isVideoOpen} 
        videoItem={playingVideo}
        onClose={closeVideo} 
      />

      {lastWatched && (
        <div className="content-row last-watched-row" style={{ padding: '0 20px', marginBottom: '20px', marginTop: '20px' }}>
          <div className="row-header">
            <h2>Reprendre la lecture</h2>
          </div>
          <div 
            className="media-card tv-focusable last-watched-card" 
            onClick={() => {
              const matchedItem = catalog.find(i => i.id === lastWatched.id) || lastWatched;
              playVideo(matchedItem);
            }}
            style={{ width: '280px', display: 'flex', gap: '15px', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}
          >
            <div className="card-image" style={{ width: '120px', height: '70px', borderRadius: '8px', backgroundImage: `url(${lastWatched.image})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }}>
              <div className="card-play-overlay" style={{ opacity: 1, background: 'rgba(0,0,0,0.3)' }}>
                <span className="material-icons-round" style={{ fontSize: '24px' }}>play_circle_filled</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden', flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lastWatched.title}</div>
              <div style={{ fontSize: '12px', color: '#ffb300', marginTop: '4px', fontWeight: 'bold' }}>Vidéo - {Math.round(lastWatched.progress)}%</div>
              <div className="progress-bar-mini" style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${lastWatched.progress}%`, height: '100%', background: '#ffb300' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="djaasoo-tabs-container">
        <div className="djaasoo-tabs">
          <button 
            className={`djaasoo-tab-btn tv-focusable ${activeTab === "cinema" ? "active" : ""}`}
            onClick={() => setActiveTab("cinema")}
          >
            <span className="material-icons-round">movie</span>
            <span>Cinéma & Séries</span>
          </button>
          <button 
            className={`djaasoo-tab-btn tv-focusable ${activeTab === "theatre" ? "active" : ""}`}
            onClick={() => setActiveTab("theatre")}
          >
            <span className="material-icons-round">theater_comedy</span>
            <span>Théâtre & Humour</span>
          </button>
          <button 
            className={`djaasoo-tab-btn tv-focusable ${activeTab === "docs" ? "active" : ""}`}
            onClick={() => setActiveTab("docs")}
          >
            <span className="material-icons-round">explore</span>
            <span>Documentaires</span>
          </button>
        </div>
      </div>

      {activeTab === "cinema" && (
        <div className="djaasoo-sub-tab-content active">
          {cinemaItems.length > 0 && (
            <div className={`hero-banner tv-focusable ${cinemaItems[0].bannerClass || ''}`} style={cinemaItems[0].bannerClass ? {} : { backgroundImage: `url(${cinemaItems[0].image})` }}>
              <div className="hero-badge">{cinemaItems[0].tag}</div>
              <h1 className="hero-title">{cinemaItems[0].title}</h1>
              <p className="hero-synopsis">{cinemaItems[0].synopsis}</p>
              <div className="hero-actions">
                <button className="play-btn-large tv-focusable">
                  <span className="material-icons-round">play_arrow</span> Regarder
                </button>
              </div>
            </div>
          )}
          
          <div className="content-row">
            <div className="row-header">
              <h2>Les Plus Populaires</h2>
              <a href="#" className="see-all">Voir tout</a>
            </div>
            <div className="horizontal-scroll">
              {cinemaItems.map((item) => (
                <div key={item.id} className="media-card tv-focusable" onClick={() => openDetails(item)}>
                  <div className="card-image" style={{ backgroundImage: `url(${item.image})` }}>
                    <div className="card-play-overlay">
                      <span className="material-icons-round">play_circle_filled</span>
                    </div>
                  </div>
                  <div className="card-title">{item.title}</div>
                  <div className="card-meta">
                    <span className="card-desc">{item.synopsis.substring(0, 40)}...</span>
                    <span className="card-rating"><span className="material-icons-round">star</span> 4.8</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "theatre" && (
        <div className="djaasoo-sub-tab-content active">
          {theatreItems.length > 0 && (
            <div className={`hero-banner tv-focusable ${theatreItems[0].bannerClass || ''}`} style={theatreItems[0].bannerClass ? {} : { backgroundImage: `url(${theatreItems[0].image})` }}>
              <div className="hero-badge">{theatreItems[0].tag}</div>
              <h1 className="hero-title">{theatreItems[0].title}</h1>
              <p className="hero-synopsis">{theatreItems[0].synopsis}</p>
              <div className="hero-actions">
                <button className="play-btn-large tv-focusable">
                  <span className="material-icons-round">play_arrow</span> Regarder
                </button>
              </div>
            </div>
          )}
          
          <div className="content-row">
            <div className="row-header">
              <h2>Spectacles en vedette</h2>
              <a href="#" className="see-all">Voir tout</a>
            </div>
            <div className="horizontal-scroll">
              {theatreItems.map((item) => (
                <div key={item.id} className="media-card tv-focusable" onClick={() => openDetails(item)}>
                  <div className="card-image" style={{ backgroundImage: `url(${item.image})` }}>
                    <div className="card-play-overlay">
                      <span className="material-icons-round">play_circle_filled</span>
                    </div>
                  </div>
                  <div className="card-title">{item.title}</div>
                  <div className="card-meta">
                    <span className="card-desc">{item.synopsis.substring(0, 40)}...</span>
                    <span className="card-rating"><span className="material-icons-round">star</span> 4.7</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "docs" && (
        <div className="djaasoo-sub-tab-content active">
          {docsItems.length > 0 && (
            <div className={`hero-banner tv-focusable ${docsItems[0].bannerClass || ''}`} style={docsItems[0].bannerClass ? {} : { backgroundImage: `url(${docsItems[0].image})` }}>
              <div className="hero-badge">{docsItems[0].tag}</div>
              <h1 className="hero-title">{docsItems[0].title}</h1>
              <p className="hero-synopsis">{docsItems[0].synopsis}</p>
              <div className="hero-actions">
                <button className="play-btn-large tv-focusable">
                  <span className="material-icons-round">play_arrow</span> Regarder
                </button>
              </div>
            </div>
          )}
          
          <div className="content-row">
            <div className="row-header">
              <h2>Culture & Découverte</h2>
              <a href="#" className="see-all">Voir tout</a>
            </div>
            <div className="horizontal-scroll">
              {docsItems.map((item) => (
                <div key={item.id} className="media-card tv-focusable" onClick={() => openDetails(item)}>
                  <div className="card-image" style={{ backgroundImage: `url(${item.image})` }}>
                    <div className="card-play-overlay">
                      <span className="material-icons-round">play_circle_filled</span>
                    </div>
                  </div>
                  <div className="card-title">{item.title}</div>
                  <div className="card-meta">
                    <span className="card-desc">{item.synopsis.substring(0, 40)}...</span>
                    <span className="card-rating"><span className="material-icons-round">star</span> 4.9</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
