import 'package:equatable/equatable.dart';

class ProfileModel extends Equatable {
  final String id;
  final String name;
  final String? avatarUrl;
  final bool isChild;

  const ProfileModel({
    required this.id,
    required this.name,
    this.avatarUrl,
    this.isChild = false,
  });

  factory ProfileModel.fromJson(Map<String, dynamic> json) => ProfileModel(
        id: json['id'] as String,
        name: (json['name'] as String?) ?? 'Profil',
        avatarUrl: json['avatarUrl'] as String? ?? json['avatar_url'] as String?,
        isChild: (json['isChild'] as bool?) ??
            (json['is_child'] as bool?) ??
            false,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'avatarUrl': avatarUrl,
        'isChild': isChild,
      };

  @override
  List<Object?> get props => [id, name, avatarUrl, isChild];
}

/// Vrai si le classement d'âge convient à un profil Jeunesse.
/// Bloque toute mention 12 / 13 / 16 / 18 (et variantes -12, R, MA…).
bool isKidsFriendly(String? age) {
  if (age == null || age.isEmpty) return true;
  final a = age.toLowerCase().replaceAll(RegExp(r'\s'), '');
  const blocked = {
    '12+',
    '-12',
    '13+',
    '16+',
    '-16',
    '18+',
    '-18',
    'r',
    'nc-17',
    'ma',
    'tv-ma',
  };
  if (blocked.contains(a)) return false;
  return !RegExp(r'1[2368]').hasMatch(a);
}
