# 🏆 Audit Comparatif de Référence : Djeli'S vs. Netflix, Amazon Prime & Apple TV

**Rédigé par** : Architecte Principal de Systèmes et Expert en Ingénierie UX  
**Objectif** : Évaluer Djeli'S par rapport aux leaders mondiaux du streaming pour identifier les fonctionnalités et les fenêtres requises afin d'élever la plateforme aux standards internationaux.

---

## 📊 Tableau Synthétique de Comparaison des Fonctionnalités

| Fonctionnalité | Netflix | Amazon Prime | Apple TV | Djeli'S (Actuel) | Recommandation Djeli'S |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Sélection d'Univers / Profils** | Multi-Profils | Multi-Profils | Multi-Comptes | Univers (DjaaSoo/Son) | **Combiner les deux** (Profils sous chaque Univers) |
| **Modèle de Tarification** | SVOD Uniquement | SVOD + Achat/Location | SVOD + Chaînes | SVOD (Forfaits) | **SVOD + TVOD** (Paiement à l'acte pour les exclusivités) |
| **Continuité de Lecture** | Instantanée | Fluide | Excellente | Basique (WatchHistory) | **Widget "Reprendre la lecture" dynamique** |
| **Stockage & Mode Hors-ligne** | Chiffré local | Chiffré local | Chiffré local | Simulé (Frontend) | **Téléchargement chiffré via le client mobile** |
| **Audio de fond (Background)** | Non | Non | Non | Lecteur minimal (Web) | **Mode Spotify (Écran éteint pour DjeliSon)** |

---

## 1. Structure Multi-Profils & Personnalisation (Référence : Netflix)

### 🧐 L'existant sur Djeli'S
Nous avons mis en place une superbe fenêtre d'accueil de sélection d'univers (**DjaaSoo / DjeliSon**). C'est une excellente première étape, mais elle sépare le contenu par type de média et non par utilisateur.

### 💡 Recommandation Netflix-Style
Pour devenir une plateforme familiale sérieuse en Afrique de l'Ouest (où les ménages sont souvent grands et partagent des appareils) :
* **Ce qu'il faut ajouter (Fenêtre)** : Un écran de sélection de **Profils Utilisateurs** (ex: *Papa*, *Maman*, *Enfants*) immédiatement après le choix de l'univers ou de la connexion.
* **Impact Technique** : Séparer l'historique de lecture (`WatchHistory`), les listes de favoris (`MyList`) et les recommandations par profil.
* **Profil Kids (Enfants)** : Un profil spécifique filtrant automatiquement les contes et dessins animés (DjeliSon/DjaaSoo) sans accès aux contenus adultes ou aux formulaires de paiement.

---

## 2. Flexibilité de Monétisation : SVOD & TVOD (Référence : Amazon Prime & Apple TV)

### 🧐 L'existant sur Djeli'S
L'abonnement actuel donne un accès illimité à toute la plateforme pour une durée choisie (Jour, Semaine, Mois) avec paiement via Stripe ou Mobile Money.

### 💡 Recommandation Amazon / Apple-Style
Le modèle d'abonnement pur (SVOD) peut être difficile à rentabiliser pour les superproductions de cinéma africain ou les pièces de théâtre exclusives à forte valeur ajoutée.
* **Ce qu'il faut ajouter (Fonctionnalité & Fenêtre)** : Le concept de **Location/Achat de contenus (TVOD)** ou **"Tickets Virtuels"**.
* **Exemple concret** : Un film de cinéma premium ou une grande pièce de théâtre inédite peut être louée pendant 48 heures pour 500 FCFA (ou 2 € pour la diaspora), même pour les utilisateurs non abonnés.
* **Impact Interface** : Ajouter une icône "Premium/Location" sur les vignettes de films et un écran d'achat rapide par Mobile Money (Wave, Orange Money) directement sur la fiche du film.

---

## 3. Reprise de Lecture Multi-Écrans : "Continuer la lecture" (Référence : Apple TV)

### 🧐 L'existant sur Djeli'S
Nous enregistrons la progression via le endpoint `/stream/progress` dans la table `WatchHistory`.

### 💡 Recommandation Apple-Style
La reprise de lecture doit être totalement transparente pour l'utilisateur, peu importe son appareil (Téléphone, Web, TV).
* **Ce qu'il faut ajouter (Option UI)** : Dès que l'utilisateur ouvre l'application (DjaaSoo ou DjeliSon), une ligne dynamique **"Continuer la lecture"** doit apparaître en haut du flux.
* **Lecture Instantanée** : Si l'utilisateur clique sur un film qu'il a commencé sur son téléphone, l'application web doit s'ouvrir exactement à la seconde près, en affichant un badge : *"Reprise de la lecture là où vous vous êtes arrêté sur Mobile"*.

---

## 4. Hors-Ligne Résilient : Téléchargement Local (Référence : Netflix & Prime Video)

### 🧐 L'existant sur Djeli'S
Aucune possibilité de télécharger réellement des fichiers sur l'appareil.

### 💡 Recommandation Industrielle
En Afrique de l'Ouest, la connectivité mobile (4G/5G) peut être instable ou onéreuse. Permettre aux utilisateurs de télécharger leurs vidéos ou podcasts lorsqu'ils sont connectés au Wi-Fi pour les regarder plus tard sans connexion est une obligation absolue.
* **Ce qu'il faut ajouter (Fonctionnalité Mobile)** : Un bouton **"Télécharger"** sur la fiche de chaque contenu.
* **Impact Sécurité** : Les fichiers ne doivent pas être enregistrés en MP4 brut (pour éviter le piratage), mais chiffrés localement dans le stockage sécurisé de l'appareil mobile et lus uniquement via le player de l'application (DRM local).

---

## 5. Mode Audio-First : Écoute en Arrière-plan (Référence : Spotify & Apple Podcasts)

### 🧐 L'existant sur Djeli'S
Le lecteur audio `MiniPlayer` fonctionne dans l'onglet actif de la page web.

### 💡 Recommandation DjeliSon
Contrairement aux géants de la vidéo, Djeli'S possède une section audio majeure (récits de griots, contes, musique).
* **Ce qu'il faut ajouter (Fonctionnalité Mobile)** : L'application mobile doit impérativement supporter la **lecture en arrière-plan** avec l'écran verrouillé.
* **Impact Système** : Intégrer les contrôles de lecture sur l'écran de verrouillage du smartphone (Play, Pause, Suivant) afin que l'utilisateur puisse écouter un conte traditionnel ou un podcast tout en marchant ou en utilisant une autre application.

---

## 🛠️ Plan d'Action Prioritaire pour l'Équipe de Développement

1. **Intégration d'un CDN de Vidéo (Streaming)** : Utiliser **Cloudflare Stream** (déjà mentionné dans vos contrats) pour transcoder automatiquement les vidéos uploadées dans l'Espace Admin en plusieurs qualités adaptatives (comme le fait Netflix) pour s'adapter aux faibles connexions 3G/4G.
2. **Ajout de la table `Profile` dans le code Web** : Configurer la sélection de profil à l'entrée du site Next.js.
3. **Mise en place de la fonction "Téléchargement" dans le client Flutter** : Utiliser la bibliothèque `flutter_downloader` avec chiffrement.
