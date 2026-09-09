import 'dart:async';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:just_audio/just_audio.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../profile/presentation/bloc/profile_bloc.dart';
import '../../../profile/presentation/bloc/profile_state.dart';
import '../../data/repositories/catalog_repository.dart';
import '../../../player/audio/audio_player_service.dart';

/// Écran de lecture AUDIO (DjeliSon). Il pilote [AudioPlayerService] (singleton) :
/// quitter cet écran n'interrompt PAS la lecture (continue en arrière-plan,
/// contrôlable depuis la notification et l'écran verrouillé).
class AudioPlayerScreen extends StatefulWidget {
  const AudioPlayerScreen({super.key});

  @override
  State<AudioPlayerScreen> createState() => _AudioPlayerScreenState();
}

class _AudioPlayerScreenState extends State<AudioPlayerScreen> {
  final _svc = AudioPlayerService.instance;
  Timer? _progressTimer;

  @override
  void initState() {
    super.initState();
    _progressTimer = Timer.periodic(const Duration(seconds: 10), (_) {
      final track = _svc.currentTrack;
      if (track == null || !_svc.isPlaying) return;
      final profileState = context.read<ProfileBloc>().state;
      final profileId =
          profileState is ProfileReady ? profileState.selected?.id : null;
      context.read<CatalogRepository>().reportProgress(
            contentId: track.contentId,
            episodeId: track.episodeId,
            progressSec: _svc.player.position.inSeconds,
            quality: '128k',
            deviceType: 'mobile',
            profileId: profileId,
          );
    });
  }

  @override
  void dispose() {
    _progressTimer?.cancel();
    super.dispose();
  }

  String _fmt(Duration d) {
    final m = d.inMinutes.remainder(60).toString().padLeft(2, '0');
    final s = d.inSeconds.remainder(60).toString().padLeft(2, '0');
    return d.inHours > 0 ? '${d.inHours}:$m:$s' : '$m:$s';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBackground,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.keyboard_arrow_down, color: Colors.white),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
        title: const Text('Lecture en cours',
            style: TextStyle(color: Colors.white70, fontSize: 14)),
      ),
      body: StreamBuilder<int?>(
        stream: _svc.currentIndexStream,
        builder: (context, _) {
          final track = _svc.currentTrack;
          if (track == null) {
            return const Center(
              child: Text('Aucune lecture en cours',
                  style: TextStyle(color: Colors.white54)),
            );
          }
          return Column(
            children: [
              const Spacer(),
              _artwork(track.artUrl),
              const SizedBox(height: 32),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 32),
                child: Column(
                  children: [
                    Text(track.title,
                        maxLines: 2,
                        textAlign: TextAlign.center,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    Text(track.artist,
                        style:
                            const TextStyle(color: Colors.white54, fontSize: 14)),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              _seekBar(),
              const SizedBox(height: 8),
              _controls(),
              const Spacer(),
              _errorBanner(),
              const SizedBox(height: 24),
            ],
          );
        },
      ),
    );
  }

  Widget _artwork(String? url) {
    return Container(
      width: 240,
      height: 240,
      decoration: BoxDecoration(
        color: AppTheme.darkCard,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
            color: AppTheme.primaryGold.withValues(alpha: 0.25), width: 2),
      ),
      clipBehavior: Clip.antiAlias,
      child: url != null && url.isNotEmpty
          ? CachedNetworkImage(
              imageUrl: url,
              fit: BoxFit.cover,
              errorWidget: (_, __, ___) => const Icon(Icons.music_note,
                  color: AppTheme.primaryGold, size: 88),
            )
          : const Icon(Icons.music_note,
              color: AppTheme.primaryGold, size: 88),
    );
  }

  Widget _seekBar() {
    return StreamBuilder<Duration>(
      stream: _svc.positionStream,
      builder: (context, posSnap) {
        final pos = posSnap.data ?? Duration.zero;
        return StreamBuilder<Duration?>(
          stream: _svc.durationStream,
          builder: (context, durSnap) {
            final dur = durSnap.data ?? Duration.zero;
            final max = dur.inMilliseconds.toDouble();
            final value =
                max <= 0 ? 0.0 : pos.inMilliseconds.clamp(0, max).toDouble();
            return Column(
              children: [
                SliderTheme(
                  data: SliderTheme.of(context).copyWith(
                    trackHeight: 3,
                    activeTrackColor: AppTheme.primaryGold,
                    inactiveTrackColor: Colors.white12,
                    thumbColor: AppTheme.primaryGold,
                    thumbShape:
                        const RoundSliderThumbShape(enabledThumbRadius: 6),
                  ),
                  child: Slider(
                    min: 0,
                    max: max <= 0 ? 1 : max,
                    value: value,
                    onChanged: max <= 0
                        ? null
                        : (v) => _svc.seek(Duration(milliseconds: v.round())),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 28),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(_fmt(pos),
                          style: const TextStyle(
                              color: Colors.white54, fontSize: 12)),
                      Text(_fmt(dur),
                          style: const TextStyle(
                              color: Colors.white54, fontSize: 12)),
                    ],
                  ),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Widget _controls() {
    return StreamBuilder<PlayerState>(
      stream: _svc.playerStateStream,
      builder: (context, snap) {
        final state = snap.data;
        final processing = state?.processingState;
        final playing = state?.playing ?? false;
        final buffering = processing == ProcessingState.loading ||
            processing == ProcessingState.buffering;

        return Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            IconButton(
              iconSize: 40,
              icon: const Icon(Icons.skip_previous, color: Colors.white),
              onPressed: _svc.previous,
            ),
            const SizedBox(width: 16),
            GestureDetector(
              onTap: () => playing ? _svc.pause() : _svc.play(),
              child: Container(
                width: 72,
                height: 72,
                decoration: const BoxDecoration(
                    color: AppTheme.primaryGold, shape: BoxShape.circle),
                child: buffering
                    ? const Padding(
                        padding: EdgeInsets.all(20),
                        child: CircularProgressIndicator(
                            color: Colors.black, strokeWidth: 3),
                      )
                    : Icon(playing ? Icons.pause : Icons.play_arrow,
                        color: Colors.black, size: 40),
              ),
            ),
            const SizedBox(width: 16),
            IconButton(
              iconSize: 40,
              icon: const Icon(Icons.skip_next, color: Colors.white),
              onPressed: _svc.next,
            ),
          ],
        );
      },
    );
  }

  Widget _errorBanner() {
    return StreamBuilder<PlayerState>(
      stream: _svc.playerStateStream,
      builder: (context, snap) {
        if (snap.hasError) {
          return const Padding(
            padding: EdgeInsets.symmetric(horizontal: 32),
            child: Text('Contenu temporairement indisponible.',
                style: TextStyle(color: Colors.redAccent, fontSize: 13)),
          );
        }
        return const SizedBox.shrink();
      },
    );
  }
}
