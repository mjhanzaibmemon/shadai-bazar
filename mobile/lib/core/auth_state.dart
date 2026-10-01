import 'package:flutter/foundation.dart';

import 'api.dart';
import 'models.dart';

class AuthState extends ChangeNotifier {
  AuthState() {
    _init();
  }

  final _api = Api.instance;

  AppUser? user;
  bool loading = true;
  final Set<String> wishlistIds = {};

  bool get isLoggedIn => user != null;

  Future<void> _init() async {
    await _api.loadToken();
    if (_api.hasToken) {
      try {
        user = await _api.me();
        await _loadWishlist();
      } on ApiException catch (e) {
        // Only drop the session when the server says it is invalid; keep it
        // across transient network errors.
        if (e.status == 401 || e.status == 404) await _api.clearSession();
      }
    }
    loading = false;
    notifyListeners();
  }

  Future<void> _loadWishlist() async {
    try {
      final items = await _api.wishlist();
      wishlistIds
        ..clear()
        ..addAll(items.map((l) => l.id));
    } on ApiException {
      // Non-critical.
    }
  }

  Future<void> login(String email, String password) async {
    user = await _api.login(email.trim(), password);
    await _loadWishlist();
    notifyListeners();
  }

  Future<void> logout() async {
    await _api.logout();
    user = null;
    wishlistIds.clear();
    notifyListeners();
  }

  Future<void> toggleWishlist(String listingId) async {
    final added = await _api.toggleWishlist(listingId);
    if (added) {
      wishlistIds.add(listingId);
    } else {
      wishlistIds.remove(listingId);
    }
    notifyListeners();
  }
}
