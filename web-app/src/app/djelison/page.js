"use client";

import { useSession } from "../../context/SessionContext";
import DjelisonScreen from "../../components/DjelisonScreen";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MiniPlayer from "../../components/MiniPlayer";
import VideoPlayerScreen from "../../components/VideoPlayerScreen";

import { getPlaybackUrl, resolveFallbackAudio } from "../../data/catalog";

export default function DjelisonPage() {
  const { isAuthenticated, currentProfile } = useSession();
  const router = useRouter();
  const [currentAudio, setCurrentAudio] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !currentProfile) {
      router.push("/browse");
    }
  }, [isAuthenticated, currentProfile, router]);

  if (!isAuthenticated || !currentProfile) return null;

  const handlePlayMedia = async (item) => {
    if (!item) return;
    if (item.youtubeId) {
      // Clips et vidéos YouTube : lecture via le lecteur vidéo immersif
      setCurrentVideo(item);
      setCurrentAudio(null);
    } else {
      // Fichiers audio natifs (MP3, podcasts, WAV)
      let resolvedUrl = item.audioUrl;
      // Si aucune audioUrl valide n'est encore résolue et qu'on a un contentId, tenter le jeton de streaming
      if ((!resolvedUrl || resolvedUrl.includes("soundhelix")) && item.contentId) {
        try {
          const streamUrl = await getPlaybackUrl(item.contentId);
          if (streamUrl) {
            resolvedUrl = streamUrl;
          }
        } catch (e) {
          console.warn("Could not retrieve stream token for audio:", e);
        }
      }
      // Fallback garanti sur nos pistes acoustiques locales de haute qualité
      if (!resolvedUrl || resolvedUrl.includes("soundhelix")) {
        resolvedUrl = resolveFallbackAudio(item.title, item.slug);
      }

      setCurrentAudio({
        ...item,
        audioUrl: resolvedUrl,
      });
      setCurrentVideo(null);
    }
  };

  return (
    <div className="app-page active">
      <section className="screen-tab active">
        <DjelisonScreen currentProfile={currentProfile} onPlayAudio={handlePlayMedia} />
      </section>

      <MiniPlayer key={currentAudio?.id} audioItem={currentAudio} onClose={() => setCurrentAudio(null)} />
      <VideoPlayerScreen isOpen={!!currentVideo} videoItem={currentVideo} onClose={() => setCurrentVideo(null)} />
    </div>
  );
}
