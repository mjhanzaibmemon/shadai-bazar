import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../screens/auth_screens.dart';
import 'auth_state.dart';
import 'config.dart';
import 'models.dart';

const maroon = Color(0xFF800020);
const gold = Color(0xFFD4A853);

ThemeData buildTheme() {
  final scheme = ColorScheme.fromSeed(seedColor: maroon, primary: maroon, secondary: gold);
  return ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    scaffoldBackgroundColor: const Color(0xFFFAF7F5),
    appBarTheme: const AppBarTheme(
      backgroundColor: maroon,
      foregroundColor: Colors.white,
      elevation: 0,
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: maroon,
        minimumSize: const Size.fromHeight(48),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      filled: true,
      fillColor: Colors.white,
    ),
  );
}

void showSnack(BuildContext context, String message, {bool error = false}) {
  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(SnackBar(
      content: Text(message),
      backgroundColor: error ? Colors.red.shade700 : null,
    ));
}

/// Runs [action]; shows the error message as a snackbar and returns null on failure.
Future<T?> guarded<T>(BuildContext context, Future<T> Function() action) async {
  try {
    return await action();
  } catch (e) {
    if (context.mounted) showSnack(context, e.toString().replaceFirst('Exception: ', ''), error: true);
    return null;
  }
}

/// Returns true when logged in; otherwise opens the login screen.
Future<bool> requireLogin(BuildContext context) async {
  final auth = context.read<AuthState>();
  if (auth.isLoggedIn) return true;
  await Navigator.of(context).push(MaterialPageRoute(builder: (_) => const LoginScreen()));
  return context.mounted && context.read<AuthState>().isLoggedIn;
}

class NetImage extends StatelessWidget {
  const NetImage(this.path, {super.key, this.fit = BoxFit.cover});
  final String? path;
  final BoxFit fit;

  @override
  Widget build(BuildContext context) {
    final p = path;
    if (p == null || p.isEmpty) {
      return Container(color: Colors.grey.shade200, child: const Icon(Icons.image_outlined, color: Colors.grey));
    }
    return CachedNetworkImage(
      imageUrl: imageUrl(p),
      fit: fit,
      placeholder: (_, _) => Container(color: Colors.grey.shade200),
      errorWidget: (_, _, _) =>
          Container(color: Colors.grey.shade200, child: const Icon(Icons.broken_image_outlined, color: Colors.grey)),
    );
  }
}

class ErrorRetry extends StatelessWidget {
  const ErrorRetry({super.key, required this.message, required this.onRetry});
  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) => Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Icon(Icons.wifi_off_rounded, size: 48, color: Colors.grey),
            const SizedBox(height: 12),
            Text(message, textAlign: TextAlign.center),
            const SizedBox(height: 12),
            OutlinedButton(onPressed: onRetry, child: const Text('Try again')),
          ]),
        ),
      );
}

class EmptyState extends StatelessWidget {
  const EmptyState({super.key, required this.icon, required this.title, this.subtitle});
  final IconData icon;
  final String title;
  final String? subtitle;

  @override
  Widget build(BuildContext context) => Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Icon(icon, size: 56, color: Colors.grey.shade400),
            const SizedBox(height: 12),
            Text(title, style: Theme.of(context).textTheme.titleMedium),
            if (subtitle != null) ...[
              const SizedBox(height: 4),
              Text(subtitle!, textAlign: TextAlign.center, style: const TextStyle(color: Colors.grey)),
            ],
          ]),
        ),
      );
}

class ListingCard extends StatelessWidget {
  const ListingCard({super.key, required this.listing, required this.onTap});
  final Listing listing;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final discount = listing.discountPercent;
    return GestureDetector(
      onTap: onTap,
      child: Card(
        clipBehavior: Clip.antiAlias,
        elevation: 1,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Expanded(
            child: Stack(fit: StackFit.expand, children: [
              NetImage(listing.images.isEmpty ? null : listing.images.first),
              if (discount != null)
                Positioned(
                  top: 8,
                  left: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(color: maroon, borderRadius: BorderRadius.circular(8)),
                    child: Text('-$discount%', style: const TextStyle(color: Colors.white, fontSize: 11)),
                  ),
                ),
            ]),
          ),
          Padding(
            padding: const EdgeInsets.all(10),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(listing.title, maxLines: 1, overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 2),
              Text(formatPrice(listing.price),
                  style: const TextStyle(color: maroon, fontWeight: FontWeight.bold)),
              const SizedBox(height: 2),
              Text(listing.city, style: const TextStyle(color: Colors.grey, fontSize: 12)),
            ]),
          ),
        ]),
      ),
    );
  }
}
