"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "../login/login.css";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function VerifyEmailPage() {
  // "checking" | "success" | "error" | "notoken"
  const [state, setState] = useState("checking");
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendDone, setResendDone] = useState(false);

  useEffect(() => {
    // Le jeton vient de l'URL (dispo seulement côté client) : on synchronise
    // l'état une fois au montage.
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState("notoken");
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${API}/api/v1/auth/verify/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setState("success");
          setMessage(data.message || "Adresse e-mail confirmée.");
        } else {
          setState("error");
          setMessage(
            data.message || "Lien de vérification invalide ou expiré."
          );
        }
      } catch {
        setState("error");
        setMessage("Service momentanément indisponible. Réessayez plus tard.");
      }
    })();
  }, []);

  const handleResend = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API}/api/v1/auth/verify/email/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail.trim().toLowerCase() }),
      });
    } catch {
      /* réponse générique côté serveur : on ignore les erreurs réseau ici */
    }
    setResendDone(true);
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card">
        <div className="login-header">
          <Link href="/" className="login-logo-link" title="Accueil Djeli'S">
            <img src="/assets/logo.png" alt="Djeli'S" className="login-logo-img" />
          </Link>
          <h1 className="login-title">Vérification de l'e-mail</h1>
        </div>

        {state === "checking" && (
          <p className="login-subtitle" style={{ textAlign: "center" }}>
            <span className="login-spinner" /> Vérification en cours…
          </p>
        )}

        {state === "success" && (
          <>
            <div
              className="login-error-banner"
              role="status"
              style={{ background: "rgba(46,160,67,0.15)", color: "#2ea043" }}
            >
              <span className="material-icons-round">check_circle</span>
              <span>{message}</span>
            </div>
            <Link href="/login" className="login-submit-btn tv-focusable" style={{ textDecoration: "none" }}>
              <span>Se connecter</span>
              <span className="material-icons-round" style={{ fontSize: 20 }}>arrow_forward</span>
            </Link>
          </>
        )}

        {(state === "error" || state === "notoken") && (
          <>
            <div className="login-error-banner" role="alert">
              <span className="material-icons-round">error_outline</span>
              <span>
                {state === "notoken"
                  ? "Lien incomplet : aucun jeton de vérification."
                  : message}
              </span>
            </div>

            {resendDone ? (
              <p className="login-subtitle" style={{ textAlign: "center" }}>
                Si ce compte existe et n'est pas encore vérifié, un nouvel e-mail
                vient d'être envoyé.
              </p>
            ) : (
              <form onSubmit={handleResend} noValidate>
                <div className="login-form-group">
                  <label className="login-label" htmlFor="resend-email">
                    Renvoyer le lien de vérification
                  </label>
                  <div className="login-input-wrapper">
                    <span className="material-icons-round login-input-icon">alternate_email</span>
                    <input
                      id="resend-email"
                      type="email"
                      className="login-input"
                      placeholder="exemple@djelis.com"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="login-submit-btn tv-focusable"
                  disabled={!resendEmail}
                >
                  <span>Renvoyer l'e-mail</span>
                  <span className="material-icons-round" style={{ fontSize: 20 }}>send</span>
                </button>
              </form>
            )}
          </>
        )}

        <div className="login-footer">
          <Link href="/login" className="login-link-gold">
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
