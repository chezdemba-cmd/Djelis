import '../../../../core/network/api_client.dart';
import '../../../../core/storage/secure_storage_service.dart';
import '../models/user_model.dart';

class AuthRepository {
  final ApiClient _api;
  final SecureStorageService _storage;

  AuthRepository({required ApiClient api, required SecureStorageService storage})
      : _api = api,
        _storage = storage;

  Future<AuthTokens> loginWithEmail({
    required String email,
    required String password,
  }) async {
    final data = await _api.post<Map<String, dynamic>>(
      '/auth/login',
      data: {'email': email, 'password': password},
    );
    final tokens = AuthTokens.fromJson(data);
    await _persistSession(tokens);
    return tokens;
  }

  Future<AuthTokens> loginWithPhone({
    required String phone,
    required String password,
  }) async {
    final data = await _api.post<Map<String, dynamic>>(
      '/auth/login',
      data: {'phone': phone, 'password': password},
    );
    final tokens = AuthTokens.fromJson(data);
    await _persistSession(tokens);
    return tokens;
  }

  Future<void> registerWithEmail({
    required String email,
    required String password,
    required String countryCode,
  }) async {
    await _api.post<Map<String, dynamic>>(
      '/auth/register/email',
      data: {
        'email': email,
        'password': password,
        'country_code': countryCode,
      },
    );
  }

  Future<void> registerWithPhone({
    required String phone,
    required String password,
    required String countryCode,
  }) async {
    await _api.post<Map<String, dynamic>>(
      '/auth/register/phone',
      data: {
        'phone': phone,
        'password': password,
        'country_code': countryCode,
      },
    );
  }

  Future<void> verifyOtp({
    required String phone,
    required String otp,
  }) async {
    await _api.post<Map<String, dynamic>>(
      '/auth/verify/otp',
      data: {'phone': phone, 'otp': otp},
    );
  }

  Future<void> logout() async {
    try {
      await _api.post<void>('/auth/logout');
    } catch (_) {
      // Always clear local session even if server call fails.
    } finally {
      await _storage.clearAll();
    }
  }

  Future<bool> restoreSession() async => _storage.hasTokens;

  Future<void> _persistSession(AuthTokens tokens) async {
    await _storage.saveTokens(
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    );
    await _storage.saveUserId(tokens.user.id);
  }
}
