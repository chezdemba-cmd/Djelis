import 'package:flutter_test/flutter_test.dart';
import 'package:djelis_mobile/features/subscription/data/models/plan_model.dart';

PlanModel _plan({
  String durationType = 'month',
  int durationValue = 1,
  int priceXof = 0,
}) =>
    PlanModel(
      id: 'x',
      name: 'n',
      slug: 's',
      durationType: durationType,
      durationValue: durationValue,
      priceXof: priceXof,
    );

void main() {
  test('PlanModel.fromJson mappe les clés snake_case de l\'API', () {
    final p = PlanModel.fromJson(const {
      'id': '1',
      'name': 'Pass Mois',
      'slug': 'pass-mois',
      'duration_type': 'month',
      'duration_value': 1,
      'price_xof': 2000,
      'price_eur': 4.99,
      'countries': ['ML', 'SN'],
      'is_active': true,
      'badge': 'Populaire',
    });
    expect(p.id, '1');
    expect(p.durationType, 'month');
    expect(p.priceXof, 2000);
    expect(p.priceEur, 4.99);
    expect(p.countries, ['ML', 'SN']);
    expect(p.isActive, isTrue);
  });

  test('formattedPrice insère des séparateurs de milliers', () {
    expect(_plan(priceXof: 15000).formattedPrice, '15 000 FCFA');
    expect(_plan(priceXof: 2000).formattedPrice, '2 000 FCFA');
    expect(_plan(priceXof: 500).formattedPrice, '500 FCFA');
  });

  test('durationLabel gère les types connus', () {
    expect(_plan(durationType: 'day', durationValue: 1).durationLabel, '1 jour');
    expect(_plan(durationType: 'day', durationValue: 3).durationLabel, '3 jours');
    expect(_plan(durationType: 'weekend').durationLabel, 'Week-end');
    expect(_plan(durationType: 'month', durationValue: 1).durationLabel, '1 mois');
  });

  test('PaymentInitResponse.fromJson lit la réponse d\'initiation', () {
    final r = PaymentInitResponse.fromJson(const {
      'payment_id': 'pay_1',
      'status': 'pending',
      'redirect_url': 'https://pay.example/checkout',
      'ussd_code': null,
      'expires_at': null,
    });
    expect(r.paymentId, 'pay_1');
    expect(r.status, 'pending');
    expect(r.redirectUrl, 'https://pay.example/checkout');
    expect(r.expiresAt, isNull);
  });
}
