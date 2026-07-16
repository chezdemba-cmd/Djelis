import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _otpController = TextEditingController();
  
  bool _obscurePassword = true;
  bool _isRegistering = false;
  bool _usePhone = false;
  
  String? _otpPhone; // Stores the phone number for OTP verification

  @override
  void dispose() {
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  void _submit() {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    
    final authBloc = context.read<AuthBloc>();
    
    if (_otpPhone != null) {
      authBloc.add(AuthVerifyOtp(
        phone: _otpPhone!,
        otp: _otpController.text.trim(),
      ));
      return;
    }

    if (_isRegistering) {
      if (_usePhone) {
        authBloc.add(AuthRegisterWithPhone(
          phone: _phoneController.text.trim(),
          password: _passwordController.text,
          countryCode: _guessCountryCode(_phoneController.text.trim()),
        ));
      } else {
        authBloc.add(AuthRegisterWithEmail(
          email: _emailController.text.trim(),
          password: _passwordController.text,
          countryCode: 'ML',
        ));
      }
    } else {
      if (_usePhone) {
        authBloc.add(AuthLoginWithPhone(
          phone: _phoneController.text.trim(),
          password: _passwordController.text,
        ));
      } else {
        authBloc.add(AuthLoginWithEmail(
          email: _emailController.text.trim(),
          password: _passwordController.text,
        ));
      }
    }
  }

  String _guessCountryCode(String phone) {
    if (phone.startsWith('+221')) return 'SN';
    if (phone.startsWith('+225')) return 'CI';
    if (phone.startsWith('+33')) return 'FR';
    return 'ML'; // Default to Mali
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthAuthenticated) {
          context.go('/');
        } else if (state is AuthOtpRequired) {
          setState(() {
            _otpPhone = state.phone;
            _otpController.clear();
          });
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text('Code OTP envoyé par SMS au ${state.phone}'),
            backgroundColor: AppTheme.primaryGold,
          ));
        } else if (state is AuthError) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(state.message),
            backgroundColor: AppTheme.accentCrimson,
          ));
        } else if (state is AuthUnauthenticated && _otpPhone != null) {
          // OTP verification succeeded, return to login mode
          setState(() {
            _otpPhone = null;
            _isRegistering = false;
            _passwordController.clear();
          });
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('Compte validé ! Vous pouvez maintenant vous connecter.'),
            backgroundColor: Colors.green,
          ));
        }
      },
      builder: (context, state) {
        final isLoading = state is AuthLoading;
        final showOtp = _otpPhone != null;

        return Scaffold(
          backgroundColor: AppTheme.darkBackground,
          body: SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const SizedBox(height: 20),
                      // Brand Logo
                      Center(
                        child: Text(
                          "Djeli'S",
                          style: Theme.of(context).textTheme.displayMedium?.copyWith(
                                color: AppTheme.primaryGold,
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Center(
                        child: Text(
                          'Racines. Récits. Réalité.',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: Colors.grey,
                                fontStyle: FontStyle.italic,
                              ),
                        ),
                      ),
                      const SizedBox(height: 48),

                      if (showOtp) ...[
                        // OTP View
                        _buildOtpView(),
                      ] else ...[
                        // Toggle tabs: Email / Phone
                        _buildAuthMethodToggle(),
                        const SizedBox(height: 24),
                        // Email or Phone input field
                        if (!_usePhone) _buildEmailField() else _buildPhoneField(),
                        const SizedBox(height: 16),
                        // Password input field
                        _buildPasswordField(),
                        const SizedBox(height: 8),
                        // Forgot Password button (only in email login mode)
                        if (!_isRegistering && !_usePhone) _buildForgotPassword(),
                      ],
                      const SizedBox(height: 24),

                      // Submit button
                      ElevatedButton(
                        onPressed: isLoading ? null : _submit,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primaryGold,
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          elevation: 3,
                        ),
                        child: isLoading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2.5,
                                  color: Colors.black,
                                ),
                              )
                            : Text(
                                showOtp
                                    ? 'Valider le code'
                                    : (_isRegistering ? "S'inscrire" : 'Se connecter'),
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                      ),
                      const SizedBox(height: 24),

                      if (!showOtp) ...[
                        // Divider
                        _buildDivider(),
                        const SizedBox(height: 20),
                        // Mode Bascule Link (Login / Register)
                        _buildModeBasculeLink(),
                      ] else ...[
                        // Back to Registration link
                        TextButton(
                          onPressed: () {
                            setState(() {
                              _otpPhone = null;
                            });
                          },
                          child: const Text(
                            'Retour au formulaire',
                            style: TextStyle(color: Colors.white70),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  // ── Helper Widgets ──────────────────────────────────────────────────────────

  Widget _buildAuthMethodToggle() {
    return Container(
      height: 48,
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppTheme.darkSurface,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          Expanded(
            child: GestureDetector(
              onTap: () => setState(() => _usePhone = false),
              child: Container(
                decoration: BoxDecoration(
                  color: !_usePhone ? AppTheme.darkCard : Colors.transparent,
                  borderRadius: BorderRadius.circular(8),
                ),
                alignment: Alignment.center,
                child: Text(
                  'Email',
                  style: TextStyle(
                    color: !_usePhone ? Colors.white : Colors.white38,
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
              ),
            ),
          ),
          Expanded(
            child: GestureDetector(
              onTap: () => setState(() => _usePhone = true),
              child: Container(
                decoration: BoxDecoration(
                  color: _usePhone ? AppTheme.darkCard : Colors.transparent,
                  borderRadius: BorderRadius.circular(8),
                ),
                alignment: Alignment.center,
                child: Text(
                  'Téléphone',
                  style: TextStyle(
                    color: _usePhone ? Colors.white : Colors.white38,
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmailField() {
    return TextFormField(
      controller: _emailController,
      keyboardType: TextInputType.emailAddress,
      textInputAction: TextInputAction.next,
      decoration: const InputDecoration(
        labelText: 'Adresse Email',
        border: OutlineInputBorder(),
        prefixIcon: Icon(Icons.email_outlined),
        hintText: 'adresse@exemple.com',
      ),
      validator: (v) {
        if (v == null || v.isEmpty) return 'Champ requis';
        if (!v.contains('@')) return 'Email invalide';
        return null;
      },
    );
  }

  Widget _buildPhoneField() {
    return TextFormField(
      controller: _phoneController,
      keyboardType: TextInputType.phone,
      textInputAction: TextInputAction.next,
      decoration: const InputDecoration(
        labelText: 'Numéro de Téléphone',
        border: OutlineInputBorder(),
        prefixIcon: Icon(Icons.phone_outlined),
        hintText: '+223 70 00 00 00',
      ),
      validator: (v) {
        if (v == null || v.isEmpty) return 'Champ requis';
        if (v.length < 8) return 'Numéro invalide (trop court)';
        return null;
      },
    );
  }

  Widget _buildPasswordField() {
    return TextFormField(
      controller: _passwordController,
      obscureText: _obscurePassword,
      textInputAction: TextInputAction.done,
      onFieldSubmitted: (_) => _submit(),
      decoration: InputDecoration(
        labelText: 'Mot de passe',
        border: const OutlineInputBorder(),
        prefixIcon: const Icon(Icons.lock_outline),
        suffixIcon: IconButton(
          icon: Icon(_obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined),
          onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
        ),
      ),
      validator: (v) {
        if (v == null || v.isEmpty) return 'Champ requis';
        if (v.length < 6) return 'Minimum 6 caractères';
        return null;
      },
    );
  }

  Widget _buildForgotPassword() {
    return Align(
      alignment: Alignment.centerRight,
      child: TextButton(
        onPressed: () {},
        child: const Text(
          'Mot de passe oublié ?',
          style: TextStyle(color: AppTheme.primaryGold),
        ),
      ),
    );
  }

  Widget _buildOtpView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          'Vérification OTP',
          style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 8),
        Text(
          'Veuillez saisir le code OTP envoyé par SMS pour valider votre compte.',
          style: const TextStyle(color: Colors.white70, fontSize: 13),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 24),
        TextFormField(
          controller: _otpController,
          keyboardType: TextInputType.number,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, letterSpacing: 8),
          decoration: const InputDecoration(
            labelText: 'Code de validation',
            border: OutlineInputBorder(),
            prefixIcon: Icon(Icons.lock_clock),
            hintText: '000000',
          ),
          validator: (v) {
            if (v == null || v.isEmpty) return 'Veuillez saisir le code';
            if (v.length < 4) return 'Code trop court';
            return null;
          },
        ),
      ],
    );
  }

  Widget _buildDivider() {
    return Row(
      children: [
        const Expanded(child: Divider(color: Colors.white24)),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Text(
            'ou',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.white38),
          ),
        ),
        const Expanded(child: Divider(color: Colors.white24)),
      ],
    );
  }

  Widget _buildModeBasculeLink() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          _isRegistering ? "Déjà un compte ?" : "Pas encore de compte ?",
          style: const TextStyle(color: Colors.white70),
        ),
        TextButton(
          onPressed: () {
            setState(() {
              _isRegistering = !_isRegistering;
              _formKey.currentState?.reset();
              _passwordController.clear();
            });
          },
          child: Text(
            _isRegistering ? "Se connecter" : "S'inscrire",
            style: const TextStyle(
              color: AppTheme.primaryGold,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ],
    );
  }
}
