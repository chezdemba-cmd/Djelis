"use client";

import { useSession } from "../../context/SessionContext";
import DjelisonScreen from "../../components/DjelisonScreen";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MiniPlayer from "../../components/MiniPlayer";

export default function DjelisonPage() {
  const { isAuthenticated, currentProfile } = useSession();
  const router = useRouter();
  const [currentAudio, setCurrentAudio] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !currentProfile) {
      router.push('/browse');
    }
  }, [isAuthenticated, currentProfile, router]);

  if (!isAuthenticated || !currentProfile) return null;

  return (
    <div className="app-page active">
      <section className="screen-tab active">
        <DjelisonScreen currentProfile={currentProfile} onPlayAudio={setCurrentAudio} />
      </section>
      
      <MiniPlayer key={currentAudio?.id} audioItem={currentAudio} onClose={() => setCurrentAudio(null)} />
    </div>
  );
}
