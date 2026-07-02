export default function MiniPlayer({ audioItem, onClose }) {
  if (!audioItem) return null;

  return (
    <div className="mini-player" id="mini-player" style={{ transform: "translateY(0)" }}>
      <div className="player-progress-container">
        <div className="player-progress-bar" id="player-progress" style={{ width: "30%" }}></div>
      </div>
      <div className="mini-player-content">
        <div className="mini-player-artwork">
          <span className="material-icons-round">music_note</span>
        </div>
        <div className="mini-player-details">
          <div className="mini-player-title" id="player-track-name">{audioItem.title}</div>
          <div className="mini-player-artist" id="player-track-artist">{audioItem.artist}</div>
        </div>
        <div className="mini-player-controls">
          <button className="control-btn tv-focusable" id="player-play-pause-btn">
            <span className="material-icons-round" id="player-play-icon">pause</span>
          </button>
          <button className="control-btn tv-focusable" id="player-close-btn" onClick={onClose}>
            <span className="material-icons-round">close</span>
          </button>
        </div>
      </div>
      <audio id="global-audio-element" src={audioItem.audioUrl} autoPlay></audio>
    </div>
  );
}
