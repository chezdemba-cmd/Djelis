import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Vibrant African-inspired Palette (Amber gold, Warm bronze, Crimson accent)
  static const Color primaryGold = Color(0xFFFFB300); // Amber 600
  static const Color secondaryOrange = Color(0xFFE65100); // Orange 900
  static const Color accentCrimson = Color(0xFFD84315); // Deep Orange 800

  static const Color darkBackground = Color(0xFF0F0F10); // Rich near-black
  static const Color darkSurface = Color(0xFF1B1B1D); // Smooth charcoal surface
  static const Color darkCard = Color(0xFF242427); // Card surface

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: primaryGold,
      scaffoldBackgroundColor: const Color(0xFFF9F9FB),
      colorScheme: const ColorScheme.light(
        primary: primaryGold,
        secondary: secondaryOrange,
        surface: Colors.white,
      ),
      textTheme: GoogleFonts.outfitTextTheme(ThemeData.light().textTheme),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: primaryGold,
      scaffoldBackgroundColor: darkBackground,
      colorScheme: const ColorScheme.dark(
        primary: primaryGold,
        secondary: secondaryOrange,
        surface: darkSurface,
        onSurface: Color(0xFFE3E3E6),
      ),
      cardTheme: const CardThemeData(
        color: darkCard,
        elevation: 0,
      ),
      textTheme: GoogleFonts.outfitTextTheme(
        ThemeData.dark().textTheme.apply(
              bodyColor: const Color(0xFFF5F5F7),
              displayColor: Colors.white,
            ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: darkSurface,
        selectedItemColor: primaryGold,
        unselectedItemColor: Colors.grey,
        elevation: 8,
      ),
    );
  }
}
