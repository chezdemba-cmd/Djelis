import '../../../../core/network/api_client.dart';
import '../models/plan_model.dart';

class SubscriptionRepository {
  final ApiClient _api;

  SubscriptionRepository({required ApiClient api}) : _api = api;

  Future<List<PlanModel>> getPlans({String? countryCode}) async {
    final data = await _api.get<List<dynamic>>(
      '/plans',
      queryParameters: countryCode != null ? {'country': countryCode} : null,
    );
    return data
        .map((e) => PlanModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<PaymentInitResponse> initiatePayment({
    required String planId,
    required String provider, // 'cinetpay', 'paydunya', 'flutterwave', 'stripe'
    String? phone,
    String? promoCode,
  }) async {
    final data = await _api.post<Map<String, dynamic>>(
      '/payment/initiate',
      data: {
        'plan_id': planId,
        'provider': provider,
        if (phone != null) 'phone': phone,
        if (promoCode != null) 'promo_code': promoCode,
      },
    );
    return PaymentInitResponse.fromJson(data);
  }

  Future<String> checkPaymentStatus(String paymentId) async {
    final data = await _api.get<Map<String, dynamic>>(
      '/payment/status/$paymentId',
    );
    return data['status'] as String;
  }

  Future<bool> validatePromoCode({
    required String code,
    required String planId,
  }) async {
    try {
      final data = await _api.post<Map<String, dynamic>>(
        '/payment/promo/validate',
        data: {'code': code, 'plan_id': planId},
      );
      return data['valid'] as bool? ?? false;
    } catch (_) {
      return false;
    }
  }
}
