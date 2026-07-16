import 'package:flutter_bloc/flutter_bloc.dart';
import 'download_event.dart';
import 'download_state.dart';
import '../../../catalog/data/repositories/download_repository.dart';

class DownloadBloc extends Bloc<DownloadEvent, DownloadState> {
  final DownloadRepository repository;

  DownloadBloc({required this.repository}) : super(DownloadInitial()) {
    on<LoadDownloads>(_onLoadDownloads);
    on<StartDownload>(_onStartDownload);
    on<DeleteDownload>(_onDeleteDownload);
    on<UpdateDownloadProgress>(_onUpdateProgress);
  }

  Future<void> _onLoadDownloads(LoadDownloads event, Emitter<DownloadState> emit) async {
    emit(DownloadLoading());
    try {
      final downloads = await repository.getDownloadedContents();
      emit(DownloadsLoaded(downloads));
    } catch (e) {
      emit(DownloadError("Impossible de charger les téléchargements : $e"));
    }
  }

  Future<void> _onStartDownload(StartDownload event, Emitter<DownloadState> emit) async {
    try {
      final filename = '${event.content.id}.mp4';
      
      // Start download and pass a callback that adds events to this bloc
      await repository.downloadContent(
        event.url, 
        filename, 
        event.content,
        onProgress: (received, total) {
          if (total != -1) {
            final progress = (received / total);
            // This is asynchronous, but we can't emit from here safely since it's a callback outside of the event handler flow directly.
            // So we add an event to the bloc.
            add(UpdateDownloadProgress(event.content.id, progress));
          }
        }
      );
      
      // Once download finishes, reload list
      add(const LoadDownloads());
    } catch (e) {
      emit(DownloadError("Erreur lors du téléchargement : $e"));
    }
  }

  void _onUpdateProgress(UpdateDownloadProgress event, Emitter<DownloadState> emit) {
    emit(DownloadInProgress(event.contentId, event.progress));
  }

  Future<void> _onDeleteDownload(DeleteDownload event, Emitter<DownloadState> emit) async {
    try {
      await repository.deleteDownload(event.filename);
      add(const LoadDownloads());
    } catch (e) {
      emit(DownloadError("Erreur lors de la suppression : $e"));
    }
  }
}
