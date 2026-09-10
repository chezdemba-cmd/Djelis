/// Typed exceptions thrown by repositories and datasources.
class AppException implements Exception {
  final String message;
  final int? statusCode;
  const AppException(this.message, {this.statusCode});

  @override
  String toString() => 'AppException($statusCode): $message';
}

class NetworkException extends AppException {
  const NetworkException([super.message = 'Connexion impossible'])
      : super(statusCode: 0);
}

class UnauthorizedException extends AppException {
  const UnauthorizedException([super.message = 'Session expirée'])
      : super(statusCode: 401);
}

class NotFoundException extends AppException {
  const NotFoundException([super.message = 'Contenu introuvable'])
      : super(statusCode: 404);
}

class ServerException extends AppException {
  const ServerException([super.message = 'Erreur serveur'])
      : super(statusCode: 500);
}

class PaymentException extends AppException {
  const PaymentException(super.message);
}
