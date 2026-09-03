import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_theme.dart';
import '../../data/models/profile_model.dart';
import '../bloc/profile_bloc.dart';
import '../bloc/profile_event.dart';
import '../bloc/profile_state.dart';

class ProfileSelectionScreen extends StatefulWidget {
  const ProfileSelectionScreen({super.key});

  @override
  State<ProfileSelectionScreen> createState() => _ProfileSelectionScreenState();
}

class _ProfileSelectionScreenState extends State<ProfileSelectionScreen> {
  bool _manageMode = false;
  bool _picking = false;

  static const _colors = [
    Color(0xFFFFB300),
    Color(0xFFFF4081),
    Color(0xFF00E5FF),
    Color(0xFF4CAF50),
    Color(0xFF9C27B0),
  ];

  @override
  void initState() {
    super.initState();
    context.read<ProfileBloc>().add(const ProfileLoad());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBackground,
      body: SafeArea(
        child: BlocConsumer<ProfileBloc, ProfileState>(
          listener: (context, state) {
            if (_picking && state is ProfileReady && state.selected != null) {
              context.go('/');
            }
          },
          builder: (context, state) {
            if (state is ProfileLoading || state is ProfileInitial) {
              return const Center(
                child: CircularProgressIndicator(color: AppTheme.primaryGold),
              );
            }
            if (state is ProfileError) {
              return _error(context, state.message);
            }
            final ready = state as ProfileReady;
            return _grid(context, ready.profiles);
          },
        ),
      ),
    );
  }

  Widget _error(BuildContext context, String message) => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, color: Colors.white38, size: 48),
            const SizedBox(height: 12),
            const Text('Impossible de charger les profils',
                style: TextStyle(color: Colors.white70)),
            const SizedBox(height: 4),
            Text(message,
                style: const TextStyle(color: Colors.white38, fontSize: 12)),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () =>
                  context.read<ProfileBloc>().add(const ProfileLoad()),
              style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryGold),
              child: const Text('Réessayer',
                  style: TextStyle(color: Colors.black)),
            ),
          ],
        ),
      );

  Widget _grid(BuildContext context, List<ProfileModel> profiles) {
    return Column(
      children: [
        const SizedBox(height: 40),
        Text(
          _manageMode ? 'Gérer les profils' : 'Qui regarde ?',
          style: const TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.w500),
        ),
        const SizedBox(height: 32),
        Expanded(
          child: Center(
            child: Wrap(
              alignment: WrapAlignment.center,
              spacing: 24,
              runSpacing: 24,
              children: [
                for (final p in profiles) _tile(context, p),
                _addTile(context),
              ],
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(bottom: 32),
          child: OutlinedButton(
            onPressed: () => setState(() => _manageMode = !_manageMode),
            style: OutlinedButton.styleFrom(
              foregroundColor: Colors.white70,
              side: const BorderSide(color: Colors.white24),
              padding:
                  const EdgeInsets.symmetric(horizontal: 28, vertical: 12),
            ),
            child: Text(_manageMode ? 'Terminé' : 'Gérer les profils'),
          ),
        ),
      ],
    );
  }

  Widget _tile(BuildContext context, ProfileModel p) {
    final color = _colors[p.name.hashCode.abs() % _colors.length];
    return GestureDetector(
      onTap: () {
        if (_manageMode) {
          _openEdit(context, p);
        } else {
          setState(() => _picking = true);
          context.read<ProfileBloc>().add(ProfileSelected(p));
        }
      },
      child: SizedBox(
        width: 110,
        child: Column(
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Stack(
                children: [
                  const Center(
                    child: Icon(Icons.person, color: Colors.white, size: 52),
                  ),
                  if (_manageMode)
                    Container(
                      color: Colors.black45,
                      child: const Center(
                        child: Icon(Icons.edit, color: Colors.white, size: 32),
                      ),
                    ),
                  if (p.isChild)
                    Positioned(
                      bottom: 0,
                      left: 0,
                      right: 0,
                      child: Container(
                        color: Colors.black26,
                        padding: const EdgeInsets.symmetric(vertical: 2),
                        child: const Text(
                          'Jeunesse',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              p.name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: Colors.white70),
            ),
          ],
        ),
      ),
    );
  }

  Widget _addTile(BuildContext context) => GestureDetector(
        onTap: () => _openEdit(context, null),
        child: SizedBox(
          width: 110,
          child: Column(
            children: [
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.white24),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Center(
                  child: Icon(Icons.add, color: Colors.white54, size: 44),
                ),
              ),
              const SizedBox(height: 8),
              const Text('Ajouter', style: TextStyle(color: Colors.white54)),
            ],
          ),
        ),
      );

  void _openEdit(BuildContext context, ProfileModel? existing) {
    final bloc = context.read<ProfileBloc>();
    final nameCtrl = TextEditingController(text: existing?.name ?? '');
    bool isChild = existing?.isChild ?? false;
    final canDelete = existing != null &&
        (bloc.state is ProfileReady) &&
        (bloc.state as ProfileReady).profiles.length > 1;

    showModalBottomSheet(
      context: context,
      backgroundColor: AppTheme.darkSurface,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheet) => Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                existing == null ? 'Ajouter un profil' : 'Modifier le profil',
                style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: nameCtrl,
                autofocus: true,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(
                  hintText: 'Nom du profil',
                  hintStyle: TextStyle(color: Colors.white38),
                  filled: true,
                  fillColor: Colors.white10,
                ),
              ),
              const SizedBox(height: 8),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                activeThumbColor: AppTheme.primaryGold,
                title: const Text('Profil Jeunesse',
                    style: TextStyle(color: Colors.white)),
                subtitle: const Text(
                  'Ne montrer que les contenus adaptés aux enfants',
                  style: TextStyle(color: Colors.white38, fontSize: 12),
                ),
                value: isChild,
                onChanged: (v) => setSheet(() => isChild = v),
              ),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: () {
                  final name = nameCtrl.text.trim();
                  if (name.isEmpty) return;
                  if (existing == null) {
                    bloc.add(ProfileCreated(name: name, isChild: isChild));
                  } else {
                    bloc.add(ProfileUpdated(
                        id: existing.id, name: name, isChild: isChild));
                  }
                  Navigator.pop(ctx);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryGold,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                child: const Text('Enregistrer',
                    style: TextStyle(
                        color: Colors.black, fontWeight: FontWeight.bold)),
              ),
              if (canDelete) ...[
                const SizedBox(height: 8),
                TextButton(
                  onPressed: () {
                    bloc.add(ProfileDeleted(existing.id));
                    Navigator.pop(ctx);
                  },
                  child: const Text('Supprimer ce profil',
                      style: TextStyle(color: Colors.redAccent)),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
