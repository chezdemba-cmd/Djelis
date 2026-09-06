"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "../../context/SessionContext";
import { storeAccessToken, clearClientAuth, markSessionActive } from "../../lib/authClient";
import "./login.css";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useSession();

  const [authMethod, setAuthMethod] = useState("email"); // "email" | "phone"
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Redirection automatique si déjà authentifié
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/browse");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const payload =
        authMethod === "email"
          ? { email: identifier.trim().toLowerCase(), password }
          : { phone: identifier.trim(), password };

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setErrorMsg("Identifiants incorrects. Veuillez vérifier votre saisie.");
        } else {
          setErrorMsg(data.message || "Échec de la connexion. Veuillez réessayer.");
        }
        setLoading(false);
        return;
      }

      const token = data.access_token || data.accessToken;
      const refreshToken = data.refresh_token || data.refreshToken;

      if (!token) {
        throw new Error("Jeton d'accès manquant.");
      }

      // 1. Stockage local
      storeAccessToken(token);
      markSessionActive();

      // 2. Initialisation du cookie HttpOnly de session côté Next.js
      const sessionRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, refreshToken }),
      });

      if (!sessionRes.ok) {
        throw new Error("Échec de synchronisation de la session.");
      }

      // 3. Mise à jour de SessionContext
      await login(token, refreshToken);

      // 4. Redirection
      router.push("/browse");
    } catch (err) {
      console.error("Login error:", err);
      clearClientAuth();
      setErrorMsg(
        err.message?.includes("synchronisation")
          ? "Erreur lors de la création de la session. Réessayez."
          : "Service momentanément indisponible. Veuillez réessayer plus tard."
      );
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card">
        <div className="login-header">
          <Link href="/" className="login-logo-link" title="Retour à l'accueil Djeli'S">
            <img src="/assets/logo.png" alt="Djeli'S" className="login-logo-img" />
          </Link>
          <h1 className="login-title">Connexion</h1>
          <p className="login-subtitle">Connectez-vous pour accéder à vos films, séries et musiques</p>
        </div>

        {/* Toggle Email / Téléphone */}
        <div className="login-method-toggle">
          <button
            type="button"
            className={`login-method-btn ${authMethod === "email" ? "active" : ""}`}
            onClick={() => {
              setAuthMethod("email");
              setErrorMsg("");
            }}
          >
            <span className="material-icons-round" style={{ fontSize: 18 }}>email</span>
            Email
          </button>
          <button
            type="button"
            className={`login-method-btn ${authMethod === "phone" ? "active" : ""}`}
            onClick={() => {
              setAuthMethod("phone");
              setErrorMsg("");
            }}
          >
            <span className="material-icons-round" style={{ fontSize: 18 }}>phone</span>
            Téléphone
          </button>
        </div>

        {/* Bannière d'erreur */}
        {errorMsg && (
          <div className="login-error-banner" role="alert">
            <span className="material-icons-round">error_outline</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} noValidate>
          {authMethod === "email" ? (
            <div className="login-form-group">
              <label className="login-label" htmlFor="login-email">Adresse Email</label>
              <div className="login-input-wrapper">
                <span className="material-icons-round login-input-icon">alternate_email</span>
                <input
                  id="login-email"
                  type="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="exemple@djelis.com"
                  required
                  autoComplete="email"
                  className="login-input"
                  disabled={loading}
                />
              </div>
            </div>
          ) : (
            <div className="login-form-group">
              <label className="login-label" htmlFor="login-phone">Numéro de Téléphone</label>
              <div className="login-input-wrapper">
                <span className="material-icons-round login-input-icon">call</span>
                <input
                  id="login-phone"
                  type="tel"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="+223 70 00 00 00"
                  required
                  autoComplete="tel"
                  className="login-input"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div className="login-form-group">
            <label className="login-label" htmlFor="login-password">Mot de passe</label>
            <div className="login-input-wrapper">
              <span className="material-icons-round login-input-icon">lock</span>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                required
                autoComplete="current-password"
                className="login-input"
                disabled={loading}
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
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
            id="login-submit-button"
            className="login-submit-btn tv-focusable"
            disabled={loading || !identifier || !password}
          >
            {loading ? (
              <>
                <span className="login-spinner"></span>
                <span>Connexion en cours...</span>
              </>
            ) : (
              <>
                <span>Se connecter</span>
                <span className="material-icons-round" style={{ fontSize: 20 }}>arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <div className="login-footer-register">
            Pas encore de compte ?
            <Link href="/" className="login-link-gold">
              Découvrir nos forfaits
            </Link>
          </div>
          <Link href="/" className="login-back-home">
            <span className="material-icons-round" style={{ fontSize: 16 }}>arrow_back</span>
            Retourner au catalogue
          </Link>
        </div>
      </div>
    </div>
  );
}
