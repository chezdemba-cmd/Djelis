import { useState, useRef, useEffect } from "react";
import Hls from "hls.js";
import { useMediaProgress } from "../hooks/useMediaProgress";
import { getPlaybackUrl } from "../data/catalog";
import { useSession } from "../context/SessionContext";

export default function VideoPlayerScreen({ isOpen, onClose, videoItem }) {
  const { currentProfile } = useSession();
  const contentId = videoItem?.contentId || videoItem?.id;
  const episodeId = videoItem?.episodeId || null;
  const [videoUrl, setVideoUrl] = useState(null);
  const [playbackError, setPlaybackError] = useState(null);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const hlsRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [duration, setDuration] = useState("00:00");
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDataSaver, setIsDataSaver] = useState(
    typeof window !== "undefined" && localStorage.getItem("djelis_data_saver") === "1"
  );

  useMediaProgress(videoRef, contentId, episodeId, currentProfile?.id || null);

  // Résout l'URL de lecture (signée, courte durée) à chaque ouverture du lecteur.
  useEffect(() => {
    if (!isOpen) return undefined;
    let cancelled = false;

    const resolvePlayback = async () => {
      if (videoItem?.videoUrl) {
        if (!cancelled) {
          setPlaybackError(null);
          setVideoUrl(videoItem.videoUrl);
        }
        return;
      }
      if (!contentId) {
        if (!cancelled) setPlaybackError("Contenu indisponible.");
        return;
      }
      if (!cancelled) {
        setPlaybackError(null);
        setVideoUrl(null);
      }
      const url = await getPlaybackUrl(contentId, episodeId);
      if (cancelled) return;
      if (url) setVideoUrl(url);
      else
        setPlaybackError(
          "Lecture non autorisée : un abonnement ou une location actifs sont requis."
        );
    };

    resolvePlayback();
    return () => {
      cancelled = true;
    };
  }, [isOpen, videoItem, contentId, episodeId]);

  // Charge la source vidéo : hls.js pour les manifests HLS sur les navigateurs
  // sans support natif (Chrome/Firefox/Android), lecture directe sinon (Safari, MP4).
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    let hls;
    const isHlsManifest = videoUrl.includes(".m3u8");

    if (isHlsManifest && !video.canPlayType("application/vnd.apple.mpegurl") && Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (isDataSaver) hls.autoLevelCapping = 0; // niveau de qualité le plus bas disponible
      });
    } else {
      video.src = videoUrl;
    }
    hlsRef.current = hls || null;

    return () => {
      if (hls) hls.destroy();
      hlsRef.current = null;
    };
  }, [videoUrl, isDataSaver]);

  const toggleDataSaver = (e) => {
    e?.stopPropagation();
    const next = !isDataSaver;
    setIsDataSaver(next);
    localStorage.setItem("djelis_data_saver", next ? "1" : "0");
    if (hlsRef.current) {
      // -1 = pas de plafond (adaptatif automatique), 0 = plus basse qualité disponible.
      hlsRef.current.autoLevelCapping = next ? 0 : -1;
    }
  };

  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3500);
  };

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play().catch(console.error);
      setIsPlaying(true);
      resetControlsTimeout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, videoUrl]);

  const togglePlay = (e) => {
    e?.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current || !videoItem) return;
    const total = videoRef.current.duration;

    // Position de reprise explicite (venue de "Continuer la lecture") : prioritaire.
    const startAt = Number(videoItem.startAt) || 0;
    if (startAt > 0 && (!total || startAt < total - 5)) {
      videoRef.current.currentTime = startAt;
      return;
    }

    try {
      const saved = JSON.parse(localStorage.getItem('djelis_last_watched') || 'null');
      if (saved && saved.id === videoItem.id && saved.currentTime > 0 && saved.currentTime < total - 5) {
        videoRef.current.currentTime = saved.currentTime;
      }
    } catch {
      // Donnée de reprise invalide ou absente: on démarre simplement du début.
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration || 0;
      const prog = (current / total) * 100;
      setProgress(prog);
      setCurrentTime(formatTime(current));
      setDuration(formatTime(total));
      
      // Enregistrer l'avancement dans le localStorage pour le widget "Continuer la lecture"
      if (videoItem && total > 0) {
        localStorage.setItem('djelis_last_watched', JSON.stringify({
          id: videoItem.id,
          title: videoItem.title,
          image: videoItem.image,
          type: 'Video',
          progress: prog,
          videoUrl: videoItem.videoUrl,
          currentTime: current
        }));
      }
    }
  };

  const handleProgressClick = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * videoRef.current.duration;
    }
  };

  const toggleMute = (e) => {
    e?.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const toggleFullscreen = (e) => {
    e?.stopPropagation();
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const m = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
    const s = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (!isOpen) return null;

  if (playbackError) {
    return (
      <div
        className="video-player-overlay custom-player-overlay"
        style={{ display: "flex", opacity: 1, zIndex: 99999, flexDirection: "column", gap: "20px", background: "#050505", color: "white", textAlign: "center", padding: "24px" }}
      >
        <span className="material-icons-round" style={{ fontSize: "48px", color: "#FFB300" }}>lock</span>
        <p style={{ maxWidth: "420px", fontSize: "16px", lineHeight: 1.5 }}>{playbackError}</p>
        <button
          onClick={onClose}
          style={{ background: "#FFB300", color: "#000", border: "none", padding: "12px 24px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}
        >
          Retour
        </button>
      </div>
    );
  }

  return (
    <div 
      className="video-player-overlay custom-player-overlay" 
      id="video-player-screen"
      style={{ display: "flex", opacity: 1, zIndex: 99999 }}
      ref={containerRef}
      onMouseMove={resetControlsTimeout}
      onClick={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        playsInline
        className="custom-video-element"
        onClick={togglePlay}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      ></video>

      {/* Top Left Back Button */}
      <button 
        className={`custom-back-btn ${showControls ? 'visible' : 'hidden'}`} 
        onClick={(e) => {
           e.stopPropagation();
           if (document.fullscreenElement) document.exitFullscreen();
           onClose();
        }}
      >
        <span className="material-icons-round">arrow_back</span>
      </button>

      {/* Large Center Play/Pause Indicator */}
      <div 
        className={`center-play-pause ${!isPlaying ? 'visible' : 'hidden'}`}
        onClick={togglePlay}
      >
        <span className="material-icons-round" style={{ marginLeft: !isPlaying ? '6px' : '0' }}>
          {isPlaying ? 'pause' : 'play_arrow'}
        </span>
      </div>

      {/* Bottom Floating Control Bar (Glassmorphism) */}
      <div className={`custom-controls-bar ${showControls ? 'visible' : 'hidden'}`} onClick={e => e.stopPropagation()}>
        
        {/* Progress Timeline */}
        <div className="custom-progress-container" onClick={handleProgressClick}>
          <div className="custom-progress-bg">
            <div className="custom-progress-fill" style={{ width: `${progress}%` }}>
              <div className="custom-progress-thumb"></div>
            </div>
          </div>
        </div>

        <div className="controls-row">
          <div className="controls-left">
            <button className="control-icon-btn play-toggle-btn" onClick={togglePlay}>
              <span className="material-icons-round">{isPlaying ? 'pause' : 'play_arrow'}</span>
            </button>
            <button className="control-icon-btn" onClick={toggleMute}>
              <span className="material-icons-round">{isMuted ? 'volume_off' : 'volume_up'}</span>
            </button>
            <span className="time-display">{currentTime} <span style={{opacity: 0.4, fontWeight: 400}}>/ {duration}</span></span>
          </div>

          <div className="controls-right">
            <button
              className="control-icon-btn"
              onClick={toggleDataSaver}
              title={isDataSaver ? "Désactiver l'économie de données" : "Activer l'économie de données"}
              style={isDataSaver ? { color: "#FFB300" } : undefined}
            >
              <span className="material-icons-round">{isDataSaver ? 'data_saver_on' : 'data_saver_off'}</span>
            </button>
            <button className="control-icon-btn" onClick={toggleFullscreen}>
              <span className="material-icons-round">{isFullscreen ? 'fullscreen_exit' : 'fullscreen'}</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Inline styles for the Custom Player */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-player-overlay {
          background-color: #050505;
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .custom-video-element {
          width: 100%;
          height: 100%;
          object-fit: contain;
          cursor: pointer;
        }
        .custom-back-btn {
          position: absolute;
          top: 32px;
          left: 32px;
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.15);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          z-index: 10;
        }
        .custom-back-btn:hover {
          background: var(--primary-gold, #FFB300);
          border-color: transparent;
          color: #000;
          transform: scale(1.1);
          box-shadow: 0 8px 25px rgba(255, 179, 0, 0.4);
        }
        .center-play-pause {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90px;
          height: 90px;
          background: rgba(255, 179, 0, 0.95);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 12px 35px rgba(255, 179, 0, 0.4), inset 0 0 0 4px rgba(255, 255, 255, 0.2);
          z-index: 10;
        }
        .center-play-pause .material-icons-round {
          font-size: 48px;
          color: #000;
        }
        .center-play-pause:hover {
          transform: translate(-50%, -50%) scale(1.1);
          background: #FFC107;
        }
        .center-play-pause.hidden {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.6);
          pointer-events: none;
        }
        .custom-controls-bar {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 900px;
          background: rgba(18, 18, 20, 0.65);
          backdrop-filter: blur(24px) saturate(150%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px;
          padding: 20px 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          z-index: 10;
          box-shadow: 0 24px 50px rgba(0,0,0,0.6);
        }
        .custom-controls-bar.hidden {
          opacity: 0;
          transform: translateX(-50%) translateY(40px);
          pointer-events: none;
        }
        .custom-progress-container {
          width: 100%;
          height: 24px;
          display: flex;
          align-items: center;
          cursor: pointer;
          position: relative;
        }
        .custom-progress-bg {
          width: 100%;
          height: 6px;
          background: rgba(255,255,255,0.15);
          border-radius: 4px;
          position: relative;
          overflow: visible;
          transition: height 0.2s ease;
        }
        .custom-progress-container:hover .custom-progress-bg {
          height: 8px;
        }
        .custom-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #ff9100 0%, #ffc400 100%);
          border-radius: 4px;
          position: relative;
          box-shadow: 0 0 12px rgba(255, 179, 0, 0.6);
        }
        .custom-progress-thumb {
          position: absolute;
          right: -8px;
          top: 50%;
          transform: translateY(-50%) scale(0);
          width: 18px;
          height: 18px;
          background: #ffffff;
          border-radius: 50%;
          box-shadow: 0 2px 10px rgba(0,0,0,0.5);
          transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .custom-progress-container:hover .custom-progress-thumb {
          transform: translateY(-50%) scale(1);
        }
        .controls-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .controls-left, .controls-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .control-icon-btn {
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.85);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          border-radius: 50%;
          width: 40px;
          height: 40px;
        }
        .control-icon-btn:hover {
          color: #ffb300;
          background: rgba(255,255,255,0.12);
          transform: scale(1.1);
        }
        .play-toggle-btn {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }
        .time-display {
          font-size: 15px;
          font-weight: 700;
          color: white;
          letter-spacing: 0.5px;
          margin-left: 8px;
        }
        
        .visible {
          opacity: 1;
        }
        .hidden {
          opacity: 0;
          pointer-events: none;
        }
      `}} />
    </div>
  );
}
