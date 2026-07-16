import 'package:equatable/equatable.dart';

class ContentModel extends Equatable {
  final String id;
  final String title;
  final String? synopsis;
  final String? posterUrl;
  final String? trailerUrl;
  final String type;
  final String? categoryId;
  final String? categoryName;
  final int? durationMin;
  final int? releaseYear;
  final String ageRating;
  final bool isFeatured;
  final bool isOriginal;
  final int viewCount;
  final List<EpisodeModel> episodes;
  final String? tag;

  const ContentModel({
    required this.id,
    required this.title,
    this.synopsis,
    this.posterUrl,
    this.trailerUrl,
    required this.type,
    this.categoryId,
    this.categoryName,
    this.durationMin,
    this.releaseYear,
    this.ageRating = 'all',
    this.isFeatured = false,
    this.isOriginal = false,
    this.viewCount = 0,
    this.episodes = const [],
    this.tag,
  });

  factory ContentModel.fromJson(Map<String, dynamic> json) {
    final rawEpisodes = json['episodes'] as List<dynamic>? ?? [];
    return ContentModel(
      id: json['id'] as String,
      title: json['title'] as String,
      synopsis: json['synopsis'] as String?,
      posterUrl: json['poster_url'] as String?,
      trailerUrl: json['trailer_url'] as String?,
      type: json['type'] as String? ?? 'film',
      categoryId: json['category_id'] as String?,
      categoryName: (json['category'] as Map?)?['name'] as String?,
      durationMin: json['duration_min'] as int?,
      releaseYear: json['release_year'] as int?,
      ageRating: json['age_rating'] as String? ?? 'all',
      isFeatured: json['is_featured'] as bool? ?? false,
      isOriginal: json['is_original'] as bool? ?? false,
      viewCount: json['view_count'] as int? ?? 0,
      episodes: rawEpisodes
          .map((e) => EpisodeModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      tag: json['tag'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'synopsis': synopsis,
      'poster_url': posterUrl,
      'trailer_url': trailerUrl,
      'type': type,
      'category_id': categoryId,
      'category': categoryName != null ? {'name': categoryName} : null,
      'duration_min': durationMin,
      'release_year': releaseYear,
      'age_rating': ageRating,
      'is_featured': isFeatured,
      'is_original': isOriginal,
      'view_count': viewCount,
      'episodes': episodes.map((e) => e.toJson()).toList(),
      'tag': tag,
    };
  }

  @override
  List<Object?> get props => [id, title, type];
}

class EpisodeModel extends Equatable {
  final String id;
  final int season;
  final int episodeNumber;
  final String? title;
  final String? synopsis;
  final int? durationMin;
  final String? thumbnailUrl;

  const EpisodeModel({
    required this.id,
    required this.season,
    required this.episodeNumber,
    this.title,
    this.synopsis,
    this.durationMin,
    this.thumbnailUrl,
  });

  factory EpisodeModel.fromJson(Map<String, dynamic> json) => EpisodeModel(
        id: json['id'] as String,
        season: json['season'] as int? ?? 1,
        episodeNumber: json['episode_number'] as int,
        title: json['title'] as String?,
        synopsis: json['synopsis'] as String?,
        durationMin: json['duration_min'] as int?,
        thumbnailUrl: json['thumbnail_url'] as String?,
      );

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'season': season,
      'episode_number': episodeNumber,
      'title': title,
      'synopsis': synopsis,
      'duration_min': durationMin,
      'thumbnail_url': thumbnailUrl,
    };
  }

  @override
  List<Object?> get props => [id, season, episodeNumber];
}

class CategoryModel extends Equatable {
  final String id;
  final String name;
  final String slug;
  final String type;
  final String? iconUrl;

  const CategoryModel({
    required this.id,
    required this.name,
    required this.slug,
    required this.type,
    this.iconUrl,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) => CategoryModel(
        id: json['id'] as String,
        name: json['name'] as String,
        slug: json['slug'] as String,
        type: json['type'] as String,
        iconUrl: json['icon_url'] as String?,
      );

  @override
  List<Object?> get props => [id, slug];
}

/// Catalogue home layout returned by GET /catalogue/featured
class FeaturedCatalogModel {
  final ContentModel? hero;
  final List<ContentRow> rows;

