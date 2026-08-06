"use client";

import { useSession } from "../../context/SessionContext";
import ProfileSelector from "../../components/ProfileSelector";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function BrowsePage() {
  const { isAuthenticated, currentProfile, selectProfile } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  if (!currentProfile) {
    return <ProfileSelector onSelectProfile={selectProfile} />;
  }

  return (
    <div className="app-page active">
      <div className="app-selection-screen" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '60vh', gap: '40px', padding: '20px' }}>
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 32px)', textAlign: 'center' }}>Que souhaitez-vous explorer ?</h2>
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div className="app-select-card tv-focusable" onClick={() => router.push('/djaasoo')} style={{ cursor: 'pointer', background: 'linear-gradient(145deg, #2a2a2d, #1b1b1d)', padding: '40px', borderRadius: '20px', textAlign: 'center', width: '260px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', transition: 'transform 0.3s' }}>
            <span style={{ fontSize: '60px' }}>🎬</span>
            <h3 style={{ marginTop: '20px', color: '#fff', fontSize: '24px' }}>DjaaSoo</h3>
            <p style={{ color: '#aaa', fontSize: '15px', marginTop: '10px' }}>Cinéma, Séries & Documentaires</p>
          </div>
          <div className="app-select-card tv-focusable" onClick={() => router.push('/djelison')} style={{ cursor: 'pointer', background: 'linear-gradient(145deg, #2a2a2d, #1b1b1d)', padding: '40px', borderRadius: '20px', textAlign: 'center', width: '260px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', transition: 'transform 0.3s' }}>
            <span style={{ fontSize: '60px' }}>🎵</span>
            <h3 style={{ marginTop: '20px', color: '#ffb300', fontSize: '24px' }}>DjeliSon</h3>
            <p style={{ color: '#aaa', fontSize: '15px', marginTop: '10px' }}>Musique, Contes & Podcasts</p>
          </div>
        </div>
      </div>
    </div>
  );
}
