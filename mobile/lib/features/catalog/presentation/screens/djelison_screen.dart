import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/models/content_model.dart';
import '../../data/repositories/catalog_repository.dart';

class DjelisonScreen extends StatefulWidget {
  const DjelisonScreen({super.key});

  @override
  State<DjelisonScreen> createState() => _DjelisonScreenState();
}

class _DjelisonScreenState extends State<DjelisonScreen> {
  List<ContentModel> _contents = [];
  bool _isLoading = true;
  bool _isFetchingStream = false;

  @override
  void initState() {
    super.initState();
    _loadContents();
  }

  Future<void> _loadContents() async {
    try {
      final contents =
          await context.read<CatalogRepository>().getContents(type: 'audio');
      if (!mounted) return;
      setState(() {
        _contents = contents;
        _isLoading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _isLoading = false);
    }
  }

  Future<void> _playContent(ContentModel content) async {
    if (_isFetchingStream) return;
    setState(() => _isFetchingStream = true);
    try {
      final episodeId =
          content.episodes.isNotEmpty ? content.episodes.first.id : null;
      final signedUrl = await context.read<CatalogRepository>().getStreamToken(
            contentId: content.id,
            episodeId: episodeId,
          );
      if (!mounted) return;
      context.push('/player', extra: {
        'contentId': content.id,
        'episodeId': episodeId,
        'title': content.title,
        'videoUrl': signedUrl,
        'isAudio': true,
        'thumbnailUrl': content.posterUrl,
      });
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Impossible de charger le flux audio. Vérifiez votre connexion.'),
        ),
      );
    } finally {
      if (mounted) setState(() => _isFetchingStream = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: AppTheme.primaryGold),
      );
    }

    final horizontalItems = _contents.take(6).toList();

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Audio banner
          _buildBanner(context),

          const SizedBox(height: 24),

          if (horizontalItems.isNotEmpty)
            _buildHorizontalAlbums(
              context,
              title: "Podcasts & Récits Audio",
              items: horizontalItems,
            ),

          const SizedBox(height: 24),

          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  "DjeliSon - Catalogue",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),

          if (_contents.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 24.0),
              child: Text(
                "Aucun contenu audio disponible pour l'instant.",
                style: TextStyle(color: Colors.white38, fontSize: 13),
              ),
            )
          else
            ..._contents.map((content) => _buildTrackItem(context, content)),

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildBanner(BuildContext context) {
    return Container(
      height: 180,
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        gradient: const LinearGradient(
          colors: [AppTheme.accentCrimson, AppTheme.secondaryOrange],
          begin: Alignment.bottomLeft,
          end: Alignment.topRight,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            const Text(
              "DjeliSon Audio",
              style: TextStyle(color: Colors.white70, fontSize: 12),
            ),
            const SizedBox(height: 4),
            const Text(
              "Musique, podcasts et récits d'Afrique de l'Ouest",
              style: TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHorizontalAlbums(
    BuildContext context, {
    required String title,
    required List<ContentModel> items,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Text(
            title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 160,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: items.length,
            itemBuilder: (context, index) {
              final item = items[index];
              return GestureDetector(
                onTap: () => _playContent(item),
                child: Container(
                  width: 110,
                  margin: EdgeInsets.only(
                    left: index == 0 ? 16 : 8,
                    right: index == items.length - 1 ? 16 : 0,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Container(
                          decoration: BoxDecoration(
                            color: AppTheme.darkSurface,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.white10),
                            image: item.posterUrl != null
                                ? DecorationImage(
                                    image: NetworkImage(item.posterUrl!),
                                    fit: BoxFit.cover,
                                  )
                                : null,
                          ),
                          child: item.posterUrl == null
                              ? const Center(
                                  child: Icon(
                                    Icons.headphones,
                                    color: Colors.grey,
                                    size: 32,
                                  ),
                                )
                              : null,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        item.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 11,
                        ),
                      ),
                      Text(
                        item.categoryName ?? '',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.grey,
                          fontSize: 9,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildTrackItem(BuildContext context, ContentModel content) {
    final durationMin =
        content.episodes.isNotEmpty ? content.episodes.first.durationMin : null;

    return GestureDetector(
      onTap: _isFetchingStream ? null : () => _playContent(content),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppTheme.darkSurface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.white.withOpacity(0.05)),
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: AppTheme.darkCard,
                borderRadius: BorderRadius.circular(8),
                image: content.posterUrl != null
                    ? DecorationImage(
                        image: NetworkImage(content.posterUrl!),
                        fit: BoxFit.cover,
                      )
                    : null,
              ),
              child: content.posterUrl == null
                  ? const Icon(Icons.music_note, color: AppTheme.primaryGold)
                  : null,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    content.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                  Text(
                    content.categoryName ?? "DjeliSon Audio",
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: Colors.grey,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            if (durationMin != null)
              Text(
                '$durationMin min',
                style: const TextStyle(color: Colors.grey, fontSize: 12),
              ),
            const SizedBox(width: 12),
            _isFetchingStream
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: AppTheme.primaryGold),
                  )
                : const Icon(Icons.play_circle_fill, color: Colors.white),
          ],
        ),
      ),
    );
  }
}
