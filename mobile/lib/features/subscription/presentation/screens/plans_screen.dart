import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/models/plan_model.dart';
import '../bloc/subscription_bloc.dart';
import '../bloc/subscription_event.dart';
import '../bloc/subscription_state.dart';

class PlansScreen extends StatefulWidget {
  const PlansScreen({super.key});

  @override
  State<PlansScreen> createState() => _PlansScreenState();
}

class _PlansScreenState extends State<PlansScreen> {
  @override
  void initState() {
    super.initState();
    context.read<SubscriptionBloc>().add(const SubscriptionLoadPlans());
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<SubscriptionBloc, SubscriptionState>(
      listener: (context, state) {
        if (state is SubscriptionPaymentSuccess) {
          _onPaymentSuccess();
        } else if (state is SubscriptionPaymentFailed) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(state.message),
            backgroundColor: AppTheme.accentCrimson,
          ));
        }
      },
      child: Scaffold(
        backgroundColor: AppTheme.darkBackground,
        appBar: AppBar(
          title: const Text(
            "Formules d'abonnement",
            style: TextStyle(
                color: AppTheme.primaryGold, fontWeight: FontWeight.bold),
          ),
          backgroundColor: Colors.transparent,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () => Navigator.of(context).pop(),
          ),
        ),
        body: BlocBuilder<SubscriptionBloc, SubscriptionState>(
          builder: (context, state) {
            if (state is SubscriptionLoading || state is SubscriptionInitial) {
              return const Center(
                child: CircularProgressIndicator(color: AppTheme.primaryGold),
              );
            }
            if (state is SubscriptionError) {
              return _buildError(context, state.message);
            }

            final plans = state is SubscriptionPlansLoaded
                ? state.plans
                : mockPlans();

            return SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Choisissez votre accès',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    "Profitez de DjaaSoo & DjeliSon sans limites. Pas d'engagement, annulez quand vous voulez.",
                    style: TextStyle(color: Colors.grey, fontSize: 13),
                  ),
                  const SizedBox(height: 24),

                  // Plan cards
                  ...plans.map((plan) => _PlanCard(
                        plan: plan,
                        onSubscribe: () => _showPaymentSheet(context, plan),
                      )),

                  const SizedBox(height: 24),

                  // FAQ rapide
                  _buildFaq(),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  void _showPaymentSheet(BuildContext context, PlanModel plan) {
    // BlocProvider.value passes the existing BLoC into the new modal route context.
    final bloc = context.read<SubscriptionBloc>();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.darkSurface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => BlocProvider.value(
        value: bloc,
        child: _PaymentSheet(plan: plan),
      ),
    );
  }

  void _onPaymentSuccess() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Row(children: [
          Icon(Icons.check_circle, color: Colors.white),
          SizedBox(width: 12),
          Text('Abonnement activé avec succès ! Bienvenue.',
              style: TextStyle(fontWeight: FontWeight.bold)),
        ]),
        backgroundColor: Color(0xFF2E7D32),
        duration: Duration(seconds: 4),
      ),
    );
    if (Navigator.canPop(context)) Navigator.of(context).pop();
  }

  Widget _buildError(BuildContext context, String message) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, color: Colors.white38, size: 48),
          const SizedBox(height: 16),
          const Text('Impossible de charger les offres',
              style: TextStyle(color: Colors.white70)),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => context
                .read<SubscriptionBloc>()
                .add(const SubscriptionLoadPlans()),
            style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryGold),
            child: const Text('Réessayer',
                style: TextStyle(color: Colors.black)),
          ),
        ],
      ),
    );
  }

  Widget _buildFaq() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.darkSurface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Questions fréquentes',
              style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 14)),
          const SizedBox(height: 12),
          _faqItem('Puis-je annuler ?',
              "Oui, à tout moment depuis votre profil. L'accès reste actif jusqu'à l'expiration."),
          _faqItem('Quels modes de paiement ?',
              'Orange Money, Wave, Moov, MTN, carte bancaire (Stripe) pour la diaspora.'),
          _faqItem('Données personnelles ?',
              'Vos informations sont protégées conformément au RGPD.'),
        ],
      ),
    );
  }

  Widget _faqItem(String q, String a) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(q,
              style: const TextStyle(
                  color: Colors.white70,
                  fontWeight: FontWeight.bold,
                  fontSize: 12)),
          const SizedBox(height: 3),
          Text(a,
              style: const TextStyle(color: Colors.white38, fontSize: 11)),
        ],
      ),
    );
  }
}

