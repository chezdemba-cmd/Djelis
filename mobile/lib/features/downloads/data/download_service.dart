import 'dart:convert';
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';
import '../../catalog/data/models/content_model.dart';

class DownloadService {
  final Dio _dio;

  DownloadService({Dio? dio}) : _dio = dio ?? Dio();

  Future<String?> downloadFile(String url, String filename, ContentModel content, {Function(int, int)? onProgress}) async {
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
      
      // Sauvegarder les métadonnées en local
      final metaPath = '${downloadDir.path}/${filename}_meta.json';
      final metaFile = File(metaPath);
      await metaFile.writeAsString(jsonEncode(content.toJson()));
      
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
  
  Future<List<ContentModel>> getDownloadedContents() async {
    try {
      final dir = await getApplicationDocumentsDirectory();
      final downloadDir = Directory('${dir.path}/djelis_downloads');
      
      if (!await downloadDir.exists()) {
        return [];
      }
      
      final List<ContentModel> contents = [];
      final files = downloadDir.listSync();
      
      for (var entity in files) {
        if (entity is File && entity.path.endsWith('_meta.json')) {
          try {
            final jsonStr = await entity.readAsString();
            final jsonMap = jsonDecode(jsonStr);
            contents.add(ContentModel.fromJson(jsonMap));
          } catch (e) {
            print('Error reading metadata: $e');
          }
        }
      }
      
      return contents;
    } catch (e) {
      print('Error getting downloaded contents: $e');
      return [];
    }
  }

  Future<void> deleteDownload(String filename) async {
    try {
      final dir = await getApplicationDocumentsDirectory();
      final downloadDir = Directory('${dir.path}/djelis_downloads');
      
      final file = File('${downloadDir.path}/$filename');
      if (await file.exists()) {
        await file.delete();
      }
      
      final metaFile = File('${downloadDir.path}/${filename}_meta.json');
      if (await metaFile.exists()) {
        await metaFile.delete();
      }
    } catch (e) {
      print('Error deleting download: $e');
    }
  }
}
