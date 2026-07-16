import 'package:equatable/equatable.dart';
import '../../../catalog/data/models/content_model.dart';

abstract class DownloadState extends Equatable {
  const DownloadState();
  
  @override
  List<Object?> get props => [];
}

class DownloadInitial extends DownloadState {}

class DownloadLoading extends DownloadState {}

class DownloadsLoaded extends DownloadState {
  final List<ContentModel> downloads;

  const DownloadsLoaded(this.downloads);

  @override
  List<Object?> get props => [downloads];
}

class DownloadInProgress extends DownloadState {
  final String contentId;
  final double progress;

  const DownloadInProgress(this.contentId, this.progress);

  @override
  List<Object?> get props => [contentId, progress];
}

class DownloadError extends DownloadState {
  final String message;

  const DownloadError(this.message);

  @override
  List<Object?> get props => [message];
}
