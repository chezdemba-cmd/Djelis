import 'package:dio/dio.dart';
import '../errors/app_exception.dart';
import '../storage/secure_storage_service.dart';

import 'package:flutter_dotenv/flutter_dotenv.dart';

final String apiBaseUrl =
    dotenv.env['API_BASE_URL'] ?? 'http://10.0.2.2:3000/api/v1';

class ApiClient {
  late final Dio _dio;
  final SecureStorageService _storage;

  ApiClient(this._storage) {
    _dio = Dio(BaseOptions(
      baseUrl: apiBaseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 15),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-App-Platform': 'flutter-android',
        'X-App-Version': '1.0.0',
      },
    ));

    _dio.interceptors.addAll([
      _AuthInterceptor(_storage, _dio),
      _ErrorInterceptor(),
      if (const bool.fromEnvironment('DART_DEBUG', defaultValue: false))
        LogInterceptor(requestBody: true, responseBody: true),
    ]);
  }

  Dio get dio => _dio;

  Future<T> get<T>(String path, {Map<String, dynamic>? queryParameters}) async {
    try {
      final res = await _dio.get<T>(path, queryParameters: queryParameters);
      return res.data as T;
    } on DioException catch (e) {
      if (e.error is AppException) throw e.error as AppException;
      rethrow;
    }
  }

  Future<T> post<T>(String path, {dynamic data}) async {
    try {
      final res = await _dio.post<T>(path, data: data);
      return res.data as T;
    } on DioException catch (e) {
      if (e.error is AppException) throw e.error as AppException;
      rethrow;
    }
  }

  Future<T> patch<T>(String path, {dynamic data}) async {
    try {
      final res = await _dio.patch<T>(path, data: data);
      return res.data as T;
    } on DioException catch (e) {
      if (e.error is AppException) throw e.error as AppException;
      rethrow;
    }
  }
}

// ─── Auth interceptor (injects Bearer + refreshes on 401) ────────────────────

class _AuthInterceptor extends Interceptor {
  final SecureStorageService _storage;
  final Dio _dio;
  bool _isRefreshing = false;

  _AuthInterceptor(this._storage, this._dio);

  @override
  void onRequest(
      RequestOptions options, RequestInterceptorHandler handler) async {
    // Skip auth header for login / register routes
    if (_isPublicRoute(options.path)) return handler.next(options);
    final token = await _storage.getAccessToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401 && !_isRefreshing) {
      _isRefreshing = true;
      try {
        final refreshToken = await _storage.getRefreshToken();
        if (refreshToken == null) throw const UnauthorizedException();

        final res = await _dio.post<Map<String, dynamic>>(
          '/auth/refresh',
          data: {'refresh_token': refreshToken},
          options: Options(headers: {}), // skip auth interceptor loop
        );
        final newAccess = res.data!['access_token'] as String;
        final newRefresh = res.data!['refresh_token'] as String;
        await _storage.saveTokens(
            accessToken: newAccess, refreshToken: newRefresh);

        // Retry original request with new token
        final retryOptions = err.requestOptions
          ..headers['Authorization'] = 'Bearer $newAccess';
        final retryRes = await _dio.fetch(retryOptions);
        return handler.resolve(retryRes);
      } catch (_) {
        await _storage.clearAll();
        return handler.reject(err);
      } finally {
        _isRefreshing = false;
      }
    }
    handler.next(err);
  }

  bool _isPublicRoute(String path) =>
      path.startsWith('/auth/') || path.startsWith('/plans');
}

// ─── Error interceptor (maps HTTP errors → AppException) ─────────────────────

class _ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    AppException? appException;
    if (err.type == DioExceptionType.connectionTimeout ||
        err.type == DioExceptionType.receiveTimeout ||
        err.type == DioExceptionType.sendTimeout ||
        err.type == DioExceptionType.connectionError) {
      appException = const NetworkException();
    } else {
      final code = err.response?.statusCode;
      final msg = (err.response?.data as Map?)?['message'] as String?;
      if (code == 401) {
        appException = UnauthorizedException(msg ?? 'Session expirée');
      } else if (code == 404) {
        appException = NotFoundException(msg ?? 'Introuvable');
      } else if (code != null && code >= 500) {
        appException = ServerException(msg ?? 'Erreur serveur');
      }
    }

    if (appException != null) {
      handler.reject(
        DioException(
          requestOptions: err.requestOptions,
          response: err.response,
          type: err.type,
          error: appException,
        ),
      );
      return;
    }
    handler.next(err);
  }
}
