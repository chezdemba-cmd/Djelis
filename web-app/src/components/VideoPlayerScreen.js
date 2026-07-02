export default function VideoPlayerScreen({ isOpen, onClose, videoUrl }) {
  if (!isOpen) return null;

  return (
    <div className="video-player-overlay" id="video-player-screen" style={{ display: "flex" }}>
      <button className="player-back-btn tv-focusable" onClick={onClose}>
        <span className="material-icons-round">arrow_back</span>
      </button>
      <div className="video-wrapper">
        <video 
          id="main-video-player" 
          src={videoUrl} 
          playsInline 
          controls 
          autoPlay 
          style={{ width: "100%", height: "100%", backgroundColor: "black" }}
        ></video>
      </div>
    </div>
  );
}
