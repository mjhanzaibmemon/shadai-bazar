import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'config.dart';
import 'models.dart';

class ApiException implements Exception {
  ApiException(this.message, {this.status, this.emailNotVerified = false});
  final String message;
  final int? status;
  final bool emailNotVerified;

  @override
  String toString() => message;
}

class Api {
  Api._() {
    _dio = Dio(BaseOptions(
      baseUrl: '$kApiBase/api',
      connectTimeout: const Duration(seconds: 20),
      receiveTimeout: const Duration(seconds: 30),
      headers: {'X-Client': 'mobile'},
    ));
    _dio.interceptors.add(InterceptorsWrapper(onRequest: (o, h) {
      final t = _token;
      if (t != null) o.headers['Authorization'] = 'Bearer $t';
      h.next(o);
    }));
  }

  static final Api instance = Api._();
  static const _tokenKey = 'auth_token';

  late final Dio _dio;
  String? _token;

  bool get hasToken => _token != null;

  Future<void> loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString(_tokenKey);
  }

  Future<void> _setToken(String? token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    if (token == null) {
      await prefs.remove(_tokenKey);
    } else {
      await prefs.setString(_tokenKey, token);
    }
  }

  Future<T> _run<T>(Future<T> Function() call) async {
    try {
      return await call();
    } on DioException catch (e) {
      final data = e.response?.data;
      final msg = data is Map && data['error'] != null
          ? data['error'].toString()
          : (e.response == null ? 'No internet connection' : 'Request failed');
      throw ApiException(
        msg,
        status: e.response?.statusCode,
        emailNotVerified: data is Map && data['emailNotVerified'] == true,
      );
    }
  }

  // ── Auth ───────────────────────────────────────────────
  Future<AppUser> login(String email, String password) => _run(() async {
        final r = await _dio.post('/auth/login', data: {'email': email, 'password': password});
        final token = r.data['token'];
        if (token == null) throw ApiException('Login failed');
        await _setToken(token.toString());
        return AppUser.fromJson(Map<String, dynamic>.from(r.data['user']));
      });

  /// Returns normally when the account was created; the user must then verify
  /// their email before logging in.
  Future<void> signup({
    required String name,
    required String email,
    required String phone,
    required String city,
    required String password,
  }) =>
      _run(() => _dio.post('/auth/signup', data: {
            'name': name,
            'email': email,
            'phone': phone,
            'city': city,
            'password': password,
          }));

  Future<void> resendVerification(String email) =>
      _run(() => _dio.post('/auth/resend-verification', data: {'email': email}));

  Future<void> forgotPassword(String email) =>
      _run(() => _dio.post('/auth/forgot-password', data: {'email': email}));

  Future<AppUser> me() => _run(() async {
        final r = await _dio.get('/auth/me');
        return AppUser.fromJson(Map<String, dynamic>.from(r.data['user']));
      });

  Future<void> logout() async {
    try {
      await _dio.post('/auth/logout');
    } on DioException {
      // Token is cleared locally regardless.
    }
    await _setToken(null);
  }

  Future<void> clearSession() => _setToken(null);

  // ── Listings ───────────────────────────────────────────
  Page<Listing> _listingPage(Map data) {
    final p = data['pagination'] as Map? ?? const {};
    return Page(
      items: [
        for (final l in (data['listings'] as List? ?? const []))
          Listing.fromJson(Map<String, dynamic>.from(l)),
      ],
      page: (p['page'] as num?)?.toInt() ?? 1,
      pages: (p['pages'] as num?)?.toInt() ?? 1,
    );
  }

  Future<Page<Listing>> listings({
    int page = 1,
    String? search,
    String? category,
    String? city,
    String? condition,
    int? minPrice,
    int? maxPrice,
    String sort = 'newest',
  }) =>
      _run(() async {
        final r = await _dio.get('/listings', queryParameters: {
          'page': page,
          'sort': sort,
          if (search != null && search.isNotEmpty) 'search': search,
          'category': ?category,
          'city': ?city,
          'condition': ?condition,
          'minPrice': ?minPrice,
          'maxPrice': ?maxPrice,
        });
        return _listingPage(r.data);
      });

  Future<Listing> listing(String id) => _run(() async {
        final r = await _dio.get('/listings/$id');
        return Listing.fromJson(Map<String, dynamic>.from(r.data['listing']));
      });

  Future<Page<Listing>> myListings({int page = 1}) => _run(() async {
        final r = await _dio.get('/listings/my', queryParameters: {'page': page});
        return _listingPage(r.data);
      });

  Future<void> createListing(Map<String, dynamic> body) =>
      _run(() => _dio.post('/listings', data: body));

  Future<void> setListingStatus(String id, String status) =>
      _run(() => _dio.put('/listings/$id', data: {'status': status}));

  Future<void> deleteListing(String id) => _run(() => _dio.delete('/listings/$id'));

  Future<List<String>> uploadImages(List<String> paths) => _run(() async {
        final form = FormData();
        for (final p in paths) {
          form.files.add(MapEntry('file', await MultipartFile.fromFile(p)));
        }
        final r = await _dio.post('/upload', data: form);
        return [for (final u in (r.data['urls'] as List)) u.toString()];
      });

  // ── Wishlist ───────────────────────────────────────────
  Future<List<Listing>> wishlist() => _run(() async {
        final r = await _dio.get('/wishlist');
        return [
          for (final l in (r.data['wishlist'] as List? ?? const []))
            if (l is Map) Listing.fromJson(Map<String, dynamic>.from(l)),
        ];
      });

  /// Toggles and returns whether the listing is now saved.
  Future<bool> toggleWishlist(String listingId) => _run(() async {
        final r = await _dio.post('/wishlist', data: {'listingId': listingId});
        return r.data['added'] == true;
      });

  // ── Chat ───────────────────────────────────────────────
  Future<List<Conversation>> conversations() => _run(() async {
        final r = await _dio.get('/chat/conversations');
        return [
          for (final c in (r.data['conversations'] as List? ?? const []))
            Conversation.fromJson(Map<String, dynamic>.from(c)),
        ];
      });

  Future<List<ChatMessage>> messages(String otherUserId) => _run(() async {
        final r = await _dio.get('/chat/conversations/$otherUserId');
        return [
          for (final m in (r.data['messages'] as List? ?? const []))
            ChatMessage.fromJson(Map<String, dynamic>.from(m)),
        ];
      });

  Future<void> sendMessage({required String to, required String text, String? listingId}) =>
      _run(() => _dio.post('/chat/messages', data: {
            'receiver': to,
            'message': text,
            'listing': ?listingId,
          }));

  // ── Reviews ────────────────────────────────────────────
  Future<List<Review>> reviews(String sellerId) => _run(() async {
        final r = await _dio.get('/reviews', queryParameters: {'seller': sellerId});
        return [
          for (final x in (r.data['reviews'] as List? ?? const []))
            Review.fromJson(Map<String, dynamic>.from(x)),
        ];
      });

  Future<void> createReview({
    required String sellerId,
    required int rating,
    required String comment,
  }) =>
      _run(() => _dio.post('/reviews', data: {
            'seller': sellerId,
            'rating': rating,
            'comment': comment,
          }));
}
