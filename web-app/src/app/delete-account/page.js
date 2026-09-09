import Link from "next/link";

export const metadata = {
  title: "Suppression de compte | Djeli'S",
  description:
    "Comment demander la suppression de votre compte Djeli'S et de vos données personnelles.",
};

export default function DeleteAccountPage() {
  const lastUpdated = "9 septembre 2026";

  return (
    <div className="da-container">
      <header className="da-header">
        <Link href="/" className="da-back">
          <span className="material-icons-round">arrow_back</span>
          <span>Retour à Djeli&apos;S</span>
        </Link>
        <h1 className="da-title">Suppression de votre compte Djeli&apos;S</h1>
        <p className="da-subtitle">Dernière mise à jour : {lastUpdated}</p>
      </header>

      <main className="da-content">
        <section>
          <h2>Comment demander la suppression</h2>
          <p>Trois moyens équivalents, au choix :</p>
          <ol>
            <li>
              <strong>Dans l&apos;application Android</strong> : ouvrez{" "}
              <strong>Compte&nbsp;→&nbsp;Supprimer mon compte</strong>. Après une
              double confirmation, votre compte et vos données personnelles sont
              supprimés <strong>immédiatement</strong>.
            </li>
            <li>
              <strong>Par email</strong> : écrivez à{" "}
              <a href="mailto:privacy@djelis.com">privacy@djelis.com</a> depuis
              l&apos;adresse associée à votre compte, avec pour objet{" "}
              <em>« Demande de suppression de compte »</em>. Traitement sous{" "}
              <strong>48&nbsp;heures</strong>.
            </li>
            <li>
              <strong>Compte créé avec un numéro de téléphone</strong> : envoyez
              votre demande à <a href="mailto:privacy@djelis.com">privacy@djelis.com</a>{" "}
              en précisant le numéro concerné ; nous vérifions votre identité avant
              de procéder.
            </li>
          </ol>
          <p className="da-note">
            Nous ne demandons jamais votre mot de passe par email ni sur cette page.
          </p>
        </section>

        <section>
          <h2>Données supprimées</h2>
          <ul>
            <li>le compte (identifiants email / téléphone, mot de passe) ;</li>
            <li>tous les profils utilisateurs (dont profils Jeunesse) ;</li>
            <li>l&apos;historique de lecture et la progression ;</li>
            <li>les favoris (« Ma Liste ») ;</li>
            <li>les appareils et sessions enregistrés ;</li>
            <li>les téléchargements liés au compte ;</li>
            <li>les abonnements en cours.</li>
          </ul>
        </section>

        <section>
          <h2>Données conservées</h2>
          <p>
            Seules les informations strictement nécessaires à nos obligations
            légales et comptables — notamment les <strong>preuves de transaction
            de paiement</strong> — sont conservées, sous forme{" "}
            <strong>anonymisée</strong> (dissociées de votre identité), pour la
            durée légale applicable.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Confidentialité :{" "}
            <a href="mailto:privacy@djelis.com">privacy@djelis.com</a>
            <br />
            Support général :{" "}
            <a href="mailto:contact@djelis.com">contact@djelis.com</a>
          </p>
          <p>
            Voir aussi notre{" "}
            <Link href="/privacy">Politique de confidentialité</Link>.
          </p>
        </section>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .da-container{min-height:100vh;background:#0c0c10;color:#e0e0e0;padding:40px 20px 80px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;line-height:1.7}
        .da-header{max-width:760px;margin:0 auto 32px;padding-bottom:20px;border-bottom:1px solid rgba(255,255,255,.1)}
        .da-back{display:inline-flex;align-items:center;gap:8px;color:#ffb300;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:20px}
        .da-title{font-size:clamp(24px,4vw,36px);font-weight:900;color:#fff;margin:0 0 6px}
        .da-subtitle{color:rgba(255,255,255,.5);font-size:14px;margin:0}
        .da-content{max-width:760px;margin:0 auto}
        .da-content section{margin-bottom:32px}
        .da-content h2{font-size:20px;font-weight:800;color:#fff;margin-bottom:12px;border-left:4px solid #ffb300;padding-left:12px}
        .da-content p,.da-content li{color:#ccc;margin-bottom:10px}
        .da-content ol,.da-content ul{padding-left:24px}
        .da-content strong{color:#fff}
        .da-content a{color:#ffb300}
        .da-note{font-size:13px;color:rgba(255,255,255,.55)}
      `,
        }}
      />
    </div>
  );
}
