import 'package:just_audio/just_audio.dart';
import 'package:just_audio_background/just_audio_background.dart';

/// Un morceau à lire (métadonnées + URL déjà signée).
class AudioTrack {
  final String contentId;
  final String? episodeId;
  final String title;
  final String artist;
  final String? artUrl;
  final String url;

  const AudioTrack({
    required this.contentId,
    this.episodeId,
    required this.title,
    required this.artist,
    this.artUrl,
    required this.url,
  });
}

/// Service de lecture AUDIO (DjeliSon) — moteur `just_audio` + service de
/// premier plan `just_audio_background` (notification média, contrôles écran
/// verrouillé, MediaSession, Bluetooth/écouteurs, lecture écran éteint).
///
/// Singleton : un seul lecteur audio pour toute l'app, indépendant de l'UI,
/// donc la lecture continue quand on quitte l'écran ou l'application.
class AudioPlayerService {
  AudioPlayerService._();
  static final AudioPlayerService instance = AudioPlayerService._();

  final AudioPlayer _player = AudioPlayer();

  AudioPlayer get player => _player;

  List<AudioTrack> _tracks = const [];
  AudioTrack? get currentTrack {
    final i = _player.currentIndex;
    if (i == null || i < 0 || i >= _tracks.length) return null;
    return _tracks[i];
  }

  Stream<PlayerState> get playerStateStream => _player.playerStateStream;
  Stream<Duration> get positionStream => _player.positionStream;
  Stream<Duration> get bufferedPositionStream => _player.bufferedPositionStream;
  Stream<Duration?> get durationStream => _player.durationStream;
  Stream<int?> get currentIndexStream => _player.currentIndexStream;

  bool get isPlaying => _player.playing;
  bool get hasQueue => _tracks.isNotEmpty;

  /// Charge une file d'attente et démarre la lecture à [initialIndex].
  Future<void> setQueue(
    List<AudioTrack> tracks, {
    int initialIndex = 0,
    Duration? initialPosition,
  }) async {
    _tracks = tracks;
    final sources = tracks
        .map(
          (t) => AudioSource.uri(
            Uri.parse(t.url),
            tag: MediaItem(
              id: t.episodeId ?? t.contentId,
              title: t.title,
              artist: t.artist,
              artUri: t.artUrl != null ? Uri.tryParse(t.artUrl!) : null,
            ),
          ),
        )
        .toList();

    await _player.setAudioSource(
      ConcatenatingAudioSource(children: sources),
      initialIndex: initialIndex.clamp(0, sources.length - 1),
      initialPosition: initialPosition ?? Duration.zero,
    );
    await _player.play();
  }

  Future<void> play() => _player.play();
  Future<void> pause() => _player.pause();
  Future<void> seek(Duration position) => _player.seek(position);
  Future<void> next() => _player.seekToNext();
  Future<void> previous() => _player.seekToPrevious();

  Future<void> stop() async {
    await _player.stop();
    _tracks = const [];
  }

  Future<void> dispose() => _player.dispose();
}
