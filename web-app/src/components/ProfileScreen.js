export default function ProfileScreen({ isAuthenticated, onLogout, openAuthModal, onOpenAdmin, currentProfile }) {
  return (
    <div id="page-profile" className="app-page active" style={{ width: "100%", height: "100%" }}>
      <div className="profile-container">
        
        {!isAuthenticated ? (
          <div className="profile-subpage active" id="profile-subpage-unauth">
            <div className="profile-header-card">
              <div className="profile-logo-large">
                <img src="/assets/logo.png" alt="Djeli&apos;S Logo" className="profile-logo-img-large" />
              </div>
              <h2 className="profile-name">Djeli&apos;S</h2>
              <p className="profile-email">Rejoignez Djeli&apos;S pour profiter de l&apos;expérience</p>
              <button className="modal-action-btn tv-focusable" style={{ marginTop: "14px" }} onClick={openAuthModal}>
                Créer mon compte / Se connecter
              </button>
              
              <button className="modal-action-btn tv-focusable" style={{ marginTop: "14px", background: '#333', color: '#ffb300' }} onClick={onOpenAdmin}>
                <span className="material-icons-round" style={{ fontSize: '18px', marginRight: '8px', verticalAlign: 'middle' }}>admin_panel_settings</span>
                Accès Admin (Simulateur)
              </button>
            </div>
          </div>
        ) : (
          <div className="profile-subpage active" id="profile-subpage-home">
            <div className="profile-header-card">
              <div className="profile-avatar-large" style={{ backgroundColor: currentProfile?.color || '#ffb300', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%' }}>
                <span style={{ fontSize: '48px', lineHeight: '1' }}>{currentProfile?.avatar || '😎'}</span>
              </div>
              <h2 className="profile-name" id="user-display-name">{currentProfile?.name || 'Sidiki Keita'}</h2>
              <p className="profile-email" id="user-display-email">{currentProfile?.role === 'Kids' ? 'Profil Enfant' : 'Profil Principal'}</p>
              <span className="profile-status-badge" id="user-display-status">Membre Premium VIP</span>
            </div>

            <div className="profile-plans-hover-card tv-focusable" id="profile-abonnements-banner" onClick={openAuthModal}>
              <div className="hover-card-content">
                <span className="material-icons-round">stars</span>
                <div>
                  <h4>Gérer mon Abonnement</h4>
                  <p>Modifier l&apos;offre, facturation et reçus</p>
                </div>
              </div>
              <span className="material-icons-round">chevron_right</span>
            </div>

            <div className="profile-actions-list">
              <div className="profile-action-item tv-focusable">
                <span className="material-icons-round">settings</span> Paramètres de l&apos;application
              </div>

              {/* Lien vers l'Espace Admin */}
              <div className="profile-action-item tv-focusable" style={{ color: '#ffb300' }} onClick={onOpenAdmin}>
                <span className="material-icons-round">admin_panel_settings</span> Espace Administrateur
              </div>

              <div className="profile-action-item tv-focusable">
                <span className="material-icons-round">help_outline</span> Centre d&apos;aide
              </div>
              <div className="profile-action-item profile-plans-btn tv-focusable" onClick={openAuthModal}>
                <span className="material-icons-round">account_balance_wallet</span>
                <span>Abonnements & Tarifs</span>
                <span className="material-icons-round arrow">chevron_right</span>
              </div>

              {/* Liens légaux indispensables pour la publication sur les stores */}
              <a href="/privacy" className="profile-action-item tv-focusable" style={{ textDecoration: 'none', color: 'inherit' }}>
                <span className="material-icons-round">policy</span>
                <span>Politique de Confidentialité</span>
                <span className="material-icons-round arrow">chevron_right</span>
              </a>

              <a href="/terms" className="profile-action-item tv-focusable" style={{ textDecoration: 'none', color: 'inherit' }}>
                <span className="material-icons-round">description</span>
                <span>Conditions Générales (CGU)</span>
                <span className="material-icons-round arrow">chevron_right</span>
              </a>

              <div className="profile-action-item tv-focusable" style={{ color: "#ff8a80" }} onClick={() => {
                if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement votre compte et toutes vos données personnelles ? Cette action est irréversible.")) {
                  alert("Votre demande de suppression de compte a été enregistrée. Conformément à notre politique de confidentialité, toutes vos données seront purgées sous 48h.");
                  onLogout && onLogout();
                }
              }}>
                <span className="material-icons-round">delete_forever</span>
                <span>Supprimer mon compte</span>
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
