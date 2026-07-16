import 'dart:io';
import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';

class DownloadService {
  final Dio _dio;

  DownloadService({Dio? dio}) : _dio = dio ?? Dio();

  Future<String?> downloadFile(String url, String filename, {Function(int, int)? onProgress}) async {
    try {
      final dir = await getApplicationDocumentsDirectory();
      
      // On sauvegarde dans un dossier spécifique "djelis_downloads"
      final downloadDir = Directory('${dir.path}/djelis_downloads');
      if (!await downloadDir.exists()) {
        await downloadDir.create(recursive: true);
      }
      
      final savePath = '${downloadDir.path}/$filename';
      
      await _dio.download(
        url,
        savePath,
        onReceiveProgress: onProgress,
      );
      
      return savePath;
    } catch (e) {
      print('Download error: $e');
      return null;
    }
  }

  Future<bool> isFileDownloaded(String filename) async {
    final dir = await getApplicationDocumentsDirectory();
    final file = File('${dir.path}/djelis_downloads/$filename');
    return await file.exists();
  }
  
  Future<String?> getFilePath(String filename) async {
    final dir = await getApplicationDocumentsDirectory();
    final file = File('${dir.path}/djelis_downloads/$filename');
    if (await file.exists()) {
       return file.path;
    }
    return null;
  }
}
