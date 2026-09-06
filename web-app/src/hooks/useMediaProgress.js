import { useEffect, useRef } from 'react';
import { getAccessToken } from '../lib/authClient';

/**
 * Hook pour suivre la progression de lecture d'un média et la synchroniser avec le backend.
 * @param {React.RefObject} mediaRef - Référence vers l'élément <video> ou <audio>
 * @param {string} contentId - ID du contenu en cours de lecture
 * @param {string} episodeId - (Optionnel) ID de l'épisode si c'est une série
 */
export function useMediaProgress(mediaRef, contentId, episodeId = null, profileId = null) {
  const lastSyncTimeRef = useRef(0);
  const syncInterval = 10; // Synchronisation toutes les 10 secondes

  useEffect(() => {
    const mediaElement = mediaRef.current;
    // Pas de profil sélectionné => on ne synchronise pas (le backend exige
    // désormais un profile_id valide et n'attribue plus à un profil arbitraire).
    if (!mediaElement || !contentId || !profileId) return;

    const syncProgress = async (currentTime) => {
      try {
        const token = await getAccessToken();
        if (!token) return; // Si non authentifié, on ne synchronise pas

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        await fetch(`${baseUrl}/api/v1/stream/progress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            content_id: contentId,
            episode_id: episodeId,
            progress_sec: Math.floor(currentTime),
            profile_id: profileId
          })
        });
      } catch (error) {
        console.error("Erreur lors de la synchronisation de la progression", error);
      }
    };

    const handleTimeUpdate = () => {
      const currentTime = mediaElement.currentTime;
      // Synchronisation si la différence avec le dernier sync est >= 10s
      if (Math.abs(currentTime - lastSyncTimeRef.current) >= syncInterval) {
        lastSyncTimeRef.current = currentTime;
        syncProgress(currentTime);
      }
    };

    const handleBeforeUnload = () => {
       if (mediaElement && mediaElement.currentTime > 0) {
         syncProgress(mediaElement.currentTime);
       }
    };

    mediaElement.addEventListener('timeupdate', handleTimeUpdate);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (mediaElement) {
        // Dernière synchronisation avant démontage du composant
        syncProgress(mediaElement.currentTime);
        mediaElement.removeEventListener('timeupdate', handleTimeUpdate);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [mediaRef, contentId, episodeId, profileId]);
}
