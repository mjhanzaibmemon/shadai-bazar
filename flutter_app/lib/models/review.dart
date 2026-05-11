class Review {
  final String id;
  final String reviewerId;
  final String reviewerName;
  final String? reviewerAvatar;
  final String sellerId;
  final String sellerName;
  final int rating;
  final String comment;
  final bool isVerified;
  final DateTime createdAt;

  Review({
    required this.id,
    required this.reviewerId,
    required this.reviewerName,
    this.reviewerAvatar,
    required this.sellerId,
    required this.sellerName,
    required this.rating,
    required this.comment,
    this.isVerified = false,
    required this.createdAt,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['_id'] ?? '',
      reviewerId: json['reviewer'] is Map ? json['reviewer']['_id'] : json['reviewer'] ?? '',
      reviewerName: json['reviewer'] is Map ? json['reviewer']['name'] : '',
      reviewerAvatar: json['reviewer'] is Map ? json['reviewer']['avatar'] : null,
      sellerId: json['seller'] is Map ? json['seller']['_id'] : json['seller'] ?? '',
      sellerName: json['seller'] is Map ? json['seller']['name'] : '',
      rating: json['rating'] ?? 5,
      comment: json['comment'] ?? '',
      isVerified: json['isVerified'] ?? false,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toString()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'reviewer': reviewerId,
      'reviewerName': reviewerName,
      'reviewerAvatar': reviewerAvatar,
      'seller': sellerId,
      'sellerName': sellerName,
      'rating': rating,
      'comment': comment,
      'isVerified': isVerified,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}

class SellerRating {
  final String sellerId;
  final String sellerName;
  final double averageRating;
  final int totalReviews;
  final Map<int, int> ratingDistribution; // Rating -> Count

  SellerRating({
    required this.sellerId,
    required this.sellerName,
    this.averageRating = 0.0,
    this.totalReviews = 0,
    this.ratingDistribution = const {},
  });

  factory SellerRating.fromJson(Map<String, dynamic> json) {
    Map<int, int> distribution = {};
    if (json['ratingDistribution'] != null) {
      (json['ratingDistribution'] as Map).forEach((key, value) {
        distribution[int.parse(key)] = value;
      });
    }

    return SellerRating(
      sellerId: json['sellerId'] ?? '',
      sellerName: json['sellerName'] ?? '',
      averageRating: (json['averageRating'] ?? 0.0).toDouble(),
      totalReviews: json['totalReviews'] ?? 0,
      ratingDistribution: distribution,
    );
  }

  int getCountForRating(int rating) {
    return ratingDistribution[rating] ?? 0;
  }
}
