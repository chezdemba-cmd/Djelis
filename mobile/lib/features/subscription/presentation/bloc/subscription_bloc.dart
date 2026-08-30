import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/repositories/subscription_repository.dart';
import 'subscription_event.dart';
import 'subscription_state.dart';

class SubscriptionBloc extends Bloc<SubscriptionEvent, SubscriptionState> {
  final SubscriptionRepository _repository;
  Timer? _pollTimer;

  SubscriptionBloc({required SubscriptionRepository repository})
      : _repository = repository,
        super(const SubscriptionInitial()) {
    on<SubscriptionLoadPlans>(_onLoadPlans);
    on<SubscriptionInitiatePayment>(_onInitiatePayment);
    on<SubscriptionCheckStatus>(_onCheckStatus);
  }

  Future<void> _onLoadPlans(
      SubscriptionLoadPlans event, Emitter<SubscriptionState> emit) async {
    emit(const SubscriptionLoading());
    try {
      final plans = await _repository.getPlans(countryCode: event.countryCode);
      emit(SubscriptionPlansLoaded(plans));
    } catch (e) {
      emit(SubscriptionError(e.toString()));
    }
  }

  Future<void> _onInitiatePayment(SubscriptionInitiatePayment event,
      Emitter<SubscriptionState> emit) async {
    emit(const SubscriptionLoading());
    try {
      final response = await _repository.initiatePayment(
        planId: event.planId,
        provider: event.provider,
        phone: event.phone,
        promoCode: event.promoCode,
      );
      emit(SubscriptionPaymentPending(
        paymentId: response.paymentId,
        ussdCode: response.ussdCode,
        redirectUrl: response.redirectUrl,
      ));
      // Poll for payment status every 4 seconds, up to 2 minutes.
      _startPolling(response.paymentId);
    } catch (e) {
      emit(SubscriptionPaymentFailed(e.toString()));
    }
  }

  Future<void> _onCheckStatus(
      SubscriptionCheckStatus event, Emitter<SubscriptionState> emit) async {
    try {
      final status = await _repository.checkPaymentStatus(event.paymentId);
      if (status == 'success' || status == 'successful') {
        _pollTimer?.cancel();
        emit(const SubscriptionPaymentSuccess());
      } else if (status == 'failed') {
        _pollTimer?.cancel();
        emit(const SubscriptionPaymentFailed('Paiement refusé'));
      }
      // 'pending' → keep polling
    } catch (_) {
      // Ignore transient errors during polling
    }
  }

  void _startPolling(String paymentId) {
    _pollTimer?.cancel();
    var attempts = 0;
    _pollTimer = Timer.periodic(const Duration(seconds: 4), (_) {
      attempts++;
      if (attempts > 30) {
        // 2 minutes timeout
        _pollTimer?.cancel();
        add(const SubscriptionCheckStatus('timeout'));
        return;
      }
      add(SubscriptionCheckStatus(paymentId));
    });
  }

  @override
  Future<void> close() {
    _pollTimer?.cancel();
    return super.close();
  }
}
