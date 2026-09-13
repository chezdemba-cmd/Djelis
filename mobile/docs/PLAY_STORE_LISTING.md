# Fiche Google Play — Djeli'S

Ce document contient le brouillon de fiche Play Store pour la V1 de lancement :
**DjeliSon disponible, DjaaSoo annoncé comme bientôt disponible**.

## Informations principales

| Champ Play Console | Valeur proposée |
|---|---|
| Nom de l'application | Djeli'S |
| Langue par défaut | Français (France) |
| Type | Application |
| Catégorie | Musique et audio |
| Contient des annonces | Non, à confirmer avant soumission |
| Adresse de la politique de confidentialité | https://djelis.com/privacy |
| Suppression de compte | https://djelis.com/delete-account |
| Adresse du site | https://djelis.com |
| Adresse d'assistance | support@djelis.com |

## Description courte

> Écoutez les musiques, récits, contes et podcasts qui font vivre nos cultures.

La description courte doit rester sous 80 caractères dans la Play Console.

## Description complète

> Djeli'S met les cultures ouest-africaines au premier plan.
>
> Avec DjeliSon, découvrez et écoutez des musiques, récits oraux, contes et
> podcasts. Retrouvez vos contenus, reprenez votre écoute et profitez de la
> lecture audio en arrière-plan depuis votre téléphone.
>
> DjaaSoo, l'univers vidéo de Djeli'S consacré au cinéma, aux séries, aux
> documentaires et aux spectacles, sera proposé prochainement.
>
> Fonctionnalités de cette première version :
>
> • catalogue audio DjeliSon ;
> • lecture en arrière-plan et commandes depuis l'écran verrouillé ;
> • profils utilisateurs, dont un profil Jeunesse ;
> • favoris et reprise de lecture ;
> • téléchargements disponibles pendant une durée limitée ;
> • suppression du compte directement depuis l'application.
>
> Djeli'S — Racines. Récits. Réalité.

Ne pas annoncer les abonnements, paiements ou locations tant que le mode V1 est
actif et que les passerelles n'ont pas été validées en production.

## Notes de version — 1.0.0

> Première version de Djeli'S.
>
> Découvrez DjeliSon, écoutez vos contenus en arrière-plan, gérez vos profils et
> retrouvez facilement vos favoris. L'univers vidéo DjaaSoo arrive bientôt.

## Éléments graphiques à fournir

Les sources officielles sont absentes du dépôt. Voir `ANDROID_ASSETS.md`.

- [ ] Icône Play Store 512 × 512 px.
- [ ] Bannière 1024 × 500 px.
- [ ] Au moins deux captures d'écran de téléphone.
- [ ] Icône applicative et icône adaptative.
- [ ] Logo du splash screen.

Captures recommandées : accueil DjeliSon, catalogue, lecteur audio, commandes
sur écran verrouillé, téléchargements et écran Compte.

## Déclarations Play Console à compléter

- [ ] Coordonnées publiques du développeur vérifiées.
- [ ] Présence ou absence de publicités confirmée.
- [ ] Questionnaire de classification du contenu rempli selon le catalogue réel.
- [ ] Public cible et présence d'un profil Jeunesse déclarés avec exactitude.
- [ ] Section « Sécurité des données » alignée sur les traitements réels.
- [ ] Accès à l'application fourni à Google si une connexion est obligatoire.
- [ ] Identifiants de démonstration valides ajoutés aux instructions d'examen.
- [ ] URL de confidentialité et URL de suppression accessibles publiquement.
- [ ] Test interne installé et vérifié sur au moins un téléphone réel.

## Blocages avant soumission

- [ ] Remplacer l'icône Flutter par l'identité graphique officielle.
- [ ] Définir juridiquement les durées de conservation dans la politique de
      confidentialité ; la page contient encore « À DÉFINIR AVANT PUBLICATION ».
- [ ] Confirmer que `privacy@djelis.com`, `contact@djelis.com` et
      `support@djelis.com` reçoivent réellement les messages.
- [ ] Confirmer que le domaine `djelis.com` et les trois pages publiques sont
      disponibles sans authentification.
- [ ] Produire un nouvel AAB après intégration des visuels officiels.

## Résultats techniques validés le 13 septembre 2026

- Backend : 24 tests réussis et build de production réussi.
- Web : lint et build de production réussis.
- Mobile : analyse Flutter sans erreur et 11 tests réussis.
- AAB : archive signée et vérifiable avec `jarsigner`.

Sous Windows, Flutter 3.47.2 génère un fichier de test invalide lorsque le
chemin du projet contient une apostrophe (`Djeli'S`). Les tests ont donc été
exécutés via une jonction temporaire sans apostrophe ; le code testé est bien
celui du dépôt.
