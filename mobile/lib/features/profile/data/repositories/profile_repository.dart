import 'dart:convert';

import '../../../../core/network/api_client.dart';
import '../../../../core/storage/secure_storage_service.dart';
import '../models/profile_model.dart';

class ProfileRepository {
  final ApiClient _api;
  final SecureStorageService _storage;

  ProfileRepository({
    required ApiClient api,
    required SecureStorageService storage,
  })  : _api = api,
        _storage = storage;

  Future<List<ProfileModel>> list() async {
    final data = await _api.get<List<dynamic>>('/profiles');
    return data
        .map((e) => ProfileModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<ProfileModel> create({
    required String name,
    bool isChild = false,
  }) async {
    final data = await _api.post<Map<String, dynamic>>(
      '/profiles',
      data: {'name': name, 'is_child': isChild},
    );
    return ProfileModel.fromJson(data);
  }

  Future<ProfileModel> update(
    String id, {
    required String name,
    required bool isChild,
  }) async {
    final data = await _api.patch<Map<String, dynamic>>(
      '/profiles/$id',
      data: {'name': name, 'is_child': isChild},
    );
    return ProfileModel.fromJson(data);
  }

  Future<void> delete(String id) async {
    await _api.dio.delete('/profiles/$id');
  }

  // ── Profil sélectionné (persisté localement) ───────────────────────────────

  Future<ProfileModel?> getSelected() async {
    final raw = await _storage.getSelectedProfile();
    if (raw == null || raw.isEmpty) return null;
    try {
      return ProfileModel.fromJson(jsonDecode(raw) as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }

  Future<void> setSelected(ProfileModel profile) =>
      _storage.saveSelectedProfile(jsonEncode(profile.toJson()));

  Future<void> clearSelected() => _storage.clearSelectedProfile();
}
