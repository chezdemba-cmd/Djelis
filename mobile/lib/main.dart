import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'core/network/api_client.dart';
import 'core/storage/secure_storage_service.dart';
import 'features/auth/data/repositories/auth_repository.dart';
import 'features/auth/presentation/bloc/auth_bloc.dart';
import 'features/auth/presentation/bloc/auth_event.dart';
import 'features/catalog/data/repositories/catalog_repository.dart';
import 'features/catalog/presentation/bloc/catalog_bloc.dart';
import 'features/catalog/presentation/bloc/catalog_event.dart';
import 'features/subscription/data/repositories/subscription_repository.dart';
import 'features/subscription/presentation/bloc/subscription_bloc.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
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
    final subscriptionRepo = SubscriptionRepository(api: api);

    return MultiBlocProvider(
      providers: [
        BlocProvider(
          create: (_) => AuthBloc(repository: authRepo)
            ..add(const AuthCheckSession()),
        ),
        BlocProvider(
          create: (_) => CatalogBloc(repository: catalogRepo)
            ..add(const CatalogLoadFeatured()),
        ),
        BlocProvider(
          create: (_) => SubscriptionBloc(repository: subscriptionRepo),
        ),
      ],
      child: MaterialApp.router(
        title: "Djeli'S",
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.dark,
        routerConfig: AppRouter.router,
      ),
    );
  }
}
