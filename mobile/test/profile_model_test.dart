import 'package:flutter_test/flutter_test.dart';
import 'package:djelis_mobile/features/profile/data/models/profile_model.dart';

void main() {
  group('ProfileModel.fromJson', () {
    test('lit les champs camelCase', () {
      final p = ProfileModel.fromJson(const {
        'id': 'p1',
        'name': 'Awa',
        'avatarUrl': 'http://cdn/a.png',
        'isChild': true,
      });
      expect(p.id, 'p1');
      expect(p.name, 'Awa');
      expect(p.avatarUrl, 'http://cdn/a.png');
      expect(p.isChild, isTrue);
    });

    test('accepte le snake_case renvoyé par le backend', () {
      final p = ProfileModel.fromJson(const {
        'id': 'p2',
        'name': 'Jeunesse',
        'avatar_url': 'u',
        'is_child': true,
      });
      expect(p.avatarUrl, 'u');
      expect(p.isChild, isTrue);
    });

    test('applique des valeurs par défaut sûres si des champs manquent', () {
      final p = ProfileModel.fromJson(const {'id': 'p3'});
      expect(p.name, 'Profil');
      expect(p.avatarUrl, isNull);
      expect(p.isChild, isFalse);
    });

    test('toJson/fromJson est un aller-retour stable (Equatable)', () {
      const original = ProfileModel(id: 'x', name: 'N', avatarUrl: 'a');
      final roundTripped = ProfileModel.fromJson(original.toJson());
      expect(roundTripped, equals(original));
    });
  });

  group('isKidsFriendly', () {
    test('null ou vide => autorisé', () {
      expect(isKidsFriendly(null), isTrue);
      expect(isKidsFriendly(''), isTrue);
    });

    test('les classements adultes sont bloqués', () {
      for (final rating in ['12+', '-12', '13+', '16+', '18+', 'R', 'TV-MA', 'NC-17']) {
        expect(isKidsFriendly(rating), isFalse, reason: rating);
      }
    });

    test('les classements tout public sont autorisés', () {
      for (final rating in ['G', 'Tous publics', '6+', '10+', 'U']) {
        expect(isKidsFriendly(rating), isTrue, reason: rating);
      }
    });
  });
}
