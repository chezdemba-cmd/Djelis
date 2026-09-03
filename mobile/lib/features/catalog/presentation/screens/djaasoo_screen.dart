import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/models/content_model.dart';
import '../bloc/catalog_bloc.dart';
import '../bloc/catalog_event.dart';
import '../bloc/catalog_state.dart';

class DjaasooScreen extends StatelessWidget {
  const DjaasooScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<CatalogBloc, CatalogState>(
      builder: (context, state) {
        if (state is CatalogLoading || state is CatalogInitial) {
          return _buildSkeleton();
        }
        if (state is CatalogError) {
          return _buildError(context, state.message);
        }

        if (state is! CatalogFeaturedLoaded) {
          return const SizedBox.shrink();
        }
        final featured = state.data;

        return RefreshIndicator(
          color: AppTheme.primaryGold,
          backgroundColor: AppTheme.darkSurface,
          onRefresh: () async {
            context.read<CatalogBloc>().add(const CatalogLoadFeatured());
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(
                parent: BouncingScrollPhysics()),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (featured.hero != null)
                  _buildFeaturedHero(context, featured.hero!),
                const SizedBox(height: 24),
                ...featured.rows.map(
                  (row) => Padding(
                    padding: const EdgeInsets.only(bottom: 24),
                    child: _buildContentRow(context, row),
                  ),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        );
      },
    );
  }

  // ── Hero banner ─────────────────────────────────────────────────────────────

  Widget _buildFeaturedHero(BuildContext context, ContentModel hero) {
    return GestureDetector(
      onTap: () => context.push('/detail', extra: {
        'id': hero.id,
        'title': hero.title,
        'synopsis': hero.synopsis ?? '',
      }),
      child: Container(
        height: 240,
        margin: const EdgeInsets.symmetric(horizontal: 16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: const LinearGradient(
            colors: [AppTheme.secondaryOrange, AppTheme.primaryGold],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          boxShadow: [
            BoxShadow(
              color: AppTheme.primaryGold.withValues(alpha: 0.2),
              blurRadius: 16,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Stack(
          children: [
            // Play button overlay
            Positioned(
              top: 16,
              right: 16,
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.4),
                  shape: BoxShape.circle,
                ),
                child:
                    const Icon(Icons.play_arrow, color: Colors.white, size: 28),
              ),
            ),
            // Content info
            Positioned(
              bottom: 20,
              left: 20,
              right: 60,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (hero.tag != null)
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.55),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        hero.tag!,
                        style: const TextStyle(
                          color: AppTheme.primaryGold,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  const SizedBox(height: 6),
                  Text(
                    hero.title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (hero.synopsis != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      hero.synopsis!,
                      style:
                          const TextStyle(color: Colors.white70, fontSize: 12),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Content row ──────────────────────────────────────────────────────────────

  Widget _buildContentRow(BuildContext context, ContentRow row) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                row.title,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              TextButton(
                onPressed: () {},
                child: const Text('Voir tout',
                    style: TextStyle(color: AppTheme.primaryGold)),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        SizedBox(
          height: 180,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: row.contents.length,
            itemBuilder: (context, index) {
              final item = row.contents[index];
              return GestureDetector(
                onTap: () => context.push('/detail', extra: {
                  'id': item.id,
                  'title': item.title,
                  'synopsis': item.synopsis ??
                      "Plongez dans les récits riches de l'Afrique de l'Ouest.",
                }),
                child: _ContentCard(
                    content: item, index: index, total: row.contents.length),
              );
            },
          ),
        ),
      ],
    );
  }

  // ── Loading skeleton ─────────────────────────────────────────────────────────

  Widget _buildSkeleton() {
    return SingleChildScrollView(
      physics: const NeverScrollableScrollPhysics(),
      child: Column(
        children: [
          _SkeletonBox(
              height: 240, margin: const EdgeInsets.symmetric(horizontal: 16)),
          const SizedBox(height: 24),
          for (var i = 0; i < 3; i++) ...[
            _SkeletonBox(
                height: 20,
                width: 160,
                margin: const EdgeInsets.symmetric(horizontal: 16)),
            const SizedBox(height: 12),
            SizedBox(
              height: 160,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  for (var j = 0; j < 4; j++)
                    _SkeletonBox(
                      height: 140,
                      width: 110,
                      margin: EdgeInsets.only(left: j == 0 ? 16 : 8),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
        ],
      ),
    );
  }

  Widget _buildError(BuildContext context, String message) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.cloud_off_outlined, color: Colors.white38, size: 56),
          const SizedBox(height: 16),
          const Text('Catalogue indisponible',
              style: TextStyle(color: Colors.white70, fontSize: 15)),
          const SizedBox(height: 6),
          Text(message,
              style: const TextStyle(color: Colors.white38, fontSize: 12)),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () =>
                context.read<CatalogBloc>().add(const CatalogLoadFeatured()),
            icon: const Icon(Icons.refresh, color: Colors.black),
            label: const Text('Réessayer',
                style: TextStyle(
                    color: Colors.black, fontWeight: FontWeight.bold)),
            style:
                ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryGold),
          ),
        ],
      ),
    );
  }
}

// ── Content card ──────────────────────────────────────────────────────────────

class _ContentCard extends StatelessWidget {
  final ContentModel content;
  final int index;
  final int total;

  const _ContentCard({
    required this.content,
    required this.index,
    required this.total,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 120,
      margin: EdgeInsets.only(
        left: index == 0 ? 16 : 8,
        right: index == total - 1 ? 16 : 0,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Thumbnail
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: AppTheme.darkSurface,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.white10),
              ),
              child: content.posterUrl != null
                  ? ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.network(
                        content.posterUrl!,
                        fit: BoxFit.cover,
                        width: double.infinity,
                        errorBuilder: (_, __, ___) => _placeholder(),
                      ),
                    )
                  : _placeholder(),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            content.title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
                color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
          ),
          if (content.tag != null)
            Text(
              content.tag!,
              style: const TextStyle(color: Colors.grey, fontSize: 10),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
        ],
      ),
    );
  }

  Widget _placeholder() => Center(
        child: Icon(
          Icons.play_circle_fill_outlined,
          color: AppTheme.primaryGold.withValues(alpha: 0.5),
          size: 40,
        ),
      );
}

// ── Skeleton shimmer box ──────────────────────────────────────────────────────

class _SkeletonBox extends StatelessWidget {
  final double height;
  final double? width;
  final EdgeInsetsGeometry? margin;

  const _SkeletonBox({required this.height, this.width, this.margin});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      width: width,
      margin: margin,
      decoration: BoxDecoration(
        color: AppTheme.darkSurface,
        borderRadius: BorderRadius.circular(8),
      ),
    );
  }
}
