import { useState } from "react";

export default function PlansModal({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [region, setRegion] = useState("ao");
  const [freq, setFreq] = useState("weekly");
  const [authMethod, setAuthMethod] = useState("email");
  const [selectedPlan, setSelectedPlan] = useState(null);

  if (!isOpen) return null;

  const handleNextStep = (e) => {
    e.preventDefault();
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setStep((prev) => prev - 1);
  };

  const selectPlan = (planName) => {
    setSelectedPlan(planName);
    setStep(3);
  };

  const finishFlow = () => {
    if (onComplete) onComplete();
    onClose();
  };

  return (
    <div className="modal" id="plans-modal" style={{ display: "flex" }}>
      <div className="modal-header">
        <button className="modal-close tv-focusable" onClick={onClose}>
          <span className="material-icons-round">arrow_back</span>
        </button>
        <span className="modal-header-title">Inscription & Abonnement</span>
      </div>
      
      <div className="auth-flow-indicator">
        <span className={`indicator-step ${step >= 1 ? "active" : ""}`}>1. Coordonnées</span>
        <span className="indicator-connector"></span>
        <span className={`indicator-step ${step >= 2 ? "active" : ""}`}>2. Forfait</span>
        <span className="indicator-connector"></span>
        <span className={`indicator-step ${step >= 3 ? "active" : ""}`}>3. Finalisation</span>
      </div>

      <div className="modal-content" style={{ padding: "10px 24px" }}>
        {step === 1 && (
          <div className="register-flow-step active">
            <div className="modal-logo-container">
              <img src="/assets/logo.png" alt="Djeli'S Logo" className="modal-logo-img" />
            </div>
            <h2 className="plans-main-title">Créez votre compte</h2>
            <p className="plans-subtitle" style={{ marginBottom: "20px" }}>Entrez vos coordonnées de connexion.</p>
            
            <form onSubmit={handleNextStep}>
              <div className="form-group">
                <label>Nom complet</label>
                <input type="text" placeholder="Sidiki Keita" required className="form-input" />
              </div>

              <div className="auth-method-toggle" style={{ marginTop: "14px" }}>
                <button type="button" className={`method-btn tv-focusable ${authMethod === 'email' ? 'active' : ''}`} onClick={() => setAuthMethod("email")}>S'inscrire par Email</button>
                <button type="button" className={`method-btn tv-focusable ${authMethod === 'phone' ? 'active' : ''}`} onClick={() => setAuthMethod("phone")}>S'inscrire par Téléphone</button>
              </div>

              {authMethod === "email" ? (
                <div className="form-group">
                  <label>Adresse Email</label>
                  <input type="email" placeholder="sidiki.keita@djelis.com" className="form-input" required />
                </div>
              ) : (
                <div className="form-group">
                  <label>Numéro de Téléphone</label>
                  <input type="tel" placeholder="+223 70 00 00 00" className="form-input" required />
                </div>
              )}

              <div className="form-group">
                <label>Mot de passe</label>
                <input type="password" placeholder="Min. 8 caractères" required className="form-input" />
              </div>

              <button type="submit" className="modal-action-btn tv-focusable" style={{ marginTop: "24px" }}>
                Suivant : Choisir mon forfait <span className="material-icons-round">chevron_right</span>
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="register-flow-step active">
            <h2 className="plans-main-title">Sélectionnez votre forfait</h2>
            <p className="plans-subtitle">Choisissez l'offre qui s'adapte le mieux à votre utilisation.</p>
            
            <div className="plans-filter-bar">
              <div className="filter-group">
                <label>Région d'Abonnement</label>
                <div className="pill-selector">
                  <button type="button" className={`pill-btn tv-focusable ${region === 'ao' ? 'active' : ''}`} onClick={() => setRegion("ao")}>Afrique de l'Ouest</button>
                  <button type="button" className={`pill-btn tv-focusable ${region === 'diaspora' ? 'active' : ''}`} onClick={() => setRegion("diaspora")}>Diaspora</button>
                </div>
              </div>
              <div className="filter-group">
                <label>Cycle de facturation</label>
                <div className="pill-selector">
                  <button type="button" className={`pill-btn tv-focusable ${freq === 'weekly' ? 'active' : ''}`} onClick={() => setFreq("weekly")}>Par semaine</button>
                  <button type="button" className={`pill-btn tv-focusable ${freq === 'monthly' ? 'active' : ''}`} onClick={() => setFreq("monthly")}>Par mois</button>
                  <button type="button" className={`pill-btn tv-focusable ${freq === 'yearly' ? 'active' : ''}`} onClick={() => setFreq("yearly")}>Par an</button>
                </div>
              </div>
            </div>

            <div className="plans-grid">
              <div className="plan-card tv-focusable">
                <div className="plan-header">
                  <div>
                    <h3>Pack Gratuit (Pubs)</h3>
                    <p className="plan-desc-text">Audio & Humour uniquement</p>
                  </div>
                  <span className="plan-price">0 {region === 'ao' ? 'FCFA' : '€'}</span>
                </div>
                <button type="button" className="plan-btn" onClick={() => selectPlan("Gratuit")}>Choisir ce forfait</button>
              </div>

              <div className="plan-card tv-focusable">
                <div className="plan-header">
                  <div>
                    <h3>Pack Solo</h3>
                    <p className="plan-desc-text">1 écran smartphone uniquement</p>
                  </div>
                  <span className="plan-price">{region === 'ao' ? '5 000 FCFA' : '4.99 €'}</span>
                </div>
                <button type="button" className="plan-btn" onClick={() => selectPlan("Solo")}>Choisir ce forfait</button>
              </div>

              <div className="plan-card featured tv-focusable">
                <div className="plan-badge">Idéal Famille</div>
                <div className="plan-header">
                  <div>
                    <h3>Pack Famille</h3>
                    <p className="plan-desc-text">4 smartphones + 2 écrans TV/PC</p>
                  </div>
                  <span className="plan-price">{region === 'ao' ? '15 000 FCFA' : '12.99 €'}</span>
                </div>
                <button type="button" className="plan-btn" onClick={() => selectPlan("Famille")}>Choisir ce forfait</button>
              </div>
            </div>

            <button type="button" className="modal-action-btn tv-focusable" style={{ marginTop: "24px", background: "rgba(255,255,255,0.06)", color: "white", border: "1px solid var(--glass-border)" }} onClick={handlePrevStep}>
              <span className="material-icons-round">chevron_left</span> Retour aux coordonnées
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="register-flow-step active">
            <h2 className="plans-main-title">Validation de votre compte</h2>
            <p className="plans-subtitle">Veuillez vérifier les informations ci-dessous avant d'activer votre profil.</p>
            
            <div className="wizard-summary-card">
              <div className="summary-item">
                <span className="summary-label">Forfait sélectionné</span>
                <span className="summary-value" style={{ color: "var(--primary-gold)", fontWeight: "bold" }}>Pack {selectedPlan}</span>
              </div>
            </div>

            <button type="button" className="modal-action-btn tv-focusable" style={{ marginTop: "24px" }} onClick={finishFlow}>
              <span className="material-icons-round">done</span> Activer mon profil & S'abonner
            </button>
            
            <button type="button" className="modal-action-btn tv-focusable" style={{ marginTop: "12px", background: "rgba(255,255,255,0.06)", color: "white", border: "1px solid var(--glass-border)" }} onClick={handlePrevStep}>
              <span className="material-icons-round">chevron_left</span> Retour aux forfaits
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
