import { useState, useRef, useEffect } from "react";
import { useMediaProgress } from "../hooks/useMediaProgress";

export default function MiniPlayer({ audioItem, onClose }) {
  const audioRef = useRef(null);
  useMediaProgress(audioRef, audioItem?.id);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);


  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && audioRef.current.duration > 0) {
      const prog = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(prog);
      
      // Enregistrer l'avancement dans le localStorage pour le widget "Continuer la lecture"
      if (audioItem) {
        localStorage.setItem('djelis_last_watched', JSON.stringify({
          id: audioItem.id,
          title: audioItem.title,
          image: audioItem.image || '/assets/anansi.png',
          type: 'Audio',
          progress: prog,
          audioUrl: audioItem.audioUrl
        }));
      }
    }
  };

  if (!audioItem) return null;

  return (
    <div className="peppy-mini-player">
      <div className="peppy-player-glass">
        
        {/* Album / Track Art Indicator */}
        <div className={`peppy-record ${isPlaying ? 'spinning' : ''}`}>
          <span className="material-icons-round record-icon">music_note</span>
        </div>

        {/* Track Info */}
        <div className="peppy-track-info">
          <div className="peppy-track-title">{audioItem.title}</div>
          <div className="peppy-track-subtitle">DjeliSon Audio</div>
        </div>

        {/* Controls */}
        <div className="peppy-controls">
          <button className="peppy-btn play-btn" onClick={togglePlay}>
            <span className="material-icons-round">{isPlaying ? 'pause' : 'play_arrow'}</span>
          </button>
          <button className="peppy-btn close-btn" onClick={onClose}>
            <span className="material-icons-round">close</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="peppy-progress-bar">
          <div className="peppy-progress-fill" style={{ width: `${progress}%` }}></div>
        </div>

      </div>

      <audio 
        ref={audioRef}
        src={audioItem.audioUrl} 
        autoPlay
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      <style dangerouslySetInnerHTML={{__html: `
        .peppy-mini-player {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          animation: slideUpPeppy 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes slideUpPeppy {
          from { transform: translateY(100px) scale(0.9); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        
        /* Glassmorphism & Vibrant Gradient Container */
        .peppy-player-glass {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 12px 20px 12px 12px;
          background: linear-gradient(135deg, rgba(255, 179, 0, 0.9), rgba(216, 67, 21, 0.9)); /* Vibrant Yellow to Orange/Crimson */
          backdrop-filter: blur(10px);
          border-radius: 50px;
          box-shadow: 0 10px 30px rgba(216, 67, 21, 0.4), inset 0 2px 5px rgba(255,255,255,0.3);
          border: 1px solid rgba(255, 255, 255, 0.4);
          position: relative;
          overflow: hidden;
          width: 320px;
        }

        /* Spinning Record */
        .peppy-record {
          width: 46px;
          height: 46px;
          background: #111;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 0 0 0 3px rgba(255,255,255,0.3);
          flex-shrink: 0;
          position: relative;
        }

        .peppy-record::after {
          content: '';
          position: absolute;
          width: 12px;
          height: 12px;
          background: #ffb300;
          border-radius: 50%;
        }

        .record-icon {
          color: rgba(255,255,255,0.4);
          font-size: 20px;
          z-index: 2;
        }

        .spinning {
          animation: spinRecord 3s linear infinite;
        }

        @keyframes spinRecord {
          100% { transform: rotate(360deg); }
        }

        /* Text Info */
        .peppy-track-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          white-space: nowrap;
        }

        .peppy-track-title {
          font-weight: 800;
          font-size: 15px;
          color: #fff;
          text-shadow: 0 1px 3px rgba(0,0,0,0.3);
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .peppy-track-subtitle {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Buttons */
        .peppy-controls {
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 2;
        }

        .peppy-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: none;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          transition: transform 0.2s, background 0.2s;
        }

        .peppy-btn:hover {
          transform: scale(1.1);
        }

        .peppy-btn:active {
          transform: scale(0.95);
        }

        .play-btn {
          background: #fff;
          color: #E65100;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }

        .play-btn .material-icons-round {
          font-size: 24px;
        }

        .close-btn {
          background: rgba(0,0,0,0.2);
          color: #fff;
          width: 32px;
          height: 32px;
        }

        .close-btn .material-icons-round {
          font-size: 18px;
        }

        /* Progress Bar (Integrated at the bottom of the pill) */
        .peppy-progress-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 5px;
          background: rgba(0,0,0,0.15);
        }

        .peppy-progress-fill {
          height: 100%;
          background: #fff;
          transition: width 0.1s linear;
          box-shadow: 0 0 8px rgba(255,255,255,0.8);
        }

        /* Mobile Adjustments */
        @media (max-width: 480px) {
          .peppy-mini-player {
            bottom: 80px; /* Above bottom nav */
            right: 15px;
            left: 15px;
          }
          .peppy-player-glass {
            width: auto;
          }
        }
      `}} />
    </div>
  );
}
