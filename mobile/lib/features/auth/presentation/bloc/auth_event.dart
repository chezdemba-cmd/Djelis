import 'package:equatable/equatable.dart';

abstract class AuthEvent extends Equatable {
  const AuthEvent();
  @override
  List<Object?> get props => [];
}

class AuthCheckSession extends AuthEvent {
  const AuthCheckSession();
}

class AuthLoginWithEmail extends AuthEvent {
  final String email;
  final String password;
  const AuthLoginWithEmail({required this.email, required this.password});
  @override
  List<Object?> get props => [email];
}

class AuthLoginWithPhone extends AuthEvent {
  final String phone;
  final String password;
  const AuthLoginWithPhone({required this.phone, required this.password});
  @override
  List<Object?> get props => [phone];
}

class AuthRegisterWithEmail extends AuthEvent {
  final String email;
  final String password;
  final String countryCode;
  const AuthRegisterWithEmail({
    required this.email,
    required this.password,
    required this.countryCode,
  });
  @override
  List<Object?> get props => [email, countryCode];
}

class AuthLogout extends AuthEvent {
  const AuthLogout();
}
