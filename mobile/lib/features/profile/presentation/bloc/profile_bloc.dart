import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/errors/app_exception.dart';
import '../../data/models/profile_model.dart';
import '../../data/repositories/profile_repository.dart';
import 'profile_event.dart';
import 'profile_state.dart';

class ProfileBloc extends Bloc<ProfileEvent, ProfileState> {
  final ProfileRepository _repository;

  ProfileBloc({required ProfileRepository repository})
      : _repository = repository,
        super(const ProfileInitial()) {
    on<ProfileLoad>(_onLoad);
    on<ProfileSelected>(_onSelected);
    on<ProfileCleared>(_onCleared);
    on<ProfileCreated>(_onCreated);
    on<ProfileUpdated>(_onUpdated);
    on<ProfileDeleted>(_onDeleted);
  }

  Future<void> _onLoad(ProfileLoad event, Emitter<ProfileState> emit) async {
    emit(const ProfileLoading());
    try {
      final profiles = await _repository.list();
      final stored = await _repository.getSelected();
      // Ne garde la sélection que si le profil existe toujours.
      ProfileModel? selected;
      if (stored != null) {
        for (final p in profiles) {
          if (p.id == stored.id) {
            selected = p;
            break;
          }
        }
      }
      if (selected == null) {
        await _repository.clearSelected();
      } else {
        await _repository.setSelected(selected);
      }
      emit(ProfileReady(profiles: profiles, selected: selected));
    } on AppException catch (e) {
      emit(ProfileError(e.message));
    } catch (e) {
      emit(ProfileError(e.toString()));
    }
  }

  Future<void> _onSelected(
      ProfileSelected event, Emitter<ProfileState> emit) async {
    await _repository.setSelected(event.profile);
    final s = state;
    if (s is ProfileReady) {
      emit(s.copyWith(selected: event.profile));
    } else {
      emit(ProfileReady(profiles: [event.profile], selected: event.profile));
    }
  }

  Future<void> _onCleared(
      ProfileCleared event, Emitter<ProfileState> emit) async {
    await _repository.clearSelected();
    final s = state;
    if (s is ProfileReady) emit(s.copyWith(clearSelected: true));
  }

  Future<void> _onCreated(
      ProfileCreated event, Emitter<ProfileState> emit) async {
    try {
      await _repository.create(name: event.name, isChild: event.isChild);
      add(const ProfileLoad());
    } catch (_) {
      // La liste sera rechargée; on ignore l'échec silencieusement ici.
      add(const ProfileLoad());
    }
  }

  Future<void> _onUpdated(
      ProfileUpdated event, Emitter<ProfileState> emit) async {
    try {
      await _repository.update(event.id,
          name: event.name, isChild: event.isChild);
    } finally {
      add(const ProfileLoad());
    }
  }

  Future<void> _onDeleted(
      ProfileDeleted event, Emitter<ProfileState> emit) async {
    final s = state;
    if (s is ProfileReady && s.profiles.length <= 1) return;
    try {
      await _repository.delete(event.id);
      if (s is ProfileReady && s.selected?.id == event.id) {
        await _repository.clearSelected();
      }
    } finally {
      add(const ProfileLoad());
    }
  }
}
