import 'package:flutter/material.dart';
import '../models/listing.dart';
import '../services/api_service.dart';

class ListingProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();

  List<Listing> _listings = [];
  List<Listing> _myListings = [];
  Listing? _currentListing;
  bool _isLoading = false;
  String? _error;

  // Getters
  List<Listing> get listings => _listings;
  List<Listing> get myListings => _myListings;
  Listing? get currentListing => _currentListing;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> getListings({
    int page = 1,
    String? category,
    String? city,
    int? priceMin,
    int? priceMax,
    String? condition,
    String? search,
    String sort = '-createdAt',
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _listings = await _apiService.getListings(
        page: page,
        category: category,
        city: city,
        priceMin: priceMin,
        priceMax: priceMax,
        condition: condition,
        search: search,
        sort: sort,
      );
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> getListing(String id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _currentListing = await _apiService.getListing(id);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> createListing({
    required String title,
    required String description,
    required String category,
    required int price,
    int? originalPrice,
    required String condition,
    required String fabric,
    required String city,
    Map<String, dynamic>? size,
    List<String>? images,
    String? defects,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final newListing = await _apiService.createListing(
        title: title,
        description: description,
        category: category,
        price: price,
        originalPrice: originalPrice,
        condition: condition,
        fabric: fabric,
        city: city,
        size: size,
        images: images,
        defects: defects,
      );

      _myListings.add(newListing);
      _listings.add(newListing);
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> getMyListings({int page = 1}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _myListings = await _apiService.getMyListings(page: page);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> updateListingStatus(String id, String status) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // Update local listings
      final index = _myListings.indexWhere((l) => l.id == id);
      if (index != -1) {
        _myListings[index] = _myListings[index].copyWith(status: status);
      }
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  void clearCurrentListing() {
    _currentListing = null;
    notifyListeners();
  }
}
