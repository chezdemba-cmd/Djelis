import 'package:equatable/equatable.dart';

class ContentModel extends Equatable {
  final String id;
  final String title;
  final String? synopsis;
  final String? posterUrl;
  final String? trailerUrl;
  // ID vidéo YouTube (contenu gratuit/promo) — lu via l'embed, pas de /stream/token.
  final String? youtubeId;
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
    this.youtubeId,
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
      youtubeId: json['youtube_id'] as String?,
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
      'youtube_id': youtubeId,
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
