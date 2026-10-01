class AppUser {
  AppUser({
    required this.id,
    required this.name,
    required this.email,
    this.phone = '',
    this.city = '',
    this.avatar,
    this.role = 'user',
  });

  final String id;
  final String name;
  final String email;
  final String phone;
  final String city;
  final String? avatar;
  final String role;

  factory AppUser.fromJson(Map<String, dynamic> j) => AppUser(
        id: (j['id'] ?? j['_id'] ?? '').toString(),
        name: (j['name'] ?? '').toString(),
        email: (j['email'] ?? '').toString(),
        phone: (j['phone'] ?? '').toString(),
        city: (j['city'] ?? '').toString(),
        avatar: j['avatar']?.toString(),
        role: (j['role'] ?? 'user').toString(),
      );
}

class Seller {
  Seller({required this.id, required this.name, this.avatar, this.city, this.phone});

  final String id;
  final String name;
  final String? avatar;
  final String? city;
  final String? phone;

  factory Seller.fromJson(dynamic raw) {
    if (raw is Map) {
      return Seller(
        id: (raw['_id'] ?? raw['id'] ?? '').toString(),
        name: (raw['name'] ?? 'Seller').toString(),
        avatar: raw['avatar']?.toString(),
        city: raw['city']?.toString(),
        phone: raw['phone']?.toString(),
      );
    }
    return Seller(id: (raw ?? '').toString(), name: 'Seller');
  }
}

class Listing {
  Listing({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.price,
    this.originalPrice,
    required this.condition,
    required this.fabric,
    required this.images,
    required this.city,
    required this.seller,
    this.defects,
    this.views = 0,
    this.status = 'active',
    this.createdAt,
  });

  final String id;
  final String title;
  final String description;
  final String category;
  final int price;
  final int? originalPrice;
  final String condition;
  final String fabric;
  final List<String> images;
  final String city;
  final Seller seller;
  final String? defects;
  final int views;
  final String status;
  final DateTime? createdAt;

  int? get discountPercent {
    final o = originalPrice;
    if (o == null || o <= price || o == 0) return null;
    return (((o - price) / o) * 100).round();
  }

  factory Listing.fromJson(Map<String, dynamic> j) => Listing(
        id: (j['_id'] ?? j['id'] ?? '').toString(),
        title: (j['title'] ?? '').toString(),
        description: (j['description'] ?? '').toString(),
        category: (j['category'] ?? '').toString(),
        price: (j['price'] as num?)?.toInt() ?? 0,
        originalPrice: (j['originalPrice'] as num?)?.toInt(),
        condition: (j['condition'] ?? '').toString(),
        fabric: (j['fabric'] ?? '').toString(),
        images: [for (final i in (j['images'] as List? ?? const [])) i.toString()],
        city: (j['city'] ?? '').toString(),
        seller: Seller.fromJson(j['seller']),
        defects: j['defects']?.toString(),
        views: (j['views'] as num?)?.toInt() ?? 0,
        status: (j['status'] ?? 'active').toString(),
        createdAt: DateTime.tryParse((j['createdAt'] ?? '').toString()),
      );
}

class Page<T> {
  Page({required this.items, required this.page, required this.pages});
  final List<T> items;
  final int page;
  final int pages;
  bool get hasMore => page < pages;
}

class Conversation {
  Conversation({
    required this.userId,
    required this.userName,
    this.userAvatar,
    required this.lastMessage,
    this.lastMessageAt,
    this.unreadCount = 0,
    this.listingTitle,
  });

  final String userId;
  final String userName;
  final String? userAvatar;
  final String lastMessage;
  final DateTime? lastMessageAt;
  final int unreadCount;
  final String? listingTitle;

  factory Conversation.fromJson(Map<String, dynamic> j) {
    final listing = j['listing'];
    return Conversation(
      userId: (j['userId'] ?? '').toString(),
      userName: (j['userName'] ?? 'User').toString(),
      userAvatar: j['userAvatar']?.toString(),
      lastMessage: (j['lastMessage'] ?? '').toString(),
      lastMessageAt: DateTime.tryParse((j['lastMessageAt'] ?? '').toString()),
      unreadCount: (j['unreadCount'] as num?)?.toInt() ?? 0,
      listingTitle: listing is Map ? listing['title']?.toString() : null,
    );
  }
}

class ChatMessage {
  ChatMessage({
    required this.id,
    required this.senderId,
    required this.text,
    required this.createdAt,
    this.listingId,
  });

  final String id;
  final String senderId;
  final String text;
  final DateTime createdAt;
  final String? listingId;

  static String _id(dynamic v) =>
      v is Map ? (v['_id'] ?? v['id'] ?? '').toString() : (v ?? '').toString();

  factory ChatMessage.fromJson(Map<String, dynamic> j) => ChatMessage(
        id: (j['_id'] ?? '').toString(),
        senderId: _id(j['sender']),
        text: (j['message'] ?? '').toString(),
        createdAt: DateTime.tryParse((j['createdAt'] ?? '').toString()) ?? DateTime.now(),
        listingId: j['listing'] == null ? null : _id(j['listing']),
      );
}

class Review {
  Review({
    required this.id,
    required this.reviewerName,
    required this.rating,
    required this.comment,
    this.createdAt,
  });

  final String id;
  final String reviewerName;
  final int rating;
  final String comment;
  final DateTime? createdAt;

  factory Review.fromJson(Map<String, dynamic> j) => Review(
        id: (j['_id'] ?? '').toString(),
        reviewerName: j['reviewer'] is Map ? (j['reviewer']['name'] ?? 'User').toString() : 'User',
        rating: (j['rating'] as num?)?.toInt() ?? 0,
        comment: (j['comment'] ?? '').toString(),
        createdAt: DateTime.tryParse((j['createdAt'] ?? '').toString()),
      );
}
