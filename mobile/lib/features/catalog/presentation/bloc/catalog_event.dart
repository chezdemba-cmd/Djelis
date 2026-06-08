import 'package:equatable/equatable.dart';

abstract class CatalogEvent extends Equatable {
  const CatalogEvent();
  @override
  List<Object?> get props => [];
}

class CatalogLoadFeatured extends CatalogEvent {
  final String? countryCode;
  const CatalogLoadFeatured({this.countryCode});
  @override
  List<Object?> get props => [countryCode];
}

class CatalogLoadByType extends CatalogEvent {
  final String type; // 'film', 'series', 'music', etc.
  final String? countryCode;
  final int page;
  const CatalogLoadByType({required this.type, this.countryCode, this.page = 1});
  @override
  List<Object?> get props => [type, countryCode, page];
}

class CatalogSearch extends CatalogEvent {
  final String query;
  const CatalogSearch(this.query);
  @override
  List<Object?> get props => [query];
}

class CatalogClearSearch extends CatalogEvent {
  const CatalogClearSearch();
}
