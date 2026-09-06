import { useState, useEffect } from "react";
import { getCatalog, getFavorites, addFavorite, removeFavorite, isKidsFriendly } from "../data/catalog";
import DetailsModal from "./DetailsModal";
import VideoPlayerScreen from "./VideoPlayerScreen";
import ContinueWatching from "./ContinueWatching";
import HeroCarousel from "./HeroCarousel";

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
    };
    loadCatalog();
  }, []);

  // Les favoris sont propres à chaque profil : on les recharge à chaque changement.
  useEffect(() => {
    const loadFavorites = async () => {
      const favs = await getFavorites(currentProfile?.id);
      setFavoriteIds(new Set(favs.map(f => f.id)));
    };
    loadFavorites();
  }, [currentProfile?.id]);

  const toggleFavorite = async (e, item) => {
    e.stopPropagation();
    const isFavorite = favoriteIds.has(item.id);
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (isFavorite) next.delete(item.id); else next.add(item.id);
      return next;
    });
    if (isFavorite) {
      await removeFavorite(item.id, currentProfile?.id);
    } else {
      await addFavorite(item.id, currentProfile?.id);
    }
  };

  const filterByCategory = (category) => {
    return catalog.filter((item) => {
      const matchCat = item.category === category;
      if (currentProfile?.isKids) {
        return matchCat && isKidsFriendly(item.age);
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

      <ContinueWatching currentProfile={currentProfile} type="VIDEO" onResume={playVideo} />

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
          <HeroCarousel 
            items={cinemaItems} 
            onPlay={playVideo} 
            onOpenDetails={openDetails} 
            mediaType="video" 
          />
          
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
                        <span className="duration">1 h {String(item.id).length % 59} min</span>
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
          <HeroCarousel 
            items={theatreItems} 
            onPlay={playVideo} 
            onOpenDetails={openDetails} 
            mediaType="video" 
          />
          
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
                        <span className="duration">1 h {String(item.id).length % 59} min</span>
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
          <HeroCarousel 
            items={docsItems} 
            onPlay={playVideo} 
            onOpenDetails={openDetails} 
            mediaType="video" 
          />
          
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
