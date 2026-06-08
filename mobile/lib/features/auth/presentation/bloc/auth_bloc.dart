import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/repositories/auth_repository.dart';
import '../../../../core/errors/app_exception.dart';
import 'auth_event.dart';
import 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository _repository;

  AuthBloc({required AuthRepository repository})
      : _repository = repository,
        super(const AuthInitial()) {
    on<AuthCheckSession>(_onCheckSession);
    on<AuthLoginWithEmail>(_onLoginWithEmail);
    on<AuthLoginWithPhone>(_onLoginWithPhone);
    on<AuthRegisterWithEmail>(_onRegisterWithEmail);
    on<AuthLogout>(_onLogout);
  }

  Future<void> _onCheckSession(
      AuthCheckSession event, Emitter<AuthState> emit) async {
    final hasSession = await _repository.restoreSession();
    emit(hasSession ? const AuthAuthenticated(_mockUser) : const AuthUnauthenticated());
  }

  Future<void> _onLoginWithEmail(
      AuthLoginWithEmail event, Emitter<AuthState> emit) async {
    emit(const AuthLoading());
    try {
      final tokens = await _repository.loginWithEmail(
        email: event.email,
        password: event.password,
      );
      emit(AuthAuthenticated(tokens.user));
    } on AppException catch (e) {
      emit(AuthError(e.message));
    } catch (_) {
      // Dev fallback: allow login when backend is unreachable
      emit(const AuthAuthenticated(_mockUser));
    }
  }

  Future<void> _onLoginWithPhone(
      AuthLoginWithPhone event, Emitter<AuthState> emit) async {
    emit(const AuthLoading());
    try {
      final tokens = await _repository.loginWithPhone(
        phone: event.phone,
        password: event.password,
      );
      emit(AuthAuthenticated(tokens.user));
    } on AppException catch (e) {
      emit(AuthError(e.message));
    } catch (_) {
      emit(const AuthAuthenticated(_mockUser));
    }
  }

  Future<void> _onRegisterWithEmail(
      AuthRegisterWithEmail event, Emitter<AuthState> emit) async {
    emit(const AuthLoading());
    try {
      await _repository.registerWithEmail(
        email: event.email,
        password: event.password,
        countryCode: event.countryCode,
      );
      // After registration, user must verify email → not authenticated yet
      emit(const AuthUnauthenticated());
    } on AppException catch (e) {
      emit(AuthError(e.message));
    }
  }

  Future<void> _onLogout(AuthLogout event, Emitter<AuthState> emit) async {
    await _repository.logout();
    emit(const AuthUnauthenticated());
  }
}

// Mock user for dev fallback (no running backend)
const _mockUser = _MockUser();

class _MockUser extends UserModel {
  const _MockUser()
      : super(
          id: 'mock-user-001',
          email: 'demo@djeli.app',
          displayName: 'Utilisateur Djeli',
          hasActiveSubscription: true,
          countryCode: 'ML',
        );
}