// ─── Plan card ────────────────────────────────────────────────────────────────

class _PlanCard extends StatelessWidget {
  final PlanModel plan;
  final VoidCallback onSubscribe;

  const _PlanCard({required this.plan, required this.onSubscribe});

  @override
  Widget build(BuildContext context) {
    final isHighlighted = plan.badge == 'Populaire' || plan.badge == 'Meilleur Prix';

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppTheme.darkSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isHighlighted
              ? AppTheme.primaryGold.withOpacity(0.4)
              : Colors.white.withOpacity(0.08),
          width: isHighlighted ? 1.5 : 1,
        ),
        boxShadow: isHighlighted
            ? [
                BoxShadow(
                  color: AppTheme.primaryGold.withOpacity(0.08),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                )
              ]
            : null,
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  plan.name,
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold),
                ),
                if (plan.badge != null)
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryGold.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      plan.badge!,
                      style: const TextStyle(
                          color: AppTheme.primaryGold,
                          fontSize: 10,
                          fontWeight: FontWeight.bold),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              plan.durationLabel,
              style: const TextStyle(color: Colors.white54, fontSize: 12),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      plan.formattedPrice,
                      style: const TextStyle(
                          color: AppTheme.primaryGold,
                          fontSize: 22,
                          fontWeight: FontWeight.bold),
                    ),
                    if (plan.priceEur != null)
                      Text(
                        '≈ ${plan.priceEur!.toStringAsFixed(2)} €',
                        style: const TextStyle(
                            color: Colors.white38, fontSize: 11),
                      ),
                  ],
                ),
                ElevatedButton(
                  onPressed: onSubscribe,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isHighlighted
                        ? AppTheme.primaryGold
                        : Colors.white,
                    foregroundColor: Colors.black,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text("S'abonner",
                      style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Payment bottom sheet ─────────────────────────────────────────────────────

class _PaymentSheet extends StatefulWidget {
  final PlanModel plan;
  const _PaymentSheet({required this.plan});

  @override
  State<_PaymentSheet> createState() => _PaymentSheetState();
}

class _PaymentSheetState extends State<_PaymentSheet> {
  final _phoneController = TextEditingController();
  String _selectedProvider = '';
  bool _showPhoneField = false;

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  void _selectProvider(String provider, {bool needsPhone = false}) {
    setState(() {
      _selectedProvider = provider;
      _showPhoneField = needsPhone;
    });
  }

  void _confirm() {
    if (_showPhoneField && _phoneController.text.length < 8) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Entrez un numéro valide'),
      ));
      return;
    }
    // Keep the sheet open — it shows USSD code while pending.
    // BlocListener below closes it on success or failure.
    context.read<SubscriptionBloc>().add(SubscriptionInitiatePayment(
          planId: widget.plan.id,
          provider: _selectedProvider,
          phone: _showPhoneField ? _phoneController.text.trim() : null,
        ));
  }

  void _launchPaymentUrl(String url) async {
    final uri = Uri.parse(url);
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text("Impossible d'ouvrir le lien de paiement"),
            backgroundColor: AppTheme.accentCrimson,
          ));
        }
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text("Erreur lors de l'ouverture du lien de paiement"),
          backgroundColor: AppTheme.accentCrimson,
        ));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<SubscriptionBloc, SubscriptionState>(
      listener: (context, state) {
        if (state is SubscriptionPaymentSuccess ||
            state is SubscriptionPaymentFailed) {
          if (Navigator.canPop(context)) Navigator.of(context).pop();
        } else if (state is SubscriptionPaymentPending && state.redirectUrl != null) {
          _launchPaymentUrl(state.redirectUrl!);
        }
      },
      child: Padding(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Handle
          Center(
            child: Container(
              width: 36,
              height: 4,
              margin: const EdgeInsets.only(bottom: 20),
              decoration: BoxDecoration(
                  color: Colors.white24,
                  borderRadius: BorderRadius.circular(2)),
            ),
          ),

          Text(
            'Payer — ${widget.plan.name}',
            style: const TextStyle(
                color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            widget.plan.formattedPrice,
            style: const TextStyle(
                color: AppTheme.primaryGold,
                fontSize: 15,
                fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 20),

          // ── Provider buttons ─────────────────────────────────────────────────
          _providerTile(
            label: 'Wave',
            subtitle: 'Paiement en 1 clic',
            icon: Icons.waves,
            color: const Color(0xFF1E88E5),
            provider: 'wave',
            needsPhone: true,
          ),
          const SizedBox(height: 10),
          _providerTile(
            label: 'Orange Money',
            subtitle: 'Orange Money Mali / Sénégal / CI',
            icon: Icons.phone_android,
            color: const Color(0xFFE65100),
            provider: 'cinetpay',
            needsPhone: true,
          ),
          const SizedBox(height: 10),
          _providerTile(
            label: 'Mobile Money (MTN / Moov / Airtel)',
            subtitle: 'Autres opérateurs',
            icon: Icons.account_balance_wallet_outlined,
            color: AppTheme.primaryGold,
            provider: 'flutterwave',
            needsPhone: true,
          ),
          const SizedBox(height: 10),
          _providerTile(
            label: 'Carte bancaire (Visa / Mastercard)',
            subtitle: 'Via Stripe — pour la diaspora',
            icon: Icons.credit_card,
            color: Colors.white24,
            provider: 'stripe',
            needsPhone: false,
          ),

          // ── Phone input ───────────────────────────────────────────────────────
          if (_showPhoneField) ...[
            const SizedBox(height: 16),
            TextFormField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              decoration: const InputDecoration(
                labelText: 'Numéro de téléphone',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.phone),
                prefixText: '+223 ',
              ),
            ),
          ],

          const SizedBox(height: 20),

          // ── Confirm button ────────────────────────────────────────────────────
          if (_selectedProvider.isNotEmpty)
            BlocBuilder<SubscriptionBloc, SubscriptionState>(
              builder: (context, state) {
                final isLoading = state is SubscriptionLoading;
                return ElevatedButton(
                  onPressed: isLoading ? null : _confirm,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryGold,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8)),
                  ),
                  child: isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.black),
                        )
                      : const Text(
                          'Confirmer le paiement',
                          style: TextStyle(
                              fontSize: 15, fontWeight: FontWeight.bold),
                        ),
                );
              },
            ),

          // ── Pending state (USSD code displayed) ───────────────────────────────
          BlocBuilder<SubscriptionBloc, SubscriptionState>(
            builder: (context, state) {
              if (state is SubscriptionPaymentPending && state.ussdCode != null) {
                return Container(
                  margin: const EdgeInsets.only(top: 16),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryGold.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                        color: AppTheme.primaryGold.withOpacity(0.3)),
                  ),
                  child: Column(
                    children: [
                      const Text(
                        'Composez ce code USSD pour valider :',
                        style: TextStyle(color: Colors.white70, fontSize: 12),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        state.ussdCode!,
                        style: const TextStyle(
                          color: AppTheme.primaryGold,
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 2,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          SizedBox(
                              width: 14,
                              height: 14,
                              child: CircularProgressIndicator(
                                  strokeWidth: 1.5,
                                  color: AppTheme.primaryGold)),
                          SizedBox(width: 8),
                          Text(
                            'En attente de confirmation…',
                            style: TextStyle(
                                color: Colors.white54, fontSize: 11),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              }
              return const SizedBox.shrink();
            },
          ),
        ],
      ),
      ),    // Padding
    );      // BlocListener
  }

  Widget _providerTile({
    required String label,
    required String subtitle,
    required IconData icon,
    required Color color,
    required String provider,
    required bool needsPhone,
  }) {
    final isSelected = _selectedProvider == provider;
    return GestureDetector(
      onTap: () => _selectProvider(provider, needsPhone: needsPhone),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected
              ? color.withOpacity(0.15)
              : AppTheme.darkCard,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? color : Colors.white12,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(icon, color: isSelected ? color : Colors.white54, size: 22),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: TextStyle(
                      color: isSelected ? Colors.white : Colors.white70,
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                  Text(subtitle,
                      style: const TextStyle(
                          color: Colors.white38, fontSize: 11)),
                ],
              ),
            ),
            if (isSelected)
              Icon(Icons.check_circle, color: color, size: 20),
          ],
        ),
      ),
    );
  }
}
