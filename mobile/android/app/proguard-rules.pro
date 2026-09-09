# ── Règles R8 / ProGuard — Djeli'S ─────────────────────────────────────────────
# Flutter et la plupart des plugins fournissent leurs propres règles
# "consumer" ; ce fichier ne contient que les compléments et les -dontwarn
# nécessaires pour un build release qui ne casse pas au runtime.

# Flutter engine (sécurité — normalement déjà couvert)
-keep class io.flutter.embedding.** { *; }
-keep class io.flutter.plugin.** { *; }

# Play Core (deferred components) — non utilisé par l'app, référencé par
# l'embedding Flutter. Règles générées par l'AGP (missing_rules.txt).
-dontwarn com.google.android.play.core.splitcompat.SplitCompatApplication
-dontwarn com.google.android.play.core.splitinstall.SplitInstallException
-dontwarn com.google.android.play.core.splitinstall.SplitInstallManager
-dontwarn com.google.android.play.core.splitinstall.SplitInstallManagerFactory
-dontwarn com.google.android.play.core.splitinstall.SplitInstallRequest$Builder
-dontwarn com.google.android.play.core.splitinstall.SplitInstallRequest
-dontwarn com.google.android.play.core.splitinstall.SplitInstallSessionState
-dontwarn com.google.android.play.core.splitinstall.SplitInstallStateUpdatedListener
-dontwarn com.google.android.play.core.tasks.OnFailureListener
-dontwarn com.google.android.play.core.tasks.OnSuccessListener
-dontwarn com.google.android.play.core.tasks.Task

# just_audio / audio_service (service de premier plan + réflexion média)
-keep class com.ryanheise.** { *; }
-dontwarn com.ryanheise.**

# ExoPlayer (video_player + just_audio) — accès par réflexion aux extracteurs
-keep class com.google.android.exoplayer2.** { *; }
-keep class androidx.media3.** { *; }
-dontwarn com.google.android.exoplayer2.**
-dontwarn androidx.media3.**

# flutter_secure_storage
-keep class io.flutter.plugins.securestorage.** { *; }

# OkHttp / Okio (dio -> httpclient natif éventuel, sentry)
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn org.conscrypt.**

# Sentry (fournit ses propres règles ; garde par sécurité)
-keep class io.sentry.** { *; }
-dontwarn io.sentry.**

# Modèles / annotations éventuelles
-keepattributes *Annotation*, Signature, InnerClasses, EnclosingMethod
-keepattributes SourceFile,LineNumberTable

# Enums (sérialisation)
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}
