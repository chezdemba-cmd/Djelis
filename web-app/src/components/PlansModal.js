import { useState, useEffect } from "react";

export default function PlansModal({ isOpen, onClose, onComplete, initialMode = "register" }) {
  const [step, setStep] = useState(1);
  const [region, setRegion] = useState("ao");
  const [freq, setFreq] = useState("weekly");
  const [authMethod, setAuthMethod] = useState("email");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setIsLogin(initialMode === "login");
      setStep(1);
      setErrorMsg("");
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleNextStep = async (e) => {
    e.preventDefault();
    if (step === 1) {
      setErrorMsg("");
      try {
        const payload = authMethod === 'email' 
          ? { email: e.target.querySelector('input[type="email"]')?.value, password: e.target.querySelector('input[type="password"]').value }
          : { phone: e.target.querySelector('input[type="tel"]')?.value, password: e.target.querySelector('input[type="password"]').value };
          
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const endpoint = isLogin ? `${baseUrl}/api/v1/auth/login` : `${baseUrl}/api/v1/auth/register`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        
        if (res.ok) {
          const token = data.access_token || data.accessToken;
          if (token) {
             localStorage.setItem('accessToken', token);
             if (isLogin) {
                if (onComplete) onComplete();
                onClose();
                return;
             }
          }
        } else {
          setErrorMsg(data.message || "Une erreur est survenue.");
          return; // Stop flow
        }
      } catch (err) {
        console.error("Error connecting to NestJS Auth API.", err);
        // Fallback: Mode simulation si le backend n'est pas disponible (ex: Vercel demo)
        console.warn("Backend unreachable, activating simulated login fallback.");
        localStorage.setItem('accessToken', 'demo_simulated_token_xyz');
        if (isLogin) {
            if (onComplete) onComplete();
            onClose();
            return;
        } else {
            // Passer à l'étape suivante (choix du forfait)
        }
      }
    }
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
          <div className="register-flow-step active auth-form-wrapper">
            <div className="modal-logo-container">
              <img src="/assets/logo.png" alt="Djeli&apos;S Logo" className="modal-logo-img" />
            </div>
            <h2 className="plans-main-title">{isLogin ? "Connexion" : "Créez votre compte"}</h2>
            <p className="plans-subtitle" style={{ marginBottom: "20px" }}>{isLogin ? "Connectez-vous pour continuer." : "Entrez vos coordonnées de connexion."}</p>
            
            {errorMsg && <div style={{ color: '#ff4444', marginBottom: '15px', padding: '10px', background: 'rgba(255,0,0,0.1)', borderRadius: '8px' }}>{errorMsg}</div>}

            <form onSubmit={handleNextStep}>
              {!isLogin && (
                <div className="form-group">
                  <label>Nom complet</label>
                  <input type="text" placeholder="Sidiki Keita" required className="form-input" />
                </div>
              )}

              <div className="auth-method-toggle" style={{ marginTop: "14px" }}>
                <button type="button" className={`method-btn tv-focusable ${authMethod === 'email' ? 'active' : ''}`} onClick={() => setAuthMethod("email")}>{isLogin ? "Se connecter par Email" : "S'inscrire par Email"}</button>
                <button type="button" className={`method-btn tv-focusable ${authMethod === 'phone' ? 'active' : ''}`} onClick={() => setAuthMethod("phone")}>{isLogin ? "Se connecter par Téléphone" : "S'inscrire par Téléphone"}</button>
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
                {isLogin ? "Se connecter" : "Suivant : Choisir mon forfait"} <span className="material-icons-round">chevron_right</span>
              </button>
              
              <div style={{ marginTop: "15px", textAlign: "center" }}>
                <button type="button" onClick={() => { setIsLogin(!isLogin); setErrorMsg(""); }} style={{ background: 'none', border: 'none', color: '#ffb300', cursor: 'pointer', textDecoration: 'underline' }}>
                  {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="register-flow-step active">
            <h2 className="plans-main-title">Sélectionnez votre forfait</h2>
            <p className="plans-subtitle">Choisissez l&apos;offre qui s&apos;adapte le mieux à votre utilisation.</p>
            
            <div className="plans-filter-bar">
              <div className="filter-group">
                <label>Région d&apos;Abonnement</label>
                <div className="pill-selector">
                  <button type="button" className={`pill-btn tv-focusable ${region === 'ao' ? 'active' : ''}`} onClick={() => setRegion("ao")}>Afrique de l&apos;Ouest</button>
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
          <div className="register-flow-step active auth-form-wrapper">
            <h2 className="plans-main-title">Validation de votre compte</h2>
            <p className="plans-subtitle">Veuillez vérifier les informations ci-dessous avant d&apos;activer votre profil.</p>
            
            <div className="wizard-summary-card">
              <div className="summary-item">
                <span className="summary-label">Forfait sélectionné</span>
                <span className="summary-value" style={{ color: "var(--primary-gold)", fontWeight: "bold" }}>Pack {selectedPlan}</span>
              </div>
            </div>

            <button type="button" className="modal-action-btn tv-focusable" style={{ marginTop: "24px" }} onClick={finishFlow}>
              <span className="material-icons-round">done</span> Activer mon profil & S&apos;abonner
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
