import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../models/user.dart';
import '../models/listing.dart';
import '../models/chat.dart';
import '../models/review.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();

  late Dio _dio;
  String? _token;

  String? get token => _token;
  bool get isAuthenticated => _token != null;

  factory ApiService() {
    return _instance;
  }

  ApiService._internal() {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConfig.baseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/json',
        },
      ),
    );

    // Add interceptor to include token in requests
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          if (_token != null) {
            options.headers['Authorization'] = 'Bearer $_token';
          }
          return handler.next(options);
        },
        onError: (error, handler) async {
          if (error.response?.statusCode == 401) {
            // Token expired, refresh needed
            await logout();
          }
          return handler.next(error);
        },
      ),
    );
  }

  // Auth APIs
  Future<Map<String, dynamic>> signup({
    required String name,
    required String email,
    required String phone,
    required String city,
    required String password,
  }) async {
    try {
      final response = await _dio.post(
        ApiConfig.signUp,
        data: {
          'name': name,
          'email': email,
          'phone': phone,
          'city': city,
          'password': password,
        },
      );
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _dio.post(
        ApiConfig.login,
        data: {
          'email': email,
          'password': password,
        },
      );

      if (response.data['token'] != null) {
        _token = response.data['token'];
        await _saveToken(_token!);
      }

      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<User> getMe() async {
    try {
      final response = await _dio.get(ApiConfig.getMe);
      return User.fromJson(response.data['user'] ?? response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<void> logout() async {
    try {
      await _dio.post(ApiConfig.logout);
      _token = null;
      await _clearToken();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Listing APIs
  Future<List<Listing>> getListings({
    int page = 1,
    String? category,
    String? city,
    int? priceMin,
    int? priceMax,
    String? condition,
    String? search,
    String sort = '-createdAt',
  }) async {
    try {
      final params = {
        'page': page,
        'limit': ApiConfig.pageSize,
        'sort': sort,
        if (category != null) 'category': category,
        if (city != null) 'city': city,
        if (priceMin != null) 'priceMin': priceMin,
        if (priceMax != null) 'priceMax': priceMax,
        if (condition != null) 'condition': condition,
        if (search != null) 'search': search,
      };

      final response = await _dio.get(
        ApiConfig.listings,
        queryParameters: params,
      );

      final List<dynamic> data = response.data['listings'] ?? [];
      return data.map((item) => Listing.fromJson(item)).toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Listing> getListing(String id) async {
    try {
      final response = await _dio.get('${ApiConfig.listings}/$id');
      return Listing.fromJson(response.data['listing'] ?? response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Listing> createListing({
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
    try {
      final response = await _dio.post(
        ApiConfig.listings,
        data: {
          'title': title,
          'description': description,
          'category': category,
          'price': price,
          'originalPrice': originalPrice,
          'condition': condition,
          'fabric': fabric,
          'city': city,
          'size': size,
          'images': images,
          'defects': defects,
        },
      );
      return Listing.fromJson(response.data['listing'] ?? response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<List<Listing>> getMyListings({int page = 1}) async {
    try {
      final response = await _dio.get(
        ApiConfig.myListings,
        queryParameters: {
          'page': page,
          'limit': ApiConfig.pageSize,
        },
      );

      final List<dynamic> data = response.data['listings'] ?? [];
      return data.map((item) => Listing.fromJson(item)).toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Chat APIs
  Future<List<Conversation>> getConversations() async {
    try {
      final response = await _dio.get(ApiConfig.conversations);
      final List<dynamic> data = response.data['conversations'] ?? [];
      return data.map((item) => Conversation.fromJson(item)).toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<List<ChatMessage>> getMessages(String conversationId, {int page = 1}) async {
    try {
      final response = await _dio.get(
        '${ApiConfig.conversationDetail}/$conversationId',
        queryParameters: {
          'page': page,
          'limit': ApiConfig.pageSize,
        },
      );

      final List<dynamic> data = response.data['messages'] ?? [];
      return data.map((item) => ChatMessage.fromJson(item)).toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<ChatMessage> sendMessage({
    required String receiverId,
    required String message,
    String? listingId,
  }) async {
    try {
      final response = await _dio.post(
        ApiConfig.messages,
        data: {
          'receiver': receiverId,
          'message': message,
          'listing': listingId,
        },
      );
      return ChatMessage.fromJson(response.data['message'] ?? response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Review APIs
  Future<List<Review>> getReviews(String sellerId, {int page = 1}) async {
    try {
      final response = await _dio.get(
        ApiConfig.reviews,
        queryParameters: {
          'seller': sellerId,
          'page': page,
          'limit': ApiConfig.pageSize,
        },
      );

      final List<dynamic> data = response.data['reviews'] ?? [];
      return data.map((item) => Review.fromJson(item)).toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Review> createReview({
    required String sellerId,
    required int rating,
    required String comment,
  }) async {
    try {
      final response = await _dio.post(
        ApiConfig.reviews,
        data: {
          'seller': sellerId,
          'rating': rating,
          'comment': comment,
        },
      );
      return Review.fromJson(response.data['review'] ?? response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Image Upload
  Future<String> uploadImage(String imagePath) async {
    try {
      final file = await MultipartFile.fromFile(imagePath);
      final formData = FormData.fromMap({
        'file': file,
      });

      final response = await _dio.post(
        ApiConfig.uploadImage,
        data: formData,
      );

      return response.data['url'] ?? response.data['imageUrl'] ?? '';
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Utility methods
  Future<void> loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('jwt_token');
  }

  Future<void> _saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('jwt_token', token);
  }

  Future<void> _clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('jwt_token');
  }

  Exception _handleError(DioException error) {
    String message;
    if (error.response != null) {
      message = error.response?.data is Map
          ? (error.response?.data['error'] ?? error.message ?? 'Request failed')
          : (error.message ?? 'Request failed');
    } else {
      message = error.message ?? 'Network error';
    }
    return Exception(message);
  }
}
