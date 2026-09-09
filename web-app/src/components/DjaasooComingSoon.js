"use client";

import { useRouter } from "next/navigation";

/**
 * Écran d'attente DjaaSoo pendant le mode lancement. Sert aussi d'accroche
 * marketing : les visiteurs voient que la section arrive.
 */
export default function DjaasooComingSoon() {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px 24px",
        gap: "18px",
      }}
    >
      <div
        style={{
          width: 84,
          height: 84,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FFB300, #F57C00)",
          color: "#000",
          boxShadow: "0 12px 40px rgba(245, 124, 0, 0.35)",
        }}
      >
        <span className="material-icons-round" style={{ fontSize: 42 }}>
          lock
        </span>
      </div>

      <h1 style={{ fontSize: "clamp(24px, 5vw, 34px)", fontWeight: 800, margin: 0 }}>
        DjaaSoo — Bientôt disponible
      </h1>

      <p style={{ maxWidth: 460, color: "#bdbdbd", fontSize: "15px", lineHeight: 1.6, margin: 0 }}>
        <strong style={{ color: "#fff" }}>Films, séries et théâtre</strong> africains
        arrivent très prochainement sur Djeli&apos;S. En attendant, profitez
        librement de <strong style={{ color: "#fff" }}>DjeliSon</strong> : musique,
        clips, podcasts et récits.
      </p>

      <button
        onClick={() => router.push("/djelison")}
        style={{
          marginTop: 8,
          background: "linear-gradient(135deg, #ffb300, #ff4081)",
          color: "#fff",
          border: "none",
          padding: "14px 32px",
          borderRadius: 28,
          fontSize: 16,
          fontWeight: 700,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span className="material-icons-round">headphones</span>
        Découvrir DjeliSon
      </button>
    </div>
  );
}
