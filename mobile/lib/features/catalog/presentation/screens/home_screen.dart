import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../../data/models/content_model.dart';
import '../bloc/catalog_bloc.dart';
import '../bloc/catalog_event.dart';
import '../bloc/catalog_state.dart';
import 'djaasoo_screen.dart';
import 'djelison_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  final List<Widget> _screens = const [
    DjaasooScreen(),
    DjelisonScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthUnauthenticated) {
          context.go('/login');
        }
      },
      child: Scaffold(
        backgroundColor: AppTheme.darkBackground,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          title: Text(
            _selectedIndex == 0 ? 'DjaaSoo' : 'DjeliSon',
            style: const TextStyle(
              color: AppTheme.primaryGold,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.1,
            ),
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.search, color: Colors.white),
              onPressed: () => _showSearch(context),
            ),
            IconButton(
              icon: const Icon(Icons.account_circle_outlined, color: Colors.white),
              onPressed: () => context.push('/plans'),
            ),
          ],
        ),
        body: IndexedStack(index: _selectedIndex, children: _screens),
        bottomNavigationBar: BottomNavigationBar(
          currentIndex: _selectedIndex,
          onTap: (i) => setState(() => _selectedIndex = i),
          type: BottomNavigationBarType.fixed,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.movie_outlined),
              activeIcon: Icon(Icons.movie),
              label: 'DjaaSoo',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.music_note_outlined),
              activeIcon: Icon(Icons.music_note),
              label: 'DjeliSon',
            ),
          ],
        ),
      ),
    );
  }

  void _showSearch(BuildContext context) {
    showSearch(
      context: context,
      delegate: _CatalogSearchDelegate(context.read<CatalogBloc>()),
    );
  }
}

// ─── Search delegate ──────────────────────────────────────────────────────────

class _CatalogSearchDelegate extends SearchDelegate<String> {
  final CatalogBloc _bloc;

  _CatalogSearchDelegate(this._bloc)
      : super(searchFieldLabel: 'Films, séries, musique…');

  @override
  ThemeData appBarTheme(BuildContext context) {
    return Theme.of(context).copyWith(
      appBarTheme: const AppBarTheme(
        backgroundColor: AppTheme.darkSurface,
        iconTheme: IconThemeData(color: Colors.white),
      ),
      inputDecorationTheme: const InputDecorationTheme(
        hintStyle: TextStyle(color: Colors.white38),
        border: InputBorder.none,
      ),
      textTheme: const TextTheme(
        titleLarge: TextStyle(color: Colors.white, fontSize: 16),
      ),
    );
  }

  @override
  List<Widget> buildActions(BuildContext context) => [
        if (query.isNotEmpty)
          IconButton(
            icon: const Icon(Icons.clear, color: Colors.white70),
            onPressed: () => query = '',
          ),
      ];

  @override
  Widget buildLeading(BuildContext context) => IconButton(
        icon: const Icon(Icons.arrow_back, color: Colors.white),
        onPressed: () {
          _bloc.add(const CatalogClearSearch());
          close(context, '');
        },
      );

  @override
  Widget buildResults(BuildContext context) {
    if (query.trim().length >= 2) {
      _bloc.add(CatalogSearch(query.trim()));
    }
    return _buildSearchResults(context);
  }

  @override
  Widget buildSuggestions(BuildContext context) {
    if (query.trim().length >= 2) {
      _bloc.add(CatalogSearch(query.trim()));
      return _buildSearchResults(context);
    }
    return _buildSearchHints();
  }

  Widget _buildSearchResults(BuildContext context) {
    return BlocBuilder<CatalogBloc, CatalogState>(
      bloc: _bloc,
      builder: (context, state) {
        if (state is CatalogLoading) {
          return const Center(
              child: CircularProgressIndicator(color: AppTheme.primaryGold));
        }
        if (state is CatalogSearchResults) {
          if (state.results.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.search_off, color: Colors.white38, size: 48),
                  const SizedBox(height: 12),
                  Text(
                    'Aucun résultat pour "${state.query}"',
                    style: const TextStyle(color: Colors.white70),
                  ),
                ],
              ),
            );
          }
          return ListView.builder(
            itemCount: state.results.length,
            itemBuilder: (ctx, i) =>
                _SearchResultTile(content: state.results[i]),
          );
        }
        return const SizedBox.shrink();
      },
    );
  }

  Widget _buildSearchHints() {
    return Container(
      color: AppTheme.darkBackground,
      child: const Center(
        child: Text(
          'Tapez au moins 2 caractères pour rechercher',
          style: TextStyle(color: Colors.white38),
        ),
      ),
    );
  }
}

class _SearchResultTile extends StatelessWidget {
  final ContentModel content;
  const _SearchResultTile({required this.content});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      tileColor: AppTheme.darkBackground,
      leading: Container(
        width: 48,
        height: 48,
        decoration: BoxDecoration(
          color: AppTheme.darkCard,
          borderRadius: BorderRadius.circular(6),
        ),
        child: const Icon(Icons.play_circle_outline,
            color: AppTheme.primaryGold, size: 28),
      ),
      title: Text(content.title,
          style: const TextStyle(
              color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
      subtitle: Text(
        '${content.type}${content.releaseYear != null ? ' · ${content.releaseYear}' : ''}',
        style: const TextStyle(color: Colors.grey, fontSize: 11),
      ),
      trailing: const Icon(Icons.chevron_right, color: Colors.white38),
      onTap: () {
        context.push('/detail', extra: {
          'id': content.id,
          'title': content.title,
          'synopsis': content.synopsis ?? '',
        });
      },
    );
  }
}
