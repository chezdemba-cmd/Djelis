"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import PlansModal from "../components/PlansModal";
import MobileDrawer from "../components/MobileDrawer";
import BottomNav from "../components/BottomNav";
import { useSession } from "../context/SessionContext";
import { readAccessToken } from "../lib/authClient";
import { useRouter } from "next/navigation";

export default function LayoutClient({ children }) {
  const [isPlansOpen, setIsPlansOpen] = useState(false);
  const [plansModalMode, setPlansModalMode] = useState("login");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isLoading, login } = useSession();
  const router = useRouter();

  if (isLoading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Chargement...</div>;
  }

  return (
    <div className="app-root">
      <div className="app-container">
        <Navbar 
          onOpenLogin={() => {
            setPlansModalMode("login");
            setIsPlansOpen(true);
          }} 
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        <MobileDrawer 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
          onOpenLogin={() => {
            setPlansModalMode("login");
            setIsPlansOpen(true);
            setIsMobileMenuOpen(false);
          }}
        />
        
        <main className="app-content">
          {children}
        </main>

        <BottomNav />
        
        <PlansModal 
          isOpen={isPlansOpen} 
          initialMode={plansModalMode}
          onClose={() => setIsPlansOpen(false)} 
          onComplete={async (data) => {
            if (data && data.access_token) {
              await login(data.access_token, data.refresh_token);
            } else {
              // Repli : PlansModal a déjà posé les cookies, on resynchronise l'état.
              const token = readAccessToken();
              if (token) await login(token);
            }
            setIsPlansOpen(false);
            router.push('/browse');
          }}
        />
      </div>
    </div>
  );
}
