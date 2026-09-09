import 'dart:convert';
import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';

import '../../catalog/data/models/content_model.dart';

/// Stockage des contenus téléchargés pour la lecture hors connexion.
///
/// Sécurité actuelle :
///  - dossier privé de l'app (`getApplicationDocumentsDirectory`) ;
///  - sauvegarde cloud / transfert d'appareil désactivés (`allowBackup=false`
///    + `data_extraction_rules` — cf AndroidManifest) ;
///  - **expiration** : chaque téléchargement porte une date + une TTL
///    ([_ttlDays]) ; passé ce délai le fichier est purgé au premier accès.
///
/// TODO Phase 2 — chiffrement au repos : les fichiers médias restent en clair
/// dans le sandbox. Pour un vrai DRM léger il faudra un chiffrement AEAD
/// *en flux* (AES-CTR + HMAC ou AES-GCM par blocs) avec une clé par appareil
/// dans le Keystore, + revalidation des droits en ligne à l'ouverture. Non fait
/// ici : (a) le chemin de lecture locale est aujourd'hui vidéo-only et non
/// exercé par la V1 de lancement (audio), (b) un AEAD non-streaming chargerait
/// des fichiers de plusieurs centaines de Mo en RAM sur des appareils d'entrée
/// de gamme. À traiter à l'ouverture de DjaaSoo.
class DownloadService {
  final Dio _dio;

  /// Durée de validité d'un téléchargement (jours).
  static const int _ttlDays = 30;

  DownloadService({Dio? dio}) : _dio = dio ?? Dio();

  Future<Directory> _downloadDir() async {
    final dir = await getApplicationDocumentsDirectory();
    final downloadDir = Directory('${dir.path}/djelis_downloads');
    if (!await downloadDir.exists()) {
      await downloadDir.create(recursive: true);
    }
    return downloadDir;
  }

  Future<String?> downloadFile(
      String url, String filename, ContentModel content,
      {Function(int, int)? onProgress}) async {
    try {
      final downloadDir = await _downloadDir();
      final savePath = '${downloadDir.path}/$filename';

      await _dio.download(url, savePath, onReceiveProgress: onProgress);

      final metaFile = File('${downloadDir.path}/${filename}_meta.json');
      await metaFile.writeAsString(jsonEncode({
        'content': content.toJson(),
        'downloadedAt': DateTime.now().toUtc().toIso8601String(),
        'ttlDays': _ttlDays,
      }));

      return savePath;
    } catch (e) {
      debugPrint('Download error: $e');
      return null;
    }
  }

  /// Lit la meta et renvoie `null` si le téléchargement a expiré (et le purge).
  Future<Map<String, dynamic>?> _readValidMeta(
      Directory downloadDir, String filename) async {
    final metaFile = File('${downloadDir.path}/${filename}_meta.json');
    if (!await metaFile.exists()) return null;
    try {
      final raw = jsonDecode(await metaFile.readAsString());
      if (raw is! Map<String, dynamic>) return null;

      // Rétro-compat : ancien format = directement content.toJson().
      final hasEnvelope = raw.containsKey('downloadedAt');
      if (hasEnvelope) {
        final downloadedAt =
            DateTime.tryParse(raw['downloadedAt'] as String? ?? '');
        final ttlDays = (raw['ttlDays'] as num?)?.toInt() ?? _ttlDays;
        if (downloadedAt != null &&
            DateTime.now().toUtc().difference(downloadedAt).inDays >= ttlDays) {
          await deleteDownload(filename);
          return null;
        }
        return (raw['content'] as Map).cast<String, dynamic>();
      }
      return raw;
    } catch (e) {
      debugPrint('Error reading metadata: $e');
      return null;
    }
  }

  Future<bool> isFileDownloaded(String filename) async {
    final downloadDir = await _downloadDir();
    final file = File('${downloadDir.path}/$filename');
    if (!await file.exists()) return false;
    return (await _readValidMeta(downloadDir, filename)) != null;
  }

  Future<String?> getFilePath(String filename) async {
    final downloadDir = await _downloadDir();
    final file = File('${downloadDir.path}/$filename');
    if (!await file.exists()) return null;
    if ((await _readValidMeta(downloadDir, filename)) == null) return null;
    return file.path;
  }

  Future<List<ContentModel>> getDownloadedContents() async {
    try {
      final downloadDir = await _downloadDir();
      final contents = <ContentModel>[];

      for (final entity in downloadDir.listSync()) {
        if (entity is! File || !entity.path.endsWith('_meta.json')) continue;
        final base = entity.uri.pathSegments.last
            .replaceFirst(RegExp(r'_meta\.json$'), '');
        final contentJson = await _readValidMeta(downloadDir, base);
        if (contentJson != null) {
          contents.add(ContentModel.fromJson(contentJson));
        }
      }
      return contents;
    } catch (e) {
      debugPrint('Error getting downloaded contents: $e');
      return [];
    }
  }

  Future<void> deleteDownload(String filename) async {
    try {
      final downloadDir = await _downloadDir();
      final file = File('${downloadDir.path}/$filename');
      if (await file.exists()) await file.delete();
      final metaFile = File('${downloadDir.path}/${filename}_meta.json');
      if (await metaFile.exists()) await metaFile.delete();
    } catch (e) {
      debugPrint('Error deleting download: $e');
    }
  }
}
