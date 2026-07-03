import { useState, useRef, useEffect } from "react";

export default function MiniPlayer({ audioItem, onClose }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  // When audioItem changes, we want to play it automatically
  useEffect(() => {
    if (audioItem) {
      setIsPlaying(true);
      setProgress(0);
    }
  }, [audioItem]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration > 0) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  if (!audioItem) return null;

  return (
    <div className="mini-player" id="mini-player" style={{ transform: "translateY(0)", display: "flex" }}>
      <div className="player-progress-container">
        <div className="player-progress-bar" id="player-progress" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="mini-player-content">
        <div 
          className="mini-player-artwork" 
          style={audioItem.image ? { backgroundImage: `url(${audioItem.image})`, backgroundSize: 'cover' } : {}}
        >
          {!audioItem.image && <span className="material-icons-round">music_note</span>}
        </div>
        <div className="mini-player-details">
          <div className="mini-player-title" id="player-track-name">{audioItem.title}</div>
          <div className="mini-player-artist" id="player-track-artist">{audioItem.artist}</div>
        </div>
        <div className="mini-player-controls">
          <button className="control-btn tv-focusable" id="player-play-pause-btn" onClick={togglePlay}>
            <span className="material-icons-round" id="player-play-icon">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>
          <button className="control-btn tv-focusable" id="player-close-btn" onClick={onClose}>
            <span className="material-icons-round">close</span>
          </button>
        </div>
      </div>
      <audio 
        ref={audioRef}
        id="global-audio-element" 
        src={audioItem.audioUrl} 
        autoPlay
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      ></audio>
    </div>
  );
}
