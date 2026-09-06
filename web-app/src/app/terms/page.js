import Link from "next/link";

export const metadata = {
  title: "Conditions Générales d'Utilisation (CGU) | Djeli'S",
  description:
    "Conditions générales d'utilisation et de vente de la plateforme de streaming Djeli'S (DjaaSoo et DjeliSon).",
};

export default function TermsPage() {
  const lastUpdated = "6 septembre 2026";

  return (
    <div className="legal-page-container">
      <header className="legal-header">
        <Link href="/" className="legal-back-btn">
          <span className="material-icons-round">arrow_back</span>
          <span>Retour à Djeli&apos;S</span>
        </Link>
        <div className="legal-badge">Cadre Contractuel</div>
        <h1 className="legal-title">Conditions Générales d&apos;Utilisation (CGU)</h1>
        <p className="legal-subtitle">Dernière mise à jour : {lastUpdated}</p>
      </header>

      <main className="legal-content">
        <section className="legal-section">
          <h2>1. Objet du Service</h2>
          <p>
            Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent
            l&apos;accès et l&apos;utilisation de la plateforme de streaming{" "}
            <strong>Djeli&apos;S</strong>, éditée et exploitée sur le web (
            <a href="https://djelis.com">https://djelis.com</a>) et sur les applications
            mobiles officielles.
          </p>
          <p>
            Djeli&apos;S offre deux univers complémentaires :
          </p>
          <ul>
            <li>
              <strong>DjaaSoo :</strong> Service de vidéo à la demande (cinéma,
              séries, documentaires, captations théâtrales et humour).
            </li>
            <li>
              <strong>DjeliSon :</strong> Service de streaming audio (musique, clips
              vidéos, récits oraux traditionnels, contes et podcasts).
            </li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>2. Inscription et Sécurité du Compte</h2>
          <p>
            Pour accéder à l&apos;intégralité des contenus et fonctionnalités,
            l&apos;utilisateur doit créer un compte personnel en fournissant une adresse
            email valide et un mot de passe sécurisé.
          </p>
          <p>
            L&apos;utilisateur est seul responsable de la confidentialité de ses identifiants.
            Toute utilisation de la plateforme réalisée avec ses identifiants est réputée
            effectuée par lui-même.
          </p>
        </section>

        <section className="legal-section">
          <h2>3. Tarifs, Abonnements et Locations (VOD)</h2>
          <p>
            Djeli&apos;S propose des contenus accessibles selon plusieurs formules :
          </p>
          <ul>
            <li>
              <strong>Contenus gratuits / promotionnels :</strong> Accessibles sans surcoût
              par les utilisateurs inscrits.
            </li>
            <li>
              <strong>Abonnements (Pass Premium) :</strong> Accès illimité au catalogue
              couvert pour la période souscrite (mensuelle ou annuelle).
            </li>
            <li>
              <strong>Location à l&apos;acte (Pay-Per-View) :</strong> Accès temporaire à un
              film ou spectacle pour une durée de 48 heures à compter de la validation du
              paiement.
            </li>
          </ul>
          <p>
            Les paiements s&apos;effectuent en toute sécurité via nos partenaires agrées :
            <strong>Wave Mobile Money</strong> et <strong>CinetPay</strong> (Orange Money, MTN, Moov, cartes bancaires).
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Propriété Intellectuelle et Droits d&apos;Auteur</h2>
          <p>
            L&apos;ensemble des œuvres (films, musiques, scénarios, illustrations, marques
            et logos) présents sur Djeli&apos;S sont protégés par le droit d&apos;auteur
            et les traités internationaux relatifs à la propriété intellectuelle.
          </p>
          <p>
            Djeli&apos;S concède à l&apos;utilisateur une licence personnelle, non exclusive,
            non transférable et révocable, strictement limitée à un usage privé et familial.
            Sont formellement interdits : la capture de flux, le téléchargement illicite,
            la rediffusion publique, la copie ou la commercialisation de tout ou partie des
            contenus.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Disponibilité et Territoires de Diffusion</h2>
          <p>
            Certains contenus peuvent faire l&apos;objet de restrictions géographiques
            (géo-blocage légal) conformément aux accords conclus avec les créateurs,
            producteurs et ayants droit. Djeli&apos;S s&apos;efforce d&apos;assurer une
            disponibilité du service 24h/24 et 7j/7, sous réserve des périodes de
            maintenance programmée.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Résiliation et Clôture de Compte</h2>
          <p>
            L&apos;utilisateur peut à tout moment résilier son abonnement ou demander la
            suppression définitive de son compte. La résiliation d&apos;un abonnement met fin
            au renouvellement automatique à l&apos;échéance de la période en cours.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Loi Applicable et Juridiction</h2>
          <p>
            Les présentes conditions sont régies et interprétées conformément au droit
            applicable. En cas de litige, les parties s&apos;efforceront de trouver une
            solution amiable avant toute action judiciaire.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Contact</h2>
          <p>
            Pour toute réclamation ou question relative à l&apos;utilisation de la plateforme :
          </p>
          <div className="legal-contact-card">
            <p><strong>Service Client Djeli&apos;S</strong></p>
            <p>Email : <a href="mailto:contact@djelis.com">contact@djelis.com</a></p>
            <p>Support technique : <a href="mailto:support@djelis.com">support@djelis.com</a></p>
          </div>
        </section>
      </main>

      <footer className="legal-footer">
        <p>&copy; 2026 Djeli&apos;S. Tous droits réservés.</p>
        <div className="legal-footer-links">
          <Link href="/terms">Conditions Générales d&apos;Utilisation (CGU)</Link>
          <Link href="/privacy">Politique de Confidentialité</Link>
          <Link href="/">Accueil Djeli&apos;S</Link>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .legal-page-container {
          min-height: 100vh;
          background-color: #0c0c10;
          color: #e0e0e0;
          padding: 40px 20px 80px 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          line-height: 1.7;
        }

        .legal-header {
          max-width: 860px;
          margin: 0 auto 40px auto;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .legal-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #ffb300;
          text-decoration: none;
          font-weight: 700;
          font-size: 15px;
          margin-bottom: 24px;
          transition: transform 0.2s ease;
        }

        .legal-back-btn:hover {
          transform: translateX(-4px);
        }

        .legal-badge {
          display: inline-block;
          background: rgba(255, 179, 0, 0.15);
          color: #ffb300;
          border: 1px solid rgba(255, 179, 0, 0.3);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 4px;
          margin-bottom: 14px;
        }

        .legal-title {
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 900;
          color: #ffffff;
          margin: 0 0 8px 0;
          letter-spacing: -0.5px;
        }

        .legal-subtitle {
          color: rgba(255, 255, 255, 0.5);
          font-size: 14px;
          margin: 0;
        }

        .legal-content {
          max-width: 860px;
          margin: 0 auto;
        }

        .legal-section {
          margin-bottom: 36px;
        }

        .legal-section h2 {
          font-size: 22px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 14px;
          border-left: 4px solid #e50914;
          padding-left: 12px;
        }

        .legal-section p {
          margin-bottom: 14px;
          color: #cccccc;
        }

        .legal-section ul {
          padding-left: 24px;
          margin-bottom: 16px;
        }

        .legal-section li {
          margin-bottom: 8px;
          color: #cccccc;
        }

        .legal-section strong {
          color: #ffffff;
        }

        .legal-contact-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 20px;
          margin-top: 16px;
        }

        .legal-contact-card p {
          margin: 6px 0;
        }

        .legal-contact-card a {
          color: #ffb300;
          text-decoration: none;
        }

        .legal-contact-card a:hover {
          text-decoration: underline;
        }

        .legal-footer {
          max-width: 860px;
          margin: 60px auto 0 auto;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
          color: rgba(255, 255, 255, 0.4);
          font-size: 14px;
        }

        .legal-footer-links {
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
          margin-top: 12px;
        }

        .legal-footer-links a {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
        }

        .legal-footer-links a:hover {
          color: #ffb300;
        }
      `}} />
    </div>
  );
}
