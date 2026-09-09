"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "../../context/SessionContext";
import { storeAccessToken, clearClientAuth, markSessionActive } from "../../lib/authClient";
import { LAUNCH_MODE } from "../../lib/launchMode";
import "../login/login.css";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useSession();

  const [method, setMethod] = useState("email"); // "email" | "phone"
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isAuthenticated) router.push("/browse");
  }, [isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (password.length < 8) {
      setErrorMsg("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);
    try {
      const payload =
        method === "email"
          ? { email: identifier.trim().toLowerCase(), password }
          : { phone: identifier.trim(), password };

      const res = await fetch(`${API}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMsg(data.message || "La création du compte a échoué.");
        setLoading(false);
        return;
      }

      const token = data.access_token || data.accessToken;
      const refreshToken = data.refresh_token || data.refreshToken;
      if (!token) throw new Error("Jeton d'accès manquant.");

      storeAccessToken(token);
      markSessionActive();

      const sessionRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, refreshToken }),
      });
      if (!sessionRes.ok) throw new Error("Échec de synchronisation de la session.");

      await login(token, refreshToken);
      router.push("/browse");
    } catch (err) {
      console.error("Register error:", err);
      clearClientAuth();
      setErrorMsg("Service momentanément indisponible. Réessayez plus tard.");
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card">
        <div className="login-header">
          <Link href="/" className="login-logo-link" title="Accueil Djeli'S">
            <img src="/assets/logo.png" alt="Djeli'S" className="login-logo-img" />
          </Link>
          <h1 className="login-title">Créer un compte gratuit</h1>
          <p className="login-subtitle">
            {LAUNCH_MODE
              ? "Accédez gratuitement à DjeliSon : musique, clips, podcasts et récits."
              : "Rejoignez Djeli'S pour vos films, séries et musiques."}
          </p>
        </div>

        <div className="login-method-toggle">
          <button
            type="button"
            className={`login-method-btn ${method === "email" ? "active" : ""}`}
            onClick={() => { setMethod("email"); setErrorMsg(""); }}
          >
            <span className="material-icons-round" style={{ fontSize: 18 }}>email</span>
            Email
          </button>
          <button
            type="button"
            className={`login-method-btn ${method === "phone" ? "active" : ""}`}
            onClick={() => { setMethod("phone"); setErrorMsg(""); }}
          >
            <span className="material-icons-round" style={{ fontSize: 18 }}>phone</span>
            Téléphone
          </button>
        </div>

        {errorMsg && (
          <div className="login-error-banner" role="alert">
            <span className="material-icons-round">error_outline</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="login-form-group">
            <label className="login-label" htmlFor="reg-id">
              {method === "email" ? "Adresse Email" : "Numéro de Téléphone"}
            </label>
            <div className="login-input-wrapper">
              <span className="material-icons-round login-input-icon">
                {method === "email" ? "alternate_email" : "call"}
              </span>
              <input
                id="reg-id"
                type={method === "email" ? "email" : "tel"}
                className="login-input"
                placeholder={method === "email" ? "exemple@djelis.com" : "+223 70 00 00 00"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete={method === "email" ? "email" : "tel"}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="login-form-group">
            <label className="login-label" htmlFor="reg-password">Mot de passe</label>
            <div className="login-input-wrapper">
              <span className="material-icons-round login-input-icon">lock</span>
              <input
                id="reg-password"
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

          <button
            type="submit"
            className="login-submit-btn tv-focusable"
            disabled={loading || !identifier || !password}
          >
            {loading ? (
              <>
                <span className="login-spinner" />
                <span>Création…</span>
              </>
            ) : (
              <>
                <span>Créer mon compte</span>
                <span className="material-icons-round" style={{ fontSize: 20 }}>arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <div className="login-footer-register">
            Déjà un compte ?
            <Link href="/login" className="login-link-gold">Se connecter</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
