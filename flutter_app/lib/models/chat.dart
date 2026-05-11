class ChatMessage {
  final String id;
  final String senderId;
  final String senderName;
  final String? senderAvatar;
  final String receiverId;
  final String message;
  final String? listingId;
  final String? listingTitle;
  final bool isRead;
  final DateTime createdAt;

  ChatMessage({
    required this.id,
    required this.senderId,
    required this.senderName,
    this.senderAvatar,
    required this.receiverId,
    required this.message,
    this.listingId,
    this.listingTitle,
    this.isRead = false,
    required this.createdAt,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['_id'] ?? '',
      senderId: json['sender'] is Map ? json['sender']['_id'] : json['sender'] ?? '',
      senderName: json['sender'] is Map ? json['sender']['name'] : '',
      senderAvatar: json['sender'] is Map ? json['sender']['avatar'] : null,
      receiverId: json['receiver'] is Map ? json['receiver']['_id'] : json['receiver'] ?? '',
      message: json['message'] ?? '',
      listingId: json['listing'],
      listingTitle: json['listingTitle'],
      isRead: json['isRead'] ?? false,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toString()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'sender': senderId,
      'senderName': senderName,
      'senderAvatar': senderAvatar,
      'receiver': receiverId,
      'message': message,
      'listing': listingId,
      'listingTitle': listingTitle,
      'isRead': isRead,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}

class Conversation {
  final String id;
  final String otherUserId;
  final String otherUserName;
  final String? otherUserAvatar;
  final String lastMessage;
  final int unreadCount;
  final DateTime lastMessageTime;
  final String? listingId;
  final String? listingTitle;

  Conversation({
    required this.id,
    required this.otherUserId,
    required this.otherUserName,
    this.otherUserAvatar,
    required this.lastMessage,
    this.unreadCount = 0,
    required this.lastMessageTime,
    this.listingId,
    this.listingTitle,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) {
    return Conversation(
      id: json['_id'] ?? '',
      otherUserId: json['otherUser'] is Map ? json['otherUser']['_id'] : '',
      otherUserName: json['otherUser'] is Map ? json['otherUser']['name'] : '',
      otherUserAvatar: json['otherUser'] is Map ? json['otherUser']['avatar'] : null,
      lastMessage: json['lastMessage'] ?? '',
      unreadCount: json['unreadCount'] ?? 0,
      lastMessageTime: DateTime.parse(json['lastMessageTime'] ?? DateTime.now().toString()),
      listingId: json['listing'],
      listingTitle: json['listingTitle'],
    );
  }
}
