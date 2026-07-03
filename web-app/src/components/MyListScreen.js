import { useState } from "react";

export default function MyListScreen({ openAuthModal }) {
  const [activeTab, setActiveTab] = useState("fav");
  
  return (
    <div id="page-mylist" className="app-page active" style={{ width: "100%", height: "100%" }}>
      <div className="mylist-container">
        
        <div className="mylist-tabs-container">
          <button 
            className={`mylist-tab-btn tv-focusable ${activeTab === 'fav' ? 'active' : ''}`} 
            onClick={() => setActiveTab('fav')}
          >
            <span className="material-icons-round">favorite_border</span> Favoris
          </button>
          <button 
            className={`mylist-tab-btn tv-focusable ${activeTab === 'dl' ? 'active' : ''}`} 
            onClick={() => setActiveTab('dl')}
          >
            <span className="material-icons-round">download</span> Hors-ligne
          </button>
        </div>

        {/* Dummy unauth view for now, as we don't have global auth state yet */}
        <div className="mylist-unauth-view" id="mylist-unauth">
          <span className="material-icons-round mylist-empty-icon">favorite_border</span>
          <p>Connectez-vous pour ajouter et retrouver vos favoris.</p>
          <button className="modal-action-btn tv-focusable" style={{ marginTop: "14px" }} onClick={openAuthModal}>
            S'abonner / Se connecter
          </button>
        </div>

      </div>
    </div>
  );
}
