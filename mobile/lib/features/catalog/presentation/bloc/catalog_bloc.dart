import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/repositories/catalog_repository.dart';
import 'catalog_event.dart';
import 'catalog_state.dart';

class CatalogBloc extends Bloc<CatalogEvent, CatalogState> {
  final CatalogRepository _repository;

  CatalogBloc({required CatalogRepository repository})
      : _repository = repository,
        super(const CatalogInitial()) {
    on<CatalogLoadFeatured>(_onLoadFeatured);
    on<CatalogLoadByType>(_onLoadByType);
    on<CatalogSearch>(_onSearch);
    on<CatalogClearSearch>(_onClearSearch);
    on<CatalogReportProgress>(_onReportProgress);
  }

  Future<void> _onLoadFeatured(
      CatalogLoadFeatured event, Emitter<CatalogState> emit) async {
    emit(const CatalogLoading());
    try {
      final featured =
          await _repository.getFeatured(countryCode: event.countryCode);
      emit(CatalogFeaturedLoaded(featured));
    } catch (e) {
      // Fallback to mock if any error — ensures the UI always shows something.
      emit(CatalogError(e.toString()));
    }
  }

  Future<void> _onLoadByType(
      CatalogLoadByType event, Emitter<CatalogState> emit) async {
    emit(const CatalogLoading());
    try {
      final contents = await _repository.getContents(
        type: event.type,
        countryCode: event.countryCode,
        page: event.page,
      );
      emit(CatalogContentsLoaded(
          contents: contents, type: event.type, page: event.page));
    } catch (e) {
      emit(CatalogError(e.toString()));
    }
  }

  Future<void> _onSearch(
      CatalogSearch event, Emitter<CatalogState> emit) async {
    if (event.query.trim().length < 2) return;
    emit(const CatalogLoading());
    try {
      final results = await _repository.search(event.query);
      emit(CatalogSearchResults(results: results, query: event.query));
    } catch (e) {
      emit(CatalogError(e.toString()));
    }
  }

  void _onClearSearch(CatalogClearSearch event, Emitter<CatalogState> emit) {
    emit(const CatalogInitial());
  }

  Future<void> _onReportProgress(
      CatalogReportProgress event, Emitter<CatalogState> emit) async {
    await _repository.reportProgress(
      contentId: event.contentId,
      episodeId: event.episodeId,
      progressSec: event.progressSec,
      quality: event.quality,
      deviceType: event.deviceType,
      profileId: event.profileId,
    );
  }
}
