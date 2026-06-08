import '../../../../core/network/api_client.dart';
import '../../../../core/errors/app_exception.dart';
import '../models/content_model.dart';

class CatalogRepository {
  final ApiClient _api;

  CatalogRepository({required ApiClient api}) : _api = api;

  /// Returns hero + category rows for the home page.
  /// Falls back to mock data if the backend is unreachable.
  Future<FeaturedCatalogModel> getFeatured({String? countryCode}) async {
    try {
      final data = await _api.get<Map<String, dynamic>>(
        '/catalogue/featured',
        queryParameters: countryCode != null ? {'country': countryCode} : null,
      );
      return FeaturedCatalogModel.fromJson(data);
    } on NetworkException {
      return mockFeaturedCatalog();
    }
  }

  Future<List<ContentModel>> getContents({
    String? type,
    String? categoryId,
    String? countryCode,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final data = await _api.get<Map<String, dynamic>>(
        '/catalogue/contents',
        queryParameters: {
          if (type != null) 'type': type,
          if (categoryId != null) 'category': categoryId,
          if (countryCode != null) 'country': countryCode,
          'page': page,
          'limit': limit,
        },
      );
      final rawList = data['data'] as List<dynamic>;
      return rawList
          .map((e) => ContentModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on NetworkException {
      return mockFeaturedCatalog()
          .rows
          .expand((r) => r.contents)
          .where((c) => type == null || c.type == type)
          .toList();
    }
  }

  Future<ContentModel> getContentDetail(String contentId) async {
    final data = await _api.get<Map<String, dynamic>>(
      '/catalogue/contents/$contentId',
    );
    return ContentModel.fromJson(data);
  }

  Future<List<ContentModel>> search(String query, {int page = 1}) async {
    try {
      final data = await _api.get<Map<String, dynamic>>(
        '/catalogue/search',
        queryParameters: {'q': query, 'page': page},
      );
      final rawList = data['data'] as List<dynamic>;
      return rawList
          .map((e) => ContentModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on NetworkException {
      // Local mock search
      final all = mockFeaturedCatalog().rows.expand((r) => r.contents);
      return all
          .where((c) => c.title.toLowerCase().contains(query.toLowerCase()))
          .toList();
    }
  }

  Future<List<ContentModel>> getPopular({String? countryCode}) async {
    try {
      final data = await _api.get<Map<String, dynamic>>(
        '/catalogue/popular',
        queryParameters: countryCode != null ? {'country': countryCode} : null,
      );
      final rawList = data as List<dynamic>? ??
          (data['data'] as List<dynamic>? ?? []);
      return rawList
          .map((e) => ContentModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on NetworkException {
      return mockFeaturedCatalog().rows.first.contents;
    }
  }

  /// Sends playback progress to the backend.
  Future<void> reportProgress({
    required String contentId,
    String? episodeId,
    required int progressSec,
    required String quality,
    required String deviceType,
  }) async {
    try {
      await _api.post<void>(
        '/stream/progress',
        data: {
          'content_id': contentId,
          if (episodeId != null) 'episode_id': episodeId,
          'progress_sec': progressSec,
          'quality_used': quality,
          'device_type': deviceType,
        },
      );
    } catch (_) {
      // Progress reporting is fire-and-forget; never block the player.
    }
  }

  /// Fetches a signed streaming URL from the backend.
  Future<String> getStreamToken({
    required String contentId,
    String? episodeId,
    String quality = 'auto',
  }) async {
    final data = await _api.post<Map<String, dynamic>>(
      '/stream/token',
      data: {
        'content_id': contentId,
        if (episodeId != null) 'episode_id': episodeId,
        if (quality != 'auto') 'quality': quality,
      },
    );
    return data['signed_url'] as String;
  }
}
