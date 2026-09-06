/**
 * Retire toute référence à l'emplacement réel du média avant d'envoyer un
 * contenu à un client. La lecture passe obligatoirement par POST /stream/token,
 * qui vérifie les droits puis renvoie une URL signée à courte durée.
 */
export function stripMediaRefs<T extends Record<string, any>>(content: T): T {
  if (!content || typeof content !== "object") return content;

  const { trailerCfId, ...rest } = content as Record<string, any>;
  const out: Record<string, any> = { ...rest, hasMedia: Boolean(trailerCfId) };

  // Pour les pistes audio ou le contenu gratuit, on expose l'URL directe du média
  // afin que les lecteurs audio (balise <audio>, MiniPlayer, mobile) puissent la lire instantanément.
  if (content.type === "AUDIO" || !content.isPremium) {
    out.audioUrl = trailerCfId || null;
  }

  if (Array.isArray(out.episodes)) {
    out.episodes = out.episodes.map((ep: any) => {
      if (!ep || typeof ep !== "object") return ep;
      const { cfStreamId, ...epRest } = ep as Record<string, any>;
      const epOut: Record<string, any> = {
        ...epRest,
        hasMedia: Boolean(cfStreamId),
      };
      if (content.type === "AUDIO" || !content.isPremium) {
        epOut.audioUrl = cfStreamId || null;
      }
      return epOut;
    });
  }

  return out as T;
}
