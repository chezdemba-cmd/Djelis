import 'package:equatable/equatable.dart';

abstract class SubscriptionEvent extends Equatable {
  const SubscriptionEvent();
  @override
  List<Object?> get props => [];
}

class SubscriptionLoadPlans extends SubscriptionEvent {
  final String? countryCode;
  const SubscriptionLoadPlans({this.countryCode});
  @override
  List<Object?> get props => [countryCode];
}

class SubscriptionInitiatePayment extends SubscriptionEvent {
  final String planId;
  final String provider;
  final String? phone;
  final String? promoCode;
  const SubscriptionInitiatePayment({
    required this.planId,
    required this.provider,
    this.phone,
    this.promoCode,
  });
  @override
  List<Object?> get props => [planId, provider];
}

class SubscriptionCheckStatus extends SubscriptionEvent {
  final String paymentId;
  const SubscriptionCheckStatus(this.paymentId);
  @override
  List<Object?> get props => [paymentId];
}
