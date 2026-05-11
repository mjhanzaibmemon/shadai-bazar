class Listing {
  final String id;
  final String title;
  final String description;
  final String category;
  final int price;
  final int? originalPrice;
  final String condition;
  final String fabric;
  final Map<String, dynamic> size;
  final List<String> images;
  final String? defects;
  final String city;
  final String sellerId;
  final String? sellerName;
  final bool featured;
  final bool? isFeatured;
  final DateTime? featuredUntil;
  final int views;
  final String status;
  final DateTime createdAt;

  Listing({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.price,
    this.originalPrice,
    required this.condition,
    required this.fabric,
    required this.size,
    required this.images,
    this.defects,
    required this.city,
    required this.sellerId,
    this.sellerName,
    this.featured = false,
    this.isFeatured = false,
    this.featuredUntil,
    this.views = 0,
    this.status = 'active',
    required this.createdAt,
  });

  factory Listing.fromJson(Map<String, dynamic> json) {
    return Listing(
      id: json['_id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? '',
      price: json['price'] ?? 0,
      originalPrice: json['originalPrice'],
      condition: json['condition'] ?? '',
      fabric: json['fabric'] ?? '',
      size: json['size'] ?? {},
      images: List<String>.from(json['images'] ?? []),
      defects: json['defects'],
      city: json['city'] ?? '',
      sellerId: json['seller'] is Map ? json['seller']['_id'] : json['seller'] ?? '',
      sellerName: json['seller'] is Map ? json['seller']['name'] : null,
      featured: json['featured'] ?? false,
      isFeatured: json['isFeatured'] ?? false,
      featuredUntil: json['featuredUntil'] != null ? DateTime.parse(json['featuredUntil']) : null,
      views: json['views'] ?? 0,
      status: json['status'] ?? 'active',
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toString()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'title': title,
      'description': description,
      'category': category,
      'price': price,
      'originalPrice': originalPrice,
      'condition': condition,
      'fabric': fabric,
      'size': size,
      'images': images,
      'defects': defects,
      'city': city,
      'seller': sellerId,
      'featured': featured,
      'isFeatured': isFeatured,
      'featuredUntil': featuredUntil?.toIso8601String(),
      'views': views,
      'status': status,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  int get discount {
    if (originalPrice == null || originalPrice == 0) return 0;
    return (((originalPrice! - price) / originalPrice!) * 100).toInt();
  }

  bool get isSold => status == 'sold';
  bool get isPaused => status == 'paused';
  bool get isActive => status == 'active';

  Listing copyWith({
    String? id,
    String? title,
    String? description,
    String? category,
    int? price,
    int? originalPrice,
    String? condition,
    String? fabric,
    Map<String, dynamic>? size,
    List<String>? images,
    String? defects,
    String? city,
    String? sellerId,
    String? sellerName,
    bool? featured,
    bool? isFeatured,
    DateTime? featuredUntil,
    int? views,
    String? status,
    DateTime? createdAt,
  }) {
    return Listing(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      category: category ?? this.category,
      price: price ?? this.price,
      originalPrice: originalPrice ?? this.originalPrice,
      condition: condition ?? this.condition,
      fabric: fabric ?? this.fabric,
      size: size ?? this.size,
      images: images ?? this.images,
      defects: defects ?? this.defects,
      city: city ?? this.city,
      sellerId: sellerId ?? this.sellerId,
      sellerName: sellerName ?? this.sellerName,
      featured: featured ?? this.featured,
      isFeatured: isFeatured ?? this.isFeatured,
      featuredUntil: featuredUntil ?? this.featuredUntil,
      views: views ?? this.views,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
