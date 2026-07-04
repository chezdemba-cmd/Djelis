import { useState, useEffect } from "react";
import { getCatalog } from "../data/catalog";
import DetailsModal from "./DetailsModal";
import VideoPlayerScreen from "./VideoPlayerScreen";

export default function DjaasooScreen() {
  const [activeTab, setActiveTab] = useState("cinema");
  const [catalog, setCatalog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  useEffect(() => {
    const loadCatalog = async () => {
      setIsLoading(true);
      const data = await getCatalog();
      setCatalog(data);
      setIsLoading(false);
    };
    loadCatalog();
  }, []);

  const filterByCategory = (category) => {
    return catalog.filter((item) => item.category === category);
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
        videoUrl={selectedItem?.videoUrl} 
        contentId={selectedItem?.id}
        onClose={closeVideo} 
      />

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
