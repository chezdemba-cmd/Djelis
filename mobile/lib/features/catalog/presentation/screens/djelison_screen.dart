import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';

class DjelisonScreen extends StatelessWidget {
  const DjelisonScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Audio banner
          _buildBanner(context),

          const SizedBox(height: 24),

          // Horizontal list for Podcasts / Albums
          _buildHorizontalAlbums(
            context,
            title: "Podcasts & Récits Audio",
            items: [
              {"title": "Contes du Clair de Lune", "subtitle": "Sékou le Griot"},
              {"title": "L'Histoire du Mande", "subtitle": "Pod'Culture"},
              {"title": "Paroles de Sages", "subtitle": "Momo Koné"},
            ],
          ),

          const SizedBox(height: 24),

          // Vertical List for Songs / Clips / Concerts
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  "DjeliSon - Les Hits Populaires",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                TextButton(
                  onPressed: () {},
                  child: const Text(
                    "Tout voir",
                    style: TextStyle(color: AppTheme.primaryGold),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),

          _buildTrackItem(
            context,
            title: "Diarabi",
            artist: "Sidiki Diabaté",
            duration: "3:45",
          ),
          _buildTrackItem(
            context,
            title: "Balimaya",
            artist: "Oumou Sangaré",
            duration: "4:20",
          ),
          _buildTrackItem(
            context,
            title: "Sina",
            artist: "Salif Keita",
            duration: "5:12",
          ),

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
              "Dernier Concert Privé",
              style: TextStyle(color: Colors.white70, fontSize: 12),
            ),
            const SizedBox(height: 4),
            const Text(
              "Festival de Musique Acoustique",
              style: TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            ElevatedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.play_arrow, color: Colors.black),
              label: const Text("Écouter le concert", style: TextStyle(color: Colors.black)),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
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
    required List<Map<String, String>> items,
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
              return Container(
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
                        ),
                        child: const Center(
                          child: Icon(
                            Icons.headphones,
                            color: Colors.grey,
                            size: 32,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      item["title"] ?? '',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 11,
                      ),
                    ),
                    Text(
                      item["subtitle"] ?? '',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Colors.grey,
                        fontSize: 9,
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildTrackItem(
    BuildContext context, {
    required String title,
    required String artist,
    required String duration,
  }) {
    return GestureDetector(
      onTap: () => context.push('/player', extra: {
        'title': '$title — $artist',
        'isAudio': true,
      }),
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
              ),
              child: const Icon(Icons.music_note, color: AppTheme.primaryGold),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                  Text(
                    artist,
                    style: const TextStyle(
                      color: Colors.grey,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            Text(
              duration,
              style: const TextStyle(color: Colors.grey, fontSize: 12),
            ),
            const SizedBox(width: 12),
            const Icon(Icons.play_circle_fill, color: Colors.white),
          ],
        ),
      ),
    );
  }
}
