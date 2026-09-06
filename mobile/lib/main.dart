import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'core/network/api_client.dart';
import 'core/storage/secure_storage_service.dart';
import 'features/auth/data/repositories/auth_repository.dart';
import 'features/auth/presentation/bloc/auth_bloc.dart';
import 'features/auth/presentation/bloc/auth_event.dart';
import 'features/auth/presentation/bloc/auth_state.dart';
import 'features/catalog/data/repositories/catalog_repository.dart';
import 'features/catalog/presentation/bloc/catalog_bloc.dart';
import 'features/catalog/presentation/bloc/catalog_event.dart';
import 'features/profile/data/repositories/profile_repository.dart';
import 'features/profile/presentation/bloc/profile_bloc.dart';
import 'features/profile/presentation/bloc/profile_event.dart';
import 'features/subscription/data/repositories/subscription_repository.dart';
import 'features/subscription/presentation/bloc/subscription_bloc.dart';
import 'features/downloads/data/download_service.dart';
import 'features/catalog/data/repositories/download_repository.dart';
import 'features/downloads/presentation/bloc/download_bloc.dart';

import 'package:flutter_dotenv/flutter_dotenv.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await dotenv.load(fileName: ".env");
  } catch (e) {
    debugPrint("Note: Fichier .env non chargé, utilisation de l'URL par défaut: $e");
  }
  runApp(const DjelisApp());
}

class DjelisApp extends StatelessWidget {
  const DjelisApp({super.key});

  @override
  Widget build(BuildContext context) {
    // ── Dependency injection (manual, no service locator needed for MVP) ────────
    final storage = SecureStorageService();
    final api = ApiClient(storage);

    final authRepo = AuthRepository(api: api, storage: storage);
    final catalogRepo = CatalogRepository(api: api);
    final profileRepo = ProfileRepository(api: api, storage: storage);
    final subscriptionRepo = SubscriptionRepository(api: api);
    final downloadService = DownloadService();
    final downloadRepo = DownloadRepository(downloadService: downloadService);

    return RepositoryProvider<CatalogRepository>.value(
      value: catalogRepo,
      child: MultiBlocProvider(
        providers: [
          BlocProvider(
            create: (_) =>
                AuthBloc(repository: authRepo)..add(const AuthCheckSession()),
          ),
          BlocProvider(
            create: (_) => CatalogBloc(repository: catalogRepo)
              ..add(const CatalogLoadFeatured()),
          ),
          BlocProvider(
            create: (_) =>
                ProfileBloc(repository: profileRepo)..add(const ProfileLoad()),
          ),
          BlocProvider(
            create: (_) => SubscriptionBloc(repository: subscriptionRepo),
          ),
          BlocProvider(
            create: (_) => DownloadBloc(repository: downloadRepo),
          ),
        ],
        child: BlocListener<AuthBloc, AuthState>(
          listenWhen: (prev, curr) =>
              prev.runtimeType != curr.runtimeType,
          listener: (context, state) {
            final profileBloc = context.read<ProfileBloc>();
            if (state is AuthAuthenticated) {
              profileBloc.add(const ProfileLoad());
            } else if (state is AuthUnauthenticated) {
              profileBloc.add(const ProfileCleared());
            }
          },
          child: MaterialApp.router(
            title: "Djeli'S",
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: ThemeMode.dark,
            routerConfig: AppRouter.router,
          ),
        ),
      ),
    );
  }
}
