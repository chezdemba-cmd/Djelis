/**
 * Mode lancement : DjaaSoo verrouillé ("Bientôt disponible"), DjeliSon gratuit,
 * aucun parcours d'abonnement affiché.
 *
 * Piloté par la variable d'environnement NEXT_PUBLIC_LAUNCH_MODE (Vercel).
 * Le jour de l'ouverture : passer à "false" (ou la retirer) côté web ET
 * retirer LAUNCH_MODE côté backend, puis redéployer.
 */
export const LAUNCH_MODE = process.env.NEXT_PUBLIC_LAUNCH_MODE === "true";
