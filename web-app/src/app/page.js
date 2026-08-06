"use client";

import { useSession } from "../context/SessionContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated, currentProfile } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      if (currentProfile) {
        router.push('/browse');
      } else {
        router.push('/browse');
      }
    }
  }, [isAuthenticated, currentProfile, router]);

  return (
    <div className="landing-screen" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', textAlign: 'center', padding: '20px', gap: '30px', animation: 'fadeIn 0.5s ease-out' }}>
      <div className="landing-bg-animation"></div>
      <div className="landing-overlay"></div>
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
        <h1 style={{ fontSize: 'clamp(26px, 5vw, 44px)', fontWeight: '900', color: 'white', maxWidth: '800px', lineHeight: '1.2', margin: '0 0 10px 0', textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>
          Films, Séries & Contes <br />
          <span style={{ color: '#ffb300' }}>Illimités</span>{" "}en Afrique de l'Ouest
        </h1>
        <p style={{ fontSize: 'clamp(15px, 1.8vw, 18px)', color: '#eee', maxWidth: '600px', margin: '0', textShadow: '0 2px 10px rgba(0,0,0,0.8)', fontWeight: '500' }}>
          Découvrez le meilleur du cinéma avec DjaaSoo et de la musique traditionnelle avec DjeliSon. Regardez et écoutez vos artistes préférés.
        </p>
        <button className="tv-focusable" onClick={() => {
            // Trigger login modal logic can be passed via layout context, or rely on Navbar button for now
            alert("Veuillez utiliser le bouton 'S'identifier' en haut à droite.");
        }} style={{ background: 'linear-gradient(135deg, #ffb300, #ff4081)', color: 'white', border: 'none', padding: '16px 40px', borderRadius: '30px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 8px 30px rgba(255, 64, 129, 0.6)', transition: 'transform 0.3s, box-shadow 0.3s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
          Commencer l'aventure
        </button>
      </div>
    </div>
  );
}
