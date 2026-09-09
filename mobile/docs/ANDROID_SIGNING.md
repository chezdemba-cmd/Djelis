# Signature Android — Djeli'S (clé d'upload Play)

L'app doit être signée avec une **clé d'upload** pour être publiée. Google
conserve la clé de signature finale (Play App Signing) ; toi tu conserves la
clé d'upload. **Si tu perds la clé d'upload, tu peux en demander une nouvelle
à Google — mais ne la perds pas.**

## 1. Générer la clé d'upload (une seule fois — À FAIRE PAR LE PROPRIÉTAIRE)

Sur ta machine, **hors du dépôt** (par ex. `C:\Users\chezd\djelis-keys\`) :

```powershell
keytool -genkey -v -keystore upload-keystore.jks ^
  -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

- `keytool` est fourni par le JDK (`C:\Program Files\Microsoft\jdk-21...\bin`).
- Renseigne un mot de passe fort (garde-le dans un gestionnaire de mots de passe).
- Réponds aux questions (nom, organisation, pays `ML`, etc.).

**Sauvegarde `upload-keystore.jks` + les mots de passe dans un endroit sûr et
redondant (gestionnaire de mots de passe + copie chiffrée hors ligne).**
Ce fichier ne doit JAMAIS entrer dans le dépôt Git (déjà couvert par `.gitignore`).

## 2. Déclarer la clé au projet (local, non committé)

Copie `android/key.properties.example` en `android/key.properties` et remplis :

```properties
storePassword=<mot de passe du keystore>
keyPassword=<mot de passe de la clé>
keyAlias=upload
storeFile=C:/Users/chezd/djelis-keys/upload-keystore.jks
```

`android/app/build.gradle.kts` lit ce fichier s'il existe : dans ce cas le build
release est signé avec ta clé d'upload. **S'il est absent, le build retombe sur
les clés de debug** (utile pour `flutter run --release` en local, mais un tel
`.aab` n'est pas publiable).

## 3. Vérifier

```powershell
flutter build appbundle --release ^
  --dart-define=API_BASE_URL=https://<backend-prod>/api/v1 ^
  --dart-define=APP_ENV=production ^
  --dart-define=LAUNCH_MODE_V1=true
```

Puis, pour confirmer que l'AAB est signé avec la bonne clé :

```powershell
jarsigner -verify -verbose -certs build\app\outputs\bundle\release\app-release.aab
```

## 4. Play Console

À la création de l'app dans la Play Console, active **Play App Signing** et
téléverse ce premier `.aab` : Google enregistre alors la clé d'upload.
