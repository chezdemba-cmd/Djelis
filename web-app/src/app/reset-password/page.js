"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "../login/login.css";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function ResetPasswordPage() {
  const [token, setToken] = useState(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Le jeton vient de l'URL (dispo seulement côté client).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToken(new URLSearchParams(window.location.search).get("token"));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (password.length < 8) {
      setErrorMsg("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setErrorMsg("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setDone(true);
      } else {
        setErrorMsg(
          data.message || "Lien de réinitialisation invalide ou expiré."
        );
      }
    } catch {
      setErrorMsg("Service momentanément indisponible. Réessayez plus tard.");
    }
    setLoading(false);
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card">
        <div className="login-header">
          <Link href="/" className="login-logo-link" title="Accueil Djeli'S">
            <img src="/assets/logo.png" alt="Djeli'S" className="login-logo-img" />
          </Link>
          <h1 className="login-title">Nouveau mot de passe</h1>
        </div>

        {done ? (
          <>
            <div
              className="login-error-banner"
              role="status"
              style={{ background: "rgba(46,160,67,0.15)", color: "#2ea043" }}
            >
              <span className="material-icons-round">check_circle</span>
              <span>Mot de passe mis à jour. Vous pouvez vous reconnecter.</span>
            </div>
            <Link href="/login" className="login-submit-btn tv-focusable" style={{ textDecoration: "none" }}>
              <span>Se connecter</span>
              <span className="material-icons-round" style={{ fontSize: 20 }}>arrow_forward</span>
            </Link>
          </>
        ) : !token ? (
          <div className="login-error-banner" role="alert">
            <span className="material-icons-round">error_outline</span>
            <span>Lien incomplet : aucun jeton de réinitialisation.</span>
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="login-error-banner" role="alert">
                <span className="material-icons-round">error_outline</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="login-form-group">
                <label className="login-label" htmlFor="new-password">Nouveau mot de passe</label>
                <div className="login-input-wrapper">
                  <span className="material-icons-round login-input-icon">lock</span>
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    className="login-input"
                    placeholder="Au moins 8 caractères"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    <span className="material-icons-round" style={{ fontSize: 20 }}>
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="login-form-group">
                <label className="login-label" htmlFor="confirm-password">Confirmer le mot de passe</label>
                <div className="login-input-wrapper">
                  <span className="material-icons-round login-input-icon">lock</span>
                  <input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    className="login-input"
                    placeholder="Retapez le mot de passe"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="login-submit-btn tv-focusable"
                disabled={loading || !password || !confirm}
              >
                {loading ? (
                  <>
                    <span className="login-spinner" />
                    <span>Mise à jour…</span>
                  </>
                ) : (
                  <>
                    <span>Réinitialiser</span>
                    <span className="material-icons-round" style={{ fontSize: 20 }}>arrow_forward</span>
                  </>
                )}
              </button>
            </form>
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
