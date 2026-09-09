import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Configuration centrale de l'application, résolue au démarrage.
///
/// Ordre de priorité pour `apiBaseUrl` :
///  1. `--dart-define=API_BASE_URL=...` (build CI / release — recommandé)
///  2. `.env` -> `API_BASE_URL` (développement local uniquement)
///  3. `http://10.0.2.2:3000/api/v1` -> **DEBUG SEULEMENT** (émulateur Android)
///
/// En **release**, si aucune URL n'est fournie par (1) ou (2), l'app lève une
/// [StateError] au démarrage (fail-fast) plutôt que d'appeler un backend fantôme.
class AppConfig {
  AppConfig._({
    required this.apiBaseUrl,
    required this.environment,
    required this.launchModeV1,
    required this.sentryDsn,
  });

  final String apiBaseUrl;
  final String environment; // 'production' | 'staging' | 'development'
  final bool launchModeV1;
  final String sentryDsn;

  static AppConfig? _instance;
  static AppConfig get instance {
    final i = _instance;
    if (i == null) {
      throw StateError('AppConfig.init() doit être appelé avant AppConfig.instance');
    }
    return i;
  }

  /// À appeler une fois dans `main()`, après `dotenv.load`.
  static AppConfig init() {
    const defineUrl = String.fromEnvironment('API_BASE_URL');
    final envUrl = _tryDotenv('API_BASE_URL');

    const defineEnvName = String.fromEnvironment('APP_ENV');
    final environment = defineEnvName.isNotEmpty
        ? defineEnvName
        : (_tryDotenv('APP_ENV') ?? (kReleaseMode ? 'production' : 'development'));

    String? resolvedUrl;
    if (defineUrl.isNotEmpty) {
      resolvedUrl = defineUrl;
    } else if (envUrl != null && envUrl.isNotEmpty) {
      resolvedUrl = envUrl;
    } else if (!kReleaseMode) {
      // Filet de sécurité DEV uniquement (émulateur Android -> localhost hôte).
      resolvedUrl = 'http://10.0.2.2:3000/api/v1';
    }

    if (resolvedUrl == null || resolvedUrl.isEmpty) {
      throw StateError(
        'API_BASE_URL non configurée pour un build release. '
        'Fournir --dart-define=API_BASE_URL=https://<backend>/api/v1 '
        'au moment du build.',
      );
    }

    // En release, on refuse une URL non HTTPS.
    if (kReleaseMode && !resolvedUrl.startsWith('https://')) {
      throw StateError(
        'API_BASE_URL doit être en HTTPS en release (reçu: $resolvedUrl).',
      );
    }

    const defineLaunch = String.fromEnvironment('LAUNCH_MODE_V1');
    final launchV1 = defineLaunch.isNotEmpty
        ? defineLaunch.toLowerCase() != 'false'
        : (_tryDotenv('LAUNCH_MODE_V1')?.toLowerCase() != 'false');

    const defineDsn = String.fromEnvironment('SENTRY_DSN');
    final sentryDsn = defineDsn.isNotEmpty ? defineDsn : (_tryDotenv('SENTRY_DSN') ?? '');

    return _instance = AppConfig._(
      apiBaseUrl: resolvedUrl,
      environment: environment,
      launchModeV1: launchV1,
      sentryDsn: sentryDsn,
    );
  }

  static String? _tryDotenv(String key) {
    try {
      return dotenv.isInitialized ? dotenv.env[key] : null;
    } catch (_) {
      return null;
    }
  }
}
