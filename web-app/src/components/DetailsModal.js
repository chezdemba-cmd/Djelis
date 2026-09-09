export default function DetailsModal({ isOpen, onClose, item, onPlay, onRent }) {
  if (!isOpen || !item) return null;

  const canRent = Boolean(item.isPremium && item.rentalPriceFcfa);

  return (
    <div className="modal" id="details-modal" style={{ display: "flex" }}>
      <div className="modal-header">
        <button className="modal-close tv-focusable" onClick={onClose}>
          <span className="material-icons-round">arrow_back</span>
        </button>
        <span className="modal-header-title">Détails</span>
      </div>
      <div className="modal-content">
        <div 
          className={`modal-banner ${item.bannerClass || ''}`} 
          id="modal-banner-img"
          style={item.bannerClass ? {} : { backgroundImage: `url(${item.image})` }}
        >
          <div className="modal-play-overlay tv-focusable" onClick={onPlay}>
            <span className="material-icons-round">play_arrow</span>
          </div>
        </div>
        <div className="modal-body">
          <div className="modal-tags">
            <span className="modal-badge" id="modal-type">{item.type}</span>
            <span className="modal-badge year" id="modal-year">{item.year}</span>
            <span className="modal-badge age" id="modal-age">{item.age}</span>
          </div>
          <h2 className="modal-title" id="modal-title-text">{item.title}</h2>
          <p className="modal-synopsis" id="modal-synopsis-text">{item.synopsis}</p>
          
          <div className="modal-action-row" style={{ display: "flex", flexWrap: "wrap", gap: "10px", width: "100%" }}>
            <button className="modal-action-btn tv-focusable" style={{ flex: 1, minWidth: "130px" }} onClick={onPlay}>
              <span className="material-icons-round">play_arrow</span> Regarder
            </button>
            
            {/* Location à l'acte (TVOD) */}
            {canRent && (
              <button
                className="modal-action-btn tv-focusable"
                style={{ flex: 1, minWidth: "130px", background: "linear-gradient(135deg, #FFB300, #F57C00)", color: "#000" }}
                onClick={() => onRent && onRent(item)}
                title={`Location valable 48 h`}
              >
                <span className="material-icons-round">shopping_cart</span> Louer ({item.rentalPriceFcfa} FCFA)
              </button>
            )}
            <button 
              className="modal-download-btn tv-focusable" 
              id="modal-download-btn" 
              style={{
                width: "56px", 
                height: "50px", 
                borderRadius: "14px", 
                border: "1px solid rgba(255,255,255,0.1)", 
                background: "rgba(255,255,255,0.05)", 
                color: "#ffffff", 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                cursor: "pointer", 
                transition: "all 0.2s ease"
              }}
            >
              <span className="material-icons-round" id="modal-download-icon">download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
