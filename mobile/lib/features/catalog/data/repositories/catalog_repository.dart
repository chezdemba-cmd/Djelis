import '../../../../core/network/api_client.dart';
import '../models/content_model.dart';

class CatalogRepository {
  final ApiClient _api;

  CatalogRepository({required ApiClient api}) : _api = api;

  /// Returns hero + category rows for the home page.
  Future<FeaturedCatalogModel> getFeatured({String? countryCode}) async {
    final data = await _api.get<Map<String, dynamic>>(
      '/catalogue/featured',
      queryParameters: countryCode != null ? {'country': countryCode} : null,
    );
    return FeaturedCatalogModel.fromJson(data);
  }

  Future<List<ContentModel>> getContents({
    String? type,
    String? categoryId,
    String? countryCode,
    int page = 1,
    int limit = 20,
  }) async {
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
  }

  Future<ContentModel> getContentDetail(String contentId) async {
    final data = await _api.get<Map<String, dynamic>>(
      '/catalogue/contents/$contentId',
    );
    return ContentModel.fromJson(data);
  }

  Future<List<ContentModel>> search(String query, {int page = 1}) async {
    final data = await _api.get<Map<String, dynamic>>(
      '/catalogue/search',
      queryParameters: {'q': query, 'page': page},
    );
    final rawList = data['data'] as List<dynamic>;
    return rawList
        .map((e) => ContentModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<ContentModel>> getPopular({String? countryCode}) async {
    final data = await _api.get<Map<String, dynamic>>(
      '/catalogue/popular',
      queryParameters: countryCode != null ? {'country': countryCode} : null,
    );
    final rawList = data['data'] as List<dynamic>? ?? [];
    return rawList
        .map((e) => ContentModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  /// Sends playback progress to the backend.
  Future<void> reportProgress({
    required String contentId,
    String? episodeId,
    required int progressSec,
    required String quality,
    required String deviceType,
    String? profileId,
  }) async {
    try {
      await _api.post<void>(
        '/stream/progress',
        data: {
          'content_id': contentId,
          if (episodeId != null) 'episode_id': episodeId,
          if (profileId != null) 'profile_id': profileId,
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
