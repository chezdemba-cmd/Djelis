import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Wraps FlutterSecureStorage for JWT token persistence.
class SecureStorageService {
  static const _accessTokenKey = 'access_token';
  static const _refreshTokenKey = 'refresh_token';
  static const _userIdKey = 'user_id';
  static const _userKey = 'user';

  final FlutterSecureStorage _storage;

  SecureStorageService()
      : _storage = const FlutterSecureStorage(
          aOptions: AndroidOptions(encryptedSharedPreferences: true),
        );

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await Future.wait([
      _storage.write(key: _accessTokenKey, value: accessToken),
      _storage.write(key: _refreshTokenKey, value: refreshToken),
    ]);
  }

  Future<String?> getAccessToken() => _storage.read(key: _accessTokenKey);
  Future<String?> getRefreshToken() => _storage.read(key: _refreshTokenKey);

  Future<void> saveUserId(String id) =>
      _storage.write(key: _userIdKey, value: id);
  Future<String?> getUserId() => _storage.read(key: _userIdKey);

  Future<void> saveUser(String userJson) =>
      _storage.write(key: _userKey, value: userJson);
  Future<String?> getUser() => _storage.read(key: _userKey);

  Future<void> clearAll() => _storage.deleteAll();

  Future<bool> get hasTokens async {
    final token = await getAccessToken();
    return token != null && token.isNotEmpty;
  }
}
