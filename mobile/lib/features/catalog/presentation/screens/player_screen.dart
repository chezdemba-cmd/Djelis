import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:video_player/video_player.dart';
import '../../../../core/theme/app_theme.dart';

// ─── Quality model ────────────────────────────────────────────────────────────

class _Quality {
  final String label;
  final int? dataMbPerHour;
  const _Quality(this.label, {this.dataMbPerHour});
}

// ─── Screen ───────────────────────────────────────────────────────────────────

class PlayerScreen extends StatefulWidget {
  final String title;
  final String? videoUrl;
  final bool isAudio;
  final String? thumbnailUrl;
  final int? startPositionSec;

  const PlayerScreen({
    super.key,
    required this.title,
    this.videoUrl,
    this.isAudio = false,
    this.thumbnailUrl,
    this.startPositionSec,
  });

  @override
  State<PlayerScreen> createState() => _PlayerScreenState();
}

class _PlayerScreenState extends State<PlayerScreen>
    with SingleTickerProviderStateMixin {
  VideoPlayerController? _controller;
  bool _isInitialized = false;
  bool _hasError = false;
  bool _isDataSaver = false;
  bool _isFullscreen = false;
  String _selectedQuality = 'Auto';

  late AnimationController _fadeAnim;
  Timer? _hideTimer;
  Timer? _progressTimer;

  static const _qualities = [
    _Quality('Auto'),
    _Quality('1080p', dataMbPerHour: 2160),
    _Quality('720p', dataMbPerHour: 900),
    _Quality('480p', dataMbPerHour: 540),
    _Quality('360p', dataMbPerHour: 270),
    _Quality('240p', dataMbPerHour: 120),
  ];

  // Public Mux HLS stream used as demo until real URLs come from the API.
  static const _demoHlsUrl =
      'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

  // ─── Lifecycle ──────────────────────────────────────────────────────────────

  @override
  void initState() {
    super.initState();
    _fadeAnim = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 250),
      value: 1.0,
    );
    if (!widget.isAudio) _initPlayer();
    _scheduleHide();
  }

  @override
  void dispose() {
    _hideTimer?.cancel();
    _progressTimer?.cancel();
    _fadeAnim.dispose();
    _controller?.removeListener(_onUpdate);
    _controller?.dispose();
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    super.dispose();
  }

  // ─── Player init / quality switch ───────────────────────────────────────────

  Future<void> _initPlayer({String? qualityUrl}) async {
    final url = qualityUrl ?? widget.videoUrl ?? _demoHlsUrl;

    // Capture resume position before disposing the old controller.
    final resume = _controller?.value.isInitialized == true
        ? _controller!.value.position
        : widget.startPositionSec != null
            ? Duration(seconds: widget.startPositionSec!)
            : Duration.zero;

    _controller?.removeListener(_onUpdate);
    await _controller?.pause();
    final old = _controller;

    setState(() {
      _controller = null;
      _isInitialized = false;
      _hasError = false;
    });

    final ctrl = VideoPlayerController.networkUrl(Uri.parse(url));
    _controller = ctrl;
    ctrl.addListener(_onUpdate);

    try {
      await ctrl.initialize();
      if (!mounted) {
        ctrl.removeListener(_onUpdate);
        ctrl.dispose();
        return;
      }
      if (resume > Duration.zero) await ctrl.seekTo(resume);
      await ctrl.play();
      if (mounted) setState(() => _isInitialized = true);
      _startProgressTimer();
    } catch (_) {
      if (mounted) setState(() => _hasError = true);
    } finally {
      await old?.dispose();
    }
  }

  void _onUpdate() {
    if (mounted) setState(() {});
  }

  void _startProgressTimer() {
    _progressTimer?.cancel();
    _progressTimer = Timer.periodic(const Duration(seconds: 10), (_) {
      final pos = _controller?.value.position.inSeconds ?? 0;
      // TODO Phase 2: POST /stream/progress { content_id, progress_sec, quality_used }
      debugPrint('[DjeliS] progress=$pos s  quality=$_selectedQuality');
    });
  }

  // ─── Controls visibility ────────────────────────────────────────────────────

  void _scheduleHide() {
    _hideTimer?.cancel();
    _hideTimer = Timer(const Duration(seconds: 3), () {
      if (_controller?.value.isPlaying == true) _fadeAnim.reverse();
    });
  }

  void _onTap() {
    if (_fadeAnim.value < 0.5) {
      _fadeAnim.forward();
      _scheduleHide();
    } else {
      _hideTimer?.cancel();
      _fadeAnim.reverse();
    }
  }

  // ─── Playback actions ───────────────────────────────────────────────────────

  void _togglePlay() {
    final ctrl = _controller;
    if (ctrl == null) return;
    if (ctrl.value.isPlaying) {
      ctrl.pause();
      _hideTimer?.cancel();
      _fadeAnim.forward();
    } else {
      ctrl.play();
      _scheduleHide();
    }
  }

  void _seekRelative(int seconds) {
    final ctrl = _controller;
    if (ctrl == null || !ctrl.value.isInitialized) return;
    final target = ctrl.value.position + Duration(seconds: seconds);
    ctrl.seekTo(target.clamp(Duration.zero, ctrl.value.duration));
    _scheduleHide();
  }

  void _seekTo(double fraction) {
    final ctrl = _controller;
    if (ctrl == null || !ctrl.value.isInitialized) return;
    ctrl.seekTo(Duration(
      milliseconds: (fraction * ctrl.value.duration.inMilliseconds).round(),
    ));
    _scheduleHide();
  }

  void _toggleDataSaver() {
    final next = !_isDataSaver;
    setState(() {
      _isDataSaver = next;
      if (next) _selectedQuality = '240p';
    });
    if (!widget.isAudio) _switchQuality(next ? '240p' : 'Auto');
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(next
          ? '⚡ Mode Économie activé — 240p (~120 Mo/h)'
          : '▶ Mode Adaptatif réactivé'),
      duration: const Duration(seconds: 2),
      backgroundColor: AppTheme.darkSurface,
    ));
  }

  void _switchQuality(String quality) {
    if (quality == _selectedQuality) return;
    setState(() => _selectedQuality = quality);
    if (widget.videoUrl == null) return;
    // In production, /stream/token returns a quality-specific signed URL.
    // Here we append a query param that the CDN/backend will honour.
    final base = widget.videoUrl!.split('?').first;
    final url =
        quality == 'Auto' ? base : '$base?quality=${quality.toLowerCase()}';
    _initPlayer(qualityUrl: url);
  }

  void _toggleFullscreen() {
    setState(() => _isFullscreen = !_isFullscreen);
    if (_isFullscreen) {
      SystemChrome.setPreferredOrientations(
          [DeviceOrientation.landscapeLeft, DeviceOrientation.landscapeRight]);
      SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
    } else {
      SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
      SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    }
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  double get _progress {
    final ctrl = _controller;
    if (ctrl == null || !ctrl.value.isInitialized) return 0;
    final dur = ctrl.value.duration.inMilliseconds;
    return dur == 0
        ? 0
        : (ctrl.value.position.inMilliseconds / dur).clamp(0.0, 1.0);
  }

  double get _bufferProgress {
    final ctrl = _controller;
    if (ctrl == null ||
        !ctrl.value.isInitialized ||
        ctrl.value.buffered.isEmpty) return 0;
    final dur = ctrl.value.duration.inMilliseconds;
    if (dur == 0) return 0;
    return (ctrl.value.buffered.last.end.inMilliseconds / dur)
        .clamp(0.0, 1.0);
  }

  String _fmt(Duration d) {
    final h = d.inHours;
    final m = d.inMinutes.remainder(60).toString().padLeft(2, '0');
    final s = d.inSeconds.remainder(60).toString().padLeft(2, '0');
    return h > 0 ? '$h:$m:$s' : '$m:$s';
  }

  // ─── Build ──────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: GestureDetector(
        onTap: _onTap,
        behavior: HitTestBehavior.opaque,
        child: Stack(
          children: [
            _buildContent(),
            FadeTransition(opacity: _fadeAnim, child: _buildOverlay()),
            if (!_isInitialized && !_hasError && !widget.isAudio)
              const Center(
                child: CircularProgressIndicator(
                  color: AppTheme.primaryGold,
                  strokeWidth: 2.5,
                ),
              ),
            if (_hasError) _buildError(),
          ],
        ),
      ),
    );
  }

  // ── Video / audio content area ───────────────────────────────────────────────

  Widget _buildContent() {
    if (widget.isAudio) return _buildAudioArtwork();
    if (!_isInitialized || _controller == null) return const SizedBox.expand();
    return Center(
      child: AspectRatio(
        aspectRatio: _controller!.value.aspectRatio,
        child: VideoPlayer(_controller!),
      ),
    );
  }

  Widget _buildAudioArtwork() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppTheme.darkBackground,
            AppTheme.accentCrimson.withOpacity(0.55),
          ],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 180,
              height: 180,
              decoration: BoxDecoration(
                color: AppTheme.darkCard,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                    color: AppTheme.primaryGold.withOpacity(0.3), width: 2),
              ),
              child: const Icon(Icons.music_note,
                  color: AppTheme.primaryGold, size: 72),
            ),
            const SizedBox(height: 24),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 40),
              child: Text(
                widget.title,
                style: const TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildError() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, color: Colors.white38, size: 56),
          const SizedBox(height: 16),
          const Text(
            'Impossible de charger le contenu',
            style: TextStyle(color: Colors.white70, fontSize: 15),
          ),
          const SizedBox(height: 6),
          const Text(
            'Vérifiez votre connexion et réessayez',
            style: TextStyle(color: Colors.white38, fontSize: 12),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: _initPlayer,
            icon: const Icon(Icons.refresh, color: Colors.black),
            label: const Text('Réessayer',
                style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
            style:
                ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryGold),
          ),
        ],
      ),
    );
  }

  // ── Controls overlay ─────────────────────────────────────────────────────────

  Widget _buildOverlay() {
    final ctrl = _controller;
    final isPlaying = ctrl?.value.isPlaying ?? false;
    final position = ctrl?.value.position ?? Duration.zero;
    final duration = ctrl?.value.duration ?? Duration.zero;

    return Stack(
      children: [
        // Top gradient
        const Positioned(
          top: 0, left: 0, right: 0, height: 130,
          child: DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Colors.black87, Colors.transparent],
              ),
            ),
          ),
        ),
        // Bottom gradient
        const Positioned(
          bottom: 0, left: 0, right: 0, height: 200,
          child: DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.bottomCenter,
                end: Alignment.topCenter,
                colors: [Colors.black87, Colors.transparent],
              ),
            ),
          ),
        ),

        // ── Top bar ────────────────────────────────────────────────────────────
        Positioned(
          top: MediaQuery.of(context).padding.top + 4,
          left: 4,
          right: 4,
          child: Row(
            children: [
              IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.white),
                onPressed: () {
                  if (_isFullscreen) _toggleFullscreen();
                  Navigator.of(context).pop();
                },
              ),
              Expanded(
                child: Text(
                  widget.title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.bold),
                ),
              ),
              IconButton(
                tooltip: 'Mode Économie de données',
                icon: Icon(
                  _isDataSaver
                      ? Icons.offline_bolt
                      : Icons.offline_bolt_outlined,
                  color: _isDataSaver ? AppTheme.primaryGold : Colors.white70,
                ),
                onPressed: _toggleDataSaver,
              ),
              if (!widget.isAudio)
                IconButton(
                  icon: Icon(
                    _isFullscreen ? Icons.fullscreen_exit : Icons.fullscreen,
                    color: Colors.white70,
                  ),
                  onPressed: _toggleFullscreen,
                ),
            ],
          ),
        ),

        // ── Center play controls ───────────────────────────────────────────────
        Center(
          child: widget.isAudio
              ? _PlayButton(isPlaying: isPlaying, onTap: _togglePlay)
              : Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _SeekButton(icon: Icons.replay_10, onTap: () => _seekRelative(-10)),
                    const SizedBox(width: 28),
                    _PlayButton(isPlaying: isPlaying, onTap: _togglePlay),
                    const SizedBox(width: 28),
                    _SeekButton(icon: Icons.forward_10, onTap: () => _seekRelative(10)),
                  ],
                ),
        ),

        // ── Bottom controls ────────────────────────────────────────────────────
        Positioned(
          bottom: MediaQuery.of(context).padding.bottom + 12,
          left: 16,
          right: 16,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (_isDataSaver)
                Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryGold.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                          color: AppTheme.primaryGold.withOpacity(0.4)),
                    ),
                    child: const Text(
                      '⚡ Mode Économie · ~120 Mo/h',
                      style: TextStyle(
                          color: AppTheme.primaryGold,
                          fontSize: 11,
                          fontWeight: FontWeight.bold),
                    ),
                  ),
                ),

              // Seek bar (buffer + progress stacked)
              _buildSeekBar(),
              const SizedBox(height: 4),

              // Time + utility buttons
              Row(
                children: [
                  Text(
                    '${_fmt(position)} / ${_fmt(duration)}',
                    style: const TextStyle(color: Colors.white70, fontSize: 12),
                  ),
                  const Spacer(),
                  // Subtitles — Phase 2
                  IconButton(
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                    icon: const Icon(Icons.subtitles_outlined,
                        color: Colors.white60, size: 20),
                    onPressed: () {},
                  ),
                  const SizedBox(width: 12),
                  // Quality badge
                  GestureDetector(
                    onTap: (_isDataSaver || widget.isAudio)
                        ? null
                        : _showQualitySheet,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 9, vertical: 3),
                      decoration: BoxDecoration(
                        border: Border.all(
                          color: _isDataSaver
                              ? Colors.white24
                              : AppTheme.primaryGold,
                        ),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        widget.isAudio
                            ? '128k'
                            : (_isDataSaver ? '240p' : _selectedQuality),
                        style: TextStyle(
                          color: _isDataSaver
                              ? Colors.white38
                              : AppTheme.primaryGold,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSeekBar() {
    return SizedBox(
      height: 28,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(3),
              child: LinearProgressIndicator(
                value: _bufferProgress,
                backgroundColor: Colors.white12,
                color: Colors.white24,
                minHeight: 3,
              ),
            ),
          ),
          SliderTheme(
            data: SliderTheme.of(context).copyWith(
              trackHeight: 3,
              activeTrackColor: AppTheme.primaryGold,
              inactiveTrackColor: Colors.transparent,
              thumbColor: AppTheme.primaryGold,
              thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
              overlayColor: AppTheme.primaryGold.withOpacity(0.2),
              overlayShape: const RoundSliderOverlayShape(overlayRadius: 14),
            ),
            child: Slider(
              value: _progress,
              onChanged: _seekTo,
              onChangeStart: (_) => _hideTimer?.cancel(),
              onChangeEnd: (_) => _scheduleHide(),
            ),
          ),
        ],
      ),
    );
  }

  // ── Quality bottom sheet ──────────────────────────────────────────────────────

  void _showQualitySheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppTheme.darkSurface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 36,
              height: 4,
              margin: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                  color: Colors.white24,
                  borderRadius: BorderRadius.circular(2)),
            ),
            const Text(
              'Qualité vidéo',
              style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            ..._qualities.map((q) {
              final selected = _selectedQuality == q.label;
              final sub = q.dataMbPerHour != null
                  ? '~${q.dataMbPerHour} Mo/h'
                  : 'Adaptatif automatique';
              return ListTile(
                leading: Icon(
                  selected
                      ? Icons.check_circle
                      : Icons.radio_button_unchecked,
                  color: selected ? AppTheme.primaryGold : Colors.white38,
                  size: 22,
                ),
                title: Text(
                  q.label,
                  style: TextStyle(
                    color: selected ? AppTheme.primaryGold : Colors.white,
                    fontWeight:
                        selected ? FontWeight.bold : FontWeight.normal,
                  ),
                ),
                subtitle: Text(sub,
                    style: const TextStyle(
                        color: Colors.white38, fontSize: 11)),
                onTap: () {
                  Navigator.of(ctx).pop();
                  _switchQuality(q.label);
                },
              );
            }),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}

// ─── Reusable small widgets ───────────────────────────────────────────────────

class _PlayButton extends StatelessWidget {
  final bool isPlaying;
  final VoidCallback onTap;
  const _PlayButton({required this.isPlaying, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 64,
        height: 64,
        decoration: const BoxDecoration(
            color: AppTheme.primaryGold, shape: BoxShape.circle),
        child: Icon(isPlaying ? Icons.pause : Icons.play_arrow,
            color: Colors.black, size: 36),
      ),
    );
  }
}

class _SeekButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  const _SeekButton({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Icon(icon, color: Colors.white, size: 36),
      ),
    );
  }
}
