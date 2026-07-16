import 'package:equatable/equatable.dart';
import '../../../catalog/data/models/content_model.dart';

abstract class DownloadEvent extends Equatable {
  const DownloadEvent();

  @override
  List<Object?> get props => [];
}

class StartDownload extends DownloadEvent {
  final ContentModel content;
  final String url;

  const StartDownload({required this.content, required this.url});

  @override
  List<Object?> get props => [content, url];
}

class DeleteDownload extends DownloadEvent {
  final String filename;

  const DeleteDownload(this.filename);

  @override
  List<Object?> get props => [filename];
}

class LoadDownloads extends DownloadEvent {
  const LoadDownloads();
}

class UpdateDownloadProgress extends DownloadEvent {
  final String contentId;
  final double progress;

  const UpdateDownloadProgress(this.contentId, this.progress);

  @override
  List<Object?> get props => [contentId, progress];
}
