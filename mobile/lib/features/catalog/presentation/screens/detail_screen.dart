import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/models/content_model.dart';
import '../../data/repositories/catalog_repository.dart';
import '../../../downloads/presentation/bloc/download_bloc.dart';
import '../../../downloads/presentation/bloc/download_event.dart';
import '../../../downloads/presentation/bloc/download_state.dart';

class DetailScreen extends StatefulWidget {
  final String contentId;
  final String title;
  final String synopsis;

  const DetailScreen({
    super.key,
    required this.contentId,
    required this.title,
    required this.synopsis,
  });

  @override
  State<DetailScreen> createState() => _DetailScreenState();
}

class _DetailScreenState extends State<DetailScreen> {
  ContentModel? _content;
  bool _isLoading = true;
  bool _hasError = false;
  bool _isFetchingStream = false;

  @override
  void initState() {
    super.initState();
    _loadDetail();
  }

  Future<void> _loadDetail() async {
    try {
      final content = await context
          .read<CatalogRepository>()
          .getContentDetail(widget.contentId);
      if (!mounted) return;
      setState(() {
        _content = content;
        _isLoading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _hasError = true;
        _isLoading = false;
      });
    }
  }

  Future<void> _playEpisode(EpisodeModel? episode) async {
    if (_isFetchingStream) return;

    // Contenu YouTube (gratuit/promo) : lecture directe via l'embed, sans jeton.
    final ytId = _content?.youtubeId;
    if (ytId != null && ytId.isNotEmpty) {
      context.push('/player', extra: {
        'contentId': widget.contentId,
        'title': _content?.title ?? widget.title,
        'youtubeId': ytId,
      });
      return;
    }

    setState(() => _isFetchingStream = true);
    try {
      final signedUrl = await context.read<CatalogRepository>().getStreamToken(
            contentId: widget.contentId,
            episodeId: episode?.id,
          );
      if (!mounted) return;
      final displayTitle = _content?.title ?? widget.title;
      context.push('/player', extra: {
        'contentId': widget.contentId,
        'episodeId': episode?.id,
        'title': episode != null
            ? '$displayTitle — S${episode.season}:E${episode.episodeNumber}'
            : displayTitle,
        'videoUrl': signedUrl,
      });
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
              'Impossible de charger le flux vidéo. Vérifiez votre connexion.'),
        ),
      );
    } finally {
      if (mounted) setState(() => _isFetchingStream = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final displayTitle = _content?.title ?? widget.title;
    final displaySynopsis = _content?.synopsis ?? widget.synopsis;
    final episodes = _content?.episodes ?? const <EpisodeModel>[];
    final firstEpisode = episodes.isNotEmpty ? episodes.first : null;
    final playLabel = firstEpisode != null
        ? 'Lecture S${firstEpisode.season}:E${firstEpisode.episodeNumber}'
        : 'Lecture';

    return Scaffold(
      backgroundColor: AppTheme.darkBackground,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Banner/Poster Image
            Container(
              height: 250,
              width: double.infinity,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppTheme.darkSurface, AppTheme.primaryGold],
                  begin: Alignment.bottomCenter,
                  end: Alignment.topCenter,
                ),
                image: _content?.posterUrl != null
                    ? DecorationImage(
                        image: NetworkImage(_content!.posterUrl!),
                        fit: BoxFit.cover,
                        colorFilter: ColorFilter.mode(
                            Colors.black.withValues(alpha: 0.35),
                            BlendMode.darken),
                      )
                    : null,
              ),
              child: Stack(
                children: [
                  Positioned(
                    bottom: 20,
                    left: 20,
                    right: 20,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          displayTitle,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 26,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                border: Border.all(color: Colors.white30),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                _content?.ageRating ?? '—',
                                style: const TextStyle(
                                    color: Colors.white70, fontSize: 10),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Text(
                              '${episodes.length} Épisode${episodes.length > 1 ? 's' : ''}',
                              style: const TextStyle(
                                  color: Colors.grey, fontSize: 12),
                            ),
                            if (_content?.releaseYear != null) ...[
                              const SizedBox(width: 12),
                              Text(
                                _content!.releaseYear.toString(),
                                style: const TextStyle(
                                    color: Colors.grey, fontSize: 12),
                              ),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Action Buttons
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: _isLoading || _isFetchingStream
                          ? null
                          : () => _playEpisode(firstEpisode),
                      icon: _isFetchingStream
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.black),
                            )
                          : const Icon(Icons.play_arrow, color: Colors.black),
                      label: Text(playLabel,
                          style: const TextStyle(
                              color: Colors.black,
                              fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryGold,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  IconButton(
                    icon: const Icon(Icons.add, color: Colors.white),
                    onPressed: () {},
                  ),
                  IconButton(
                    icon: const Icon(Icons.share, color: Colors.white),
                    onPressed: () {},
                  ),
                ],
              ),
            ),

            // Synopsis
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    "Synopsis",
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    displaySynopsis,
                    style: const TextStyle(
                        color: Colors.white70, fontSize: 13, height: 1.4),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Episode List Header
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0),
              child: Text(
                "Épisodes",
                style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 12),

            if (_isLoading)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 24.0),
                child: Center(
                  child: CircularProgressIndicator(color: AppTheme.primaryGold),
                ),
              )
            else if (_hasError)
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
                child: Text(
                  "Impossible de charger les épisodes pour l'instant.",
                  style: TextStyle(color: Colors.white38, fontSize: 13),
                ),
              )
            else if (episodes.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
                child: Text(
                  "Aucun épisode disponible.",
                  style: TextStyle(color: Colors.white38, fontSize: 13),
                ),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: episodes.length,
                itemBuilder: (context, index) {
                  final ep = episodes[index];
                  return ListTile(
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16.0, vertical: 4.0),
                    leading: Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: AppTheme.darkSurface,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Center(
                        child: Text(
                          '${ep.episodeNumber}',
                          style: const TextStyle(
                              color: AppTheme.primaryGold,
                              fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                    title: Text(
                      ep.title ?? 'Épisode ${ep.episodeNumber}',
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.bold),
                    ),
                    subtitle: Text(
                      ep.durationMin != null ? '${ep.durationMin} min' : '',
                      style: const TextStyle(color: Colors.grey, fontSize: 11),
                    ),
                    trailing: DownloadButton(
                      contentId: widget.contentId,
                      episodeId: ep.id,
                      episodeNumber: '${ep.episodeNumber}',
                    ),
                    onTap: _isFetchingStream ? null : () => _playEpisode(ep),
                  );
                },
              ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}

class DownloadButton extends StatefulWidget {
  final String contentId;
  final String episodeId;
  final String episodeNumber;

  const DownloadButton({
    super.key,
    required this.contentId,
    required this.episodeId,
    required this.episodeNumber,
  });

  @override
  State<DownloadButton> createState() => _DownloadButtonState();
}

class _DownloadButtonState extends State<DownloadButton> {
  bool _isPreparing = false;

  @override
  void initState() {
    super.initState();
    // Refresh the download state to know if it's already downloaded
    context.read<DownloadBloc>().add(const LoadDownloads());
  }

  Future<void> _startDownload() async {
    setState(() => _isPreparing = true);
    try {
      // Récupère une URL de streaming signée fraîche plutôt que de télécharger
      // une URL codée en dur — cohérent avec la même logique que la lecture.
      final signedUrl = await context.read<CatalogRepository>().getStreamToken(
            contentId: widget.contentId,
            episodeId: widget.episodeId,
          );
      if (!mounted) return;

      final content = ContentModel(
        id: widget.contentId,
        title: '${widget.contentId} - Ep ${widget.episodeNumber}',
        type: 'video',
        posterUrl: null, // Should pass from parent in a real app
      );

      context.read<DownloadBloc>().add(StartDownload(
            content: content,
            url: signedUrl,
          ));
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Impossible de préparer le téléchargement.'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) setState(() => _isPreparing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<DownloadBloc, DownloadState>(
      listener: (context, state) {
        if (state is DownloadError) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.message), backgroundColor: Colors.red),
          );
        }
      },
      builder: (context, state) {
        bool isDownloaded = false;
        bool isDownloading = false;
        double progress = 0.0;

        if (state is DownloadsLoaded) {
          isDownloaded = state.downloads.any((c) => c.id == widget.contentId);
        } else if (state is DownloadInProgress &&
            state.contentId == widget.contentId) {
          isDownloading = true;
          progress = state.progress;
        }

        if (isDownloaded) {
          return const Icon(Icons.download_done, color: AppTheme.primaryGold);
        }

        if (isDownloading || _isPreparing) {
          return SizedBox(
            width: 32,
            height: 32,
            child: Stack(
              alignment: Alignment.center,
              children: [
                CircularProgressIndicator(
                  value: isDownloading ? progress : null,
                  color: AppTheme.primaryGold,
                  backgroundColor: Colors.white24,
                  strokeWidth: 3,
                ),
                if (isDownloading)
                  Text(
                    '${(progress * 100).toInt()}',
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 9,
                        fontWeight: FontWeight.bold),
                  ),
              ],
            ),
          );
        }

        return IconButton(
          icon: const Icon(Icons.download_for_offline_outlined,
              color: Colors.white70),
          onPressed: _startDownload,
        );
      },
    );
  }
}
