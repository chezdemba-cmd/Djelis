/**
 * Retire toute référence à l'emplacement réel du média avant d'envoyer un
 * contenu à un client. La lecture passe obligatoirement par POST /stream/token,
 * qui vérifie les droits puis renvoie une URL signée à courte durée.
 */
export function stripMediaRefs<T extends Record<string, any>>(content: T): T {
  if (!content || typeof content !== "object") return content;

  const { trailerCfId, ...rest } = content as Record<string, any>;
  const out: Record<string, any> = { ...rest, hasMedia: Boolean(trailerCfId) };

  if (Array.isArray(out.episodes)) {
    out.episodes = out.episodes.map((ep: any) => {
      if (!ep || typeof ep !== "object") return ep;
      const { cfStreamId, ...epRest } = ep as Record<string, any>;
      return { ...epRest, hasMedia: Boolean(cfStreamId) };
    });
  }

  return out as T;
}
