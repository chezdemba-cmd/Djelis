import { useState, useEffect } from "react";
import { getAudioCatalog } from "../data/catalog";
import ContinueWatching from "./ContinueWatching";
import HeroCarousel from "./HeroCarousel";

export default function DjelisonScreen({ currentProfile, onPlayAudio }) {
  const [activeTab, setActiveTab] = useState("music");
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
    return <div style={{ padding: "40px", textAlign: "center", color: "#ccc" }}>Chargement des morceaux & récits...</div>;
  }

  const musicList = audioCatalog.filter(
    (item) =>
      item.category === "music" ||
      item.isClip ||
      (item.genre && item.genre.toLowerCase().includes("musique"))
  );

  const podcastList = audioCatalog.filter(
    (item) =>
      item.category === "podcasts" &&
      !item.isClip &&
      !(item.genre && item.genre.toLowerCase().includes("musique"))
  );

  return (
    <>
      <ContinueWatching currentProfile={currentProfile} type="AUDIO" onResume={onPlayAudio} />

      <div className="djelison-tabs-container">
        <div className="djelison-tabs">
          <button
            className={`djelison-tab-btn tv-focusable ${activeTab === "music" ? "active" : ""}`}
            onClick={() => setActiveTab("music")}
          >
            <span className="material-icons-round">music_note</span>
            <span>Musique & Clips</span>
          </button>
          <button
            className={`djelison-tab-btn tv-focusable ${activeTab === "podcasts" ? "active" : ""}`}
            onClick={() => setActiveTab("podcasts")}
          >
            <span className="material-icons-round">mic</span>
            <span>Podcasts & Récits</span>
          </button>
        </div>
      </div>

      {activeTab === "music" && (
        <div className="djelison-sub-tab-content active">
          {/* Grand écran carrousel animé avec les 10 dernières publications Musique & Clips */}
          <HeroCarousel
            items={musicList.length > 0 ? musicList : audioCatalog}
            onPlay={onPlayAudio}
            mediaType="video"
          />

          <div className="netflix-content-row" style={{ marginTop: "24px" }}>
            <h2 className="netflix-row-title">Morceaux & Clips Vidéos</h2>
            <div className="netflix-slider" style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
              {(musicList.length > 0 ? musicList : audioCatalog).map((item) => (
                <div
                  key={item.id}
                  className="audio-card tv-focusable"
                  onClick={() => onPlayAudio && onPlayAudio(item)}
                  style={{
                    flex: "0 0 220px",
                    cursor: "pointer",
                    position: "relative",
                    transition: "transform 0.25s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <div
                    className="audio-card-image"
                    style={{
                      backgroundImage: `url(${item.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      borderRadius: "12px",
                      height: "140px",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {item.isClip && (
                      <span
                        style={{
                          position: "absolute",
                          top: "8px",
                          right: "8px",
                          background: "rgba(229, 9, 20, 0.9)",
                          color: "white",
                          padding: "3px 8px",
                          borderRadius: "10px",
                          fontSize: "11px",
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          gap: "3px",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                        }}
                      >
                        <span className="material-icons-round" style={{ fontSize: "14px" }}>smart_display</span>
                        Clip
                      </span>
                    )}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        className="material-icons-round"
                        style={{ fontSize: "40px", color: "rgba(255,255,255,0.9)", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))" }}
                      >
                        {item.isClip ? "play_circle_filled" : "play_circle"}
                      </span>
                    </div>
                  </div>
                  <div className="audio-card-title" style={{ marginTop: "10px", fontWeight: "700", fontSize: "15px" }}>
                    {item.title}
                  </div>
                  <div className="audio-card-subtitle" style={{ color: "#aaa", fontSize: "13px" }}>
                    {item.artist}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "podcasts" && (
        <div className="djelison-sub-tab-content active">
          {/* Grand écran carrousel animé avec les 10 dernières publications Podcasts & Récits */}
          <HeroCarousel
            items={podcastList.length > 0 ? podcastList : audioCatalog}
            onPlay={onPlayAudio}
            mediaType="audio"
          />

          <div className="netflix-content-row" style={{ marginTop: "24px" }}>
            <h2 className="netflix-row-title">Podcasts & Récits</h2>
            <div className="netflix-slider" style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
              {(podcastList.length > 0 ? podcastList : audioCatalog).map((item) => (
                <div
                  key={item.id}
                  className="audio-card tv-focusable"
                  onClick={() => onPlayAudio && onPlayAudio(item)}
                  style={{
                    flex: "0 0 220px",
                    cursor: "pointer",
                    position: "relative",
                    transition: "transform 0.25s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <div
                    className="audio-card-image"
                    style={{
                      backgroundImage: `url(${item.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      borderRadius: "12px",
                      height: "140px",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        className="material-icons-round"
                        style={{ fontSize: "40px", color: "rgba(255,255,255,0.9)", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))" }}
                      >
                        play_circle
                      </span>
                    </div>
                  </div>
                  <div className="audio-card-title" style={{ marginTop: "10px", fontWeight: "700", fontSize: "15px" }}>
                    {item.title}
                  </div>
                  <div className="audio-card-subtitle" style={{ color: "#aaa", fontSize: "13px" }}>
                    {item.artist}
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
