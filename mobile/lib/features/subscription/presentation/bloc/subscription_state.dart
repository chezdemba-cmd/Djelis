import 'package:equatable/equatable.dart';
import '../../data/models/plan_model.dart';

abstract class SubscriptionState extends Equatable {
  const SubscriptionState();
  @override
  List<Object?> get props => [];
}

class SubscriptionInitial extends SubscriptionState {
  const SubscriptionInitial();
}

class SubscriptionLoading extends SubscriptionState {
  const SubscriptionLoading();
}

class SubscriptionPlansLoaded extends SubscriptionState {
  final List<PlanModel> plans;
  const SubscriptionPlansLoaded(this.plans);
  @override
  List<Object?> get props => [plans];
}

class SubscriptionPaymentPending extends SubscriptionState {
  final String paymentId;
  final String? ussdCode;
  final String? redirectUrl;
  const SubscriptionPaymentPending({
    required this.paymentId,
    this.ussdCode,
    this.redirectUrl,
  });
  @override
  List<Object?> get props => [paymentId];
}

class SubscriptionPaymentSuccess extends SubscriptionState {
  const SubscriptionPaymentSuccess();
}

class SubscriptionPaymentFailed extends SubscriptionState {
  final String message;
  const SubscriptionPaymentFailed(this.message);
  @override
  List<Object?> get props => [message];
}

class SubscriptionError extends SubscriptionState {
  final String message;
  const SubscriptionError(this.message);
  @override
  List<Object?> get props => [message];
}
