import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:youtube_player_iframe/youtube_player_iframe.dart';

/// Lecteur pour un contenu gratuit/promo hébergé sur YouTube.
///
/// Lecture intégrée dans l'app (WebView), sans ouvrir l'app YouTube. Le petit
/// logo YouTube et le lien « regarder sur YouTube » restent visibles pendant
/// la lecture : c'est imposé par les Conditions d'utilisation de YouTube.
class YoutubePlayerScreen extends StatefulWidget {
  final String youtubeId;
  final String title;
  final int? startPositionSec;

  const YoutubePlayerScreen({
    super.key,
    required this.youtubeId,
    required this.title,
    this.startPositionSec,
  });

  @override
  State<YoutubePlayerScreen> createState() => _YoutubePlayerScreenState();
}

class _YoutubePlayerScreenState extends State<YoutubePlayerScreen> {
  late final YoutubePlayerController _controller;

  @override
  void initState() {
    super.initState();
    _controller = YoutubePlayerController.fromVideoId(
      videoId: widget.youtubeId,
      autoPlay: true,
      startSeconds: (widget.startPositionSec ?? 0).toDouble(),
      params: const YoutubePlayerParams(
        showControls: true,
        showFullscreenButton: true,
        // Limite les vidéos suggérées à la même chaîne (équivalent rel=0).
        strictRelatedVideos: true,
        enableCaption: true,
      ),
    );
  }

  @override
  void dispose() {
    _controller.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return YoutubePlayerScaffold(
      controller: _controller,
      aspectRatio: 16 / 9,
      builder: (context, player) {
        return Scaffold(
          backgroundColor: Colors.black,
          body: SafeArea(
            child: Stack(
              children: [
                Center(child: player),
                Positioned(
                  top: 4,
                  left: 4,
                  child: IconButton(
                    icon: const Icon(Icons.arrow_back, color: Colors.white),
                    onPressed: () => context.pop(),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
