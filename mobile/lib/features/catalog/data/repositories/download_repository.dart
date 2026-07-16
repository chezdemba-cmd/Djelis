import '../models/content_model.dart';
import '../../downloads/data/download_service.dart';

class DownloadRepository {
  final DownloadService _downloadService;

  DownloadRepository({DownloadService? downloadService}) 
      : _downloadService = downloadService ?? DownloadService();

  Future<String?> downloadContent(String url, String filename, ContentModel content, {Function(int, int)? onProgress}) {
    return _downloadService.downloadFile(url, filename, content, onProgress: onProgress);
  }

  Future<bool> isDownloaded(String filename) {
    return _downloadService.isFileDownloaded(filename);
  }

  Future<String?> getLocalFilePath(String filename) {
    return _downloadService.getFilePath(filename);
  }

  Future<List<ContentModel>> getDownloadedContents() {
    return _downloadService.getDownloadedContents();
  }

  Future<void> deleteDownload(String filename) {
    return _downloadService.deleteDownload(filename);
  }
}
