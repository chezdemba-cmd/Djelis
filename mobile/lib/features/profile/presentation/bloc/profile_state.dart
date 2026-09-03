import 'package:equatable/equatable.dart';
import '../../data/models/profile_model.dart';

abstract class ProfileState extends Equatable {
  const ProfileState();
  @override
  List<Object?> get props => [];
}

class ProfileInitial extends ProfileState {
  const ProfileInitial();
}

class ProfileLoading extends ProfileState {
  const ProfileLoading();
}

class ProfileReady extends ProfileState {
  final List<ProfileModel> profiles;
  final ProfileModel? selected;

  const ProfileReady({required this.profiles, this.selected});

  bool get hasSelection => selected != null;

  ProfileReady copyWith({
    List<ProfileModel>? profiles,
    ProfileModel? selected,
    bool clearSelected = false,
  }) =>
      ProfileReady(
        profiles: profiles ?? this.profiles,
        selected: clearSelected ? null : (selected ?? this.selected),
      );

  @override
  List<Object?> get props => [profiles, selected];
}

class ProfileError extends ProfileState {
  final String message;
  const ProfileError(this.message);
  @override
  List<Object?> get props => [message];
}
