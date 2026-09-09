# Assets graphiques Android — Djeli'S

L'app utilise encore l'icône Flutter par défaut. La configuration
`flutter_launcher_icons` et `flutter_native_splash` est **déjà en place dans
`pubspec.yaml`** ; il ne manque que les visuels.

## Fichiers à fournir (par le projet — ne PAS inventer de logo)

Placer dans `mobile/assets/branding/` :

| Fichier | Format | Usage |
|---|---|---|
| `app_icon.png` | PNG **1024×1024**, carré, sans transparence | icône principale + fallback |
| `app_icon_foreground.png` | PNG **1024×1024**, logo centré avec ~25% de marge, fond transparent | couche avant de l'icône adaptative |
| `splash_logo.png` | PNG ~**512×512**, fond transparent | logo du splash screen |

Fond adaptatif et couleur de splash : `#141414` (déjà configuré, ajustable dans `pubspec.yaml`).

## Générer (après avoir déposé les fichiers)

```powershell
cd mobile
dart run flutter_launcher_icons
dart run flutter_native_splash:create
```

Cela régénère `android/app/src/main/res/mipmap-*/` (icônes + `mipmap-anydpi-v26/`
pour l'icône adaptative) et les ressources du splash. Committer le résultat.

## Assets fiche Play Store (hors app)

À préparer séparément pour la Play Console :

- Icône Play : **512×512** PNG 32 bits
- Feature graphic : **1024×500** PNG/JPG
- Screenshots téléphone : min 2, max 8, ratio 16:9 ou 9:16, 320–3840 px
- (optionnel) Screenshots tablette 7" et 10"
