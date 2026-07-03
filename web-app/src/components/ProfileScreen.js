export default function ProfileScreen({ openAuthModal }) {
  return (
    <div id="page-profile" className="app-page active" style={{ width: "100%", height: "100%" }}>
      <div className="profile-container">
        
        <div className="profile-subpage active" id="profile-subpage-unauth">
          <div className="profile-header-card">
            <div className="profile-logo-large">
              <img src="/assets/logo.png" alt="Djeli'S Logo" className="profile-logo-img-large" />
            </div>
            <h2 className="profile-name">Djeli'S</h2>
            <p className="profile-email">Rejoignez Djeli'S pour profiter de l'expérience</p>
            <button className="modal-action-btn tv-focusable" style={{ marginTop: "14px" }} onClick={openAuthModal}>
              Créer mon compte / Se connecter
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
