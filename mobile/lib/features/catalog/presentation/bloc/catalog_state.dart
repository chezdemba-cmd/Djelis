import 'package:equatable/equatable.dart';
import '../../data/models/content_model.dart';

abstract class CatalogState extends Equatable {
  const CatalogState();
  @override
  List<Object?> get props => [];
}

class CatalogInitial extends CatalogState {
  const CatalogInitial();
}

class CatalogLoading extends CatalogState {
  const CatalogLoading();
}

class CatalogFeaturedLoaded extends CatalogState {
  final FeaturedCatalogModel data;
  const CatalogFeaturedLoaded(this.data);
  @override
  List<Object?> get props => [data];
}

class CatalogContentsLoaded extends CatalogState {
  final List<ContentModel> contents;
  final String type;
  final int page;
  const CatalogContentsLoaded({
    required this.contents,
    required this.type,
    required this.page,
  });
  @override
  List<Object?> get props => [contents, type, page];
}

class CatalogSearchResults extends CatalogState {
  final List<ContentModel> results;
  final String query;
  const CatalogSearchResults({required this.results, required this.query});
  @override
  List<Object?> get props => [results, query];
}

class CatalogError extends CatalogState {
  final String message;
  const CatalogError(this.message);
  @override
  List<Object?> get props => [message];
}
