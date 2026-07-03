export default function ProfileScreen({ isAuthenticated, onLogout, openAuthModal }) {
  return (
    <div id="page-profile" className="app-page active" style={{ width: "100%", height: "100%" }}>
      <div className="profile-container">
        
        {!isAuthenticated ? (
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
        ) : (
          <div className="profile-subpage active" id="profile-subpage-home">
            <div className="profile-header-card">
              <div className="profile-avatar-large">
                <span className="material-icons-round">person</span>
              </div>
              <h2 className="profile-name" id="user-display-name">Sidiki Keita</h2>
              <p className="profile-email" id="user-display-email">sidiki.keita@djelis.com</p>
              <span className="profile-status-badge" id="user-display-status">Membre Premium VIP</span>
            </div>

            <div className="profile-plans-hover-card tv-focusable" id="profile-abonnements-banner" onClick={openAuthModal}>
              <div className="hover-card-content">
                <span className="material-icons-round">stars</span>
                <div>
                  <h4>Gérer mon Abonnement</h4>
                  <p>Modifier l'offre, facturation et reçus</p>
                </div>
              </div>
              <span className="material-icons-round">chevron_right</span>
            </div>

            <div className="profile-actions-list">
              <div className="profile-action-item tv-focusable">
                <span className="material-icons-round">settings</span>
                <span>Paramètres du compte</span>
                <span className="material-icons-round arrow">chevron_right</span>
              </div>
              <div className="profile-action-item profile-plans-btn tv-focusable" onClick={openAuthModal}>
                <span className="material-icons-round">account_balance_wallet</span>
                <span>Abonnements & Tarifs</span>
                <span className="material-icons-round arrow">chevron_right</span>
              </div>
              <div className="profile-action-item tv-focusable" style={{ color: "var(--accent-crimson)" }} onClick={onLogout}>
                <span className="material-icons-round">logout</span>
                <span>Se déconnecter</span>
                <span className="material-icons-round arrow">chevron_right</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