  const FeaturedCatalogModel({this.hero, this.rows = const []});

  factory FeaturedCatalogModel.fromJson(Map<String, dynamic> json) {
    final heroJson = json['hero'] as Map<String, dynamic>?;
    final rawRows = json['rows'] as List<dynamic>? ?? [];
    return FeaturedCatalogModel(
      hero: heroJson != null ? ContentModel.fromJson(heroJson) : null,
      rows: rawRows
          .map((r) => ContentRow.fromJson(r as Map<String, dynamic>))
          .toList(),
    );
  }
}

class ContentRow {
  final String title;
  final List<ContentModel> contents;

  const ContentRow({required this.title, required this.contents});

  factory ContentRow.fromJson(Map<String, dynamic> json) {
    final rawContents = json['contents'] as List<dynamic>? ?? [];
    return ContentRow(
      title: json['title'] as String,
      contents: rawContents
          .map((c) => ContentModel.fromJson(c as Map<String, dynamic>))
          .toList(),
    );
  }
}

// ─── Mock data (used when backend is unreachable during development) ──────────

FeaturedCatalogModel mockFeaturedCatalog() {
  return FeaturedCatalogModel(
    hero: const ContentModel(
      id: 'c1',
      title: "Le Trône du Mandé",
      synopsis:
          "L'épopée historique légendaire qui retrace la fondation de l'Empire du Mali à travers les yeux de Soundiata Keita.",
      type: 'series',
      isOriginal: true,
      isFeatured: true,
      ageRating: '12+',
      releaseYear: 2026,
      tag: "Production Originale Djeli'S",
    ),
    rows: [
      ContentRow(
        title: 'Cinéma & Long-métrages',
        contents: [
          const ContentModel(id: 'c2', title: 'Les Secrets du Baobab', type: 'film', tag: 'Exclusivité'),
          const ContentModel(id: 'c3', title: "L'Or de Ségou", type: 'film', tag: 'Drame'),
          const ContentModel(id: 'c4', title: 'Taxi à Bamako', type: 'film', tag: 'Comédie'),
        ],
      ),
      ContentRow(
        title: 'Théâtre & Humour',
        contents: [
          const ContentModel(id: 'c5', title: 'Le Retour de Guignol', type: 'theatre', tag: 'Théâtre'),
          const ContentModel(id: 'c6', title: 'Abidjan Comedy Show', type: 'humour', tag: 'Humour'),
          const ContentModel(id: 'c7', title: 'Les Tranches de Vie', type: 'series', tag: 'Série Humour'),
        ],
      ),
      ContentRow(
        title: 'Documentaires & Récits',
        contents: [
          const ContentModel(id: 'c8', title: "L'Empire du Mali", type: 'documentary', tag: 'Histoire'),
          const ContentModel(id: 'c9', title: 'Les Artisans du Niger', type: 'documentary', tag: 'Société'),
          const ContentModel(id: 'c10', title: 'Femmes du Sahel', type: 'documentary', tag: 'Culture'),
        ],
      ),
    ],
  );
}

List<ContentModel> mockAudioContents() => [
      const ContentModel(id: 'a1', title: 'Contes du Clair de Lune', type: 'podcast', tag: 'Sékou le Griot'),
      const ContentModel(id: 'a2', title: "L'Histoire du Mande", type: 'podcast', tag: "Pod'Culture"),
      const ContentModel(id: 'a3', title: 'Paroles de Sages', type: 'podcast', tag: 'Momo Koné'),
    ];

List<Map<String, String>> mockTracks() => [
      {'title': 'Diarabi', 'artist': 'Sidiki Diabaté', 'duration': '3:45'},
      {'title': 'Balimaya', 'artist': 'Oumou Sangaré', 'duration': '4:20'},
      {'title': 'Sina', 'artist': 'Salif Keita', 'duration': '5:12'},
    ];
