import 'package:flutter/material.dart';
import '../models/chat.dart';
import '../services/api_service.dart';

class ChatProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();

  List<Conversation> _conversations = [];
  List<ChatMessage> _messages = [];
  String? _currentConversationId;
  bool _isLoading = false;
  String? _error;

  // Getters
  List<Conversation> get conversations => _conversations;
  List<ChatMessage> get messages => _messages;
  String? get currentConversationId => _currentConversationId;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> getConversations() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _conversations = await _apiService.getConversations();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> getMessages(String conversationId, {int page = 1}) async {
    _currentConversationId = conversationId;
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _messages = await _apiService.getMessages(conversationId, page: page);
      _messages = _messages.reversed.toList(); // Reverse to show latest at bottom
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> sendMessage({
    required String receiverId,
    required String message,
    String? listingId,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final newMessage = await _apiService.sendMessage(
        receiverId: receiverId,
        message: message,
        listingId: listingId,
      );

      _messages.add(newMessage);
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

  void clearMessages() {
    _messages = [];
    _currentConversationId = null;
    notifyListeners();
  }
}
