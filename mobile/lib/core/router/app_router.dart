import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/catalog/presentation/screens/home_screen.dart';
import '../../features/catalog/presentation/screens/detail_screen.dart';
import '../../features/catalog/presentation/screens/player_screen.dart';
import '../../features/subscription/presentation/screens/plans_screen.dart';
import '../../features/downloads/presentation/screens/downloads_screen.dart';
import '../../features/auth/presentation/screens/account_screen.dart';
import '../../features/profile/presentation/screens/profile_selection_screen.dart';

class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/profiles',
        builder: (context, state) => const ProfileSelectionScreen(),
      ),
      GoRoute(
        path: '/detail',
        builder: (context, state) {
          final extra = state.extra as Map<String, String>? ?? {};
          return DetailScreen(
            contentId: extra['id'] ?? '',
            title: extra['title'] ?? 'Contenu',
            synopsis: extra['synopsis'] ?? 'Aucun synopsis disponible.',
          );
        },
      ),
      GoRoute(
        path: '/player',
        builder: (context, state) {
          final extra = state.extra;
          if (extra is Map<String, dynamic>) {
            return PlayerScreen(
              contentId: extra['contentId'] as String?,
              episodeId: extra['episodeId'] as String?,
              title: (extra['title'] as String?) ?? 'Lecteur',
              videoUrl: extra['videoUrl'] as String?,
              isAudio: (extra['isAudio'] as bool?) ?? false,
              thumbnailUrl: extra['thumbnailUrl'] as String?,
              startPositionSec: extra['startPositionSec'] as int?,
            );
          }
          return PlayerScreen(title: (extra as String?) ?? 'Lecteur');
        },
      ),
      GoRoute(
        path: '/plans',
        builder: (context, state) => const PlansScreen(),
      ),
      GoRoute(
        path: '/downloads',
        builder: (context, state) => const DownloadsScreen(),
      ),
      GoRoute(
        path: '/account',
        builder: (context, state) => const AccountScreen(),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Page non trouvée : ${state.error}'),
      ),
    ),
  );
}
