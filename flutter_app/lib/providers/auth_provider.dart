import 'package:flutter/material.dart';
import '../models/user.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();

  User? _user;
  String? _token;
  bool _isLoading = false;
  bool _isAuthenticated = false;
  String? _error;

  // Getters
  User? get user => _user;
  String? get token => _token;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _isAuthenticated;
  String? get error => _error;

  AuthProvider() {
    _initializeAuth();
  }

  Future<void> _initializeAuth() async {
    _isLoading = true;
    notifyListeners();

    try {
      await _apiService.loadToken();
      if (_apiService._token != null) {
        _token = _apiService._token;
        _user = await _apiService.getMe();
        _isAuthenticated = true;
      }
    } catch (e) {
      _isAuthenticated = false;
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> signup({
    required String name,
    required String email,
    required String phone,
    required String city,
    required String password,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.signup(
        name: name,
        email: email,
        phone: phone,
        city: city,
        password: password,
      );

      if (response['token'] != null) {
        _token = response['token'];
        _user = User.fromJson(response['user'] ?? {});
        _isAuthenticated = true;
        return true;
      }
      return false;
    } catch (e) {
      _error = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> login({
    required String email,
    required String password,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.login(
        email: email,
        password: password,
      );

      if (response['token'] != null) {
        _token = response['token'];
        _user = User.fromJson(response['user'] ?? {});
        _isAuthenticated = true;
        return true;
      }
      return false;
    } catch (e) {
      _error = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> logout() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _apiService.logout();
      _user = null;
      _token = null;
      _isAuthenticated = false;
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refreshUser() async {
    try {
      _user = await _apiService.getMe();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
