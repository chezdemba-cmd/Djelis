import { useState, useEffect } from "react";
import { getCatalog, getFavorites, addFavorite, removeFavorite } from "../data/catalog";
import DetailsModal from "./DetailsModal";
import VideoPlayerScreen from "./VideoPlayerScreen";
import ContinueWatching from "./ContinueWatching";

export default function DjaasooScreen({ currentProfile }) {
  const [activeTab, setActiveTab] = useState("cinema");
  const [catalog, setCatalog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastWatched, setLastWatched] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  useEffect(() => {
    const loadCatalog = async () => {
      setIsLoading(true);
      const data = await getCatalog();
      setCatalog(data);

      setIsLoading(false);
      setIsLoading(false);
    };
    loadCatalog();

    const loadFavorites = async () => {
      const favs = await getFavorites();
      setFavoriteIds(new Set(favs.map(f => f.id)));
    };
    loadFavorites();
  }, []);

  const toggleFavorite = async (e, item) => {
    e.stopPropagation();
    const isFavorite = favoriteIds.has(item.id);
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (isFavorite) next.delete(item.id); else next.add(item.id);
      return next;
    });
    if (isFavorite) {
      await removeFavorite(item.id);
    } else {
      await addFavorite(item.id);
    }
  };

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

      <ContinueWatching currentProfile={currentProfile} type="VIDEO" />

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
            <div className={`netflix-hero-banner tv-focusable ${cinemaItems[0].bannerClass || ''}`} style={cinemaItems[0].bannerClass ? {} : { backgroundImage: `url(${cinemaItems[0].image})` }}>
              <div className="netflix-hero-vignette"></div>
              <div className="netflix-hero-content">
                <div className="netflix-hero-badge">{cinemaItems[0].tag}</div>
                <h1 className="netflix-hero-title">{cinemaItems[0].title}</h1>
                <p className="netflix-hero-synopsis">{cinemaItems[0].synopsis}</p>
                <div className="netflix-hero-actions">
                  <button className="btn-netflix-play tv-focusable" onClick={() => playVideo(cinemaItems[0])}>
                    <span className="material-icons-round" style={{ fontSize: '28px', marginRight: '5px' }}>play_arrow</span> Lecture
                  </button>
                  <button className="btn-netflix-info tv-focusable" onClick={() => openDetails(cinemaItems[0])}>
                    <span className="material-icons-round" style={{ fontSize: '28px', marginRight: '8px' }}>info_outline</span> Plus d'infos
                  </button>
                </div>
              </div>
              <div className="netflix-hero-age-rating">
                <span>{cinemaItems[0].age || '13+'}</span>
              </div>
            </div>
          )}
          
          <div className="netflix-content-row">
            <h2 className="netflix-row-title">Films Populaires <span className="explore-all">Tout explorer <span className="material-icons-round">chevron_right</span></span></h2>
            <div className="netflix-slider">
              {cinemaItems.map((item) => (
                <div key={item.id} className="netflix-card tv-focusable" onClick={() => openDetails(item)}>
                  <div className="netflix-card-img-container">
                    <img src={item.image} alt={item.title} className="netflix-card-img" />
                  </div>
                  <div className="netflix-card-hover">
                    <div className="netflix-card-hover-img" style={{ backgroundImage: `url(${item.image})` }}></div>
                    <div className="netflix-card-hover-content">
                      <div className="netflix-card-controls">
                        <div className="controls-left">
                          <button className="circle-btn play-btn" onClick={(e) => { e.stopPropagation(); playVideo(item); }}>
                            <span className="material-icons-round">play_arrow</span>
                          </button>
                          <button className="circle-btn" onClick={(e) => toggleFavorite(e, item)} title={favoriteIds.has(item.id) ? "Retirer de Ma Liste" : "Ajouter à Ma Liste"}>
                            <span className="material-icons-round">{favoriteIds.has(item.id) ? "check" : "add"}</span>
                          </button>
                          <button className="circle-btn" onClick={(e) => { e.stopPropagation(); }}>
                            <span className="material-icons-round">thumb_up</span>
                          </button>
                        </div>
                        <div className="controls-right">
                          <button className="circle-btn" onClick={() => openDetails(item)}>
                            <span className="material-icons-round">expand_more</span>
                          </button>
                        </div>
                      </div>
                      <div className="netflix-card-metadata">
                        <span className="match-score">Recommandé à 98%</span>
                        <span className="age-rating">{item.age || '16+'}</span>
                        <span className="duration">1 h {Math.floor(Math.random() * 59)} min</span>
                        <span className="resolution">HD</span>
                      </div>
                      <div className="netflix-card-tags">
                        <span>Sensationnel</span> • <span>Action</span> • <span>Palpitant</span>
                      </div>
                    </div>
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
            <div className={`netflix-hero-banner tv-focusable ${theatreItems[0].bannerClass || ''}`} style={theatreItems[0].bannerClass ? {} : { backgroundImage: `url(${theatreItems[0].image})` }}>
              <div className="netflix-hero-vignette"></div>
              <div className="netflix-hero-content">
                <div className="netflix-hero-badge">{theatreItems[0].tag}</div>
                <h1 className="netflix-hero-title">{theatreItems[0].title}</h1>
                <p className="netflix-hero-synopsis">{theatreItems[0].synopsis}</p>
                <div className="netflix-hero-actions">
                  <button className="btn-netflix-play tv-focusable" onClick={() => playVideo(theatreItems[0])}>
                    <span className="material-icons-round" style={{ fontSize: '28px', marginRight: '5px' }}>play_arrow</span> Lecture
                  </button>
                  <button className="btn-netflix-info tv-focusable" onClick={() => openDetails(theatreItems[0])}>
                    <span className="material-icons-round" style={{ fontSize: '28px', marginRight: '8px' }}>info_outline</span> Plus d'infos
                  </button>
                </div>
              </div>
              <div className="netflix-hero-age-rating">
                <span>{theatreItems[0].age || '13+'}</span>
              </div>
            </div>
          )}
          
          <div className="netflix-content-row">
            <h2 className="netflix-row-title">Spectacles en vedette <span className="explore-all">Tout explorer <span className="material-icons-round">chevron_right</span></span></h2>
            <div className="netflix-slider">
              {theatreItems.map((item) => (
                <div key={item.id} className="netflix-card tv-focusable" onClick={() => openDetails(item)}>
                  <div className="netflix-card-img-container">
                    <img src={item.image} alt={item.title} className="netflix-card-img" />
                  </div>
                  <div className="netflix-card-hover">
                    <div className="netflix-card-hover-img" style={{ backgroundImage: `url(${item.image})` }}></div>
                    <div className="netflix-card-hover-content">
                      <div className="netflix-card-controls">
                        <div className="controls-left">
                          <button className="circle-btn play-btn" onClick={(e) => { e.stopPropagation(); playVideo(item); }}>
                            <span className="material-icons-round">play_arrow</span>
                          </button>
                          <button className="circle-btn" onClick={(e) => toggleFavorite(e, item)} title={favoriteIds.has(item.id) ? "Retirer de Ma Liste" : "Ajouter à Ma Liste"}>
                            <span className="material-icons-round">{favoriteIds.has(item.id) ? "check" : "add"}</span>
                          </button>
                          <button className="circle-btn" onClick={(e) => { e.stopPropagation(); }}>
                            <span className="material-icons-round">thumb_up</span>
                          </button>
                        </div>
                        <div className="controls-right">
                          <button className="circle-btn" onClick={() => openDetails(item)}>
                            <span className="material-icons-round">expand_more</span>
                          </button>
                        </div>
                      </div>
                      <div className="netflix-card-metadata">
                        <span className="match-score">Recommandé à 98%</span>
                        <span className="age-rating">{item.age || '16+'}</span>
                        <span className="duration">1 h {Math.floor(Math.random() * 59)} min</span>
                        <span className="resolution">HD</span>
                      </div>
                      <div className="netflix-card-tags">
                        <span>Hilarant</span> • <span>Stand-up</span> • <span>Live</span>
                      </div>
                    </div>
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
            <div className={`netflix-hero-banner tv-focusable ${docsItems[0].bannerClass || ''}`} style={docsItems[0].bannerClass ? {} : { backgroundImage: `url(${docsItems[0].image})` }}>
              <div className="netflix-hero-vignette"></div>
              <div className="netflix-hero-content">
                <div className="netflix-hero-badge">{docsItems[0].tag}</div>
                <h1 className="netflix-hero-title">{docsItems[0].title}</h1>
                <p className="netflix-hero-synopsis">{docsItems[0].synopsis}</p>
                <div className="netflix-hero-actions">
                  <button className="btn-netflix-play tv-focusable" onClick={() => playVideo(docsItems[0])}>
                    <span className="material-icons-round" style={{ fontSize: '28px', marginRight: '5px' }}>play_arrow</span> Lecture
                  </button>
                  <button className="btn-netflix-info tv-focusable" onClick={() => openDetails(docsItems[0])}>
                    <span className="material-icons-round" style={{ fontSize: '28px', marginRight: '8px' }}>info_outline</span> Plus d'infos
                  </button>
                </div>
              </div>
              <div className="netflix-hero-age-rating">
                <span>{docsItems[0].age || '10+'}</span>
              </div>
            </div>
          )}
          
          <div className="netflix-content-row">
            <h2 className="netflix-row-title">Culture & Découverte <span className="explore-all">Tout explorer <span className="material-icons-round">chevron_right</span></span></h2>
            <div className="netflix-slider">
              {docsItems.map((item) => (
                <div key={item.id} className="netflix-card tv-focusable" onClick={() => openDetails(item)}>
                  <div className="netflix-card-img-container">
                    <img src={item.image} alt={item.title} className="netflix-card-img" />
                  </div>
                  <div className="netflix-card-hover">
                    <div className="netflix-card-hover-img" style={{ backgroundImage: `url(${item.image})` }}></div>
                    <div className="netflix-card-hover-content">
                      <div className="netflix-card-controls">
                        <div className="controls-left">
                          <button className="circle-btn play-btn" onClick={(e) => { e.stopPropagation(); playVideo(item); }}>
                            <span className="material-icons-round">play_arrow</span>
                          </button>
                          <button className="circle-btn" onClick={(e) => toggleFavorite(e, item)} title={favoriteIds.has(item.id) ? "Retirer de Ma Liste" : "Ajouter à Ma Liste"}>
                            <span className="material-icons-round">{favoriteIds.has(item.id) ? "check" : "add"}</span>
                          </button>
                          <button className="circle-btn" onClick={(e) => { e.stopPropagation(); }}>
                            <span className="material-icons-round">thumb_up</span>
                          </button>
                        </div>
                        <div className="controls-right">
                          <button className="circle-btn" onClick={() => openDetails(item)}>
                            <span className="material-icons-round">expand_more</span>
                          </button>
                        </div>
                      </div>
                      <div className="netflix-card-metadata">
                        <span className="match-score">Recommandé à 98%</span>
                        <span className="age-rating">{item.age || '10+'}</span>
                        <span className="duration">52 min</span>
                        <span className="resolution">HD</span>
                      </div>
                      <div className="netflix-card-tags">
                        <span>Fascinant</span> • <span>Histoire</span> • <span>Nature</span>
                      </div>
                    </div>
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
