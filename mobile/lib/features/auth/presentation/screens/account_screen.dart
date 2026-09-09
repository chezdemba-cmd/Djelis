import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/config/app_config.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../profile/presentation/bloc/profile_bloc.dart';
import '../../../profile/presentation/bloc/profile_event.dart';
import '../../../profile/presentation/bloc/profile_state.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';

class AccountScreen extends StatelessWidget {
  const AccountScreen({super.key});

  // Pages légales publiques — domaine à confirmer avant publication Play.
  static const _privacyUrl = 'https://djelis.com/privacy';
  static const _termsUrl = 'https://djelis.com/terms';

  @override
  Widget build(BuildContext context) {
    final launchV1 = AppConfig.instance.launchModeV1;

    return BlocConsumer<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthUnauthenticated) context.go('/login');
      },
      builder: (context, state) {
        final user = state is AuthAuthenticated ? state.user : null;
        if (user == null) {
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(color: AppTheme.primaryGold),
            ),
          );
        }

        final identity = user.email ?? user.phone ?? 'Compte Djeli\'S';
        final name = user.displayName?.trim().isNotEmpty == true
            ? user.displayName!
            : identity.split('@').first;

        return Scaffold(
          appBar: AppBar(title: const Text('Mon compte')),
          body: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              CircleAvatar(
                radius: 42,
                backgroundColor: AppTheme.primaryGold,
                child: Text(
                  name.substring(0, 1).toUpperCase(),
                  style: const TextStyle(
                    color: Colors.black,
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(height: 14),
              Text(name,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.headlineSmall),
              const SizedBox(height: 4),
              Text(identity,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.white60)),
              const SizedBox(height: 28),
              BlocBuilder<ProfileBloc, ProfileState>(
                builder: (context, pstate) {
                  final selected =
                      pstate is ProfileReady ? pstate.selected : null;
                  return _AccountTile(
                    icon: Icons.switch_account_outlined,
                    title: 'Profil : ${selected?.name ?? '—'}',
                    subtitle: 'Changer ou gérer les profils',
                    onTap: () {
                      context.read<ProfileBloc>().add(const ProfileCleared());
                      context.push('/profiles');
                    },
                  );
                },
              ),
              // V1 de lancement : aucun abonnement / paiement dans l'app.
              if (!launchV1)
                _AccountTile(
                  icon: Icons.workspace_premium_outlined,
                  title: 'Abonnement',
                  subtitle: user.hasActiveSubscription
                      ? 'Abonnement actif'
                      : 'Aucun abonnement actif',
                  onTap: () => context.push('/plans'),
                ),
              if (!launchV1)
                _AccountTile(
                  icon: Icons.download_for_offline_outlined,
                  title: 'Mes téléchargements',
                  subtitle: 'Contenus disponibles hors connexion',
                  onTap: () => context.push('/downloads'),
                ),
              _AccountTile(
                icon: Icons.privacy_tip_outlined,
                title: 'Politique de confidentialité',
                subtitle: 'Comment vos données sont traitées',
                onTap: () => _open(context, _privacyUrl),
              ),
              _AccountTile(
                icon: Icons.description_outlined,
                title: "Conditions d'utilisation",
                subtitle: 'CGU de Djeli\'S',
                onTap: () => _open(context, _termsUrl),
              ),
              const SizedBox(height: 16),
              OutlinedButton.icon(
                onPressed: () => _confirmLogout(context),
                icon: const Icon(Icons.logout),
                label: const Text('Se déconnecter'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.redAccent,
                  side: const BorderSide(color: Colors.redAccent),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () => _confirmDelete(context),
                child: const Text('Supprimer mon compte',
                    style: TextStyle(color: Colors.white38)),
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _open(BuildContext context, String url) async {
    final uri = Uri.parse(url);
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Impossible d'ouvrir la page.")),
        );
      }
    }
  }

  Future<void> _confirmLogout(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Se déconnecter ?'),
        content: const Text('Vous devrez saisir vos identifiants à nouveau.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: const Text('Annuler'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(dialogContext, true),
            child: const Text('Se déconnecter'),
          ),
        ],
      ),
    );
    if (confirmed == true && context.mounted) {
      context.read<AuthBloc>().add(const AuthLogout());
    }
  }

  Future<void> _confirmDelete(BuildContext context) async {
    // 1re confirmation
    final step1 = await showDialog<bool>(
      context: context,
      builder: (c) => AlertDialog(
        title: const Text('Supprimer votre compte ?'),
        content: const Text(
          'Cette action est définitive. Votre compte, vos profils, vos favoris '
          'et votre historique d\'écoute seront supprimés. Les informations de '
          'paiement légalement obligatoires sont conservées de façon anonymisée.',
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(c, false),
              child: const Text('Annuler')),
          TextButton(
            onPressed: () => Navigator.pop(c, true),
            child: const Text('Continuer',
                style: TextStyle(color: Colors.redAccent)),
          ),
        ],
      ),
    );
    if (step1 != true || !context.mounted) return;

    // 2e confirmation explicite
    final step2 = await showDialog<bool>(
      context: context,
      builder: (c) => AlertDialog(
        title: const Text('Confirmer la suppression'),
        content: const Text(
          'Dernière étape. Voulez-vous vraiment supprimer définitivement votre '
          'compte Djeli\'S ? Cette action est irréversible.',
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(c, false),
              child: const Text('Non, garder mon compte')),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: Colors.redAccent),
            onPressed: () => Navigator.pop(c, true),
            child: const Text('Supprimer définitivement'),
          ),
        ],
      ),
    );
    if (step2 == true && context.mounted) {
      context.read<AuthBloc>().add(const AuthDeleteAccount());
    }
  }
}

class _AccountTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _AccountTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Icon(icon, color: AppTheme.primaryGold),
        title: Text(title),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
