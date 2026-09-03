import 'package:equatable/equatable.dart';
import '../../data/models/profile_model.dart';

abstract class ProfileEvent extends Equatable {
  const ProfileEvent();
  @override
  List<Object?> get props => [];
}

/// Charge la liste des profils + restaure le profil sélectionné.
class ProfileLoad extends ProfileEvent {
  const ProfileLoad();
}

class ProfileSelected extends ProfileEvent {
  final ProfileModel profile;
  const ProfileSelected(this.profile);
  @override
  List<Object?> get props => [profile];
}

class ProfileCleared extends ProfileEvent {
  const ProfileCleared();
}

class ProfileCreated extends ProfileEvent {
  final String name;
  final bool isChild;
  const ProfileCreated({required this.name, this.isChild = false});
  @override
  List<Object?> get props => [name, isChild];
}

class ProfileUpdated extends ProfileEvent {
  final String id;
  final String name;
  final bool isChild;
  const ProfileUpdated({
    required this.id,
    required this.name,
    required this.isChild,
  });
  @override
  List<Object?> get props => [id, name, isChild];
}

class ProfileDeleted extends ProfileEvent {
  final String id;
  const ProfileDeleted(this.id);
  @override
  List<Object?> get props => [id];
}
