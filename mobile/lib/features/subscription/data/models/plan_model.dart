import 'package:equatable/equatable.dart';

class PlanModel extends Equatable {
  final String id;
  final String name;
  final String slug;
  final String durationType; // 'day', 'weekend', 'week', 'month'
  final int durationValue;
  final int priceXof;
  final double? priceEur;
  final List<String> countries;
  final bool isActive;
  final String? badge; // 'Populaire', 'Meilleur Prix', etc.

  const PlanModel({
    required this.id,
    required this.name,
    required this.slug,
    required this.durationType,
    required this.durationValue,
    required this.priceXof,
    this.priceEur,
    this.countries = const [],
    this.isActive = true,
    this.badge,
  });

  factory PlanModel.fromJson(Map<String, dynamic> json) => PlanModel(
        id: json['id'] as String,
        name: json['name'] as String,
        slug: json['slug'] as String,
        durationType: json['duration_type'] as String,
        durationValue: json['duration_value'] as int? ?? 1,
        priceXof: json['price_xof'] as int,
        priceEur: (json['price_eur'] as num?)?.toDouble(),
        countries: (json['countries'] as List<dynamic>?)
                ?.map((e) => e as String)
                .toList() ??
            [],
        isActive: json['is_active'] as bool? ?? true,
        badge: json['badge'] as String?,
      );

  String get formattedPrice => '${priceXof.toString().replaceAllMapped(
        RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
        (m) => '${m[1]} ',
      )} FCFA';

  String get durationLabel {
    switch (durationType) {
      case 'day':
        return '$durationValue jour${durationValue > 1 ? 's' : ''}';
      case 'weekend':
        return 'Week-end';
      case 'week':
        return '$durationValue semaine${durationValue > 1 ? 's' : ''}';
      case 'month':
        return '$durationValue mois';
      default:
        return durationType;
    }
  }

  @override
  List<Object?> get props => [id, slug, priceXof];
}

class PaymentInitResponse {
  final String paymentId;
  final String status;
  final String? redirectUrl;
  final String? ussdCode;
  final DateTime? expiresAt;

  const PaymentInitResponse({
    required this.paymentId,
    required this.status,
    this.redirectUrl,
    this.ussdCode,
    this.expiresAt,
  });

  factory PaymentInitResponse.fromJson(Map<String, dynamic> json) =>
      PaymentInitResponse(
        paymentId: json['payment_id'] as String,
        status: json['status'] as String,
        redirectUrl: json['redirect_url'] as String?,
        ussdCode: json['ussd_code'] as String?,
        expiresAt: json['expires_at'] != null
            ? DateTime.tryParse(json['expires_at'] as String)
            : null,
      );
}

// ─── Mock plans for development ───────────────────────────────────────────────

List<PlanModel> mockPlans() => [
      const PlanModel(
        id: 'plan-day',
        name: 'Pass Jour',
        slug: 'pass-day',
        durationType: 'day',
        durationValue: 1,
        priceXof: 500,
        countries: ['ML', 'SN', 'CI'],
        badge: 'Rapide',
      ),
      const PlanModel(
        id: 'plan-weekend',
        name: 'Pass Week-end',
        slug: 'pass-weekend',
        durationType: 'weekend',
        durationValue: 3,
        priceXof: 1000,
        countries: ['ML', 'SN', 'CI'],
        badge: 'Populaire',
      ),
      const PlanModel(
        id: 'plan-month',
        name: 'Pass Mois',
        slug: 'pass-month',
        durationType: 'month',
        durationValue: 1,
        priceXof: 3000,
        priceEur: 4.99,
        countries: ['ML', 'SN', 'CI', 'FR'],
        badge: 'Meilleur Prix',
      ),
    ];
