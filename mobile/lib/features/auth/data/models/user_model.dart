import 'package:equatable/equatable.dart';

class UserModel extends Equatable {
  final String id;
  final String? phone;
  final String? email;
  final bool phoneVerified;
  final bool emailVerified;
  final String status;
  final String? countryCode;
  final String? displayName;
  final String? avatarUrl;
  final bool hasActiveSubscription;

  const UserModel({
    required this.id,
    this.phone,
    this.email,
    this.phoneVerified = false,
    this.emailVerified = false,
    this.status = 'active',
    this.countryCode,
    this.displayName,
    this.avatarUrl,
    this.hasActiveSubscription = false,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      phone: json['phone'] as String?,
      email: json['email'] as String?,
      phoneVerified: json['phone_verified'] as bool? ?? false,
      emailVerified: json['email_verified'] as bool? ?? false,
      status: json['status'] as String? ?? 'active',
      countryCode: json['country_code'] as String?,
      displayName: (json['profile'] as Map?)?['display_name'] as String?,
      avatarUrl: (json['profile'] as Map?)?['avatar_url'] as String?,
      hasActiveSubscription: json['has_active_subscription'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'phone': phone,
        'email': email,
        'phone_verified': phoneVerified,
        'email_verified': emailVerified,
        'status': status,
        'country_code': countryCode,
        'display_name': displayName,
        'avatar_url': avatarUrl,
        'has_active_subscription': hasActiveSubscription,
      };

  UserModel copyWith({
    String? displayName,
    String? avatarUrl,
    bool? hasActiveSubscription,
  }) =>
      UserModel(
        id: id,
        phone: phone,
        email: email,
        phoneVerified: phoneVerified,
        emailVerified: emailVerified,
        status: status,
        countryCode: countryCode,
        displayName: displayName ?? this.displayName,
        avatarUrl: avatarUrl ?? this.avatarUrl,
        hasActiveSubscription:
            hasActiveSubscription ?? this.hasActiveSubscription,
      );

  @override
  List<Object?> get props => [id, phone, email, status, hasActiveSubscription];
}

class AuthTokens {
  final String accessToken;
  final String refreshToken;
  final UserModel user;

  const AuthTokens({
    required this.accessToken,
    required this.refreshToken,
    required this.user,
  });

  factory AuthTokens.fromJson(Map<String, dynamic> json) {
    return AuthTokens(
      accessToken: json['access_token'] as String,
      refreshToken: json['refresh_token'] as String,
      user: UserModel.fromJson(json['user'] as Map<String, dynamic>),
    );
  }
}
