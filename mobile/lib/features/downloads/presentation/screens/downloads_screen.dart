import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';
import '../bloc/download_bloc.dart';
import '../bloc/download_event.dart';
import '../bloc/download_state.dart';

class DownloadsScreen extends StatefulWidget {
  const DownloadsScreen({super.key});

  @override
  State<DownloadsScreen> createState() => _DownloadsScreenState();
}

class _DownloadsScreenState extends State<DownloadsScreen> {
  @override
  void initState() {
    super.initState();
    context.read<DownloadBloc>().add(const LoadDownloads());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBackground,
      appBar: AppBar(
        backgroundColor: AppTheme.darkSurface,
        title: const Text("Mes Téléchargements", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: BlocBuilder<DownloadBloc, DownloadState>(
        builder: (context, state) {
          if (state is DownloadLoading) {
            return const Center(child: CircularProgressIndicator(color: AppTheme.primaryGold));
          }
          if (state is DownloadError) {
            return Center(child: Text(state.message, style: const TextStyle(color: Colors.red)));
          }
          if (state is DownloadsLoaded) {
            final downloads = state.downloads;
            if (downloads.isEmpty) {
              return const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.download_for_offline_outlined, color: Colors.white24, size: 80),
                    SizedBox(height: 16),
                    Text("Aucun téléchargement", style: TextStyle(color: Colors.white70, fontSize: 18)),
                  ],
                ),
              );
            }

            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: downloads.length,
              itemBuilder: (context, index) {
                final item = downloads[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: AppTheme.darkSurface,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: ListTile(
                    contentPadding: const EdgeInsets.all(8),
                    leading: Container(
                      width: 60,
                      height: 80,
                      decoration: BoxDecoration(
                        color: Colors.grey[900],
                        borderRadius: BorderRadius.circular(8),
                        image: item.posterUrl != null 
                          ? DecorationImage(image: NetworkImage(item.posterUrl!), fit: BoxFit.cover) 
                          : null,
                      ),
                      child: item.posterUrl == null ? const Icon(Icons.movie, color: Colors.white30) : null,
                    ),
                    title: Text(item.title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    subtitle: Text(item.type.toUpperCase(), style: const TextStyle(color: AppTheme.primaryGold, fontSize: 11)),
                    trailing: IconButton(
                      icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
                      onPressed: () {
                        context.read<DownloadBloc>().add(DeleteDownload('${item.id}.mp4'));
                      },
                    ),
                    onTap: () {
                      context.push('/player', extra: {
                        'contentId': item.id,
                        'title': item.title,
                        'videoUrl': 'local', // Indicates local playback
                      });
                    },
                  ),
                );
              },
            );
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }
}
