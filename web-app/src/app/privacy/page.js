import Link from "next/link";

export const metadata = {
  title: "Politique de Confidentialité | Djeli'S",
  description:
    "Découvrez comment Djeli'S collecte, utilise et protège vos données personnelles conformément aux exigences Google Play, Apple App Store et aux standards de protection des données.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "6 septembre 2026";

  return (
    <div className="legal-page-container">
      <header className="legal-header">
        <Link href="/" className="legal-back-btn">
          <span className="material-icons-round">arrow_back</span>
          <span>Retour à Djeli&apos;S</span>
        </Link>
        <div className="legal-badge">Conformité Légale & Stores</div>
        <h1 className="legal-title">Politique de Confidentialité</h1>
        <p className="legal-subtitle">Dernière mise à jour : {lastUpdated}</p>
      </header>

      <main className="legal-content">
        <section className="legal-section">
          <h2>1. Introduction</h2>
          <p>
            La présente Politique de Confidentialité s&apos;applique à la plateforme{" "}
            <strong>Djeli&apos;S</strong>, accessible via notre site web (
            <a href="https://djelis.com">https://djelis.com</a>) et nos applications
            mobiles officielles sur Google Play Store et Apple App Store.
          </p>
          <p>
            Djeli&apos;S propose des services de streaming vidéo (<strong>DjaaSoo</strong>)
            et audio (<strong>DjeliSon</strong>). Nous attachons une importance
            capitale à la transparence et au respect de la vie privée de nos
            utilisateurs.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Données personnelles collectées</h2>
          <p>
            Nous limitons strictement la collecte des données aux éléments
            nécessaires au bon fonctionnement du service :
          </p>
          <ul>
            <li>
              <strong>Informations de compte :</strong> Adresse email, mot de passe
              chiffré (hashé de manière irréversible), nom d&apos;affichage ou pseudo,
              profils utilisateurs associés (y compris le mode Jeunesse/Kids).
            </li>
            <li>
              <strong>Paiements et abonnements :</strong> Lorsque vous souscrivez à un
              abonnement ou louez un contenu via Wave ou CinetPay (Orange Money, MTN,
              Moov, carte bancaire), nous enregistrons uniquement l&apos;identifiant de
              transaction et le statut du paiement. <em>Vos données bancaires et codes secrets ne transitent jamais sur nos serveurs.</em>
            </li>
            <li>
              <strong>Données d&apos;utilisation du service :</strong> Historique de lecture,
              progression dans les vidéos et morceaux (pour la reprise de lecture),
              favoris (« Ma Liste ») et préférences de langue.
            </li>
            <li>
              <strong>Données techniques :</strong> Adresse IP (utilisée
              exclusivement pour vérifier les droits territoriaux de diffusion et
              prévenir la fraude), type d&apos;appareil et version du système
              d&apos;exploitation.
            </li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. Finalités du traitement des données</h2>
          <p>Vos données sont traitées pour les finalités suivantes :</p>
          <ul>
            <li>Création, sécurisation et authentification de votre compte.</li>
            <li>Accès personnalisé aux flux de streaming vidéo et audio.</li>
            <li>Gestion des abonnements, facturation et prévention de la fraude.</li>
            <li>Contrôle parental et filtrage des contenus adaptés au profil Jeunesse.</li>
            <li>Amélioration continue de la performance et de la fluidité de nos applications.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Sécurité et hébergement des données</h2>
          <p>
            Toutes les communications entre votre appareil et nos serveurs sont
            systématiquement chiffrées selon le protocole de pointe{" "}
            <strong>HTTPS (TLS 1.3)</strong>.
          </p>
          <p>
            Les flux médias et les jetons de lecture sont sécurisés par des URLs signées
            à courte durée de validité, empêchant tout accès ou diffusion non autorisée.
            Nos bases de données sont hébergées sur des infrastructures conformes aux
            normes internationales de sécurité (ISO 27001, SOC 2).
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Partage des données</h2>
          <p>
            <strong>Djeli&apos;S ne vend, ne loue et ne cède aucune donnée personnelle à des tiers à des fins publicitaires.</strong>
          </p>
          <p>Les données ne sont partagées qu&apos;avec nos partenaires techniques essentiels :</p>
          <ul>
            <li>
              <strong>Opérateurs de paiement agréés :</strong> Wave et CinetPay pour
              le traitement sécurisé des paiements Mobile Money et cartes bancaires.
            </li>
            <li>
              <strong>Fournisseurs d&apos;hébergement et d&apos;infrastructure :</strong> Pour
              la distribution sécurisée des flux vidéo et audio.
            </li>
            <li>
              <strong>Autorités légales :</strong> Uniquement si la loi ou une décision
              judiciaire exécutoire nous y contraint.
            </li>
          </ul>
        </section>

        <section className="legal-section highlight-box">
          <h2>6. Vos droits et suppression de compte</h2>
          <p>
            Conformément aux réglementations sur la protection des données et aux
            exigences de <strong>Google Play</strong> et de l&apos;<strong>Apple App Store</strong>,
            vous disposez à tout moment des droits suivants :
          </p>
          <ul>
            <li><strong>Droit d&apos;accès :</strong> Consulter l&apos;ensemble de vos données personnelles.</li>
            <li><strong>Droit de rectification :</strong> Modifier vos informations depuis la page Profil.</li>
            <li><strong>Droit d&apos;opposition :</strong> Vous opposer à certains traitements non essentiels.</li>
            <li>
              <strong>Droit à l&apos;effacement (Suppression de compte) :</strong> Vous pouvez
              demander la suppression complète et définitive de votre compte et de toutes
              les données associées (profils, historique, favoris) à tout moment.
            </li>
          </ul>
          <p style={{ marginTop: "15px" }}>
            Pour demander la suppression immédiate de votre compte, rendez-vous dans vos
            paramètres de profil ou adressez un email à{" "}
            <a href="mailto:privacy@djelis.com" className="legal-link">
              privacy@djelis.com
            </a>{" "}
            avec pour objet <em>« Demande de suppression de compte »</em>. Votre compte
            sera clôturé et vos données purgées sous 48 heures.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Protection des mineurs</h2>
          <p>
            Djeli&apos;S propose des profils dédiés aux enfants (« Kids »). Ces profils
            restreignent l&apos;accès aux contenus classés « Tous publics ». Aucune donnée
            à des fins commerciales n&apos;est collectée sur les profils enfants.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Contact & Délégué à la Protection des Données</h2>
          <p>
            Pour toute question concernant cette politique ou pour exercer vos droits,
            vous pouvez contacter notre équipe à :
          </p>
          <div className="legal-contact-card">
            <p><strong>Djeli&apos;S Platform</strong></p>
            <p>Email Confidentialité : <a href="mailto:privacy@djelis.com">privacy@djelis.com</a></p>
            <p>Support général : <a href="mailto:contact@djelis.com">contact@djelis.com</a></p>
            <p>Site officiel : <a href="https://djelis.com">https://djelis.com</a></p>
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
          background: rgba(229, 9, 20, 0.15);
          color: #e50914;
          border: 1px solid rgba(229, 9, 20, 0.3);
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
          border-left: 4px solid #ffb300;
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

        .highlight-box {
          background: rgba(255, 179, 0, 0.06);
          border: 1px solid rgba(255, 179, 0, 0.25);
          border-radius: 10px;
          padding: 24px;
        }

        .legal-link {
          color: #ffb300;
          text-decoration: underline;
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
