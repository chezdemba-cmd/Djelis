/// Typed exceptions thrown by repositories and datasources.
class AppException implements Exception {
  final String message;
  final int? statusCode;
  const AppException(this.message, {this.statusCode});

  @override
  String toString() => 'AppException($statusCode): $message';
}

class NetworkException extends AppException {
  const NetworkException([String message = 'Connexion impossible'])
      : super(message, statusCode: 0);
}

class UnauthorizedException extends AppException {
  const UnauthorizedException([String message = 'Session expirée'])
      : super(message, statusCode: 401);
}

class NotFoundException extends AppException {
  const NotFoundException([String message = 'Contenu introuvable'])
      : super(message, statusCode: 404);
}

class ServerException extends AppException {
  const ServerException([String message = 'Erreur serveur'])
      : super(message, statusCode: 500);
}

class PaymentException extends AppException {
  const PaymentException(String message) : super(message);
}
